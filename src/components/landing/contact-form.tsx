"use client";

import { useState } from "react";
import { CheckCircle2, Send, Phone, MessageSquare, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ContactFormSection() {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    institutionType: "cursinho",
    message: "",
  });

  function handlePhoneChange(val: string) {
    const raw = val.replace(/\D/g, "").slice(0, 11);
    let formatted = raw;
    if (raw.length > 2) {
      formatted = `(${raw.slice(0, 2)}) ${raw.slice(2)}`;
    }
    if (raw.length > 7) {
      formatted = `(${raw.slice(0, 2)}) ${raw.slice(2, 7)}-${raw.slice(7)}`;
    }
    setFormData((prev) => ({ ...prev, phone: formatted }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
    }, 700);
  }

  return (
    <section id="contato" className="bg-[#07132c] text-white py-20 sm:py-28 relative overflow-hidden select-none">
      {/* Detalhe de iluminação suave */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid gap-12 lg:grid-cols-12 items-start">
          {/* ============================================================== */}
          {/* COLUNA ESQUERDA: FORMULÁRIO DE CONTATO (IDÊNTICO À REFERÊNCIA) */}
          {/* ============================================================== */}
          <div className="lg:col-span-7 bg-[#0b1736] border border-white/10 rounded-2xl p-6 sm:p-10 shadow-2xl">
            {submitted ? (
              <div className="py-12 text-center space-y-4">
                <div className="h-16 w-16 bg-emerald-500/20 text-[#00c878] rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle2 className="h-10 w-10" />
                </div>
                <h3 className="text-2xl font-bold text-white">Mensagem Enviada com Sucesso!</h3>
                <p className="text-slate-200 text-sm max-w-md mx-auto leading-relaxed">
                  Obrigado pelo interesse na <strong>Edu.Finance</strong>. Nossa equipe entrará em contato em menos de 2 horas no seu WhatsApp.
                </p>
                <Button
                  onClick={() => {
                    setSubmitted(false);
                    setFormData({ name: "", email: "", phone: "", institutionType: "cursinho", message: "" });
                  }}
                  variant="outline"
                  className="border-white/30 text-white hover:bg-white/10 mt-4 text-xs font-semibold"
                >
                  Enviar Outra Mensagem
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <label htmlFor="form-name" className="text-xs font-semibold uppercase tracking-wider text-slate-200 block">
                    Seu nome <span className="text-rose-400">*</span>
                  </label>
                  <input
                    id="form-name"
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Ex: Roberto Silveira"
                    className="w-full bg-[#07132c] border border-white/20 focus:border-[#0052ff] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0052ff] rounded-lg px-4 py-3 text-sm text-white placeholder:text-slate-400 transition-colors"
                  />
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <label htmlFor="form-email" className="text-xs font-semibold uppercase tracking-wider text-slate-200 block">
                      Seu e-mail institucional <span className="text-rose-400">*</span>
                    </label>
                    <input
                      id="form-email"
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="diretoria@escola.com.br"
                      className="w-full bg-[#07132c] border border-white/20 focus:border-[#0052ff] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0052ff] rounded-lg px-4 py-3 text-sm text-white placeholder:text-slate-400 transition-colors"
                    />
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="form-phone" className="text-xs font-semibold uppercase tracking-wider text-slate-200 block">
                      Seu WhatsApp / Telefone <span className="text-rose-400">*</span>
                    </label>
                    <input
                      id="form-phone"
                      type="tel"
                      required
                      value={formData.phone}
                      onChange={(e) => handlePhoneChange(e.target.value)}
                      placeholder="(84) 98122-0173"
                      className="w-full bg-[#07132c] border border-white/20 focus:border-[#0052ff] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0052ff] rounded-lg px-4 py-3 text-sm text-white placeholder:text-slate-400 transition-colors"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label htmlFor="form-type" className="text-xs font-semibold uppercase tracking-wider text-slate-200 block">
                    Tipo de Instituição de Ensino
                  </label>
                  <select
                    id="form-type"
                    value={formData.institutionType}
                    onChange={(e) => setFormData({ ...formData, institutionType: e.target.value })}
                    className="w-full bg-[#07132c] border border-white/20 focus:border-[#0052ff] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0052ff] rounded-lg px-4 py-3 text-sm text-white transition-colors"
                  >
                    <option value="cursinho" className="bg-[#07132c] text-white">Cursinho Pré-Vestibular / Pré-Enem</option>
                    <option value="colegio" className="bg-[#07132c] text-white">Colégio / Ensino Básico</option>
                    <option value="idiomas" className="bg-[#07132c] text-white">Escola de Idiomas / Cursos Livres</option>
                    <option value="outro" className="bg-[#07132c] text-white">Outra Instituição</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label htmlFor="form-message" className="text-xs font-semibold uppercase tracking-wider text-slate-200 block">
                    Mensagem ou Dúvida
                  </label>
                  <textarea
                    id="form-message"
                    rows={4}
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    placeholder="Conte-nos quantos alunos você atende ou quais desafios gostaria de solucionar com a Edu.Finance..."
                    className="w-full bg-[#07132c] border border-white/20 focus:border-[#0052ff] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0052ff] rounded-lg px-4 py-3 text-sm text-white placeholder:text-slate-400 resize-none transition-colors"
                  />
                </div>

                {/* Consentimento LGPD */}
                <div className="flex items-center gap-3 text-xs text-slate-300 pt-1">
                  <input
                    type="checkbox"
                    defaultChecked
                    id="lgpd-consent"
                    className="h-4 w-4 rounded-xs border-white/30 accent-[#0052ff] focus-visible:ring-2 focus-visible:ring-[#0052ff]"
                  />
                  <label htmlFor="lgpd-consent" className="cursor-pointer">
                    Concordo com o tratamento de dados conforme a LGPD para recebimento de contato comercial.
                  </label>
                </div>

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full sm:w-auto px-8 py-3 bg-white hover:bg-slate-100 active:bg-slate-200 text-[#07132c] font-bold text-xs uppercase tracking-wider rounded-lg transition-all shadow-md flex items-center justify-center gap-2 h-12 focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#07132c]"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Enviando dados...</span>
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4" />
                      <span>Enviar Mensagem</span>
                    </>
                  )}
                </Button>
              </form>
            )}
          </div>

          {/* ============================================================== */}
          {/* COLUNA DIREITA: CONTATOS EM DESTAQUE (FIEL À REFERÊNCIA)       */}
          {/* ============================================================== */}
          <div className="lg:col-span-5 space-y-8 pl-0 lg:pl-6">
            <div>
              <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white text-balance">
                Fale conosco
              </h2>
              <p className="mt-4 text-slate-200 text-sm sm:text-base leading-relaxed">
                Nos envie uma mensagem preenchendo o formulário ao lado, entraremos em contato o mais rápido possível!
              </p>
            </div>

            <div className="pt-6 border-t border-white/15 space-y-5">
              <p className="text-sm text-slate-300">
                Se preferir, tire suas dúvidas através do telefone:
              </p>

              {/* TELEFONE EM DESTAQUE GIGANTE (EXATAMENTE COMO NA REFERÊNCIA) */}
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-xl bg-blue-600/30 border border-blue-400/30 flex items-center justify-center text-[#00c878] shrink-0">
                  <Phone className="h-6 w-6" />
                </div>
                <div>
                  <span className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold block">
                    Central Telefônica & Suporte
                  </span>
                  <a
                    href="tel:5584981220173"
                    className="text-2xl sm:text-3xl font-extrabold text-white hover:text-[#00c878] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white rounded-xs"
                  >
                    (84) 98122-0173
                  </a>
                </div>
              </div>

              {/* BOTÃO WHATSAPP DIRETO */}
              <div className="pt-2">
                <a
                  href="https://wa.me/5584981220173?text=Olá!%20Gostaria%20de%20conhecer%20a%20Edu.Finance%20para%20minha%20instituição"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-3 bg-[#00c878] hover:bg-[#00b069] active:bg-[#009b5c] text-white px-6 py-3.5 rounded-lg font-bold text-xs uppercase tracking-wider transition-all shadow-lg hover:shadow-emerald-500/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00c878] focus-visible:ring-offset-2 focus-visible:ring-offset-[#07132c]"
                >
                  <MessageSquare className="h-4 w-4" />
                  <span>Conversar Agora no WhatsApp</span>
                </a>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-white/5 border border-white/10 text-xs text-slate-200 space-y-1">
              <p className="font-semibold text-white">Horário de Atendimento Especializado:</p>
              <p>Segunda a Sexta-feira: 08h00 às 19h00</p>
              <p className="text-slate-300">Suporte técnico para cursinhos e escolas parceiras.</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
