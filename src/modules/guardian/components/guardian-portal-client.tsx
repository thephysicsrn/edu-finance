"use client";

import { useState } from "react";
import { formatCurrency, formatDate, formatCPF, formatPhone } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  QrCode,
  Copy,
  Check,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Receipt,
  FileText,
  CreditCard,
  GraduationCap,
  Download,
  ExternalLink,
  ShieldCheck,
  Search,
  BookOpen,
  X,
  Sparkles,
} from "lucide-react";

export interface GuardianStudentInfo {
  id: string;
  fullName: string;
  cpf?: string | null;
  classes: Array<{
    id: string;
    name: string;
    shift: string;
    courseName: string;
  }>;
}

export interface GuardianInvoice {
  id: string;
  installmentNumber: number;
  totalInstallments: number;
  invoiceType: "TUITION" | "ENROLLMENT_FEE" | "MATERIAL" | "RENEGOTIATION";
  amount: string | number;
  discountAmount?: string | number;
  finalAmount: string | number;
  tuitionAmount?: string | number | null;
  materialAmount?: string | number | null;
  isUnified?: boolean | null;
  unifiedDetails?: string | null;
  dueDate: string;
  status: "PENDING" | "PAID" | "OVERDUE" | "CANCELLED";
  pixCopiaECola?: string | null;
  pixQrCodeUrl?: string | null;
  barcode?: string | null;
  notes?: string | null;
  studentName?: string;
  className?: string;
}

interface GuardianPortalClientProps {
  guardian: {
    id: string;
    fullName: string;
    cpf: string;
    phone: string;
    email: string;
  };
  students: GuardianStudentInfo[];
  invoices: GuardianInvoice[];
}

