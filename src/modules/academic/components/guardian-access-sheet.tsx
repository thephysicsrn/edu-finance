"use client";

import { useRef } from "react";
import { formatCurrency, formatCPF, formatPhone, formatDate } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Printer,
  ShieldCheck,
  QrCode,
  GraduationCap,
  KeyRound,
  Mail,
  ExternalLink,
  Info,
  Building,
  CheckCircle2,
  X,
} from "lucide-react";

export interface GuardianAccessSheetData {
  enrollmentNumber: string;
  issuedAt: string | Date;
  student: {
    fullName: string;
    cpf?: string | null;
    birthDate?: string;
  };
  guardian: {
    fullName: string;
    cpf: string;
    email: string;
    phone: string;
    relationship: string;
  };
  credentials: {
    portalUrl: string;
    loginEmail: string;
    initialPassword: string;
    qrCodeUrl?: string;
  };
  course: {
    name: string;
    className: string;
    shift: string;
    dueDay: number;
    monthlyPrice: number;
    materialFee?: number;
    totalInstallments: number;
  };
}

interface GuardianAccessSheetProps {
  data: GuardianAccessSheetData;
  onClose?: () => void;
  isModal?: boolean;
}

export function GuardianAccessSheet({
  data,
  onClose,
  isModal = false,
}: GuardianAccessSheetProps) {
  function handlePrint() {
    window.print();
  }

  // Gera o QR code para o portal do responsável
  const portalFullUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/portal-do-responsavel`
      : "https://cursinhopro.com.br/portal-do-responsavel";

  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(
    portalFullUrl
  )}`;

  return (
    <div
      className={
        isModal
          ? "fixed inset-0 z-50 flex items-center justify-center bg-slate-950/75 backdrop-blur-xs p-4 overflow-y-auto"
          : "w-full max-w-4xl mx-auto py-6"
      }
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl overflow-hidden border border-slate-200 print:border-none print:shadow-none print:m-0 print:p-0 print:w-full print:max-w-none">
        {/* Barra Superior de Ações (Oculta na Impressão) */}
        <div className="p-4 bg-slate-900 text-white flex items-center justify-between print:hidden">
          <div className="flex items-center gap-2">
            <KeyRound className="h-5 w-5 text-indigo-400" />
            <span className="font-semibold text-sm">
              Folha de Credenciais de Acesso do Responsável Legal
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              onClick={handlePrint}
              className="bg-indigo-600 hover:bg-indigo-500 text-white gap-2 font-medium"
            >
              <Printer className="h-4 w-4" />
              Imprimir Folha do Pai (A4)
            </Button>
            {onClose && (
              <button
                onClick={onClose}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                <X className="h-5 w-5" />
              </button>
            )}
          </div>
        </div>

        {/* CONTEÚDO IMPRESSO (FOLHA A4 OFICIAL) */}
        <div className="p-8 sm:p-10 space-y-6 text-slate-800 bg-white print:p-6 print:text-black">
          {/* Cabeçalho da Escola */}
          <div className="flex items-start justify-between border-b-2 border-slate-900 pb-5">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-xl bg-slate-900 text-white flex items-center justify-center font-black text-xl">
                CP
              </div>
              <div>
                <h1 className="text-xl font-black text-slate-900 tracking-tight">
                  CURSINHO PRÉ-VESTIBULAR & CONCURSOS
                </h1>
                <p className="text-xs text-slate-500 font-medium">
                  Educação de Alta Performance & Gestão Financeira Transparente
                </p>
                <p className="text-[11px] text-slate-400">
                  CNPJ: 12.345.678/0001-90 ● Secretaria: (11) 98888-7777 ● Central Financeira
                </p>
              </div>
            </div>
            <div className="text-right">
              <Badge variant="outline" className="border-slate-800 font-mono text-xs">
                {data.enrollmentNumber}
              </Badge>
              <p className="text-[11px] text-slate-500 mt-1">
                Emitido em: {formatDate(data.issuedAt)}
              </p>
            </div>
          </div>

          {/* Título do Documento */}
          <div className="text-center py-1">
            <h2 className="text-lg font-black text-slate-900 uppercase tracking-wide">
              Credenciais de Acesso — Portal do Responsável
            </h2>
            <p className="text-xs text-slate-600">
              Documento pessoal e intransferível gerado no ato da matrícula para acompanhamento financeiro e pedagógico
            </p>
          </div>

          {/* 1. Identificação do Aluno e do Responsável */}
          <div className="grid grid-cols-2 gap-4 text-xs">
            {/* Bloco Aluno */}
            <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/70 print:bg-transparent space-y-1">
              <p className="font-bold text-slate-500 uppercase tracking-wider text-[10px]">
                1. Aluno Matriculado
              </p>
              <p className="font-extrabold text-slate-900 text-sm">
                {data.student.fullName}
              </p>
              <p className="text-slate-600">
                <strong>CPF:</strong> {formatCPF(data.student.cpf)}
              </p>
              <p className="text-slate-600">
                <strong>Turma:</strong> {data.course.className} (
                {data.course.shift === "MORNING"
                  ? "Manhã"
                  : data.course.shift === "NIGHT"
                  ? "Noite"
                  : "Tarde"}
                )
              </p>
              <p className="text-slate-600">
                <strong>Curso:</strong> {data.course.name}
              </p>
            </div>

            {/* Bloco Responsável Legal */}
            <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/70 print:bg-transparent space-y-1">
              <p className="font-bold text-slate-500 uppercase tracking-wider text-[10px]">
                2. Responsável Legal / Financeiro
              </p>
              <p className="font-extrabold text-slate-900 text-sm">
                {data.guardian.fullName}
              </p>
              <p className="text-slate-600">
                <strong>CPF:</strong> {formatCPF(data.guardian.cpf)}
              </p>
              <p className="text-slate-600">
                <strong>Parentesco:</strong> {data.guardian.relationship}
              </p>
              <p className="text-slate-600">
                <strong>Telefone:</strong> {formatPhone(data.guardian.phone)}
              </p>
            </div>
          </div>

          {/* 2. CARTÃO DE ACESSO DESTACADO (LOGIN & SENHA) */}
          <div className="p-5 rounded-2xl border-2 border-indigo-600 bg-indigo-50/40 print:bg-transparent print:border-black space-y-4">
            <div className="flex items-center justify-between border-b border-indigo-200 pb-2 print:border-black">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-indigo-700 print:text-black" />
                <span className="font-black text-sm text-indigo-950 uppercase tracking-wider print:text-black">
                  Seus Dados de Acesso ao Portal do Aluno
                </span>
              </div>
              <span className="text-[11px] font-semibold text-indigo-700 print:text-black">
                Acesso Imediato Liberado
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-center">
              {/* Login e Senha */}
              <div className="sm:col-span-2 space-y-3">
                <div className="p-3 bg-white rounded-xl border border-indigo-100 print:border-slate-300">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Link de Acesso (Navegador ou Celular):
                  </span>
                  <p className="font-mono font-bold text-xs text-indigo-900 print:text-black select-all">
                    {portalFullUrl}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-white rounded-xl border border-indigo-100 print:border-slate-300">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      Usuário / E-mail de Login:
                    </span>
                    <p className="font-mono font-bold text-xs text-slate-900 select-all">
                      {data.credentials.loginEmail}
                    </p>
                  </div>

                  <div className="p-3 bg-white rounded-xl border border-indigo-200 bg-amber-50/40 print:bg-transparent print:border-slate-300">
                    <span className="text-[10px] font-bold text-amber-800 uppercase tracking-wider block">
                      Senha Inicial Provisória:
                    </span>
                    <p className="font-mono font-black text-sm text-amber-900 print:text-black select-all">
                      {data.credentials.initialPassword}
                    </p>
                  </div>
                </div>

                <p className="text-[11px] text-slate-500">
                  * Você pode trocar sua senha provisória a qualquer momento após o primeiro login no portal.
                </p>
              </div>

              {/* QR Code de Acesso Rápido com Celular */}
              <div className="text-center p-3 bg-white rounded-xl border border-indigo-100 print:border-slate-300 flex flex-col items-center justify-center">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={qrCodeUrl}
                  alt="QR Code de Acesso ao Portal"
                  className="h-28 w-28 rounded-md"
                />
                <span className="text-[10px] font-bold text-indigo-900 print:text-black mt-1.5 block">
                  Aponte a Câmera do Celular
                </span>
                <span className="text-[9px] text-slate-400 block">
                  Acesso instantâneo sem digitar
                </span>
              </div>
            </div>
          </div>

          {/* 3. O que você consegue fazer no Portal */}
          <div className="space-y-2 text-xs">
            <h3 className="font-bold text-slate-900 uppercase tracking-wider text-[11px] border-b pb-1">
              3. Recursos Disponíveis no seu Portal do Responsável
            </h3>
            <div className="grid grid-cols-3 gap-3 text-[11px]">
              <div className="p-2.5 rounded-lg border border-slate-200">
                <span className="font-bold text-slate-900 block">● Boletos & PIX Copia e Cola</span>
                <span className="text-slate-500">
                  Emita o QR Code PIX de cada mensalidade ou copie o código de barras a qualquer hora.
                </span>
              </div>
              <div className="p-2.5 rounded-lg border border-slate-200">
                <span className="font-bold text-slate-900 block">● Cota de Material Separada</span>
                <span className="text-slate-500">
                  Consulte a discriminação contábil de mensalidades e taxa de material com total clareza.
                </span>
              </div>
              <div className="p-2.5 rounded-lg border border-slate-200">
                <span className="font-bold text-slate-900 block">● Recibos & Comprovantes</span>
                <span className="text-slate-500">
                  Baixe e imprima comprovantes oficiais de quitação para declaração de IRPF.
                </span>
              </div>
            </div>
          </div>

          {/* 4. Resumo Financeiro Contratado */}
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs grid grid-cols-4 gap-2 print:bg-transparent">
            <div>
              <span className="text-slate-400 block font-medium">Vencimento Mensal:</span>
              <span className="font-bold text-slate-900">Todo dia {data.course.dueDay}</span>
            </div>
            <div>
              <span className="text-slate-400 block font-medium">Mensalidade do Curso:</span>
              <span className="font-bold text-slate-900">{formatCurrency(data.course.monthlyPrice)}</span>
            </div>
            <div>
              <span className="text-slate-400 block font-medium">Taxa de Material:</span>
              <span className="font-bold text-amber-700">{formatCurrency(data.course.materialFee || 0)}</span>
            </div>
            <div>
              <span className="text-slate-400 block font-medium">Total de Parcelas:</span>
              <span className="font-bold text-slate-900">{data.course.totalInstallments} parcelas</span>
            </div>
          </div>

          {/* Protocolo de Entrega / Assinaturas */}
          <div className="pt-8 border-t border-slate-300 grid grid-cols-2 gap-8 text-center text-xs">
            <div>
              <div className="border-b border-slate-400 w-4/5 mx-auto mb-1"></div>
              <p className="font-bold text-slate-800">Secretaria de Matrícula</p>
              <p className="text-[10px] text-slate-400">Cursinho Pré-Vestibular</p>
            </div>
            <div>
              <div className="border-b border-slate-400 w-4/5 mx-auto mb-1"></div>
              <p className="font-bold text-slate-800">{data.guardian.fullName}</p>
              <p className="text-[10px] text-slate-400">Responsável Legal (Recebi em mãos as credenciais)</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
