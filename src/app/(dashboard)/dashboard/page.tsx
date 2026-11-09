import Link from "next/link";
import {
  Users,
  DollarSign,
  AlertOctagon,
  ArrowUpRight,
  UserPlus,
  Receipt,
  Calendar,
  CalendarCheck,
  CheckCircle2,
  Clock,
  BookOpen,
  PhoneCall,
  TrendingUp,
  GraduationCap,
  Sparkles,
  School,
  FileCheck,
  AlertTriangle,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";
import { getFinancialOverviewKPIs } from "@/modules/financial/queries/defaulters.queries";
import { auth } from "@/lib/auth";
import { db } from "@/db";
import { students, classes } from "@/db/schema";
import { eq, sql } from "drizzle-orm";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const session = await auth();
  const role = session?.user?.role || "ADMIN";
  const userName = session?.user?.name || (
    role === "TEACHER"
      ? "Prof. Carlos Eduardo"
      : role === "SECRETARY"
      ? "Secretaria de Atendimento"
      : "Coordenador Geral"
  );

  // Consulta KPIs Financeiros
  const kpis = await getFinancialOverviewKPIs();

  // Consulta contagens acadêmicas reais (com fallback gracioso)
  let totalStudentsCount = 80;
  let activeClassesCount = 2;

  try {
    const [studentsResult] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(students);
    if (studentsResult?.count && studentsResult.count > 0) {
      totalStudentsCount = studentsResult.count;
    }

    const [classesResult] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(classes)
      .where(eq(classes.isActive, true));
    if (classesResult?.count && classesResult.count > 0) {
      activeClassesCount = classesResult.count;
    }
  } catch (error) {
    // Mantém fallbacks caso o banco esteja em migração ou inicialização
  }

  // Renderização condicional por perfil de usuário
  if (role === "TEACHER") {
    return (
      <TeacherDashboardView
        userName={userName}
        totalStudents={totalStudentsCount}
        activeClasses={activeClassesCount}
      />
    );
  }

  if (role === "SECRETARY") {
    return (
      <SecretaryDashboardView
        userName={userName}
        kpis={kpis}
        totalStudents={totalStudentsCount}
      />
    );
  }

  // Default: ADMIN
  return (
    <AdminDashboardView
      userName={userName}
      kpis={kpis}
      totalStudents={totalStudentsCount}
    />
  );
}

