import React from "react";
import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  variant?: "full" | "compact" | "horizontal";
  size?: "sm" | "md" | "lg";
}

/**
 * Ícone Oficial Edu.Finance inspirado na identidade visual Edu.Grad:
 * Silhueta azul royal com badge de validação verde (check) e gráficos/cartão financeiro.
 */
export function EduFinanceIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 120 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("w-10 h-10 flex-shrink-0 drop-shadow-sm", className)}
    >
      <defs>
        <linearGradient id="eduFinanceBlue" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#0055ff" />
          <stop offset="100%" stopColor="#003cd6" />
        </linearGradient>
        <linearGradient id="eduFinanceGreen" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#00c878" />
          <stop offset="100%" stopColor="#00a862" />
        </linearGradient>
      </defs>

      {/* Cartão / Dashboard Base com cantos arredondados */}
      <rect
        x="12"
        y="16"
        width="82"
        height="82"
        rx="18"
        stroke="url(#eduFinanceBlue)"
        strokeWidth="10"
        fill="#ffffff"
      />

      {/* Guias superiores do cabeçalho financeiro */}
      <rect x="26" y="10" width="10" height="14" rx="5" fill="#0055ff" />
      <rect x="70" y="10" width="10" height="14" rx="5" fill="#0055ff" />

      {/* Linha divisória horizontal interna */}
      <path
        d="M17 44 H89"
        stroke="#0055ff"
        strokeWidth="6"
        strokeLinecap="round"
      />

      {/* Gráfico de Barras / Indicadores Financeiros em Crescimento */}
      <rect x="28" y="66" width="9" height="18" rx="4" fill="#0055ff" />
      <rect x="44" y="56" width="9" height="28" rx="4" fill="#0055ff" />
      <rect x="60" y="50" width="9" height="34" rx="4" fill="#0055ff" />

      {/* Badge Circular de Aprovação / Check no canto inferior direito */}
      <g filter="drop-shadow(0px 2px 4px rgba(0, 0, 0, 0.12))">
        <circle cx="86" cy="86" r="24" fill="url(#eduFinanceGreen)" />
        <circle cx="86" cy="86" r="23" stroke="#ffffff" strokeWidth="2.5" />
        {/* Ícone de Checkmark em Branco */}
        <path
          d="M77 86 L83 92 L96 79"
          stroke="#ffffff"
          strokeWidth="4.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </g>
    </svg>
  );
}

/**
 * Logotipo Completo Edu.Finance (Ícone + Tipografia + Slogan oficial)
 */
export function EduFinanceLogo({
  className,
  variant = "full",
  size = "md",
}: LogoProps) {
  if (variant === "compact") {
    return (
      <div className={cn("flex items-center gap-2.5", className)}>
        <EduFinanceIcon className="w-8 h-8" />
        <div className="flex flex-col">
          <span className="text-lg font-black tracking-tight text-[#08132b] leading-tight">
            Edu<span className="text-[#0052ff]">.Finance</span>
          </span>
          <span className="text-[9px] font-bold text-slate-400 tracking-wider uppercase -mt-0.5">
            Gestão Financeira
          </span>
        </div>
      </div>
    );
  }

  const isLarge = size === "lg";

  return (
    <div className={cn("flex items-center gap-3.5 select-none", className)}>
      <EduFinanceIcon className={isLarge ? "w-14 h-14" : "w-11 h-11"} />

      <div className="flex flex-col">
        {/* Tipografia Principal da Marca */}
        <div className="flex items-baseline">
          <span
            className={cn(
              "font-black tracking-tight text-[#07132c]",
              isLarge ? "text-3xl sm:text-4xl" : "text-2xl"
            )}
            style={{ fontFamily: "inherit" }}
          >
            Edu<span className="text-[#0052ff]">.Finance</span>
          </span>
        </div>

        {/* Slogan Oficial em 2 linhas (exatamente como na identidade Edu.Grad) */}
        {variant === "full" && (
          <div className="mt-0.5 flex flex-col leading-tight">
            <span
              className={cn(
                "font-bold uppercase tracking-wider text-[#0e1c36]",
                isLarge ? "text-[11px]" : "text-[9.5px]"
              )}
            >
              Inteligência em Gestão Financeira.
            </span>
            <span
              className={cn(
                "font-bold uppercase tracking-wider text-[#0052ff]",
                isLarge ? "text-[11px]" : "text-[9.5px]"
              )}
            >
              Mais Controle Para Educar.
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

