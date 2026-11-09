"use server";

import { db } from "@/db";
import { invoices, payments, students, guardians } from "@/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { recordPaymentSchema, RecordPaymentInput } from "../schemas/payment.schema";
import { BillingGatewayService } from "../services/billing-gateway.service";

export async function recordPaymentAction(rawInput: RecordPaymentInput) {
  const session = await auth();
  if (!session?.user) {
    return { success: false, error: "Acesso negado: Usuário não autenticado." };
  }

  const role = session.user.role;
  if (role !== "ADMIN" && role !== "SECRETARY") {
    return {
      success: false,
      error: "Permissão insuficiente para dar baixa em pagamentos.",
    };
  }

  const validation = recordPaymentSchema.safeParse(rawInput);
  if (!validation.success) {
    return {
      success: false,
      error: "Dados de pagamento inválidos.",
      fieldErrors: validation.error.flatten().fieldErrors,
    };
  }

  const data = validation.data;

  try {
    const result = await db.transaction(async (tx) => {
      const invoice = await tx.query.invoices.findFirst({
        where: eq(invoices.id, data.invoiceId),
      });

      if (!invoice) {
        throw new Error("Fatura não encontrada.");
      }

      if (invoice.status === "PAID") {
        throw new Error("Esta fatura já foi liquidada anteriormente.");
      }

      const totalReceived =
        data.amountPaid +
        data.penaltyAmount +
        data.interestAmount -
        data.discountGiven;

      // 1. Registra o pagamento detalhado
      const [payment] = await tx
        .insert(payments)
        .values({
          invoiceId: invoice.id,
          amountPaid: data.amountPaid.toFixed(2),
          penaltyAmount: data.penaltyAmount.toFixed(2),
          interestAmount: data.interestAmount.toFixed(2),
          discountGiven: data.discountGiven.toFixed(2),
          totalReceived: totalReceived.toFixed(2),
          paymentMethod: data.paymentMethod,
          transactionReference: data.transactionReference,
          receivedBy: session.user.id,
          paidAt: data.paidAt ? new Date(data.paidAt) : new Date(),
        })
        .returning();

      // 2. Transiciona o status da fatura para PAID
      await tx
        .update(invoices)
        .set({
          status: "PAID",
          updatedAt: new Date(),
        })
        .where(eq(invoices.id, invoice.id));

      return payment;
    });

    revalidatePath("/financial/invoices");
    revalidatePath("/financial/defaulters");
    revalidatePath("/");

    return {
      success: true,
      message: "Pagamento registrado com sucesso!",
      paymentId: result.id,
    };
  } catch (error: any) {
    console.error("[recordPaymentAction error]:", error);
    return {
      success: false,
      error: error?.message || "Erro ao registrar pagamento.",
    };
  }
}

/**
 * Server Action para emitir cobrança Asaas (PIX + Boleto) para uma fatura
 */
export async function generateAsaasChargeAction(invoiceId: string) {
  const session = await auth();
  if (!session?.user) {
    return { success: false, error: "Acesso negado: Usuário não autenticado." };
  }

  try {
    const invoice = await db.query.invoices.findFirst({
      where: eq(invoices.id, invoiceId),
      with: {
        student: {
          with: {
            guardian: true,
          },
        },
      },
    });

    if (!invoice) {
      return { success: false, error: "Fatura não encontrada." };
    }

    if (invoice.status === "PAID") {
      return { success: false, error: "Esta fatura já está liquidada." };
    }

    // Pega os dados do responsável ou do aluno
    const payerName = invoice.student?.guardian?.fullName || invoice.student?.fullName || "Aluno";
    const payerCpf = invoice.student?.guardian?.cpf || invoice.student?.cpf || "00000000000";
    const payerEmail = invoice.student?.guardian?.email || invoice.student?.email || undefined;
    const payerPhone = invoice.student?.guardian?.phone || invoice.student?.phone || undefined;
    const payerAddress = invoice.student?.guardian?.address || invoice.student?.address || undefined;

    const chargeResult = await BillingGatewayService.createCharge(
      {
        id: invoice.id,
        description: `Mensalidade ${invoice.installmentNumber}/${invoice.totalInstallments} - ${invoice.student?.fullName}`,
        finalAmount: parseFloat(invoice.finalAmount),
        dueDate: invoice.dueDate,
        invoiceType: invoice.invoiceType,
      },
      {
        name: payerName,
        cpf: payerCpf,
        email: payerEmail,
        phone: payerPhone,
        address: payerAddress,
      }
    );

    revalidatePath("/financial/invoices");

    return {
      success: true,
      data: chargeResult,
      message: "Cobrança gerada com sucesso via Asaas!",
    };
  } catch (error: any) {
    console.error("[generateAsaasChargeAction error]:", error);
    return {
      success: false,
      error: error?.message || "Erro ao comunicar com gateway de pagamento.",
    };
  }
}


