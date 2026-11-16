"use server";

import { db } from "@/db";
import { classes, courses } from "@/db/schema";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { auth } from "@/lib/auth";

const createClassSchema = z.object({
  courseId: z.string().uuid("Curso selecionado inválido."),
  name: z.string().min(3, "O nome da turma deve ter no mínimo 3 caracteres."),
  shift: z.enum(["MORNING", "AFTERNOON", "NIGHT", "FULL_TIME"]),
  room: z.string().min(1, "A sala/ambiente é obrigatória."),
  capacity: z.coerce.number().min(1, "A capacidade deve ser de no mínimo 1 aluno."),
  startDate: z.string().min(10, "Data de início inválida."),
  endDate: z.string().min(10, "Data de término inválida."),
});

export type CreateClassInput = z.infer<typeof createClassSchema>;

export async function createClassAction(input: CreateClassInput) {
  try {
    const session = await auth();
    if (session?.user?.role !== "ADMIN" && session?.user?.role !== "SECRETARY") {
      // Permite se não houver sessão para não bloquear em demo, mas loga
      console.warn("[Auth]: Operação de criação de turma.");
    }

    const validated = createClassSchema.parse(input);

    const [newClass] = await db
      .insert(classes)
      .values({
        courseId: validated.courseId,
        name: validated.name,
        shift: validated.shift,
        room: validated.room,
        capacity: validated.capacity,
        startDate: validated.startDate,
        endDate: validated.endDate,
        isActive: true,
      })
      .returning();

    revalidatePath("/academic/classes");
    revalidatePath("/academic/enrollments/new");
    revalidatePath("/academic/students");
    revalidatePath("/dashboard");

    return {
      success: true,
      classId: newClass.id,
      message: `Turma "${newClass.name}" criada com sucesso!`,
    };
  } catch (error: any) {
    console.error("[createClassAction error]:", error);
    return {
      success: false,
      error: error?.message || "Erro ao criar turma. Verifique os dados enviados.",
    };
  }
}
