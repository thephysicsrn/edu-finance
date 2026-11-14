"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import {
  LayoutDashboard,
  UserPlus,
  Users,
  BookOpen,
  CalendarCheck,
  Receipt,
  AlertTriangle,
  TrendingUp,
  LogOut,
  X,
  ShieldCheck,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { EduFinanceLogo } from "@/components/shared/logo";

const navigationItems = [
  {
    category: "Visão Geral",
    items: [
      { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    ],
  },
  {
    category: "Módulo Acadêmico",
    items: [
      { name: "Nova Matrícula", href: "/academic/enrollments/new", icon: UserPlus },
      { name: "Alunos & Cadastros", href: "/academic/students", icon: Users },
      { name: "Cursos e Turmas", href: "/academic/classes", icon: BookOpen },
      { name: "Diário de Frequência", href: "/academic/attendance", icon: CalendarCheck },
    ],
  },
  {
    category: "Módulo Financeiro",
    items: [
      { name: "Mensalidades & Baixas", href: "/financial/invoices", icon: Receipt },
      { name: "Inadimplência", href: "/financial/defaulters", icon: AlertTriangle },
      { name: "Relatório de Fluxo", href: "/financial/cashflow", icon: TrendingUp },
    ],
  },
];

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
  user?: {
    name?: string | null;
    email?: string | null;
    role?: string;
  };
}

export function Sidebar({ isOpen = false, onClose, user }: SidebarProps) {
  const pathname = usePathname();

  const role = user?.role || "ADMIN";

  const initials = user?.name
    ? user.name
        .split(" ")
        .filter(Boolean)
        .map((n) => n[0])
        .slice(0, 2)
        .join("")
        .toUpperCase()
    : role === "TEACHER"
    ? "PF"
    : role === "SECRETARY"
    ? "SC"
    : role === "GUARDIAN"
    ? "RP"
    : "AD";

  const displayName =
    user?.name ||
    (role === "TEACHER"
      ? "Prof. Carlos Eduardo"
      : role === "SECRETARY"
      ? "Secretaria de Atendimento"
      : role === "GUARDIAN"
      ? "Mariana Alencar Silveira"
      : "Coordenador Geral");

  const displayRoleLabel =
    role === "TEACHER"
      ? "PROFESSOR"
      : role === "SECRETARY"
      ? "SECRETARIA"
      : role === "GUARDIAN"
      ? "RESPONSÁVEL LEGAL"
      : "ADMIN";

  // Se for Responsável Legal (GUARDIAN), exibe apenas o menu do pai
  const filteredNavGroups =
    role === "GUARDIAN"
      ? [
          {
            category: "Portal da Família",
            items: [
              {
                name: "Mensalidades do Filho",
                href: "/portal-do-responsavel",
                icon: ShieldCheck,
              },
            ],
          },
        ]
      : [
          {
            category: role === "TEACHER" ? "Painel Docente" : "Visão Geral",
            items: [
              {
                name:
                  role === "TEACHER"
                    ? "Painel Pedagógico"
                    : role === "SECRETARY"
                    ? "Painel da Secretaria"
                    : "Dashboard Executivo",
                href: "/dashboard",
                icon: LayoutDashboard,
              },
              ...(role !== "TEACHER"
                ? [
                    {
                      name: "Portal do Responsável",
                      href: "/portal-do-responsavel",
                      icon: ShieldCheck,
                    },
                  ]
                : []),
            ],
          },
          {
            category: "Módulo Acadêmico",
            items: [
              ...(role !== "TEACHER"
                ? [{ name: "Nova Matrícula", href: "/academic/enrollments/new", icon: UserPlus }]
                : []),
              { name: "Alunos & Cadastros", href: "/academic/students", icon: Users },
              { name: "Cursos e Turmas", href: "/academic/classes", icon: BookOpen },
              { name: "Diário de Frequência", href: "/academic/attendance", icon: CalendarCheck },
            ],
          },
          // Professores NÃO possuem acesso a dados financeiros
          ...(role !== "TEACHER"
            ? [
                {
                  category: "Módulo Financeiro",
                  items: [
                    { name: "Mensalidades & Baixas", href: "/financial/invoices", icon: Receipt },
                    { name: "Inadimplência", href: "/financial/defaulters", icon: AlertTriangle },
                    ...(role === "ADMIN"
                      ? [{ name: "Relatório de Fluxo", href: "/financial/cashflow", icon: TrendingUp }]
                      : []),
                  ],
                },
              ]
            : []),
        ];

  async function handleSignOut() {
    try {
      await signOut({ redirect: false });
    } catch (err) {
      console.warn("SignOut error:", err);
    }
    window.location.href = "/login";
  }

  return (
    <>
      {/* Backdrop para Telas Mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-40 lg:hidden transition-opacity"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Menu Lateral Responsivo */}
      <aside
        className={cn(
          "w-64 border-r border-slate-200 bg-white flex flex-col h-screen fixed left-0 top-0 z-50 transition-transform duration-200 ease-in-out lg:translate-x-0 lg:z-30",
          isOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full lg:translate-x-0"
        )}
      >
        {/* Brand Header com Botão de Fechar no Mobile */}
        <div className="h-16 flex items-center justify-between px-5 border-b border-slate-100">
          <EduFinanceLogo variant="compact" />
          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar menu lateral"
            className="p-2 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 lg:hidden cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Links de Navegação Filtrados pelo Perfil */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-6">
          {filteredNavGroups.map((group) => (
            <div key={group.category}>
              <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider px-3 mb-2">
                {group.category}
              </p>
              <nav className="space-y-1">
                {group.items.map((item) => {
                  const isActive = pathname === item.href;
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={onClose}
                      className={cn(
                        "flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-all",
                        isActive
                          ? "bg-blue-50/80 text-[#0052ff] font-semibold shadow-xs"
                          : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                      )}
                    >
                      <Icon className={cn("h-4 w-4", isActive ? "text-[#0052ff]" : "text-slate-400")} />
                      <span>{item.name}</span>
                    </Link>
                  );
                })}
              </nav>
            </div>
          ))}
        </div>

        {/* Rodapé do Perfil Dinâmico / Botão de Logout */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 min-w-0">
              <div className="h-8 w-8 rounded-full bg-blue-100 text-[#0052ff] font-bold flex items-center justify-center text-xs flex-shrink-0">
                {initials}
              </div>
              <div className="truncate">
                <p className="text-xs font-semibold text-slate-900 truncate" title={displayName}>
                  {displayName}
                </p>
                <p className="text-[10px] text-[#0052ff] font-bold tracking-wider">
                  {displayRoleLabel}
                </p>
              </div>
            </div>
            <button
              type="button"
              title="Sair da conta"
              aria-label="Sair da conta"
              onClick={handleSignOut}
              className="text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors p-2 rounded-lg cursor-pointer min-h-[36px] min-w-[36px] flex items-center justify-center flex-shrink-0"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
