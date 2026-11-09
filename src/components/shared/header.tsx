"use client";

import { Bell, Search, Menu } from "lucide-react";
import { Input } from "@/components/ui/input";

interface HeaderProps {
  onOpenSidebar?: () => void;
}

export function Header({ onOpenSidebar }: HeaderProps) {
  return (
    <header className="h-16 border-b border-slate-200 bg-white/90 backdrop-blur-sm fixed top-0 right-0 left-0 lg:left-64 z-20 px-4 sm:px-6 lg:px-8 flex items-center justify-between">
      <div className="flex items-center gap-3">
        {/* Botão de Menu Hambúrguer para Mobile */}
        <button
          type="button"
          onClick={onOpenSidebar}
          aria-label="Abrir menu lateral"
          className="lg:hidden p-2.5 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer min-h-[44px] min-w-[44px] flex items-center justify-center -ml-1"
        >
          <Menu className="h-5 w-5" />
        </button>

        {/* Campo de Busca Rápida */}
        <div className="w-56 sm:w-80 md:w-96 relative">
          <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <Input
            aria-label="Buscar aluno por nome, CPF ou matrícula"
            placeholder="Buscar aluno por nome, CPF..."
            className="pl-9 h-9 bg-slate-50 border-slate-200 text-sm focus:bg-white focus:border-[#0052ff] rounded-lg"
          />
        </div>
      </div>

      <div className="flex items-center gap-3 sm:gap-4">
        {/* Botão de Notificações com Target Mínimo de 44px */}
        <button
          type="button"
          aria-label="Notificações do sistema"
          className="relative p-2.5 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center cursor-pointer"
        >
          <Bell className="h-5 w-5" />
          <span className="absolute top-2.5 right-2.5 h-2 w-2 rounded-full bg-rose-500 ring-2 ring-white" />
        </button>

        <div className="h-4 w-px bg-slate-200 hidden sm:block" />

        <div className="text-right hidden sm:block">
          <p className="text-xs font-semibold text-slate-900">Ano Letivo 2026</p>
          <p className="text-[10px] text-emerald-600 font-semibold">● Período Regular Ativo</p>
        </div>
      </div>
    </header>
  );
}
