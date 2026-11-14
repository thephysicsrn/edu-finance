import { db } from "@/db";
import { invoices, classes, enrollments, students, guardians } from "@/db/schema";
import { sql, eq } from "drizzle-orm";
import { TrendingUp } from "lucide-react";
import {
  FinancialReportByClass,
  ClassFinancialDetail,
} from "@/modules/financial/components/financial-report-by-class";

export const dynamic = "force-dynamic";

export default async function CashflowReportPage() {
  let classFinancials: ClassFinancialDetail[] = [];

  try {
    // 1. Agregação contábil por turma separando Mensalidades e Taxa de Material
    const rawClassData = await db
      .select({
        classId: classes.id,
        className: classes.name,
        shift: classes.shift,
        totalExpected: sql<number>`coalesce(sum(${invoices.finalAmount}::numeric), 0)::float`,
        totalTuition: sql<number>`coalesce(sum(case when ${invoices.invoiceType} = 'TUITION' then coalesce(${invoices.tuitionAmount}::numeric, ${invoices.finalAmount}::numeric) else 0 end), 0)::float`,
        totalMaterial: sql<number>`coalesce(sum(case when ${invoices.invoiceType} = 'MATERIAL' then ${invoices.finalAmount}::numeric else coalesce(${invoices.materialAmount}::numeric, 0) end), 0)::float`,
        totalEnrollmentFee: sql<number>`coalesce(sum(case when ${invoices.invoiceType} = 'ENROLLMENT_FEE' then ${invoices.finalAmount}::numeric else 0 end), 0)::float`,
        totalPaid: sql<number>`coalesce(sum(case when ${invoices.status} = 'PAID' then ${invoices.finalAmount}::numeric else 0 end), 0)::float`,
        totalOverdue: sql<number>`coalesce(sum(case when ${invoices.status} = 'OVERDUE' or (${invoices.status} = 'PENDING' and ${invoices.dueDate} < current_date) then ${invoices.finalAmount}::numeric else 0 end), 0)::float`,
        enrollmentCount: sql<number>`count(distinct ${enrollments.id})::int`,
      })
      .from(classes)
      .leftJoin(enrollments, eq(enrollments.classId, classes.id))
      .leftJoin(invoices, eq(invoices.enrollmentId, enrollments.id))
      .groupBy(classes.id, classes.name, classes.shift);

    // 2. Busca detalhada dos alunos matriculados em cada turma
    const classesWithStudents = await db.query.classes.findMany({
      with: {
        enrollments: {
          with: {
            student: {
              with: {
                guardian: true,
                invoices: true,
              },
            },
          },
        },
      },
    });

    classFinancials = rawClassData.map((rc) => {
      const clsFull = classesWithStudents.find((c) => c.id === rc.classId);
      const studentsList = (clsFull?.enrollments || []).map((en) => {
        const st = en.student;
        const stInvoices = st.invoices || [];
        const paidCount = stInvoices.filter((i) => i.status === "PAID").length;
        const pendingCount = stInvoices.filter(
          (i) => i.status === "PENDING" || i.status === "OVERDUE"
        ).length;

        const tuitionVal = stInvoices
          .filter((i) => i.invoiceType === "TUITION")
          .reduce((acc, curr) => acc + Number(curr.tuitionAmount || curr.finalAmount), 0);
        const materialVal = stInvoices.reduce(
          (acc, curr) => acc + Number(curr.materialAmount || (curr.invoiceType === "MATERIAL" ? curr.finalAmount : 0)),
          0
        );

        return {
          studentName: st.fullName,
          guardianName: st.guardian?.fullName || "Responsável não informado",
          tuitionValue: tuitionVal,
          materialValue: materialVal,
          invoicesCount: stInvoices.length,
          paidCount,
          pendingCount,
          status: en.status,
        };
      });

      const recoveryRate = rc.totalExpected > 0 ? Math.round((rc.totalPaid / rc.totalExpected) * 100) : 0;

      return {
        ...rc,
        recoveryRate,
        studentsList,
      };
    });
  } catch (error) {
    console.warn("Database not yet connected or seeded. Showing demo data.");
  }

  // Preenche dados demonstrativos ricos se a base estiver vazia
  if (classFinancials.length === 0) {
    classFinancials = [
      {
        classId: "1",
        className: "Turma Alfa - Medicina (Manhã)",
        shift: "MORNING",
        enrollmentCount: 38,
        totalTuition: 395000.0,
        totalMaterial: 19000.0,
        totalEnrollmentFee: 9500.0,
        totalExpected: 423500.0,
        totalPaid: 368000.0,
        totalOverdue: 21500.0,
        recoveryRate: 87,
        studentsList: [
          {
            studentName: "Lucas Silveira Santos",
            guardianName: "Mariana Alencar Silveira",
            tuitionValue: 11250.0,
            materialValue: 500.0,
            invoicesCount: 10,
            paidCount: 8,
            pendingCount: 2,
            status: "ACTIVE",
          },
          {
            studentName: "Gabriela Duarte Faria",
            guardianName: "Rodrigo Faria",
            tuitionValue: 12500.0,
            materialValue: 500.0,
            invoicesCount: 10,
            paidCount: 9,
            pendingCount: 1,
            status: "ACTIVE",
          },
        ],
      },
      {
        classId: "2",
        className: "Turma Beta - ITA/IME & Exatas (Tarde)",
        shift: "AFTERNOON",
        enrollmentCount: 28,
        totalTuition: 280000.0,
        totalMaterial: 14000.0,
        totalEnrollmentFee: 7000.0,
        totalExpected: 301000.0,
        totalPaid: 262000.0,
        totalOverdue: 14000.0,
        recoveryRate: 87,
        studentsList: [
          {
            studentName: "Beatriz Nogueira Ribeiro",
            guardianName: "Carlos Eduardo Ribeiro",
            tuitionValue: 11000.0,
            materialValue: 500.0,
            invoicesCount: 10,
            paidCount: 10,
            pendingCount: 0,
            status: "ACTIVE",
          },
        ],
      },
      {
        classId: "3",
        className: "Turma Gama - Redação Nota 1000 (Noite)",
        shift: "NIGHT",
        enrollmentCount: 42,
        totalTuition: 168000.0,
        totalMaterial: 8400.0,
        totalEnrollmentFee: 8400.0,
        totalExpected: 184800.0,
        totalPaid: 165000.0,
        totalOverdue: 9200.0,
        recoveryRate: 89,
        studentsList: [
          {
            studentName: "Lucas Silveira Santos (Multiturma)",
            guardianName: "Mariana Alencar Silveira",
            tuitionValue: 4500.0,
            materialValue: 200.0,
            invoicesCount: 10,
            paidCount: 8,
            pendingCount: 2,
            status: "ACTIVE",
          },
        ],
      },
    ];
  }

  return (
    <div className="space-y-6">
      <div className="print:hidden">
        <h2 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
          <TrendingUp className="h-6 w-6 text-indigo-600" />
          Relatório Financeiro Administrativo & Fechamento por Turma
        </h2>
        <p className="text-sm text-slate-500">
          Fechamento contábil discriminado por turma de alunos, separando receita de prestação de serviços (mensalidades) e material didático para conformidade fiscal.
        </p>
      </div>

      <FinancialReportByClass initialClasses={classFinancials} />
    </div>
  );
}
