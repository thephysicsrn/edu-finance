import { db } from "@/db";
import { enrollments, users } from "@/db/schema";
import { eq } from "drizzle-orm";
import {
  GuardianAccessSheet,
  GuardianAccessSheetData,
} from "@/modules/academic/components/guardian-access-sheet";

export const dynamic = "force-dynamic";

interface GuardianAccessPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function GuardianAccessPage({ params }: GuardianAccessPageProps) {
  const { id } = await params;

  let enrollmentData: any = null;

  try {
    enrollmentData = await db.query.enrollments.findFirst({
      where: eq(enrollments.id, id),
      with: {
        student: {
          with: {
            guardian: true,
          },
        },
        class: {
          with: {
            course: true,
          },
        },
      },
    });
  } catch (error) {
    console.warn("Database error or not yet seeded.");
  }

  // Fallback demonstrativo caso não esteja cadastrado ainda
  if (!enrollmentData) {
    enrollmentData = {
      enrollmentNumber: "MAT-2026-1001",
      enrollmentDate: new Date().toISOString(),
      status: "ACTIVE",
      enrollmentFee: "250.00",
      materialFee: "300.00",
      discountPercentage: "10.00",
      student: {
        fullName: "Lucas Silveira Santos",
        cpf: "98765432100",
        birthDate: "2008-05-14",
        email: "lucas.silveira@email.com",
        phone: "11977776666",
        guardian: {
          fullName: "Mariana Alencar Silveira",
          cpf: "12345678901",
          relationship: "Mãe",
          phone: "11988887777",
          email: "mariana.silveira@email.com",
        },
      },
      class: {
        name: "Turma Alfa - Medicina (Manhã)",
        shift: "MORNING",
        course: {
          name: "Extensivo Medicina & Biológicas 2026",
          durationMonths: 10,
          basePrice: "1250.00",
        },
      },
    };
  }

  const course = enrollmentData.class?.course;
  const basePrice = Number(course?.basePrice || 1250);
  const discountPercent = Number(enrollmentData.discountPercentage || 0);
  const discountAmount = Number(((basePrice * discountPercent) / 100).toFixed(2));
  const monthlyPrice = Number((basePrice - discountAmount).toFixed(2));

  const guardianEmail =
    enrollmentData.student?.guardian?.email || "responsavel@email.com";

  const accessData: GuardianAccessSheetData = {
    enrollmentNumber: enrollmentData.enrollmentNumber,
    issuedAt: enrollmentData.enrollmentDate || new Date(),
    student: {
      fullName: enrollmentData.student?.fullName || "Aluno",
      cpf: enrollmentData.student?.cpf,
      birthDate: enrollmentData.student?.birthDate,
    },
    guardian: {
      fullName:
        enrollmentData.student?.guardian?.fullName || "Responsável Legal",
      cpf: enrollmentData.student?.guardian?.cpf || "000.000.000-00",
      email: guardianEmail,
      phone: enrollmentData.student?.guardian?.phone || "(11) 98888-7777",
      relationship:
        enrollmentData.student?.guardian?.relationship || "Responsável",
    },
    credentials: {
      portalUrl: "/portal-do-responsavel",
      loginEmail: guardianEmail,
      initialPassword: "Pais@" + (enrollmentData.enrollmentNumber.slice(-4) || "2026"),
    },
    course: {
      name: course?.name || "Preparatório Geral",
      className: enrollmentData.class?.name || "Turma Alfa",
      shift: enrollmentData.class?.shift || "MORNING",
      dueDay: 10,
      monthlyPrice,
      materialFee: Number(enrollmentData.materialFee || 0),
      totalInstallments: course?.durationMonths || 10,
    },
  };

  return <GuardianAccessSheet data={accessData} />;
}
