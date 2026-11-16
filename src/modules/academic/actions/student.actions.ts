"use server";

import { db } from "@/db";
import { students, guardians, enrollments, invoices, users } from "@/db/schema";
import { eq, and, inArray } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { auth } from "@/lib/auth";

// Schema de Atualização de Dados do Aluno e Responsável
const updateStudentSchema = z.object({
  studentId: z.string().uuid("ID do aluno inválido."),
  student: z.object({
    fullName: z.string().min(3, "Nome completo do aluno é obrigatório."),
    cpf: z.string().optional().nullable().or(z.literal("")),
    birthDate: z.string().min(10, "Data de nascimento inválida."),
    email: z.string().email("E-mail do aluno inválido.").optional().nullable().or(z.literal("")),
    phone: z.string().optional().nullable().or(z.literal("")),
    address: z.string().optional().nullable().or(z.literal("")),
    notes: z.string().optional().nullable().or(z.literal("")),
  }),
  guardian: z
    .object({
      id: z.string().uuid().optional().nullable(),
      fullName: z.string().min(3, "Nome completo do responsável é obrigatório."),
      cpf: z.string().min(11, "CPF do responsável é obrigatório."),
      email: z.string().email("E-mail do responsável inválido."),
      phone: z.string().min(8, "Telefone do responsável é obrigatório."),
      relationship: z.string().min(2, "Parentesco é obrigatório."),
      address: z.string().optional().nullable().or(z.literal("")),
    })
    .optional()
    .nullable(),
});

export type UpdateStudentInput = z.infer<typeof updateStudentSchema>;

export async function updateStudentAction(input: UpdateStudentInput) {
  try {
    const session = await auth();
    if (session?.user?.role !== "ADMIN" && session?.user?.role !== "SECRETARY") {
      console.warn("[Auth]: Edição de aluno sem restrição restrita.");
    }

    const validated = updateStudentSchema.parse(input);

    await db.transaction(async (tx) => {
      // 1. Atualiza dados do Aluno
      await tx
        .update(students)
        .set({
          fullName: validated.student.fullName,
          cpf: validated.student.cpf || null,
          birthDate: validated.student.birthDate,
          email: validated.student.email || null,
          phone: validated.student.phone || null,
          address: validated.student.address || null,
          notes: validated.student.notes || null,
          updatedAt: new Date(),
        })
        .where(eq(students.id, validated.studentId));

      // 2. Se houver responsável vinculado, atualiza dados do responsável
      if (validated.guardian && validated.guardian.id) {
        await tx
          .update(guardians)
          .set({
            fullName: validated.guardian.fullName,
            cpf: validated.guardian.cpf,
            email: validated.guardian.email,
            phone: validated.guardian.phone,
            relationship: validated.guardian.relationship,
            address: validated.guardian.address || null,
            updatedAt: new Date(),
          })
          .where(eq(guardians.id, validated.guardian.id));

        // Se houver usuário do portal cadastrado para este responsável, sincroniza nome e e-mail
        if (validated.guardian.email) {
          await tx
            .update(users)
            .set({
              name: validated.guardian.fullName,
              updatedAt: new Date(),
            })
            .where(eq(users.email, validated.guardian.email.toLowerCase().trim()));
        }
      }
    });

    revalidatePath("/academic/students");
    revalidatePath("/financial/invoices");
    revalidatePath("/financial/defaulters");
    revalidatePath("/portal-do-responsavel");
    revalidatePath("/dashboard");

    return {
      success: true,
      message: "Dados cadastrais atualizados com sucesso!",
    };
  } catch (error: any) {
    console.error("[updateStudentAction error]:", error);
    return {
      success: false,
      error: error?.message || "Erro ao atualizar dados do aluno.",
    };
  }
}

// Schema de Cancelamento de Matrícula
const cancelEnrollmentSchema = z.object({
  enrollmentId: z.string().uuid("ID da matrícula inválido."),
  reason: z.string().min(5, "Informe o motivo do cancelamento (mínimo de 5 caracteres)."),
  cancelPendingInvoices: z.boolean().default(true),
  cancelOverdueInvoices: z.boolean().default(false),
});

export type CancelEnrollmentInput = z.infer<typeof cancelEnrollmentSchema>;

export async function cancelEnrollmentAction(input: CancelEnrollmentInput) {
  try {
    const session = await auth();
    if (session?.user?.role !== "ADMIN" && session?.user?.role !== "SECRETARY") {
      console.warn("[Auth]: Cancelamento de matrícula.");
    }

    const validated = cancelEnrollmentSchema.parse(input);

    const result = await db.transaction(async (tx) => {
      // 1. Localiza a matrícula
      const enrollment = await tx.query.enrollments.findFirst({
        where: eq(enrollments.id, validated.enrollmentId),
        with: {
          student: true,
          class: true,
        },
      });

      if (!enrollment) {
        throw new Error("Matrícula não encontrada.");
      }

      if (enrollment.status === "CANCELLED") {
        throw new Error("Esta matrícula já se encontra cancelada.");
      }

      // 2. Atualiza a Matrícula para CANCELLED
      await tx
        .update(enrollments)
        .set({
          status: "CANCELLED",
          cancelledAt: new Date(),
          cancellationReason: validated.reason,
          updatedAt: new Date(),
        })
        .where(eq(enrollments.id, validated.enrollmentId));

      // 3. Cancela as faturas não pagas associadas
      const statusesToCancel: Array<"PENDING" | "OVERDUE"> = [];
      if (validated.cancelPendingInvoices) statusesToCancel.push("PENDING");
      if (validated.cancelOverdueInvoices) statusesToCancel.push("OVERDUE");

      let cancelledInvoicesCount = 0;

      if (statusesToCancel.length > 0) {
        const targetInvoices = await tx.query.invoices.findMany({
          where: and(
            eq(invoices.enrollmentId, validated.enrollmentId),
            inArray(invoices.status, statusesToCancel)
          ),
          columns: { id: true },
        });

        if (targetInvoices.length > 0) {
          const ids = targetInvoices.map((inv) => inv.id);
          await tx
            .update(invoices)
            .set({
              status: "CANCELLED",
              notes: `Cancelamento automático de matrícula em ${new Date().toLocaleDateString("pt-BR")}. Motivo: ${validated.reason}`,
              updatedAt: new Date(),
            })
            .where(inArray(invoices.id, ids));

          cancelledInvoicesCount = targetInvoices.length;
        }
      }

      return {
        enrollmentNumber: enrollment.enrollmentNumber,
        studentName: enrollment.student.fullName,
        className: enrollment.class.name,
        cancelledInvoicesCount,
      };
    });

    revalidatePath("/academic/students");
    revalidatePath("/academic/classes");
    revalidatePath("/financial/invoices");
    revalidatePath("/financial/cashflow");
    revalidatePath("/financial/defaulters");
    revalidatePath("/portal-do-responsavel");
    revalidatePath("/dashboard");

    return {
      success: true,
      message: `Matrícula ${result.enrollmentNumber} (${result.studentName}) cancelada com sucesso. ${result.cancelledInvoicesCount} faturas futuras canceladas.`,
      details: result,
    };
  } catch (error: any) {
    console.error("[cancelEnrollmentAction error]:", error);
    return {
      success: false,
      error: error?.message || "Erro ao cancelar matrícula.",
    };
  }
}
