import { db } from "@/db";
import { guardians, students, enrollments, classes, invoices } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { auth } from "@/lib/auth";
import {
  GuardianPortalClient,
  GuardianStudentInfo,
  GuardianInvoice,
} from "@/modules/guardian/components/guardian-portal-client";

export const dynamic = "force-dynamic";

export default async function GuardianPortalPage() {
  const session = await auth();
  const user = session?.user;

  let guardianData = null;
  let studentsData: GuardianStudentInfo[] = [];
  let invoicesData: GuardianInvoice[] = [];

  try {
    // 1. Localiza o responsável (pelo email do login ou o primeiro do banco)
    let guardianRecord = null;
    if (user?.email) {
      guardianRecord = await db.query.guardians.findFirst({
        where: eq(guardians.email, user.email),
      });
    }

    if (!guardianRecord) {
      guardianRecord = await db.query.guardians.findFirst();
    }

    if (guardianRecord) {
      guardianData = {
        id: guardianRecord.id,
        fullName: guardianRecord.fullName,
        cpf: guardianRecord.cpf,
        phone: guardianRecord.phone,
        email: guardianRecord.email,
      };

      // 2. Busca os alunos deste responsável com suas turmas e cursos
      const studentsList = await db.query.students.findMany({
        where: eq(students.guardianId, guardianRecord.id),
        with: {
          enrollments: {
            with: {
              class: {
                with: {
                  course: true,
                },
              },
            },
          },
        },
      });

      studentsData = studentsList.map((st) => ({
        id: st.id,
        fullName: st.fullName,
        cpf: st.cpf,
        classes: (st.enrollments || [])
          .filter((e) => e.status === "ACTIVE" || e.status === "PENDING_PAYMENT")
          .map((e) => ({
            id: e.class.id,
            name: e.class.name,
            shift: e.class.shift,
            courseName: e.class.course?.name || "Preparatório Geral",
          })),
      }));

      // 3. Busca faturas vinculadas aos alunos deste responsável
      const studentIds = studentsList.map((s) => s.id);
      if (studentIds.length > 0) {
        const rawInvoices = await db.query.invoices.findMany({
          orderBy: [desc(invoices.dueDate)],
          with: {
            student: true,
            enrollment: {
              with: {
                class: true,
              },
            },
          },
        });

        // Filtra para os alunos deste responsável
        const guardianInvoices = rawInvoices.filter((inv) =>
          studentIds.includes(inv.studentId)
        );

        invoicesData = guardianInvoices.map((inv) => ({
          id: inv.id,
          installmentNumber: inv.installmentNumber,
          totalInstallments: inv.totalInstallments,
          invoiceType: inv.invoiceType,
          amount: inv.amount,
          discountAmount: inv.discountAmount,
          finalAmount: inv.finalAmount,
          tuitionAmount: inv.tuitionAmount,
          materialAmount: inv.materialAmount,
          isUnified: inv.isUnified,
          unifiedDetails: inv.unifiedDetails,
          dueDate: inv.dueDate,
          status: inv.status,
          pixCopiaECola: inv.pixCopiaECola,
          pixQrCodeUrl: inv.pixQrCodeUrl,
          barcode: inv.barcode,
          notes: inv.notes,
          studentName: inv.student?.fullName,
          className: inv.enrollment?.class?.name,
        }));
      }
    }
  } catch (error) {
    console.warn("Database not yet connected or seeded. Using demo guardian data.");
  }

  // Preenche dados demonstrativos ricos se o banco estiver sem registros
  if (!guardianData) {
    guardianData = {
      id: "demo-g-1",
      fullName: "Mariana Alencar Silveira",
      cpf: "12345678900",
      phone: "11988887777",
      email: "mariana.silveira@email.com",
    };

    studentsData = [
      {
        id: "demo-st-1",
        fullName: "Lucas Silveira Santos",
        cpf: "98765432100",
        classes: [
          {
            id: "cls-1",
            name: "Turma Alfa - Extensivo Medicina (Manhã)",
            shift: "MORNING",
            courseName: "Extensivo Medicina & Biológicas 2026",
          },
          {
            id: "cls-3",
            name: "Turma Gama - Redação Nota 1000 & Atualidades (Noite)",
            shift: "NIGHT",
            courseName: "Módulo Intensivo de Redação Nota 1000",
          },
        ],
      },
    ];

    invoicesData = [
      {
        id: "inv-demo-nov-2026",
        installmentNumber: 1,
        totalInstallments: 10,
        invoiceType: "TUITION",
        amount: 1750.0,
        discountAmount: 0.0,
        finalAmount: 1750.0,
        tuitionAmount: 1700.0,
        materialAmount: 50.0,
        isUnified: true,
        unifiedDetails: "Boleto Unificado Multiturma: Medicina (R$ 1.250,00) + Redação (R$ 450,00) + Material (R$ 50,00)",
        dueDate: "2026-11-20",
        status: "PENDING",
        studentName: "Lucas Silveira Santos",
        className: "Turma Alfa (Medicina) + Turma Gama (Redação)",
        pixCopiaECola:
          "00020126580014br.gov.bcb.pix0136cursinho-pix@escola.com.br52040000530398654071750.005802BR5916CURSINHO PRO LTDA6009SAO PAULO62140510MENSAL016304F9B3",
        pixQrCodeUrl:
          "https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=00020126580014br.gov.bcb.pix0136cursinho-pix@escola.com.br52040000530398654071750.005802BR5916CURSINHO PRO LTDA6009SAO PAULO62140510MENSAL016304F9B3",
        barcode: "34191.79001 01043.510047 91020.150008 1 95480000175000",
        notes: "Mensalidade Unificada de Novembro/2026 (Medicina + Redação + Cota de Apostila)",
      },
      {
        id: "inv-demo-out-2026",
        installmentNumber: 2,
        totalInstallments: 10,
        invoiceType: "TUITION",
        amount: 1750.0,
        discountAmount: 0.0,
        finalAmount: 1750.0,
        tuitionAmount: 1700.0,
        materialAmount: 50.0,
        isUnified: true,
        dueDate: "2026-10-20",
        status: "PAID",
        studentName: "Lucas Silveira Santos",
        className: "Turma Alfa (Medicina) + Turma Gama (Redação)",
        notes: "Liquidado via PIX com baixa automática",
      },
      {
        id: "inv-demo-set-2026",
        installmentNumber: 3,
        totalInstallments: 10,
        invoiceType: "TUITION",
        amount: 1750.0,
        discountAmount: 0.0,
        finalAmount: 1750.0,
        tuitionAmount: 1700.0,
        materialAmount: 50.0,
        isUnified: true,
        dueDate: "2026-09-20",
        status: "PAID",
        studentName: "Lucas Silveira Santos",
        className: "Turma Alfa (Medicina) + Turma Gama (Redação)",
        notes: "Liquidado no balcão via SmartPOS",
      },
      {
        id: "inv-demo-fee-2026",
        installmentNumber: 0,
        totalInstallments: 10,
        invoiceType: "ENROLLMENT_FEE",
        amount: 250.0,
        discountAmount: 0.0,
        finalAmount: 250.0,
        tuitionAmount: 0.0,
        materialAmount: 0.0,
        isUnified: false,
        dueDate: "2026-08-15",
        status: "PAID",
        studentName: "Lucas Silveira Santos",
        className: "Turma Alfa - Extensivo Medicina",
        notes: "Taxa de Matrícula e Reserva de Vaga",
      },
    ];
  }

  return (
    <GuardianPortalClient
      guardian={guardianData}
      students={studentsData}
      invoices={invoicesData}
    />
  );
}
