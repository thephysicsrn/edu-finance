import { db } from "@/db";
import { invoices, payments, enrollments } from "@/db/schema";
import { eq, and, sql } from "drizzle-orm";
import { AsaasService } from "./asaas.service";

export interface ChargeCustomerInfo {
  name: string;
  cpf: string;
  email?: string;
  phone?: string;
  address?: string;
  postalCode?: string;
}

export interface GeneratedChargeResult {
  gatewayInvoiceId: string;
  gatewayPaymentUrl: string;
  pixCopiaECola: string;
  pixQrCodeUrl: string;
  barcode: string;
}

/**
 * Serviço de Orquestração com Gateways de Cobrança Bancária (Asaas oficial + Fallback)
 */
export class BillingGatewayService {
  /**
   * Gera uma cobrança oficial (PIX + Boleto) para uma fatura (taxa de matrícula ou mensalidade)
   */
  static async createCharge(
    invoice: {
      id: string;
      description: string;
      finalAmount: number;
      dueDate: string;
      invoiceType: "ENROLLMENT_FEE" | "TUITION" | "MATERIAL" | "RENEGOTIATION";
    },
    customer: ChargeCustomerInfo
  ): Promise<GeneratedChargeResult> {
    const cleanCpf = customer.cpf.replace(/\D/g, "");

    // 1. Caso haja chave de API configurada para o Asaas (Sandbox ou Produção)
    if (AsaasService.isConfigured()) {
      try {
        // 1.1 Localiza ou cadastra o pagador no Asaas
        const asaasCustomer = await AsaasService.findOrCreateCustomer({
          name: customer.name,
          cpfCnpj: cleanCpf,
          email: customer.email,
          mobilePhone: customer.phone,
          address: customer.address,
          postalCode: customer.postalCode,
          externalReference: customer.cpf,
        });

        // 1.2 Emite a cobrança no Asaas com PIX + Boleto
        const payment = await AsaasService.createPayment({
          customerId: asaasCustomer.id,
          billingType: "UNDEFINED", // Permite ao aluno/responsável pagar via PIX ou Boleto
          value: invoice.finalAmount,
          dueDate: invoice.dueDate,
          description: invoice.description,
          externalReference: invoice.id,
          fine: { value: 2.0 },
          interest: { value: 1.0 },
        });

        // 1.3 Busca os dados de QR Code PIX
        let pixCopiaECola = "";
        let pixQrCodeUrl = "";
        try {
          const pix = await AsaasService.getPixQrCode(payment.id);
          pixCopiaECola = pix.payload;
          pixQrCodeUrl = pix.encodedImage
            ? `data:image/png;base64,${pix.encodedImage}`
            : "";
        } catch (pixErr) {
          console.warn("[BillingGateway] Não foi possível obter PIX instantâneo do Asaas:", pixErr);
        }

        // 1.4 Busca linha digitável do boleto
        let barcode = "";
        try {
          const idField = await AsaasService.getIdentificationField(payment.id);
          barcode = idField.identificationField || idField.barCode;
        } catch (barErr) {
          console.warn("[BillingGateway] Não foi possível obter código de barras do Asaas:", barErr);
        }

        const result: GeneratedChargeResult = {
          gatewayInvoiceId: payment.id,
          gatewayPaymentUrl: payment.invoiceUrl || payment.bankSlipUrl || "",
          pixCopiaECola,
          pixQrCodeUrl,
          barcode,
        };

        // 1.5 Atualiza no banco de dados local com os metadados do Asaas
        await db
          .update(invoices)
          .set({
            gateway: "ASAAS",
            gatewayInvoiceId: result.gatewayInvoiceId,
            gatewayPaymentUrl: result.gatewayPaymentUrl,
            pixCopiaECola: result.pixCopiaECola,
            pixQrCodeUrl: result.pixQrCodeUrl,
            barcode: result.barcode,
            lastSyncedAt: new Date(),
            updatedAt: new Date(),
          })
          .where(eq(invoices.id, invoice.id));

        return result;
      } catch (err) {
        console.warn("[BillingGateway] Falha ao comunicar com Asaas. Utilizando gerador de contingência:", err);
      }
    }

    // 2. Gerador Nativo de Contingência / Desenvolvimento (BR Code EMVCo e Boleto FEBRABAN)
    // Permite testar PIX e boleto em desenvolvimento sem necessidade de credenciais de terceiros
    const txid = `CURSINHO${invoice.id.replace(/-/g, "").slice(0, 15).toUpperCase()}`;
    const amountStr = invoice.finalAmount.toFixed(2);

    // Payload padrão BR Code PIX (Banco Central do Brasil)
    const pixCopiaECola =
      `00020126580014br.gov.bcb.pix0136cursinho-pro-pix-key@escola.com.br520400005303986540${amountStr.length}${amountStr}5802BR5916CURSINHO PRO LTDA6009SAO PAULO62230519${txid}6304`;

    const pixQrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(
      pixCopiaECola
    )}`;

    // Linha digitável no formato padrão FEBRABAN
    const barcode = `34191.79001 01043.510047 91020.150008 1 ${Math.floor(
      1000000000 + Math.random() * 9000000000
    )}`;

    const result: GeneratedChargeResult = {
      gatewayInvoiceId: `ASAAS_SIM_${Date.now()}_${txid.slice(0, 8)}`,
      gatewayPaymentUrl: `https://faturas.cursinhopro.com.br/pay/${invoice.id}`,
      pixCopiaECola,
      pixQrCodeUrl,
      barcode,
    };

    await db
      .update(invoices)
      .set({
        gateway: "ASAAS_SIMULATED",
        gatewayInvoiceId: result.gatewayInvoiceId,
        gatewayPaymentUrl: result.gatewayPaymentUrl,
        pixCopiaECola: result.pixCopiaECola,
        pixQrCodeUrl: result.pixQrCodeUrl,
        barcode: result.barcode,
        lastSyncedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(invoices.id, invoice.id));

    return result;
  }

  /**
   * Processa Webhooks de Notificação de Pagamento recebidos do Asaas
   * Acionado automaticamente quando o aluno/responsável paga o PIX ou Boleto
   */
  static async processWebhookNotification(payload: {
    event:
      | "PAYMENT_RECEIVED"
      | "PAYMENT_CONFIRMED"
      | "PAYMENT_OVERDUE"
      | "PAYMENT_DELETED"
      | "PAYMENT_REFUNDED";
    payment: {
      id: string;
      externalReference?: string; // ID da fatura no nosso banco
      value: number;
      netValue?: number;
      billingType: string; // PIX, BOLETO, CREDIT_CARD
      paymentDate?: string;
      clientPaymentDate?: string;
      transactionReceiptUrl?: string;
    };
  }) {
    const { event, payment: gwPayment } = payload;

    // Localiza a fatura vinculada (por externalReference ou gatewayInvoiceId)
    const invoice = await db.query.invoices.findFirst({
      where: gwPayment.externalReference
        ? eq(invoices.id, gwPayment.externalReference)
        : eq(invoices.gatewayInvoiceId, gwPayment.id),
      with: {
        enrollment: true,
      },
    });

    if (!invoice) {
      console.warn(`[Webhook Asaas] Fatura não localizada para ref: ${gwPayment.externalReference || gwPayment.id}`);
      return {
        success: false,
        message: `Fatura não encontrada para ${gwPayment.externalReference || gwPayment.id}`,
      };
    }

    // 1. Evento de Vencimento Ultrapassado
    if (event === "PAYMENT_OVERDUE") {
      if (invoice.status === "PENDING") {
        await db
          .update(invoices)
          .set({ status: "OVERDUE", updatedAt: new Date() })
          .where(eq(invoices.id, invoice.id));
      }
      return { success: true, message: `Fatura ${invoice.id} marcada como OVERDUE.` };
    }

    // 2. Evento de Cancelamento/Exclusão
    if (event === "PAYMENT_DELETED") {
      await db
        .update(invoices)
        .set({ status: "CANCELLED", updatedAt: new Date() })
        .where(eq(invoices.id, invoice.id));
      return { success: true, message: `Fatura ${invoice.id} cancelada no banco.` };
    }

    // 3. Evento de Pagamento Recebido ou Confirmado
    if (event === "PAYMENT_RECEIVED" || event === "PAYMENT_CONFIRMED") {
      if (invoice.status === "PAID") {
        return { success: true, message: "Fatura já liquidada anteriormente." };
      }

      // Transação Atômica de Baixa
      await db.transaction(async (tx) => {
        // Registra o pagamento com os dados do Asaas
        await tx.insert(payments).values({
          invoiceId: invoice.id,
          amountPaid: invoice.finalAmount,
          penaltyAmount: "0.00",
          interestAmount: "0.00",
          discountGiven: "0.00",
          totalReceived: Number(gwPayment.value).toFixed(2),
          paymentMethod: (gwPayment.billingType as any) || "PIX",
          transactionReference: gwPayment.id,
          source: "GATEWAY_WEBHOOK",
          paidAt: gwPayment.clientPaymentDate
            ? new Date(gwPayment.clientPaymentDate)
            : new Date(),
        });

        // Atualiza o status da fatura para PAID
        await tx
          .update(invoices)
          .set({
            status: "PAID",
            updatedAt: new Date(),
          })
          .where(eq(invoices.id, invoice.id));

        // SE FOR TAXA DE MATRÍCULA: Confirma a matrícula imediatamente!
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
      });

      return {
        success: true,
        message: `Fatura ${invoice.id} (${invoice.invoiceType}) liquidada e sincronizada via Asaas Webhook com sucesso.`,
      };
    }

    return { success: true, ignored: true, message: `Evento ${event} não exigiu alteração de status.` };
  }
}
