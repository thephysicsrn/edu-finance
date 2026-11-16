"use client";

import React from "react";

interface BarcodeSvgProps {
  value: string;
  className?: string;
  height?: number;
}

/**
 * Renderiza um código de barras visual em SVG estilizado para boletos e carnês bancários.
 */
export function BarcodeSvg({ value, className = "", height = 48 }: BarcodeSvgProps) {
  // Gera uma sequência determinística de barras largas e finas baseada no valor
  const clean = (value || "23793381286000012345601000654321195000000116000").replace(/\D/g, "");
  
  // Padrão de barras para o código de barras
  const bars: Array<{ width: number; isBlack: boolean }> = [];
  
  // Barras de início (guard bars)
  bars.push({ width: 2, isBlack: true });
  bars.push({ width: 1, isBlack: false });
  bars.push({ width: 2, isBlack: true });
  bars.push({ width: 1, isBlack: false });

  for (let i = 0; i < clean.length; i++) {
    const digit = parseInt(clean[i], 10);
    // Cada dígito gera 4 barras alternadas
    const w1 = (digit % 3) + 1.2;
    const w2 = ((digit + 1) % 2) + 1;
    const w3 = ((digit + 2) % 3) + 1.1;
    const w4 = (digit % 2) + 1;

    bars.push({ width: w1, isBlack: true });
    bars.push({ width: w2, isBlack: false });
    bars.push({ width: w3, isBlack: true });
    bars.push({ width: w4, isBlack: false });
  }

  // Barras de término
  bars.push({ width: 2, isBlack: true });
  bars.push({ width: 1, isBlack: false });
  bars.push({ width: 2, isBlack: true });

  const totalWidth = bars.reduce((acc, b) => acc + b.width, 0);

  let currentX = 0;

  return (
    <div className={`flex flex-col items-center ${className}`}>
      <svg
        viewBox={`0 0 ${totalWidth} ${height}`}
        className="w-full h-auto max-h-12"
        preserveAspectRatio="none"
      >
        {bars.map((bar, idx) => {
          const x = currentX;
          currentX += bar.width;
          if (!bar.isBlack) return null;
          return (
            <rect
              key={idx}
              x={x}
              y={0}
              width={bar.width}
              height={height}
              fill="#000000"
            />
          );
        })}
      </svg>
      <span className="font-mono text-[10px] tracking-widest text-slate-700 mt-0.5 select-all">
        {value}
      </span>
    </div>
  );
}
