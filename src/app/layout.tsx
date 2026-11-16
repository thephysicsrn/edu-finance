import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Call Cursos Isolados - Gestão Acadêmica & Financeira",
  description: "Plataforma integrada de gestão acadêmica e inteligência financeira - Call Cursos Isolados.",
  icons: {
    icon: "/call-logo.png",
    shortcut: "/call-logo.png",
    apple: "/call-logo.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className="scroll-smooth">
      <body className={inter.className}>{children}</body>
    </html>
  );
}

