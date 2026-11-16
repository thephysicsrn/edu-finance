"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { updateStudentAction } from "../actions/student.actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { UserCheck, X, Loader2, Save, User, ShieldCheck } from "lucide-react";

export interface StudentEditData {
  id: string;
  fullName: string;
  cpf?: string | null;
  birthDate: string;
  email?: string | null;
  phone?: string | null;
  address?: string | null;
  notes?: string | null;
  guardian?: {
    id?: string;
    fullName: string;
    cpf?: string;
    email?: string;
    phone?: string;
    relationship?: string;
    address?: string | null;
  } | null;
}

interface EditStudentModalProps {
  isOpen: boolean;
  onClose: () => void;
  student: StudentEditData;
  onSuccess?: () => void;
}

export function EditStudentModal({
  isOpen,
  onClose,
  student,
  onSuccess,
}: EditStudentModalProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form states - Aluno
  const [fullName, setFullName] = useState(student.fullName || "");
  const [cpf, setCpf] = useState(student.cpf || "");
  const [birthDate, setBirthDate] = useState(student.birthDate ? String(student.birthDate).slice(0, 10) : "");
  const [email, setEmail] = useState(student.email || "");
  const [phone, setPhone] = useState(student.phone || "");
  const [address, setAddress] = useState(student.address || "");
  const [notes, setNotes] = useState(student.notes || "");

  // Form states - Responsável
  const [guardianId] = useState(student.guardian?.id || "");
  const [guardianName, setGuardianName] = useState(student.guardian?.fullName || "");
  const [guardianCpf, setGuardianCpf] = useState(student.guardian?.cpf || "");
  const [guardianEmail, setGuardianEmail] = useState(student.guardian?.email || "");
  const [guardianPhone, setGuardianPhone] = useState(student.guardian?.phone || "");
  const [guardianRel, setGuardianRel] = useState(student.guardian?.relationship || "Mãe");
  const [guardianAddress, setGuardianAddress] = useState(student.guardian?.address || "");

  if (!isOpen) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await updateStudentAction({
        studentId: student.id,
        student: {
          fullName,
          cpf: cpf || null,
          birthDate,
          email: email || null,
          phone: phone || null,
          address: address || null,
          notes: notes || null,
        },
        guardian: student.guardian
          ? {
              id: guardianId || undefined,
              fullName: guardianName,
              cpf: guardianCpf,
              email: guardianEmail,
              phone: guardianPhone,
              relationship: guardianRel,
              address: guardianAddress || null,
            }
          : null,
      });

      if (res.success) {
        onClose();
        if (onSuccess) {
          onSuccess();
        } else {
          router.refresh();
        }
      } else {
        setError(res.error || "Erro ao atualizar dados.");
      }
    } catch (err: any) {
      setError(err?.message || "Erro inesperado.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4 animate-in fade-in duration-150 overflow-y-auto">
      <Card className="w-full max-w-2xl my-8 shadow-2xl border-slate-200">
        <CardHeader className="flex flex-row items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <CardTitle className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <UserCheck className="h-5 w-5 text-indigo-600" />
              Editar Dados Cadastrais do Aluno
            </CardTitle>
            <CardDescription className="text-xs">
              Atualize telefones de contato, e-mail para boletos, endereço e titular financeiro.
            </CardDescription>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
          >
            <X className="h-4 w-4" />
          </button>
        </CardHeader>

        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-6 pt-4 text-xs max-h-[75vh] overflow-y-auto">
            {error && (
              <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs">
                {error}
              </div>
            )}

            {/* SEÇÃO 1: DADOS DO ALUNO */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 pb-1 border-b border-slate-100 text-indigo-950 font-bold">
                <User className="h-4 w-4 text-indigo-600" />
                <span>1. Dados do Estudante</span>
              </div>

              <div>
                <Label htmlFor="stName" className="text-xs font-semibold">
                  Nome Completo do Aluno *
                </Label>
                <Input
                  id="stName"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="mt-1 h-9 text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="stCpf" className="text-xs font-semibold">
                    CPF do Aluno
                  </Label>
                  <Input
                    id="stCpf"
                    placeholder="000.000.000-00"
                    value={cpf}
                    onChange={(e) => setCpf(e.target.value)}
                    className="mt-1 h-9 text-xs font-mono"
                  />
                </div>

                <div>
                  <Label htmlFor="stBirth" className="text-xs font-semibold">
                    Data de Nascimento *
                  </Label>
                  <Input
                    id="stBirth"
                    type="date"
                    required
                    value={birthDate}
                    onChange={(e) => setBirthDate(e.target.value)}
                    className="mt-1 h-9 text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="stPhone" className="text-xs font-semibold">
                    Telefone / WhatsApp do Aluno
                  </Label>
                  <Input
                    id="stPhone"
                    placeholder="(11) 98888-7777"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="mt-1 h-9 text-xs"
                  />
                </div>

                <div>
                  <Label htmlFor="stEmail" className="text-xs font-semibold">
                    E-mail do Aluno
                  </Label>
                  <Input
                    id="stEmail"
                    type="email"
                    placeholder="aluno@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="mt-1 h-9 text-xs"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="stAddr" className="text-xs font-semibold">
                  Endereço Residencial do Aluno
                </Label>
                <Input
                  id="stAddr"
                  placeholder="Rua, Número, Bairro, Cidade - UF"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="mt-1 h-9 text-xs"
                />
              </div>

              <div>
                <Label htmlFor="stNotes" className="text-xs font-semibold">
                  Observações Médicas / Pedagógicas
                </Label>
                <Input
                  id="stNotes"
                  placeholder="Ex: Alergias, bolsista do grêmio, restrições..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="mt-1 h-9 text-xs"
                />
              </div>
            </div>

            {/* SEÇÃO 2: DADOS DO RESPONSÁVEL FINANCEIRO */}
            {student.guardian && (
              <div className="space-y-3 pt-2 border-t border-slate-100">
                <div className="flex items-center gap-2 pb-1 border-b border-slate-100 text-indigo-950 font-bold">
                  <ShieldCheck className="h-4 w-4 text-emerald-600" />
                  <span>2. Responsável Legal / Titular Financeiro</span>
                </div>

                <div>
                  <Label htmlFor="gdName" className="text-xs font-semibold">
                    Nome Completo do Responsável *
                  </Label>
                  <Input
                    id="gdName"
                    required
                    value={guardianName}
                    onChange={(e) => setGuardianName(e.target.value)}
                    className="mt-1 h-9 text-xs"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="gdCpf" className="text-xs font-semibold">
                      CPF do Responsável *
                    </Label>
                    <Input
                      id="gdCpf"
                      required
                      placeholder="000.000.000-00"
                      value={guardianCpf}
                      onChange={(e) => setGuardianCpf(e.target.value)}
                      className="mt-1 h-9 text-xs font-mono"
                    />
                  </div>

                  <div>
                    <Label htmlFor="gdRel" className="text-xs font-semibold">
                      Parentesco / Vínculo *
                    </Label>
                    <Input
                      id="gdRel"
                      required
                      placeholder="Mãe, Pai, Tutor, Tio..."
                      value={guardianRel}
                      onChange={(e) => setGuardianRel(e.target.value)}
                      className="mt-1 h-9 text-xs"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="gdPhone" className="text-xs font-semibold">
                      Telefone / WhatsApp para Cobrança *
                    </Label>
                    <Input
                      id="gdPhone"
                      required
                      placeholder="(11) 99999-8888"
                      value={guardianPhone}
                      onChange={(e) => setGuardianPhone(e.target.value)}
                      className="mt-1 h-9 text-xs"
                    />
                  </div>

                  <div>
                    <Label htmlFor="gdEmail" className="text-xs font-semibold">
                      E-mail para Boletos e Login *
                    </Label>
                    <Input
                      id="gdEmail"
                      type="email"
                      required
                      placeholder="responsavel@email.com"
                      value={guardianEmail}
                      onChange={(e) => setGuardianEmail(e.target.value)}
                      className="mt-1 h-9 text-xs"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="gdAddr" className="text-xs font-semibold">
                    Endereço do Responsável
                  </Label>
                  <Input
                    id="gdAddr"
                    placeholder="Rua, Número, Bairro, Cidade - UF"
                    value={guardianAddress}
                    onChange={(e) => setGuardianAddress(e.target.value)}
                    className="mt-1 h-9 text-xs"
                  />
                </div>
              </div>
            )}

            <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={onClose}
                disabled={loading}
                className="text-xs"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                size="sm"
                disabled={loading}
                className="text-xs gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  <>
                    <Save className="h-3.5 w-3.5" />
                    Salvar Alterações
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </form>
      </Card>
    </div>
  );
}
