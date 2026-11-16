"use client";

import { useState } from "react";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { TenantConfig } from "@/lib/tenants";
import { EduFinanceIcon } from "@/components/shared/logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Lock,
  Mail,
  ArrowRight,
  Loader2,
  AlertCircle,
  ShieldCheck,
  Building2,
  Receipt,
  UserCheck,
  CheckCircle2,
} from "lucide-react";

interface TenantLoginClientProps {
  tenant: TenantConfig;
}

export function TenantLoginClient({ tenant }: TenantLoginClientProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
        setError("Usuário ou senha incorretos para este cursinho.");
      } else {
        // Redireciona de acordo com o papel
        try {
          const sessionRes = await fetch("/api/auth/session");
          const sessionData = await sessionRes.json();
          if (sessionData?.user?.role === "GUARDIAN") {
            window.location.href = "/portal-do-responsavel";
            return;
          }
        } catch {
          // fallback
        }
        window.location.href = "/dashboard";
      }
    } catch (err: any) {
      setError("Erro ao autenticar. Verifique sua conexão com o servidor.");
    } finally {
      setLoading(false);
    }
  }

  function setFastRole(role: "admin" | "secretaria" | "professor" | "pai") {
    if (role === "admin") {
      setEmail("admin@edufinance.com.br");
      setPassword("admin123");
    } else if (role === "secretaria") {
      setEmail("secretaria@cursinhopro.com.br");
      setPassword("sec123");
    } else if (role === "professor") {
      setEmail("professor@cursinhopro.com.br");
      setPassword("prof123");
    } else if (role === "pai") {
      setEmail("responsavel@cursinhopro.com.br");
      setPassword("pai123");
    }
    setError(null);
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 selection:bg-[#0052ff] selection:text-white">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        {/* Logo Oficial do Cursinho */}
        <Link href={`/${tenant.slug}`} className="inline-flex flex-col items-center group">
          <div className="w-16 h-16 rounded-2xl bg-white border border-slate-200/90 p-2 shadow-sm flex items-center justify-center group-hover:scale-105 transition-transform">
            <img
              src={tenant.logoUrl}
              alt={tenant.name}
              className="w-full h-full object-contain"
            />
          </div>
          <h2 className="mt-4 text-2xl font-black text-[#07132c] tracking-tight">
            {tenant.name}
          </h2>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Área de Acesso Restrito da Instituição
          </p>
        </Link>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4">
        <div className="bg-white py-8 px-6 shadow-xl border border-slate-200/80 rounded-2xl sm:px-10">
          {/* Badge de Ambiente Conectado */}
          <div className="mb-6 p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs">
            <span className="flex items-center gap-1.5 font-bold text-slate-700">
              <Building2 className="h-4 w-4 text-[#0052ff]" />
              Unidade Conectada:
            </span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
              {tenant.slug.toUpperCase()}
            </span>
          </div>

          {error && (
            <div className="mb-5 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
              <AlertCircle className="h-4 w-4 shrink-0 text-rose-500" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                E-mail Institucional
              </label>
              <div className="relative">
                <Mail className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <Input
                  type="email"
                  required
                  placeholder="usuario@instituicao.com.br"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-9 h-11 border-slate-200 focus:border-[#0052ff] rounded-xl text-sm"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Senha
                </label>
                <Link
                  href="/portal-do-responsavel"
                  className="text-xs text-[#0052ff] hover:underline font-semibold"
                >
                  Sou Aluno / Pai
                </Link>
              </div>
              <div className="relative">
                <Lock className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <Input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-9 h-11 border-slate-200 focus:border-[#0052ff] rounded-xl text-sm"
                />
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full h-11 bg-[#0052ff] hover:bg-[#0041cc] text-white font-bold rounded-xl shadow-md gap-2 text-xs uppercase tracking-wider mt-2"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Autenticando...</span>
                </>
              ) : (
                <>
                  <span>Entrar no {tenant.name}</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </Button>
          </form>

          {/* Atalhos Rápidos de Acesso para Demonstração */}
          <div className="mt-6 pt-6 border-t border-slate-100">
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider text-center mb-3">
              Acesso Rápido de Testes (Demonstração)
            </p>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                type="button"
                onClick={() => setFastRole("secretaria")}
                className="p-2 rounded-lg border border-slate-200 hover:border-slate-300 bg-slate-50 hover:bg-slate-100 font-semibold text-slate-700 text-left transition-colors cursor-pointer"
              >
                👩‍💼 Secretaria
              </button>
              <button
                type="button"
                onClick={() => setFastRole("admin")}
                className="p-2 rounded-lg border border-slate-200 hover:border-slate-300 bg-slate-50 hover:bg-slate-100 font-semibold text-slate-700 text-left transition-colors cursor-pointer"
              >
                👑 Coordenação
              </button>
              <button
                type="button"
                onClick={() => setFastRole("professor")}
                className="p-2 rounded-lg border border-slate-200 hover:border-slate-300 bg-slate-50 hover:bg-slate-100 font-semibold text-slate-700 text-left transition-colors cursor-pointer"
              >
                👨‍🏫 Professor
              </button>
              <button
                type="button"
                onClick={() => setFastRole("pai")}
                className="p-2 rounded-lg border border-slate-200 hover:border-slate-300 bg-slate-50 hover:bg-slate-100 font-semibold text-slate-700 text-left transition-colors cursor-pointer"
              >
                👨‍👧 Responsável
              </button>
            </div>
          </div>
        </div>

        {/* Rodapé Powered by Edu.Finance */}
        <div className="mt-8 text-center flex items-center justify-center gap-2 text-xs text-slate-400">
          <EduFinanceIcon className="w-4 h-4" />
          <span>Plataforma de Gestão por <strong>Edu.Finance</strong></span>
        </div>
      </div>
    </div>
  );
}
