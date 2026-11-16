"use client";

import { useState } from "react";
import { formatCurrency, formatDate, formatCPF } from "@/lib/utils";
import { BarcodeSvg } from "./barcode-svg";
import { QrCode, Copy, Check, Scissors } from "lucide-react";

export interface CarneSlipData {
  invoiceId: string;
  installmentNumber: number;
  totalInstallments: number;
  dueDate: string;
  amount: number;
  discountAmount: number;
  finalAmount: number;
  tuitionAmount?: number | null;
  materialAmount?: number | null;
  status: string;
  gateway?: string | null;
  gatewayPaymentUrl?: string | null;
  pixCopiaECola?: string | null;
  pixQrCodeUrl?: string | null;
  barcode?: string | null;
  student: {
    fullName: string;
    cpf?: string | null;
    enrollmentNumber: string;
  };
  guardian?: {
    fullName: string;
    cpf?: string | null;
    phone?: string | null;
  } | null;
  course: {
    name: string;
    className: string;
    shift: string;
  };
}

interface CarneSlipProps {
  slip: CarneSlipData;
}

export function CarneSlip({ slip }: CarneSlipProps) {
  const [copiedPix, setCopiedPix] = useState(false);

  // Fallbacks de PIX e Código de Barras
  const pixCopiaECola =
    slip.pixCopiaECola ||
    `00020126580014br.gov.bcb.pix0136pix-edufinance-mensalidade-${slip.installmentNumber}5204000053039865407${slip.finalAmount.toFixed(
      2
    )}5802BR5915Edu.Finance6009SaoPaulo62070503***6304`;

  const pixQrCodeUrl =
    slip.pixQrCodeUrl ||
    `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(
      pixCopiaECola
    )}`;

  const barcode =
    slip.barcode ||
    `23793.38128 60000.${String(slip.installmentNumber).padStart(2, "0")}1234 01000.654321 1 ${Math.floor(
      slip.finalAmount * 100
    )}`;

  function handleCopyPix() {
    navigator.clipboard.writeText(pixCopiaECola);
    setCopiedPix(true);
    setTimeout(() => setCopiedPix(false), 2500);
  }

  const shiftLabel =
    slip.course.shift === "MORNING"
      ? "Manhã"
      : slip.course.shift === "NIGHT"
      ? "Noite"
      : slip.course.shift === "AFTERNOON"
      ? "Tarde"
      : "Integral";

  return (
    <div className="relative bg-white border border-slate-300 rounded-lg p-3 my-3 shadow-2xs break-inside-avoid print:shadow-none print:border-slate-400 print:my-2 print:p-2 text-slate-900">
      <div className="grid grid-cols-12 gap-3 items-stretch">
        {/* ========================================================= */}
        {/* LADO ESQUERDO: CANHOTO DA ESCOLA / CONTROLE INTERNO (35%) */}
        {/* ========================================================= */}
        <div className="col-span-4 border-r border-dashed border-slate-300 pr-3 flex flex-col justify-between text-[11px] space-y-1.5 bg-slate-50/60 p-2.5 rounded-l-md print:bg-white print:border-slate-400">
          <div>
            <div className="flex items-center justify-between pb-1 border-b border-slate-200">
              <span className="font-bold tracking-tight text-slate-800 text-[10px] uppercase">
                Canhoto de Controle
              </span>
              <span className="font-mono font-bold text-indigo-700 bg-indigo-50 px-1.5 py-0.5 rounded text-[10px]">
                {slip.installmentNumber.toString().padStart(2, "0")}/
                {slip.totalInstallments.toString().padStart(2, "0")}
              </span>
            </div>

            <div className="space-y-1 pt-1.5">
              <div>
                <span className="text-[9px] text-slate-500 uppercase block">Aluno(a):</span>
                <strong className="text-slate-900 leading-tight block truncate">
                  {slip.student.fullName}
                </strong>
              </div>

              <div className="flex items-center justify-between text-[10px]">
                <span className="text-slate-500">Matrícula:</span>
                <span className="font-mono font-semibold">{slip.student.enrollmentNumber}</span>
              </div>

              <div className="flex items-center justify-between text-[10px]">
                <span className="text-slate-500">Turma:</span>
                <span className="truncate max-w-[130px] font-medium">{slip.course.className}</span>
              </div>

              <div className="p-1.5 bg-white rounded border border-slate-200 space-y-0.5 mt-1">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-slate-500 font-semibold">Vencimento:</span>
                  <span className="font-bold text-rose-700 font-mono">
                    {formatDate(slip.dueDate)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-slate-500">Valor Cobrado:</span>
                  <span className="font-bold text-slate-900 font-mono">
                    {formatCurrency(slip.finalAmount)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Campo de Baixa na Secretaria */}
          <div className="pt-2 border-t border-slate-200 text-[9px] text-slate-500 space-y-1">
            <div className="flex justify-between">
              <span>Data Pgto: ____/____/2026</span>
            </div>
            <div>
              <span>Rubrica Secretaria: _________________</span>
            </div>
          </div>
        </div>

        {/* ========================================================= */}
        {/* LADO DIREITO: FICHA DE COMPENSAÇÃO / RECIBO DO PAGADOR (65%) */}
        {/* ========================================================= */}
        <div className="col-span-8 flex flex-col justify-between pl-1 text-[11px] space-y-2">
          {/* Topo do Boleto / Carnê */}
          <div className="flex items-center justify-between border-b-2 border-slate-900 pb-1">
            <div className="flex items-center gap-2">
              <span className="font-black text-sm text-slate-900 tracking-tight">
                Edu<span className="text-indigo-600">.Finance</span>
              </span>
              <span className="text-slate-400">|</span>
              <span className="text-[10px] font-bold text-slate-700 uppercase tracking-wider">
                Carnê de Mensalidade Escolar
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold text-slate-800">
                Parcela {slip.installmentNumber.toString().padStart(2, "0")} de{" "}
                {slip.totalInstallments.toString().padStart(2, "0")}
              </span>
            </div>
          </div>

          {/* Linha Digitável Formatada */}
          <div className="font-mono text-[10px] sm:text-[11px] font-semibold text-center tracking-wider text-slate-800 bg-slate-100/80 py-0.5 rounded border border-slate-200 select-all">
            {barcode}
          </div>

          {/* Grid Principal de Informações Bancárias */}
          <div className="grid grid-cols-4 gap-1.5 border border-slate-200 rounded p-1.5 bg-slate-50/40 text-[10px]">
            <div className="col-span-3">
              <span className="text-[9px] text-slate-400 block uppercase">Local de Pagamento:</span>
              <span className="font-medium text-slate-800">
                Pagável em qualquer banco, casa lotérica, aplicativo ou via PIX Instantâneo
              </span>
            </div>
            <div className="border-l border-slate-200 pl-1.5 bg-rose-50/60 p-1 rounded">
              <span className="text-[9px] text-rose-800 font-bold block uppercase">Vencimento:</span>
              <span className="font-bold text-rose-700 text-xs font-mono">
                {formatDate(slip.dueDate)}
              </span>
            </div>

            <div className="col-span-3 pt-1 border-t border-slate-200">
              <span className="text-[9px] text-slate-400 block uppercase">Beneficiário:</span>
              <span className="font-medium text-slate-900 truncate block">
                Edu.Finance Cursinho Preparatório • CNPJ: 12.345.678/0001-90
              </span>
            </div>
            <div className="border-l border-slate-200 pl-1.5 pt-1 border-t border-slate-200 bg-emerald-50/60 p-1 rounded">
              <span className="text-[9px] text-emerald-800 font-bold block uppercase">Valor a Pagar:</span>
              <span className="font-black text-emerald-700 text-xs font-mono">
                {formatCurrency(slip.finalAmount)}
              </span>
            </div>

            <div className="col-span-4 pt-1 border-t border-slate-200 flex flex-wrap items-center justify-between gap-1 text-[9px] text-slate-600">
              <span>
                <strong>Curso:</strong> {slip.course.name} ({shiftLabel})
              </span>
              <span>
                <strong>Mensalidade:</strong> {formatCurrency(slip.tuitionAmount || (slip.amount - (slip.materialAmount || 0)))}
              </span>
              {(slip.materialAmount || 0) > 0 && (
                <span className="text-amber-800 font-medium">
                  <strong>Taxa de Material:</strong> {formatCurrency(slip.materialAmount || 0)}
                </span>
              )}
              {(slip.discountAmount || 0) > 0 && (
                <span className="text-emerald-700 font-medium">
                  <strong>Bolsa/Desconto:</strong> -{formatCurrency(slip.discountAmount)}
                </span>
              )}
            </div>
          </div>

          {/* Dados do Pagador (Responsável / Aluno) */}
          <div className="p-1.5 border border-slate-200 rounded text-[10px] space-y-0.5">
            <div className="flex items-center justify-between">
              <span>
                <strong>Pagador:</strong> {slip.guardian?.fullName || slip.student.fullName}
              </span>
              <span className="font-mono text-slate-500">
                CPF: {formatCPF(slip.guardian?.cpf || slip.student.cpf)}
              </span>
            </div>
            <div className="text-[9px] text-slate-500 flex items-center justify-between">
              <span>
                <strong>Estudante:</strong> {slip.student.fullName} (Matrícula: {slip.student.enrollmentNumber})
              </span>
              <span>Não receber após 60 dias de vencido</span>
            </div>
          </div>

          {/* Seção Integrada: QR Code PIX + Código de Barras */}
          <div className="grid grid-cols-12 gap-2 items-center pt-1 border-t border-slate-200">
            {/* Bloco PIX QR Code (Escanear com Celular) */}
            <div className="col-span-3 flex flex-col items-center justify-center p-1 bg-slate-50 rounded border border-slate-200 text-center">
              <img
                src={pixQrCodeUrl}
                alt="QR Code PIX"
                className="w-16 h-16 sm:w-18 sm:h-18 object-contain"
                crossOrigin="anonymous"
              />
              <span className="text-[8px] font-bold text-slate-700 flex items-center gap-0.5 mt-0.5">
                <QrCode className="h-2.5 w-2.5 text-indigo-600" />
                PIX QR CODE
              </span>
            </div>

            {/* Código de Barras + Copia e Cola */}
            <div className="col-span-9 space-y-1.5 pl-1">
              <BarcodeSvg value={barcode} height={38} className="w-full" />

              <div className="flex items-center justify-between gap-1 pt-0.5 print:hidden">
                <span className="text-[9px] text-slate-500 truncate max-w-[200px] font-mono select-all">
                  {pixCopiaECola.slice(0, 38)}...
                </span>
                <button
                  type="button"
                  onClick={handleCopyPix}
                  className="inline-flex items-center gap-1 text-[9px] font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 px-2 py-0.5 rounded border border-indigo-200 cursor-pointer transition-colors"
                >
                  {copiedPix ? (
                    <>
                      <Check className="h-2.5 w-2.5 text-emerald-600" />
                      PIX Copiado!
                    </>
                  ) : (
                    <>
                      <Copy className="h-2.5 w-2.5" />
                      Copiar Código PIX
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Linha Tracejada de Destaque / Corte */}
      <div className="relative my-2 text-center select-none print:my-1">
        <div className="absolute inset-0 flex items-center" aria-hidden="true">
          <div className="w-full border-t border-dashed border-slate-400" />
        </div>
        <div className="relative flex justify-center">
          <span className="bg-white px-3 text-[9px] text-slate-400 flex items-center gap-1">
            <Scissors className="h-2.5 w-2.5" />
            Destaque aqui
          </span>
        </div>
      </div>
    </div>
  );
}