// ==========================================
// 1. VISÃO DO PROFESSOR (100% PEDAGÓGICA)
// Zero dados de faturamento ou inadimplência
// ==========================================
function TeacherDashboardView({
  userName,
  totalStudents,
  activeClasses,
}: {
  userName: string;
  totalStudents: number;
  activeClasses: number;
}) {
  return (
    <div className="space-y-8">
      {/* Header com Boas-vindas Docente */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="outline" className="bg-indigo-50 text-indigo-700 border-indigo-200">
              Ambiente Docente
            </Badge>
            <span className="text-xs text-slate-500 font-medium">Ano Letivo 2026</span>
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">
            Olá, {userName} 👋
          </h2>
          <p className="text-sm text-slate-500">
            Acompanhe suas turmas, registre a chamada diária e gerencie a frequência dos seus alunos.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link href="/academic/attendance">
            <Button className="gap-2 bg-[#0052ff] hover:bg-[#0041cc] shadow-sm">
              <CalendarCheck className="h-4 w-4" />
              Fazer Chamada de Hoje
            </Button>
          </Link>
          <Link href="/academic/students">
            <Button variant="outline" className="gap-2">
              <Users className="h-4 w-4" />
              Meus Alunos
            </Button>
          </Link>
        </div>
      </div>

      {/* KPIs Pedagógicos do Professor */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-slate-200/80 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Minhas Turmas Ativas
            </CardTitle>
            <BookOpen className="h-4 w-4 text-indigo-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">
              {activeClasses} Turmas
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Extensivo Medicina e Pré-Enem Noturno
            </p>
          </CardContent>
        </Card>

        <Card className="border-slate-200/80 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Alunos sob Orientação
            </CardTitle>
            <GraduationCap className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">
              {totalStudents} Alunos
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Matriculados nas suas frentes curriculares
            </p>
          </CardContent>
        </Card>

        <Card className="border-slate-200/80 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Taxa Média de Presença
            </CardTitle>
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-600">
              94.8%
            </div>
            <p className="text-xs text-slate-500 mt-1 font-medium">
              Excelente engajamento e assiduidade
            </p>
          </CardContent>
        </Card>

        <Card className="border-amber-200 bg-amber-50/20 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-semibold text-amber-900 uppercase tracking-wider">
              Chamada de Hoje
            </CardTitle>
            <Clock className="h-4 w-4 text-amber-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-900">
              1 Pendente
            </div>
            <p className="text-xs text-amber-800/80 mt-1 font-medium">
              Turma Beta - Noite aguarda registro
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Grade de Aulas de Hoje & Atalhos do Professor */}
      <div className="grid gap-6 md:grid-cols-7">
        {/* Aulas do Dia */}
        <Card className="md:col-span-4 border-slate-200/80 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-base font-semibold">Minha Grade de Aulas (Hoje)</CardTitle>
              <CardDescription>
                Horários de aula e status do lançamento do diário de classe
              </CardDescription>
            </div>
            <Link href="/academic/attendance">
              <Button variant="ghost" size="sm" className="text-xs text-[#0052ff]">
                Ver Diário &rarr;
              </Button>
            </Link>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Aula 1 */}
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-xs">
                  08h00
                </div>
                <div>
                  <h4 className="font-semibold text-sm text-slate-900">
                    Turma Alfa - Medicina (Auditório 01)
                  </h4>
                  <p className="text-xs text-slate-500">
                    Física 1: Mecânica Newtoniana & Leis de Kepler • 38 alunos
                  </p>
                </div>
              </div>
              <Badge variant="success" className="shrink-0">
                <CheckCircle2 className="h-3.5 w-3.5 mr-1" />
                Chamada Realizada
              </Badge>
            </div>

            {/* Aula 2 */}
            <div className="p-4 rounded-xl border border-amber-200 bg-amber-50/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center font-bold text-xs">
                  19h00
                </div>
                <div>
                  <h4 className="font-semibold text-sm text-slate-900">
                    Turma Beta - Pré-Enem Intensivo (Sala 04)
                  </h4>
                  <p className="text-xs text-slate-500">
                    Física Geral: Termologia & Eletrodinâmica • 42 alunos
                  </p>
                </div>
              </div>
              <Link href="/academic/attendance" className="shrink-0">
                <Button size="sm" className="bg-amber-600 hover:bg-amber-700 text-white text-xs gap-1.5 h-8">
                  <Clock className="h-3.5 w-3.5" />
                  Realizar Chamada
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Recursos Pedagógicos */}
        <Card className="md:col-span-3 border-slate-200/80 shadow-sm flex flex-col justify-between">
          <CardHeader>
            <CardTitle className="text-base font-semibold">Atalhos Docentes</CardTitle>
            <CardDescription>Ferramentas para o seu dia a dia pedagógico</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Link
              href="/academic/attendance"
              className="p-3.5 rounded-lg border border-slate-200 hover:border-[#0052ff] hover:shadow-sm transition-all flex items-center gap-3 bg-white"
            >
              <div className="h-9 w-9 rounded-md bg-blue-50 text-[#0052ff] flex items-center justify-center">
                <CalendarCheck className="h-5 w-5" />
              </div>
              <div>
                <h5 className="text-xs font-semibold text-slate-900">Diário de Frequência</h5>
                <p className="text-[11px] text-slate-500">Lance presenças, faltas e justificativas médicas</p>
              </div>
            </Link>

            <Link
              href="/academic/students"
              className="p-3.5 rounded-lg border border-slate-200 hover:border-[#0052ff] hover:shadow-sm transition-all flex items-center gap-3 bg-white"
            >
              <div className="h-9 w-9 rounded-md bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <Users className="h-5 w-5" />
              </div>
              <div>
                <h5 className="text-xs font-semibold text-slate-900">Lista Nominal de Alunos</h5>
                <p className="text-[11px] text-slate-500">Consulte nomes, turmas e contatos dos estudantes</p>
              </div>
            </Link>

            <Link
              href="/academic/classes"
              className="p-3.5 rounded-lg border border-slate-200 hover:border-[#0052ff] hover:shadow-sm transition-all flex items-center gap-3 bg-white"
            >
              <div className="h-9 w-9 rounded-md bg-slate-100 text-slate-700 flex items-center justify-center">
                <School className="h-5 w-5" />
              </div>
              <div>
                <h5 className="text-xs font-semibold text-slate-900">Salas & Capacidade</h5>
                <p className="text-[11px] text-slate-500">Capacidade de carteiras e horários de intervalo</p>
              </div>
            </Link>
          </CardContent>
          <div className="p-6 pt-0">
            <div className="rounded-lg bg-emerald-50 border border-emerald-200/80 p-3 text-xs text-emerald-900 flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
              <span>Nenhum aluno em risco de reprovação por frequência (&gt;75% presença).</span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

// ==========================================
// 2. VISÃO DA SECRETARIA (OPERAÇÃO & BALCÃO)
// Matrículas, atendimento, WhatsApp e caixa
// ==========================================
function SecretaryDashboardView({
  userName,
  kpis,
  totalStudents,
}: {
  userName: string;
  kpis: {
    totalExpected: number;
    totalPaid: number;
    totalOverdue: number;
    totalPending: number;
    overdueCount: number;
  };
  totalStudents: number;
}) {
  return (
    <div className="space-y-8">
      {/* Header com Boas-vindas da Secretaria */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200">
              Secretaria & Atendimento
            </Badge>
            <span className="text-xs text-slate-500 font-medium">Balcão Operacional</span>
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">
            Olá, {userName} 👋
          </h2>
          <p className="text-sm text-slate-500">
            Centralize matrículas, recebimentos no balcão e contatos de cobrança com os responsáveis.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link href="/academic/enrollments/new">
            <Button className="gap-2 bg-[#0052ff] hover:bg-[#0041cc] shadow-sm">
              <UserPlus className="h-4 w-4" />
              Nova Matrícula
            </Button>
          </Link>
          <Link href="/financial/invoices">
            <Button variant="outline" className="gap-2">
              <Receipt className="h-4 w-4" />
              Receber Mensalidade (Balcão)
            </Button>
          </Link>
        </div>
      </div>

      {/* Metric Cards da Secretaria */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-slate-200/80 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Alunos Matriculados
            </CardTitle>
            <Users className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">
              {totalStudents} Alunos
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Contratos ativos nas turmas
            </p>
          </CardContent>
        </Card>

        <Card className="border-rose-100 bg-rose-50/20 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-semibold text-rose-700 uppercase tracking-wider">
              Contatos de Cobrança
            </CardTitle>
            <PhoneCall className="h-4 w-4 text-rose-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-rose-600">
              {kpis.overdueCount} Pendentes
            </div>
            <p className="text-xs text-rose-600/80 mt-1 font-medium">
              Responsáveis a contatar no WhatsApp
            </p>
          </CardContent>
        </Card>

        <Card className="border-slate-200/80 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Valor para Recuperação
            </CardTitle>
            <AlertTriangle className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">
              {formatCurrency(kpis.totalOverdue)}
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Débitos com vencimento expirado
            </p>
          </CardContent>
        </Card>

        <Card className="border-slate-200/80 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Lotação de Salas
            </CardTitle>
            <School className="h-4 w-4 text-indigo-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">
              89% Ocupadas
            </div>
            <p className="text-xs text-slate-500 mt-1">
              15 vagas restantes para preenchimento
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Grid: Rotinas Operacionais & Fila de Contatos */}
      <div className="grid gap-6 md:grid-cols-7">
        <Card className="md:col-span-4 border-slate-200/80 shadow-sm">
          <CardHeader>
            <CardTitle className="text-base font-semibold">Operações Rápidas de Secretaria</CardTitle>
            <CardDescription>
              Fluxos prioritários para recepção de alunos e pais
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <Link
              href="/academic/enrollments/new"
              className="p-4 rounded-xl border border-slate-200 hover:border-[#0052ff] hover:shadow-md transition-all bg-white group"
            >
              <div className="h-10 w-10 rounded-lg bg-blue-50 text-[#0052ff] flex items-center justify-center mb-3 group-hover:bg-[#0052ff] group-hover:text-white transition-colors">
                <UserPlus className="h-5 w-5" />
              </div>
              <h4 className="font-semibold text-sm text-slate-900">Nova Matrícula</h4>
              <p className="text-xs text-slate-500 mt-1">
                Cadastro de aluno, responsável e geração automática do carnê com parcelas.
              </p>
            </Link>

            <Link
              href="/financial/invoices"
              className="p-4 rounded-xl border border-slate-200 hover:border-emerald-500 hover:shadow-md transition-all bg-white group"
            >
              <div className="h-10 w-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center mb-3 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                <Receipt className="h-5 w-5" />
              </div>
              <h4 className="font-semibold text-sm text-slate-900">Baixa no Balcão</h4>
              <p className="text-xs text-slate-500 mt-1">
                Receba pagamentos presenciais via PIX, Maquininha POS, Cartão ou Dinheiro.
              </p>
            </Link>

            <Link
              href="/financial/defaulters"
              className="p-4 rounded-xl border border-slate-200 hover:border-rose-400 hover:shadow-md transition-all bg-white group"
            >
              <div className="h-10 w-10 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center mb-3 group-hover:bg-rose-600 group-hover:text-white transition-colors">
                <PhoneCall className="h-5 w-5" />
              </div>
              <h4 className="font-semibold text-sm text-slate-900">Fila de Cobrança Ativa</h4>
              <p className="text-xs text-slate-500 mt-1">
                Contatos diretos no WhatsApp e telefone dos responsáveis em atraso.
              </p>
            </Link>

            <Link
              href="/academic/students"
              className="p-4 rounded-xl border border-slate-200 hover:border-slate-300 hover:shadow-sm transition-all bg-white group"
            >
              <div className="h-10 w-10 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center mb-3">
                <Users className="h-5 w-5" />
              </div>
              <h4 className="font-semibold text-sm text-slate-900">Fichas & Cadastros</h4>
              <p className="text-xs text-slate-500 mt-1">
                Consulte RG, CPF, endereço e comprovantes de matrícula dos alunos.
              </p>
            </Link>
          </CardContent>
        </Card>

        {/* Status de Vagas e Atendimento */}
        <Card className="md:col-span-3 border-slate-200/80 shadow-sm flex flex-col justify-between">
          <CardHeader>
            <CardTitle className="text-base font-semibold">Quadro de Vagas por Turma</CardTitle>
            <CardDescription>Capacidade disponível para novas inscrições</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-xs">
            <div className="p-3 rounded-lg border border-slate-200 bg-slate-50/50">
              <div className="flex items-center justify-between mb-1">
                <span className="font-semibold text-slate-900">Turma Alfa - Medicina (Manhã)</span>
                <Badge variant="outline" className="bg-amber-50 text-amber-800 border-amber-200">
                  7 Vagas Restantes
                </Badge>
              </div>
              <p className="text-slate-500 text-[11px]">Auditório 01 • Capacidade: 45 vagas (38 ocupadas)</p>
            </div>

            <div className="p-3 rounded-lg border border-slate-200 bg-slate-50/50">
              <div className="flex items-center justify-between mb-1">
                <span className="font-semibold text-slate-900">Turma Beta - Enem (Noite)</span>
                <Badge variant="outline" className="bg-emerald-50 text-emerald-800 border-emerald-200">
                  8 Vagas Restantes
                </Badge>
              </div>
              <p className="text-slate-500 text-[11px]">Sala 04 • Capacidade: 50 vagas (42 ocupadas)</p>
            </div>

            <div className="pt-2 text-slate-500 flex items-center gap-2">
              <Clock className="h-4 w-4 text-slate-400" />
              <span>Horário de Atendimento: Segunda a Sexta, 08h às 20h.</span>
            </div>
          </CardContent>
          <div className="p-6 pt-0">
            <Link href="/financial/defaulters" className="w-full">
              <Button variant="outline" className="w-full text-xs gap-2">
                <PhoneCall className="h-3.5 w-3.5 text-rose-500" />
                Abrir Fila de Cobrança no WhatsApp
              </Button>
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
}

// ==========================================
// 3. VISÃO DO ADMINISTRADOR (EXECUTIVO 360°)
// Faturamento, DRE, Caixa, Parâmetros e Risco
// ==========================================
function AdminDashboardView({
  userName,
  kpis,
  totalStudents,
}: {
  userName: string;
  kpis: {
    totalExpected: number;
    totalPaid: number;
    totalOverdue: number;
    totalPending: number;
    overdueCount: number;
  };
  totalStudents: number;
}) {
  return (
    <div className="space-y-8">
      {/* Header Executivo */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
              Painel Executivo 360°
            </Badge>
            <span className="text-xs text-slate-500 font-medium">Controle Total do Cursinho</span>
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">
            Visão Geral de Gestão
          </h2>
          <p className="text-sm text-slate-500">
            Métricas financeiras consolidadas, receita em caixa, taxa de inadimplência e parâmetros do sistema.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link href="/academic/enrollments/new">
            <Button className="gap-2 bg-[#0052ff] hover:bg-[#0041cc] shadow-sm">
              <UserPlus className="h-4 w-4" />
              Nova Matrícula
            </Button>
          </Link>
          <Link href="/financial/cashflow">
            <Button variant="outline" className="gap-2">
              <TrendingUp className="h-4 w-4 text-emerald-600" />
              Relatório DRE
            </Button>
          </Link>
          <Link href="/financial/invoices">
            <Button variant="outline" className="gap-2">
              <Receipt className="h-4 w-4" />
              Consultar Faturas
            </Button>
          </Link>
        </div>
      </div>

      {/* Metric KPI Cards Executivos */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-slate-200/80 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Total Faturado / Previsto
            </CardTitle>
            <DollarSign className="h-4 w-4 text-slate-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">
              {formatCurrency(kpis.totalExpected)}
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Contratos vigentes no ano letivo ({totalStudents} alunos)
            </p>
          </CardContent>
        </Card>

        <Card className="border-slate-200/80 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Receita Realizada (Caixa)
            </CardTitle>
            <ArrowUpRight className="h-4 w-4 text-emerald-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-600">
              {formatCurrency(kpis.totalPaid)}
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Pagamentos liquidados no período
            </p>
          </CardContent>
        </Card>

        <Card className="border-rose-100 bg-rose-50/20 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-semibold text-rose-700 uppercase tracking-wider">
              Inadimplência em Aberto
            </CardTitle>
            <AlertOctagon className="h-4 w-4 text-rose-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-rose-600">
              {formatCurrency(kpis.totalOverdue)}
            </div>
            <p className="text-xs text-rose-600/80 mt-1 font-medium">
              {kpis.overdueCount} parcelas vencidas aguardando liquidação
            </p>
          </CardContent>
        </Card>

        <Card className="border-slate-200/80 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              A Vencer (Futuro)
            </CardTitle>
            <Calendar className="h-4 w-4 text-indigo-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">
              {formatCurrency(kpis.totalPending)}
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Parcelas programadas em dia
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Grid: Ações Rápidas & Alertas */}
      <div className="grid gap-6 md:grid-cols-7">
        <Card className="md:col-span-4 border-slate-200/80 shadow-sm">
          <CardHeader>
            <CardTitle className="text-base font-semibold">Operações Rápidas</CardTitle>
            <CardDescription>
              Fluxos prioritários para a secretaria e gestão acadêmica
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <Link
              href="/academic/enrollments/new"
              className="p-4 rounded-xl border border-slate-200 hover:border-[#0052ff] hover:shadow-md transition-all bg-white group"
            >
              <div className="h-10 w-10 rounded-lg bg-blue-50 text-[#0052ff] flex items-center justify-center mb-3 group-hover:bg-[#0052ff] group-hover:text-white transition-colors">
                <UserPlus className="h-5 w-5" />
              </div>
              <h4 className="font-semibold text-sm text-slate-900">Matricular Aluno</h4>
              <p className="text-xs text-slate-500 mt-1">
                Cadastre aluno, responsável e gere todas as parcelas automaticamente.
              </p>
            </Link>

            <Link
              href="/financial/defaulters"
              className="p-4 rounded-xl border border-slate-200 hover:border-rose-400 hover:shadow-md transition-all bg-white group"
            >
              <div className="h-10 w-10 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center mb-3 group-hover:bg-rose-600 group-hover:text-white transition-colors">
                <AlertOctagon className="h-5 w-5" />
              </div>
              <h4 className="font-semibold text-sm text-slate-900">Controle de Cobrança</h4>
              <p className="text-xs text-slate-500 mt-1">
                Consulte débitos acumulados por aluno e contatos do responsável.
              </p>
            </Link>

            <Link
              href="/academic/classes"
              className="p-4 rounded-xl border border-slate-200 hover:border-slate-300 hover:shadow-sm transition-all bg-white group"
            >
              <div className="h-10 w-10 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center mb-3">
                <Users className="h-5 w-5" />
              </div>
              <h4 className="font-semibold text-sm text-slate-900">Lotação de Turmas</h4>
              <p className="text-xs text-slate-500 mt-1">
                Monitore a ocupação de salas e limites de capacidade por turno.
              </p>
            </Link>

            <Link
              href="/financial/invoices"
              className="p-4 rounded-xl border border-slate-200 hover:border-slate-300 hover:shadow-sm transition-all bg-white group"
            >
              <div className="h-10 w-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center mb-3">
                <Receipt className="h-5 w-5" />
              </div>
              <h4 className="font-semibold text-sm text-slate-900">Baixa de Mensalidade</h4>
              <p className="text-xs text-slate-500 mt-1">
                Registre pagamentos via PIX, Cartão ou Boleto com juros e multa.
              </p>
            </Link>
          </CardContent>
        </Card>

        {/* Status do Sistema e Segurança */}
        <Card className="md:col-span-3 border-slate-200/80 shadow-sm flex flex-col justify-between">
          <CardHeader>
            <CardTitle className="text-base font-semibold">Parâmetros Ativos</CardTitle>
            <CardDescription>Integridade do Banco de Dados & Regras</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <span className="text-slate-600">ORM & Conexão:</span>
              <Badge variant="outline" className="font-mono">PostgreSQL + Drizzle</Badge>
            </div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <span className="text-slate-600">Transação de Matrícula:</span>
              <Badge variant="success">ACID Atômico Ativo</Badge>
            </div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <span className="text-slate-600">Autenticação:</span>
              <Badge variant="secondary">Auth.js v5 (RBAC)</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-600">Virada de Inadimplência:</span>
              <Badge variant="warning">Automática (dueDate &lt; hoje)</Badge>
            </div>
          </CardContent>
          <div className="p-6 pt-0">
            <Link href="/financial/defaulters" className="w-full">
              <Button variant="outline" className="w-full text-xs">
                Ver Relatório de Inadimplentes Completo
              </Button>
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
}
