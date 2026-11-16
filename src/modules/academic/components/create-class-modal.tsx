"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClassAction } from "../actions/class.actions";
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
import { School, Plus, X, Loader2, CheckCircle2 } from "lucide-react";

export interface CourseOption {
  id: string;
  name: string;
  code: string;
  basePrice: string;
}

interface CreateClassModalProps {
  isOpen: boolean;
  onClose: () => void;
  availableCourses: CourseOption[];
}

export function CreateClassModal({
  isOpen,
  onClose,
  availableCourses,
}: CreateClassModalProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [courseId, setCourseId] = useState(availableCourses[0]?.id || "");
  const [name, setName] = useState("");
  const [shift, setShift] = useState<"MORNING" | "AFTERNOON" | "NIGHT" | "FULL_TIME">("MORNING");
  const [room, setRoom] = useState("");
  const [capacity, setCapacity] = useState(45);
  const [startDate, setStartDate] = useState("2026-02-01");
  const [endDate, setEndDate] = useState("2026-11-30");

  if (!isOpen) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!courseId) {
      setError("Selecione um curso para vincular a turma.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await createClassAction({
        courseId,
        name,
        shift,
        room,
        capacity,
        startDate,
        endDate,
      });

      if (res.success) {
        onClose();
        router.refresh();
      } else {
        setError(res.error || "Erro ao salvar turma.");
      }
    } catch (err: any) {
      setError(err?.message || "Erro inesperado.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <Card className="w-full max-w-lg shadow-2xl border-slate-200">
        <CardHeader className="flex flex-row items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <CardTitle className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <School className="h-5 w-5 text-indigo-600" />
              Criar Nova Turma
            </CardTitle>
            <CardDescription className="text-xs">
              Configure a sala, turno, limite de alunos e período letivo.
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
          <CardContent className="space-y-4 pt-4 text-xs">
            {error && (
              <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs">
                {error}
              </div>
            )}

            <div>
              <Label htmlFor="courseSelect" className="text-xs font-semibold">
                Curso Preparatório Vinculado *
              </Label>
              <select
                id="courseSelect"
                required
                value={courseId}
                onChange={(e) => setCourseId(e.target.value)}
                className="w-full h-9 rounded-md border border-slate-200 bg-white px-3 text-xs mt-1 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              >
                {availableCourses.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.code})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <Label htmlFor="className" className="text-xs font-semibold">
                Nome de Identificação da Turma *
              </Label>
              <Input
                id="className"
                required
                placeholder="Ex: Turma Gamma - Medicina (Tarde)"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-1 h-9 text-xs"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="shiftSelect" className="text-xs font-semibold">
                  Turno de Aulas *
                </Label>
                <select
                  id="shiftSelect"
                  value={shift}
                  onChange={(e) => setShift(e.target.value as any)}
                  className="w-full h-9 rounded-md border border-slate-200 bg-white px-3 text-xs mt-1 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                >
                  <option value="MORNING">Manhã</option>
                  <option value="AFTERNOON">Tarde</option>
                  <option value="NIGHT">Noite</option>
                  <option value="FULL_TIME">Integral</option>
                </select>
              </div>

              <div>
                <Label htmlFor="room" className="text-xs font-semibold">
                  Sala / Auditório *
                </Label>
                <Input
                  id="room"
                  required
                  placeholder="Ex: Sala 02 ou Bloco B"
                  value={room}
                  onChange={(e) => setRoom(e.target.value)}
                  className="mt-1 h-9 text-xs"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <Label htmlFor="capacity" className="text-xs font-semibold">
                  Capacidade Máxima *
                </Label>
                <Input
                  id="capacity"
                  type="number"
                  min={1}
                  max={200}
                  required
                  value={capacity}
                  onChange={(e) => setCapacity(Number(e.target.value))}
                  className="mt-1 h-9 text-xs"
                />
              </div>

              <div>
                <Label htmlFor="startDate" className="text-xs font-semibold">
                  Início das Aulas *
                </Label>
                <Input
                  id="startDate"
                  type="date"
                  required
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="mt-1 h-9 text-xs"
                />
              </div>

              <div>
                <Label htmlFor="endDate" className="text-xs font-semibold">
                  Término do Curso *
                </Label>
                <Input
                  id="endDate"
                  type="date"
                  required
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="mt-1 h-9 text-xs"
                />
              </div>
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
                Cancelar
              </Button>
              <Button
                type="submit"
                size="sm"
                disabled={loading}
                className="text-xs gap-1.5 bg-indigo-600 hover:bg-indigo-700"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  <>
                    <Plus className="h-3.5 w-3.5" />
                    Salvar Turma
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
