"use client";

import { useRef } from "react";
import { formatCurrency, formatCPF, formatPhone, formatDate } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Printer, Download, GraduationCap, X, CheckCircle2 } from "lucide-react";

export interface EnrollmentReceiptData {
  enrollmentNumber: string;
  enrollmentDate: string | Date;
  status: string;
  student: {
    fullName: string;
    cpf?: string | null;
    birthDate: string;
    email?: string | null;
    phone?: string | null;
    address?: string | null;
  };
  guardian?: {
    fullName: string;
    cpf: string;
    relationship: string;
    phone: string;
    email: string;
    address?: string | null;
  } | null;
  course: {
    name: string;
    durationMonths: number;
    basePrice: string | number;
  };
  classItem: {
    name: string;
    shift: string;
    room: string;
    startDate: string;
    endDate: string;
  };
  financial: {
    enrollmentFee: number;
    isFeePaid: boolean;
    materialFee?: number;
    monthlyPrice: number;
    discountPercent: number;
    discountAmount: number;
    dueDay: number;
    totalInstallments: number;
  };
}

interface EnrollmentReceiptProps {
  data: EnrollmentReceiptData;
  onClose?: () => void;
  isModal?: boolean;
}

export function EnrollmentReceipt({ data, onClose, isModal = false }: EnrollmentReceiptProps) {
  const receiptRef = useRef<HTMLDivElement>(null);

  function handlePrint() {
    window.print();
  }

  return (
    <div className={isModal ? "fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm p-4 overflow-y-auto" : "w-full max-w-4xl mx-auto py-6"}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl overflow-hidden border border-slate-200 print:border-none print:shadow-none print:m-0 print:p-0 print:w-full print:max-w-none">
        
        {/* Barra de Ações (Oculta na Impressão) */}
        <div className="p-4 bg-slate-900 text-white flex items-center justify-between print:hidden">
          <div className="flex items-center gap-2">
            <GraduationCap className="h-5 w-5 text-indigo-400" />
            <span className="font-semibold text-sm">Comprovante de Matrícula Oficial</span>
          </div>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              onClick={handlePrint}
              className="bg-indigo-600 hover:bg-indigo-500 text-white gap-2 font-medium"
            >
              <Printer className="h-4 w-4" />
              Imprimir Comprovante (A4)
            </Button>
            {onClose && (
              <Button
                size="sm"
                variant="ghost"
                onClick={onClose}
                className="text-slate-400 hover:text-white"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>

        {/* ÁREA IMPRIMÍVEL DO COMPROVANTE (DOCUMENTO A4) */}
        <div
          ref={receiptRef}
          className="p-8 sm:p-12 space-y-6 text-slate-800 bg-white print:p-6 print:space-y-4 print:text-black font-sans"
        >
          {/* Cabeçalho Institucional */}
          <div className="flex items-start justify-between pb-4 border-b-2 border-slate-900">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold text-xl print:border print:border-black">
                CP
              </div>
              <div>
                <h1 className="text-xl font-extrabold uppercase tracking-tight text-slate-900">
                  Cursinho Pro Preparatórios
                </h1>
                <p className="text-xs text-slate-500 print:text-black">
                  Instituição de Ensino e Preparação para Vestibulares e Concursos
                </p>
                <p className="text-[11px] text-slate-400 print:text-slate-600">
                  CNPJ: 12.345.678/0001-90 • São Paulo - SP • Atendimento: (11) 3456-7890
                </p>
              </div>
            </div>

            <div className="text-right">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                Comprovante Nº
              </span>
              <p className="font-mono font-extrabold text-base text-indigo-700 print:text-black">
                {data.enrollmentNumber}
              </p>
              <p className="text-[11px] text-slate-500">
                Emitido em: {formatDate(data.enrollmentDate)}
              </p>
            </div>
          </div>

          {/* Título do Documento */}
          <div className="text-center py-2 bg-slate-50 rounded-lg border border-slate-200 print:bg-slate-100">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900">
              Comprovante de Matrícula & Termo de Adesão Escolar (Ano Letivo 2026)
            </h2>
          </div>

          {/* 1. Dados do Aluno */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 border-b pb-1">
              1. Identificação do Aluno
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
              <div>
                <span className="text-slate-400 block font-medium">Nome Completo:</span>
                <span className="font-bold text-slate-900 text-sm">{data.student.fullName}</span>
              </div>
              <div>
                <span className="text-slate-400 block font-medium">CPF do Aluno:</span>
                <span className="font-mono font-medium">{formatCPF(data.student.cpf)}</span>
              </div>
              <div>
                <span className="text-slate-400 block font-medium">Data de Nascimento:</span>
                <span>{formatDate(data.student.birthDate)}</span>
              </div>
              <div>
                <span className="text-slate-400 block font-medium">Telefone / WhatsApp:</span>
                <span>{formatPhone(data.student.phone)}</span>
              </div>
              <div className="col-span-2">
                <span className="text-slate-400 block font-medium">E-mail:</span>
                <span>{data.student.email || "Não informado"}</span>
              </div>
            </div>
          </div>

          {/* 2. Responsável Legal / Financeiro */}
          {data.guardian && (
            <div className="space-y-2">
              <div className="flex items-center justify-between border-b pb-1">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  2. Responsável Legal / Financeiro
                </h3>
                {(data.guardian.relationship.includes("Próprio") || (data.student.cpf && data.guardian.cpf === data.student.cpf)) && (
                  <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded print:text-black print:border-black">
                    Aluno Maior de Idade (Titular e Responsável Financeiro)
                  </span>
                )}
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div>
                  <span className="text-slate-400 block font-medium">Nome do Responsável:</span>
                  <span className="font-bold text-slate-900">{data.guardian.fullName}</span>
                </div>
                <div>
                  <span className="text-slate-400 block font-medium">CPF:</span>
                  <span className="font-mono font-medium">{formatCPF(data.guardian.cpf)}</span>
                </div>
                <div>
                  <span className="text-slate-400 block font-medium">Grau de Parentesco / Vínculo:</span>
                  <span className="font-semibold text-slate-800">{data.guardian.relationship}</span>
                </div>
                <div>
                  <span className="text-slate-400 block font-medium">Telefone Contato:</span>
                  <span>{formatPhone(data.guardian.phone)}</span>
                </div>
              </div>
            </div>
          )}

          {/* 3. Dados Acadêmicos da Turma */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 border-b pb-1">
              3. Dados Acadêmicos & Horários
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs p-3 rounded-lg bg-slate-50 border border-slate-200 print:bg-transparent">
              <div>
                <span className="text-slate-400 block font-medium">Curso:</span>
                <span className="font-bold text-slate-900">{data.course.name}</span>
              </div>
              <div>
                <span className="text-slate-400 block font-medium">Turma:</span>
                <span className="font-bold text-slate-900">{data.classItem.name}</span>
              </div>
              <div>
                <span className="text-slate-400 block font-medium">Turno & Sala:</span>
                <span>
                  {data.classItem.shift === "MORNING"
                    ? "Manhã"
                    : data.classItem.shift === "NIGHT"
                    ? "Noite"
                    : "Tarde"}{" "}
                  ({data.classItem.room})
                </span>
              </div>
              <div>
                <span className="text-slate-400 block font-medium">Duração:</span>
                <span>{data.course.durationMonths} meses letivos</span>
              </div>
            </div>
          </div>

          {/* 4. Quadro Resumo Financeiro & Mensalidades */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 border-b pb-1">
              4. Condições Comerciais & Plano de Pagamento
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="p-2.5 rounded border border-slate-200">
                <span className="text-slate-400 block font-medium">Taxa de Matrícula:</span>
                <span className="font-bold text-slate-900 text-sm">
                  {formatCurrency(data.financial.enrollmentFee)}
                </span>
                <div className="mt-0.5">
                  <span className={`text-[10px] font-bold ${data.financial.isFeePaid ? "text-emerald-700" : "text-amber-700"}`}>
                    ● {data.financial.isFeePaid ? "PAGA / CONFIRMADA" : "PENDENTE DE PAGAMENTO"}
                  </span>
                </div>
              </div>

              <div className="p-2.5 rounded border border-slate-200">
                <span className="text-slate-400 block font-medium">Taxa de Material Didático:</span>
                <span className="font-bold text-amber-700 print:text-black text-sm">
                  {formatCurrency(data.financial.materialFee || 0)}
                </span>
                <span className="text-[10px] text-slate-500 block">
                  Apostilas & Livros (separado contabilmente)
                </span>
              </div>

              <div className="p-2.5 rounded border border-slate-200">
                <span className="text-slate-400 block font-medium">Mensalidade Líquida:</span>
                <span className="font-bold text-indigo-700 print:text-black text-sm">
                  {formatCurrency(data.financial.monthlyPrice)}
                </span>
                <span className="text-[10px] text-slate-500 block">
                  ({data.financial.totalInstallments} parcelas mensais)
                </span>
              </div>

              <div className="p-2.5 rounded border border-slate-200">
                <span className="text-slate-400 block font-medium">Bolsa / Desconto:</span>
                <span className="font-bold text-slate-900">
                  {data.financial.discountPercent > 0
                    ? `${data.financial.discountPercent}% (${formatCurrency(data.financial.discountAmount)})`
                    : "Sem desconto"}
                </span>
              </div>

              <div className="p-2.5 rounded border border-slate-200">
                <span className="text-slate-400 block font-medium">Vencimento Mensal:</span>
                <span className="font-bold text-slate-900">
                  Todo dia {data.financial.dueDay} de cada mês
                </span>
              </div>
            </div>
          </div>

          {/* Termo e Declaração Legal */}
          <div className="text-[10px] text-slate-500 print:text-slate-700 leading-relaxed border-t pt-3 space-y-1">
            <p>
              <strong>Declaração de Ciência:</strong> O aluno e seu responsável declaram estar cientes e de acordo com as normas pedagógicas e o regulamento interno da instituição de ensino, comprometendo-se a manter a frequência mínima de 75% das aulas para emissão de certificado. As parcelas mensais deverão ser quitadas até a data estipulada via PIX, Boleto ou no balcão da secretaria.
            </p>
          </div>

          {/* Campo de Assinaturas */}
          <div className="pt-8 grid grid-cols-2 gap-8 text-center text-xs">
            <div className="space-y-1">
              <div className="border-t border-slate-900 pt-1" />
              <p className="font-bold text-slate-900">
                {data.guardian?.relationship.includes("Próprio") || (data.student.cpf && data.guardian?.cpf === data.student.cpf)
                  ? data.student.fullName
                  : data.guardian?.fullName || data.student.fullName}
              </p>
              <p className="text-[10px] text-slate-400">
                {data.guardian?.relationship.includes("Próprio") || (data.student.cpf && data.guardian?.cpf === data.student.cpf)
                  ? "Assinatura do Aluno (Titular e Responsável Financeiro)"
                  : "Assinatura do Responsável Legal / Financeiro"}
              </p>
            </div>

            <div className="space-y-1">
              <div className="border-t border-slate-900 pt-1" />
              <p className="font-bold text-slate-900">Secretaria & Coordenação Pedagógica</p>
              <p className="text-[10px] text-slate-400">Cursinho Pro Preparatórios</p>
            </div>
          </div>

          {/* Rodapé com Código de Autenticidade */}
          <div className="pt-4 border-t text-center text-[9px] text-slate-400 flex items-center justify-between">
            <span>Autenticação Digital: SHA256-{data.enrollmentNumber}-VALID</span>
            <span>Documento emitido pelo Sistema de Gestão Cursinho Pro</span>
          </div>
        </div>

      </div>
    </div>
  );
}

