"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowRight, School, Sparkles, Building2 } from "lucide-react";
import { cn } from "@/lib/utils";

export function PartnersSection() {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.15 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="parceiros"
      className="py-24 sm:py-32 bg-slate-50/70 border-y border-slate-200/80 relative overflow-hidden select-none"
    >
      {/* Luz ambiente de fundo suave */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] bg-gradient-to-r from-blue-500/5 via-indigo-500/5 to-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Título Autoritário e Direto (Sem kicker decorativo, conforme Craft Floor) */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2
            className={cn(
              "text-3xl sm:text-4xl lg:text-5xl font-black text-[#07132c] tracking-tight transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]",
              isVisible
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-4"
            )}
          >
            Nossos Parceiros
          </h2>
          <p
            className={cn(
              "mt-3 text-sm sm:text-base text-slate-600 max-w-xl mx-auto leading-relaxed transition-all duration-700 delay-100 ease-[cubic-bezier(0.16,1,0.3,1)]",
              isVisible
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-4"
            )}
          >
            Ambientes oficiais conectados à plataforma Edu.Finance. Selecione sua instituição para acessar o portal do aluno, responsáveis e área restrita.
          </p>
        </div>

        {/* Grid de Parceiros com Entrada Escalonada */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto items-stretch">
          {/* ========================================================== */}
          {/* CARD DESTAQUE: CALL CURSOS ISOLADOS                        */}
          {/* ========================================================== */}
          <Link
            href="/call"
            className={cn(
              "group relative bg-white border border-slate-200/90 hover:border-[#0052ff]/80 rounded-2xl p-7 sm:p-8 flex flex-col justify-between overflow-hidden cursor-pointer",
              "shadow-[0_4px_20px_-4px_rgba(7,19,44,0.06)] hover:shadow-[0_20px_40px_-12px_rgba(12,81,149,0.18)]",
              "transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]",
              "active:scale-[0.985] active:duration-75",
              isVisible
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-8"
            )}
            style={{
              transitionDelay: isVisible ? "150ms" : "0ms",
            }}
          >
            {/* Top Sheen Gradient (Efeito de brilho no topo do card ao passar o mouse) */}
            <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-[#0052ff] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

            {/* Glow sutil no canto superior esquerdo */}
            <div className="absolute -top-12 -left-12 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

            {/* Cabeçalho do Card: Logo + Badge de Status */}
            <div>
              <div className="flex items-start justify-between gap-4 mb-5">
                {/* Logo Oficial com Micro-Elevação Suave */}
                <div className="w-16 h-16 rounded-2xl bg-white border border-slate-200/80 p-2 shadow-xs flex items-center justify-center transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:-translate-y-1 group-hover:shadow-md group-hover:border-blue-200">
                  <img
                    src="/call-logo.png"
                    alt="Call Cursos Isolados"
                    className="w-full h-full object-contain"
                  />
                </div>

                {/* Badge de Ambiente Ativo com Concentric Beacon Pulse */}
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/80 shadow-2xs">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                  </span>
                  <span>Ambiente Ativo</span>
                </div>
              </div>

              {/* Informações da Instituição */}
              <h3 className="text-2xl font-black text-[#07132c] tracking-tight group-hover:text-[#0052ff] transition-colors duration-200">
                Call Cursos Isolados
              </h3>
              <p className="text-xs font-semibold text-slate-500 mt-1 flex items-center gap-1.5">
                <span>Natal • RN</span>
                <span className="h-1 w-1 rounded-full bg-slate-300" />
                <span className="text-[#0c5195] font-bold">Unidade Presencial</span>
              </p>
              <p className="text-xs sm:text-sm text-slate-600 mt-3 leading-relaxed">
                Preparatório de alto rendimento para o ENEM, vestibulares de Medicina e turmas isoladas de excelência acadêmica.
              </p>
            </div>

            {/* Barra de Ação Inferior com Seta Cinética */}
            <div className="mt-8 pt-5 border-t border-slate-100 flex items-center justify-between">
              <span className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-[#0052ff] group-hover:text-[#0041cc]">
                <span>Acessar Sistema do Call</span>
                <ArrowRight className="h-4 w-4 transition-transform duration-250 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-x-1.5" />
              </span>
              <span className="text-[11px] font-mono text-slate-400 bg-slate-50 px-2 py-0.5 rounded-md border border-slate-200/60">
                url/call
              </span>
            </div>
          </Link>

          {/* ========================================================== */}
          {/* CARD SEJA UM PARCEIRO                                     */}
          {/* ========================================================== */}
          <a
            href="#contato"
            className={cn(
              "group relative bg-white/60 hover:bg-white border-2 border-dashed border-slate-300 hover:border-[#0052ff]/60 rounded-2xl p-7 sm:p-8 flex flex-col justify-between cursor-pointer",
              "transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]",
              "hover:shadow-[0_12px_30px_-8px_rgba(7,19,44,0.08)]",
              "active:scale-[0.985] active:duration-75",
              isVisible
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-8"
            )}
            style={{
              transitionDelay: isVisible ? "250ms" : "0ms",
            }}
          >
            <div>
              <div className="flex items-start justify-between gap-4 mb-5">
                <div className="w-16 h-16 rounded-2xl bg-slate-100 text-slate-400 group-hover:bg-blue-50 group-hover:text-[#0052ff] border border-slate-200 flex items-center justify-center transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:-translate-y-1">
                  <School className="h-8 w-8" />
                </div>

                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-slate-100 text-slate-600 border border-slate-200/80">
                  Novos Clientes
                </span>
              </div>

              <h3 className="text-2xl font-bold text-slate-800 tracking-tight group-hover:text-[#0052ff] transition-colors duration-200">
                Sua Instituição Aqui
              </h3>
              <p className="text-xs font-semibold text-slate-500 mt-1">
                Faça parte da rede de tecnologia Edu.Finance
              </p>
              <p className="text-xs sm:text-sm text-slate-500 mt-3 leading-relaxed">
                Modernize o financeiro, automatize mensalidades via Asaas e reduza a inadimplência no seu cursinho ou colégio em até 82%.
              </p>
            </div>

            <div className="mt-8 pt-5 border-t border-slate-200/60 flex items-center justify-between text-xs sm:text-sm font-bold text-slate-600 group-hover:text-[#0052ff]">
              <span>Quero Ser um Parceiro</span>
              <ArrowRight className="h-4 w-4 transition-transform duration-250 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-x-1.5" />
            </div>
          </a>
        </div>
      </div>
    </section>
  );
}
