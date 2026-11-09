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
} from "lucide-react";

export const dynamic = "force-dynamic";

export default async function LandingPage() {
  const session = await auth();
  const user = session?.user;
  const destinationHref = user ? "/dashboard" : "/login";

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
              {/* Título Principal Focado em Profissionalismo e Competência */}
              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-[1.1] text-balance">
                Focamos em oferecer inteligência financeira e eficiência para sua instituição!
              </h1>

              {/* Subtítulo Institucional */}
              <p className="mt-6 text-base sm:text-lg text-slate-200 leading-relaxed max-w-2xl mx-auto text-balance">
                A <strong>Edu.Finance</strong> transforma a rotina do seu cursinho ou escola: automatize mensalidades via PIX e Boletos Asaas, reduza a inadimplência em até 82% e unifique <strong>Diretoria, Secretaria e Professores</strong> em um único ecossistema em nuvem.
              </p>

              {/* Botões de Ação no Hero */}
              <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link href={user ? "/dashboard" : "/login"}>
                  <Button className="w-full sm:w-auto h-12 px-8 bg-[#0052ff] hover:bg-[#0041cc] active:bg-[#0037b3] text-white font-bold rounded-lg shadow-lg hover:shadow-blue-500/25 transition-all gap-2 text-xs uppercase tracking-wider focus-visible:ring-2 focus-visible:ring-[#0052ff] focus-visible:ring-offset-2 focus-visible:ring-offset-[#07132c]">
                    <span>{user ? "Acessar Meu Painel" : "Acessar Demonstração Gratuita"}</span>
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>

                <a href="#contato" className="w-full sm:w-auto">
                  <button
                    type="button"
                    className="w-full sm:w-auto h-12 px-8 border border-white/40 bg-white/10 hover:bg-white hover:text-[#07132c] text-white font-bold rounded-lg transition-all duration-150 text-xs uppercase tracking-wider flex items-center justify-center cursor-pointer shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
                  >
                    Falar com Especialista
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

            {/* Mockup 3D Interativo com Efeito de Scroll e Parallax */}
            <div className="mt-10 sm:mt-14">
              <HeroMockup3D />
            </div>
          </div>
        </section>

        {/* ============================================================== */}
        {/* 3. OS 3 PILARES FUNDAMENTAIS (SOBREPOSIÇÃO IDÊNTICA À REFERÊNCIA) */}
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
        {/* 4. SEÇÃO "SERVIÇOS" / JORNADA OPERACIONAL INTEGRADA           */}
        {/* ============================================================== */}
        <section id="modulos" className="py-24 sm:py-32 bg-white select-none">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Header da Seção */}
            <div className="text-center max-w-3xl mx-auto mb-14">
              <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-[#07132c] uppercase text-balance">
                Módulos & Jornada Operacional
              </h2>
              <p className="mt-3 text-slate-500 text-sm sm:text-base text-balance">
                Veja como o Edu.Finance conecta a matrícula, a automação Asaas, a chamada em sala e o DRE em uma esteira 100% contínua e sem atritos.
              </p>
            </div>

            {/* Showcase Interativo da Jornada Operacional */}
            <OperationalJourneyShowcase />
          </div>
        </section>

        {/* ============================================================== */}
        {/* 5. SEÇÃO DESTAQUE: 3 PERFIS DEDICADOS (ADMIN, SEC, PROF)       */}
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
        {/* 6. INTEGRAÇÃO ASAAS API V3                                     */}
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
                    <p className="text-slate-300">Cobrança tarifada apenas quando o responsável realiza a liquidação efetiva.</p>
                  </div>
                </div>

                <div className="mt-8 flex items-center gap-4">
                  <Link href="/login?role=admin">
                    <Button className="bg-[#00c878] hover:bg-[#00b069] active:bg-[#009b5c] text-white font-bold px-6 py-2.5 rounded-lg text-xs uppercase tracking-wider focus-visible:ring-2 focus-visible:ring-[#00c878] focus-visible:ring-offset-2 focus-visible:ring-offset-[#07132c]">
                      Acessar Demonstração do Gateway
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ============================================================== */}
        {/* 7. SEÇÃO "FALE CONOSCO" (FORMULÁRIO DARK IDÊNTICO À REFERÊNCIA) */}
        {/* ============================================================== */}
        <ContactFormSection />
      </main>

      {/* ============================================================== */}
      {/* 8. FOOTER INSTITUCIONAL                                        */}
      {/* ============================================================== */}
      <LandingFooter />
    </div>
  );
}
