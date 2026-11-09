import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Formata um valor numérico para Real Brasileiro (BRL)
 */
export function formatCurrency(value: number | string): string {
  const numeric = typeof value === "string" ? parseFloat(value) : value;
  if (isNaN(numeric)) return "R$ 0,00";
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(numeric);
}

/**
 * Formata CPF para o padrão 000.000.000-00
 */
export function formatCPF(cpf?: string | null): string {
  if (!cpf) return "-";
  const clean = cpf.replace(/\D/g, "");
  if (clean.length !== 11) return cpf;
  return clean.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
}

/**
 * Formata telefone brasileiro para (00) 00000-0000 ou (00) 0000-0000
 */
export function formatPhone(phone?: string | null): string {
  if (!phone) return "-";
  const clean = phone.replace(/\D/g, "");
  if (clean.length === 11) {
    return clean.replace(/(\d{2})(\d{5})(\d{4})/, "($1) $2-$3");
  }
  if (clean.length === 10) {
    return clean.replace(/(\d{2})(\d{4})(\d{4})/, "($1) $2-$3");
  }
  return phone;
}

/**
 * Formata data no padrão brasileiro DD/MM/AAAA
 */
export function formatDate(dateString?: string | Date | null): string {
  if (!dateString) return "-";
  const date = typeof dateString === "string" ? new Date(dateString) : dateString;
  if (isNaN(date.getTime())) return "-";
  return new Intl.DateTimeFormat("pt-BR", { timeZone: "UTC" }).format(date);
}

