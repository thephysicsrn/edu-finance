import { db } from "@/db";
import { classes, courses, enrollments } from "@/db/schema";
import { eq } from "drizzle-orm";
import { ClassesPageClient } from "@/modules/academic/components/classes-page-client";

export const dynamic = "force-dynamic";

export default async function ClassesPage() {
  let classList: any[] = [];
  let courseList: any[] = [];

  try {
    const [fetchedClasses, fetchedCourses] = await Promise.all([
      db.query.classes.findMany({
        with: {
          course: true,
          enrollments: {
            where: eq(enrollments.status, "ACTIVE"),
          },
        },
      }),
      db.query.courses.findMany({
        where: eq(courses.isActive, true),
      }),
    ]);

    classList = fetchedClasses;
    courseList = fetchedCourses;
  } catch (error) {
    console.warn("Database error on classes page, using fallbacks.");
  }

  // Fallback se ainda não houver cursos cadastrados
  if (courseList.length === 0) {
    courseList = [
      {
        id: "22222222-2222-2222-2222-222222222222",
        name: "Extensivo Medicina & Biológicas 2026",
        code: "EXT-MED-2026",
        basePrice: "1250.00",
      },
      {
        id: "33333333-3333-3333-3333-333333333333",
        name: "Intensivo Enem & Redação Nota 1000",
        code: "INT-ENEM-2026",
        basePrice: "680.00",
      },
    ];
  }

  if (classList.length === 0) {
    classList = [
      {
        id: "44444444-4444-4444-4444-444444444444",
        name: "Turma Alfa - Medicina (Manhã)",
        shift: "MORNING",
        room: "Auditório 01",
        capacity: 45,
        isActive: true,
        course: courseList[0],
        enrollments: new Array(38).fill(null),
      },
      {
        id: "55555555-5555-5555-5555-555555555555",
        name: "Turma Beta - Pré-Enem Intensivo (Noite)",
        shift: "NIGHT",
        room: "Sala 04",
        capacity: 50,
        isActive: true,
        course: courseList[1],
        enrollments: new Array(42).fill(null),
      },
    ];
  }

  const formattedCourses = courseList.map((c) => ({
    id: c.id,
    name: c.name,
    code: c.code || "",
    basePrice: String(c.basePrice || "0.00"),
  }));

  return (
    <ClassesPageClient
      initialClasses={classList}
      availableCourses={formattedCourses}
    />
  );
}
