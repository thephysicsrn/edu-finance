import { NextResponse } from "next/server";
import { BillingGatewayService } from "@/modules/financial/services/billing-gateway.service";

export const dynamic = "force-dynamic";

/**
 * Webhook Receptor de Eventos do Asaas (API v3)
 * URL no Asaas: https://seu-dominio.hosted.app/api/webhooks/billing
 */
export async function POST(request: Request) {
  try {
    const rawBody = await request.text();
    const payload = JSON.parse(rawBody);

    // Validação de token de segurança configurado no painel do Asaas
    const webhookSecret = process.env.ASAAS_WEBHOOK_SECRET || process.env.WEBHOOK_SECRET;
    const receivedToken = request.headers.get("asaas-access-token");

    if (webhookSecret && receivedToken !== webhookSecret) {
      console.warn("[Asaas Webhook] Tentativa de acesso com token inválido.");
      return NextResponse.json({ error: "Token de webhook inválido." }, { status: 401 });
    }

    const result = await BillingGatewayService.processWebhookNotification(payload);

    return NextResponse.json({
      received: true,
      timestamp: new Date().toISOString(),
      details: result,
    });
  } catch (error: any) {
    console.error("[Webhook Asaas Error]:", error);
    return NextResponse.json(
      { error: error?.message || "Erro interno ao processar webhook do Asaas." },
      { status: 500 }
    );
  }
}
