"use client";

import { useState } from "react";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Printer,
  FileSpreadsheet,
  Layers,
  BookOpen,
  DollarSign,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  Building,
  Calendar,
  Filter,
} from "lucide-react";

export interface ClassFinancialDetail {
  classId: string;
  className: string;
  shift: string;
  enrollmentCount: number;
  totalTuition: number;        // Mensalidades (Serviço educacional)
  totalMaterial: number;       // Taxa de Material (Apostilas / didático discriminado)
  totalEnrollmentFee: number;  // Taxa de matrícula
  totalExpected: number;       // Soma total prevista
  totalPaid: number;           // Total recebido
  totalOverdue: number;        // Total em atraso
  recoveryRate: number;
  studentsList?: Array<{
    studentName: string;
    guardianName: string;
    tuitionValue: number;
    materialValue: number;
    invoicesCount: number;
    paidCount: number;
    pendingCount: number;
    status: string;
  }>;
}

interface FinancialReportByClassProps {
  initialClasses: ClassFinancialDetail[];
}

export function FinancialReportByClass({ initialClasses }: FinancialReportByClassProps) {
  const [selectedClassFilter, setSelectedClassFilter] = useState<string>("ALL");
  const [showStudentsBreakdown, setShowStudentsBreakdown] = useState<boolean>(true);

  const filteredClasses = selectedClassFilter === "ALL"
    ? initialClasses
    : initialClasses.filter((c) => c.classId === selectedClassFilter);

  // Totais Gerais Contábeis
  const grandExpected = filteredClasses.reduce((acc, c) => acc + c.totalExpected, 0);
  const grandTuition = filteredClasses.reduce((acc, c) => acc + c.totalTuition, 0);
  const grandMaterial = filteredClasses.reduce((acc, c) => acc + c.totalMaterial, 0);
  const grandFee = filteredClasses.reduce((acc, c) => acc + c.totalEnrollmentFee, 0);
  const grandPaid = filteredClasses.reduce((acc, c) => acc + c.totalPaid, 0);
  const grandOverdue = filteredClasses.reduce((acc, c) => acc + c.totalOverdue, 0);
  const grandRate = grandExpected > 0 ? Math.round((grandPaid / grandExpected) * 100) : 0;

  function handlePrintReport() {
    window.print();
  }

  function handleExportCsv() {
    const headers = [
      "Turma",
      "Turno",
      "Alunos Ativos",
      "Mensalidades (R$)",
      "Material Didático (R$)",
      "Taxa Matrícula (R$)",
      "Total Previsto (R$)",
      "Total Pago (R$)",
      "Total em Atraso (R$)",
      "Taxa Adimplência (%)",
    ];

    const rows = filteredClasses.map((c) => [
      `"${c.className}"`,
      `"${c.shift}"`,
      c.enrollmentCount,
      c.totalTuition.toFixed(2),
      c.totalMaterial.toFixed(2),
      c.totalEnrollmentFee.toFixed(2),
      c.totalExpected.toFixed(2),
      c.totalPaid.toFixed(2),
      c.totalOverdue.toFixed(2),
      `${c.recoveryRate}%`,
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute(
      "download",
      `relatorio_financeiro_por_turma_${new Date().toISOString().split("T")[0]}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  return (
    <div className="space-y-6">
      {/* Cabeçalho de Impressão Oficial (Aparece apenas na impressão) */}
      <div className="hidden print:block border-b-2 border-slate-900 pb-4 mb-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-xl font-black text-slate-900">CURSINHO PRÉ-VESTIBULAR & CONCURSOS</h1>
            <p className="text-xs text-slate-600">Relatório Administrativo de Fechamento Contábil por Turma</p>
          </div>
          <div className="text-right text-xs text-slate-500">
            <p>Data de Emissão: {formatDate(new Date())}</p>
            <p>Critério: Separação de Serviço Educacional vs. Material Didático</p>
          </div>
        </div>
      </div>

      {/* Barra de Ações Administrativas & Filtro por Turma */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 print:hidden">
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="h-4 w-4 text-slate-500" />
          <span className="text-xs font-semibold text-slate-700">Filtrar Turma:</span>
          <select
            value={selectedClassFilter}
            onChange={(e) => setSelectedClassFilter(e.target.value)}
            className="text-xs rounded-lg border border-slate-300 p-2 bg-white text-slate-900 font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
          >
            <option value="ALL">Todas as Turmas (Consolidado)</option>
            {initialClasses.map((c) => (
              <option key={c.classId} value={c.classId}>
                {c.className} ({c.shift === "MORNING" ? "Manhã" : c.shift === "NIGHT" ? "Noite" : "Tarde"})
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportCsv}
            className="text-xs gap-1.5 text-slate-700 hover:text-emerald-700 hover:bg-emerald-50 border-slate-300"
          >
            <FileSpreadsheet className="h-4 w-4 text-emerald-600" />
            Exportar Planilha (CSV)
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={handlePrintReport}
            className="text-xs gap-1.5 text-indigo-700 hover:text-indigo-800 hover:bg-indigo-50 border-indigo-200"
          >
            <Printer className="h-4 w-4 text-indigo-600" />
            Extrair / Imprimir Relatório
          </Button>
        </div>
      </div>

      {/* Cards de Resumo Contábil com Discriminação da Taxa de Material */}
      <div className="grid gap-4 grid-cols-2 md:grid-cols-4 print:grid-cols-4">
        <Card className="border-slate-200">
          <CardHeader className="pb-1 pt-4 px-4">
            <CardTitle className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Total Faturado Previsto
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <div className="text-xl font-extrabold text-slate-900">
              {formatCurrency(grandExpected)}
            </div>
            <div className="text-[11px] text-slate-500 mt-1 space-y-0.5">
              <p className="flex justify-between">
                <span>Mensalidades:</span>
                <span className="font-semibold">{formatCurrency(grandTuition)}</span>
              </p>
              <p className="flex justify-between text-amber-700 font-medium">
                <span>Material Didático:</span>
                <span className="font-bold">{formatCurrency(grandMaterial)}</span>
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200">
          <CardHeader className="pb-1 pt-4 px-4">
            <CardTitle className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider">
              Receita Liquidada (Pago)
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <div className="text-xl font-extrabold text-emerald-600">
              {formatCurrency(grandPaid)}
            </div>
            <p className="text-[11px] text-emerald-700/80 mt-1 flex items-center gap-1 font-medium">
              <ArrowUpRight className="h-3.5 w-3.5" /> {grandRate}% do previsto realizado
            </p>
          </CardContent>
        </Card>

        <Card className="border-slate-200">
          <CardHeader className="pb-1 pt-4 px-4">
            <CardTitle className="text-[11px] font-bold text-rose-700 uppercase tracking-wider">
              Inadimplência / Atraso
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <div className="text-xl font-extrabold text-rose-600">
              {formatCurrency(grandOverdue)}
            </div>
            <p className="text-[11px] text-rose-700/80 mt-1 flex items-center gap-1 font-medium">
              <ArrowDownRight className="h-3.5 w-3.5" /> Saldo a recuperar em cobrança
            </p>
          </CardContent>
        </Card>

        <Card className="border-slate-200">
          <CardHeader className="pb-1 pt-4 px-4">
            <CardTitle className="text-[11px] font-bold text-amber-800 uppercase tracking-wider">
              Taxa de Material Total
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <div className="text-xl font-extrabold text-amber-800">
              {formatCurrency(grandMaterial)}
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              Separado para critérios fiscais & contábeis
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabela de Fechamento Financeiro Dividida por Turma */}
      <Card className="border-slate-200 shadow-sm overflow-hidden">
        <CardHeader className="border-b border-slate-100 bg-slate-50/50 pb-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Layers className="h-5 w-5 text-indigo-600" />
                Quadro Contábil Dividido por Turma
              </CardTitle>
              <CardDescription className="text-xs">
                Valores discriminados entre Mensalidades do Curso e Material Didático para fins contábeis e fiscais.
              </CardDescription>
            </div>
            <div className="print:hidden">
              <label className="flex items-center gap-2 text-xs text-slate-600 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showStudentsBreakdown}
                  onChange={(e) => setShowStudentsBreakdown(e.target.checked)}
                  className="rounded text-indigo-600 focus:ring-indigo-500 h-4 w-4 cursor-pointer"
                />
                <span className="font-medium">Exibir alunos de cada turma</span>
              </label>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-slate-50">
                <TableRow>
                  <TableHead className="font-bold text-slate-900">Turma / Turno</TableHead>
                  <TableHead className="text-center font-bold text-slate-900">Alunos</TableHead>
                  <TableHead className="text-right font-bold text-slate-900">
                    Mensalidades
                    <span className="block text-[10px] font-normal text-slate-500">Serviço Educacional</span>
                  </TableHead>
                  <TableHead className="text-right font-bold text-amber-800">
                    Taxa Material
                    <span className="block text-[10px] font-normal text-amber-700">Apostilas / Livros</span>
                  </TableHead>
                  <TableHead className="text-right font-bold text-slate-900">Taxa Matrícula</TableHead>
                  <TableHead className="text-right font-bold text-slate-900">Total Previsto</TableHead>
                  <TableHead className="text-right font-bold text-emerald-700">Total Pago</TableHead>
                  <TableHead className="text-right font-bold text-rose-700">Em Atraso</TableHead>
                  <TableHead className="text-center font-bold text-slate-900">Adimplência</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredClasses.map((cf) => (
                  <TableRow key={cf.classId} className="hover:bg-slate-50/80">
                    <TableCell>
                      <p className="font-bold text-slate-900 text-sm">{cf.className}</p>
                      <p className="text-xs text-slate-500">
                        Turno: {cf.shift === "MORNING" ? "Manhã" : cf.shift === "NIGHT" ? "Noite" : "Tarde"}
                      </p>
                    </TableCell>

                    <TableCell className="text-center font-bold text-slate-800">
                      {cf.enrollmentCount}
                    </TableCell>

                    <TableCell className="text-right font-medium text-slate-700 text-xs">
                      {formatCurrency(cf.totalTuition)}
                    </TableCell>

                    <TableCell className="text-right font-bold text-amber-800 text-xs bg-amber-50/30">
                      {formatCurrency(cf.totalMaterial)}
                    </TableCell>

                    <TableCell className="text-right font-medium text-slate-600 text-xs">
                      {formatCurrency(cf.totalEnrollmentFee)}
                    </TableCell>

                    <TableCell className="text-right font-extrabold text-slate-900 text-xs">
                      {formatCurrency(cf.totalExpected)}
                    </TableCell>

                    <TableCell className="text-right font-bold text-emerald-600 text-xs">
                      {formatCurrency(cf.totalPaid)}
                    </TableCell>

                    <TableCell className="text-right font-semibold text-rose-600 text-xs">
                      {formatCurrency(cf.totalOverdue)}
                    </TableCell>

                    <TableCell className="text-center">
                      <Badge variant={cf.recoveryRate >= 80 ? "success" : "warning"}>
                        {cf.recoveryRate}%
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Detalhamento por Aluno de Cada Turma */}
      {showStudentsBreakdown && (
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
            <BookOpen className="h-4 w-4 text-indigo-600" />
            Discriminação por Aluno nas Turmas Selecionadas
          </h3>

          <div className="grid gap-4">
            {filteredClasses.map((cls) => {
              const students = cls.studentsList || [];
              if (students.length === 0) return null;

              return (
                <Card key={`students-${cls.classId}`} className="border-slate-200">
                  <CardHeader className="py-3 px-4 bg-slate-50/80 border-b border-slate-200 flex flex-row items-center justify-between">
                    <div>
                      <p className="font-bold text-xs text-slate-900">{cls.className}</p>
                      <p className="text-[11px] text-slate-500">
                        {students.length} alunos vinculados nesta turma
                      </p>
                    </div>
                    <Badge variant="outline" className="text-xs bg-white">
                      Material Total: {formatCurrency(cls.totalMaterial)}
                    </Badge>
                  </CardHeader>
                  <CardContent className="p-0">
                    <Table>
                      <TableHeader className="bg-slate-50/40">
                        <TableRow className="text-xs">
                          <TableHead className="h-8">Aluno</TableHead>
                          <TableHead className="h-8">Responsável Legal</TableHead>
                          <TableHead className="h-8 text-right">Mensalidade Curso</TableHead>
                          <TableHead className="h-8 text-right text-amber-800">Cota Material</TableHead>
                          <TableHead className="h-8 text-center">Faturas Pagas / Total</TableHead>
                          <TableHead className="h-8 text-center">Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {students.map((st, idx) => (
                          <TableRow key={idx} className="text-xs hover:bg-slate-50/60">
                            <TableCell className="font-semibold text-slate-900 py-2">
                              {st.studentName}
                            </TableCell>
                            <TableCell className="text-slate-600 py-2">
                              {st.guardianName}
                            </TableCell>
                            <TableCell className="text-right font-medium text-slate-800 py-2">
                              {formatCurrency(st.tuitionValue)}
                            </TableCell>
                            <TableCell className="text-right font-bold text-amber-700 py-2">
                              {formatCurrency(st.materialValue)}
                            </TableCell>
                            <TableCell className="text-center py-2">
                              <span className="font-semibold text-emerald-700">{st.paidCount}</span>
                              <span className="text-slate-400"> / {st.invoicesCount} parcelas</span>
                            </TableCell>
                            <TableCell className="text-center py-2">
                              <Badge
                                variant={st.pendingCount === 0 ? "success" : "secondary"}
                                className="text-[10px]"
                              >
                                {st.pendingCount === 0 ? "Em dia" : `${st.pendingCount} pendente(s)`}
                              </Badge>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
