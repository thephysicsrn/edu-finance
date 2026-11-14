"use client";

import { useState } from "react";
import { formatCPF, formatPhone, formatDate } from "@/lib/utils";
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
import {
  Search,
  Phone,
  Printer,
  ArrowRightLeft,
  School,
  Layers,
  KeyRound,
} from "lucide-react";
import Link from "next/link";
import {
  TransferClassModal,
  AvailableClassOption,
} from "./transfer-class-modal";

export interface StudentItem {
  id: string;
  fullName: string;
  cpf?: string | null;
  birthDate: string;
  email?: string | null;
  phone?: string | null;
  guardian?: {
    fullName: string;
    phone: string;
  } | null;
  enrollments?: Array<{
    id: string;
    status: string;
    classId?: string;
    class?: {
      id: string;
      name: string;
      shift: string;
    } | null;
  }>;
}

interface StudentsTableProps {
  initialStudents: StudentItem[];
  availableClasses: AvailableClassOption[];
}

export function StudentsTable({
  initialStudents,
  availableClasses,
}: StudentsTableProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTransferModal, setActiveTransferModal] = useState<{
    student: {
      id: string;
      fullName: string;
      enrollmentId: string;
      currentClassId: string;
      currentClassName: string;
    };
  } | null>(null);

  const filteredStudents = initialStudents.filter((st) => {
    const term = searchTerm.toLowerCase();
    const nameMatch = st.fullName.toLowerCase().includes(term);
    const cpfMatch = (st.cpf || "").replace(/\D/g, "").includes(term.replace(/\D/g, ""));
    const guardianMatch = (st.guardian?.fullName || "").toLowerCase().includes(term);
    return nameMatch || cpfMatch || guardianMatch;
  });

  return (
    <div className="space-y-4">
      {/* Barra de Busca e Filtro */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="w-full sm:w-80 relative">
          <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <Input
            placeholder="Buscar por aluno, CPF ou responsável..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 h-9 text-xs"
          />
        </div>
        <p className="text-xs text-slate-500">
          Exibindo <span className="font-semibold text-slate-800">{filteredStudents.length}</span> alunos
        </p>
      </div>

      {filteredStudents.length === 0 ? (
        <div className="text-center py-12 text-slate-500 text-sm">
          Nenhum aluno encontrado para os critérios de busca.
        </div>
      ) : (
        <div className="rounded-xl border border-slate-200 overflow-hidden">
          <Table>
            <TableHeader className="bg-slate-50">
              <TableRow>
                <TableHead>Nome do Aluno</TableHead>
                <TableHead>CPF / Nascimento</TableHead>
                <TableHead>Responsável Legal</TableHead>
                <TableHead>Turmas Vinculadas</TableHead>
                <TableHead className="text-center">Status</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredStudents.map((st) => {
                const activeEnrollments = (st.enrollments || []).filter(
                  (e) => e.status === "ACTIVE" || e.status === "PENDING_PAYMENT"
                );
                const primaryEnrollment = activeEnrollments[0] || st.enrollments?.[0];
                const isMultiClass = activeEnrollments.length > 1;

                return (
                  <TableRow key={st.id} className="hover:bg-slate-50/70">
                    <TableCell>
                      <p className="font-semibold text-slate-900">{st.fullName}</p>
                      <p className="text-xs text-slate-500">{st.email || "Sem e-mail cadastrado"}</p>
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

                    {/* Turmas Vinculadas (Suporta Multiturma / Múltiplos Cursinhos) */}
                    <TableCell>
                      {activeEnrollments.length === 0 ? (
                        <span className="text-xs text-slate-400 italic">Sem turma ativa</span>
                      ) : (
                        <div className="space-y-1">
                          {activeEnrollments.map((en) => (
                            <div key={en.id} className="flex items-center gap-1.5">
                              <span className="text-xs font-medium text-slate-800">
                                {en.class?.name || "Turma Geral"}
                              </span>
                              {isMultiClass && (
                                <Badge variant="outline" className="text-[10px] py-0 px-1.5 text-indigo-700 bg-indigo-50 border-indigo-200">
                                  Multiturma
                                </Badge>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </TableCell>

                    <TableCell className="text-center">
                      <Badge
                        variant={
                          primaryEnrollment?.status === "ACTIVE"
                            ? "success"
                            : "secondary"
                        }
                      >
                        {primaryEnrollment?.status || "PENDENTE"}
                      </Badge>
                    </TableCell>

                    {/* Ações: Transferência de Turma e Comprovante */}
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {/* Botão de Transferência de Turma */}
                        {primaryEnrollment && primaryEnrollment.class && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              setActiveTransferModal({
                                student: {
                                  id: st.id,
                                  fullName: st.fullName,
                                  enrollmentId: primaryEnrollment.id,
                                  currentClassId: primaryEnrollment.class!.id,
                                  currentClassName: primaryEnrollment.class!.name,
                                },
                              })
                            }
                            className="h-8 gap-1 text-xs text-amber-700 hover:text-amber-800 border-amber-200 hover:bg-amber-50"
                            title="Transferir este aluno para outra turma"
                          >
                            <ArrowRightLeft className="h-3.5 w-3.5" />
                            Transferir
                          </Button>
                        )}

                        {/* Botão de Folha de Acesso do Pai / Responsável */}
                        {primaryEnrollment && (
                          <Link
                            href={`/academic/enrollments/${primaryEnrollment.id}/guardian-access`}
                            target="_blank"
                            title="Imprimir Folha de Acesso do Responsável Legal"
                          >
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-8 gap-1 text-xs text-emerald-700 hover:text-emerald-800 border-emerald-200 hover:bg-emerald-50"
                            >
                              <KeyRound className="h-3.5 w-3.5" />
                              Folha do Pai
                            </Button>
                          </Link>
                        )}

                        {/* Botão de Comprovante de Matrícula */}
                        {primaryEnrollment && (
                          <Link
                            href={`/academic/enrollments/${primaryEnrollment.id}/receipt`}
                            target="_blank"
                            title="Imprimir Comprovante de Matrícula"
                          >
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-8 gap-1 text-xs text-indigo-700 hover:text-indigo-800 border-indigo-200 hover:bg-indigo-50"
                            >
                              <Printer className="h-3.5 w-3.5" />
                              Comprovante
                            </Button>
                          </Link>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Modal de Transferência de Turma */}
      {activeTransferModal && (
        <TransferClassModal
          isOpen={true}
          onClose={() => setActiveTransferModal(null)}
          student={activeTransferModal.student}
          availableClasses={availableClasses}
          onSuccess={() => {
            window.location.reload();
          }}
        />
      )}
    </div>
  );
}
