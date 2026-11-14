"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createEnrollmentAction } from "../actions/enrollment.actions";
import { recordPaymentAction } from "@/modules/financial/actions/payment.actions";
import { completePosPaymentAction } from "@/modules/financial/actions/pos.actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";
import {
  UserCheck,
  AlertCircle,
  Loader2,
  CheckCircle2,
  QrCode,
  Copy,
  Check,
  CreditCard,
  Wifi,
  Smartphone,
  ShieldCheck,
  Printer,
  FileText,
  KeyRound,
} from "lucide-react";
import { EnrollmentReceipt, EnrollmentReceiptData } from "./enrollment-receipt";
import {
  GuardianAccessSheet,
  GuardianAccessSheetData,
} from "./guardian-access-sheet";

interface ClassOption {
  id: string;
  name: string;
  shift: string;
  capacity: number;
  course: {
    name: string;
    durationMonths: number;
    basePrice: string;
  };
}

interface EnrollmentFormProps {
  availableClasses: ClassOption[];
}

export function EnrollmentForm({ availableClasses }: EnrollmentFormProps) {
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [copiedPix, setCopiedPix] = useState(false);
  const [simulatingPayment, setSimulatingPayment] = useState(false);

  // Modal de Comprovante de Matrícula
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [createdReceiptData, setCreatedReceiptData] = useState<EnrollmentReceiptData | null>(null);

  // Modal da Folha de Acesso e Login do Responsável
  const [showGuardianAccessModal, setShowGuardianAccessModal] = useState(false);
  const [createdGuardianAccessData, setCreatedGuardianAccessData] = useState<GuardianAccessSheetData | null>(null);

  // Modal pós-matrícula com dados do PIX e Maquininha
  const [feeChargeModal, setFeeChargeModal] = useState<{
    invoiceId: string;
    amount: number;
    pixCopiaECola: string;
    pixQrCodeUrl: string;
    barcode: string;
    enrollmentNumber: string;
    isPaid?: boolean;
  } | null>(null);

  // Aba ativa no modal pós-matrícula: 'PIX' ou 'POS'
  const [paymentTab, setPaymentTab] = useState<"PIX" | "POS">("PIX");
  const [posStep, setPosStep] = useState<"CONFIG" | "WAITING" | "APPROVED">("CONFIG");
  const [posType, setPosType] = useState<"credit_card" | "debit_card">("credit_card");
  const [posInstallments, setPosInstallments] = useState(1);
  const [posResult, setPosResult] = useState<{ cardBrand: string; nsu: string } | null>(null);

  // Estado do formulário
  const [selectedClassId, setSelectedClassId] = useState<string>(
    availableClasses[0]?.id || ""
  );
  const [enrollmentFee, setEnrollmentFee] = useState<number>(250);
  const [materialFee, setMaterialFee] = useState<number>(300);
  const [materialPaymentMode, setMaterialPaymentMode] = useState<
    "INSTALLMENT_WITH_TUITION" | "SEPARATE_AT_ENROLLMENT" | "INSTALLMENT_SEPARATE"
  >("INSTALLMENT_WITH_TUITION");
  const [unifyWithExistingInvoices, setUnifyWithExistingInvoices] = useState<boolean>(true);
  const [discountPercent, setDiscountPercent] = useState<number>(0);
  const [dueDay, setDueDay] = useState<number>(10);
  const [firstDate, setFirstDate] = useState<string>(
    new Date().toISOString().split("T")[0]
  );

  const [student, setStudent] = useState({
    fullName: "",
    cpf: "",
    birthDate: "2008-01-01",
    email: "",
    phone: "",
    address: "",
  });

  // Aluno maior de 18 anos como o próprio responsável financeiro
  const [isSelfResponsible, setIsSelfResponsible] = useState<boolean>(false);

  const [guardian, setGuardian] = useState({
    fullName: "",
    cpf: "",
    email: "",
    phone: "",
    relationship: "Mãe",
    address: "",
  });

  // Cálculo da idade a partir da data de nascimento
  function calculateAge(birthDateString: string): number {
    if (!birthDateString) return 0;
    const parts = birthDateString.split("-");
    if (parts.length !== 3) return 0;
    const birthDate = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  }

  const studentAge = calculateAge(student.birthDate);
  const isAdult = studentAge >= 18;

  // Atualização dos dados do aluno com sincronização opcional para o responsável
  function handleStudentChange(field: keyof typeof student, value: string) {
    setStudent((prev) => {
      const updated = { ...prev, [field]: value };
      if (isSelfResponsible) {
        setGuardian((g) => ({
          ...g,
          fullName: field === "fullName" ? value : updated.fullName,
          cpf: field === "cpf" ? value : updated.cpf,
          email: field === "email" ? value : updated.email,
          phone: field === "phone" ? value : updated.phone,
          address: field === "address" ? value : updated.address,
          relationship: "Próprio Aluno",
        }));
      }
      return updated;
    });
  }

  // Alterna se o aluno maior de 18 anos é o responsável
  function toggleSelfResponsible(checked: boolean) {
    setIsSelfResponsible(checked);
    if (checked) {
      setGuardian({
        fullName: student.fullName,
        cpf: student.cpf,
        email: student.email,
        phone: student.phone,
        relationship: "Próprio Aluno",
        address: student.address,
      });
    } else {
      setGuardian((prev) => ({
        ...prev,
        relationship: prev.relationship === "Próprio Aluno" ? "Mãe" : prev.relationship,
      }));
    }
  }

  // Atualização da data de nascimento com verificação de maioridade
  function handleBirthDateChange(newBirthDate: string) {
    const age = calculateAge(newBirthDate);
    const adult = age >= 18;
    setStudent((prev) => ({ ...prev, birthDate: newBirthDate }));
    if (!adult && isSelfResponsible) {
      toggleSelfResponsible(false);
    }
  }

  const selectedClass = availableClasses.find((c) => c.id === selectedClassId);
  const basePrice = selectedClass ? Number(selectedClass.course.basePrice) : 0;
  const durationMonths = selectedClass ? selectedClass.course.durationMonths : 1;
  const discountAmount = Number(((basePrice * discountPercent) / 100).toFixed(2));
  const finalPrice = Number((basePrice - discountAmount).toFixed(2));
  const totalTuitionContract = Number((finalPrice * durationMonths).toFixed(2));

  // Cota mensal de material se parcelado junto com as mensalidades
  const monthlyMaterial = materialPaymentMode === "INSTALLMENT_WITH_TUITION" && materialFee > 0
    ? Number((materialFee / durationMonths).toFixed(2))
    : 0;
  const finalCombinedMonthlyInvoice = Number((finalPrice + monthlyMaterial).toFixed(2));
  const grandTotal = Number((totalTuitionContract + enrollmentFee + materialFee).toFixed(2));

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFeedback(null);
    setIsPending(true);

    const effectiveGuardian = isSelfResponsible
      ? {
          fullName: student.fullName,
          cpf: student.cpf,
          email: student.email,
          phone: student.phone,
          relationship: "Próprio Aluno",
          address: student.address,
        }
      : guardian;

    try {
      const response = await createEnrollmentAction({
        classId: selectedClassId,
        enrollmentFee,
        materialFee,
        materialInstallments: durationMonths,
        materialPaymentMode,
        unifyWithExistingInvoices,
        discountPercentage: discountPercent,
        discountReason: discountPercent > 0 ? "Bolsa de Estudos / Convênio" : undefined,
        dueDay,
        firstInstallmentDate: firstDate,
        isSelfResponsible,
        guardian: effectiveGuardian,
        student,
      });

      if (response.success) {
        setFeedback({
          type: "success",
          text: response.message,
        });

        // Monta os dados do Comprovante de Matrícula para impressão
        const receipt: EnrollmentReceiptData = {
          enrollmentNumber: response.enrollmentNumber,
          enrollmentDate: new Date(),
          status: "ACTIVE",
          student: {
            fullName: student.fullName,
            cpf: student.cpf,
            birthDate: student.birthDate,
            email: student.email,
            phone: student.phone,
            address: student.address,
          },
          guardian: {
            fullName: effectiveGuardian.fullName,
            cpf: effectiveGuardian.cpf,
            relationship: isSelfResponsible
              ? "Próprio Aluno (Maior de 18 anos)"
              : effectiveGuardian.relationship,
            phone: effectiveGuardian.phone,
            email: effectiveGuardian.email,
            address: effectiveGuardian.address,
          },
          course: {
            name: selectedClass?.course.name || "Curso Geral",
            durationMonths,
            basePrice,
          },
          classItem: {
            name: selectedClass?.name || "Turma Geral",
            shift: selectedClass?.shift || "MORNING",
            room: "Auditório / Sala 01",
            startDate: "2026-02-01",
            endDate: "2026-11-30",
          },
          financial: {
            enrollmentFee,
            isFeePaid: enrollmentFee === 0,
            materialFee,
            monthlyPrice: finalPrice,
            discountPercent,
            discountAmount,
            dueDay,
            totalInstallments: durationMonths,
          },
        };
        setCreatedReceiptData(receipt);

        // Monta os dados da Folha de Acesso do Responsável para impressão
        const accessSheetData: GuardianAccessSheetData = {
          enrollmentNumber: response.enrollmentNumber,
          issuedAt: new Date(),
          student: {
            fullName: student.fullName,
            cpf: student.cpf,
            birthDate: student.birthDate,
          },
          guardian: {
            fullName: effectiveGuardian.fullName,
            cpf: effectiveGuardian.cpf,
            email: response.guardianAccess?.email || effectiveGuardian.email,
            phone: effectiveGuardian.phone,
            relationship: effectiveGuardian.relationship,
          },
          credentials: {
            portalUrl: "/portal-do-responsavel",
            loginEmail: response.guardianAccess?.email || effectiveGuardian.email,
            initialPassword: response.guardianAccess?.tempPassword || "Pais@2026",
          },
          course: {
            name: selectedClass?.course.name || "Curso Geral",
            className: selectedClass?.name || "Turma Geral",
            shift: selectedClass?.shift || "MORNING",
            dueDay,
            monthlyPrice: finalPrice,
            materialFee,
            totalInstallments: durationMonths,
          },
        };
        setCreatedGuardianAccessData(accessSheetData);

        if (response.enrollmentFeeCharge) {
          setFeeChargeModal({
            ...response.enrollmentFeeCharge,
            enrollmentNumber: response.enrollmentNumber,
            isPaid: false,
          });
          setPaymentTab("PIX");
          setPosStep("CONFIG");
        } else {
          // Se não há taxa imediata, abre direto a folha de acesso do responsável
          setShowGuardianAccessModal(true);
        }
      } else {
        setFeedback({
          type: "error",
          text: response.error || "Ocorreu um erro ao processar a matrícula.",
        });
      }
    } catch (err: any) {
      setFeedback({
        type: "error",
        text: err?.message || "Erro de conexão ao enviar a matrícula.",
      });
    } finally {
      setIsPending(false);
    }
  }

  // Baixa Imediata da Taxa de Matrícula (PIX / Dinheiro Balcão)
  async function handleConfirmFeePayment() {
    if (!feeChargeModal) return;
    setSimulatingPayment(true);

    try {
      const res = await recordPaymentAction({
        invoiceId: feeChargeModal.invoiceId,
        amountPaid: feeChargeModal.amount,
        penaltyAmount: 0,
        interestAmount: 0,
        discountGiven: 0,
        paymentMethod: "PIX",
        transactionReference: `PIX_BALCAO_${Date.now()}`,
      });

      if (res.success) {
        setFeeChargeModal((prev) => (prev ? { ...prev, isPaid: true } : null));
        if (createdReceiptData) {
          setCreatedReceiptData({
            ...createdReceiptData,
            financial: {
              ...createdReceiptData.financial,
              isFeePaid: true,
            },
          });
        }
        setShowReceiptModal(true);
      } else {
        alert("Erro ao confirmar pagamento: " + res.error);
      }
    } catch (e: any) {
      alert("Erro ao processar baixa: " + e?.message);
    } finally {
      setSimulatingPayment(false);
    }
  }

  // Aprovação via Maquininha SmartPOS
  async function handleApproveOnPos(cardBrand: string = "VISA") {
    if (!feeChargeModal) return;
    setSimulatingPayment(true);

    try {
      const res = await completePosPaymentAction({
        invoiceId: feeChargeModal.invoiceId,
        paymentType: posType,
        installments: posInstallments,
        cardBrand,
      });

      if (res.success && res.data) {
        setPosStep("APPROVED");
        setPosResult({
          cardBrand: res.data.cardBrand || cardBrand,
          nsu: res.data.nsu || "NSU-LOCAL",
        });

        if (createdReceiptData) {
          setCreatedReceiptData({
            ...createdReceiptData,
            financial: {
              ...createdReceiptData.financial,
              isFeePaid: true,
            },
          });
        }

        setTimeout(() => {
          setFeeChargeModal(null);
          setShowReceiptModal(true);
        }, 1800);
      }
    } catch (e: any) {
      alert("Erro ao aprovar no terminal: " + e?.message);
    } finally {
      setSimulatingPayment(false);
    }
  }

  function handleCopyPix() {
    if (!feeChargeModal) return;
    navigator.clipboard.writeText(feeChargeModal.pixCopiaECola);
    setCopiedPix(true);
    setTimeout(() => setCopiedPix(false), 2500);
  }

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-8">
        {feedback && (
          <div
            className={`p-4 rounded-xl flex items-center justify-between gap-3 ${
              feedback.type === "success"
                ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                : "bg-rose-50 text-rose-800 border border-rose-200"
            }`}
          >
            <div className="flex items-center gap-3">
              {feedback.type === "success" ? (
                <CheckCircle2 className="h-5 w-5 text-emerald-600 flex-shrink-0" />
              ) : (
                <AlertCircle className="h-5 w-5 text-rose-600 flex-shrink-0" />
              )}
              <p className="text-sm font-medium">{feedback.text}</p>
            </div>
            {createdReceiptData && (
              <Button
                type="button"
                size="sm"
                onClick={() => setShowReceiptModal(true)}
                className="bg-indigo-600 hover:bg-indigo-700 text-white gap-1.5 text-xs shadow-sm"
              >
                <Printer className="h-4 w-4" />
                Imprimir Comprovante
              </Button>
            )}
          </div>
        )}

        <div className="grid gap-6 md:grid-cols-2">
          {/* Bloco 1: Dados do Aluno */}
          <Card className="border-slate-200 shadow-sm">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base flex items-center gap-2">
                  <UserCheck className="h-4 w-4 text-indigo-600" />
                  1. Dados Cadastrais do Aluno
                </CardTitle>
                <Badge
                  variant={isAdult ? "success" : "secondary"}
                  className="text-[11px] font-semibold"
                >
                  {studentAge > 0 ? `${studentAge} anos` : "Data de Nascimento"} • {isAdult ? "Maior de 18" : "Menor de idade"}
                </Badge>
              </div>
              <CardDescription>
                Informações para diário acadêmico, frequência e contrato escolar
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="studentName">Nome Completo do Aluno *</Label>
                <Input
                  id="studentName"
                  required
                  placeholder="Ex: Gabriel Silva Santos"
                  value={student.fullName}
                  onChange={(e) => handleStudentChange("fullName", e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="studentBirth">Data de Nascimento *</Label>
                  <Input
                    id="studentBirth"
                    type="date"
                    required
                    value={student.birthDate}
                    onChange={(e) => handleBirthDateChange(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="studentCpf">
                    CPF do Aluno {isSelfResponsible ? "*" : "(Opcional se menor)"}
                  </Label>
                  <Input
                    id="studentCpf"
                    required={isSelfResponsible}
                    maxLength={14}
                    placeholder={isSelfResponsible ? "000.000.000-00 (Obrigatório)" : "Opcional"}
                    value={student.cpf}
                    onChange={(e) => handleStudentChange("cpf", e.target.value)}
                  />
                </div>
              </div>

              {/* Bloco de Opção para Aluno Maior de 18 Anos */}
              <div className={`p-3.5 rounded-xl border transition-all ${
                isSelfResponsible
                  ? "bg-indigo-50/80 border-indigo-300 shadow-xs"
                  : isAdult
                  ? "bg-slate-50 border-slate-200 hover:border-slate-300"
                  : "bg-amber-50/50 border-amber-200/60"
              }`}>
                {isAdult ? (
                  <label className="flex items-start gap-3 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={isSelfResponsible}
                      onChange={(e) => toggleSelfResponsible(e.target.checked)}
                      className="mt-0.5 h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                    />
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-1.5 font-bold text-xs text-slate-900">
                        <ShieldCheck className="h-4 w-4 text-indigo-600" />
                        <span>Aluno maior de 18 anos é o próprio responsável financeiro</span>
                      </div>
                      <p className="text-[11px] text-slate-500 leading-tight">
                        O próprio aluno responderá pelas faturas, boletos, PIX e assinará o contrato educacional.
                      </p>
                    </div>
                  </label>
                ) : (
                  <div className="flex items-center gap-2 text-amber-800 text-xs">
                    <AlertCircle className="h-4 w-4 text-amber-600 flex-shrink-0" />
                    <span>
                      Aluno menor de 18 anos ({studentAge} anos). É obrigatório o cadastro de um responsável legal (Pai, Mãe ou Tutor).
                    </span>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="studentPhone">
                    Telefone / WhatsApp {isSelfResponsible ? "*" : ""}
                  </Label>
                  <Input
                    id="studentPhone"
                    required={isSelfResponsible}
                    placeholder="(11) 98888-7777"
                    value={student.phone}
                    onChange={(e) => handleStudentChange("phone", e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="studentEmail">
                    E-mail {isSelfResponsible ? "* (Para faturas)" : ""}
                  </Label>
                  <Input
                    id="studentEmail"
                    type="email"
                    required={isSelfResponsible}
                    placeholder="aluno@email.com"
                    value={student.email}
                    onChange={(e) => handleStudentChange("email", e.target.value)}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="studentAddress">Endereço Residencial</Label>
                <Input
                  id="studentAddress"
                  placeholder="Rua, Número, Bairro, Cidade - UF"
                  value={student.address}
                  onChange={(e) => handleStudentChange("address", e.target.value)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Bloco 2: Responsável Legal / Financeiro */}
          <Card className="border-slate-200 shadow-sm flex flex-col justify-between">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base flex items-center gap-2">
                  <UserCheck className="h-4 w-4 text-indigo-600" />
                  2. Responsável Legal / Financeiro (Pagador)
                </CardTitle>
                {isSelfResponsible && (
                  <Badge variant="success" className="text-[10px]">
                    Titular Próprio
                  </Badge>
                )}
              </div>
              <CardDescription>
                Titular para emissão de cobranças, boletos e termo de adesão
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 flex-1">
              {isSelfResponsible ? (
                <div className="h-full flex flex-col justify-between p-4 rounded-xl bg-gradient-to-br from-indigo-50/90 via-white to-blue-50/50 border border-indigo-200 space-y-4">
                  <div className="space-y-2.5">
                    <div className="flex items-center gap-2 text-indigo-950 font-bold text-sm">
                      <CheckCircle2 className="h-5 w-5 text-indigo-600" />
                      <span>Aluno Maior de Idade Vinculado como Titular</span>
                    </div>
                    <p className="text-xs text-indigo-900/80 leading-relaxed">
                      Por ter <strong>{studentAge} anos</strong> e ter optado por responder financeiramente, todas as mensalidades, carnês, baixas em maquininha e comunicações financeiras serão geradas diretamente em seu nome.
                    </p>

                    <div className="p-3 bg-white rounded-lg border border-indigo-100 text-xs space-y-2 text-slate-700 shadow-2xs">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">Titular Financeiro:</span>
                        <strong className="text-slate-900 font-semibold">
                          {student.fullName || "(Preencha o nome do aluno ao lado)"}
                        </strong>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">CPF do Pagador:</span>
                        <span className="font-mono font-medium text-slate-900">
                          {student.cpf || "(Preencha o CPF ao lado)"}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">Contato:</span>
                        <span>{student.phone || "Sem telefone"}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">E-mail:</span>
                        <span>{student.email || "Sem e-mail"}</span>
                      </div>
                      <div className="flex items-center justify-between pt-1 border-t border-slate-100">
                        <span className="text-slate-400">Vínculo:</span>
                        <Badge variant="outline" className="text-[10px] bg-indigo-50/60 text-indigo-700 border-indigo-200">
                          Próprio Aluno (Titular)
                        </Badge>
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-indigo-100/80">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => toggleSelfResponsible(false)}
                      className="w-full text-xs text-slate-600 hover:text-slate-900 bg-white hover:bg-slate-50 border-slate-200"
                    >
                      Desejo cadastrar outro responsável (Pais / Terceiro)
                    </Button>
                  </div>
                </div>
              ) : (
                <>
                  <div>
                    <Label htmlFor="guardianName">Nome Completo do Responsável *</Label>
                    <Input
                      id="guardianName"
                      required
                      placeholder="Ex: Maria de Fátima Silva"
                      value={guardian.fullName}
                      onChange={(e) => setGuardian({ ...guardian, fullName: e.target.value })}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label htmlFor="guardianCpf">CPF do Responsável *</Label>
                      <Input
                        id="guardianCpf"
                        required
                        maxLength={14}
                        placeholder="123.456.789-01"
                        value={guardian.cpf}
                        onChange={(e) => setGuardian({ ...guardian, cpf: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="guardianRel">Parentesco *</Label>
                      <Input
                        id="guardianRel"
                        required
                        placeholder="Ex: Mãe, Pai, Tutor"
                        value={guardian.relationship}
                        onChange={(e) => setGuardian({ ...guardian, relationship: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label htmlFor="guardianPhone">Telefone / WhatsApp *</Label>
                      <Input
                        id="guardianPhone"
                        required
                        placeholder="(11) 99999-8888"
                        value={guardian.phone}
                        onChange={(e) => setGuardian({ ...guardian, phone: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="guardianEmail">E-mail para Boletos *</Label>
                      <Input
                        id="guardianEmail"
                        type="email"
                        required
                        placeholder="responsavel@email.com"
                        value={guardian.email}
                        onChange={(e) => setGuardian({ ...guardian, email: e.target.value })}
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="guardianAddress">Endereço Residencial</Label>
                    <Input
                      id="guardianAddress"
                      placeholder="Rua, Número, Bairro, Cidade - UF"
                      value={guardian.address}
                      onChange={(e) => setGuardian({ ...guardian, address: e.target.value })}
                    />
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Bloco 3: Turma, Taxa de Matrícula & Mensalidades */}
        <Card className="border-slate-200 shadow-sm">
          <CardHeader>
            <CardTitle className="text-base">
              3. Parâmetros de Matrícula & Plano de Cobrança
            </CardTitle>
            <CardDescription>
              Configuração da taxa de matrícula imediata e do cronograma de mensalidades
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-4 md:grid-cols-4">
              <div>
                <Label htmlFor="classSelect">Turma Selecionada *</Label>
                <select
                  id="classSelect"
                  className="w-full h-9 rounded-md border border-slate-200 bg-white px-3 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  value={selectedClassId}
                  onChange={(e) => setSelectedClassId(e.target.value)}
                >
                  {availableClasses.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.name} ({item.course.name} - {item.shift})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <Label htmlFor="fee">Taxa de Matrícula (R$) *</Label>
                <Input
                  id="fee"
                  type="number"
                  min={0}
                  step="10"
                  value={enrollmentFee}
                  onChange={(e) => setEnrollmentFee(Number(e.target.value))}
                />
                <span className="text-[11px] text-slate-400">Pode ser paga no PIX ou Maquininha</span>
              </div>

              <div>
                <Label htmlFor="materialFee">Taxa de Material Didático (R$)</Label>
                <Input
                  id="materialFee"
                  type="number"
                  min={0}
                  step="10"
                  value={materialFee}
                  onChange={(e) => setMaterialFee(Number(e.target.value))}
                />
                <span className="text-[11px] text-slate-400">Apostilas & Livros (separado contabilmente)</span>
              </div>

              <div>
                <Label htmlFor="discount">Bolsa / Desconto Mensal (%)</Label>
                <Input
                  id="discount"
                  type="number"
                  min={0}
                  max={100}
                  value={discountPercent}
                  onChange={(e) => setDiscountPercent(Number(e.target.value))}
                />
                <span className="text-[11px] text-slate-400">Aplicado sobre cada mensalidade</span>
              </div>

              <div>
                <Label htmlFor="dueDay">Dia de Vencimento Mensal *</Label>
                <select
                  id="dueDay"
                  className="w-full h-9 rounded-md border border-slate-200 bg-white px-3 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  value={dueDay}
                  onChange={(e) => setDueDay(Number(e.target.value))}
                >
                  <option value={5}>Dia 05 de cada mês</option>
                  <option value={10}>Dia 10 de cada mês</option>
                  <option value={15}>Dia 15 de cada mês</option>
                  <option value={20}>Dia 20 de cada mês</option>
                  <option value={25}>Dia 25 de cada mês</option>
                </select>
              </div>
            </div>

            {/* Linha 2: Parcelamento do Material e Data Inicial */}
            <div className="grid gap-4 md:grid-cols-2 pt-1 border-t border-slate-100">
              <div>
                <Label htmlFor="materialMode">Condição de Cobrança do Material Didático</Label>
                <select
                  id="materialMode"
                  className="w-full h-9 rounded-md border border-slate-200 bg-white px-3 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  value={materialPaymentMode}
                  onChange={(e) => setMaterialPaymentMode(e.target.value as any)}
                >
                  <option value="INSTALLMENT_WITH_TUITION">
                    Parcelar junto com as mensalidades ({durationMonths}x de {formatCurrency(materialFee > 0 ? materialFee / durationMonths : 0)}/mês - discriminado)
                  </option>
                  <option value="SEPARATE_AT_ENROLLMENT">
                    À vista no ato da matrícula (Fatura imediata com PIX / Cartão)
                  </option>
                  <option value="INSTALLMENT_SEPARATE">
                    Parcelado em faturas exclusivas de material
                  </option>
                </select>
                <span className="text-[11px] text-slate-400">
                  O valor será discriminado contabilmente nos relatórios financeiros e no boleto
                </span>
              </div>

              <div>
                <Label htmlFor="firstDate">Mês da 1ª Mensalidade *</Label>
                <Input
                  id="firstDate"
                  type="date"
                  className="w-full"
                  required
                  value={firstDate}
                  onChange={(e) => setFirstDate(e.target.value)}
                />
              </div>
            </div>

            {/* Opção Multiturma: Boleto Unificado */}
            <div className="p-3 bg-blue-50/70 rounded-xl border border-blue-200 flex items-start gap-3">
              <input
                type="checkbox"
                id="unifyInvoices"
                checked={unifyWithExistingInvoices}
                onChange={(e) => setUnifyWithExistingInvoices(e.target.checked)}
                className="mt-0.5 h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
              />
              <label htmlFor="unifyInvoices" className="text-xs text-slate-700 cursor-pointer">
                <span className="font-bold text-slate-900 block">
                  Unificar boletos multiturma (Se o aluno fizer mais de um cursinho)
                </span>
                Gera boletos mensais somando a mensalidade de ambas as turmas frequentadas pelo aluno, emitindo uma única cobrança com os valores discriminados para o responsável financeiro.
              </label>
            </div>

            {/* Simulação Consolidada do Contrato */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 grid grid-cols-2 md:grid-cols-6 gap-3">
              <div>
                <p className="text-xs text-slate-500 font-medium">Matrícula:</p>
                <p className="text-sm font-bold text-slate-900">
                  {formatCurrency(enrollmentFee)}
                </p>
                <span className="text-[10px] text-indigo-600 font-semibold">● No ato</span>
              </div>

              <div>
                <p className="text-xs text-slate-500 font-medium">Taxa de Material:</p>
                <p className="text-sm font-bold text-amber-700">
                  {formatCurrency(materialFee)}
                </p>
                <span className="text-[10px] text-slate-500">
                  {materialPaymentMode === "INSTALLMENT_WITH_TUITION" && materialFee > 0
                    ? `+${formatCurrency(monthlyMaterial)}/mês`
                    : "À vista"}
                </span>
              </div>

              <div>
                <p className="text-xs text-slate-500 font-medium">Mensalidade Curso:</p>
                <p className="text-sm font-bold text-slate-800">
                  {formatCurrency(finalPrice)}
                </p>
                <span className="text-[10px] text-slate-400">({durationMonths} parcelas)</span>
              </div>

              <div>
                <p className="text-xs text-slate-500 font-medium">Boleto Mensal:</p>
                <p className="text-base font-extrabold text-indigo-600">
                  {formatCurrency(finalCombinedMonthlyInvoice)}
                </p>
                <span className="text-[10px] text-indigo-600 font-medium">Curso + Material</span>
              </div>

              <div>
                <p className="text-xs text-slate-500 font-medium">Desconto:</p>
                <Badge variant={discountPercent > 0 ? "success" : "secondary"}>
                  {discountPercent}%
                </Badge>
              </div>

              <div>
                <p className="text-xs text-slate-500 font-medium">Total Geral:</p>
                <p className="text-base font-extrabold text-slate-900">
                  {formatCurrency(grandTotal)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Botão de Envio */}
        <div className="flex justify-end gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            disabled={isPending}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            className="gap-2 px-8"
            disabled={isPending}
          >
            {isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Criando Matrícula & Gerando Cobranças...
              </>
            ) : (
              <>
                <UserCheck className="h-4 w-4" />
                Finalizar Matrícula & Cobrar
              </>
            )}
          </Button>
        </div>
      </form>

      {/* MODAL MULTI-CANAL (PIX OU MAQUININHA SMARTPOS) */}
      {feeChargeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 border border-slate-200 space-y-6">
            <div className="text-center space-y-2">
              <h3 className="text-xl font-bold text-slate-900">
                Matrícula {feeChargeModal.enrollmentNumber} Registrada!
              </h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Escolha como deseja receber a taxa de matrícula de{" "}
                <strong className="text-slate-900">{formatCurrency(feeChargeModal.amount)}</strong>:
              </p>
            </div>

            {/* SELETOR DE ABA: PIX vs MAQUININHA */}
            <div className="flex rounded-lg bg-slate-100 p-1">
              <button
                type="button"
                onClick={() => setPaymentTab("PIX")}
                className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-all flex items-center justify-center gap-1.5 ${
                  paymentTab === "PIX"
                    ? "bg-white text-slate-900 shadow-sm"
                    : "text-slate-500 hover:text-slate-900"
                }`}
              >
                <QrCode className="h-3.5 w-3.5 text-emerald-600" />
                PIX Instantâneo
              </button>
              <button
                type="button"
                onClick={() => setPaymentTab("POS")}
                className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-all flex items-center justify-center gap-1.5 ${
                  paymentTab === "POS"
                    ? "bg-white text-indigo-700 shadow-sm"
                    : "text-slate-500 hover:text-slate-900"
                }`}
              >
                <CreditCard className="h-3.5 w-3.5 text-indigo-600" />
                Maquininha de Cartão
              </button>
            </div>

            {/* CONTEÚDO DA ABA PIX */}
            {paymentTab === "PIX" && (
              <div className="space-y-4">
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80 flex flex-col items-center gap-3">
                  <div className="p-2 bg-white rounded-lg shadow-sm border border-slate-200">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={feeChargeModal.pixQrCodeUrl}
                      alt="QR Code PIX da Matrícula"
                      className="w-44 h-44 rounded"
                    />
                  </div>

                  <div className="w-full space-y-1">
                    <Label className="text-xs text-slate-500">Código PIX Copia e Cola:</Label>
                    <div className="flex gap-2">
                      <Input
                        readOnly
                        value={feeChargeModal.pixCopiaECola}
                        className="font-mono text-xs bg-white select-all h-8"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleCopyPix}
                        className="gap-1.5 text-xs h-8 flex-shrink-0"
                      >
                        {copiedPix ? (
                          <>
                            <Check className="h-3.5 w-3.5 text-emerald-600" />
                            Copiado!
                          </>
                        ) : (
                          <>
                            <Copy className="h-3.5 w-3.5" />
                            Copiar
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </div>

                <Button
                  type="button"
                  onClick={handleConfirmFeePayment}
                  disabled={simulatingPayment}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white gap-2 font-medium"
                >
                  {simulatingPayment ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Registrando Baixa...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="h-4 w-4" />
                      Confirmar Pagamento PIX Recebido
                    </>
                  )}
                </Button>
              </div>
            )}

            {/* CONTEÚDO DA ABA MAQUININHA SMARTPOS */}
            {paymentTab === "POS" && (
              <div className="space-y-4">
                {posStep === "CONFIG" && (
                  <div className="space-y-3 p-4 bg-slate-50 rounded-xl border border-slate-200">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label className="text-xs">Modalidade</Label>
                        <select
                          className="w-full h-9 rounded-md border border-slate-200 bg-white px-3 text-xs focus:ring-1 focus:ring-indigo-500 mt-1"
                          value={posType}
                          onChange={(e) => setPosType(e.target.value as any)}
                        >
                          <option value="credit_card">Crédito</option>
                          <option value="debit_card">Débito</option>
                        </select>
                      </div>

                      <div>
                        <Label className="text-xs">Parcelamento</Label>
                        <select
                          className="w-full h-9 rounded-md border border-slate-200 bg-white px-3 text-xs focus:ring-1 focus:ring-indigo-500 mt-1"
                          disabled={posType === "debit_card"}
                          value={posInstallments}
                          onChange={(e) => setPosInstallments(Number(e.target.value))}
                        >
                          <option value={1}>1x à vista</option>
                          <option value={2}>2x sem juros</option>
                          <option value={3}>3x sem juros</option>
                        </select>
                      </div>
                    </div>

                    <Button
                      type="button"
                      onClick={() => setPosStep("WAITING")}
                      className="w-full bg-indigo-600 hover:bg-indigo-700 text-white gap-2 text-xs mt-2"
                    >
                      <Wifi className="h-4 w-4" />
                      Disparar para a Maquininha Balcão
                    </Button>
                  </div>
                )}

                {posStep === "WAITING" && (
                  <div className="p-6 bg-slate-50 rounded-xl border border-slate-200 text-center space-y-4">
                    <div className="relative mx-auto w-16 h-16 flex items-center justify-center">
                      <div className="absolute inset-0 rounded-full bg-indigo-100 animate-ping opacity-75" />
                      <div className="relative h-12 w-12 rounded-full bg-indigo-600 text-white flex items-center justify-center shadow">
                        <Smartphone className="h-6 w-6" />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <p className="font-bold text-sm text-slate-900">
                        Aguardando Cartão na Maquininha...
                      </p>
                      <p className="text-xs text-slate-500">
                        Peça para o cliente inserir o cartão de {posType === "credit_card" ? "crédito" : "débito"} e digitar a senha.
                      </p>
                    </div>

                    <Button
                      type="button"
                      size="sm"
                      onClick={() => handleApproveOnPos("VISA")}
                      disabled={simulatingPayment}
                      className="w-full text-xs bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5"
                    >
                      {simulatingPayment ? (
                        <>
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          Aprovando...
                        </>
                      ) : (
                        <>
                          <Check className="h-3.5 w-3.5" />
                          Simular Cartão Aprovado (VISA)
                        </>
                      )}
                    </Button>
                  </div>
                )}

                {posStep === "APPROVED" && (
                  <div className="p-6 bg-emerald-50 rounded-xl border border-emerald-200 text-center space-y-2 animate-in zoom-in-95">
                    <ShieldCheck className="h-10 w-10 text-emerald-600 mx-auto" />
                    <h4 className="font-bold text-emerald-800 text-base">Cartão Aprovado!</h4>
                    <p className="text-xs text-emerald-700">
                      NSU: {posResult?.nsu} | Bandeira: {posResult?.cardBrand}
                    </p>
                    <p className="text-[11px] text-slate-400 pt-1">
                      Matrícula confirmada com sucesso!
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* BOTÕES PARA IMPRIMIR FOLHA DO PAI E COMPROVANTE DIRETO */}
            <div className="pt-2 border-t border-slate-100 space-y-2">
              <Button
                type="button"
                onClick={() => {
                  setFeeChargeModal(null);
                  setShowGuardianAccessModal(true);
                }}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white gap-2 font-medium"
              >
                <KeyRound className="h-4 w-4" />
                Imprimir Folha de Acesso do Responsável (A4)
              </Button>

              <Button
                type="button"
                onClick={() => {
                  setFeeChargeModal(null);
                  setShowReceiptModal(true);
                }}
                variant="outline"
                className="w-full border-slate-300 text-slate-800 hover:bg-slate-50 gap-2 font-medium"
              >
                <Printer className="h-4 w-4 text-slate-600" />
                Imprimir Comprovante de Matrícula (A4)
              </Button>

              <Button
                type="button"
                variant="ghost"
                onClick={() => {
                  setFeeChargeModal(null);
                  router.push("/financial/invoices");
                }}
                className="w-full text-xs text-slate-500"
              >
                Pagar Mais Tarde (Acessar Faturas)
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL IMPRIMÍVEL DA FOLHA DE ACESSO DO RESPONSÁVEL */}
      {showGuardianAccessModal && createdGuardianAccessData && (
        <GuardianAccessSheet
          data={createdGuardianAccessData}
          isModal={true}
          onClose={() => {
            setShowGuardianAccessModal(false);
            setShowReceiptModal(true);
          }}
        />
      )}

      {/* MODAL IMPRIMÍVEL DO COMPROVANTE DE MATRÍCULA */}
      {showReceiptModal && createdReceiptData && (
        <EnrollmentReceipt
          data={createdReceiptData}
          isModal={true}
          onClose={() => {
            setShowReceiptModal(false);
            router.push("/academic/students");
          }}
        />
      )}
    </>
  );
}
