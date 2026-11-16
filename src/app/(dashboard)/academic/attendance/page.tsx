import { db } from "@/db";
import { classes, enrollments } from "@/db/schema";
import { eq } from "drizzle-orm";
import { auth } from "@/lib/auth";
import {
  AttendanceClient,
  AttendanceClassItem,
} from "@/modules/academic/components/attendance-client";

export const dynamic = "force-dynamic";

export default async function AttendancePage() {
  const session = await auth();
  const currentUserRole = session?.user?.role || "ADMIN";
  const currentUserName = session?.user?.name || (
    currentUserRole === "TEACHER"
      ? "Prof. Carlos Eduardo"
      : currentUserRole === "SECRETARY"
      ? "Secretaria de Atendimento"
      : "Coordenador Geral"
  );

  let formattedClasses: AttendanceClassItem[] = [];

  try {
    const fetchedClasses = await db.query.classes.findMany({
      where: eq(classes.isActive, true),
      with: {
        course: true,
        enrollments: {
          where: eq(enrollments.status, "ACTIVE"),
          with: {
            student: true,
          },
        },
      },
    });

    formattedClasses = fetchedClasses.map((cls) => ({
      id: cls.id,
      name: cls.name,
      shift: cls.shift,
      courseName: cls.course?.name || "Curso Preparatório",
      students: cls.enrollments
        .map((en) => ({
          id: en.student.id,
          name: en.student.fullName,
          cpf: en.student.cpf,
          status: "PRESENT" as const,
          justification: "",
        }))
        .sort((a, b) => a.name.localeCompare(b.name)),
    }));
  } catch (error) {
    console.warn("Error fetching attendance classes from database:", error);
  }

  // Fallback caso o banco esteja indisponível ou vazio
  if (formattedClasses.length === 0) {
    formattedClasses = [
      {
        id: "44444444-4444-4444-4444-444444444444",
        name: "Turma Alfa - Medicina (Manhã)",
        shift: "MORNING",
        courseName: "Extensivo Medicina & Biológicas",
        students: [
          { id: "1", name: "Beatriz Helena Costa", status: "PRESENT", justification: "" },
          { id: "2", name: "Lucas Silveira Santos", status: "PRESENT", justification: "" },
        ],
      },
      {
        id: "55555555-5555-5555-5555-555555555555",
        name: "Turma Beta - Pré-Enem Intensivo (Noite)",
        shift: "NIGHT",
        courseName: "Intensivo Enem & Redação",
        students: [
          { id: "3", name: "Gabriel Duarte Mendes", status: "PRESENT", justification: "" },
          { id: "4", name: "Lucas Silveira Santos", status: "PRESENT", justification: "" },
        ],
      },
    ];
  }

  return (
    <AttendanceClient
      classes={formattedClasses}
      currentUserRole={currentUserRole}
      currentUserName={currentUserName}
    />
  );
}
