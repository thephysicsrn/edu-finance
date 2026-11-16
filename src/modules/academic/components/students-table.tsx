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
  Pencil,
  Ban,
  CheckCircle2,
} from "lucide-react";
import Link from "next/link";
import {
  TransferClassModal,
  AvailableClassOption,
} from "./transfer-class-modal";
import {
  EditStudentModal,
  StudentEditData,
} from "./edit-student-modal";
import {
  CancelEnrollmentModal,
  CancelEnrollmentData,
} from "./cancel-enrollment-modal";

export interface StudentItem {
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
    phone: string;
    relationship?: string;
    address?: string | null;
  } | null;
  enrollments?: Array<{
    id: string;
    enrollmentNumber?: string;
    status: string;
    classId?: string;
    cancelledAt?: string | null;
    cancellationReason?: string | null;
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
  initialClassFilter?: string;
}

export function StudentsTable({
  initialStudents,
  availableClasses,
  initialClassFilter = "ALL",
}: StudentsTableProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedClassFilter, setSelectedClassFilter] = useState<string>(initialClassFilter);

  // Modais de Ação
  const [activeTransferModal, setActiveTransferModal] = useState<{
    student: {
      id: string;
      fullName: string;
      enrollmentId: string;
      currentClassId: string;
      currentClassName: string;
    };
  } | null>(null);

  const [activeEditModal, setActiveEditModal] = useState<StudentEditData | null>(null);
  const [activeCancelModal, setActiveCancelModal] = useState<CancelEnrollmentData | null>(null);

  const filteredStudents = initialStudents.filter((st) => {
    const term = searchTerm.toLowerCase();
    const nameMatch = st.fullName.toLowerCase().includes(term);
    const cpfMatch = (st.cpf || "").replace(/\D/g, "").includes(term.replace(/\D/g, ""));
    const guardianMatch = (st.guardian?.fullName || "").toLowerCase().includes(term);
    const matchesSearch = nameMatch || cpfMatch || guardianMatch;

    const matchesClass =
      selectedClassFilter === "ALL" ||
      st.enrollments?.some(
        (e) =>
          e.classId === selectedClassFilter ||
          e.class?.id === selectedClassFilter
      );

    return matchesSearch && matchesClass;
  });

  return (
    <div className="space-y-4">
      {/* Barra de Busca e Filtro */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex flex-1 flex-col sm:flex-row items-center gap-3 w-full">
          <div className="w-full sm:w-80 relative">
            <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <Input
              placeholder="Buscar por aluno, CPF ou responsável..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 h-9 text-xs"
            />
          </div>

          <select
            value={selectedClassFilter}
            onChange={(e) => setSelectedClassFilter(e.target.value)}
            className="w-full sm:w-auto h-9 rounded-md border border-slate-200 bg-white px-3 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500 font-medium"
          >
            <option value="ALL">Todas as Turmas ({initialStudents.length} alunos)</option>
            {availableClasses.map((cls) => (
              <option key={cls.id} value={cls.id}>
                {cls.name}
              </option>
            ))}
          </select>
        </div>
        <p className="text-xs text-slate-500 whitespace-nowrap">
          Exibindo <span className="font-semibold text-slate-800">{filteredStudents.length}</span> alunos
        </p>
      </div>

      {filteredStudents.length === 0 ? (
        <div className="text-center py-12 text-slate-500 text-sm">
          Nenhum aluno encontrado para os critérios de busca.
        </div>
      ) : (
        <div className="rounded-xl border border-slate-200 overflow-hidden shadow-2xs">
          <Table>
            <TableHeader className="bg-slate-50">
              <TableRow>
                <TableHead>Nome do Aluno</TableHead>
                <TableHead>CPF / Nascimento</TableHead>
                <TableHead>Responsável Legal</TableHead>
                <TableHead>Turma(s) Matriculada(s)</TableHead>
                <TableHead className="text-center">Status</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredStudents.map((st) => {
                const activeEnrollments = (st.enrollments || []).filter(
                  (en) => en.status === "ACTIVE"
                );
                const primaryEnrollment = st.enrollments?.[0];
                const isMultiClass = activeEnrollments.length > 1;

                const isCancelled = primaryEnrollment?.status === "CANCELLED";

                return (
                  <TableRow key={st.id} className="hover:bg-slate-50/70">
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div>
                          <p className="font-semibold text-slate-900 text-sm flex items-center gap-1.5">
                            {st.fullName}
                            {isMultiClass && (
                              <Badge
                                variant="outline"
                                className="bg-indigo-50 text-indigo-700 border-indigo-200 text-[10px] py-0 px-1.5"
                              >
                                {activeEnrollments.length} cursinhos
                              </Badge>
                            )}
                          </p>
                          {st.phone && (
                            <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                              <Phone className="h-3 w-3" />
                              {formatPhone(st.phone)}
                            </p>
                          )}
                        </div>
                      </div>
                    </TableCell>

                    <TableCell>
                      <p className="font-mono text-xs text-slate-700">
                        {formatCPF(st.cpf)}
                      </p>
                      <p className="text-xs text-slate-400 mt-0.5">
                        {formatDate(st.birthDate)}
                      </p>
                    </TableCell>

                    <TableCell>
                      <p className="text-xs font-medium text-slate-800">
                        {st.guardian?.fullName || (
                          <span className="text-slate-400 italic">O próprio aluno</span>
                        )}
                      </p>
                      {st.guardian?.phone && (
                        <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                          <Phone className="h-3 w-3" />
                          {formatPhone(st.guardian.phone)}
                        </p>
                      )}
                    </TableCell>

                    {/* Turmas Vinculadas (Suporta Multiturma / Múltiplos Cursinhos) */}
                    <TableCell>
                      {activeEnrollments.length === 0 ? (
                        <div className="space-y-1">
                          <span className="text-xs text-slate-400 italic">
                            {isCancelled ? "Matrícula Cancelada" : "Sem turma ativa"}
                          </span>
                          {primaryEnrollment?.cancellationReason && (
                            <p className="text-[11px] text-rose-600/80">
                              Motivo: {primaryEnrollment.cancellationReason}
                            </p>
                          )}
                        </div>
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
                            : primaryEnrollment?.status === "CANCELLED"
                            ? "destructive"
                            : primaryEnrollment?.status === "SUSPENDED"
                            ? "warning"
                            : "secondary"
                        }
                      >
                        {primaryEnrollment?.status === "ACTIVE"
                          ? "Ativa"
                          : primaryEnrollment?.status === "CANCELLED"
                          ? "Cancelada"
                          : primaryEnrollment?.status === "SUSPENDED"
                          ? "Trancada"
                          : "Pendente"}
                      </Badge>
                    </TableCell>

                    {/* Ações: Editar, Transferência, Folha do Pai, Comprovante e Cancelar */}
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {/* Botão de Edição de Dados */}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setActiveEditModal(st)}
                          className="h-8 gap-1 text-xs text-slate-700 hover:text-slate-900 border-slate-200 hover:bg-slate-50"
                          title="Editar dados cadastrais do aluno e responsável"
                        >
                          <Pencil className="h-3.5 w-3.5 text-slate-500" />
                          Editar
                        </Button>

                        {/* Botão de Transferência de Turma (Apenas para matrículas ativas) */}
                        {primaryEnrollment && primaryEnrollment.class && primaryEnrollment.status === "ACTIVE" && (
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

                        {/* Botão de Cancelar Matrícula (Se estiver ativa) */}
                        {primaryEnrollment && primaryEnrollment.status === "ACTIVE" && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              setActiveCancelModal({
                                enrollmentId: primaryEnrollment.id,
                                enrollmentNumber: primaryEnrollment.enrollmentNumber || "MAT",
                                studentName: st.fullName,
                                className: primaryEnrollment.class?.name || "Turma Geral",
                              })
                            }
                            className="h-8 gap-1 text-xs text-rose-700 hover:text-rose-800 border-rose-200 hover:bg-rose-50"
                            title="Cancelar vínculo de matrícula deste aluno"
                          >
                            <Ban className="h-3.5 w-3.5 text-rose-500" />
                            Cancelar
                          </Button>
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

      {/* Modal de Edição de Dados Cadastrais */}
      {activeEditModal && (
        <EditStudentModal
          isOpen={true}
          onClose={() => setActiveEditModal(null)}
          student={activeEditModal}
          onSuccess={() => {
            window.location.reload();
          }}
        />
      )}

      {/* Modal de Cancelamento de Matrícula */}
      {activeCancelModal && (
        <CancelEnrollmentModal
          isOpen={true}
          onClose={() => setActiveCancelModal(null)}
          data={activeCancelModal}
          onSuccess={() => {
            window.location.reload();
          }}
        />
      )}
    </div>
  );
}
