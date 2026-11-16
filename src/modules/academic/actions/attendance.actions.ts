"use server";

import { db } from "@/db";
import { lessons, attendance, users } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";

export interface AttendanceRecordInput {
  studentId: string;
  status: "PRESENT" | "ABSENT" | "JUSTIFIED";
  justification?: string;
}

export interface SaveAttendanceInput {
  classId: string;
  date: string;
  topic: string;
  notes?: string;
  records: AttendanceRecordInput[];
}

export async function saveAttendanceAction(input: SaveAttendanceInput) {
  try {
    const session = await auth();
    let teacherUserId = session?.user?.id;

    // Se não houver professor logado na sessão atual, busca o primeiro professor ou admin ativo
    if (!teacherUserId) {
      const defaultUser = await db.query.users.findFirst({
        where: eq(users.isActive, true),
      });
      teacherUserId = defaultUser?.id || "33333333-3333-3333-3333-333333333333";
    }

    // 1. Localiza ou cria a aula (lesson) para essa turma na data
    let existingLesson = await db.query.lessons.findFirst({
      where: and(
        eq(lessons.classId, input.classId),
        eq(lessons.date, input.date)
      ),
    });

    let lessonId: string;

    if (existingLesson) {
      lessonId = existingLesson.id;
      // Atualiza o tópico da aula se alterado
      await db
        .update(lessons)
        .set({
          topic: input.topic || "Aula Regular",
          notes: input.notes,
        })
        .where(eq(lessons.id, lessonId));
    } else {
      const [newLesson] = await db
        .insert(lessons)
        .values({
          classId: input.classId,
          teacherId: teacherUserId,
          date: input.date,
          topic: input.topic || "Aula Regular",
          notes: input.notes,
        })
        .returning();
      lessonId = newLesson.id;
    }

    // 2. Grava ou atualiza a frequência de cada aluno
    for (const rec of input.records) {
      await db
        .insert(attendance)
        .values({
          lessonId,
          studentId: rec.studentId,
          status: rec.status,
          justification: rec.justification || null,
          recordedBy: teacherUserId,
        })
        .onConflictDoUpdate({
          target: [attendance.lessonId, attendance.studentId],
          set: {
            status: rec.status,
            justification: rec.justification || null,
            recordedBy: teacherUserId,
            updatedAt: new Date(),
          },
        });
    }

    revalidatePath("/academic/attendance");
    revalidatePath("/dashboard");

    return {
      success: true,
      message: `Frequência de ${input.records.length} alunos gravada com sucesso!`,
      savedCount: input.records.length,
    };
  } catch (error: any) {
    console.error("[saveAttendanceAction error]:", error);
    return {
      success: false,
      error: error?.message || "Erro ao salvar diário de frequência.",
    };
  }
}
