"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Phone,
  Clock,
  User,
  Menu,
  X,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";
import { EduFinanceLogo } from "@/components/shared/logo";
import { Button } from "@/components/ui/button";

interface LandingHeaderProps {
  user?: {
    name?: string | null;
    email?: string | null;
    role?: string;
  } | null;
}

export function LandingHeader({ user }: LandingHeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { name: "Início", href: "#inicio" },
    { name: "Sobre Nós", href: "#sobre" },
    { name: "Módulos & Recursos", href: "#modulos" },
    { name: "Cobrança Asaas", href: "#asaas" },
    { name: "Fale Conosco", href: "#contato" },
  ];

  const destinationHref = user ? "/dashboard" : "/login";

  return (
    <header className="w-full select-none">
      {/* ============================================================== */}
      {/* 1. BARRA SUPERIOR (UTILITY BAR) - FIEL À REFERÊNCIA            */}
      {/* ============================================================== */}
      <div className="bg-[#07132c] text-slate-200 text-xs py-2.5 px-4 sm:px-6 lg:px-8 border-b border-white/10">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Informações de Contato e Horário */}
          <div className="flex items-center gap-4 sm:gap-8">
            <a
              href="tel:5584981220173"
              className="flex items-center gap-2 text-slate-200 hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white rounded-xs"
            >
              <Phone className="h-3.5 w-3.5 text-[#00c878]" />
              <span className="font-medium">
                Fale Conosco: <strong className="text-white font-semibold">(84) 98122-0173</strong>
              </span>
            </a>

            <div className="hidden md:flex items-center gap-2 text-slate-300">
              <Clock className="h-3.5 w-3.5 text-blue-400" />
              <span>Atendimento: Seg a Sex das 08:00 às 19:00</span>
            </div>
          </div>

          {/* BOTÃO EM DESTAQUE: ÁREA DO CLIENTE */}
          <div className="flex items-center gap-3">
            {user ? (
              <Link
                href="/dashboard"
                className="flex items-center gap-2 bg-[#0052ff] hover:bg-[#0041cc] active:bg-[#0037b3] text-white font-semibold text-xs px-3.5 py-1.5 rounded-md transition-all shadow-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
              >
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-300" />
                <span>Acessar Painel ({user.role})</span>
              </Link>
            ) : (
              <Link
                href="/login"
                className="flex items-center gap-2 bg-white/10 hover:bg-white hover:text-[#07132c] active:bg-slate-100 text-white border border-white/25 font-semibold text-xs px-4 py-1.5 rounded-md transition-all duration-150 shadow-xs group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
                id="area-do-cliente-btn"
              >
                <div className="h-4 w-4 rounded-full bg-white/20 group-hover:bg-[#07132c]/10 flex items-center justify-center">
                  <User className="h-3 w-3" />
                </div>
                <span>Área do Cliente</span>
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* ============================================================== */}
      {/* 2. BARRA DE NAVEGAÇÃO PRINCIPAL (STICKY WHITE NAVBAR)          */}
      {/* ============================================================== */}
      <nav className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          {/* Logo Edu.Finance Oficial */}
          <Link href="/" className="flex items-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0052ff] rounded-lg">
            <EduFinanceLogo variant="full" size="md" />
          </Link>

          {/* Links Desktop */}
          <div className="hidden lg:flex items-center gap-6 xl:gap-8">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                className="text-xs font-semibold text-slate-700 hover:text-[#0052ff] transition-colors uppercase tracking-wider px-2 py-1 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0052ff]"
              >
                {link.name}
              </a>
            ))}
          </div>

          {/* Botão CTA Principal */}
          <div className="hidden sm:flex items-center gap-3">
            <Link href={destinationHref}>
              <Button className="bg-[#0052ff] hover:bg-[#0041cc] active:bg-[#0037b3] text-white font-semibold shadow-sm rounded-lg px-5 gap-2 h-10 text-xs uppercase tracking-wider focus-visible:ring-2 focus-visible:ring-[#0052ff] focus-visible:ring-offset-2">
                <span>{user ? "Ir para o Painel" : "Acessar Sistema"}</span>
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>

          {/* Mobile Hamburger Toggle */}
          <div className="lg:hidden flex items-center">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2.5 rounded-lg text-slate-700 hover:bg-slate-100 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0052ff]"
              aria-label="Alternar Menu de Navegação"
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Menu Dropdown Mobile com Backdrop */}
        {mobileMenuOpen && (
          <>
            <div
              className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-30 lg:hidden"
              onClick={() => setMobileMenuOpen(false)}
              aria-hidden="true"
            />
            <div className="relative z-40 lg:hidden bg-white border-b border-slate-200 px-4 pt-3 pb-6 space-y-3 shadow-2xl">
              <div className="space-y-1">
                {navLinks.map((link) => (
                  <a
                    key={link.name}
                    href={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-3 py-2.5 rounded-lg text-sm font-medium text-slate-800 hover:bg-slate-100 hover:text-[#0052ff] transition-colors"
                  >
                    {link.name}
                  </a>
                ))}
              </div>

              <div className="pt-3 border-t border-slate-100 space-y-2">
                <Link href={destinationHref} onClick={() => setMobileMenuOpen(false)} className="block">
                  <Button className="w-full bg-[#0052ff] hover:bg-[#0041cc] text-white font-semibold justify-center gap-2 h-11 text-xs uppercase tracking-wider">
                    <User className="h-4 w-4" />
                    <span>Área do Cliente & Login</span>
                  </Button>
                </Link>
              </div>
            </div>
          </>
        )}
      </nav>
    </header>
  );
}
