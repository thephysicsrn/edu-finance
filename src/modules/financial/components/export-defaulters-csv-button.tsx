"use client";

import { Button } from "@/components/ui/button";
import { FileSpreadsheet } from "lucide-react";

interface DefaulterExportItem {
  studentId: string;
  studentName: string;
  className: string;
  guardianName: string;
  guardianPhone: string | null;
  guardianEmail: string | null;
  overdueInvoicesCount: number;
  totalOverdueAmount: number;
  oldestDueDate: string;
  maxDaysOverdue: number;
}

interface ExportDefaultersCsvButtonProps {
  defaulters: DefaulterExportItem[];
}

export function ExportDefaultersCsvButton({
  defaulters,
}: ExportDefaultersCsvButtonProps) {
  function handleExportCsv() {
    if (!defaulters || defaulters.length === 0) {
      alert("Não há dados de inadimplência para exportar.");
      return;
    }

    const headers = [
      "Aluno",
      "Turma",
      "Responsável Financeiro",
      "Telefone WhatsApp",
      "E-mail",
      "Faturas Vencidas",
      "Total Devido (R$)",
      "Dias de Atraso",
      "Vencimento Mais Antigo",
    ];

    const rows = defaulters.map((item) => [
      `"${item.studentName.replace(/"/g, '""')}"`,
      `"${(item.className || "").replace(/"/g, '""')}"`,
      `"${(item.guardianName || "").replace(/"/g, '""')}"`,
      `"${(item.guardianPhone || "").replace(/"/g, '""')}"`,
      `"${(item.guardianEmail || "").replace(/"/g, '""')}"`,
      item.overdueInvoicesCount,
      item.totalOverdueAmount.toFixed(2),
      item.maxDaysOverdue,
      `"${item.oldestDueDate}"`,
    ]);

    const csvContent =
      "\uFEFF" +
      [headers.join(";"), ...rows.map((e) => e.join(";"))].join("\r\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `cobranca_inadimplentes_${new Date().toISOString().split("T")[0]}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  return (
    <Button
      variant="outline"
      onClick={handleExportCsv}
      disabled={defaulters.length === 0}
      className="gap-2 cursor-pointer border-slate-200 hover:bg-slate-50 text-slate-700"
    >
      <FileSpreadsheet className="h-4 w-4 text-emerald-600" />
      Exportar Cobrança (CSV)
    </Button>
  );
}
