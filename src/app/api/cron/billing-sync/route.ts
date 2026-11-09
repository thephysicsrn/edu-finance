import { NextResponse } from "next/server";
import { db } from "@/db";
import { invoices } from "@/db/schema";
import { eq, and, sql } from "drizzle-orm";
import { syncOverdueInvoicesStatus } from "@/modules/financial/queries/defaulters.queries";

export const dynamic = "force-dynamic";

/**
 * Job de Sincronização Periódica de Faturas (Billing Sync & Overdue Job)
 * Realiza a reconciliação e a virada de status das mensalidades e taxas de matrícula.
 */
export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get("authorization");
    if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 1. Atualiza parcelas vencidas (PENDING -> OVERDUE onde dueDate < hoje)
    const overdueResult = await syncOverdueInvoicesStatus();

    // 2. Busca faturas pendentes com gateway associado para reconciliação
    const pendingWithGateway = await db.query.invoices.findMany({
      where: and(
        eq(invoices.status, "PENDING"),
        sql`${invoices.gatewayInvoiceId} is not null`
      ),
      limit: 50,
    });

    return NextResponse.json({
      success: true,
      message: "Sincronização de cobranças e faturas executada com sucesso.",
      overdueInvoicesUpdated: overdueResult.count,
      gatewayInvoicesChecked: pendingWithGateway.length,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error("[Cron Billing Sync Error]:", error);
    return NextResponse.json(
      { error: error?.message || "Erro na rotina de sincronização de cobranças." },
      { status: 500 }
    );
  }
}

