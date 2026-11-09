import { db } from "@/db";
import { classes, courses } from "@/db/schema";
import { formatCurrency } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BookOpen, Users, Plus, School, Clock } from "lucide-react";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function ClassesPage() {
  let classList: any[] = [];

  try {
    classList = await db.query.classes.findMany({
      with: {
        course: true,
        enrollments: true,
      },
    });
  } catch (error) {
    console.warn("Database not yet connected or seeded. Showing placeholder classes.");
  }

  if (classList.length === 0) {
    classList = [
      {
        id: "1",
        name: "Turma Alfa - Medicina (Manhã)",
        shift: "MORNING",
        room: "Auditório 01",
        capacity: 45,
        isActive: true,
        course: {
          name: "Extensivo Medicina & Biológicas",
          durationMonths: 10,
          basePrice: "1250.00",
        },
        enrollments: new Array(38).fill(null), // 38 vagas ocupadas
      },
      {
        id: "2",
        name: "Turma Beta - Pré-Enem Intensivo (Noite)",
        shift: "NIGHT",
        room: "Sala 04",
        capacity: 50,
        isActive: true,
        course: {
          name: "Intensivo Enem & Redação",
          durationMonths: 6,
          basePrice: "680.00",
        },
        enrollments: new Array(42).fill(null), // 42 vagas ocupadas
      },
    ];
  }

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
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Criar Nova Turma
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {classList.map((item) => {
          const occupied = item.enrollments?.length || 0;
          const capacity = item.capacity;
          const percentage = Math.round((occupied / capacity) * 100);
          const isNearFull = percentage >= 85;

          return (
            <Card key={item.id} className="border-slate-200 shadow-sm flex flex-col justify-between">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div>
                    <Badge variant="outline" className="mb-2">
                      {item.course?.name || "Curso Geral"}
                    </Badge>
                    <CardTitle className="text-lg font-bold text-slate-900">
                      {item.name}
                    </CardTitle>
                    <CardDescription className="flex items-center gap-2 mt-1">
                      <School className="h-3.5 w-3.5 text-slate-400" />
                      {item.room}
                      <span className="text-slate-300">•</span>
                      <Clock className="h-3.5 w-3.5 text-slate-400" />
                      Turno: {item.shift === "MORNING" ? "Manhã" : item.shift === "NIGHT" ? "Noite" : "Tarde"}
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
                    <p className={`font-bold ${capacity - occupied <= 5 ? "text-rose-600" : "text-emerald-600"}`}>
                      {capacity - occupied} restantes
                    </p>
                  </div>
                </div>

                <div className="flex gap-2 pt-2">
                  <Link href="/academic/enrollments/new" className="flex-1">
                    <Button variant="default" size="sm" className="w-full text-xs">
                      Matricular nesta Turma
                    </Button>
                  </Link>
                  <Button variant="outline" size="sm" className="text-xs">
                    Ver Alunos
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

