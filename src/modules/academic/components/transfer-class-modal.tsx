"use client";

import { useState } from "react";
import { transferStudentClassAction } from "../actions/transfer.actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";
import {
  ArrowRightLeft,
  CheckCircle2,
  AlertCircle,
  Loader2,
  X,
  School,
  Users,
} from "lucide-react";

export interface AvailableClassOption {
  id: string;
  name: string;
  shift: string;
  capacity: number;
  activeCount?: number;
  course: {
    name: string;
    basePrice: string;
  };
}

interface TransferClassModalProps {
  isOpen: boolean;
  onClose: () => void;
  student: {
    id: string;
    fullName: string;
    enrollmentId: string;
    currentClassId: string;
    currentClassName: string;
  };
  availableClasses: AvailableClassOption[];
  onSuccess?: () => void;
}

export function TransferClassModal({
  isOpen,
  onClose,
  student,
  availableClasses,
  onSuccess,
}: TransferClassModalProps) {
  // Filtra as turmas para não incluir a turma atual do aluno
  const selectableClasses = availableClasses.filter(
    (c) => c.id !== student.currentClassId
  );

  const [targetClassId, setTargetClassId] = useState<string>(
    selectableClasses[0]?.id || ""
  );
  const [reason, setReason] = useState<string>("");
  const [adjustValues, setAdjustValues] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [resultMessage, setResultMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  if (!isOpen) return null;

  const selectedTargetClass = selectableClasses.find((c) => c.id === targetClassId);

  async function handleTransfer() {
    if (!targetClassId) return;
    setIsSubmitting(true);
    setResultMessage(null);

    try {
      const response = await transferStudentClassAction({
        studentId: student.id,
        enrollmentId: student.enrollmentId,
        targetClassId,
        reason: reason.trim() || undefined,
        adjustPendingInvoiceValues: adjustValues,
      });

      if (response.success) {
        setResultMessage({
          type: "success",
          text: response.message,
        });
        setTimeout(() => {
          if (onSuccess) onSuccess();
          onClose();
        }, 1500);
      } else {
        setResultMessage({
          type: "error",
          text: response.error,
        });
      }
    } catch (err: any) {
      setResultMessage({
        type: "error",
        text: err?.message || "Erro inesperado ao transferir aluno de turma.",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2 text-indigo-700">
            <ArrowRightLeft className="h-5 w-5" />
            <h3 className="font-bold text-slate-900 text-base">
              Transferência de Turma
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-lg transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Corpo do Modal */}
        <div className="p-6 space-y-5">
          {/* Aluno e Turma de Origem */}
          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80 space-y-1">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Aluno Selecionado
            </p>
            <p className="text-sm font-bold text-slate-900">{student.fullName}</p>
            <div className="flex items-center gap-2 pt-1 text-xs text-slate-600">
              <span className="text-slate-400">Turma Atual:</span>
              <Badge variant="outline" className="font-semibold text-slate-700">
                {student.currentClassName}
              </Badge>
            </div>
          </div>

          {/* Seleção da Nova Turma */}
          <div className="space-y-2">
            <Label className="text-xs font-semibold text-slate-700">
              Selecione a Nova Turma de Destino *
            </Label>
            {selectableClasses.length === 0 ? (
              <p className="text-sm text-amber-600 p-3 bg-amber-50 rounded-lg">
                Não há outras turmas cadastradas ou disponíveis para transferência no momento.
              </p>
            ) : (
              <select
                value={targetClassId}
                onChange={(e) => setTargetClassId(e.target.value)}
                className="w-full text-sm rounded-lg border border-slate-300 p-2.5 bg-white text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
              >
                {selectableClasses.map((cls) => (
                  <option key={cls.id} value={cls.id}>
                    {cls.name} — {cls.shift === "MORNING" ? "Manhã" : cls.shift === "NIGHT" ? "Noite" : "Tarde"} ({cls.course.name} - {formatCurrency(Number(cls.course.basePrice))}/mês)
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Detalhes da Turma de Destino Selecionada */}
          {selectedTargetClass && (
            <div className="p-3 bg-indigo-50/60 rounded-xl border border-indigo-100 text-xs text-slate-700 space-y-1.5">
              <div className="flex justify-between items-center">
                <span className="font-medium text-indigo-900">Curso:</span>
                <span className="font-semibold">{selectedTargetClass.course.name}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-medium text-indigo-900">Mensalidade Padrão:</span>
                <span className="font-bold text-indigo-700">
                  {formatCurrency(Number(selectedTargetClass.course.basePrice))}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-medium text-indigo-900">Capacidade da Turma:</span>
                <span className="flex items-center gap-1 font-semibold text-slate-800">
                  <Users className="h-3.5 w-3.5 text-indigo-500" />
                  Até {selectedTargetClass.capacity} alunos
                </span>
              </div>
            </div>
          )}

          {/* Opção de ajuste das faturas pendentes */}
          <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
            <input
              type="checkbox"
              id="adjustValues"
              checked={adjustValues}
              onChange={(e) => setAdjustValues(e.target.checked)}
              className="mt-0.5 h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
            />
            <label htmlFor="adjustValues" className="text-xs text-slate-700 cursor-pointer">
              <span className="font-semibold block text-slate-900">
                Ajustar valor das parcelas futuras pendentes
              </span>
              Atualiza automaticamente as faturas futuras de acordo com a mensalidade da nova turma. As faturas já pagas são mantidas intactas para integridade contábil.
            </label>
          </div>

          {/* Motivo da Transferência */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-slate-700">
              Motivo da Transferência (Opcional)
            </Label>
            <Input
              placeholder="Ex: Mudança de horário, preferência por turno matutino, recomendação pedagógica..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="text-xs h-9"
            />
          </div>

          {/* Feedback */}
          {resultMessage && (
            <div
              className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
                resultMessage.type === "success"
                  ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                  : "bg-rose-50 text-rose-800 border border-rose-200"
              }`}
            >
              {resultMessage.type === "success" ? (
                <CheckCircle2 className="h-4 w-4 text-emerald-600 flex-shrink-0" />
              ) : (
                <AlertCircle className="h-4 w-4 text-rose-600 flex-shrink-0" />
              )}
              <span>{resultMessage.text}</span>
            </div>
          )}
        </div>

        {/* Rodapé com Botões de Ação */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-2.5">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isSubmitting}
            className="text-xs h-9"
          >
            Cancelar
          </Button>
          <Button
            type="button"
            onClick={handleTransfer}
            disabled={isSubmitting || selectableClasses.length === 0}
            className="text-xs h-9 gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                Transferindo...
              </>
            ) : (
              <>
                <ArrowRightLeft className="h-3.5 w-3.5" />
                Confirmar Transferência
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
