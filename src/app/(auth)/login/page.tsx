"use client";

import { useState, useEffect, Suspense } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Eye,
  EyeOff,
  Loader2,
  AlertCircle,
  ShieldCheck,
  UserCheck,
  GraduationCap,
} from "lucide-react";
import { EduFinanceLogo } from "@/components/shared/logo";

const DEMO_PROFILES = [
  {
    role: "ADMIN",
    title: "Administrador",
    badge: "Visão Geral & KPIs",
    email: "admin@edufinance.com.br",
    password: "admin123",
    icon: ShieldCheck,
  },
  {
    role: "SECRETARY",
    title: "Secretaria",
    badge: "Matrícula & Caixa",
    email: "secretaria@cursinhopro.com.br",
    password: "secretaria123",
    icon: UserCheck,
  },
  {
    role: "TEACHER",
    title: "Professor",
    badge: "Diário & Chamada",
    email: "professor@cursinhopro.com.br",
    password: "prof123",
    icon: GraduationCap,
  },
  {
    role: "GUARDIAN",
    title: "Pai / Responsável",
    badge: "Boletos & PIX do Filho",
    email: "responsavel@cursinhopro.com.br",
    password: "pai123",
    icon: ShieldCheck,
  },
];

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const roleParam = searchParams.get("role")?.toLowerCase();

  const [email, setEmail] = useState("admin@edufinance.com.br");
  const [password, setPassword] = useState("admin123");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!roleParam) return;
    if (roleParam === "admin" || roleParam === "direcao" || roleParam === "diretoria") {
      setEmail("admin@edufinance.com.br");
      setPassword("admin123");
      setError(null);
    } else if (
      roleParam === "secretaria" ||
      roleParam === "secretary" ||
      roleParam === "atendimento" ||
      roleParam === "financeiro" ||
      roleParam === "cobranca"
    ) {
      setEmail("secretaria@cursinhopro.com.br");
      setPassword("secretaria123");
      setError(null);
    } else if (
      roleParam === "professor" ||
      roleParam === "teacher" ||
      roleParam === "docente" ||
      roleParam === "pedagogico"
    ) {
      setEmail("professor@cursinhopro.com.br");
      setPassword("prof123");
      setError(null);
    } else if (
      roleParam === "pai" ||
      roleParam === "responsavel" ||
      roleParam === "guardian" ||
      roleParam === "familia"
    ) {
      setEmail("responsavel@cursinhopro.com.br");
      setPassword("pai123");
      setError(null);
    }
  }, [roleParam]);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (res?.error) {
        setError("Usuário ou senha incorretos. Verifique suas credenciais.");
      } else {
        if (
          email.includes("pai") ||
          email.includes("responsavel") ||
          email.includes("mae")
        ) {
          window.location.href = "/portal-do-responsavel";
        } else {
          window.location.href = "/dashboard";
        }
      }
    } catch (err: any) {
      setError("Erro ao autenticar. Verifique sua conexão com o servidor.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-white flex flex-col lg:flex-row items-stretch select-none">
      {/* ============================================================== */}
      {/* COLUNA ESQUERDA: Form de Autenticação edu.finance             */}
      {/* ============================================================== */}
      <div className="w-full lg:w-[46%] xl:w-[42%] flex flex-col justify-between px-8 sm:px-14 lg:px-16 xl:px-20 py-8 lg:py-12 bg-white z-10">
        <div>
          {/* Logo Brand Header Edu.Finance */}
          <div className="pt-2">
            <EduFinanceLogo size="lg" variant="full" />
          </div>

          {/* Saudação e Boas-vindas */}
          <div className="mt-10 sm:mt-12 mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-[#07132c] tracking-tight">
              Olá,
            </h2>
            <h3 className="text-2xl sm:text-3xl font-bold text-[#07132c] tracking-tight mt-0.5">
              Bom ter você de volta
            </h3>
            <p className="text-sm text-slate-500 mt-2">
              Acesse sua conta para gerenciar matrículas e o financeiro escolar.
            </p>
          </div>

          {/* Feedback de Erro */}
          {error && (
            <div className="mb-5 p-3.5 rounded-xl bg-rose-50/80 border border-rose-200 text-rose-700 text-xs flex items-center gap-2.5 shadow-sm">
              <AlertCircle className="h-4 w-4 flex-shrink-0 text-rose-500" />
              <span className="font-medium">{error}</span>
            </div>
          )}

          {/* Formulário de Login */}
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label
                htmlFor="username"
                className="block text-xs font-semibold text-slate-700 mb-1.5"
              >
                Usuário / E-mail:
              </label>
              <input
                id="username"
                type="text"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@edufinance.com.br"
                className="w-full px-4 py-3 bg-white border border-slate-200 hover:border-slate-300 focus:border-[#0052ff] focus:ring-4 focus:ring-[#0052ff]/10 rounded-xl text-slate-900 text-sm font-medium outline-none transition-all shadow-sm"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label
                  htmlFor="password"
                  className="block text-xs font-semibold text-slate-700"
                >
                  Senha de Acesso:
                </label>
              </div>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••••••"
                  className="w-full pl-4 pr-11 py-3 bg-white border border-slate-200 hover:border-slate-300 focus:border-[#0052ff] focus:ring-4 focus:ring-[#0052ff]/10 rounded-xl text-slate-900 text-sm font-medium outline-none transition-all shadow-sm"
                />
                <button
                  type="button"
                  tabIndex={-1}
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none p-1 cursor-pointer"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-3 py-3.5 px-4 rounded-xl bg-[#0052ff] hover:bg-[#0042db] active:bg-[#0037b8] text-white font-bold text-sm tracking-wide shadow-sm hover:shadow-md hover:-translate-y-0.5 active:translate-y-0 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-75 disabled:pointer-events-none"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Validando Acesso...</span>
                </>
              ) : (
                <span>Entrar no Sistema</span>
              )}
            </button>

            {/* Seleção Rápida de Perfis de Demonstração (Admin, Secretaria, Professor) */}
            <div className="pt-2">
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/90 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Perfis de Demonstração:
                  </span>
                  <span className="text-[10px] text-slate-400 font-medium">
                    Clique para alternar
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  {DEMO_PROFILES.map((profile) => {
                    const isSelected = email === profile.email;
                    const Icon = profile.icon;
                    return (
                      <button
                        key={profile.role}
                        type="button"
                        onClick={() => {
                          setEmail(profile.email);
                          setPassword(profile.password);
                          setError(null);
                        }}
                        className={`p-2 rounded-lg border text-left transition-all cursor-pointer flex flex-col justify-between min-h-[58px] ${
                          isSelected
                            ? "bg-blue-50/90 border-[#0052ff] ring-1 ring-[#0052ff] shadow-xs"
                            : "bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/80"
                        }`}
                      >
                        <div className="flex items-center justify-between w-full">
                          <span
                            className={`text-[11px] font-bold leading-tight ${
                              isSelected ? "text-[#0052ff]" : "text-slate-800"
                            }`}
                          >
                            {profile.title}
                          </span>
                          <Icon
                            className={`h-3.5 w-3.5 flex-shrink-0 ${
                              isSelected ? "text-[#0052ff]" : "text-slate-400"
                            }`}
                          />
                        </div>
                        <span className="text-[9.5px] text-slate-500 font-medium truncate mt-1">
                          {profile.badge}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </form>
        </div>

        {/* Rodapé institucional com links de navegação */}
        <div className="pt-10 lg:pt-14 mt-8 border-t border-slate-100 flex flex-wrap items-center gap-x-4 gap-y-2 text-[11px] text-slate-400 font-normal">
          <span className="hover:text-slate-600 cursor-pointer">Roadmap</span>
          <span className="hover:text-slate-600 cursor-pointer">Documentação</span>
          <span className="hover:text-slate-600 cursor-pointer">Suporte</span>
          <span className="hover:text-slate-600 cursor-pointer">Termos de Uso</span>
          <span className="hover:text-slate-600 cursor-pointer">Aviso de Privacidade</span>
        </div>
      </div>

      {/* ============================================================== */}
      {/* COLUNA DIREITA: Ilustração Vetorial Profissional e Moderna     */}
      {/* ============================================================== */}
      <div className="hidden lg:flex flex-1 items-center justify-center p-8 xl:p-14 relative bg-gradient-to-br from-[#ffffff] via-[#f7faff] to-[#edf4ff] overflow-hidden border-l border-slate-100/70">
        {/* Glow e manchas de luz de fundo */}
        <div className="absolute w-[500px] h-[500px] rounded-full bg-blue-100/60 blur-3xl pointer-events-none -top-10 -right-10" />
        <div className="absolute w-[400px] h-[400px] rounded-full bg-cyan-100/40 blur-2xl pointer-events-none bottom-10 left-10" />

        {/* Elementos Vetoriais Abstratos (Cruzes e Pontos) */}
        <div className="absolute top-24 left-16 text-slate-300 text-xl font-light select-none">
          +
        </div>
        <div className="absolute top-1/2 left-8 text-cyan-400/60 text-lg font-light select-none">
          +
        </div>
        <div className="absolute top-16 right-20 text-slate-200 text-2xl font-light select-none">
          +
        </div>
        <div className="absolute bottom-28 left-20 w-3 h-3 rounded-full bg-cyan-300/40" />
        <div className="absolute top-36 right-14 w-2 h-2 rounded-full bg-blue-400/40" />

        {/* Ilustração Principal da Plataforma em Alta Resolução */}
        <div className="relative w-full max-w-[620px] aspect-[4/3] flex items-center justify-center">
          <svg
            viewBox="0 0 800 600"
            className="w-full h-full drop-shadow-sm"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              {/* Gradientes da Ilustração */}
              <linearGradient id="cardGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#ffffff" stopOpacity="0.95" />
                <stop offset="100%" stopColor="#f3f8fe" stopOpacity="0.9" />
              </linearGradient>

              <linearGradient id="barGrad" x1="0" y1="1" x2="0" y2="0">
                <stop offset="0%" stopColor="#0040e5" />
                <stop offset="100%" stopColor="#00d5ff" />
              </linearGradient>

              <linearGradient id="chairGrad" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#ffffff" />
                <stop offset="100%" stopColor="#e5effa" />
              </linearGradient>

              <linearGradient id="hairGrad" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#1e1b4b" />
                <stop offset="100%" stopColor="#3730a3" />
              </linearGradient>

              <linearGradient id="pantsGrad" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#002eff" />
                <stop offset="100%" stopColor="#0055ff" />
              </linearGradient>

              <filter id="softShadow" x="-10%" y="-10%" width="130%" height="130%">
                <feDropShadow
                  dx="0"
                  dy="12"
                  stdDeviation="14"
                  floodColor="#003db3"
                  floodOpacity="0.08"
                />
              </filter>
            </defs>

            {/* Sombra Suave no Piso */}
            <ellipse
              cx="520"
              cy="535"
              rx="180"
              ry="26"
              fill="#cbe0f8"
              opacity="0.45"
            />
            <ellipse
              cx="540"
              cy="530"
              rx="120"
              ry="16"
              fill="#b2d4f8"
              opacity="0.35"
            />

            {/* ======================================================== */}
            {/* 1. PAINEL DE CONTROLE / DASHBOARD FINANCEIRO FLUTUANTE    */}
            {/* ======================================================== */}
            <g filter="url(#softShadow)">
              {/* Janela Principal do Dashboard */}
              <rect
                x="140"
                y="110"
                width="380"
                height="240"
                rx="14"
                fill="url(#cardGrad)"
                stroke="#c9def7"
                strokeWidth="2.5"
              />

              {/* Barra de Título da Janela */}
              <path
                d="M140 124 C140 116 146 110 154 110 H506 C514 110 520 116 520 124 V138 H140 V124 Z"
                fill="#eaf2fc"
              />
              <circle cx="160" cy="124" r="4" fill="#0055ff" />
              <circle cx="174" cy="124" r="4" fill="#60a5fa" />
              <circle cx="188" cy="124" r="4" fill="#93c5fd" />

              {/* Barra de Pesquisa/Filtro Simulada */}
              <rect
                x="220"
                y="118"
                width="140"
                height="12"
                rx="6"
                fill="#ffffff"
                stroke="#d3e3f8"
                strokeWidth="1.5"
              />

              {/* Gráfico de Colunas / Barras Financeiras */}
              <g transform="translate(165, 170)">
                {/* Linhas de grade sutis */}
                <line x1="0" y1="130" x2="160" y2="130" stroke="#dbe7f6" strokeWidth="1.5" />
                <line x1="0" y1="90" x2="160" y2="90" stroke="#e8f0fa" strokeWidth="1" strokeDasharray="3 3" />
                <line x1="0" y1="50" x2="160" y2="50" stroke="#e8f0fa" strokeWidth="1" strokeDasharray="3 3" />

                {/* Colunas financeiras */}
                <rect x="10" y="70" width="14" height="60" rx="3" fill="#cfe2fc" />
                <rect x="32" y="45" width="14" height="85" rx="3" fill="#9ec5fa" />
                <rect x="54" y="30" width="14" height="100" rx="3" fill="#6ba7f7" />
                <rect x="76" y="15" width="14" height="115" rx="3" fill="url(#barGrad)" />
                <rect x="98" y="40" width="14" height="90" rx="3" fill="#6ba7f7" />
                <rect x="120" y="25" width="14" height="105" rx="3" fill="url(#barGrad)" />
                <rect x="142" y="55" width="14" height="75" rx="3" fill="#9ec5fa" />
              </g>

              {/* Gráfico de Rosca / Donut de Indicadores Financeiros */}
              <g transform="translate(420, 215)">
                {/* Segmento 1 - Azul Elétrico Principal */}
                <circle
                  cx="0"
                  cy="0"
                  r="34"
                  stroke="#0055ff"
                  strokeWidth="16"
                  strokeDasharray="140 220"
                  strokeDashoffset="-20"
                  fill="none"
                />
                {/* Segmento 2 - Ciano Brilhante */}
                <circle
                  cx="0"
                  cy="0"
                  r="34"
                  stroke="#00d5ff"
                  strokeWidth="16"
                  strokeDasharray="50 220"
                  strokeDashoffset="125"
                  fill="none"
                />
                {/* Segmento 3 - Azul Claro */}
                <circle
                  cx="0"
                  cy="0"
                  r="34"
                  stroke="#9ec5fa"
                  strokeWidth="16"
                  strokeDasharray="25 220"
                  strokeDashoffset="70"
                  fill="none"
                />
              </g>

              {/* Cartão de Resumo Pequeno */}
              <rect
                x="355"
                y="275"
                width="135"
                height="45"
                rx="8"
                fill="#ffffff"
                stroke="#dbe8f8"
                strokeWidth="1.5"
              />
              <rect x="370" y="287" width="50" height="7" rx="3.5" fill="#0055ff" />
              <rect x="370" y="300" width="75" height="5" rx="2.5" fill="#b0cff7" />
              <circle cx="465" cy="298" r="8" fill="#e0f0ff" />
              <path d="M461 298 L464 301 L470 295" stroke="#0055ff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </g>

            {/* ======================================================== */}
            {/* 2. CADEIRA ERGONÔMICA TIPO 'EGG POD' MODERNA            */}
            {/* ======================================================== */}
            {/* Haste e Base Metálica da Cadeira */}
            <path
              d="M560 410 L540 515"
              stroke="#cbdff6"
              strokeWidth="10"
              strokeLinecap="round"
            />
            <path
              d="M480 522 C530 510 590 512 630 525"
              stroke="#cbdff6"
              strokeWidth="8"
              strokeLinecap="round"
            />

            {/* Concha da Cadeira */}
            <path
              d="M460 270 C430 340 440 430 495 465 C545 495 615 480 645 425 C670 375 660 305 610 270 C550 225 485 225 460 270 Z"
              fill="url(#chairGrad)"
              stroke="#cadff5"
              strokeWidth="4"
              filter="url(#softShadow)"
            />
            <ellipse
              cx="550"
              cy="390"
              rx="75"
              ry="55"
              fill="#dbe9f8"
              opacity="0.6"
            />

            {/* ======================================================== */}
            {/* 3. PERSONAGEM / ANALISTA (Profissional edu.finance)       */}
            {/* ======================================================== */}
            {/* Cabeça e Cabelo Estilizado */}
            <ellipse cx="585" cy="188" rx="20" ry="24" fill="#1b2559" />

            {/* Penteado Moderno Azul Índigo */}
            <path
              d="M565 185 C550 160 565 125 605 130 C625 132 645 150 640 172 C635 180 620 185 615 175 C605 160 585 165 578 180 Z"
              fill="url(#hairGrad)"
            />

            {/* Pescoço */}
            <rect x="578" y="206" width="16" height="20" rx="4" fill="#253575" />

            {/* Tronco / Camiseta Branca Limpa */}
            <path
              d="M550 230 C565 224 610 224 635 238 C645 275 640 330 630 350 H555 C540 320 540 265 550 230 Z"
              fill="#ffffff"
              stroke="#d3e2f5"
              strokeWidth="2"
            />

            {/* Braço Direito apoiado no teclado */}
            <path
              d="M555 245 C540 270 535 305 570 325 L615 328"
              stroke="#ffffff"
              strokeWidth="20"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M555 245 C540 270 535 305 570 325 L615 328"
              stroke="#e2ecf8"
              strokeWidth="4"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />

            {/* Braço Esquerdo digitando */}
            <path
              d="M625 245 C640 280 645 320 620 335 L585 338"
              stroke="#253575"
              strokeWidth="16"
              strokeLinecap="round"
            />

            {/* Laptop Aberto Moderno */}
            {/* Tela */}
            <polygon
              points="480,285 545,305 555,380 490,360"
              fill="#111827"
              stroke="#374151"
              strokeWidth="1.5"
            />
            <polygon
              points="485,290 540,307 550,370 495,353"
              fill="#002b80"
              opacity="0.85"
            />
            {/* Brilho da Tela */}
            <line x1="500" y1="315" x2="535" y2="326" stroke="#00d5ff" strokeWidth="2" strokeLinecap="round" />
            <line x1="504" y1="330" x2="528" y2="338" stroke="#60a5fa" strokeWidth="2" strokeLinecap="round" />

            {/* Teclado da Base do Laptop */}
            <polygon
              points="490,360 555,380 610,365 545,348"
              fill="#1f2937"
            />

            {/* Pernas Cruzadas com Calça Azul Real (#0044ff) */}
            {/* Perna de Apoio (Inferior esquerda) */}
            <path
              d="M555 350 C540 400 500 440 480 475 C470 495 485 540 505 560"
              stroke="url(#pantsGrad)"
              strokeWidth="38"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* Perna Cruzada (Superior direita sobre o joelho) */}
            <path
              d="M590 350 C550 380 485 410 475 440 C465 470 520 515 560 535"
              stroke="url(#pantsGrad)"
              strokeWidth="42"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* Tênis / Calçado Azul e Branco */}
            {/* Pé Superior */}
            <path
              d="M495 555 C480 558 450 560 445 572 C440 580 460 585 480 585 C510 585 525 565 515 555 Z"
              fill="#ffffff"
              stroke="#cadcf5"
              strokeWidth="2"
            />
            <path
              d="M485 558 C470 562 455 566 450 575 H495 Z"
              fill="#0044ff"
            />

            {/* Pé Inferior */}
            <path
              d="M555 530 C565 545 580 555 605 560 C615 562 615 572 595 575 C565 575 540 555 535 538 Z"
              fill="#ffffff"
              stroke="#cadcf5"
              strokeWidth="2"
            />
            <path
              d="M560 536 C570 546 585 552 600 558 L575 565 Z"
              fill="#0044ff"
            />
          </svg>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-white flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-[#0052ff]" />
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
