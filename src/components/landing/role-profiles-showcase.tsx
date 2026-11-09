"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  Headphones,
  GraduationCap,
  Sparkles,
} from "lucide-react";

interface RoleCardData {
  id: "admin" | "secretaria" | "professor";
  initials: "AD" | "SC" | "PF";
  tag: string;
  title: string;
  description: string;
  themeColor: string;
  badgeBg: string;
  badgeText: string;
  accentBorder: string;
  activeGlow: string;
  livePreview: {
    metric: string;
    subtext: string;
  };
  features: string[];
  ctaLabel: string;
  href: string;
}

const ROLES: RoleCardData[] = [
  {
    id: "admin",
    initials: "AD",
    tag: "Perfil Direção",
    title: "Administrador Geral",
    description:
      "Visão executiva 360° com faturamento previsto vs. realizado, DRE consolidado, índice de inadimplência e auditoria de parâmetros técnicos.",
    themeColor: "#0052ff",
    badgeBg: "bg-blue-100 text-[#0052ff] border-blue-200",
    badgeText: "text-[#0052ff]",
    accentBorder: "border-[#0052ff]/60 ring-2 ring-[#0052ff]/20",
    activeGlow: "shadow-[0_20px_40px_-15px_rgba(0,82,255,0.22)]",
    livePreview: {
      metric: "DRE Consolidado: R$ 82.400 em caixa",
      subtext: "Inadimplência contida em 3.8% com Asaas",
    },
    features: [
      "Fluxo de Caixa DRE em Tempo Real",
      "Gestão Completa de Turmas e Cursos",
      "Auditoria de Recebíveis e Extrato Bancário",
    ],
    ctaLabel: "Testar Visão de Direção",
    href: "/login",
  },
  {
    id: "secretaria",
    initials: "SC",
    tag: "Perfil Atendimento",
    title: "Secretaria Escolar",
    description:
      "Operações do balcão de atendimento: novas matrículas, controle de vagas restantes, baixa no caixa com comprovante e fila de cobrança no WhatsApp.",
    themeColor: "#00c878",
    badgeBg: "bg-emerald-100 text-[#009b5c] border-emerald-200",
    badgeText: "text-[#009b5c]",
    accentBorder: "border-[#00c878]/60 ring-2 ring-[#00c878]/20",
    activeGlow: "shadow-[0_20px_40px_-15px_rgba(0,200,120,0.22)]",
    livePreview: {
      metric: "Balcão Ativo: 80 Matrículas Cadastradas",
      subtext: "Baixa no caixa com carnê e QR Code PIX",
    },
    features: [
      "Matrícula em 1 clique com carnê gerado",
      "WhatsApp direto com pais em atraso",
      "Controle de Vagas por Sala e Turno",
    ],
    ctaLabel: "Testar Balcão da Secretaria",
    href: "/login",
  },
  {
    id: "professor",
    initials: "PF",
    tag: "Perfil Docente",
    title: "Corpo Docente",
    description:
      "Ambiente limpo e 100% pedagógico: grade de aulas do dia, chamada digital rápida, acompanhamento de faltas e zero exposição de dados financeiros.",
    themeColor: "#4f46e5",
    badgeBg: "bg-indigo-100 text-indigo-700 border-indigo-200",
    badgeText: "text-indigo-700",
    accentBorder: "border-indigo-500/60 ring-2 ring-indigo-500/20",
    activeGlow: "shadow-[0_20px_40px_-15px_rgba(79,70,229,0.22)]",
    livePreview: {
      metric: "Chamada Digital: 38 Presentes (95%)",
      subtext: "Frentes de Redação e Física lançadas hoje",
    },
    features: [
      "Chamada rápida com 1 clique",
      "Zero burocracia ou dados de faturas",
      "Diário de Conteúdo e Frequência Ágil",
    ],
    ctaLabel: "Testar Diário do Professor",
    href: "/login",
  },
];

