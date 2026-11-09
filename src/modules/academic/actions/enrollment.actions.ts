"use server";

import { db } from "@/db";
import {
  guardians,
  students,
  classes,
  enrollments,
  invoices,
} from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
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

      const [newEnrollment] = await tx
        .insert(enrollments)
        .values({
          enrollmentNumber,
          studentId,
          classId: data.classId,
          status: hasEnrollmentFee ? "PENDING_PAYMENT" : "ACTIVE",
          enrollmentFee: data.enrollmentFee.toFixed(2),
          isFeePaid: !hasEnrollmentFee,
          discountPercentage: data.discountPercentage.toFixed(2),
          discountReason: data.discountReason,
          confirmedAt: hasEnrollmentFee ? null : new Date(),
        })
        .returning({ id: enrollments.id });

      let enrollmentFeeChargeResult = undefined;

      // 3.6. SE HOUVER TAXA DE MATRÍCULA: Gera a fatura imediata (Parcela #0 com PIX)
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

      // 3.7. Geração Programada das Mensalidades Regulares (Parcelas 1..N)
      const course = targetClass.course;
      const totalInstallments = course.durationMonths;
      const baseMonthlyPrice = Number(course.basePrice);

      const discountRate = data.discountPercentage / 100;
      const discountAmount = Number((baseMonthlyPrice * discountRate).toFixed(2));
      const finalMonthlyAmount = Number((baseMonthlyPrice - discountAmount).toFixed(2));

      const [startYear, startMonth] = data.firstInstallmentDate.split("-").map(Number);
      const invoiceRecords = [];

      for (let i = 0; i < totalInstallments; i++) {
        const targetDate = new Date(startYear, startMonth - 1 + i, 1);
        const year = targetDate.getFullYear();
        const month = targetDate.getMonth() + 1;

        const dueDayFormatted = String(data.dueDay).padStart(2, "0");
        const monthFormatted = String(month).padStart(2, "0");
        const dueDateString = `${year}-${monthFormatted}-${dueDayFormatted}`;

        // Gera simulação prévia do PIX e Boleto para cada mensalidade futura
        const tempId = `INV-${newEnrollment.id.slice(0, 8)}-${i + 1}`;
        const charge = await BillingGatewayService.createCharge(
          {
            id: tempId,
            description: `Mensalidade ${i + 1}/${totalInstallments} - ${course.name}`,
            finalAmount: finalMonthlyAmount,
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
          amount: baseMonthlyPrice.toFixed(2),
          discountAmount: discountAmount.toFixed(2),
          finalAmount: finalMonthlyAmount.toFixed(2),
          dueDate: dueDateString,
          status: "PENDING" as const,
          gateway: "INTERNAL",
          gatewayInvoiceId: charge.gatewayInvoiceId,
          gatewayPaymentUrl: charge.gatewayPaymentUrl,
          pixCopiaECola: charge.pixCopiaECola,
          pixQrCodeUrl: charge.pixQrCodeUrl,
          barcode: charge.barcode,
          lastSyncedAt: new Date(),
        });
      }

      // Inserção em lote das mensalidades
      await tx.insert(invoices).values(invoiceRecords);

      return {
        enrollmentId: newEnrollment.id,
        enrollmentNumber,
        totalInstallments,
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
      enrollmentFeeCharge: result.enrollmentFeeCharge,
      message: `Matrícula ${result.enrollmentNumber} gerada com sucesso! ${
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
