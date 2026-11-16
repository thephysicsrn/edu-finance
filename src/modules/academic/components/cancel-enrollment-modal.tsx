"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { cancelEnrollmentAction } from "../actions/student.actions";
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
import { AlertTriangle, X, Loader2, Ban } from "lucide-react";

export interface CancelEnrollmentData {
  enrollmentId: string;
  enrollmentNumber: string;
  studentName: string;
  className: string;
}

interface CancelEnrollmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: CancelEnrollmentData;
  onSuccess?: () => void;
}

export function CancelEnrollmentModal({
  isOpen,
  onClose,
  data,
  onSuccess,
}: CancelEnrollmentModalProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [reason, setReason] = useState("");
  const [cancelPendingInvoices, setCancelPendingInvoices] = useState(true);
  const [cancelOverdueInvoices, setCancelOverdueInvoices] = useState(false);

  if (!isOpen) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (reason.trim().length < 5) {
      setError("Por favor, informe uma justificativa válida com no mínimo 5 caracteres.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await cancelEnrollmentAction({
        enrollmentId: data.enrollmentId,
        reason,
        cancelPendingInvoices,
        cancelOverdueInvoices,
      });

      if (res.success) {
        onClose();
        if (onSuccess) {
          onSuccess();
        } else {
          router.refresh();
        }
      } else {
        setError(res.error || "Erro ao processar cancelamento.");
      }
    } catch (err: any) {
      setError(err?.message || "Erro inesperado.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <Card className="w-full max-w-lg shadow-2xl border-rose-200">
        <CardHeader className="flex flex-row items-center justify-between pb-3 border-b border-rose-100 bg-rose-50/40 rounded-t-xl">
          <div className="flex items-center gap-2 text-rose-900">
            <AlertTriangle className="h-5 w-5 text-rose-600 flex-shrink-0" />
            <div>
              <CardTitle className="text-base font-bold">
                Cancelar Matrícula
              </CardTitle>
              <CardDescription className="text-xs text-rose-800/80">
                Esta ação cancelará o vínculo do aluno com a turma selecionada.
              </CardDescription>
            </div>
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
          <CardContent className="space-y-4 pt-4 text-xs">
            {error && (
              <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs">
                {error}
              </div>
            )}

            {/* Resumo do Aluno e Matrícula */}
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Aluno:</span>
                <strong className="text-slate-900 font-semibold">{data.studentName}</strong>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Turma:</span>
                <span className="text-slate-800 font-medium">{data.className}</span>
              </div>
              <div className="flex items-center justify-between font-mono text-[11px] pt-1 border-t border-slate-100">
                <span className="text-slate-400">Nº de Matrícula:</span>
                <span className="text-indigo-600 font-bold">{data.enrollmentNumber}</span>
              </div>
            </div>

            <div>
              <Label htmlFor="cancelReason" className="text-xs font-semibold text-slate-900">
                Motivo / Justificativa do Cancelamento *
              </Label>
              <Input
                id="cancelReason"
                required
                placeholder="Ex: Mudança de cidade, desistência do vestibular, motivos de saúde..."
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="mt-1 h-9 text-xs"
              />
            </div>

            {/* Opções de Baixa / Cancelamento de Faturas */}
            <div className="space-y-2.5 pt-2 border-t border-slate-100">
              <span className="text-xs font-semibold text-slate-900 block">
                Tratamento de Mensalidades Financeiras:
              </span>

              <label className="flex items-start gap-2.5 cursor-pointer p-2 rounded-lg hover:bg-slate-50 border border-transparent hover:border-slate-200">
                <input
                  type="checkbox"
                  checked={cancelPendingInvoices}
                  onChange={(e) => setCancelPendingInvoices(e.target.checked)}
                  className="mt-0.5 h-4 w-4 rounded border-slate-300 text-rose-600 focus:ring-rose-500"
                />
                <div>
                  <span className="font-semibold text-slate-800 block">
                    Cancelar faturas futuras em aberto (PENDING)
                  </span>
                  <span className="text-[11px] text-slate-500 block">
                    Interrompe a cobrança das mensalidades que ainda não venceram.
                  </span>
                </div>
              </label>

              <label className="flex items-start gap-2.5 cursor-pointer p-2 rounded-lg hover:bg-slate-50 border border-transparent hover:border-slate-200">
                <input
                  type="checkbox"
                  checked={cancelOverdueInvoices}
                  onChange={(e) => setCancelOverdueInvoices(e.target.checked)}
                  className="mt-0.5 h-4 w-4 rounded border-slate-300 text-rose-600 focus:ring-rose-500"
                />
                <div>
                  <span className="font-semibold text-slate-800 block">
                    Cancelar também faturas vencidas em atraso (OVERDUE)
                  </span>
                  <span className="text-[11px] text-slate-500 block">
                    Se desmarcado, as dívidas anteriores permanecem para cobrança da secretaria.
                  </span>
                </div>
              </label>
            </div>

            <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={onClose}
                disabled={loading}
                className="text-xs"
              >
                Voltar
              </Button>
              <Button
                type="submit"
                size="sm"
                disabled={loading}
                className="text-xs gap-1.5 bg-rose-600 hover:bg-rose-700 text-white"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    Cancelando...
                  </>
                ) : (
                  <>
                    <Ban className="h-3.5 w-3.5" />
                    Confirmar Cancelamento
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
