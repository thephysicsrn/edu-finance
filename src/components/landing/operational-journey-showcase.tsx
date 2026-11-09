"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  UserPlus,
  Receipt,
  CalendarCheck,
  TrendingUp,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  Zap,
  Clock,
  ShieldCheck,
  CreditCard,
  QrCode,
  FileCheck,
} from "lucide-react";

interface JourneyStep {
  id: number;
  tag: string;
  stepNumber: string;
  title: string;
  subtitle: string;
  description: string;
  icon: typeof UserPlus;
  accentColor: string;
  accentBg: string;
  accentBorder: string;
  glowColor: string;
  kpis: { label: string; value: string }[];
  previewScreen: {
    title: string;
    badge: string;
    rows: {
      primary: string;
      secondary: string;
      highlight: string;
      status: "success" | "info" | "pending";
    }[];
    footerNote: string;
  };
  ctaLabel: string;
  destinationHref: string;
}

const STEPS: JourneyStep[] = [
  {
    id: 1,
    tag: "Passo 01 • Entrada de Alunos",
    stepNumber: "01",
    title: "Matrícula Ágil & Contratos Atômicos",
    subtitle: "Do balcão de vendas ao carnê completo em menos de 2 minutos",
    description:
      "Cadastro integrado de aluno e responsável legal, aplicação de bolsas com travas automáticas e geração atômica de todas as parcelas no banco sem retrabalho manual.",
    icon: UserPlus,
    accentColor: "#0052ff",
    accentBg: "bg-blue-50 text-[#0052ff] border-blue-200",
    accentBorder: "border-[#0052ff]",
    glowColor: "rgba(0,82,255,0.15)",
    kpis: [
      { label: "Tempo médio de matrícula", value: "1m 45s" },
      { label: "Parcelas geradas", value: "Atômicas (12x)" },
    ],
    previewScreen: {
      title: "Contrato de Matrícula • Ano Letivo 2026",
      badge: "Matrícula Concluída",
      rows: [
        {
          primary: "Lucas Silveira Santos",
          secondary: "Turma Alfa (Manhã) • Extensivo ENEM",
          highlight: "Bolsa Mérito (15%)",
          status: "success",
        },
        {
          primary: "Roberto Silveira (Pai/Responsável)",
          secondary: "CPF 042.***.***-18 • Assinatura Digital vinculada",
          highlight: "Contrato Assinado",
          status: "info",
        },
        {
          primary: "Carnê Financeiro Vinculado",
          secondary: "12 parcelas emitidas com chave PIX e boleto registrado",
          highlight: "Asaas v3 Ativo",
          status: "success",
        },
      ],
      footerNote: "Carnê PDF e termo de aceite despachados no WhatsApp do responsável automaticamente.",
    },
    ctaLabel: "Acessar Demonstração (Secretaria)",
    destinationHref: "/login?role=secretary",
  },
  {
    id: 2,
    tag: "Passo 02 • Arrecadação & Baixa",
    stepNumber: "02",
    title: "Régua Asaas & Frente de Caixa (Smart POS)",
    subtitle: "Cobrança preventiva no WhatsApp e conciliação instantânea sem CNAB",
    description:
      "Envio automático de avisos antes do vencimento com QR Code PIX dinâmico. Recebeu no balcão da secretaria? Dê baixa instantânea com dinheiro, maquininha ou PIX emitindo recibo na hora.",
    icon: Receipt,
    accentColor: "#00c878",
    accentBg: "bg-emerald-50 text-[#009b5c] border-emerald-200",
    accentBorder: "border-[#00c878]",
    glowColor: "rgba(0,200,120,0.15)",
    kpis: [
      { label: "Liquidação no PIX", value: "Instantânea" },
      { label: "Redução de Inadimplência", value: "-82%" },
    ],
    previewScreen: {
      title: "Fila de Liquidação • Asaas Webhook API v3",
      badge: "Conciliação Ativa",
      rows: [
        {
          primary: "Mensalidade 06/12 • R$ 850,00",
          secondary: "Lucas Silveira • Liquidado via PIX Dinâmico",
          highlight: "Baixa em 1.1s",
          status: "success",
        },
        {
          primary: "Frente de Caixa (Balcão Secretaria)",
          secondary: "Recibo térmico gerado • Autenticação digital",
          highlight: "Comprovante Emitido",
          status: "info",
        },
        {
          primary: "Régua Preventiva (WhatsApp & E-mail)",
          secondary: "Aviso enviado 3 dias antes do vencimento",
          highlight: "Taxa Abertura 94%",
          status: "success",
        },
      ],
      footerNote: "Zero arquivos de remessa ou retorno manual (.REM/.RET). O banco notifica e o sistema dá baixa sozinho.",
    },
    ctaLabel: "Acessar Demonstração (Cobrança)",
    destinationHref: "/login?role=secretary",
  },
  {
    id: 3,
    tag: "Passo 03 • Rotina Pedagógica",
    stepNumber: "03",
    title: "Diário de Frequência & Aulas em 1 Clique",
    subtitle: "Ambiente limpo e ágil para o corpo docente, com total sigilo financeiro",
    description:
      "Professores acessam somente a sua grade letiva e realizam a chamada de 40 alunos em poucos segundos. Ausências consecutivas alertam a coordenação para resgate preventivo.",
    icon: CalendarCheck,
    accentColor: "#4f46e5",
    accentBg: "bg-indigo-50 text-indigo-700 border-indigo-200",
    accentBorder: "border-indigo-500",
    glowColor: "rgba(79,70,229,0.15)",
    kpis: [
      { label: "Tempo de chamada", value: "< 30 segundos" },
      { label: "Acesso a dados de faturas", value: "0% (Privado)" },
    ],
    previewScreen: {
      title: "Diário de Classe • Prof. Carlos Eduardo",
      badge: "Chamada em Aberto",
      rows: [
        {
          primary: "Física Geral • Turma Alfa (Manhã)",
          secondary: "Conteúdo: Dinâmica de Newton e Leis do Movimento",
          highlight: "Aula 24/80",
          status: "info",
        },
        {
          primary: "Lista de Presença Concluída",
          secondary: "38 alunos presentes • 2 faltas justificadas com atestado",
          highlight: "95% Assiduidade",
          status: "success",
        },
        {
          primary: "Alerta de Frequência Preventivo",
          secondary: "Disparo automático para a coordenação pedagógica",
          highlight: "Sem Evasão",
          status: "success",
        },
      ],
      footerNote: "Ambiente 100% focado no aprendizado. Professores nunca têm acesso a mensalidades ou contratos.",
    },
    ctaLabel: "Acessar Demonstração (Professor)",
    destinationHref: "/login?role=teacher",
  },
  {
    id: 4,
    tag: "Passo 04 • Inteligência Executiva",
    stepNumber: "04",
    title: "DRE em Tempo Real, Vagas & Fluxo de Caixa",
    subtitle: "Visão estratégica de ponta a ponta para a tomada de decisão da direção",
    description:
      "Acompanhe o faturamento previsto contra a receita efetivamente em caixa, taxa de ocupação de salas por turno e previsibilidade de caixa para os próximos meses.",
    icon: TrendingUp,
    accentColor: "#07132c",
    accentBg: "bg-slate-100 text-[#07132c] border-slate-300",
    accentBorder: "border-[#07132c]",
    glowColor: "rgba(7,19,44,0.15)",
    kpis: [
      { label: "Receita em Caixa", value: "R$ 82.400,00" },
      { label: "Taxa de Ocupação", value: "89% das Salas" },
    ],
    previewScreen: {
      title: "Painel Executivo da Direção • Ano Letivo 2026",
      badge: "Consolidado 100%",
      rows: [
        {
          primary: "Faturamento Vigente (Contratos Ativos)",
          secondary: "Meta anual: R$ 94.850,00 • 80 alunos matriculados",
          highlight: "R$ 94.850,00",
          status: "info",
        },
        {
          primary: "Receita Liquidada em Conta Corrente",
          secondary: "Baixas conciliadas via PIX e balcão",
          highlight: "R$ 82.400,00",
          status: "success",
        },
        {
          primary: "Índice de Inadimplência Asaas",
          secondary: "Régua ativa com recuperação automática amigável",
          highlight: "3.8% (-82%)",
          status: "success",
        },
      ],
      footerNote: "Auditoria contábil completa: saiba exatamente quanto vai entrar no caixa em cada dia do mês.",
    },
    ctaLabel: "Acessar Demonstração (Diretoria)",
    destinationHref: "/login?role=admin",
  },
];

