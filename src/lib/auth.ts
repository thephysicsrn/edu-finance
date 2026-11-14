import NextAuth, { type DefaultSession } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: "ADMIN" | "SECRETARY" | "TEACHER" | "GUARDIAN";
    } & DefaultSession["user"];
  }

  interface User {
    role: "ADMIN" | "SECRETARY" | "TEACHER" | "GUARDIAN";
  }
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  trustHost: true,
  secret: process.env.AUTH_SECRET || "f6c8d7e9a1b2c3d4e5f60718293a4b5c6d7e8f90a1b2c3d4e5f6a7b8c9d0e1f2",
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  providers: [
    CredentialsProvider({
      name: "Credenciais de Acesso",
      credentials: {
        email: { label: "E-mail", type: "email" },
        password: { label: "Senha", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const email = String(credentials.email).trim().toLowerCase();
        const password = String(credentials.password).trim();

        // 1. Garantia imediata para perfis de demonstração / testes
        if (
          (email.includes("admin") || email.includes("edufinance")) &&
          (password === "admin123" || password === "admin")
        ) {
          return {
            id: "11111111-1111-1111-1111-111111111111",
            name: "Coordenador Geral (Admin)",
            email: "admin@edufinance.com.br",
            role: "ADMIN" as const,
          };
        }

        if (
          email.includes("secretaria") &&
          (password === "secretaria123" || password === "secretaria")
        ) {
          return {
            id: "22222222-2222-2222-2222-222222222222",
            name: "Secretaria de Atendimento",
            email: "secretaria@cursinhopro.com.br",
            role: "SECRETARY" as const,
          };
        }

        if (
          (email.includes("professor") || email.includes("prof")) &&
          (password === "prof123" || password === "professor123" || password === "professor")
        ) {
          return {
            id: "33333333-3333-3333-3333-333333333333",
            name: "Prof. Carlos Eduardo",
            email: "professor@cursinhopro.com.br",
            role: "TEACHER" as const,
          };
        }

        if (
          (email.includes("pai") || email.includes("responsavel") || email.includes("mae")) &&
          (password === "pai123" || password === "responsavel123" || password === "123456")
        ) {
          return {
            id: "55555555-5555-5555-5555-555555555555",
            name: "Mariana Alencar Silveira (Responsável)",
            email: "mariana.silveira@email.com",
            role: "GUARDIAN" as const,
          };
        }

        // 2. Busca no banco de dados para contas cadastradas
        try {
          let user = await db.query.users.findFirst({
            where: eq(users.email, email),
          });

          if (!user || !user.passwordHash || !user.isActive) {
            return null;
          }

          const isValid = await bcrypt.compare(password, user.passwordHash);
          if (!isValid) return null;

          return {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
          };
        } catch (error) {
          console.error("[Auth.js authorize error]:", error);
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.name = user.name;
        token.email = user.email;
        token.role = (user as any).role;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.name = (token.name as string) || session.user.name;
        session.user.email = (token.email as string) || session.user.email;
        session.user.role = token.role as "ADMIN" | "SECRETARY" | "TEACHER" | "GUARDIAN";
      }
      return session;
    },
  },
});

