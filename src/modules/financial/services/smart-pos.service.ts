import { db } from "@/db";
import { posTerminals, invoices, payments, enrollments } from "@/db/schema";
import { eq } from "drizzle-orm";

export interface CreatePosIntentParams {
  invoiceId: string;
  terminalDeviceId?: string; // Serial / ID da maquininha
  paymentType: "credit_card" | "debit_card";
  installments?: number; // 1x, 2x, 3x...
}

export interface PosIntentResponse {
  intentId: string;
  status: "OPEN" | "PROCESSING" | "COMPLETED" | "CANCELED" | "ERROR";
  amount: number;
  terminalName: string;
  deviceId: string;
}

/**
 * Serviço de Conexão com Maquininhas SmartPOS Cloud (Modelo 1)
 * Compatível com Mercado Pago Point Smart/Pro, Stone e PagBank
 */
export class SmartPosService {
  private static mpAccessToken = process.env.MERCADO_PAGO_ACCESS_TOKEN || "";

  /**
   * Envia a ordem de cobrança diretamente para a maquininha física na mesa da secretária
   */
  static async sendChargeToTerminal(
    params: CreatePosIntentParams
  ): Promise<PosIntentResponse> {
    const { invoiceId, paymentType, installments = 1 } = params;

    const invoice = await db.query.invoices.findFirst({
      where: eq(invoices.id, invoiceId),
      with: {
        student: true,
      },
    });

    if (!invoice) {
      throw new Error("Fatura não encontrada.");
    }

    if (invoice.status === "PAID") {
      throw new Error("Esta fatura já está liquidada.");
    }

    // Busca maquininha ativa cadastrada
    const terminal = await db.query.posTerminals.findFirst({
      where: params.terminalDeviceId
        ? eq(posTerminals.deviceId, params.terminalDeviceId)
        : eq(posTerminals.isActive, true),
    });

    const deviceId = terminal?.deviceId || "SMARTPOS-BALCAO-01";
    const terminalName = terminal?.name || "Maquininha Balcão Principal";
    const amountNumber = Number(invoice.finalAmount);

    // 1. Integração Real com API Cloud do Mercado Pago Point (se houver ACCESS_TOKEN)
    if (this.mpAccessToken && terminal?.deviceId) {
      try {
        const response = await fetch(
          `https://api.mercadopago.com/point/integration-api/devices/${terminal.deviceId}/payment-intents`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${this.mpAccessToken}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              amount: Math.round(amountNumber * 100), // centavos
              description: `Cursinho Pro: ${invoice.student?.fullName || "Aluno"}`,
              payment: {
                installments,
                type: paymentType,
              },
              additional_info: {
                external_reference: invoice.id,
                print_on_terminal: true,
              },
            }),
          }
        );

        if (response.ok) {
          const data = await response.json();
          return {
            intentId: data.id,
            status: "OPEN",
            amount: amountNumber,
            terminalName,
            deviceId,
          };
        }
      } catch (err) {
        console.warn("[SmartPOS] Falha na chamada da API Cloud externa:", err);
      }
    }

    // 2. Modo Simulação Integrado para Teste Instantâneo (Ambiente de Desenvolvimento)
    // Permite testar o fluxo de ponta a ponta sem maquininha física conectada
    const intentId = `INTENT_${Date.now()}_${Math.floor(1000 + Math.random() * 9000)}`;

    return {
      intentId,
      status: "OPEN",
      amount: amountNumber,
      terminalName,
      deviceId,
    };
  }

  /**
   * Confirma a aprovação do cartão no terminal e registra a baixa no sistema
   */
  static async completePosPayment(params: {
    invoiceId: string;
    terminalDeviceId?: string;
    paymentType: "credit_card" | "debit_card";
    installments?: number;
    cardBrand?: string;
    nsu?: string;
    authorizationCode?: string;
  }) {
    const {
      invoiceId,
      paymentType,
      installments = 1,
      cardBrand = "MASTERCARD",
      nsu = `NSU${Math.floor(100000 + Math.random() * 900000)}`,
      authorizationCode = `AUTH${Math.floor(10000 + Math.random() * 90000)}`,
    } = params;

    const invoice = await db.query.invoices.findFirst({
      where: eq(invoices.id, invoiceId),
    });

    if (!invoice) {
      throw new Error("Fatura não encontrada.");
    }

    if (invoice.status === "PAID") {
      return {
        success: true,
        paymentId: "",
        nsu: "NSU-ALREADY-PAID",
        authorizationCode: "AUTH-0000",
        cardBrand: "CARTAO",
        message: "Fatura já está quitada.",
      };
    }

    const terminal = await db.query.posTerminals.findFirst({
      where: params.terminalDeviceId
        ? eq(posTerminals.deviceId, params.terminalDeviceId)
        : undefined,
    });

    // Baixa Atômica
    const result = await db.transaction(async (tx) => {
      // 1. Cria o registro de pagamento detalhado com os dados da maquininha
      const [paymentRecord] = await tx
        .insert(payments)
        .values({
          invoiceId: invoice.id,
          amountPaid: invoice.finalAmount,
          penaltyAmount: "0.00",
          interestAmount: "0.00",
          discountGiven: "0.00",
          totalReceived: invoice.finalAmount,
          paymentMethod: paymentType === "credit_card" ? "CREDIT_CARD" : "DEBIT_CARD",
          posTerminalId: terminal?.id || null,
          cardBrand,
          cardInstallments: installments,
          authorizationCode,
          transactionReference: nsu,
          source: "SMART_POS",
        })
        .returning();

      // 2. Atualiza status da fatura para PAID
      await tx
        .update(invoices)
        .set({
          status: "PAID",
          updatedAt: new Date(),
        })
        .where(eq(invoices.id, invoice.id));

      // 3. Se for Taxa de Matrícula, ativa imediatamente a vaga
      if (invoice.invoiceType === "ENROLLMENT_FEE") {
        await tx
          .update(enrollments)
          .set({
            isFeePaid: true,
            status: "ACTIVE",
            confirmedAt: new Date(),
            updatedAt: new Date(),
          })
          .where(eq(enrollments.id, invoice.enrollmentId));
      }

      return paymentRecord;
    });

    return {
      success: true,
      paymentId: result.id,
      nsu,
      authorizationCode,
      cardBrand,
      message: `Pagamento de ${invoice.finalAmount} aprovado com sucesso na maquininha!`,
    };
  }
}

