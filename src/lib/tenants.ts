export interface TenantConfig {
  slug: string;
  name: string;
  tradeName: string;
  slogan: string;
  logoUrl: string;
  iconUrl: string;
  themeColor: string;
  phone: string;
  whatsapp: string;
  email: string;
  address: string;
  cnpj: string;
  cityState: string;
  description: string;
  features: string[];
  coursesSummary: Array<{
    title: string;
    description: string;
    period: string;
    badge?: string;
  }>;
}

/**
 * Registro Multi-tenant de Instituições / Cursinhos Contratantes
 * A primeira empresa contratante cadastrada é o Call Cursos Isolados ('call')
 */
export const TENANTS_REGISTRY: Record<string, TenantConfig> = {
  call: {
    slug: "call",
    name: "Call Cursos Isolados",
    tradeName: "CaLL Cursos & Pré-Vestibular",
    slogan: "Educação • Ideias • Pessoas | Excelência & Aprovação",
    logoUrl: "/call-logo.png",
    iconUrl: "/icon.png",
    themeColor: "#0c5195",
    phone: "(84) 98122-0173",
    whatsapp: "5584981220173",
    email: "contato@callcursos.com.br",
    address: "Avenida dos Caiapós, Natal - RN",
    cnpj: "12.345.678/0001-90",
    cityState: "Natal - RN",
    description:
      "Instituição de excelência focada em aprovações de alto rendimento no ENEM, vestibulares de Medicina e carreiras concorridas.",
    features: [
      "Turmas isoladas e reduzidas com acompanhamento individualizado",
      "Material didático exclusivo CaLL ENEM e banco de simulados TRI",
      "Portal da Família integrado com emissão de carnê, PIX e boletos Asaas",
      "Controle de presença biométrico/digital com aviso aos responsáveis",
    ],
    coursesSummary: [
      {
        title: "CaLL ENEM 2026 - Extensivo Anual",
        description: "Preparação completa cobrindo todas as áreas da Matriz de Referência do ENEM.",
        period: "Manhã ou Tarde • Presencial",
        badge: "Mais Procurado",
      },
      {
        title: "Isolada de Redação Nota 1000",
        description: "Oficinas práticas semanais com correção detalhada por critérios oficiais do INEP.",
        period: "Tarde ou Noite • Presencial",
        badge: "Destaque",
      },
      {
        title: "Isolada de Matemática & Ciências da Natureza",
        description: "Aprofundamento de alta complexidade em Física, Química, Biologia e Matemática.",
        period: "Manhã ou Noite • Presencial",
      },
      {
        title: "Turma Medicina & Carreiras de Alto Desempenho",
        description: "Imersão intensiva com mentoria pedagógica e foco nos vestibulares mais concorridos.",
        period: "Integral • Vagas Limitadas",
        badge: "Exclusivo",
      },
    ],
  },
};

/**
 * Recupera as configurações de um tenant pelo slug da URL (ex: 'call')
 */
export function getTenantBySlug(slug: string): TenantConfig | null {
  const normalizedSlug = slug.toLowerCase().trim();
  
  if (TENANTS_REGISTRY[normalizedSlug]) {
    return TENANTS_REGISTRY[normalizedSlug];
  }

  // Alias comuns
  if (normalizedSlug === "callcursos" || normalizedSlug === "escola-call") {
    return TENANTS_REGISTRY["call"];
  }

  return null;
}

/**
 * Retorna todos os slugs válidos para geração de caminhos estáticos
 */
export function getAllTenantSlugs(): string[] {
  return Object.keys(TENANTS_REGISTRY);
}
