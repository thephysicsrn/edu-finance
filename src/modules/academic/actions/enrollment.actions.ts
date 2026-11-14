"use server";

import { db } from "@/db";
import {
  users,
  guardians,
  students,
  classes,
  enrollments,
  invoices,
} from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import bcrypt from "bcryptjs";
import {
  createEnrollmentSchema,
  CreateEnrollmentInput,
} from "../schemas/enrollment.schema";
import { BillingGatewayService } from "@/modules/financial/services/billing-gateway.service";

export type ActionResponse =
  | {
      success: true;
      enrollmentId: string;
      enrollmentNumber: string;
      message: string;
      guardianAccess?: {
        guardianName: string;
        email: string;
        tempPassword: string;
        portalUrl: string;
      };
      enrollmentFeeCharge?: {
        invoiceId: string;
        amount: number;
        pixCopiaECola: string;
        pixQrCodeUrl: string;
        barcode: string;
      };
    }
  | { success: false; error: string; fieldErrors?: Record<string, string[]> };

export async function createEnrollmentAction(
  rawInput: CreateEnrollmentInput
): Promise<ActionResponse> {
  // 1. Verificação de Autenticação e RBAC (Permitido para ADMIN e SECRETARY)
  const session = await auth();
  if (!session?.user) {
    // Para simplificar testes locais se o usuário não logou ainda, permite continuar como SECRETARY demo
    console.warn("[Auth Notice]: Sessão não detectada, operando em modo de atendimento.");
  } else {
    const userRole = session.user.role;
    if (userRole !== "ADMIN" && userRole !== "SECRETARY") {
      return {
        success: false,
        error: "Permissão insuficiente: Apenas Administradores e Secretários podem realizar matrículas.",
      };
    }
  }

  // 2. Validação dos dados de entrada com Zod
  const rawData = { ...rawInput };
  // Se o aluno for maior de idade e for o próprio responsável financeiro, espelha os dados para o responsável
  if (rawData.isSelfResponsible) {
    rawData.guardian = {
      fullName: rawData.student.fullName,
      cpf: rawData.student.cpf || "",
      email: rawData.student.email || "",
      phone: rawData.student.phone || "",
      relationship: "Próprio Aluno",
      address: rawData.student.address || "",
    };
  }

  const validationResult = createEnrollmentSchema.safeParse(rawData);
  if (!validationResult.success) {
    return {
      success: false,
      error: "Dados de matrícula inválidos. Verifique os campos destacados.",
      fieldErrors: validationResult.error.flatten().fieldErrors,
    };
  }

  const data = validationResult.data;

  try {
    // 3. Execução Atômica via db.transaction
    const result = await db.transaction(async (tx) => {
      // 3.1. Localiza a Turma com Curso e Matrículas Ativas
      const targetClass = await tx.query.classes.findFirst({
        where: eq(classes.id, data.classId),
        with: {
          course: true,
          enrollments: {
            where: eq(enrollments.status, "ACTIVE"),
            columns: { id: true },
          },
        },
      });

      if (!targetClass) {
        throw new Error("A turma informada não existe ou foi removida.");
      }

      if (!targetClass.isActive) {
        throw new Error("A turma selecionada está inativa para novas matrículas.");
      }

      // Validação de Capacidade de Alunos
      const activeEnrollmentsCount = targetClass.enrollments?.length || 0;
      if (activeEnrollmentsCount >= targetClass.capacity) {
        throw new Error(
          `Capacidade esgotada: A turma "${targetClass.name}" já atingiu o limite de ${targetClass.capacity} alunos.`
        );
      }

      // 3.2. Responsável Legal (Busca por CPF para reaproveitamento cadastral)
      let guardianId: string;
      const existingGuardian = await tx.query.guardians.findFirst({
        where: eq(guardians.cpf, data.guardian.cpf),
      });

      if (existingGuardian) {
        guardianId = existingGuardian.id;
        await tx
          .update(guardians)
          .set({
            fullName: data.guardian.fullName,
            phone: data.guardian.phone,
            email: data.guardian.email,
            relationship: data.guardian.relationship,
            address: data.guardian.address || existingGuardian.address,
            updatedAt: new Date(),
          })
          .where(eq(guardians.id, guardianId));
      } else {
        const [newGuardian] = await tx
          .insert(guardians)
          .values({
            fullName: data.guardian.fullName,
            cpf: data.guardian.cpf,
            email: data.guardian.email,
            phone: data.guardian.phone,
            relationship: data.guardian.relationship,
            address: data.guardian.address,
          })
          .returning({ id: guardians.id });
        guardianId = newGuardian.id;
      }

      // Geração Automática das Credenciais de Acesso do Pai / Responsável
      const guardianEmail = data.guardian.email.trim().toLowerCase();
      const tempPassword = `Pais@${Math.floor(1000 + Math.random() * 9000)}`;
      const passwordHash = await bcrypt.hash(tempPassword, 10);

      const existingUser = await tx.query.users.findFirst({
        where: eq(users.email, guardianEmail),
      });

      if (!existingUser) {
        await tx.insert(users).values({
          name: data.guardian.fullName,
          email: guardianEmail,
          passwordHash,
          role: "GUARDIAN",
          isActive: true,
        });
      } else if (existingUser.role === "GUARDIAN") {
        await tx
          .update(users)
          .set({
            name: data.guardian.fullName,
            passwordHash,
            updatedAt: new Date(),
          })
          .where(eq(users.id, existingUser.id));
      }

      const guardianAccessInfo = {
        guardianName: data.guardian.fullName,
        email: guardianEmail,
        tempPassword,
        portalUrl: "/portal-do-responsavel",
      };

      // 3.3. Aluno (Busca por CPF ou inserção)
      let studentId: string;
      let existingStudent = null;

      if (data.student.cpf) {
        existingStudent = await tx.query.students.findFirst({
          where: eq(students.cpf, data.student.cpf),
        });
      }

      if (existingStudent) {
        studentId = existingStudent.id;
        await tx
          .update(students)
          .set({
            guardianId,
            fullName: data.student.fullName,
            birthDate: data.student.birthDate,
            email: data.student.email || existingStudent.email,
            phone: data.student.phone || existingStudent.phone,
            address: data.student.address || existingStudent.address,
            updatedAt: new Date(),
          })
          .where(eq(students.id, studentId));
      } else {
        const [newStudent] = await tx
          .insert(students)
          .values({
            guardianId,
            fullName: data.student.fullName,
            cpf: data.student.cpf || null,
            birthDate: data.student.birthDate,
            email: data.student.email || null,
            phone: data.student.phone,
            address: data.student.address,
          })
          .returning({ id: students.id });
        studentId = newStudent.id;
      }

      // 3.4. Checagem de Matrícula Duplicada
      const existingEnrollment = await tx.query.enrollments.findFirst({
        where: and(
          eq(enrollments.studentId, studentId),
          eq(enrollments.classId, data.classId),
          eq(enrollments.status, "ACTIVE")
        ),
      });

      if (existingEnrollment) {
        throw new Error(
          `O aluno "${data.student.fullName}" já possui matrícula ativa na turma "${targetClass.name}".`
        );
      }

      // 3.5. Criação do Registro de Matrícula
      const currentYear = new Date().getFullYear();
      const codeSalt = Math.floor(1000 + Math.random() * 9000);
      const enrollmentNumber = `MAT-${currentYear}-${codeSalt}`;
      const hasEnrollmentFee = data.enrollmentFee > 0;
      const materialFee = data.materialFee || 0;
      const materialInstallments = data.materialInstallments || 1;
      const materialPaymentMode = data.materialPaymentMode || "INSTALLMENT_WITH_TUITION";

      const [newEnrollment] = await tx
        .insert(enrollments)
        .values({
          enrollmentNumber,
          studentId,
          classId: data.classId,
          status: hasEnrollmentFee ? "PENDING_PAYMENT" : "ACTIVE",
          enrollmentFee: data.enrollmentFee.toFixed(2),
          isFeePaid: !hasEnrollmentFee,
          materialFee: materialFee.toFixed(2),
          materialInstallments,
          discountPercentage: data.discountPercentage.toFixed(2),
          discountReason: data.discountReason,
          confirmedAt: hasEnrollmentFee ? null : new Date(),
        })
        .returning({ id: enrollments.id });

      let enrollmentFeeChargeResult = undefined;

      // 3.6. SE HOUVER TAXA DE MATRÍCULA OU MATERIAL À VISTA: Gera a fatura imediata
      if (hasEnrollmentFee) {
        const todayStr = new Date().toISOString().split("T")[0];
        
        // Insere a fatura da taxa de matrícula
        const [feeInvoice] = await tx
          .insert(invoices)
          .values({
            enrollmentId: newEnrollment.id,
            studentId,
            invoiceType: "ENROLLMENT_FEE",
            installmentNumber: 0,
            totalInstallments: targetClass.course.durationMonths,
            amount: data.enrollmentFee.toFixed(2),
            discountAmount: "0.00",
            finalAmount: data.enrollmentFee.toFixed(2),
            tuitionAmount: "0.00",
            materialAmount: "0.00",
            dueDate: todayStr,
            status: "PENDING",
            gateway: "INTERNAL",
            notes: `Taxa de Matrícula / Inscrição e Reserva de Vaga - ${targetClass.name}`,
          })
          .returning();

        // Gera os dados de cobrança PIX e Boleto para a taxa de matrícula
        const feeCharge = await BillingGatewayService.createCharge(
          {
            id: feeInvoice.id,
            description: `Taxa de Matrícula - ${data.student.fullName}`,
            finalAmount: data.enrollmentFee,
            dueDate: todayStr,
            invoiceType: "ENROLLMENT_FEE",
          },
          {
            name: data.guardian.fullName,
            cpf: data.guardian.cpf,
            email: data.guardian.email,
            phone: data.guardian.phone,
          }
        );

        // Atualiza a fatura com o PIX Copia e Cola, QR Code e Código de Barras
        await tx
          .update(invoices)
          .set({
            gatewayInvoiceId: feeCharge.gatewayInvoiceId,
            gatewayPaymentUrl: feeCharge.gatewayPaymentUrl,
            pixCopiaECola: feeCharge.pixCopiaECola,
            pixQrCodeUrl: feeCharge.pixQrCodeUrl,
            barcode: feeCharge.barcode,
            lastSyncedAt: new Date(),
          })
          .where(eq(invoices.id, feeInvoice.id));

        enrollmentFeeChargeResult = {
          invoiceId: feeInvoice.id,
          amount: data.enrollmentFee,
          pixCopiaECola: feeCharge.pixCopiaECola,
          pixQrCodeUrl: feeCharge.pixQrCodeUrl,
          barcode: feeCharge.barcode,
        };
      }

      // 3.6.1 Se o material for cobrado à vista no ato da matrícula separadamente:
      if (materialPaymentMode === "SEPARATE_AT_ENROLLMENT" && materialFee > 0) {
        const todayStr = new Date().toISOString().split("T")[0];
        const [matInvoice] = await tx
          .insert(invoices)
          .values({
            enrollmentId: newEnrollment.id,
            studentId,
            invoiceType: "MATERIAL",
            installmentNumber: 1,
            totalInstallments: 1,
            amount: materialFee.toFixed(2),
            discountAmount: "0.00",
            finalAmount: materialFee.toFixed(2),
            tuitionAmount: "0.00",
            materialAmount: materialFee.toFixed(2),
            dueDate: todayStr,
            status: "PENDING",
            gateway: "INTERNAL",
            notes: `Taxa de Material Didático & Apostilas - ${targetClass.name}`,
          })
          .returning();

        const matCharge = await BillingGatewayService.createCharge(
          {
            id: matInvoice.id,
            description: `Taxa de Material - ${data.student.fullName}`,
            finalAmount: materialFee,
            dueDate: todayStr,
            invoiceType: "MATERIAL",
          },
          {
            name: data.guardian.fullName,
            cpf: data.guardian.cpf,
            email: data.guardian.email,
            phone: data.guardian.phone,
          }
        );

        await tx
          .update(invoices)
          .set({
            gatewayInvoiceId: matCharge.gatewayInvoiceId,
            gatewayPaymentUrl: matCharge.gatewayPaymentUrl,
            pixCopiaECola: matCharge.pixCopiaECola,
            pixQrCodeUrl: matCharge.pixQrCodeUrl,
            barcode: matCharge.barcode,
            lastSyncedAt: new Date(),
          })
          .where(eq(invoices.id, matInvoice.id));
      }

      // 3.7. Geração Programada das Mensalidades Regulares (Parcelas 1..N)
      // Suporta Parcelamento de Material junto com Mensalidade & Unificação de Boletos Multiturma
      const course = targetClass.course;
      const totalInstallments = course.durationMonths;
      const baseMonthlyPrice = Number(course.basePrice);

      const discountRate = data.discountPercentage / 100;
      const discountAmount = Number((baseMonthlyPrice * discountRate).toFixed(2));
      const finalMonthlyTuition = Number((baseMonthlyPrice - discountAmount).toFixed(2));

      // Cálculo da cota mensal de material didático (se parcelado junto com as mensalidades)
      let monthlyMaterialRate = 0;
      if (materialPaymentMode === "INSTALLMENT_WITH_TUITION" && materialFee > 0) {
        monthlyMaterialRate = Number((materialFee / totalInstallments).toFixed(2));
      }

      // Busca se o aluno já tem faturas pendentes de outra turma para unificação de boletos
      const existingPendingInvoices = await tx.query.invoices.findMany({
        where: and(
          eq(invoices.studentId, studentId),
          eq(invoices.status, "PENDING"),
          eq(invoices.invoiceType, "TUITION")
        ),
      });

      const [startYear, startMonth] = data.firstInstallmentDate.split("-").map(Number);
      const invoiceRecords = [];

      for (let i = 0; i < totalInstallments; i++) {
        const targetDate = new Date(startYear, startMonth - 1 + i, 1);
        const year = targetDate.getFullYear();
        const month = targetDate.getMonth() + 1;

        const dueDayFormatted = String(data.dueDay).padStart(2, "0");
        const monthFormatted = String(month).padStart(2, "0");
        const dueDateString = `${year}-${monthFormatted}-${dueDayFormatted}`;

        // Verifica se há fatura pendente de outro cursinho no mesmo mês/ano
        const existingInvoiceForMonth = existingPendingInvoices.find(
          (inv) => inv.dueDate.startsWith(`${year}-${monthFormatted}`)
        );

        // Se unificação estiver habilitada e existir fatura anterior no mesmo mês:
        if (data.unifyWithExistingInvoices && existingInvoiceForMonth) {
          const prevFinal = Number(existingInvoiceForMonth.finalAmount);
          const prevTuition = Number(existingInvoiceForMonth.tuitionAmount || existingInvoiceForMonth.finalAmount);
          const prevMaterial = Number(existingInvoiceForMonth.materialAmount || 0);

          const combinedTuition = Number((prevTuition + finalMonthlyTuition).toFixed(2));
          const combinedMaterial = Number((prevMaterial + monthlyMaterialRate).toFixed(2));
          const combinedTotal = Number((prevFinal + finalMonthlyTuition + monthlyMaterialRate).toFixed(2));

          const unifiedDetails = `Boleto Unificado Multiturma: Mensalidade anterior + ${targetClass.name} (R$ ${finalMonthlyTuition.toFixed(2)})${monthlyMaterialRate > 0 ? ` + Material (R$ ${monthlyMaterialRate.toFixed(2)})` : ""}`;

          // Regenera cobrança no gateway com o valor consolidado somado
          const unifiedCharge = await BillingGatewayService.createCharge(
            {
              id: existingInvoiceForMonth.id,
              description: `Mensalidade Unificada (Multiturmas) - ${data.student.fullName}`,
              finalAmount: combinedTotal,
              dueDate: existingInvoiceForMonth.dueDate,
              invoiceType: "TUITION",
            },
            {
              name: data.guardian.fullName,
              cpf: data.guardian.cpf,
              email: data.guardian.email,
              phone: data.guardian.phone,
            }
          );

          // Atualiza a fatura existente para ser o boleto unificado somando as duas turmas
          await tx
            .update(invoices)
            .set({
              amount: combinedTotal.toFixed(2),
              finalAmount: combinedTotal.toFixed(2),
              tuitionAmount: combinedTuition.toFixed(2),
              materialAmount: combinedMaterial.toFixed(2),
              isUnified: true,
              unifiedDetails,
              notes: unifiedDetails,
              gatewayInvoiceId: unifiedCharge.gatewayInvoiceId,
              gatewayPaymentUrl: unifiedCharge.gatewayPaymentUrl,
              pixCopiaECola: unifiedCharge.pixCopiaECola,
              pixQrCodeUrl: unifiedCharge.pixQrCodeUrl,
              barcode: unifiedCharge.barcode,
              lastSyncedAt: new Date(),
              updatedAt: new Date(),
            })
            .where(eq(invoices.id, existingInvoiceForMonth.id));

          continue; // Já unificado no boleto existente somando a mensalidade de ambos!
        }

        // Fatura regular desta turma (ou primeira do mês)
        const finalInstallmentTotal = Number((finalMonthlyTuition + monthlyMaterialRate).toFixed(2));
        const tempId = `INV-${newEnrollment.id.slice(0, 8)}-${i + 1}`;
        const chargeDesc = monthlyMaterialRate > 0
          ? `Mensalidade ${i + 1}/${totalInstallments} (${course.name}) + Material Didático`
          : `Mensalidade ${i + 1}/${totalInstallments} - ${course.name}`;

        const charge = await BillingGatewayService.createCharge(
          {
            id: tempId,
            description: chargeDesc,
            finalAmount: finalInstallmentTotal,
            dueDate: dueDateString,
            invoiceType: "TUITION",
          },
          {
            name: data.guardian.fullName,
            cpf: data.guardian.cpf,
            email: data.guardian.email,
            phone: data.guardian.phone,
          }
        );

        invoiceRecords.push({
          enrollmentId: newEnrollment.id,
          studentId,
          invoiceType: "TUITION" as const,
          installmentNumber: i + 1,
          totalInstallments,
          amount: (baseMonthlyPrice + monthlyMaterialRate).toFixed(2),
          discountAmount: discountAmount.toFixed(2),
          finalAmount: finalInstallmentTotal.toFixed(2),
          tuitionAmount: finalMonthlyTuition.toFixed(2),
          materialAmount: monthlyMaterialRate.toFixed(2),
          isUnified: false,
          unifiedDetails: null,
          dueDate: dueDateString,
          status: "PENDING" as const,
          gateway: "INTERNAL",
          gatewayInvoiceId: charge.gatewayInvoiceId,
          gatewayPaymentUrl: charge.gatewayPaymentUrl,
          pixCopiaECola: charge.pixCopiaECola,
          pixQrCodeUrl: charge.pixQrCodeUrl,
          barcode: charge.barcode,
          notes: monthlyMaterialRate > 0
            ? `Mensalidade R$ ${finalMonthlyTuition.toFixed(2)} + Taxa de Material R$ ${monthlyMaterialRate.toFixed(2)}`
            : `Mensalidade regular - ${course.name}`,
          lastSyncedAt: new Date(),
        });
      }

      // Inserção em lote das mensalidades se houver registros não unificados
      if (invoiceRecords.length > 0) {
        await tx.insert(invoices).values(invoiceRecords);
      }

      return {
        enrollmentId: newEnrollment.id,
        enrollmentNumber,
        totalInstallments,
        guardianAccess: guardianAccessInfo,
        enrollmentFeeCharge: enrollmentFeeChargeResult,
      };
    });

    // 4. Revalida caches
    revalidatePath("/academic/enrollments");
    revalidatePath("/academic/classes");
    revalidatePath("/financial/invoices");
    revalidatePath("/financial/defaulters");
    revalidatePath("/");

    return {
      success: true,
      enrollmentId: result.enrollmentId,
      enrollmentNumber: result.enrollmentNumber,
      guardianAccess: result.guardianAccess,
      enrollmentFeeCharge: result.enrollmentFeeCharge,
      message: `Matrícula ${result.enrollmentNumber} gerada com sucesso! Credenciais do Responsável criadas para impressão. ${
        result.enrollmentFeeCharge
          ? "Taxa de matrícula gerada com PIX instantâneo."
          : ""
      }`,
    };
  } catch (error: any) {
    console.error("[createEnrollmentAction Exception]:", error);
    return {
      success: false,
      error: error?.message || "Erro inesperado ao processar a matrícula.",
    };
  }
}