export function RoleProfilesShowcase() {
  const [activeRole, setActiveRole] = useState<"admin" | "secretaria" | "professor">("admin");
  const [isVisible, setIsVisible] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const prefersReducedMotion = useRef(false);

  useEffect(() => {
    prefersReducedMotion.current = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

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
      { threshold: 0.15 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={containerRef} className="space-y-10 select-none">
      {/* Controles de Segmento / Filtro Rápido no Topo */}
      <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3">
        {ROLES.map((role) => {
          const isActive = activeRole === role.id;
          return (
            <button
              key={role.id}
              type="button"
              onClick={() => setActiveRole(role.id)}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold transition-all duration-200 cursor-pointer ${
                isActive
                  ? "bg-[#07132c] text-white shadow-md scale-105"
                  : "bg-white text-slate-600 hover:text-slate-900 border border-slate-200 hover:border-slate-300"
              }`}
            >
              {role.id === "admin" && <ShieldCheck className={`h-3.5 w-3.5 ${isActive ? "text-[#0052ff]" : "text-slate-400"}`} />}
              {role.id === "secretaria" && <Headphones className={`h-3.5 w-3.5 ${isActive ? "text-[#00c878]" : "text-slate-400"}`} />}
              {role.id === "professor" && <GraduationCap className={`h-3.5 w-3.5 ${isActive ? "text-indigo-400" : "text-slate-400"}`} />}
              <span>{role.title}</span>
            </button>
          );
        })}
      </div>

      {/* Grid com os 3 Cartões de Perfil Interativos */}
      <div className="grid gap-6 md:grid-cols-3 items-stretch">
        {ROLES.map((role, idx) => {
          const isActive = activeRole === role.id;

          return (
            <div
              key={role.id}
              onMouseEnter={() => setActiveRole(role.id)}
              onClick={() => setActiveRole(role.id)}
              className={`relative bg-white rounded-2xl p-6 sm:p-7 border flex flex-col justify-between cursor-pointer transition-all duration-300 ${
                isActive
                  ? `${role.accentBorder} ${role.activeGlow} -translate-y-2.5 z-10 bg-gradient-to-b from-white to-slate-50/50`
                  : "border-slate-200/90 shadow-xs hover:border-slate-300 hover:-translate-y-1 opacity-90 hover:opacity-100"
              }`}
              style={{
                opacity: isVisible || prefersReducedMotion.current ? 1 : 0,
                transform:
                  isVisible || prefersReducedMotion.current
                    ? isActive
                      ? "translateY(-10px)"
                      : "translateY(0)"
                    : "translateY(24px)",
                transitionProperty: "transform, opacity, box-shadow, border-color",
                transitionDuration: prefersReducedMotion.current ? "0ms" : "500ms",
                transitionDelay: prefersReducedMotion.current ? "0ms" : `${idx * 120}ms`,
                transitionTimingFunction: "cubic-bezier(0.16, 1, 0.3, 1)",
              }}
            >
              <div>
                {/* Header do Cartão: Badge com Iniciais e Tag */}
                <div className="flex items-center justify-between mb-4">
                  <div className="relative">
                    <div
                      className={`h-11 w-11 rounded-xl flex items-center justify-center font-bold text-xs border transition-transform duration-300 ${role.badgeBg} ${
                        isActive ? "scale-110 shadow-sm" : ""
                      }`}
                    >
                      {role.initials}
                    </div>
                    {/* Ping sutil no cartão ativo */}
                    {isActive && (
                      <span className="absolute -top-1 -right-1 flex h-3 w-3">
                        <span
                          className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75"
                          style={{ backgroundColor: role.themeColor }}
                        />
                        <span
                          className="relative inline-flex rounded-full h-3 w-3"
                          style={{ backgroundColor: role.themeColor }}
                        />
                      </span>
                    )}
                  </div>

                  <span
                    className={`text-[11px] font-bold uppercase tracking-wider block transition-colors duration-200 ${
                      isActive ? role.badgeText : "text-slate-400"
                    }`}
                  >
                    {role.tag}
                  </span>
                </div>

                {/* Título e Descrição */}
                <h3 className="text-lg sm:text-xl font-bold text-slate-900 mb-2 transition-colors">
                  {role.title}
                </h3>
                <p className="text-slate-600 text-xs sm:text-sm mb-4 leading-relaxed">
                  {role.description}
                </p>

                {/* Live Preview Teaser quando ativo */}
                <div
                  className={`mb-4 p-3 rounded-xl border transition-all duration-300 ${
                    isActive
                      ? "bg-slate-900 text-white border-slate-800 shadow-inner"
                      : "bg-slate-50 text-slate-700 border-slate-100"
                  }`}
                >
                  <div className="flex items-center gap-1.5 text-[10px] uppercase font-bold tracking-wider mb-1">
                    <Sparkles
                      className={`h-3 w-3 ${isActive ? "text-[#00c878]" : "text-slate-400"}`}
                    />
                    <span className={isActive ? "text-slate-300" : "text-slate-500"}>
                      Em Tempo Real no Painel
                    </span>
                  </div>
                  <p className="text-xs font-semibold leading-tight">{role.livePreview.metric}</p>
                  <p
                    className={`text-[11px] mt-0.5 ${
                      isActive ? "text-slate-400" : "text-slate-500"
                    }`}
                  >
                    {role.livePreview.subtext}
                  </p>
                </div>

                {/* Checklist de Recursos com Micro-interações */}
                <div className="text-xs text-slate-600 space-y-2.5 pt-3 border-t border-slate-100">
                  {role.features.map((feature, fIdx) => (
                    <p
                      key={fIdx}
                      className="flex items-center gap-2 font-medium transition-colors hover:text-slate-900 group"
                    >
                      <CheckCircle2
                        className="h-4 w-4 shrink-0 transition-transform duration-200 group-hover:scale-120"
                        style={{ color: role.themeColor }}
                      />
                      <span>{feature}</span>
                    </p>
                  ))}
                </div>
              </div>

              {/* Botão de Ação Direta para o Papel */}
              <div className="mt-6 pt-4 border-t border-slate-100">
                <Link href={role.href} className="block">
                  <button
                    type="button"
                    className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer ${
                      isActive
                        ? "text-white shadow-md hover:brightness-110 active:scale-98"
                        : "bg-slate-100 text-slate-700 hover:bg-slate-200 hover:text-slate-900"
                    }`}
                    style={isActive ? { backgroundColor: role.themeColor } : {}}
                  >
                    <span>{role.ctaLabel}</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

