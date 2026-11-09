"use client";

import { useEffect, useRef } from "react";

export function HeroInteractiveMesh() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    let animationFrameId: number;
    let isVisible = true;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    // Mouse com interpolação suave (Lerp)
    const mouse = {
      x: width * 0.5,
      y: height * 0.4,
      targetX: width * 0.5,
      targetY: height * 0.4,
    };

    // Partículas financeiras sutis (luces pontuais)
    const particles: Array<{
      x: number;
      y: number;
      vx: number;
      vy: number;
      radius: number;
      alpha: number;
      baseAlpha: number;
      color: string;
    }> = [];

    const colors = ["#0052ff", "#00c878", "#38bdf8", "#818cf8"];

    for (let i = 0; i < 45; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        radius: Math.random() * 2 + 0.8,
        alpha: Math.random() * 0.6 + 0.2,
        baseAlpha: Math.random() * 0.5 + 0.2,
        color: colors[Math.floor(Math.random() * colors.length)],
      });
    }

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouse.targetX = e.clientX - rect.left;
      mouse.targetY = e.clientY - rect.top;
    };

    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = canvas.parentElement?.offsetHeight || window.innerHeight;
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    window.addEventListener("resize", handleResize);

    // IntersectionObserver para desligar render quando fora da viewport (0% CPU de fundo)
    const observer = new IntersectionObserver(
      (entries) => {
        isVisible = entries[0]?.isIntersecting ?? true;
      },
      { threshold: 0.05 }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    let time = 0;

    const render = () => {
      if (isVisible) {
        time += 0.015;

        // Suavização do movimento do mouse (Lerp)
        mouse.x += (mouse.targetX - mouse.x) * 0.06;
        mouse.y += (mouse.targetY - mouse.y) * 0.06;

        ctx.clearRect(0, 0, width, height);

        // 1. Feixe de Luz Primário no cursor (Royal Blue Fintech Glow)
        const primaryGlow = ctx.createRadialGradient(
          mouse.x,
          mouse.y,
          0,
          mouse.x,
          mouse.y,
          Math.min(width, height) * 0.55
        );
        primaryGlow.addColorStop(0, "rgba(0, 82, 255, 0.18)");
        primaryGlow.addColorStop(0.4, "rgba(0, 82, 255, 0.06)");
        primaryGlow.addColorStop(1, "rgba(0, 82, 255, 0)");

        ctx.fillStyle = primaryGlow;
        ctx.fillRect(0, 0, width, height);

        // 2. Luz Secundária de Contraste (Emerald PIX Glow orbital)
        const orbX = width * 0.75 + Math.cos(time * 0.5) * 80;
        const orbY = height * 0.35 + Math.sin(time * 0.7) * 50;

        const secondaryGlow = ctx.createRadialGradient(orbX, orbY, 0, orbX, orbY, 380);
        secondaryGlow.addColorStop(0, "rgba(0, 200, 120, 0.12)");
        secondaryGlow.addColorStop(0.5, "rgba(0, 200, 120, 0.03)");
        secondaryGlow.addColorStop(1, "rgba(0, 200, 120, 0)");

        ctx.fillStyle = secondaryGlow;
        ctx.fillRect(0, 0, width, height);

        // 3. Partículas flutuantes com conexões sutis
        for (let i = 0; i < particles.length; i++) {
          const p = particles[i];

          p.x += p.vx;
          p.y += p.vy;

          if (p.x < 0) p.x = width;
          if (p.x > width) p.x = 0;
          if (p.y < 0) p.y = height;
          if (p.y > height) p.y = 0;

          // Variação de pulso
          p.alpha = p.baseAlpha + Math.sin(time * 2 + i) * 0.15;

          ctx.beginPath();
          ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
          ctx.fillStyle = p.color;
          ctx.globalAlpha = Math.max(0.05, p.alpha);
          ctx.fill();

          // Conexão sutil com o cursor se estiver próximo
          const dx = mouse.x - p.x;
          const dy = mouse.y - p.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 130) {
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(mouse.x, mouse.y);
            ctx.strokeStyle = p.color;
            ctx.globalAlpha = (1 - dist / 130) * 0.2;
            ctx.lineWidth = 0.8;
            ctx.stroke();
          }
        }

        ctx.globalAlpha = 1;
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("resize", handleResize);
      observer.disconnect();
    };
  }, []);

  return (
    <div ref={containerRef} className="absolute inset-0 pointer-events-none overflow-hidden z-0">
      <canvas ref={canvasRef} className="w-full h-full block opacity-90" />
    </div>
  );
}

