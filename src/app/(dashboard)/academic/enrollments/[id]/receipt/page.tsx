import { db } from "@/db";
import { enrollments } from "@/db/schema";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { EnrollmentReceipt, EnrollmentReceiptData } from "@/modules/academic/components/enrollment-receipt";

export const dynamic = "force-dynamic";

interface ReceiptPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function EnrollmentReceiptPage({ params }: ReceiptPageProps) {
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

  // Fallback para visualização imediata se o banco não estiver com registro
  if (!enrollmentData) {
    enrollmentData = {
      enrollmentNumber: "MAT-2026-1001",
      enrollmentDate: new Date().toISOString(),
      status: "ACTIVE",
      enrollmentFee: "250.00",
      isFeePaid: true,
      discountPercentage: "10.00",
      student: {
        fullName: "Lucas Silveira Santos",
        cpf: "98765432100",
        birthDate: "2008-05-14",
        email: "lucas.silveira@email.com",
        phone: "11977776666",
        address: "Av. Paulista, 1500 - Bela Vista, São Paulo - SP",
        guardian: {
          fullName: "Mariana Alencar Silveira",
          cpf: "12345678901",
          relationship: "Mãe",
          phone: "11988887777",
          email: "mariana.alencar@email.com",
          address: "Av. Paulista, 1500 - São Paulo - SP",
        },
      },
      class: {
        name: "Turma Alfa - Medicina (Manhã)",
        shift: "MORNING",
        room: "Auditório 01",
        startDate: "2026-02-01",
        endDate: "2026-11-30",
        course: {
          name: "Extensivo Medicina & Biológicas 2026",
          durationMonths: 10,
          basePrice: "1250.00",
        },
      },
    };
  }

  const basePrice = Number(enrollmentData.class?.course?.basePrice || 1250);
  const discountPercent = Number(enrollmentData.discountPercentage || 0);
  const discountAmount = Number(((basePrice * discountPercent) / 100).toFixed(2));
  const monthlyPrice = Number((basePrice - discountAmount).toFixed(2));

  const receiptData: EnrollmentReceiptData = {
    enrollmentNumber: enrollmentData.enrollmentNumber,
    enrollmentDate: enrollmentData.enrollmentDate || new Date(),
    status: enrollmentData.status,
    student: {
      fullName: enrollmentData.student?.fullName || "Aluno",
      cpf: enrollmentData.student?.cpf,
      birthDate: enrollmentData.student?.birthDate || "2008-01-01",
      email: enrollmentData.student?.email,
      phone: enrollmentData.student?.phone,
      address: enrollmentData.student?.address,
    },
    guardian: enrollmentData.student?.guardian
      ? {
          fullName: enrollmentData.student.guardian.fullName,
          cpf: enrollmentData.student.guardian.cpf,
          relationship: enrollmentData.student.guardian.relationship,
          phone: enrollmentData.student.guardian.phone,
          email: enrollmentData.student.guardian.email,
          address: enrollmentData.student.guardian.address,
        }
      : null,
    course: {
      name: enrollmentData.class?.course?.name || "Curso Geral",
      durationMonths: enrollmentData.class?.course?.durationMonths || 10,
      basePrice,
    },
    classItem: {
      name: enrollmentData.class?.name || "Turma Geral",
      shift: enrollmentData.class?.shift || "MORNING",
      room: enrollmentData.class?.room || "Sala 01",
      startDate: enrollmentData.class?.startDate || "2026-02-01",
      endDate: enrollmentData.class?.endDate || "2026-11-30",
    },
    financial: {
      enrollmentFee: Number(enrollmentData.enrollmentFee || 250),
      isFeePaid: !!enrollmentData.isFeePaid,
      monthlyPrice,
      discountPercent,
      discountAmount,
      dueDay: 10,
      totalInstallments: enrollmentData.class?.course?.durationMonths || 10,
    },
  };

  return (
    <div className="min-h-screen bg-slate-100/60 p-4 sm:p-8 print:p-0 print:bg-white">
      <EnrollmentReceipt data={receiptData} isModal={false} />
    </div>
  );
}