export function OperationalJourneyShowcase() {
  const [activeStepId, setActiveStepId] = useState(1);
  const [isVisible, setIsVisible] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const activeStep = STEPS.find((s) => s.id === activeStepId) || STEPS[0];

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
      { threshold: 0.15 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={containerRef} className="space-y-10 select-none">
      {/* 1. SELETOR CRONOLÓGICO EM 4 ETAPAS (LINHA DO TEMPO SEQUENCIAL) */}
      <div className="relative">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {STEPS.map((step) => {
            const isActive = activeStepId === step.id;
            const IconComponent = step.icon;

            return (
              <button
                key={step.id}
                type="button"
                onClick={() => setActiveStepId(step.id)}
                className={`relative p-4 sm:p-5 rounded-2xl border text-left transition-all duration-200 cursor-pointer flex flex-col justify-between ${
                  isActive
                    ? "bg-[#07132c] text-white border-transparent shadow-xl scale-[1.02] ring-2 ring-[#0052ff]"
                    : "bg-white text-slate-700 border-slate-200/90 hover:bg-slate-50 hover:border-slate-300 shadow-xs"
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span
                      className={`text-xs font-mono font-bold px-2 py-0.5 rounded-md ${
                        isActive
                          ? "bg-white/10 text-slate-200"
                          : "bg-slate-100 text-slate-600"
                      }`}
                    >
                      Etapa {step.stepNumber}
                    </span>
                    <div
                      className={`p-2 rounded-xl transition-colors ${
                        isActive ? "bg-white/10 text-white" : step.accentBg
                      }`}
                    >
                      <IconComponent className="h-4 w-4" />
                    </div>
                  </div>

                  <h4
                    className={`text-sm sm:text-base font-bold leading-tight ${
                      isActive ? "text-white" : "text-slate-900"
                    }`}
                  >
                    {step.title.split("&")[0]}
                  </h4>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-200/40 text-[11px] flex items-center justify-between">
                  <span className={isActive ? "text-slate-300 font-medium" : "text-slate-500"}>
                    {isActive ? "Em exibição" : "Ver detalhes"}
                  </span>
                  <ArrowRight
                    className={`h-3 w-3 transition-transform ${
                      isActive ? "translate-x-1 text-[#00c878]" : "text-slate-400"
                    }`}
                  />
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. PAINEL CENTRAL DE ALTA FIDELIDADE: DETALHES + MINI-TELA INTERATIVA */}
      <div
        className="rounded-3xl border border-slate-200/90 bg-gradient-to-b from-white to-slate-50/80 p-6 sm:p-10 shadow-xl transition-all duration-300"
        style={{
          boxShadow: `0 25px 50px -15px ${activeStep.glowColor}`,
        }}
      >
        <div className="grid gap-8 lg:grid-cols-12 items-center">
          {/* Coluna Esquerda: Contexto, Descrição e Métricas Chave (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-slate-900 text-white mb-3">
                <Sparkles className="h-3 w-3 text-[#00c878]" />
                <span>{activeStep.tag}</span>
              </div>
              <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight leading-snug">
                {activeStep.title}
              </h3>
              <p className="text-xs sm:text-sm font-semibold text-[#0052ff] mt-1">
                {activeStep.subtitle}
              </p>
            </div>

            <p className="text-slate-600 text-xs sm:text-sm leading-relaxed">
              {activeStep.description}
            </p>

            {/* 2 Cards Rápidos de KPIs */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              {activeStep.kpis.map((kpi, kIdx) => (
                <div
                  key={kIdx}
                  className="p-3.5 rounded-xl bg-white border border-slate-200/80 shadow-xs"
                >
                  <span className="text-[10px] uppercase font-bold text-slate-600 block">
                    {kpi.label}
                  </span>
                  <span className="text-base sm:text-lg font-extrabold text-[#07132c] mt-0.5 block">
                    {kpi.value}
                  </span>
                </div>
              ))}
            </div>

            {/* CTA Contextual para Testar a Etapa */}
            <div className="pt-2">
              <Link href={activeStep.destinationHref}>
                <button
                  type="button"
                  className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-[#0052ff] hover:bg-[#0041cc] active:bg-[#0037b3] text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20 transition-all cursor-pointer"
                >
                  <span>{activeStep.ctaLabel}</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              </Link>
            </div>
          </div>

          {/* Coluna Direita: Mini-Tela Realística do Sistema (7 cols) */}
          <div className="lg:col-span-7">
            <div className="rounded-2xl border border-slate-800 bg-[#07132c] text-white p-4 sm:p-6 shadow-2xl overflow-hidden relative">
              {/* Barra da Janela do Sistema */}
              <div className="flex items-center justify-between pb-3 mb-4 border-b border-white/10 text-xs">
                <div className="flex items-center gap-2">
                  <div className="flex gap-1.5">
                    <span className="h-2.5 w-2.5 rounded-full bg-rose-500" />
                    <span className="h-2.5 w-2.5 rounded-full bg-amber-500" />
                    <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
                  </div>
                  <span className="text-[11px] font-mono text-slate-400 pl-2">
                    edufinance.app/fluxo/{activeStep.id}
                  </span>
                </div>

                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-[#00c878] text-[10px] font-bold border border-emerald-500/30">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#00c878] animate-pulse" />
                  {activeStep.previewScreen.badge}
                </span>
              </div>

              {/* Título Interno da Mini-Tela */}
              <div className="mb-4">
                <span className="text-[10px] uppercase font-semibold text-slate-400">
                  Visualização em Tempo Real do Módulo
                </span>
                <h4 className="text-base sm:text-lg font-bold text-white mt-0.5">
                  {activeStep.previewScreen.title}
                </h4>
              </div>

              {/* Linhas de Dados Interativas com Alta Densidade */}
              <div className="space-y-2.5">
                {activeStep.previewScreen.rows.map((row, rIdx) => (
                  <div
                    key={rIdx}
                    className="p-3 rounded-xl bg-white/5 border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-2 hover:bg-white/10 transition-colors"
                  >
                    <div>
                      <p className="text-xs sm:text-sm font-bold text-white leading-tight">
                        {row.primary}
                      </p>
                      <p className="text-[11px] text-slate-400 mt-0.5 leading-tight">
                        {row.secondary}
                      </p>
                    </div>

                    <div className="shrink-0">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[10px] font-bold ${
                          row.status === "success"
                            ? "bg-emerald-500/20 text-[#00c878] border border-emerald-500/30"
                            : "bg-blue-500/20 text-blue-300 border border-blue-500/30"
                        }`}
                      >
                        <CheckCircle2 className="h-3 w-3" />
                        <span>{row.highlight}</span>
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Nota de Rodapé Informativa */}
              <div className="mt-4 pt-3 border-t border-white/10 text-[11px] text-slate-400 flex items-center gap-2">
                <Zap className="h-3.5 w-3.5 text-[#00c878] shrink-0" />
                <span>{activeStep.previewScreen.footerNote}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

