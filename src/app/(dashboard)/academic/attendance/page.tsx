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
import { CalendarCheck, Check, X, FileText, Save } from "lucide-react";

export const dynamic = "force-dynamic";

export default function AttendancePage() {
  const mockStudents = [
    { id: "1", name: "Lucas Silveira Santos", status: "PRESENT", justification: "" },
    { id: "2", name: "Beatriz Helena Costa", status: "PRESENT", justification: "" },
    { id: "3", name: "Gabriel Duarte Mendes", status: "ABSENT", justification: "Consulta Médica" },
    { id: "4", name: "Mariana Souza Ribeiro", status: "PRESENT", justification: "" },
    { id: "5", name: "Rafael Nogueira Lima", status: "PRESENT", justification: "" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            <CalendarCheck className="h-6 w-6 text-indigo-600" />
            Diário de Frequência & Aulas
          </h2>
          <p className="text-sm text-slate-500">
            Registro de presenças, faltas e justificativas por aula e professor.
          </p>
        </div>
        <Button className="gap-2">
          <Save className="h-4 w-4" />
          Salvar Frequência
        </Button>
      </div>

      {/* Filtros de Aula */}
      <Card className="border-slate-200 shadow-sm">
        <CardContent className="pt-6">
          <div className="grid gap-4 md:grid-cols-4">
            <div>
              <Label>Turma</Label>
              <select className="w-full h-9 rounded-md border border-slate-200 bg-white px-3 text-sm mt-1.5 focus:outline-none focus:ring-1 focus:ring-indigo-500">
                <option>Turma Alfa - Medicina (Manhã)</option>
                <option>Turma Beta - Enem Intensivo (Noite)</option>
              </select>
            </div>

            <div>
              <Label>Disciplina / Frente</Label>
              <Input defaultValue="Física 1 (Mecânica e Cinemática)" className="mt-1.5" />
            </div>

            <div>
              <Label>Data da Aula</Label>
              <Input type="date" defaultValue="2026-11-02" className="mt-1.5" />
            </div>

            <div>
              <Label>Professor Responsável</Label>
              <Input defaultValue="Prof. Carlos Eduardo" disabled className="mt-1.5 bg-slate-50" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Chamada dos Alunos */}
      <Card className="border-slate-200 shadow-sm">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base">Lista de Alunos Matriculados</CardTitle>
              <CardDescription>
                Turma Alfa - Medicina (Total: 5 alunos listados)
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" className="text-xs text-emerald-700">
                Marcar Todos Presentes
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12 text-center">#</TableHead>
                <TableHead>Nome do Aluno</TableHead>
                <TableHead className="text-center">Status de Presença</TableHead>
                <TableHead>Justificativa de Falta (Se houver)</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockStudents.map((student, idx) => (
                <TableRow key={student.id}>
                  <TableCell className="text-center font-mono text-xs text-slate-400">
                    {idx + 1}
                  </TableCell>
                  <TableCell className="font-medium text-slate-900">
                    {student.name}
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="inline-flex rounded-md border border-slate-200 p-0.5 bg-slate-50">
                      <button
                        type="button"
                        className={`px-3 py-1 text-xs font-semibold rounded ${
                          student.status === "PRESENT"
                            ? "bg-emerald-600 text-white shadow-sm"
                            : "text-slate-600 hover:text-slate-900"
                        }`}
                      >
                        Presente
                      </button>
                      <button
                        type="button"
                        className={`px-3 py-1 text-xs font-semibold rounded ${
                          student.status === "ABSENT"
                            ? "bg-rose-600 text-white shadow-sm"
                            : "text-slate-600 hover:text-slate-900"
                        }`}
                      >
                        Falta
                      </button>
                      <button
                        type="button"
                        className="px-3 py-1 text-xs font-semibold rounded text-slate-600 hover:text-slate-900"
                      >
                        Justificada
                      </button>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Input
                      placeholder="Ex: Atestado médico, dispensado..."
                      defaultValue={student.justification}
                      className="h-8 text-xs max-w-sm"
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

