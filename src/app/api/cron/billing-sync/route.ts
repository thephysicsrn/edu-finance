import { NextResponse } from "next/server";
import { syncOverdueInvoicesStatus } from "@/modules/financial/queries/defaulters.queries";
import { BillingGatewayService } from "@/modules/financial/services/billing-gateway.service";

export const dynamic = "force-dynamic";

/**
 * Job de Sincronização Periódica de Faturas (Billing Sync & Overdue Job)
 * Realiza a reconciliação e a virada de status das mensalidades e taxas de matrícula com o Asaas.
 */
export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get("authorization");
    if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 1. Atualiza parcelas vencidas (PENDING -> OVERDUE onde dueDate < hoje)
    const overdueResult = await syncOverdueInvoicesStatus();

    // 2. Reconciliação direta com a API do Asaas
    const gatewaySyncResult = await BillingGatewayService.syncPendingInvoicesWithAsaas();

    return NextResponse.json({
      success: true,
      message: "Sincronização de cobranças e faturas executada com sucesso.",
      overdueInvoicesUpdated: overdueResult.count,
      gatewayInvoicesChecked: gatewaySyncResult.checked,
      gatewayInvoicesUpdated: gatewaySyncResult.updated,
      details: gatewaySyncResult.details,
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

