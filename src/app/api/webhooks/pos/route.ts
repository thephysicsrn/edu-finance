import { NextResponse } from "next/server";
import { SmartPosService } from "@/modules/financial/services/smart-pos.service";

export const dynamic = "force-dynamic";

/**
 * Endpoint de Webhook específico para maquininhas SmartPOS Cloud (Mercado Pago Point, Stone, PagBank)
 */
export async function POST(request: Request) {
  try {
    const payload = await request.json();

    // Eventos do Mercado Pago Point ou Stone
    // Exemplo: { event_type: "payment_intent.finished", additional_info: { external_reference: invoiceId } }
    const externalReference =
      payload.additional_info?.external_reference ||
      payload.external_reference ||
      payload.payment?.external_reference;

    if (!externalReference) {
      return NextResponse.json(
        { received: true, ignored: true, message: "Sem referência de fatura externa." },
        { status: 200 }
      );
    }

    const paymentInfo = payload.payment || payload;
    const paymentType =
      paymentInfo.payment_type_id === "debit_card" ? "debit_card" : "credit_card";

    const result = await SmartPosService.completePosPayment({
      invoiceId: externalReference,
      terminalDeviceId: payload.device_id,
      paymentType,
      installments: paymentInfo.installments || 1,
      cardBrand: paymentInfo.payment_method_id?.toUpperCase() || "MASTERCARD",
      nsu: paymentInfo.id?.toString() || `NSU_${Date.now()}`,
      authorizationCode: paymentInfo.authorization_code || `AUTH_${Date.now()}`,
    });

    return NextResponse.json({
      received: true,
      result,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error("[POS Webhook Error]:", error);
    return NextResponse.json(
      { error: error?.message || "Erro no processamento da notificação da maquininha." },
      { status: 500 }
    );
  }
}

