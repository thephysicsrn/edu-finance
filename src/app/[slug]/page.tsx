import { notFound } from "next/navigation";
import Link from "next/link";
import { getTenantBySlug } from "@/lib/tenants";
import { EduFinanceIcon } from "@/components/shared/logo";
import { Button } from "@/components/ui/button";
import {
  Phone,
  MessageSquare,
  ShieldCheck,
  Receipt,
  UserCheck,
  BookOpen,
  ArrowRight,
  GraduationCap,
  CalendarCheck,
  MapPin,
  Clock,
  Sparkles,
  ExternalLink,
  Lock,
} from "lucide-react";

interface TenantPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: TenantPageProps) {
  const { slug } = await params;
  const tenant = getTenantBySlug(slug);

  if (!tenant) {
    return {
      title: "Instituição não encontrada - Edu.Finance",
    };
  }

  return {
    title: `${tenant.name} - Portal do Aluno & Gestão Escolar`,
    description: tenant.description,
    icons: {
      icon: tenant.iconUrl || "/call-logo.png",
      shortcut: tenant.iconUrl || "/call-logo.png",
      apple: tenant.iconUrl || "/call-logo.png",
    },
  };
}

export default async function TenantPortalPage({ params }: TenantPageProps) {
  const { slug } = await params;
  const tenant = getTenantBySlug(slug);

  if (!tenant) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans selection:bg-[#0052ff] selection:text-white">
      {/* ============================================================== */}
      {/* 1. TOP BAR INSTITUCIONAL DO CURSINHO                           */}
      {/* ============================================================== */}
      <div className="bg-[#07132c] text-slate-200 text-xs py-2 px-4 sm:px-6 lg:px-8 border-b border-white/10">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-4 sm:gap-6 text-slate-300 text-[11px]">
            <span className="flex items-center gap-1.5 text-white font-semibold">
              <MapPin className="h-3.5 w-3.5 text-[#00c878]" />
              {tenant.address}
            </span>
            <span className="hidden md:flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5 text-blue-400" />
              Atendimento: Seg a Sex, 08h às 19h
            </span>
          </div>

          <div className="flex items-center gap-4 text-[11px]">
            <a
              href={`https://wa.me/${tenant.whatsapp}?text=Olá!%20Gostaria%20de%20informações%20sobre%20as%20matrículas%20do%20${encodeURIComponent(
                tenant.name
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-[#00c878] hover:text-emerald-400 font-semibold transition-colors"
            >
              <MessageSquare className="h-3.5 w-3.5" />
              <span>WhatsApp: {tenant.phone}</span>
            </a>
          </div>
        </div>
      </div>

      {/* ============================================================== */}
      {/* 2. NAVBAR DO CLIENTE (CALL CURSOS ISOLADOS)                    */}
      {/* ============================================================== */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          {/* Logo Oficial do Cursinho */}
          <Link href={`/${tenant.slug}`} className="flex items-center gap-3 group">
            <div className="w-12 h-12 rounded-xl bg-white border border-slate-200/90 p-1 flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform">
              <img
                src={tenant.logoUrl}
                alt={tenant.name}
                className="w-full h-full object-contain"
              />
            </div>
            <div className="flex flex-col text-left">
              <div className="flex items-baseline gap-2">
                <span className="text-xl font-black text-[#07132c] tracking-tight">
                  {tenant.name}
                </span>
                <span className="hidden sm:inline-flex px-2 py-0.5 rounded-full text-[9px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                  Unidade Oficial
                </span>
              </div>
              <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
                {tenant.slogan}
              </span>
            </div>
          </Link>

          {/* Botões de Acesso Rápido */}
          <div className="flex items-center gap-2.5 sm:gap-3">
            {/* Acesso do Responsável */}
            <Link href="/portal-do-responsavel">
              <Button
                variant="outline"
                className="h-10 text-xs font-bold text-slate-700 border-slate-300 hover:bg-slate-100 gap-2 rounded-lg"
              >
                <Receipt className="h-4 w-4 text-emerald-600" />
                <span className="hidden sm:inline">Portal do</span> Responsável
              </Button>
            </Link>

            {/* Acesso da Secretaria & Professores */}
            <Link href={`/${tenant.slug}/login`}>
              <Button className="h-10 text-xs font-bold bg-[#0052ff] hover:bg-[#0041cc] text-white shadow-sm gap-2 rounded-lg">
                <Lock className="h-3.5 w-3.5" />
                <span>Área Restrita</span>
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* ============================================================== */}
      {/* 3. HERO SECTION DO CURSINHO                                    */}
      {/* ============================================================== */}
      <section className="relative bg-gradient-to-b from-[#07132c] via-[#091b3e] to-[#07132c] text-white py-16 sm:py-24 px-4 sm:px-6 lg:px-8 overflow-hidden">
        {/* Glow de Fundo */}
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-5xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 border border-white/20 text-xs text-blue-200 mb-6 backdrop-blur-xs">
            <Sparkles className="h-3.5 w-3.5 text-[#00c878]" />
            <span>Portal Acadêmico & Financeiro Exclusivo</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.1] text-balance">
            Bem-vindo ao Portal{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-sky-300 to-emerald-400">
              {tenant.name}
            </span>
          </h1>

          <p className="mt-5 text-base sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed text-balance">
            Consulte mensalidades, emita carnês com PIX instantâneo, confira a frequência escolar e gerencie matrículas em um único ecossistema seguro e transparente.
          </p>

          {/* Cards de Acesso Direto */}
          <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-6 text-left max-w-3xl mx-auto">
            {/* Card 1: Portal da Família / Aluno */}
            <div className="p-6 rounded-2xl bg-white/10 border border-white/15 backdrop-blur-md hover:bg-white/15 transition-all flex flex-col justify-between shadow-xl">
              <div>
                <div className="w-12 h-12 rounded-xl bg-emerald-500/20 text-[#00c878] border border-emerald-500/30 flex items-center justify-center mb-4">
                  <Receipt className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold text-white">Portal do Responsável & Aluno</h3>
                <p className="mt-2 text-xs sm:text-sm text-slate-300 leading-relaxed">
                  Acesse com CPF ou PIN para baixar seu Carnê de Mensalidades, copiar o código PIX instantâneo ou visualizar boletos emitidos via Asaas.
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-white/10">
                <Link href="/portal-do-responsavel" className="block w-full">
                  <Button className="w-full bg-[#00c878] hover:bg-[#00b069] text-white font-bold h-11 rounded-xl shadow-md gap-2 text-xs uppercase tracking-wider">
                    <span>Acessar Minhas Mensalidades</span>
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </div>

            {/* Card 2: Secretaria & Equipe */}
            <div className="p-6 rounded-2xl bg-white/10 border border-white/15 backdrop-blur-md hover:bg-white/15 transition-all flex flex-col justify-between shadow-xl">
              <div>
                <div className="w-12 h-12 rounded-xl bg-blue-500/20 text-blue-400 border border-blue-500/30 flex items-center justify-center mb-4">
                  <Lock className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold text-white">Área da Secretaria & Docentes</h3>
                <p className="mt-2 text-xs sm:text-sm text-slate-300 leading-relaxed">
                  Ambiente restrito para realização de novas matrículas, controle de presença diária, frente de caixa balcão (POS) e conciliação financeira.
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-white/10">
                <Link href={`/${tenant.slug}/login`} className="block w-full">
                  <Button className="w-full bg-[#0052ff] hover:bg-[#0041cc] text-white font-bold h-11 rounded-xl shadow-md gap-2 text-xs uppercase tracking-wider">
                    <span>Entrar no Sistema</span>
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================== */}
      {/* 4. DIFERENCIAIS E CURSOS DISPONÍVEIS                           */}
      {/* ============================================================== */}
      <section className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <span className="text-xs font-bold text-[#0c5195] uppercase tracking-wider">
            Excelência Comprovada em Aprovações
          </span>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-[#07132c] mt-2">
            Turmas & Isoladas Oferecidas
          </h2>
          <p className="text-slate-600 text-sm sm:text-base mt-2">
            Metodologia estruturada com foco em aprovação nos vestibulares e ENEM mais exigentes do país.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {tenant.coursesSummary.map((course, idx) => (
            <div
              key={idx}
              className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between"
            >
              <div>
                {course.badge && (
                  <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200 mb-3">
                    {course.badge}
                  </span>
                )}
                <h3 className="font-bold text-slate-900 text-base leading-snug">
                  {course.title}
                </h3>
                <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                  {course.description}
                </p>
              </div>

              <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="font-medium text-slate-600">{course.period}</span>
                <GraduationCap className="h-4 w-4 text-slate-400" />
              </div>
            </div>
          ))}
        </div>

        {/* Banner de Contato para Matrícula */}
        <div className="mt-12 p-8 rounded-2xl bg-gradient-to-r from-blue-900 to-[#07132c] text-white flex flex-col sm:flex-row items-center justify-between gap-6 shadow-lg">
          <div>
            <h3 className="text-xl sm:text-2xl font-bold">
              Deseja realizar sua matrícula ou tirar dúvidas?
            </h3>
            <p className="text-slate-300 text-xs sm:text-sm mt-1">
              Fale diretamente com a equipe de atendimento do {tenant.name} pelo WhatsApp.
            </p>
          </div>
          <a
            href={`https://wa.me/${tenant.whatsapp}?text=Olá!%20Gostaria%20de%20conversar%20sobre%20as%20matrículas%20do%20${encodeURIComponent(
              tenant.name
            )}`}
            target="_blank"
            rel="noopener noreferrer"
            className="shrink-0"
          >
            <Button className="bg-[#00c878] hover:bg-[#00b069] text-white font-bold px-6 h-12 rounded-xl shadow-md gap-2 text-xs uppercase tracking-wider">
              <MessageSquare className="h-4 w-4" />
              <span>Chamar no WhatsApp ({tenant.phone})</span>
            </Button>
          </a>
        </div>
      </section>

      {/* ============================================================== */}
      {/* 5. RODAPÉ INSTITUCIONAL COM CHANCELA EDU.FINANCE               */}
      {/* ============================================================== */}
      <footer className="mt-auto bg-white border-t border-slate-200 py-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 text-xs text-slate-500">
          {/* Dados do Cursinho */}
          <div className="flex items-center gap-3">
            <img
              src={tenant.logoUrl}
              alt={tenant.name}
              className="w-10 h-10 object-contain"
            />
            <div className="flex flex-col">
              <span className="font-bold text-slate-900 text-sm">{tenant.name}</span>
              <span>{tenant.address} • CNPJ: {tenant.cnpj}</span>
            </div>
          </div>

          {/* Selo SaaS Edu.Finance */}
          <div className="flex items-center gap-3 bg-slate-50 px-4 py-2 rounded-xl border border-slate-200">
            <EduFinanceIcon className="w-6 h-6" />
            <div className="flex flex-col text-left">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Tecnologia & Gestão Financeira
              </span>
              <span className="text-xs font-black text-slate-800">
                Powered by Edu<span className="text-[#0052ff]">.Finance</span>
              </span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
