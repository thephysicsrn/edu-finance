"use client";

import { useState } from "react";
import Link from "next/link";
import { formatCurrency } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BookOpen, Users, Plus, School, Clock, ArrowRight } from "lucide-react";
import { CreateClassModal, CourseOption } from "./create-class-modal";

export interface ClassViewItem {
  id: string;
  name: string;
  shift: string;
  room: string;
  capacity: number;
  isActive: boolean;
  course?: {
    name: string;
    durationMonths: number;
    basePrice: string | number;
  } | null;
  enrollments?: any[];
}

interface ClassesPageClientProps {
  initialClasses: ClassViewItem[];
  availableCourses: CourseOption[];
}

export function ClassesPageClient({
  initialClasses,
  availableCourses,
}: ClassesPageClientProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            <BookOpen className="h-6 w-6 text-indigo-600" />
            Cursos, Turmas e Lotação
          </h2>
          <p className="text-sm text-slate-500">
            Acompanhamento de salas, turnos e capacidade máxima de alunos por turma.
          </p>
        </div>
        <div className="flex gap-3">
          <Button
            onClick={() => setIsModalOpen(true)}
            className="gap-2 cursor-pointer bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm"
          >
            <Plus className="h-4 w-4" />
            Criar Nova Turma
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {initialClasses.map((item) => {
          const occupied = item.enrollments?.length || 0;
          const capacity = item.capacity;
          const percentage = capacity > 0 ? Math.round((occupied / capacity) * 100) : 0;
          const isNearFull = percentage >= 85;

          return (
            <Card
              key={item.id}
              className="border-slate-200 shadow-sm flex flex-col justify-between hover:border-slate-300 transition-all"
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div>
                    <Badge variant="outline" className="mb-2 bg-indigo-50/50 text-indigo-700 border-indigo-200">
                      {item.course?.name || "Curso Preparatório"}
                    </Badge>
                    <CardTitle className="text-lg font-bold text-slate-900">
                      {item.name}
                    </CardTitle>
                    <CardDescription className="flex items-center gap-2 mt-1">
                      <School className="h-3.5 w-3.5 text-slate-400" />
                      {item.room}
                      <span className="text-slate-300">•</span>
                      <Clock className="h-3.5 w-3.5 text-slate-400" />
                      Turno:{" "}
                      {item.shift === "MORNING"
                        ? "Manhã"
                        : item.shift === "NIGHT"
                        ? "Noite"
                        : item.shift === "AFTERNOON"
                        ? "Tarde"
                        : "Integral"}
                    </CardDescription>
                  </div>
                  <Badge variant={item.isActive ? "success" : "secondary"}>
                    {item.isActive ? "Ativa" : "Inativa"}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Indicador de Lotação */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500 font-medium flex items-center gap-1">
                      <Users className="h-3.5 w-3.5" /> Ocupação de Vagas:
                    </span>
                    <span className="font-bold text-slate-900">
                      {occupied} / {capacity} ({percentage}%)
                    </span>
                  </div>
                  <div className="w-full h-2.5 rounded-full bg-slate-100 overflow-hidden">
                    <div
                      className={`h-full transition-all rounded-full ${
                        isNearFull ? "bg-amber-500" : "bg-indigo-600"
                      }`}
                      style={{ width: `${Math.min(percentage, 100)}%` }}
                    />
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-between text-xs">
                  <div>
                    <span className="text-slate-400">Mensalidade Padrão:</span>
                    <p className="font-semibold text-slate-800">
                      {formatCurrency(item.course?.basePrice || 0)}/mês
                    </p>
                  </div>
                  <div>
                    <span className="text-slate-400">Duração:</span>
                    <p className="font-semibold text-slate-800">
                      {item.course?.durationMonths || 0} meses
                    </p>
                  </div>
                  <div>
                    <span className="text-slate-400">Vagas Livres:</span>
                    <p
                      className={`font-bold ${
                        capacity - occupied <= 5
                          ? "text-rose-600"
                          : "text-emerald-600"
                      }`}
                    >
                      {Math.max(0, capacity - occupied)} restantes
                    </p>
                  </div>
                </div>

                <div className="flex gap-2 pt-2">
                  <Link href={`/academic/enrollments/new?classId=${item.id}`} className="flex-1">
                    <Button variant="default" size="sm" className="w-full text-xs">
                      Matricular nesta Turma
                    </Button>
                  </Link>
                  <Link href={`/academic/students?classId=${item.id}`}>
                    <Button variant="outline" size="sm" className="text-xs gap-1">
                      Ver Alunos
                      <ArrowRight className="h-3 w-3" />
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <CreateClassModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        availableCourses={availableCourses}
      />
    </div>
  );
}