export function GuardianPortalClient({
  guardian,
  students,
  invoices: initialInvoices,
}: GuardianPortalClientProps) {
  const [filterTab, setFilterTab] = useState<"ALL" | "PENDING" | "PAID">("ALL");
  const [selectedStudentId, setSelectedStudentId] = useState<string>("ALL");
  
  // Modais de Pagamento
  const [activePixModal, setActivePixModal] = useState<GuardianInvoice | null>(null);
  const [activeBoletoModal, setActiveBoletoModal] = useState<GuardianInvoice | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  function copyToClipboard(text: string, key: string) {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2500);
  }

  // Filtros
  const filteredInvoices = initialInvoices.filter((inv) => {
    const matchesStatus =
      filterTab === "ALL" ||
      (filterTab === "PENDING" && (inv.status === "PENDING" || inv.status === "OVERDUE")) ||
      (filterTab === "PAID" && inv.status === "PAID");

    const matchesStudent =
      selectedStudentId === "ALL" ||
      inv.studentName === students.find((s) => s.id === selectedStudentId)?.fullName;

    return matchesStatus && matchesStudent;
  });

  // Métricas
  const pendingInvoices = initialInvoices.filter(
    (i) => i.status === "PENDING" || i.status === "OVERDUE"
  );
  const paidInvoices = initialInvoices.filter((i) => i.status === "PAID");

  const totalPendingAmount = pendingInvoices.reduce(
    (acc, curr) => acc + Number(curr.finalAmount),
    0
  );
  const totalPaidAmount = paidInvoices.reduce(
    (acc, curr) => acc + Number(curr.finalAmount),
    0
  );

  // Próxima mensalidade a vencer (a mais próxima no futuro ou atrasada)
  const nextInvoice = [...pendingInvoices].sort((a, b) =>
    a.dueDate.localeCompare(b.dueDate)
  )[0];

  return (
    <div className="space-y-6">
      {/* Banner de Boas-Vindas do Responsável */}
      <div className="rounded-2xl bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white p-6 shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 opacity-10 pointer-events-none flex items-center pr-6">
          <GraduationCap className="h-64 w-64 text-white" />
        </div>

        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-200 border border-blue-400/30 text-xs font-semibold mb-3">
            <ShieldCheck className="h-3.5 w-3.5 text-blue-300" />
            Portal do Responsável Financeiro
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Olá, {guardian.fullName}!
          </h2>
          <p className="text-sm text-slate-300 mt-1.5 leading-relaxed">
            Acompanhe o cronograma de mensalidades, taxas de material didático e realize pagamentos via PIX ou Boleto com total transparência.
          </p>

          <div className="flex flex-wrap items-center gap-4 mt-4 pt-4 border-t border-white/10 text-xs text-slate-300">
            <div>
              <span className="text-slate-400 block text-[11px]">CPF:</span>
              <span className="font-mono font-medium">{formatCPF(guardian.cpf)}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[11px]">E-mail para Faturas:</span>
              <span className="font-medium">{guardian.email}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[11px]">Telefone de Contato:</span>
              <span className="font-medium">{formatPhone(guardian.phone)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Relação de Aluno(s) & Turmas Frequentadas */}
      <Card className="border-slate-200 shadow-sm">
        <CardHeader className="pb-3 border-b border-slate-100">
          <CardTitle className="text-base text-slate-900 flex items-center gap-2">
            <BookOpen className="h-4 w-4 text-indigo-600" />
            Alunos & Cursinhos Vinculados
          </CardTitle>
          <CardDescription className="text-xs">
            Turmas e preparatórios frequentados pelo seu filho(a) nesta instituição
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="grid gap-3 sm:grid-cols-2">
            {students.map((st) => (
              <div
                key={st.id}
                className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 space-y-2"
              >
                <div className="flex items-center justify-between">
                  <p className="font-bold text-sm text-slate-900">{st.fullName}</p>
                  <Badge variant="outline" className="bg-indigo-50 text-indigo-700 text-xs border-indigo-200">
                    {st.classes.length > 1 ? "Multiturma (2+ Cursos)" : "Aluno Regular"}
                  </Badge>
                </div>

                <div className="space-y-1.5 pt-1">
                  <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                    Turmas Matriculadas:
                  </p>
                  {st.classes.map((c) => (
                    <div
                      key={c.id}
                      className="p-2 rounded-lg bg-white border border-slate-200/80 text-xs flex justify-between items-center"
                    >
                      <div>
                        <p className="font-semibold text-slate-800">{c.name}</p>
                        <p className="text-[11px] text-slate-500">{c.courseName}</p>
                      </div>
                      <Badge variant="secondary" className="text-[10px]">
                        {c.shift === "MORNING" ? "Manhã" : c.shift === "NIGHT" ? "Noite" : "Tarde"}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Destaque: Próxima Mensalidade a Vencer & Cards de Resumo */}
      <div className="grid gap-4 md:grid-cols-3">
        {/* Card Destaque: Próxima Fatura */}
        <div className="md:col-span-2 rounded-2xl bg-gradient-to-br from-indigo-50 via-white to-blue-50/50 border-2 border-indigo-200 p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-indigo-700 font-bold text-sm">
              <Clock className="h-4 w-4" />
              <span>Próxima Mensalidade a Vencer</span>
            </div>
            {nextInvoice && (
              <Badge
                variant={nextInvoice.status === "OVERDUE" ? "destructive" : "warning"}
                className="font-semibold"
              >
                {nextInvoice.status === "OVERDUE" ? "Em Atraso" : "A Vencer"}
              </Badge>
            )}
          </div>

          {nextInvoice ? (
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-1">
              <div>
                <p className="text-3xl font-black text-slate-900">
                  {formatCurrency(Number(nextInvoice.finalAmount))}
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  Vencimento em:{" "}
                  <strong className="text-slate-800 font-semibold">
                    {formatDate(nextInvoice.dueDate)}
                  </strong>
                </p>
                <div className="mt-2 text-xs text-slate-600 space-y-0.5">
                  {nextInvoice.isUnified && (
                    <span className="inline-block px-2 py-0.5 rounded bg-blue-100 text-blue-800 text-[11px] font-semibold mb-1">
                      Boleto Unificado Multiturma (Soma de cursos)
                    </span>
                  )}
                  {Number(nextInvoice.materialAmount || 0) > 0 && (
                    <p className="text-amber-800 font-medium">
                      ● Inclui cota de Material Didático: {formatCurrency(Number(nextInvoice.materialAmount))}
                    </p>
                  )}
                  {nextInvoice.notes && (
                    <p className="text-slate-500 text-[11px] italic">{nextInvoice.notes}</p>
                  )}
                </div>
              </div>

              {/* Botões de Ação Imediata */}
              <div className="flex flex-col sm:flex-row gap-2">
                <Button
                  onClick={() => setActivePixModal(nextInvoice)}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs gap-2 h-10 px-4 shadow-sm"
                >
                  <QrCode className="h-4 w-4" />
                  Pagar via PIX
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setActiveBoletoModal(nextInvoice)}
                  className="border-slate-300 text-slate-700 font-semibold text-xs gap-2 h-10 px-4 hover:bg-white"
                >
                  <FileText className="h-4 w-4 text-slate-500" />
                  Ver Boleto
                </Button>
              </div>
            </div>
          ) : (
            <div className="p-6 text-center text-emerald-700 font-medium text-sm flex items-center justify-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-emerald-600" />
              Parabéns! Todas as mensalidades estão em dia.
            </div>
          )}
        </div>

        {/* Resumo Financeiro */}
        <div className="space-y-3">
          <Card className="border-slate-200">
            <CardHeader className="pb-1 pt-3.5 px-4">
              <CardTitle className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Total em Aberto
              </CardTitle>
            </CardHeader>
            <CardContent className="px-4 pb-3.5">
              <div className="text-xl font-bold text-rose-600">
                {formatCurrency(totalPendingAmount)}
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5">
                {pendingInvoices.length} mensalidade(s) pendente(s)
              </p>
            </CardContent>
          </Card>

          <Card className="border-slate-200">
            <CardHeader className="pb-1 pt-3.5 px-4">
              <CardTitle className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Total já Quitado
              </CardTitle>
            </CardHeader>
            <CardContent className="px-4 pb-3.5">
              <div className="text-xl font-bold text-emerald-600">
                {formatCurrency(totalPaidAmount)}
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5">
                {paidInvoices.length} mensalidade(s) paga(s) com sucesso
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Histórico e Central de Mensalidades do Aluno */}
      <Card className="border-slate-200 shadow-sm overflow-hidden">
        <CardHeader className="border-b border-slate-100 bg-slate-50/50 pb-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <CardTitle className="text-base text-slate-900 flex items-center gap-2">
                <Receipt className="h-5 w-5 text-indigo-600" />
                Histórico & Cronograma de Mensalidades
              </CardTitle>
              <CardDescription className="text-xs">
                Todas as cobranças do cursinho com discriminação detalhada de turmas e taxa de material.
              </CardDescription>
            </div>

            {/* Filtros por Status */}
            <div className="flex items-center gap-1.5 flex-wrap">
              <Button
                size="sm"
                variant={filterTab === "ALL" ? "default" : "outline"}
                onClick={() => setFilterTab("ALL")}
                className="text-xs h-8"
              >
                Todas ({initialInvoices.length})
              </Button>
              <Button
                size="sm"
                variant={filterTab === "PENDING" ? "default" : "outline"}
                onClick={() => setFilterTab("PENDING")}
                className="text-xs h-8 text-amber-700 hover:bg-amber-50"
              >
                A Vencer ({pendingInvoices.length})
              </Button>
              <Button
                size="sm"
                variant={filterTab === "PAID" ? "default" : "outline"}
                onClick={() => setFilterTab("PAID")}
                className="text-xs h-8 text-emerald-700 hover:bg-emerald-50"
              >
                Pagas ({paidInvoices.length})
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {filteredInvoices.length === 0 ? (
            <div className="text-center py-12 text-slate-500 text-sm">
              Nenhuma mensalidade encontrada nesta aba de filtros.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-slate-50">
                  <TableRow>
                    <TableHead>Parcela & Descrição</TableHead>
                    <TableHead className="text-center">Vencimento</TableHead>
                    <TableHead className="text-right">Discriminação</TableHead>
                    <TableHead className="text-right">Valor Total</TableHead>
                    <TableHead className="text-center">Status</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredInvoices.map((inv) => {
                    const isPaid = inv.status === "PAID";
                    return (
                      <TableRow key={inv.id} className="hover:bg-slate-50/70">
                        {/* Parcela & Descrição */}
                        <TableCell>
                          <div className="space-y-0.5">
                            <p className="font-bold text-slate-900 text-xs sm:text-sm">
                              {inv.invoiceType === "ENROLLMENT_FEE" || inv.installmentNumber === 0
                                ? "Taxa de Matrícula"
                                : `Mensalidade ${inv.installmentNumber}/${inv.totalInstallments}`}
                            </p>
                            <p className="text-xs text-slate-500 font-medium">
                              {inv.studentName} {inv.className ? `— ${inv.className}` : ""}
                            </p>
                            {inv.isUnified && (
                              <Badge variant="outline" className="text-[10px] bg-blue-50 text-indigo-700 border-indigo-200">
                                Multiturma Unificado
                              </Badge>
                            )}
                          </div>
                        </TableCell>

                        {/* Vencimento */}
                        <TableCell className="text-center font-mono text-xs">
                          {formatDate(inv.dueDate)}
                        </TableCell>

                        {/* Discriminação (Mensalidade Curso + Material Didático) */}
                        <TableCell className="text-right text-xs">
                          <div className="space-y-0.5 text-slate-600">
                            {inv.tuitionAmount && (
                              <p>
                                <span className="text-slate-400">Curso: </span>
                                <span className="font-medium">{formatCurrency(Number(inv.tuitionAmount))}</span>
                              </p>
                            )}
                            {Number(inv.materialAmount || 0) > 0 && (
                              <p className="text-amber-800 font-medium">
                                <span className="text-amber-700/80">Material: </span>
                                <span>{formatCurrency(Number(inv.materialAmount))}</span>
                              </p>
                            )}
                          </div>
                        </TableCell>

                        {/* Valor Total */}
                        <TableCell className="text-right font-bold text-slate-900 text-sm">
                          {formatCurrency(Number(inv.finalAmount))}
                        </TableCell>

                        {/* Status */}
                        <TableCell className="text-center">
                          <Badge
                            variant={
                              isPaid
                                ? "success"
                                : inv.status === "OVERDUE"
                                ? "destructive"
                                : "warning"
                            }
                          >
                            {isPaid ? "Liquidada" : inv.status === "OVERDUE" ? "Em Atraso" : "A Vencer"}
                          </Badge>
                        </TableCell>

                        {/* Ações */}
                        <TableCell className="text-right">
                          <div className="inline-flex items-center gap-1.5 justify-end">
                            {!isPaid ? (
                              <>
                                <Button
                                  size="sm"
                                  onClick={() => setActivePixModal(inv)}
                                  className="h-8 text-xs gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white"
                                >
                                  <QrCode className="h-3.5 w-3.5" />
                                  PIX
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => setActiveBoletoModal(inv)}
                                  className="h-8 text-xs gap-1.5 text-slate-700 border-slate-300"
                                >
                                  <FileText className="h-3.5 w-3.5 text-slate-500" />
                                  Boleto
                                </Button>
                              </>
                            ) : (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  alert("Comprovante de Pagamento autenticado digitalmente. Recibo disponível para consulta contábil.");
                                }}
                                className="h-8 text-xs gap-1 text-emerald-700 border-emerald-200 bg-emerald-50/50 hover:bg-emerald-100"
                              >
                                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                                Quitado
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* MODAL 1: PIX Copia e Cola & QR Code */}
      {activePixModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="px-5 py-4 bg-emerald-600 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <QrCode className="h-5 w-5" />
                <h3 className="font-bold text-base">Pagamento Instantâneo via PIX</h3>
              </div>
              <button
                onClick={() => setActivePixModal(null)}
                className="text-white/80 hover:text-white p-1 rounded-lg"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6 text-center space-y-4">
              <div>
                <p className="text-xs text-slate-500 font-medium">Valor da Cobrança:</p>
                <p className="text-2xl font-black text-slate-900">
                  {formatCurrency(Number(activePixModal.finalAmount))}
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  Vencimento: {formatDate(activePixModal.dueDate)}
                </p>
                {activePixModal.isUnified && (
                  <Badge variant="outline" className="mt-1 text-[10px] bg-blue-50 text-indigo-700 border-indigo-200">
                    Boleto Unificado Multiturma
                  </Badge>
                )}
              </div>

              {/* QR Code */}
              <div className="flex justify-center p-3 bg-slate-50 rounded-xl border border-slate-200 inline-block mx-auto">
                {activePixModal.pixQrCodeUrl ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    src={activePixModal.pixQrCodeUrl}
                    alt="QR Code PIX"
                    className="h-48 w-48 rounded-lg"
                  />
                ) : (
                  <div className="h-48 w-48 flex items-center justify-center text-xs text-slate-400 bg-slate-100 rounded-lg">
                    QR Code Dinâmico
                  </div>
                )}
              </div>

              {/* Copia e Cola */}
              <div className="space-y-1.5 text-left">
                <label className="text-xs font-semibold text-slate-700">
                  Código PIX Copia e Cola:
                </label>
                <div className="flex gap-2">
                  <Input
                    readOnly
                    value={activePixModal.pixCopiaECola || "00020126580014br.gov.bcb.pix0136cursinho-pix@escola.com.br520400005303986540..."}
                    className="text-xs font-mono bg-slate-50 text-slate-700 h-9"
                  />
                  <Button
                    onClick={() =>
                      copyToClipboard(
                        activePixModal.pixCopiaECola || "00020126580014br.gov.bcb.pix0136cursinho-pix@escola.com.br520400005303986540...",
                        "pix"
                      )
                    }
                    className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs h-9 gap-1 flex-shrink-0"
                  >
                    {copiedKey === "pix" ? (
                      <>
                        <Check className="h-4 w-4" />
                        Copiado!
                      </>
                    ) : (
                      <>
                        <Copy className="h-4 w-4" />
                        Copiar
                      </>
                    )}
                  </Button>
                </div>
              </div>

              <p className="text-[11px] text-slate-400">
                A baixa do pagamento ocorre em segundos de forma 100% automatizada.
              </p>
            </div>

            <div className="px-5 py-3 bg-slate-50 border-t border-slate-200 flex justify-end">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setActivePixModal(null)}
                className="text-xs"
              >
                Fechar
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: Boleto Bancário & Código de Barras */}
      {activeBoletoModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="px-5 py-4 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-indigo-400" />
                <h3 className="font-bold text-base">Boleto Bancário Registrado</h3>
              </div>
              <button
                onClick={() => setActiveBoletoModal(null)}
                className="text-white/80 hover:text-white p-1 rounded-lg"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="text-center">
                <p className="text-xs text-slate-500 font-medium">Valor do Boleto:</p>
                <p className="text-2xl font-black text-slate-900">
                  {formatCurrency(Number(activeBoletoModal.finalAmount))}
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  Vencimento: {formatDate(activeBoletoModal.dueDate)}
                </p>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1 text-xs">
                <p className="text-slate-500 font-medium">Beneficiário:</p>
                <p className="font-bold text-slate-900">CURSINHO PRÉ-VESTIBULAR & CONCURSOS LTDA</p>
                <p className="text-slate-500 font-medium pt-1">Pagador:</p>
                <p className="font-semibold text-slate-800">{guardian.fullName} (CPF: {formatCPF(guardian.cpf)})</p>
              </div>

              {/* Linha Digitável */}
              <div className="space-y-1.5 text-left">
                <label className="text-xs font-semibold text-slate-700">
                  Linha Digitável (Código de Barras):
                </label>
                <div className="flex gap-2">
                  <Input
                    readOnly
                    value={activeBoletoModal.barcode || "34191.79001 01043.510047 91020.150008 1 95480000112500"}
                    className="text-xs font-mono bg-slate-50 text-slate-700 h-9"
                  />
                  <Button
                    onClick={() =>
                      copyToClipboard(
                        activeBoletoModal.barcode || "34191.79001 01043.510047 91020.150008 1 95480000112500",
                        "barcode"
                      )
                    }
                    className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs h-9 gap-1 flex-shrink-0"
                  >
                    {copiedKey === "barcode" ? (
                      <>
                        <Check className="h-4 w-4" />
                        Copiado!
                      </>
                    ) : (
                      <>
                        <Copy className="h-4 w-4" />
                        Copiar
                      </>
                    )}
                  </Button>
                </div>
              </div>

              <p className="text-[11px] text-slate-400 text-center">
                Pague em qualquer agência bancária, internet banking ou casas lotéricas até a data de vencimento.
              </p>
            </div>

            <div className="px-5 py-3 bg-slate-50 border-t border-slate-200 flex justify-end">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setActiveBoletoModal(null)}
                className="text-xs"
              >
                Fechar
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
