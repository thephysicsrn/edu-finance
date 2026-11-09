"use client";

import { useState } from "react";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Receipt,
  QrCode,
  CheckCircle2,
  Copy,
  Check,
  Search,
  Loader2,
  CreditCard,
  X,
  Wifi,
  Smartphone,
  ShieldCheck,
  Usb,
  Cpu,
} from "lucide-react";
import { recordPaymentAction } from "../actions/payment.actions";
import {
  sendToPosTerminalAction,
  completePosPaymentAction,
} from "../actions/pos.actions";
import { UsbPinPadService } from "../services/usb-pinpad.service";

export interface InvoiceItem {
  id: string;
  installmentNumber: number;
  totalInstallments: number;
  amount: string;
  discountAmount: string;
  finalAmount: string;
  dueDate: string;
  status: "PENDING" | "PAID" | "OVERDUE" | "CANCELLED";
  invoiceType?: "ENROLLMENT_FEE" | "TUITION" | "MATERIAL" | "RENEGOTIATION";
  pixCopiaECola?: string | null;
  pixQrCodeUrl?: string | null;
  barcode?: string | null;
  student?: {
    fullName: string;
  } | null;
}

interface InvoicesTableProps {
  initialInvoices: InvoiceItem[];
}

export function InvoicesTable({ initialInvoices }: InvoicesTableProps) {
  const [invoicesList, setInvoicesList] = useState<InvoiceItem[]>(initialInvoices);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");

  // Modais
  const [activePixModal, setActivePixModal] = useState<InvoiceItem | null>(null);
  const [activePaymentModal, setActivePaymentModal] = useState<InvoiceItem | null>(null);
  
  // Modal de Maquininha (Suporta tanto Wi-Fi quanto USB!)
  const [activePosModal, setActivePosModal] = useState<{
    invoice: InvoiceItem;
    connectionType: "CLOUD_WIFI" | "USB_PINPAD"; // Wi-Fi ou Cabo USB
    step: "CONFIG" | "WAITING" | "APPROVED";
    intentId?: string;
    terminalName: string;
    usbPortName: string;
    paymentType: "credit_card" | "debit_card";
    installments: number;
    cardBrand?: string;
    nsu?: string;
  } | null>(null);

  const [copied, setCopied] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Formulário de Baixa Manual
  const [paymentForm, setPaymentForm] = useState({
    amountPaid: 0,
    penalty: 0,
    interest: 0,
    discount: 0,
    paymentMethod: "PIX" as "PIX" | "BOLETO" | "CREDIT_CARD" | "DEBIT_CARD" | "CASH",
  });

  const filteredInvoices = invoicesList.filter((inv) => {
    const matchesSearch =
      (inv.student?.fullName || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      inv.id.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "ALL" ||
      (statusFilter === "PAID" && inv.status === "PAID") ||
      (statusFilter === "PENDING" && inv.status === "PENDING") ||
      (statusFilter === "OVERDUE" && inv.status === "OVERDUE") ||
      (statusFilter === "ENROLLMENT_FEE" && inv.invoiceType === "ENROLLMENT_FEE");

    return matchesSearch && matchesStatus;
  });

  function openPosModal(inv: InvoiceItem) {
    setActivePosModal({
      invoice: inv,
      connectionType: "CLOUD_WIFI",
      step: "CONFIG",
      terminalName: "Maquininha Balcão Principal (SmartPOS)",
      usbPortName: "COM3 (PinPad Gertec/Ingenico)",
      paymentType: "credit_card",
      installments: 1,
    });
  }

  // Disparar cobrança para a Maquininha (Wi-Fi ou USB)
  async function handleSendToCardMachine() {
    if (!activePosModal) return;
    setIsSubmitting(true);

    try {
      if (activePosModal.connectionType === "USB_PINPAD") {
        // Envio via USB PinPad
        setActivePosModal((prev) =>
          prev ? { ...prev, step: "WAITING" } : null
        );

        const usbResult = await UsbPinPadService.requestUsbCharge({
          amount: Number(activePosModal.invoice.finalAmount),
          paymentType: activePosModal.paymentType,
          installments: activePosModal.installments,
          invoiceId: activePosModal.invoice.id,
        });

        if (usbResult.success) {
          // Registra a baixa no backend
          const res = await completePosPaymentAction({
            invoiceId: activePosModal.invoice.id,
            paymentType: activePosModal.paymentType,
            installments: activePosModal.installments,
            cardBrand: usbResult.cardBrand || "MASTERCARD",
            nsu: usbResult.nsu,
            authorizationCode: usbResult.authorizationCode,
          });

          if (res.success) {
            setActivePosModal((prev) =>
              prev
                ? {
                    ...prev,
                    step: "APPROVED",
                    cardBrand: usbResult.cardBrand,
                    nsu: usbResult.nsu,
                  }
                : null
            );

            setInvoicesList((prev) =>
              prev.map((i) =>
                i.id === activePosModal.invoice.id ? { ...i, status: "PAID" } : i
              )
            );

            setTimeout(() => {
              setActivePosModal(null);
            }, 2500);
          }
        }
      } else {
        // Envio via Wi-Fi Cloud (SmartPOS)
        const res = await sendToPosTerminalAction({
          invoiceId: activePosModal.invoice.id,
          paymentType: activePosModal.paymentType,
          installments: activePosModal.installments,
        });

        if (res.success && res.intent) {
          setActivePosModal((prev) =>
            prev
              ? {
                  ...prev,
                  step: "WAITING",
                  intentId: res.intent.intentId,
                  terminalName: res.intent.terminalName,
                }
              : null
          );
        } else {
          alert("Erro ao acionar maquininha: " + res.error);
        }
      }
    } catch (e: any) {
      alert("Falha de comunicação com a maquininha: " + e?.message);
    } finally {
      setIsSubmitting(false);
    }
  }

  // Simular aprovação instantânea
  async function handleConfirmPosApproval(cardBrand: string = "MASTERCARD") {
    if (!activePosModal) return;
    setIsSubmitting(true);

    try {
      const res = await completePosPaymentAction({
        invoiceId: activePosModal.invoice.id,
        paymentType: activePosModal.paymentType,
        installments: activePosModal.installments,
        cardBrand,
      });

      if (res.success && res.data) {
        setActivePosModal((prev) =>
          prev
            ? {
                ...prev,
                step: "APPROVED",
                cardBrand: res.data.cardBrand || cardBrand,
                nsu: res.data.nsu || "NSU-CONFIRMADO",
              }
            : null
        );

        setInvoicesList((prev) =>
          prev.map((i) =>
            i.id === activePosModal.invoice.id ? { ...i, status: "PAID" } : i
          )
        );

        setTimeout(() => {
          setActivePosModal(null);
        }, 2500);
      }
    } catch (err: any) {
      alert("Erro ao confirmar transação: " + err?.message);
    } finally {
      setIsSubmitting(false);
    }
  }

  function openPaymentModal(inv: InvoiceItem) {
    setActivePaymentModal(inv);
    setPaymentForm({
      amountPaid: Number(inv.finalAmount),
      penalty: 0,
      interest: 0,
      discount: 0,
      paymentMethod: "PIX",
    });
  }

  async function handleConfirmPayment(e: React.FormEvent) {
    e.preventDefault();
    if (!activePaymentModal) return;
    setIsSubmitting(true);

    try {
      const res = await recordPaymentAction({
        invoiceId: activePaymentModal.id,
        amountPaid: paymentForm.amountPaid,
        penaltyAmount: paymentForm.penalty,
        interestAmount: paymentForm.interest,
        discountGiven: paymentForm.discount,
        paymentMethod: paymentForm.paymentMethod,
        transactionReference: `MANUAL_${Date.now()}`,
      });

      if (res.success) {
        setInvoicesList((prev) =>
          prev.map((i) =>
            i.id === activePaymentModal.id ? { ...i, status: "PAID" } : i
          )
        );
        setActivePaymentModal(null);
      } else {
        alert("Erro ao registrar pagamento: " + res.error);
      }
    } catch (err: any) {
      alert("Falha de rede: " + err?.message);
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleCopy(text: string) {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="space-y-4">
      {/* Barra de Filtros e Busca */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="w-full sm:w-80 relative">
          <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <Input
            placeholder="Buscar por aluno ou código da fatura..."
            className="pl-9 h-9"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-1.5 flex-wrap">
          <Button
            size="sm"
            variant={statusFilter === "ALL" ? "default" : "outline"}
            onClick={() => setStatusFilter("ALL")}
            className="text-xs h-8"
          >
            Todas
          </Button>
          <Button
            size="sm"
            variant={statusFilter === "ENROLLMENT_FEE" ? "default" : "outline"}
            onClick={() => setStatusFilter("ENROLLMENT_FEE")}
            className="text-xs h-8"
          >
            Taxas de Matrícula
          </Button>
          <Button
            size="sm"
            variant={statusFilter === "PENDING" ? "default" : "outline"}
            onClick={() => setStatusFilter("PENDING")}
            className="text-xs h-8 text-amber-700 hover:bg-amber-50"
          >
            A Vencer
          </Button>
          <Button
            size="sm"
            variant={statusFilter === "OVERDUE" ? "default" : "outline"}
            onClick={() => setStatusFilter("OVERDUE")}
            className="text-xs h-8 text-rose-700 hover:bg-rose-50"
          >
            Vencidas (Overdue)
          </Button>
          <Button
            size="sm"
            variant={statusFilter === "PAID" ? "default" : "outline"}
            onClick={() => setStatusFilter("PAID")}
            className="text-xs h-8 text-emerald-700 hover:bg-emerald-50"
          >
            Pagas
          </Button>
        </div>
      </div>

      {/* Tabela de Faturas */}
      {filteredInvoices.length === 0 ? (
        <div className="text-center py-12 text-slate-500 text-sm">
          Nenhuma fatura encontrada para os critérios selecionados.
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Aluno / Titular</TableHead>
              <TableHead>Tipo & Parcela</TableHead>
              <TableHead className="text-center">Vencimento</TableHead>
              <TableHead className="text-right">Valor Líquido</TableHead>
              <TableHead className="text-center">Status</TableHead>
              <TableHead className="text-right">Cobrança, Maquininha & USB</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredInvoices.map((inv) => (
              <TableRow key={inv.id}>
                <TableCell>
                  <p className="font-semibold text-slate-900">
                    {inv.student?.fullName || "Aluno"}
                  </p>
                  <p className="text-xs text-slate-400 font-mono">ID: {inv.id.slice(0, 8)}...</p>
                </TableCell>

                <TableCell>
                  {inv.invoiceType === "ENROLLMENT_FEE" || inv.installmentNumber === 0 ? (
                    <Badge variant="outline" className="bg-indigo-50 text-indigo-700 border-indigo-200 text-[11px]">
                      Taxa de Matrícula
                    </Badge>
                  ) : (
                    <span className="text-xs font-mono text-slate-600">
                      Mensalidade ({inv.installmentNumber}/{inv.totalInstallments})
                    </span>
                  )}
                </TableCell>

                <TableCell className="text-center text-xs font-mono">
                  {formatDate(inv.dueDate)}
                </TableCell>

                <TableCell className="text-right font-bold text-slate-900">
                  {formatCurrency(inv.finalAmount)}
                </TableCell>

                <TableCell className="text-center">
                  <Badge
                    variant={
                      inv.status === "PAID"
                        ? "success"
                        : inv.status === "OVERDUE"
                        ? "destructive"
                        : "secondary"
                    }
                  >
                    {inv.status === "PAID"
                      ? "Liquidada"
                      : inv.status === "OVERDUE"
                      ? "Em Atraso"
                      : "Pendente"}
                  </Badge>
                </TableCell>

                <TableCell className="text-right">
                  <div className="inline-flex items-center gap-1.5">
                    {/* Botão Ver PIX / Boleto */}
                    <Button
                      size="sm"
                      variant="outline"
                      className="gap-1 text-xs h-8"
                      onClick={() => setActivePixModal(inv)}
                      title="Ver QR Code PIX e Boleto"
                    >
                      <QrCode className="h-3.5 w-3.5 text-indigo-600" />
                      PIX
                    </Button>

                    {/* Botão Maquininha (Wi-Fi ou USB) */}
                    {inv.status !== "PAID" && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="gap-1.5 text-xs h-8 border-indigo-200 bg-indigo-50/50 hover:bg-indigo-100 text-indigo-700"
                        onClick={() => openPosModal(inv)}
                        title="Cobrar na Maquininha (Wi-Fi ou USB)"
                      >
                        <CreditCard className="h-3.5 w-3.5 text-indigo-600" />
                        Maquininha / USB
                      </Button>
                    )}

                    {/* Botão Baixa Manual */}
                    {inv.status !== "PAID" && (
                      <Button
                        size="sm"
                        className="gap-1 text-xs h-8 bg-emerald-600 hover:bg-emerald-700 text-white"
                        onClick={() => openPaymentModal(inv)}
                        title="Baixa Manual no Balcão"
                      >
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        Baixa
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      {/* MODAL MULTI-CONEXÃO: MAQUININHA WI-FI (CLOUD) OU CABO USB (PINPAD) */}
      {activePosModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 border border-slate-200 space-y-6">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="h-9 w-9 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center">
                  {activePosModal.connectionType === "USB_PINPAD" ? (
                    <Usb className="h-5 w-5 text-indigo-600" />
                  ) : (
                    <CreditCard className="h-5 w-5 text-indigo-600" />
                  )}
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">
                    {activePosModal.connectionType === "USB_PINPAD"
                      ? "PinPad USB (Conexão por Cabo)"
                      : "Maquininha SmartPOS (Wi-Fi / 4G)"}
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    {activePosModal.connectionType === "USB_PINPAD"
                      ? "Driver Serial / TEF Local Gertec, Ingenico, Verifone"
                      : "Comunicação em Nuvem sem fios"}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setActivePosModal(null)}
                className="text-slate-400 hover:text-slate-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* SELETOR DE CONEXÃO: WI-FI vs CABO USB */}
            {activePosModal.step === "CONFIG" && (
              <div className="flex rounded-lg bg-slate-100 p-1">
                <button
                  type="button"
                  onClick={() =>
                    setActivePosModal({ ...activePosModal, connectionType: "CLOUD_WIFI" })
                  }
                  className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-all flex items-center justify-center gap-1.5 ${
                    activePosModal.connectionType === "CLOUD_WIFI"
                      ? "bg-white text-indigo-700 shadow-sm"
                      : "text-slate-500 hover:text-slate-900"
                  }`}
                >
                  <Wifi className="h-3.5 w-3.5" />
                  Sem Fios (Wi-Fi)
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setActivePosModal({ ...activePosModal, connectionType: "USB_PINPAD" })
                  }
                  className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-all flex items-center justify-center gap-1.5 ${
                    activePosModal.connectionType === "USB_PINPAD"
                      ? "bg-white text-indigo-700 shadow-sm"
                      : "text-slate-500 hover:text-slate-900"
                  }`}
                >
                  <Usb className="h-3.5 w-3.5 text-indigo-600" />
                  Cabo USB (PinPad)
                </button>
              </div>
            )}

            {/* PASSO 1: CONFIGURAR PARCELAMENTO E TERMINAL */}
            {activePosModal.step === "CONFIG" && (
              <div className="space-y-4">
                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-500">Aluno:</span>
                    <span className="text-xs font-semibold text-slate-900">
                      {activePosModal.invoice.student?.fullName || "Aluno"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-500">Valor a Cobrar:</span>
                    <span className="text-lg font-extrabold text-indigo-600">
                      {formatCurrency(activePosModal.invoice.finalAmount)}
                    </span>
                  </div>
                </div>

                <div className="space-y-3">
                  {/* Seleção do Dispositivo USB vs Wi-Fi */}
                  {activePosModal.connectionType === "USB_PINPAD" ? (
                    <div>
                      <Label className="text-xs flex items-center gap-1.5">
                        <Cpu className="h-3.5 w-3.5 text-indigo-600" />
                        Porta USB Detectada (PinPad Físico)
                      </Label>
                      <select
                        className="w-full h-9 rounded-md border border-slate-200 bg-white px-3 text-xs focus:ring-1 focus:ring-indigo-500 mt-1"
                        value={activePosModal.usbPortName}
                        onChange={(e) =>
                          setActivePosModal({
                            ...activePosModal,
                            usbPortName: e.target.value,
                          })
                        }
                      >
                        <option value="COM3 (Gertec PPC920 / PPC930)">
                          COM3: Gertec PPC920 / PPC930 USB
                        </option>
                        <option value="COM4 (Ingenico iPP320 / Lane 3000)">
                          COM4: Ingenico iPP320 / Lane 3000 USB
                        </option>
                        <option value="TEF_LOCAL_PORT (SiTef / Cappta 8090)">
                          Agente TEF Local (SiTef / Cappta porta 8090)
                        </option>
                      </select>
                    </div>
                  ) : (
                    <div>
                      <Label className="text-xs flex items-center gap-1.5">
                        <Wifi className="h-3.5 w-3.5 text-indigo-600" />
                        Terminal Wi-Fi (Nuvem)
                      </Label>
                      <select
                        className="w-full h-9 rounded-md border border-slate-200 bg-white px-3 text-xs focus:ring-1 focus:ring-indigo-500 mt-1"
                        value={activePosModal.terminalName}
                        onChange={(e) =>
                          setActivePosModal({
                            ...activePosModal,
                            terminalName: e.target.value,
                          })
                        }
                      >
                        <option value="Maquininha Balcão Principal (SmartPOS)">
                          Maquininha Balcão Principal (Point Smart Android)
                        </option>
                        <option value="Maquininha Secretaria 2 (Stone Smart)">
                          Maquininha Secretaria 2 (Stone Smart P2)
                        </option>
                      </select>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label className="text-xs">Função</Label>
                      <select
                        className="w-full h-9 rounded-md border border-slate-200 bg-white px-3 text-xs focus:ring-1 focus:ring-indigo-500 mt-1"
                        value={activePosModal.paymentType}
                        onChange={(e) =>
                          setActivePosModal({
                            ...activePosModal,
                            paymentType: e.target.value as any,
                          })
                        }
                      >
                        <option value="credit_card">Crédito</option>
                        <option value="debit_card">Débito (À Vista)</option>
                      </select>
                    </div>

                    <div>
                      <Label className="text-xs">Parcelamento</Label>
                      <select
                        className="w-full h-9 rounded-md border border-slate-200 bg-white px-3 text-xs focus:ring-1 focus:ring-indigo-500 mt-1"
                        disabled={activePosModal.paymentType === "debit_card"}
                        value={activePosModal.installments}
                        onChange={(e) =>
                          setActivePosModal({
                            ...activePosModal,
                            installments: Number(e.target.value),
                          })
                        }
                      >
                        <option value={1}>1x à vista</option>
                        <option value={2}>2x sem juros</option>
                        <option value={3}>3x sem juros</option>
                        <option value={4}>4x sem juros</option>
                        <option value={5}>5x sem juros</option>
                        <option value={6}>6x sem juros</option>
                        <option value={10}>10x sem juros</option>
                      </select>
                    </div>
                  </div>
                </div>

                <Button
                  className="w-full gap-2 bg-indigo-600 hover:bg-indigo-700 text-white mt-2"
                  onClick={handleSendToCardMachine}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Acionando Dispositivo...
                    </>
                  ) : activePosModal.connectionType === "USB_PINPAD" ? (
                    <>
                      <Usb className="h-4 w-4" />
                      Enviar Cobrança para o PinPad USB
                    </>
                  ) : (
                    <>
                      <Wifi className="h-4 w-4" />
                      Enviar Cobrança para a Maquininha Wi-Fi
                    </>
                  )}
                </Button>
              </div>
            )}

            {/* PASSO 2: AGUARDANDO CARTÃO */}
            {activePosModal.step === "WAITING" && (
              <div className="space-y-6 text-center py-4">
                <div className="relative mx-auto w-20 h-20 flex items-center justify-center">
                  <div className="absolute inset-0 rounded-full bg-indigo-100 animate-ping opacity-75" />
                  <div className="relative h-16 w-16 rounded-full bg-indigo-600 text-white flex items-center justify-center shadow-lg">
                    {activePosModal.connectionType === "USB_PINPAD" ? (
                      <Usb className="h-8 w-8 text-white" />
                    ) : (
                      <Smartphone className="h-8 w-8" />
                    )}
                  </div>
                </div>

                <div className="space-y-1">
                  <p className="font-bold text-slate-900 text-base">
                    {activePosModal.connectionType === "USB_PINPAD"
                      ? "Aguardando Leitura no PinPad USB..."
                      : "Aguardando Aprovação no Terminal..."}
                  </p>
                  <p className="text-xs text-slate-500">
                    O valor de{" "}
                    <strong className="text-slate-900">
                      {formatCurrency(activePosModal.invoice.finalAmount)}
                    </strong>{" "}
                    foi enviado para o dispositivo conectado.
                  </p>
                  <p className="text-[11px] text-indigo-600 font-medium pt-2">
                    ● O cliente deve aproximar ou inserir o cartão no leitor e digitar a senha.
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-100 space-y-2">
                  <p className="text-[10px] text-slate-400">Ambiente de Demonstração / Teste:</p>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1 text-xs border-emerald-300 bg-emerald-50 text-emerald-800 hover:bg-emerald-100 gap-1.5"
                      onClick={() => handleConfirmPosApproval("MASTERCARD")}
                      disabled={isSubmitting}
                    >
                      <Check className="h-3.5 w-3.5 text-emerald-600" />
                      Simular Cartão Aprovado (USB)
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* PASSO 3: APROVADO COM SUCESSO! */}
            {activePosModal.step === "APPROVED" && (
              <div className="text-center py-6 space-y-4 animate-in zoom-in-95 duration-200">
                <div className="h-16 w-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-md">
                  <ShieldCheck className="h-10 w-10" />
                </div>
                <div className="space-y-1">
                  <h4 className="font-extrabold text-xl text-emerald-600">
                    Transação Aprovada!
                  </h4>
                  <p className="text-xs text-slate-600">
                    {activePosModal.connectionType === "USB_PINPAD"
                      ? "Leitura do PinPad USB concluída com sucesso."
                      : "Pagamento liquidado na maquininha sem fios."}
                  </p>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs text-left space-y-1 font-mono">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Bandeira:</span>
                    <span className="font-bold">{activePosModal.cardBrand || "MASTERCARD"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">NSU / Comprovante:</span>
                    <span className="font-bold">{activePosModal.nsu}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Valor Autorizado:</span>
                    <span className="font-bold text-emerald-600">
                      {formatCurrency(activePosModal.invoice.finalAmount)}
                    </span>
                  </div>
                </div>

                <p className="text-[11px] text-slate-400">
                  Fechando e atualizando faturas...
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* MODAL PIX & BOLETO */}
      {activePixModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                <QrCode className="h-5 w-5 text-indigo-600" />
                Dados de Cobrança (PIX & Boleto)
              </h3>
              <button
                onClick={() => setActivePixModal(null)}
                className="text-slate-400 hover:text-slate-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-4 bg-slate-50 rounded-xl flex flex-col items-center gap-3">
              {activePixModal.pixQrCodeUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={activePixModal.pixQrCodeUrl}
                  alt="QR Code PIX"
                  className="w-44 h-44 rounded bg-white p-1 border border-slate-200"
                />
              ) : (
                <div className="w-44 h-44 rounded bg-slate-200 flex items-center justify-center text-xs text-slate-500">
                  QR Code gerado
                </div>
              )}

              <div className="text-center">
                <span className="text-xs text-slate-500">Valor da Fatura:</span>
                <p className="text-xl font-extrabold text-slate-900">
                  {formatCurrency(activePixModal.finalAmount)}
                </p>
              </div>

              {activePixModal.pixCopiaECola && (
                <div className="w-full space-y-1">
                  <Label className="text-xs text-slate-500">PIX Copia e Cola:</Label>
                  <div className="flex gap-2">
                    <Input
                      readOnly
                      value={activePixModal.pixCopiaECola}
                      className="font-mono text-[11px] bg-white select-all h-8"
                    />
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-8 text-xs"
                      onClick={() => handleCopy(activePixModal.pixCopiaECola!)}
                    >
                      {copied ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
                    </Button>
                  </div>
                </div>
              )}
            </div>

            <Button
              className="w-full"
              variant="outline"
              onClick={() => setActivePixModal(null)}
            >
              Fechar
            </Button>
          </div>
        </div>
      )}

      {/* MODAL BAIXA MANUAL NO BALCÃO */}
      {activePaymentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm p-4">
          <form
            onSubmit={handleConfirmPayment}
            className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 border border-slate-200 space-y-4"
          >
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div>
                <h3 className="font-bold text-slate-900 text-base">
                  Registrar Pagamento / Baixa
                </h3>
                <p className="text-xs text-slate-500">
                  {activePaymentModal.student?.fullName}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setActivePaymentModal(null)}
                className="text-slate-400 hover:text-slate-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <Label>Método de Pagamento</Label>
                <select
                  className="w-full h-9 rounded-md border border-slate-200 bg-white px-3 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 mt-1"
                  value={paymentForm.paymentMethod}
                  onChange={(e) =>
                    setPaymentForm({
                      ...paymentForm,
                      paymentMethod: e.target.value as any,
                    })
                  }
                >
                  <option value="PIX">PIX (Comprovante / Transferência)</option>
                  <option value="CREDIT_CARD">Cartão de Crédito</option>
                  <option value="DEBIT_CARD">Cartão de Débito</option>
                  <option value="CASH">Dinheiro em Espécie</option>
                  <option value="BOLETO">Boleto Bancário</option>
                </select>
              </div>

              <div>
                <Label>Valor Base Recebido (R$)</Label>
                <Input
                  type="number"
                  step="0.01"
                  required
                  value={paymentForm.amountPaid}
                  onChange={(e) =>
                    setPaymentForm({ ...paymentForm, amountPaid: Number(e.target.value) })
                  }
                  className="mt-1 font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Multa por Atraso (R$)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    min={0}
                    value={paymentForm.penalty}
                    onChange={(e) =>
                      setPaymentForm({ ...paymentForm, penalty: Number(e.target.value) })
                    }
                    className="mt-1 text-xs"
                  />
                </div>
                <div>
                  <Label>Desconto Pontualidade (R$)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    min={0}
                    value={paymentForm.discount}
                    onChange={(e) =>
                      setPaymentForm({ ...paymentForm, discount: Number(e.target.value) })
                    }
                    className="mt-1 text-xs"
                  />
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-lg flex items-center justify-between text-xs font-semibold">
                <span>Total a Liquidar no Caixa:</span>
                <span className="text-base text-emerald-600 font-extrabold">
                  {formatCurrency(
                    paymentForm.amountPaid + paymentForm.penalty - paymentForm.discount
                  )}
                </span>
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={() => setActivePaymentModal(null)}
                disabled={isSubmitting}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white gap-2"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Liquidando...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="h-4 w-4" />
                    Confirmar Baixa
                  </>
                )}
              </Button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
