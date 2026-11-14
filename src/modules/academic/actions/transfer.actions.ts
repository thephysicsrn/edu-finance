"use server";

import { db } from "@/db";
import {
  classes,
  enrollments,
  invoices,
  classTransfers,
  students,
} from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";

export interface TransferStudentInput {
  studentId: string;
  enrollmentId: string;
  targetClassId: string;
  reason?: string;
  adjustPendingInvoiceValues?: boolean; // Se deve recalcular parcelas futuras com o preço da nova turma
}

export type TransferActionResponse =
  | {
      success: true;
      message: string;
      fromClassName: string;
      toClassName: string;
      transferredInvoicesCount: number;
    }
  | {
      success: false;
      error: string;
    };

export async function transferStudentClassAction(
  input: TransferStudentInput
): Promise<TransferActionResponse> {
  const session = await auth();
  const userId = session?.user?.id;
  const userRole = session?.user?.role;

  if (userRole && userRole !== "ADMIN" && userRole !== "SECRETARY") {
    return {
      success: false,
      error: "Permissão insuficiente: Apenas Administradores e Secretários podem realizar transferências de turma.",
    };
  }

  try {
    const result = await db.transaction(async (tx) => {
      // 1. Busca a matrícula de origem e a turma atual
      const currentEnrollment = await tx.query.enrollments.findFirst({
        where: eq(enrollments.id, input.enrollmentId),
        with: {
          class: {
            with: {
              course: true,
            },
          },
          student: true,
        },
      });

      if (!currentEnrollment) {
        throw new Error("Matrícula de origem não encontrada.");
      }

      const fromClass = currentEnrollment.class;
      const student = currentEnrollment.student;

      if (fromClass.id === input.targetClassId) {
        throw new Error("A turma de destino é a mesma em que o aluno já está matriculado.");
      }

      // 2. Busca e valida a turma de destino
      const targetClass = await tx.query.classes.findFirst({
        where: eq(classes.id, input.targetClassId),
        with: {
          course: true,
          enrollments: {
            where: eq(enrollments.status, "ACTIVE"),
            columns: { id: true },
          },
        },
      });

      if (!targetClass) {
        throw new Error("A turma de destino não existe ou foi removida.");
      }

      if (!targetClass.isActive) {
        throw new Error(`A turma "${targetClass.name}" está inativa para novas transferências.`);
      }

      // Validação de vagas
      const activeEnrollmentsCount = targetClass.enrollments?.length || 0;
      if (activeEnrollmentsCount >= targetClass.capacity) {
        throw new Error(
          `Sem vagas disponíveis: A turma "${targetClass.name}" já atingiu a capacidade máxima de ${targetClass.capacity} alunos.`
        );
      }

      // 3. Registra o histórico da transferência na tabela class_transfers
      await tx.insert(classTransfers).values({
        studentId: input.studentId,
        enrollmentId: input.enrollmentId,
        fromClassId: fromClass.id,
        toClassId: targetClass.id,
        reason: input.reason || "Transferência de turma solicitada pelo aluno/responsável",
        transferredBy: userId || null,
        transferredAt: new Date(),
      });

      // 4. Atualiza a turma na matrícula
      await tx
        .update(enrollments)
        .set({
          classId: targetClass.id,
          updatedAt: new Date(),
        })
        .where(eq(enrollments.id, input.enrollmentId));

      // 5. Atualiza faturas futuras ainda pendentes (preserva o histórico das pagas)
      const pendingInvoices = await tx.query.invoices.findMany({
        where: and(
          eq(invoices.enrollmentId, input.enrollmentId),
          eq(invoices.status, "PENDING")
        ),
      });

      let transferredCount = 0;

      // Recálculo opcional caso a nova turma possua preço base diferente
      const newBasePrice = Number(targetClass.course.basePrice);
      const discountPercentage = Number(currentEnrollment.discountPercentage || 0);
      const discountRate = discountPercentage / 100;
      const newDiscountAmount = Number((newBasePrice * discountRate).toFixed(2));
      const newFinalTuition = Number((newBasePrice - newDiscountAmount).toFixed(2));

      for (const inv of pendingInvoices) {
        const materialPart = Number(inv.materialAmount || 0);
        const shouldAdjust = input.adjustPendingInvoiceValues !== false;

        const updatedTuition = shouldAdjust ? newFinalTuition : Number(inv.tuitionAmount || inv.finalAmount);
        const updatedFinal = shouldAdjust ? Number((updatedTuition + materialPart).toFixed(2)) : Number(inv.finalAmount);

        await tx
          .update(invoices)
          .set({
            ...(shouldAdjust
              ? {
                  amount: (newBasePrice + materialPart).toFixed(2),
                  discountAmount: newDiscountAmount.toFixed(2),
                  tuitionAmount: updatedTuition.toFixed(2),
                  finalAmount: updatedFinal.toFixed(2),
                }
              : {}),
            notes: `[Transferido para ${targetClass.name}] ${inv.notes || ""}`.trim(),
            updatedAt: new Date(),
          })
          .where(eq(invoices.id, inv.id));

        transferredCount++;
      }

      return {
        fromClassName: fromClass.name,
        toClassName: targetClass.name,
        studentName: student.fullName,
        transferredCount,
      };
    });

    revalidatePath("/academic/students");
    revalidatePath("/academic/classes");
    revalidatePath("/financial/invoices");
    revalidatePath("/financial/cashflow");

    return {
      success: true,
      fromClassName: result.fromClassName,
      toClassName: result.toClassName,
      transferredInvoicesCount: result.transferredCount,
      message: `Aluno ${result.studentName} transferido com sucesso da "${result.fromClassName}" para "${result.toClassName}". ${result.transferredCount} faturas futuras foram migradas.`,
    };
  } catch (error: any) {
    console.error("[transferStudentClassAction Error]:", error);
    return {
      success: false,
      error: error?.message || "Ocorreu um erro ao transferir o aluno de turma.",
    };
  }
}
