import Link from "next/link";
import { auth } from "@/lib/auth";
import { LandingHeader } from "@/components/landing/landing-header";
import { ContactFormSection } from "@/components/landing/contact-form";
import { LandingFooter } from "@/components/landing/landing-footer";
import { HeroInteractiveMesh } from "@/components/landing/hero-interactive-mesh";
import { HeroMockup3D } from "@/components/landing/hero-mockup-3d";
import { RoleProfilesShowcase } from "@/components/landing/role-profiles-showcase";
import { OperationalJourneyShowcase } from "@/components/landing/operational-journey-showcase";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  TrendingUp,
  Receipt,
  UserPlus,
  Users,
  CreditCard,
  CalendarCheck,
  School,
  Scale,
  Handshake,
  Sparkles,
} from "lucide-react";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Edu.Finance - Gestão Financeira & Escolar para Cursinhos",
  description:
    "Plataforma SaaS integrada de inteligência financeira, automação Asaas e gestão acadêmica para cursinhos e escolas.",
  icons: {
    icon: "/icon.svg",
    shortcut: "/icon.svg",
    apple: "/icon.svg",
  },
};

export default async function LandingPage() {
  const session = await auth();
  const user = session?.user;
  const destinationHref = user ? "/dashboard" : "/call";

  return (
    <div className="min-h-screen bg-white flex flex-col selection:bg-[#0052ff] selection:text-white font-sans text-slate-900">
      {/* ============================================================== */}
      {/* 1. BARRA SUPERIOR & HEADER COM ÁREA DO CLIENTE                  */}
      {/* ============================================================== */}
      <LandingHeader user={user} />

      <main className="flex-1">
        {/* ============================================================== */}
        {/* 2. HERO SECTION DE ALTO IMPACTO (OVERDRIVE CINEMATIC GLOW)     */}
        {/* ============================================================== */}
        <section
          id="inicio"
          className="relative bg-[#07132c] text-white pt-20 pb-28 sm:pt-28 sm:pb-36 overflow-hidden select-none border-b border-white/10"
        >
          {/* Fundo Interativo em Canvas & Mesh Reativo ao Cursor */}
          <HeroInteractiveMesh />

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="max-w-4xl mx-auto text-center">
              {/* Título Principal */}
              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-[1.1] text-balance">
                Focamos em oferecer inteligência financeira e eficiência para sua instituição!
              </h1>

              {/* Subtítulo Institucional */}
              <p className="mt-6 text-base sm:text-lg text-slate-200 leading-relaxed max-w-2xl mx-auto text-balance">
                A <strong>Edu.Finance</strong> transforma a rotina do seu cursinho ou escola: automatize mensalidades via PIX e Boletos Asaas, reduza a inadimplência em até 82% e unifique <strong>Diretoria, Secretaria e Professores</strong> em um único ecossistema em nuvem.
              </p>

              {/* Botões de Ação no Hero */}
              <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link href={destinationHref}>
                  <Button className="w-full sm:w-auto h-12 px-8 bg-[#0052ff] hover:bg-[#0041cc] active:bg-[#0037b3] text-white font-bold rounded-lg shadow-lg hover:shadow-blue-500/25 transition-all gap-2 text-xs uppercase tracking-wider focus-visible:ring-2 focus-visible:ring-[#0052ff] focus-visible:ring-offset-2 focus-visible:ring-offset-[#07132c]">
                    <span>{user ? "Acessar Meu Painel" : "Acessar Sistema (Parceiros)"}</span>
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>

                <a href="#parceiros" className="w-full sm:w-auto">
                  <button
                    type="button"
                    className="w-full sm:w-auto h-12 px-8 border border-white/40 bg-white/10 hover:bg-white hover:text-[#07132c] text-white font-bold rounded-lg transition-all duration-150 text-xs uppercase tracking-wider flex items-center justify-center cursor-pointer shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
                  >
                    <span>Ver Nossos Parceiros</span>
                  </button>
                </a>
              </div>

              {/* Indicadores Rápidos de Confiança */}
              <div className="mt-10 pt-6 border-t border-white/15 flex flex-wrap items-center justify-center gap-6 sm:gap-10 text-xs text-slate-200">
                <div className="flex items-center gap-2 group cursor-default transition-all duration-200 hover:text-white">
                  <CheckCircle2 className="h-4 w-4 text-[#00c878] group-hover:scale-115 transition-transform duration-200" />
                  <span>Baixa Instantânea no PIX</span>
                </div>
                <div className="flex items-center gap-2 group cursor-default transition-all duration-200 hover:text-white">
                  <CheckCircle2 className="h-4 w-4 text-[#00c878] group-hover:scale-115 transition-transform duration-200" />
                  <span>3 Visões Integradas (RBAC)</span>
                </div>
                <div className="flex items-center gap-2 group cursor-default transition-all duration-200 hover:text-white">
                  <CheckCircle2 className="h-4 w-4 text-[#00c878] group-hover:scale-115 transition-transform duration-200" />
                  <span>Conformidade com a LGPD</span>
                </div>
              </div>
            </div>

            {/* Mockup 3D Interativo */}
            <div className="mt-10 sm:mt-14">
              <HeroMockup3D />
            </div>
          </div>
        </section>

        {/* ============================================================== */}
        {/* 3. OS 3 PILARES FUNDAMENTAIS                                    */}
        {/* ============================================================== */}
        <section className="relative z-20 -mt-16 sm:-mt-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 select-none">
          <div className="grid gap-6 md:grid-cols-3">
            {/* Pilar 1: AUTOMAÇÃO & ASAAS */}
            <div className="bg-[#0b1736] border border-white/10 text-white rounded-2xl p-6 sm:p-8 shadow-2xl transition-transform hover:-translate-y-1 duration-200">
              <div className="h-12 w-12 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center mb-5 border border-blue-500/30">
                <Handshake className="h-6 w-6" />
              </div>
              <h3 className="text-base sm:text-lg font-bold text-white uppercase tracking-wider mb-2">
                Automação & Asaas
              </h3>
              <p className="text-slate-200 text-xs sm:text-sm leading-relaxed">
                Sobre ela estruturamos a saúde financeira da sua escola: emissão de boletos registrados, QR Code PIX instantâneo e conciliação bancária 100% automatizada via API v3.
              </p>
            </div>

            {/* Pilar 2: COMBATE À INADIMPLÊNCIA */}
            <div className="bg-[#0b1736] border border-white/10 text-white rounded-2xl p-6 sm:p-8 shadow-2xl transition-transform hover:-translate-y-1 duration-200">
              <div className="h-12 w-12 rounded-xl bg-emerald-500/20 text-[#00c878] flex items-center justify-center mb-5 border border-emerald-500/30">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <h3 className="text-base sm:text-lg font-bold text-white uppercase tracking-wider mb-2">
                Combate à Inadimplência
              </h3>
              <p className="text-slate-200 text-xs sm:text-sm leading-relaxed">
                Régua de cobrança preventiva via WhatsApp e e-mail antes do vencimento, fila de atendimento para a equipe de secretaria e facilidade de renegociação em poucos cliques.
              </p>
            </div>

            {/* Pilar 3: GESTÃO ACADÊMICA 360° */}
            <div className="bg-[#0b1736] border border-white/10 text-white rounded-2xl p-6 sm:p-8 shadow-2xl transition-transform hover:-translate-y-1 duration-200">
              <div className="h-12 w-12 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center mb-5 border border-indigo-500/30">
                <Scale className="h-6 w-6" />
              </div>
              <h3 className="text-base sm:text-lg font-bold text-white uppercase tracking-wider mb-2">
                Gestão Acadêmica 360°
              </h3>
              <p className="text-slate-200 text-xs sm:text-sm leading-relaxed">
                Um pilar indispensável baseado em controle pedagógico rigoroso: diário de presença digital para professores, lotação de turmas por turno e relatórios DRE em tempo real.
              </p>
            </div>
          </div>
        </section>

        {/* ============================================================== */}
        {/* 4. SEÇÃO PARCEIROS & REDE DE CURSINHOS (ACESSO DIRETO AO CALL) */}
        {/* ============================================================== */}
        <section id="parceiros" className="py-24 sm:py-32 bg-slate-50 border-t border-slate-200 select-none">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-14">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-[#0052ff] border border-blue-200/60 uppercase tracking-wider mb-3">
                <Sparkles className="h-3.5 w-3.5 text-[#00c878]" />
                Instituições Conectadas
              </span>
              <h2 className="text-2xl sm:text-4xl font-extrabold text-[#07132c] tracking-tight">
                Nossos Parceiros
              </h2>
              <p className="mt-2 text-sm sm:text-base text-slate-600">
                Selecione seu cursinho para entrar diretamente no sistema da instituição.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
              {/* CARD DESTAQUE: CALL CURSOS ISOLADOS */}
              <Link
                href="/call"
                className="group relative bg-white border-2 border-blue-200 hover:border-[#0052ff] rounded-2xl p-6 sm:p-7 shadow-md hover:shadow-xl transition-all duration-200 flex flex-col justify-between overflow-hidden cursor-pointer"
              >
                <div className="absolute top-3.5 right-3.5 flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Ambiente Ativo
                </div>

                <div>
                  <div className="w-16 h-16 rounded-2xl bg-white border border-slate-200 p-2 shadow-xs mb-4 flex items-center justify-center group-hover:scale-105 transition-transform duration-200">
                    <img
                      src="/call-logo.png"
                      alt="Call Cursos Isolados"
                      className="w-full h-full object-contain"
                    />
                  </div>

                  <h3 className="text-xl font-black text-[#07132c] group-hover:text-[#0052ff] transition-colors">
                    Call Cursos Isolados
                  </h3>
                  <p className="text-xs font-semibold text-slate-500 mt-0.5">
                    Natal • RN • Unidade Presencial
                  </p>
                  <p className="text-xs text-slate-600 mt-2.5 leading-relaxed">
                    Preparatório de alta performance para o ENEM, vestibulares de Medicina e turmas isoladas de excelência.
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-xs font-bold text-[#0052ff] group-hover:translate-x-1 transition-transform flex items-center gap-1.5">
                    <span>Acessar Sistema do Call</span>
                    <ArrowRight className="h-4 w-4" />
                  </span>
                  <span className="text-[10px] text-slate-400 font-medium">
                    url/call
                  </span>
                </div>
              </Link>

              {/* CARD SEJA UM PARCEIRO */}
              <a
                href="#contato"
                className="group relative bg-slate-100/70 hover:bg-slate-100 border-2 border-dashed border-slate-300 hover:border-[#0052ff] rounded-2xl p-6 sm:p-7 transition-all duration-200 flex flex-col justify-between cursor-pointer"
              >
                <div>
                  <div className="w-16 h-16 rounded-2xl bg-white border border-slate-200 text-slate-400 group-hover:text-[#0052ff] mb-4 flex items-center justify-center group-hover:scale-105 transition-all duration-200">
                    <School className="h-8 w-8" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-800 group-hover:text-[#0052ff] transition-colors">
                    Sua Instituição Aqui
                  </h3>
                  <p className="text-xs font-semibold text-slate-500 mt-0.5">
                    Faça parte da rede Edu.Finance
                  </p>
                  <p className="text-xs text-slate-500 mt-2.5 leading-relaxed">
                    Modernize o financeiro, automatize mensalidades via Asaas e reduza a inadimplência no seu cursinho ou colégio.
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-200/60 flex items-center justify-between text-xs font-bold text-slate-600 group-hover:text-[#0052ff]">
                  <span>Quero Ser um Parceiro</span>
                  <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </a>
            </div>
          </div>
        </section>

        {/* ============================================================== */}
        {/* 5. JORNADA OPERACIONAL INTEGRADA                               */}
        {/* ============================================================== */}
        <section id="modulos" className="py-24 sm:py-32 bg-white select-none">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-14">
              <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-[#07132c] uppercase text-balance">
                Módulos & Jornada Operacional
              </h2>
              <p className="mt-3 text-slate-500 text-sm sm:text-base text-balance">
                Veja como o Edu.Finance conecta a matrícula, a automação Asaas, a chamada em sala e o DRE em uma esteira 100% contínua e sem atritos.
              </p>
            </div>

            <OperationalJourneyShowcase />
          </div>
        </section>

        {/* ============================================================== */}
        {/* 6. PERFIS DEDICADOS (ADMIN, SEC, PROF)                         */}
        {/* ============================================================== */}
        <section id="sobre" className="py-20 sm:py-28 bg-slate-50 border-y border-slate-200 select-none">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <h2 className="text-2xl sm:text-4xl font-extrabold text-[#07132c] text-balance">
                Três Visões Exclusivas para Cada Papel na Escola
              </h2>
              <p className="text-slate-600 text-sm sm:text-base mt-3 text-balance">
                Cada profissional acessa apenas o que é relevante para o seu trabalho, garantindo segurança total dos dados financeiros e foco máximo na produtividade.
              </p>
            </div>

            <RoleProfilesShowcase />
          </div>
        </section>

        {/* ============================================================== */}
        {/* 7. INTEGRAÇÃO ASAAS API V3                                     */}
        {/* ============================================================== */}
        <section id="asaas" className="py-20 sm:py-28 bg-white border-b border-slate-200 select-none">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-[#07132c] rounded-3xl p-8 sm:p-14 text-white shadow-2xl relative overflow-hidden">
              <div className="max-w-2xl relative z-10">
                <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-balance">
                  Integração Nativa com Asaas API v3
                </h2>
                <p className="mt-4 text-slate-200 text-sm sm:text-base leading-relaxed">
                  Elimine para sempre os arquivos de remessa e retorno bancário (CNAB). Com o gateway Asaas integrado à Edu.Finance, seu cursinho emite boletos e QR Codes PIX registrados instantaneamente com webhook em tempo real.
                </p>

                <div className="mt-8 grid sm:grid-cols-2 gap-4 text-xs">
                  <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                    <h3 className="font-bold text-[#00c878] mb-1 text-sm">PIX Instantâneo</h3>
                    <p className="text-slate-300">Baixa automática em até 3 segundos com notificação imediata para a secretaria.</p>
                  </div>
                  <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                    <h3 className="font-bold text-blue-300 mb-1 text-sm">Boleto Registrado</h3>
                    <p className="text-slate-300">Linha digitável oficial sem cobrança prévia, compensação D+1 e régua por WhatsApp.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ============================================================== */}
        {/* 8. FORMULÁRIO DE CONTATO & AGENDAMENTO                         */}
        {/* ============================================================== */}
        <ContactFormSection />
      </main>

      {/* ============================================================== */}
      {/* 9. RODAPÉ INSTITUCIONAL                                        */}
      {/* ============================================================== */}
      <LandingFooter />
    </div>
  );
}
