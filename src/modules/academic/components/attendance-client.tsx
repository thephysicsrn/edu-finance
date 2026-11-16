"use client";

import { useState, useTransition } from "react";
import { saveAttendanceAction } from "../actions/attendance.actions";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
  CalendarCheck,
  Check,
  X,
  FileText,
  Save,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Users,
} from "lucide-react";

export interface AttendanceStudent {
  id: string;
  name: string;
  cpf?: string | null;
  status: "PRESENT" | "ABSENT" | "JUSTIFIED";
  justification?: string;
}

export interface AttendanceClassItem {
  id: string;
  name: string;
  shift: string;
  courseName: string;
  students: AttendanceStudent[];
}

interface AttendanceClientProps {
  classes: AttendanceClassItem[];
  currentUserRole?: string;
  currentUserName?: string;
}

export function AttendanceClient({
  classes,
  currentUserRole = "ADMIN",
  currentUserName = "Prof. Carlos Eduardo",
}: AttendanceClientProps) {
  const [selectedClassId, setSelectedClassId] = useState<string>(
    classes[0]?.id || ""
  );
  const [date, setDate] = useState<string>(
    new Date().toISOString().split("T")[0]
  );
  const [topic, setTopic] = useState<string>("Física 1 (Mecânica e Cinemática)");
  const [feedback, setFeedback] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [isPending, startTransition] = useTransition();

  // Encontra a turma ativa
  const currentClass =
    classes.find((c) => c.id === selectedClassId) || classes[0];

  // Estado da chamada para os alunos da turma selecionada
  const [studentsState, setStudentsState] = useState<
    Record<string, { status: "PRESENT" | "ABSENT" | "JUSTIFIED"; justification: string }>
  >(() => {
    const initial: Record<
      string,
      { status: "PRESENT" | "ABSENT" | "JUSTIFIED"; justification: string }
    > = {};
    if (currentClass?.students) {
      for (const st of currentClass.students) {
        initial[st.id] = {
          status: st.status || "PRESENT",
          justification: st.justification || "",
        };
      }
    }
    return initial;
  });

  // Atualiza a lista quando a turma selecionada muda
  function handleClassChange(newClassId: string) {
    setSelectedClassId(newClassId);
    setFeedback(null);
    const target = classes.find((c) => c.id === newClassId);
    if (target?.students) {
      const updated: Record<
        string,
        { status: "PRESENT" | "ABSENT" | "JUSTIFIED"; justification: string }
      > = {};
      for (const st of target.students) {
        updated[st.id] = {
          status: "PRESENT",
          justification: "",
        };
      }
      setStudentsState(updated);
    }
  }

  function handleStatusChange(
    studentId: string,
    status: "PRESENT" | "ABSENT" | "JUSTIFIED"
  ) {
    setStudentsState((prev) => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        status,
      },
    }));
  }

  function handleJustificationChange(studentId: string, justification: string) {
    setStudentsState((prev) => ({
      ...prev,
      [studentId]: {
        ...(prev[studentId] || { status: "PRESENT", justification: "" }),
        justification,
      },
    }));
  }

  function handleMarkAllPresent() {
    if (!currentClass?.students) return;
    const updated: Record<
      string,
      { status: "PRESENT" | "ABSENT" | "JUSTIFIED"; justification: string }
    > = {};
    for (const st of currentClass.students) {
      updated[st.id] = {
        status: "PRESENT",
        justification: "",
      };
    }
    setStudentsState(updated);
  }

  const studentsList = currentClass?.students || [];

  // Contagens
  const presentCount = Object.values(studentsState).filter(
    (s) => s.status === "PRESENT"
  ).length;
  const absentCount = Object.values(studentsState).filter(
    (s) => s.status === "ABSENT"
  ).length;
  const justifiedCount = Object.values(studentsState).filter(
    (s) => s.status === "JUSTIFIED"
  ).length;

  function handleSaveAttendance() {
    if (!currentClass) return;
    setFeedback(null);

    const records = studentsList.map((st) => ({
      studentId: st.id,
      status: studentsState[st.id]?.status || "PRESENT",
      justification: studentsState[st.id]?.justification || "",
    }));

    startTransition(async () => {
      const res = await saveAttendanceAction({
        classId: currentClass.id,
        date,
        topic,
        records,
      });

      if (res.success) {
        setFeedback({
          type: "success",
          text: res.message || "Frequência gravada com sucesso!",
        });
      } else {
        setFeedback({
          type: "error",
          text: res.error || "Ocorreu um erro ao salvar o diário.",
        });
      }
    });
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            <CalendarCheck className="h-6 w-6 text-indigo-600" />
            Diário de Frequência & Aulas
          </h2>
          <p className="text-sm text-slate-500">
            Registro de presenças, faltas e justificativas por aula e professor.
          </p>
        </div>
        <Button
          onClick={handleSaveAttendance}
          disabled={isPending || studentsList.length === 0}
          className="gap-2 cursor-pointer bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm"
        >
          {isPending ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Gravando Chamada...
            </>
          ) : (
            <>
              <Save className="h-4 w-4" />
              Salvar Frequência
            </>
          )}
        </Button>
      </div>

      {feedback && (
        <div
          className={`p-4 rounded-xl flex items-center gap-3 text-sm animate-in fade-in duration-200 ${
            feedback.type === "success"
              ? "bg-emerald-50 border border-emerald-200 text-emerald-800"
              : "bg-rose-50 border border-rose-200 text-rose-800"
          }`}
        >
          {feedback.type === "success" ? (
            <CheckCircle2 className="h-5 w-5 text-emerald-600 flex-shrink-0" />
          ) : (
            <AlertCircle className="h-5 w-5 text-rose-600 flex-shrink-0" />
          )}
          <span>{feedback.text}</span>
        </div>
      )}

      {/* Filtros de Aula */}
      <Card className="border-slate-200 shadow-sm">
        <CardContent className="pt-6">
          <div className="grid gap-4 md:grid-cols-4">
            <div>
              <Label htmlFor="classSelect">Turma Selecionada *</Label>
              <select
                id="classSelect"
                value={selectedClassId}
                onChange={(e) => handleClassChange(e.target.value)}
                className="w-full h-9 rounded-md border border-slate-200 bg-white px-3 text-xs mt-1.5 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-medium"
              >
                {classes.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.shift === "MORNING" ? "Manhã" : c.shift === "NIGHT" ? "Noite" : "Tarde"})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <Label htmlFor="subjectInput">Disciplina / Frente de Ensino</Label>
              <Input
                id="subjectInput"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                className="mt-1.5 h-9 text-xs"
              />
            </div>

            <div>
              <Label htmlFor="dateInput">Data da Aula</Label>
              <Input
                id="dateInput"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="mt-1.5 h-9 text-xs"
              />
            </div>

            <div>
              <Label htmlFor="profInput">Professor Responsável</Label>
              <Input
                id="profInput"
                value={currentUserName}
                disabled
                className="mt-1.5 h-9 text-xs bg-slate-50 text-slate-700 font-medium"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Chamada dos Alunos */}
      <Card className="border-slate-200 shadow-sm">
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <CardTitle className="text-base text-slate-900">
                Lista de Alunos Matriculados
              </CardTitle>
              <CardDescription className="text-xs">
                {currentClass?.name} • Total de{" "}
                <strong>{studentsList.length}</strong> alunos matriculados
              </CardDescription>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 text-xs font-semibold">
                <span className="px-2 py-1 bg-emerald-50 text-emerald-700 rounded-md border border-emerald-200">
                  {presentCount} Presentes
                </span>
                <span className="px-2 py-1 bg-rose-50 text-rose-700 rounded-md border border-rose-200">
                  {absentCount} Faltas
                </span>
                <span className="px-2 py-1 bg-amber-50 text-amber-700 rounded-md border border-amber-200">
                  {justifiedCount} Justificadas
                </span>
              </div>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={handleMarkAllPresent}
                className="text-xs text-emerald-700 border-emerald-200 hover:bg-emerald-50"
              >
                Marcar Todos Presentes
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {studentsList.length === 0 ? (
            <div className="text-center py-12 text-slate-500 text-sm">
              <Users className="h-10 w-10 text-slate-300 mx-auto mb-2" />
              Nenhum aluno matriculado nesta turma ainda.
            </div>
          ) : (
            <div className="rounded-xl border border-slate-200 overflow-hidden">
              <Table>
                <TableHeader className="bg-slate-50">
                  <TableRow>
                    <TableHead className="w-12 text-center">#</TableHead>
                    <TableHead>Nome do Aluno</TableHead>
                    <TableHead className="text-center w-64">Status de Presença</TableHead>
                    <TableHead>Justificativa de Falta (Se houver)</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {studentsList.map((student, idx) => {
                    const currentStatus =
                      studentsState[student.id]?.status || "PRESENT";
                    const currentJust =
                      studentsState[student.id]?.justification || "";

                    return (
                      <TableRow key={student.id} className="hover:bg-slate-50/70">
                        <TableCell className="text-center font-mono text-xs text-slate-400">
                          {idx + 1}
                        </TableCell>
                        <TableCell>
                          <p className="font-semibold text-slate-900 text-xs sm:text-sm">
                            {student.name}
                          </p>
                          {student.cpf && (
                            <p className="text-[11px] text-slate-400 font-mono">
                              CPF: {student.cpf}
                            </p>
                          )}
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="inline-flex rounded-lg border border-slate-200 p-0.5 bg-slate-100/70 shadow-2xs">
                            <button
                              type="button"
                              onClick={() => handleStatusChange(student.id, "PRESENT")}
                              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all cursor-pointer ${
                                currentStatus === "PRESENT"
                                  ? "bg-emerald-600 text-white shadow-xs"
                                  : "text-slate-600 hover:text-slate-900"
                              }`}
                            >
                              Presente
                            </button>
                            <button
                              type="button"
                              onClick={() => handleStatusChange(student.id, "ABSENT")}
                              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all cursor-pointer ${
                                currentStatus === "ABSENT"
                                  ? "bg-rose-600 text-white shadow-xs"
                                  : "text-slate-600 hover:text-slate-900"
                              }`}
                            >
                              Falta
                            </button>
                            <button
                              type="button"
                              onClick={() => handleStatusChange(student.id, "JUSTIFIED")}
                              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all cursor-pointer ${
                                currentStatus === "JUSTIFIED"
                                  ? "bg-amber-500 text-white shadow-xs"
                                  : "text-slate-600 hover:text-slate-900"
                              }`}
                            >
                              Justificada
                            </button>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Input
                            placeholder="Ex: Atestado médico, consulta, trânsito..."
                            value={currentJust}
                            onChange={(e) =>
                              handleJustificationChange(student.id, e.target.value)
                            }
                            className="h-8 text-xs max-w-sm border-slate-200"
                          />
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
    </div>
  );
}
