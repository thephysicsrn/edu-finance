import React from "react";
import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  variant?: "full" | "compact" | "horizontal";
  size?: "sm" | "md" | "lg";
}

/**
 * Ícone Oficial Call Cursos Isolados
 */
export function CallLogoIcon({ className }: { className?: string }) {
  return (
    <img
      src="/call-logo.png"
      alt="Call Cursos Isolados"
      className={cn("w-10 h-10 object-contain flex-shrink-0 drop-shadow-xs", className)}
    />
  );
}

export const EduFinanceIcon = CallLogoIcon;

/**
 * Logotipo Completo Call Cursos Isolados (Ícone + Tipografia + Slogan oficial)
 */
export function CallLogo({
  className,
  variant = "full",
  size = "md",
}: LogoProps) {
  const isLarge = size === "lg";

  if (variant === "compact") {
    return (
      <div className={cn("flex items-center gap-2.5 select-none", className)}>
        <CallLogoIcon className="w-8 h-8" />
        <div className="flex flex-col">
          <span className="text-base font-black tracking-tight text-[#08132b] leading-tight">
            Call <span className="text-[#0c5195]">Cursos Isolados</span>
          </span>
          <span className="text-[9px] font-bold text-slate-400 tracking-wider uppercase -mt-0.5">
            Gestão Escolar
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("flex items-center gap-3 select-none", className)}>
      <CallLogoIcon className={isLarge ? "w-14 h-14" : "w-11 h-11"} />

      <div className="flex flex-col">
        {/* Tipografia Principal da Marca */}
        <div className="flex items-baseline">
          <span
            className={cn(
              "font-black tracking-tight text-[#07132c]",
              isLarge ? "text-2xl sm:text-3xl" : "text-xl sm:text-2xl"
            )}
          >
            Call <span className="text-[#0c5195]">Cursos Isolados</span>
          </span>
        </div>

        {/* Slogan Oficial */}
        {variant === "full" && (
          <div className="mt-0.5 flex flex-col leading-tight">
            <span
              className={cn(
                "font-bold uppercase tracking-wider text-[#0e1c36]",
                isLarge ? "text-[11px]" : "text-[9.5px]"
              )}
            >
              Educação • Ideias • Pessoas
            </span>
            <span
              className={cn(
                "font-semibold uppercase tracking-wider text-[#0c5195]",
                isLarge ? "text-[10px]" : "text-[9px]"
              )}
            >
              Excelência & Aprovação
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

export const EduFinanceLogo = CallLogo;

