import { z } from "zod";

export const recordPaymentSchema = z.object({
  invoiceId: z.string().uuid("ID de fatura inválido"),
  amountPaid: z.coerce.number().positive("O valor pago deve ser maior que zero"),
  penaltyAmount: z.coerce.number().min(0, "Multa não pode ser negativa").default(0),
  interestAmount: z.coerce.number().min(0, "Juros não podem ser negativos").default(0),
  discountGiven: z.coerce.number().min(0, "Desconto não pode ser negativo").default(0),
  paymentMethod: z.enum([
    "PIX",
    "BOLETO",
    "CREDIT_CARD",
    "DEBIT_CARD",
    "CASH",
    "BANK_TRANSFER",
  ]),
  transactionReference: z.string().optional(),
  paidAt: z.string().optional(), // ISO string ou YYYY-MM-DD
});

export type RecordPaymentInput = z.infer<typeof recordPaymentSchema>;

