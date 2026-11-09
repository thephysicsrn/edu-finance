"use client";

import { useEffect, useState, useRef, useMemo } from "react";
import {
  DollarSign,
  TrendingUp,
  Users,
  CheckCircle2,
  ArrowUpRight,
  Zap,
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface MonthStats {
  short: string;
  fullName: string;
  heightPct: number;
  previsto: number;
  caixa: number;
  inadimplencia: number;
  assiduidade: number;
  status: string;
}

const MONTHS_DATA: MonthStats[] = [
  { short: "Jan", fullName: "Janeiro", heightPct: 45, previsto: 91000, caixa: 42500, inadimplencia: 4.8, assiduidade: 91.5, status: "Conciliado" },
  { short: "Fev", fullName: "Fevereiro", heightPct: 58, previsto: 92400, caixa: 55200, inadimplencia: 4.4, assiduidade: 92.8, status: "Conciliado" },
  { short: "Mar", fullName: "Março", heightPct: 70, previsto: 93500, caixa: 68400, inadimplencia: 4.1, assiduidade: 93.6, status: "Conciliado" },
  { short: "Abr", fullName: "Abril", heightPct: 76, previsto: 94000, caixa: 73100, inadimplencia: 3.9, assiduidade: 94.0, status: "Conciliado" },
  { short: "Mai", fullName: "Maio", heightPct: 86, previsto: 94500, caixa: 80900, inadimplencia: 3.8, assiduidade: 94.3, status: "Conciliado" },
  { short: "Jun", fullName: "Junho", heightPct: 92, previsto: 94850, caixa: 82400, inadimplencia: 3.8, assiduidade: 94.8, status: "Mês Vigente" },
  { short: "Jul", fullName: "Julho", heightPct: 96, previsto: 95000, caixa: 85200, inadimplencia: 3.5, assiduidade: 95.1, status: "Projeção" },
  { short: "Ago", fullName: "Agosto", heightPct: 94, previsto: 95000, caixa: 84100, inadimplencia: 3.6, assiduidade: 94.9, status: "Projeção" },
  { short: "Set", fullName: "Setembro", heightPct: 91, previsto: 95000, caixa: 83200, inadimplencia: 3.7, assiduidade: 94.5, status: "Projeção" },
  { short: "Out", fullName: "Outubro", heightPct: 89, previsto: 95500, caixa: 82100, inadimplencia: 3.8, assiduidade: 94.7, status: "Projeção" },
  { short: "Nov", fullName: "Novembro", heightPct: 97, previsto: 96000, caixa: 86800, inadimplencia: 3.4, assiduidade: 95.4, status: "Projeção" },
  { short: "Dez", fullName: "Dezembro", heightPct: 100, previsto: 98000, caixa: 91500, inadimplencia: 3.2, assiduidade: 96.0, status: "Projeção" },
];

const DEFAULT_STATS = {
  label: "Ano Letivo 2026 (Consolidado)",
  previsto: 94850,
  caixa: 82400,
  inadimplencia: 3.8,
  assiduidade: 94.8,
};

export function HeroMockup3D() {
  const [scrollY, setScrollY] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [activeMonthIdx, setActiveMonthIdx] = useState<number | null>(null);
  const [livePing, setLivePing] = useState(false);
  const [displayCount, setDisplayCount] = useState({
    previsto: 0,
    caixa: 0,
    inadimplencia: 15.0,
    assiduidade: 0,
  });

  const containerRef = useRef<HTMLDivElement | null>(null);
  const prefersReducedMotion = useRef(false);

  // 1. Detectar Mobile e Redução de Movimento
  useEffect(() => {
    setIsMobile(window.innerWidth < 768);
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);

    prefersReducedMotion.current = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // 2. Parallax de Scroll suave
  useEffect(() => {
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          setScrollY(window.scrollY);
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // 3. Intersection Observer para iniciar as animações de entrada
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
            observer.disconnect();
          }
        });
      },
      { threshold: 0.2 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // 4. Animação de Count-up inicial com interpolação suave
  useEffect(() => {
    if (!isVisible) return;

    if (prefersReducedMotion.current) {
      setDisplayCount({
        previsto: DEFAULT_STATS.previsto,
        caixa: DEFAULT_STATS.caixa,
        inadimplencia: DEFAULT_STATS.inadimplencia,
        assiduidade: DEFAULT_STATS.assiduidade,
      });
      return;
    }

    const duration = 1400; // ms
    const startTime = performance.now();

    const animateCounters = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Easing exponencial suave: 1 - Math.pow(1 - progress, 3)
      const ease = 1 - Math.pow(1 - progress, 3);

      setDisplayCount({
        previsto: Math.round(DEFAULT_STATS.previsto * ease),
        caixa: Math.round(DEFAULT_STATS.caixa * ease),
        inadimplencia: +(15.0 - (15.0 - DEFAULT_STATS.inadimplencia) * ease).toFixed(1),
        assiduidade: +(DEFAULT_STATS.assiduidade * ease).toFixed(1),
      });

      if (progress < 1) {
        requestAnimationFrame(animateCounters);
      }
    };

    requestAnimationFrame(animateCounters);
  }, [isVisible]);

  // 5. Simulação Periódica de Webhook Asaas (Pulso a cada 5.5s)
  useEffect(() => {
    if (!isVisible || prefersReducedMotion.current) return;

    const interval = setInterval(() => {
      setLivePing(true);
      const timer = setTimeout(() => setLivePing(false), 1400);
      return () => clearTimeout(timer);
    }, 5500);

    return () => clearInterval(interval);
  }, [isVisible]);

  // Estatísticas atuais (consolidado ou mês selecionado)
  const currentStats = useMemo(() => {
    if (activeMonthIdx !== null) {
      const m = MONTHS_DATA[activeMonthIdx];
      return {
        label: `Mês de ${m.fullName} 2026 (${m.status})`,
        previsto: m.previsto,
        caixa: m.caixa,
        inadimplencia: m.inadimplencia,
        assiduidade: m.assiduidade,
        isCustomMonth: true,
      };
    }
    return {
      label: "Ano Letivo 2026",
      previsto: isVisible ? displayCount.previsto : 0,
      caixa: isVisible ? displayCount.caixa : 0,
      inadimplencia: isVisible ? displayCount.inadimplencia : 0,
      assiduidade: isVisible ? displayCount.assiduidade : 0,
      isCustomMonth: false,
    };
  }, [activeMonthIdx, isVisible, displayCount]);

  // Parallax suave com limites seguros e desativação em mobile
  const scrollOffset = isMobile ? 0 : Math.min(scrollY * 0.1, 40);
  const tiltX = isMobile ? 0 : Math.max(0, 7 - scrollY * 0.015);

  return (
    <div
      ref={containerRef}
      className="relative w-full max-w-5xl mx-auto pt-8 pb-4 select-none"
      style={{
        perspective: "1200px",
      }}
    >
      {/* ============================================================== */}
      {/* 1. MOCKUP PRINCIPAL EM PERSPECTIVA 3D COM SPECULAR GLOW        */}
      {/* ============================================================== */}
      <div
        className={`relative rounded-2xl border bg-[#0c1a3b]/95 p-3 sm:p-5 shadow-[0_25px_60px_-15px_rgba(0,82,255,0.35)] backdrop-blur-xl transition-all duration-300 ease-out ${
          livePing ? "border-emerald-400/50 shadow-[0_25px_60px_-10px_rgba(0,200,120,0.3)]" : "border-white/20"
        }`}
        style={{
          transform: `rotateX(${tiltX}deg) translateY(-${scrollOffset}px)`,
          transformStyle: "preserve-3d",
        }}
      >
        {/* Barra Superior do Navegador / Sistema */}
        <div className="flex items-center justify-between pb-3 mb-4 border-b border-white/10 text-xs">
          <div className="flex items-center gap-2">
            <div className="flex gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-rose-500/80 hover:brightness-125 transition-all cursor-pointer" />
              <span className="h-2.5 w-2.5 rounded-full bg-amber-500/80 hover:brightness-125 transition-all cursor-pointer" />
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-500/80 hover:brightness-125 transition-all cursor-pointer" />
            </div>
            <span className="text-[11px] font-mono text-slate-400 pl-2">
              edufinance.app/dashboard
            </span>
          </div>

          {/* Badge Conectado com Ping Reativo */}
          <div className="flex items-center gap-2">
            {livePing && (
              <span className="hidden sm:inline-flex items-center gap-1 text-[10px] text-emerald-300 animate-pulse font-mono">
                <Zap className="h-3 w-3 text-[#00c878]" /> Webhook Asaas sync
              </span>
            )}
            <span
              className={`relative inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold border transition-all duration-300 ${
                livePing
                  ? "bg-emerald-500/30 text-emerald-200 border-emerald-400/60 scale-105"
                  : "bg-emerald-500/20 text-[#00c878] border-emerald-500/30"
              }`}
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00c878] opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#00c878]" />
              </span>
              <span>Asaas API v3 Conectado</span>
            </span>
          </div>
        </div>

        {/* Dashboard Grid Interno */}
        <div className="space-y-4">
          {/* Header Interno do Mockup com Estado Interativo */}
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <p className="text-xs text-slate-400 font-medium transition-colors">
                  {currentStats.label}
                </p>
                {currentStats.isCustomMonth && (
                  <button
                    type="button"
                    onClick={() => setActiveMonthIdx(null)}
                    className="text-[10px] px-2 py-0.5 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 transition-colors"
                  >
                    Voltar ao consolidado
                  </button>
                )}
              </div>
              <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">
                Painel Consolidado de Gestão Escolar
              </h3>
            </div>
            <div className="hidden sm:flex items-center gap-2 text-xs">
              <span className="px-2.5 py-1 rounded-md bg-white/10 text-slate-200 text-[11px] hover:bg-white/15 transition-colors cursor-default">
                80 Alunos Ativos
              </span>
              <span className="px-2.5 py-1 rounded-md bg-blue-600/30 text-blue-300 text-[11px] font-semibold border border-blue-400/30 hover:bg-blue-600/40 transition-colors cursor-default">
                2 Turmas Atribuidas
              </span>
            </div>
          </div>

          {/* 4 Cards de Métricas com Micro-interações e Transição Fluida */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3">
            {/* Card 1: TOTAL PREVISTO */}
            <div className="p-3 rounded-xl bg-white/5 border border-white/10 transition-all duration-200 hover:bg-white/10 hover:-translate-y-0.5 hover:border-blue-400/40">
              <div className="flex items-center justify-between text-slate-400 text-[10px] uppercase font-semibold">
                <span>Total Previsto</span>
                <DollarSign className="h-3.5 w-3.5 text-blue-400" />
              </div>
              <div className="text-base sm:text-xl font-bold text-white mt-1 tabular-nums transition-all">
                {formatCurrency(currentStats.previsto)}
              </div>
              <p className="text-[10px] text-slate-400 mt-0.5">
                {currentStats.isCustomMonth ? "Meta do mês" : "Contratos vigentes"}
              </p>
            </div>

            {/* Card 2: RECEITA EM CAIXA (COM GLOW AO PINGAR ASAAS) */}
            <div
              className={`p-3 rounded-xl transition-all duration-300 hover:-translate-y-0.5 ${
                livePing
                  ? "bg-emerald-500/25 border border-emerald-400/80 shadow-[0_0_15px_rgba(0,200,120,0.3)]"
                  : "bg-emerald-500/10 border border-emerald-500/25 hover:border-emerald-400/50"
              }`}
            >
              <div className="flex items-center justify-between text-emerald-400 text-[10px] uppercase font-semibold">
                <span>Receita em Caixa</span>
                <ArrowUpRight className={`h-3.5 w-3.5 transition-transform ${livePing ? "scale-125 text-[#00c878]" : ""}`} />
              </div>
              <div className="text-base sm:text-xl font-bold text-[#00c878] mt-1 tabular-nums transition-all">
                {formatCurrency(currentStats.caixa)}
              </div>
              <p className="text-[10px] text-emerald-300/80 mt-0.5">
                Liquidado via PIX
              </p>
            </div>

            {/* Card 3: INADIMPLÊNCIA */}
            <div className="p-3 rounded-xl bg-white/5 border border-white/10 transition-all duration-200 hover:bg-white/10 hover:-translate-y-0.5 hover:border-emerald-400/40">
              <div className="flex items-center justify-between text-slate-400 text-[10px] uppercase font-semibold">
                <span>Inadimplência</span>
                <TrendingUp className="h-3.5 w-3.5 text-emerald-400" />
              </div>
              <div className="text-base sm:text-xl font-bold text-white mt-1 flex items-center gap-1.5 tabular-nums transition-all">
                <span>{currentStats.inadimplencia}%</span>
                <span className="text-[10px] px-1.5 py-0.2 bg-emerald-500/20 text-[#00c878] rounded-xs font-semibold">
                  -82%
                </span>
              </div>
              <p className="text-[10px] text-slate-400 mt-0.5">Régua ativa Asaas</p>
            </div>

            {/* Card 4: ASSIDUIDADE */}
            <div className="p-3 rounded-xl bg-white/5 border border-white/10 transition-all duration-200 hover:bg-white/10 hover:-translate-y-0.5 hover:border-indigo-400/40">
              <div className="flex items-center justify-between text-slate-400 text-[10px] uppercase font-semibold">
                <span>Assiduidade</span>
                <Users className="h-3.5 w-3.5 text-indigo-400" />
              </div>
              <div className="text-base sm:text-xl font-bold text-white mt-1 tabular-nums transition-all">
                {currentStats.assiduidade}%
              </div>
              <p className="text-[10px] text-slate-400 mt-0.5">Diário digital</p>
            </div>
          </div>

          {/* Gráfico Interativo com Animação em Onda e Tooltip ao passar o cursor */}
          <div className="relative p-3 sm:p-4 rounded-xl bg-white/5 border border-white/10 overflow-hidden">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-white flex items-center gap-2">
                <span>Previsão vs. Liquidação Realizada (Mês a Mês)</span>
                <span className="text-[10px] text-slate-400 hidden md:inline font-normal">
                  (Passe o cursor sobre os meses para inspecionar)
                </span>
              </span>
              <span className="text-[10px] text-emerald-400 font-bold flex items-center gap-1">
                <CheckCircle2 className="h-3 w-3" /> Conciliação 100% Automática
              </span>
            </div>

            {/* Tooltip Dinâmico Flutuante ao Passar Mouse */}
            {activeMonthIdx !== null && (
              <div className="absolute top-3 left-1/2 -translate-x-1/2 z-20 px-3 py-1 rounded-full bg-[#07132c]/90 border border-emerald-400/50 text-white text-[11px] shadow-xl backdrop-blur-md flex items-center gap-2 animate-in fade-in zoom-in-95 duration-150">
                <span className="h-1.5 w-1.5 rounded-full bg-[#00c878] animate-pulse" />
                <span className="font-semibold text-emerald-300">
                  {MONTHS_DATA[activeMonthIdx].fullName}:
                </span>
                <span>
                  {formatCurrency(MONTHS_DATA[activeMonthIdx].caixa)} de {formatCurrency(MONTHS_DATA[activeMonthIdx].previsto)}
                </span>
                <span className="text-slate-400">
                  ({Math.round((MONTHS_DATA[activeMonthIdx].caixa / MONTHS_DATA[activeMonthIdx].previsto) * 100)}% liquidado)
                </span>
              </div>
            )}

            {/* Grade de 12 Barras com Animação de Onda Staggered */}
            <div className="h-24 w-full flex items-end gap-1.5 sm:gap-2 pt-4">
              {MONTHS_DATA.map((item, idx) => {
                const isActive = activeMonthIdx === idx;
                return (
                  <div
                    key={item.short}
                    className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end cursor-pointer group relative"
                    onMouseEnter={() => setActiveMonthIdx(idx)}
                    onMouseLeave={() => setActiveMonthIdx(null)}
                    onClick={() => setActiveMonthIdx(activeMonthIdx === idx ? null : idx)}
                    role="button"
                    tabIndex={0}
                    aria-label={`Ver métricas de ${item.fullName}`}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        setActiveMonthIdx(activeMonthIdx === idx ? null : idx);
                      }
                    }}
                  >
                    {/* Barra Animada com ScaleY de baixo para cima */}
                    <div
                      className={`w-full rounded-t-xs transition-all duration-300 relative ${
                        isActive
                          ? "bg-gradient-to-t from-[#0052ff] to-[#00f090] brightness-125 shadow-[0_0_12px_rgba(0,200,120,0.6)]"
                          : "bg-gradient-to-t from-[#0052ff] to-[#00c878] group-hover:brightness-125"
                      }`}
                      style={{
                        height: `${item.heightPct}%`,
                        transform: isVisible ? "scaleY(1)" : "scaleY(0)",
                        transformOrigin: "bottom",
                        transitionProperty: "transform, height, filter, box-shadow",
                        transitionDuration: prefersReducedMotion.current ? "0ms" : "700ms",
                        transitionDelay: prefersReducedMotion.current ? "0ms" : `${idx * 40}ms`,
                        transitionTimingFunction: "cubic-bezier(0.16, 1, 0.3, 1)",
                      }}
                    >
                      {/* Ponto indicador de pico no hover */}
                      {isActive && (
                        <span className="absolute -top-1 left-1/2 -translate-x-1/2 h-1.5 w-1.5 rounded-full bg-white shadow-xs" />
                      )}
                    </div>

                    {/* Rótulo do Mês com destaque no hover */}
                    <span
                      className={`text-[9px] font-mono transition-colors duration-150 ${
                        isActive
                          ? "text-[#00c878] font-bold scale-110"
                          : "text-slate-400 group-hover:text-white"
                      }`}
                    >
                      {item.short}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
