import { db } from "@/db";
import { students } from "@/db/schema";
import { formatCPF, formatPhone, formatDate } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Users, Search, UserPlus, Phone, Mail, Printer, Eye } from "lucide-react";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function StudentsPage() {
  let studentList: any[] = [];

  try {
    studentList = await db.query.students.findMany({
      with: {
        guardian: true,
        enrollments: {
          with: {
            class: true,
          },
        },
      },
      limit: 50,
    });
  } catch (error) {
    console.warn("Database not yet connected or seeded. Showing placeholder student list.");
  }

  // Preenche dados demonstrativos caso ainda não existam no banco
  if (studentList.length === 0) {
    studentList = [
      {
        id: "demo-st-1",
        fullName: "Lucas Silveira Santos",
        cpf: "98765432100",
        birthDate: "2008-05-14",
        email: "lucas.silveira@email.com",
        phone: "11977776666",
        guardian: {
          fullName: "Mariana Alencar Silveira",
          phone: "11988887777",
        },
        enrollments: [
          {
            id: "demo-en-1",
            status: "ACTIVE",
            class: {
              name: "Turma Alfa - Medicina (Manhã)",
            },
          },
        ],
      },
      {
        id: "demo-st-2",
        fullName: "Beatriz Nogueira Ribeiro",
        cpf: "45678912300",
        birthDate: "2007-09-22",
        email: "beatriz.ribeiro@email.com",
        phone: "11966665555",
        guardian: {
          fullName: "Carlos Eduardo Ribeiro",
          phone: "11955554444",
        },
        enrollments: [
          {
            id: "demo-en-2",
            status: "ACTIVE",
            class: {
              name: "Turma Beta - ITA/IME & Exatas (Tarde)",
            },
          },
        ],
      },
    ];
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            <Users className="h-6 w-6 text-indigo-600" />
            Alunos & Cadastros
          </h2>
          <p className="text-sm text-slate-500">
            Listagem geral de alunos matriculados e seus respectivos responsáveis legais.
          </p>
        </div>
        <Link href="/academic/enrollments/new">
          <Button className="gap-2">
            <UserPlus className="h-4 w-4" />
            Nova Matrícula
          </Button>
        </Link>
      </div>

      <Card className="border-slate-200 shadow-sm">
        <CardHeader className="pb-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="w-full sm:w-80 relative">
              <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <Input
                placeholder="Buscar por nome do aluno ou CPF..."
                className="pl-9 h-9"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {studentList.length === 0 ? (
            <div className="text-center py-12 text-slate-500 text-sm">
              Nenhum aluno cadastrado. Utilize o botão &ldquo;Nova Matrícula&rdquo; para iniciar o cadastro.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome do Aluno</TableHead>
                  <TableHead>CPF / Nascimento</TableHead>
                  <TableHead>Responsável Legal</TableHead>
                  <TableHead>Turma Atual</TableHead>
                  <TableHead className="text-center">Status da Matrícula</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {studentList.map((st) => {
                  const activeEnrollment = st.enrollments?.[0];
                  return (
                    <TableRow key={st.id}>
                      <TableCell>
                        <p className="font-semibold text-slate-900">{st.fullName}</p>
                        <p className="text-xs text-slate-500">{st.email || "Sem e-mail"}</p>
                      </TableCell>

                      <TableCell className="text-xs font-mono">
                        <p>{formatCPF(st.cpf)}</p>
                        <p className="text-slate-400">{formatDate(st.birthDate)}</p>
                      </TableCell>

                      <TableCell>
                        <p className="text-sm font-medium text-slate-800">
                          {st.guardian?.fullName || "Não informado"}
                        </p>
                        <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                          <Phone className="h-3 w-3" />
                          {formatPhone(st.guardian?.phone)}
                        </p>
                      </TableCell>

                      <TableCell className="text-sm text-slate-700">
                        {activeEnrollment?.class?.name || "Sem turma vinculada"}
                      </TableCell>

                      <TableCell className="text-center">
                        <Badge
                          variant={
                            activeEnrollment?.status === "ACTIVE"
                              ? "success"
                              : "secondary"
                          }
                        >
                          {activeEnrollment?.status || "PENDENTE"}
                        </Badge>
                      </TableCell>

                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {activeEnrollment && (
                            <Link
                              href={`/academic/enrollments/${activeEnrollment.id}/receipt`}
                              target="_blank"
                              title="Imprimir Comprovante de Matrícula"
                            >
                              <Button variant="outline" size="sm" className="h-8 gap-1.5 text-xs text-indigo-700 hover:text-indigo-800 border-indigo-200 hover:bg-indigo-50">
                                <Printer className="h-3.5 w-3.5" />
                                Comprovante
                              </Button>
                            </Link>
                          )}
                          <Button variant="ghost" size="sm" className="h-8 text-xs text-slate-600">
                            Ficha
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

