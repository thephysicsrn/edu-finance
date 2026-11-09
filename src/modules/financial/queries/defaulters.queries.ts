import { db } from "@/db";
import {
  invoices,
  students,
  guardians,
  classes,
  enrollments,
} from "@/db/schema";
import { and, eq, or, sql, desc } from "drizzle-orm";

export interface DefaulterSummary {
  studentId: string;
  studentName: string;
  studentEmail: string | null;
  studentPhone: string | null;
  guardianName: string;
  guardianPhone: string;
  guardianEmail: string;
  className: string;
  overdueInvoicesCount: number;
  totalOverdueAmount: number;
  maxDaysOverdue: number;
  oldestDueDate: string;
}

/**
 * Consulta otimizada em Drizzle ORM para relatórios de inadimplência.
 * Agrupa faturas com status OVERDUE ou PENDING com vencimento ultrapassado.
 */
export async function getDefaultersSummaryQuery(): Promise<DefaulterSummary[]> {
  try {
    const result = await db
      .select({
        studentId: students.id,
        studentName: students.fullName,
        studentEmail: students.email,
        studentPhone: students.phone,
        guardianName: sql<string>`coalesce(${guardians.fullName}, 'Não informado')`,
        guardianPhone: sql<string>`coalesce(${guardians.phone}, '-')`,
        guardianEmail: sql<string>`coalesce(${guardians.email}, '-')`,
        className: classes.name,
        overdueInvoicesCount: sql<number>`count(${invoices.id})::int`,
        totalOverdueAmount: sql<number>`coalesce(sum(${invoices.finalAmount}::numeric), 0)::float`,
        maxDaysOverdue: sql<number>`max(current_date - ${invoices.dueDate})::int`,
        oldestDueDate: sql<string>`min(${invoices.dueDate})::text`,
      })
      .from(invoices)
      .innerJoin(students, eq(invoices.studentId, students.id))
      .leftJoin(guardians, eq(students.guardianId, guardians.id))
      .innerJoin(enrollments, eq(invoices.enrollmentId, enrollments.id))
      .innerJoin(classes, eq(enrollments.classId, classes.id))
      .where(
        and(
          or(
            eq(invoices.status, "OVERDUE"),
            and(
              eq(invoices.status, "PENDING"),
              sql`${invoices.dueDate} < current_date`
            )
          ),
          eq(enrollments.status, "ACTIVE")
        )
      )
      .groupBy(
        students.id,
        students.fullName,
        students.email,
        students.phone,
        guardians.fullName,
        guardians.phone,
        guardians.email,
        classes.name
      )
      .having(sql`count(${invoices.id}) > 0`)
      .orderBy(desc(sql`max(current_date - ${invoices.dueDate})`));

    return result;
  } catch (error) {
    console.error("[getDefaultersSummaryQuery error]:", error);
    return [];
  }
}

/**
 * Estatísticas Consolidadas do Financeiro para os Cards do Dashboard
 */
export async function getFinancialOverviewKPIs() {
  try {
    const [kpis] = await db
      .select({
        totalExpected: sql<number>`coalesce(sum(${invoices.finalAmount}::numeric), 0)::float`,
        totalPaid: sql<number>`coalesce(sum(case when ${invoices.status} = 'PAID' then ${invoices.finalAmount}::numeric else 0 end), 0)::float`,
        totalOverdue: sql<number>`coalesce(sum(case when ${invoices.status} = 'OVERDUE' or (${invoices.status} = 'PENDING' and ${invoices.dueDate} < current_date) then ${invoices.finalAmount}::numeric else 0 end), 0)::float`,
        totalPending: sql<number>`coalesce(sum(case when ${invoices.status} = 'PENDING' and ${invoices.dueDate} >= current_date then ${invoices.finalAmount}::numeric else 0 end), 0)::float`,
        overdueCount: sql<number>`count(case when ${invoices.status} = 'OVERDUE' or (${invoices.status} = 'PENDING' and ${invoices.dueDate} < current_date) then 1 else null end)::int`,
      })
      .from(invoices);

    return (
      kpis || {
        totalExpected: 0,
        totalPaid: 0,
        totalOverdue: 0,
        totalPending: 0,
        overdueCount: 0,
      }
    );
  } catch (error) {
    console.error("[getFinancialOverviewKPIs error]:", error);
    return {
      totalExpected: 0,
      totalPaid: 0,
      totalOverdue: 0,
      totalPending: 0,
      overdueCount: 0,
    };
  }
}

/**
 * Atualiza no banco as faturas cujo vencimento expirou
 */
export async function syncOverdueInvoicesStatus() {
  try {
    const updated = await db
      .update(invoices)
      .set({
        status: "OVERDUE",
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(invoices.status, "PENDING"),
          sql`${invoices.dueDate} < current_date`
        )
      )
      .returning({ id: invoices.id });

    return { success: true, count: updated.length };
  } catch (error) {
    console.error("[syncOverdueInvoicesStatus error]:", error);
    return { success: false, count: 0 };
  }
}

