"use client";

import { useState } from "react";
import Link from "next/link";
import { formatCurrency, formatDate, formatCPF, formatPhone } from "@/lib/utils";
import { CarneSlip, CarneSlipData } from "./carne-slip";
import { Button } from "@/components/ui/button";
import {
  Printer,
  ArrowLeft,
  BookOpen,
  QrCode,
  ShieldCheck,
  CheckCircle2,
  Calendar,
  FileText,
} from "lucide-react";
import { EduFinanceLogo } from "@/components/shared/logo";

export interface CarneDocumentData {
  enrollmentNumber: string;
  enrollmentDate: string;
  status: string;
  student: {
    fullName: string;
    cpf?: string | null;
    birthDate: string;
    phone?: string | null;
    email?: string | null;
  };
  guardian?: {
    fullName: string;
    cpf?: string | null;
    relationship?: string;
    phone?: string | null;
    email?: string | null;
    address?: string | null;
  } | null;
  course: {
    name: string;
    className: string;
    shift: string;
  };
  invoices: CarneSlipData[];
}

interface CarneDocumentProps {
  data: CarneDocumentData;
}

export function CarneDocument({ data }: CarneDocumentProps) {
  function handlePrint() {
    window.print();
  }

  const activeInvoices = data.invoices.filter((i) => i.status !== "CANCELLED");
  const totalAmount = activeInvoices.reduce((acc, i) => acc + i.finalAmount, 0);

  return (
    <div className="min-h-screen bg-slate-100 py-6 px-4 sm:px-6 lg:px-8 print:p-0 print:bg-white text-slate-900 select-none">
      {/* ============================================================== */}
      {/* BARRA SUPERIOR DE AÇÕES (OCULTA NA IMPRESSÃO)                   */}
      {/* ============================================================== */}
      <div className="max-w-4xl mx-auto mb-6 print:hidden">
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link href="/academic/students">
              <Button variant="outline" size="sm" className="gap-1.5 text-xs text-slate-700">
                <ArrowLeft className="h-3.5 w-3.5" />
                Voltar
              </Button>
            </Link>
            <div>
              <h1 className="text-base font-bold text-slate-900">
                Carnê de Mensalidades do Aluno
              </h1>
              <p className="text-xs text-slate-500">
                {data.student.fullName} • Matrícula {data.enrollmentNumber} ({activeInvoices.length} lâminas de pagamento)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              onClick={handlePrint}
              className="gap-2 bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm text-xs"
            >
              <Printer className="h-4 w-4" />
              Imprimir Carnê Completo
            </Button>
          </div>
        </div>
      </div>

      {/* ============================================================== */}
      {/* CORPO DO DOCUMENTO (FORMATADO PARA FOLHA A4)                    */}
      {/* ============================================================== */}
      <div className="max-w-4xl mx-auto space-y-4 print:max-w-none print:space-y-2">
        {/* ============================================================ */}
        {/* FOLHA DE ROSTO / CAPA DO CARNÊ                               */}
        {/* ============================================================ */}
        <div className="bg-white border border-slate-300 rounded-xl p-6 shadow-sm print:shadow-none print:border-slate-400 print:rounded-none break-inside-avoid">
          {/* Cabeçalho Institucional */}
          <div className="flex items-center justify-between pb-4 border-b-2 border-slate-900">
            <div className="flex items-center gap-3">
              <EduFinanceLogo size="md" variant="full" />
              <div className="pl-3 border-l border-slate-200">
                <h2 className="text-sm font-bold text-slate-900">
                  CALL CURSOS ISOLADOS
                </h2>
                <p className="text-[10px] text-slate-500">
                  Educação • Ideias • Pessoas para um mundo melhor
                </p>
              </div>
            </div>

            <div className="text-right">
              <span className="inline-block bg-slate-900 text-white text-[11px] font-bold px-3 py-1 rounded">
                CARNÊ DE PAGAMENTO {new Date().getFullYear()}
              </span>
              <p className="text-[10px] font-mono text-slate-500 mt-1">
                Matrícula: {data.enrollmentNumber}
              </p>
            </div>
          </div>

          {/* Dados do Contrato e Beneficiário */}
          <div className="grid grid-cols-2 gap-4 my-4 text-xs">
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase block">
                Dados do Aluno:
              </span>
              <p className="font-semibold text-slate-900 text-sm">{data.student.fullName}</p>
              <p className="text-slate-600 font-mono text-[11px]">CPF: {formatCPF(data.student.cpf)}</p>
              <p className="text-slate-600">
                <strong>Turma:</strong> {data.course.className} ({data.course.name})
              </p>
            </div>

            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase block">
                Responsável Financeiro:
              </span>
              <p className="font-semibold text-slate-900 text-sm">
                {data.guardian?.fullName || data.student.fullName}
              </p>
              <p className="text-slate-600 font-mono text-[11px]">
                CPF: {formatCPF(data.guardian?.cpf || data.student.cpf)}
              </p>
              <p className="text-slate-600">
                <strong>Contato:</strong> {formatPhone(data.guardian?.phone || data.student.phone)}
              </p>
            </div>
          </div>

          {/* Orientações aos Pais */}
          <div className="p-3.5 bg-blue-50/70 border border-blue-200 rounded-lg text-xs space-y-1 text-slate-800">
            <div className="flex items-center gap-2 font-bold text-blue-950">
              <ShieldCheck className="h-4 w-4 text-blue-600" />
              <span>Instruções Importantes para Quitação:</span>
            </div>
            <ul className="list-disc list-inside text-[11px] space-y-0.5 text-slate-700 pl-1">
              <li>
                <strong>PIX Instantâneo:</strong> Aponte a câmera do aplicativo do seu banco para o <strong>QR Code PIX</strong> em cada lâmina para compensação em menos de 10 segundos.
              </li>
              <li>
                <strong>Boleto Bancário / Casa Lotérica:</strong> Apresente a lâmina correspondente em qualquer agência, lotérica ou copie a linha digitável no seu Internet Banking.
              </li>
              <li>
                Após a data de vencimento, incidirá multa de 2% e juros moratórios de 1% ao mês.
              </li>
            </ul>
          </div>

          {/* Cronograma Resumido de Parcelas */}
          <div className="mt-4 pt-3 border-t border-slate-200">
            <h3 className="text-xs font-bold text-slate-800 mb-2 flex items-center justify-between">
              <span>Cronograma Geral de Vencimentos:</span>
              <span className="text-indigo-700 font-bold">
                Total do Período: {formatCurrency(totalAmount)}
              </span>
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-[10px]">
              {activeInvoices.map((inv) => (
                <div
                  key={inv.invoiceId}
                  className={`p-2 rounded border text-center font-mono ${
                    inv.status === "PAID"
                      ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                      : "bg-slate-50 border-slate-200 text-slate-800"
                  }`}
                >
                  <span className="block font-bold text-slate-600 text-[9px]">
                    Parcela {inv.installmentNumber}/{inv.totalInstallments}
                  </span>
                  <span className="block font-semibold text-rose-700">
                    {formatDate(inv.dueDate)}
                  </span>
                  <span className="block font-bold text-slate-900 mt-0.5">
                    {formatCurrency(inv.finalAmount)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ============================================================ */}
        {/* LÂMINAS INDIVIDUAIS DE PAGAMENTO                             */}
        {/* ============================================================ */}
        <div className="space-y-2">
          {activeInvoices.map((slip) => (
            <CarneSlip key={slip.invoiceId} slip={slip} />
          ))}
        </div>
      </div>
    </div>
  );
}
