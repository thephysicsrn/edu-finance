"use client";

import { useEffect, useState, useRef } from "react";
import {
  DollarSign,
  TrendingUp,
  Users,
  CheckCircle2,
  ArrowUpRight,
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";

export function HeroMockup3D() {
  const [scrollY, setScrollY] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setIsMobile(window.innerWidth < 768);
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);

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
    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

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
        className="relative rounded-2xl border border-white/20 bg-[#0c1a3b]/95 p-3 sm:p-5 shadow-[0_25px_60px_-15px_rgba(0,82,255,0.35)] backdrop-blur-xl transition-transform duration-200 ease-out"
        style={{
          transform: `rotateX(${tiltX}deg) translateY(-${scrollOffset}px)`,
          transformStyle: "preserve-3d",
        }}
      >
        {/* Barra Superior do Navegador / Sistema */}
        <div className="flex items-center justify-between pb-3 mb-4 border-b border-white/10 text-xs">
          <div className="flex items-center gap-2">
            <div className="flex gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-rose-500/80" />
              <span className="h-2.5 w-2.5 rounded-full bg-amber-500/80" />
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-500/80" />
            </div>
            <span className="text-[11px] font-mono text-slate-400 pl-2">
              edufinance.app/dashboard
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/20 text-[#00c878] text-[10px] font-bold border border-emerald-500/30">
              <span className="h-1.5 w-1.5 rounded-full bg-[#00c878] animate-pulse" />
              Asaas API v3 Conectado
            </span>
          </div>
        </div>

        {/* Dashboard Grid Interno */}
        <div className="space-y-4">
          {/* Header Interno do Mockup */}
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-400 font-medium">Ano Letivo 2026</p>
              <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">
                Painel Consolidado de Gestão Escolar
              </h3>
            </div>
            <div className="hidden sm:flex items-center gap-2 text-xs">
              <span className="px-2.5 py-1 rounded-md bg-white/10 text-slate-200 text-[11px]">
                80 Alunos Ativos
              </span>
              <span className="px-2.5 py-1 rounded-md bg-blue-600/30 text-blue-300 text-[11px] font-semibold border border-blue-400/30">
                2 Turmas Atribuidas
              </span>
            </div>
          </div>

          {/* 4 Cards de Métricas */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3">
            <div className="p-3 rounded-xl bg-white/5 border border-white/10">
              <div className="flex items-center justify-between text-slate-400 text-[10px] uppercase font-semibold">
                <span>Total Previsto</span>
                <DollarSign className="h-3.5 w-3.5 text-blue-400" />
              </div>
              <div className="text-base sm:text-xl font-bold text-white mt-1">
                R$ 94.850,00
              </div>
              <p className="text-[10px] text-slate-400 mt-0.5">Contratos vigentes</p>
            </div>

            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/25">
              <div className="flex items-center justify-between text-emerald-400 text-[10px] uppercase font-semibold">
                <span>Receita em Caixa</span>
                <ArrowUpRight className="h-3.5 w-3.5" />
              </div>
              <div className="text-base sm:text-xl font-bold text-[#00c878] mt-1">
                R$ 82.400,00
              </div>
              <p className="text-[10px] text-emerald-300/80 mt-0.5">Liquidado via PIX</p>
            </div>

            <div className="p-3 rounded-xl bg-white/5 border border-white/10">
              <div className="flex items-center justify-between text-slate-400 text-[10px] uppercase font-semibold">
                <span>Inadimplência</span>
                <TrendingUp className="h-3.5 w-3.5 text-emerald-400" />
              </div>
              <div className="text-base sm:text-xl font-bold text-white mt-1 flex items-center gap-1.5">
                <span>3.8%</span>
                <span className="text-[10px] px-1.5 py-0.2 bg-emerald-500/20 text-[#00c878] rounded-xs font-semibold">
                  -82%
                </span>
              </div>
              <p className="text-[10px] text-slate-400 mt-0.5">Régua ativa Asaas</p>
            </div>

            <div className="p-3 rounded-xl bg-white/5 border border-white/10">
              <div className="flex items-center justify-between text-slate-400 text-[10px] uppercase font-semibold">
                <span>Assiduidade</span>
                <Users className="h-3.5 w-3.5 text-indigo-400" />
              </div>
              <div className="text-base sm:text-xl font-bold text-white mt-1">
                94.8%
              </div>
              <p className="text-[10px] text-slate-400 mt-0.5">Diário digital</p>
            </div>
          </div>

          {/* Gráfico Simplificado em SVG de Fluxo de Caixa */}
          <div className="p-3 sm:p-4 rounded-xl bg-white/5 border border-white/10">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-white">
                Previsão vs. Liquidação Realizada (Mês a Mês)
              </span>
              <span className="text-[10px] text-emerald-400 font-bold flex items-center gap-1">
                <CheckCircle2 className="h-3 w-3" /> Conciliação 100% Automática
              </span>
            </div>
            <div className="h-20 w-full flex items-end gap-2 pt-2">
              {[40, 55, 68, 72, 85, 92, 98, 94, 90, 88, 96, 100].map((val, idx) => (
                <div key={idx} className="flex-1 flex flex-col items-center gap-1 h-full justify-end group">
                  <div
                    className="w-full rounded-t-xs bg-gradient-to-t from-[#0052ff] to-[#00c878] group-hover:brightness-125 transition-all"
                    style={{ height: `${val}%` }}
                  />
                  <span className="text-[9px] text-slate-400 font-mono hidden sm:block">
                    {["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"][idx]}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

