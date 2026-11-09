import { db } from "@/db";
import { invoices } from "@/db/schema";
import { desc } from "drizzle-orm";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Receipt } from "lucide-react";
import { InvoicesTable } from "@/modules/financial/components/invoices-table";

export const dynamic = "force-dynamic";

export default async function InvoicesPage() {
  let invoiceList: any[] = [];

  try {
    invoiceList = await db.query.invoices.findMany({
      orderBy: [desc(invoices.dueDate)],
      limit: 100,
      with: {
        student: true,
      },
    });
  } catch (error) {
    console.warn("Database not yet connected or seeded. Using demo invoices.");
  }

  // Dados demonstrativos com PIX e Boleto para teste imediato
  if (invoiceList.length === 0) {
    invoiceList = [
      {
        id: "inv-fee-demo-001",
        installmentNumber: 0,
        totalInstallments: 10,
        invoiceType: "ENROLLMENT_FEE",
        amount: "250.00",
        discountAmount: "0.00",
        finalAmount: "250.00",
        dueDate: "2026-11-03",
        status: "PENDING",
        pixCopiaECola:
          "00020126580014br.gov.bcb.pix0136cursinho-pix@escola.com.br5204000053039865406250.005802BR5916CURSINHO PRO LTDA6009SAO PAULO62140510MATRICULA16304E8A2",
        pixQrCodeUrl:
          "https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=00020126580014br.gov.bcb.pix0136cursinho-pix@escola.com.br5204000053039865406250.005802BR5916CURSINHO PRO LTDA6009SAO PAULO62140510MATRICULA16304E8A2",
        barcode: "34191.79001 01043.510047 91020.150008 1 95480000025000",
        student: {
          fullName: "Gabriel Silva Santos",
        },
      },
      {
        id: "inv-tut-demo-002",
        installmentNumber: 1,
        totalInstallments: 10,
        invoiceType: "TUITION",
        amount: "1250.00",
        discountAmount: "125.00",
        finalAmount: "1125.00",
        dueDate: "2026-11-10",
        status: "PENDING",
        pixCopiaECola:
          "00020126580014br.gov.bcb.pix0136cursinho-pix@escola.com.br52040000530398654071125.005802BR5916CURSINHO PRO LTDA6009SAO PAULO62140510MENSAL016304F9B3",
        pixQrCodeUrl:
          "https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=00020126580014br.gov.bcb.pix0136cursinho-pix@escola.com.br52040000530398654071125.005802BR5916CURSINHO PRO LTDA6009SAO PAULO62140510MENSAL016304F9B3",
        barcode: "34191.79001 01043.510047 91020.150008 1 95480000112500",
        student: {
          fullName: "Mariana Alencar Silveira",
        },
      },
      {
        id: "inv-tut-demo-003",
        installmentNumber: 2,
        totalInstallments: 10,
        invoiceType: "TUITION",
        amount: "1250.00",
        discountAmount: "0.00",
        finalAmount: "1250.00",
        dueDate: "2026-10-10",
        status: "OVERDUE",
        pixCopiaECola:
          "00020126580014br.gov.bcb.pix0136cursinho-pix@escola.com.br52040000530398654071250.005802BR5916CURSINHO PRO LTDA6009SAO PAULO62140510MENSAL026304A1C4",
        pixQrCodeUrl:
          "https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=00020126580014br.gov.bcb.pix0136cursinho-pix@escola.com.br52040000530398654071250.005802BR5916CURSINHO PRO LTDA6009SAO PAULO62140510MENSAL026304A1C4",
        barcode: "34191.79001 01043.510047 91020.150008 1 95480000125000",
        student: {
          fullName: "Lucas Silveira Santos",
        },
      },
      {
        id: "inv-tut-demo-004",
        installmentNumber: 1,
        totalInstallments: 6,
        invoiceType: "TUITION",
        amount: "680.00",
        discountAmount: "0.00",
        finalAmount: "680.00",
        dueDate: "2026-10-05",
        status: "PAID",
        student: {
          fullName: "Beatriz Helena Costa",
        },
      },
    ];
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            <Receipt className="h-6 w-6 text-indigo-600" />
            Central de Cobranças & Mensalidades
          </h2>
          <p className="text-sm text-slate-500">
            Acompanhamento de taxas de matrícula, parcelas mensais, geração de PIX e baixas no balcão.
          </p>
        </div>
      </div>

      <Card className="border-slate-200 shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Faturas Emitidas & Histórico</CardTitle>
          <CardDescription>
            Consulte o código de barras, PIX Copia e Cola ou realize a baixa de recebimento
          </CardDescription>
        </CardHeader>
        <CardContent>
          <InvoicesTable initialInvoices={invoiceList} />
        </CardContent>
      </Card>
    </div>
  );
}
