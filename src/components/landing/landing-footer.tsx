import Link from "next/link";
import { EduFinanceLogo } from "@/components/shared/logo";
import { ShieldCheck, Lock, ExternalLink } from "lucide-react";

export function LandingFooter() {
  return (
    <footer className="bg-[#f8fafc] border-t border-slate-200 select-none text-slate-600 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {/* Logo e Missão */}
          <div className="space-y-4">
            <EduFinanceLogo variant="full" size="md" />
            <p className="text-slate-500 text-xs leading-relaxed">
              Plataforma especializada em inteligência financeira, automação de cobranças Asaas e gestão acadêmica 360° para cursinhos e escolas.
            </p>
            <div className="flex items-center gap-2 text-[11px] text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200 inline-flex">
              <ShieldCheck className="h-3.5 w-3.5" />
              <span>Conexão Segura & Conformidade LGPD</span>
            </div>
          </div>

          {/* Navegação Rápida */}
          <div>
            <h4 className="font-bold text-slate-900 uppercase tracking-wider text-xs mb-3">
              Plataforma
            </h4>
            <ul className="space-y-2">
              <li>
                <a href="#inicio" className="hover:text-[#0052ff] transition-colors">
                  Início
                </a>
              </li>
              <li>
                <a href="#sobre" className="hover:text-[#0052ff] transition-colors">
                  Sobre a Edu.Finance
                </a>
              </li>
              <li>
                <a href="#modulos" className="hover:text-[#0052ff] transition-colors">
                  Módulos do Sistema
                </a>
              </li>
              <li>
                <a href="#asaas" className="hover:text-[#0052ff] transition-colors">
                  Integração Asaas API v3
                </a>
              </li>
              <li>
                <Link href="/login" className="text-[#0052ff] font-semibold hover:underline">
                  Área do Cliente (Login)
                </Link>
              </li>
            </ul>
          </div>

          {/* Módulos do Sistema */}
          <div>
            <h4 className="font-bold text-slate-900 uppercase tracking-wider text-xs mb-3">
              Módulos Ativos
            </h4>
            <ul className="space-y-2 text-slate-500">
              <li>Régua de Cobrança PIX & Boleto</li>
              <li>Fila de Cobrança Preventiva (WhatsApp)</li>
              <li>Secretaria & Matrícula Ágil</li>
              <li>Portal do Professor & Chamada Digital</li>
              <li>Frente de Caixa Balcão (Smart POS)</li>
              <li>Relatório DRE & Fluxo de Caixa</li>
            </ul>
          </div>

          {/* Suporte e Contato */}
          <div>
            <h4 className="font-bold text-slate-900 uppercase tracking-wider text-xs mb-3">
              Fale Conosco
            </h4>
            <ul className="space-y-2">
              <li>
                <strong className="text-slate-900">Telefone:</strong>{" "}
                <a href="tel:5584981220173" className="hover:text-[#0052ff]">
                  (84) 98122-0173
                </a>
              </li>
              <li>
                <strong className="text-slate-900">E-mail:</strong>{" "}
                <a href="mailto:contato@edugrad.com.br" className="hover:text-[#0052ff]">
                  contato@edugrad.com.br
                </a>
              </li>
              <li>
                <strong className="text-slate-900">Atendimento:</strong> Seg a Sex, das 08h às 19h
              </li>
              <li>
                <strong className="text-slate-900">Localização:</strong> Avenida dos Caiapós, Natal - RN
              </li>
            </ul>
          </div>
        </div>

        {/* Rodapé Inferior */}
        <div className="mt-12 pt-8 border-t border-slate-200/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-slate-400 text-[11px]">
          <p>
            © {new Date().getFullYear()} <strong>Edu.Finance Tecnologia Educacional Ltda.</strong> CNPJ: 45.123.789/0001-90. Todos os direitos reservados.
          </p>
          <div className="flex items-center gap-6">
            <Link href="/login" className="hover:text-slate-600 transition-colors">
              Área do Cliente
            </Link>
            <a href="#contato" className="hover:text-slate-600 transition-colors">
              Privacidade
            </a>
            <a href="#contato" className="hover:text-slate-600 transition-colors">
              Termos de Uso
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}

