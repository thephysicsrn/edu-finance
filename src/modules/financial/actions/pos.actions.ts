"use server";

import { db } from "@/db";
import { posTerminals } from "@/db/schema";
import { revalidatePath } from "next/cache";
import { SmartPosService, CreatePosIntentParams } from "../services/smart-pos.service";

/**
 * Envia uma ordem de cobrança para a Maquininha SmartPOS física
 */
export async function sendToPosTerminalAction(params: CreatePosIntentParams) {
  try {
    const intent = await SmartPosService.sendChargeToTerminal(params);
    return {
      success: true,
      intent,
    };
  } catch (err: any) {
    console.error("[sendToPosTerminalAction error]:", err);
    return {
      success: false,
      error: err?.message || "Falha ao enviar cobrança para a maquininha.",
    };
  }
}

/**
 * Registra a aprovação da maquininha (acionada via Webhook ou confirmação do terminal)
 */
export async function completePosPaymentAction(params: {
  invoiceId: string;
  terminalDeviceId?: string;
  paymentType: "credit_card" | "debit_card";
  installments?: number;
  cardBrand?: string;
  nsu?: string;
  authorizationCode?: string;
}) {
  try {
    const result = await SmartPosService.completePosPayment(params);

    revalidatePath("/financial/invoices");
    revalidatePath("/financial/defaulters");
    revalidatePath("/academic/enrollments");
    revalidatePath("/");

    return {
      success: true,
      data: result,
    };
  } catch (err: any) {
    console.error("[completePosPaymentAction error]:", err);
    return {
      success: false,
      error: err?.message || "Falha ao processar confirmação da maquininha.",
    };
  }
}

/**
 * Lista as maquininhas ativas cadastradas na escola
 */
export async function listPosTerminalsAction() {
  try {
    const terminals = await db.query.posTerminals.findMany({
      where: (t, { eq }) => eq(t.isActive, true),
    });

    if (terminals.length === 0) {
      // Retorna terminal padrão demonstrativo
      return [
        {
          id: "term-default-01",
          name: "Maquininha Balcão Principal (SmartPOS)",
          provider: "MERCADO_PAGO_POINT",
          deviceId: "POINT-SMART-001",
          model: "Point Smart Android",
          isActive: true,
        },
        {
          id: "term-default-02",
          name: "Maquininha Secretaria 2 (Stone/PagBank)",
          provider: "STONE",
          deviceId: "STONE-POS-002",
          model: "Stone Smart P2",
          isActive: true,
        },
      ];
    }

    return terminals;
  } catch (err) {
    return [
      {
        id: "term-default-01",
        name: "Maquininha Balcão Principal (SmartPOS)",
        provider: "MERCADO_PAGO_POINT",
        deviceId: "POINT-SMART-001",
        model: "Point Smart Android",
        isActive: true,
      },
    ];
  }
}

/**
 * Cadastra uma nova maquininha SmartPOS
 */
export async function registerPosTerminalAction(data: {
  name: string;
  provider: "MERCADO_PAGO_POINT" | "STONE" | "PAGBANK";
  deviceId: string;
  model?: string;
}) {
  try {
    const [newTerminal] = await db
      .insert(posTerminals)
      .values({
        name: data.name,
        provider: data.provider,
        deviceId: data.deviceId,
        model: data.model || "SmartPOS Cloud",
        isActive: true,
      })
      .returning();

    revalidatePath("/financial/invoices");
    return { success: true, terminal: newTerminal };
  } catch (err: any) {
    return { success: false, error: err?.message || "Erro ao cadastrar terminal." };
  }
}

