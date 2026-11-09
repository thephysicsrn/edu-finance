/**
 * ==============================================================================
 * Asaas Payment Gateway Integration Service (API v3)
 * Documentação Oficial: https://docs.asaas.com/
 * ==============================================================================
 */

export interface AsaasCustomerInput {
  name: string;
  cpfCnpj: string;
  email?: string;
  phone?: string;
  mobilePhone?: string;
  address?: string;
  addressNumber?: string;
  complement?: string;
  province?: string;
  postalCode?: string;
  externalReference?: string;
}

export interface AsaasCustomerResponse {
  id: string; // Ex: "cus_000005832943"
  name: string;
  email: string;
  cpfCnpj: string;
  phone?: string;
  mobilePhone?: string;
}

export type AsaasBillingType = "BOLETO" | "PIX" | "CREDIT_CARD" | "UNDEFINED";

export interface AsaasCreatePaymentInput {
  customerId: string;
  billingType: AsaasBillingType;
  value: number;
  dueDate: string; // YYYY-MM-DD
  description: string;
  externalReference: string; // ID da fatura no nosso banco de dados
  postalService?: boolean;
  fine?: {
    value: number; // Multa percentual
  };
  interest?: {
    value: number; // Juros ao mês percentual
  };
  discount?: {
    value: number;
    dueDateLimitDays?: number;
    type?: "PERCENTAGE" | "FIXED";
  };
}

export interface AsaasPaymentResponse {
  id: string; // Ex: "pay_000000000001"
  customer: string;
  value: number;
  netValue: number;
  billingType: AsaasBillingType;
  status: string; // PENDING, RECEIVED, CONFIRMED, OVERDUE, etc.
  dueDate: string;
  invoiceUrl: string; // Link direto do Asaas para o aluno/responsável pagar
  bankSlipUrl?: string; // Link do PDF do boleto
  invoiceNumber: string;
  externalReference?: string;
}

export interface AsaasPixQrCodeResponse {
  encodedImage: string; // Imagem em Base64
  payload: string; // Código Copia e Cola
  expirationDate: string;
}

export interface AsaasIdentificationFieldResponse {
  identificationField: string; // Linha digitável formatada
  nossoNumero: string;
  barCode: string; // Código de barras numérico
}

export class AsaasService {
  private static get baseUrl(): string {
    const env = process.env.ASAAS_ENVIRONMENT?.toLowerCase();
    if (env === "production" || env === "prod") {
      return "https://api.asaas.com/v3";
    }
    // Padrão: Sandbox de Homologação / Testes
    return "https://sandbox.asaas.com/api/v3";
  }

  private static get apiKey(): string {
    return process.env.ASAAS_API_KEY || "";
  }

  public static isConfigured(): boolean {
    return Boolean(this.apiKey && this.apiKey.trim().length > 10);
  }

  /**
   * Helper privado para chamadas autenticadas na API v3 do Asaas
   */
  private static async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    if (!this.isConfigured()) {
      throw new Error("Chave ASAAS_API_KEY não configurada no ambiente.");
    }

    const url = `${this.baseUrl}${endpoint}`;
    const headers = {
      "Content-Type": "application/json",
      access_token: this.apiKey,
      ...options.headers,
    };

    const response = await fetch(url, {
      ...options,
      headers,
    });

    const data = await response.json();

    if (!response.ok) {
      const errorMsg =
        data?.errors?.[0]?.description ||
        data?.message ||
        `Erro HTTP ${response.status} na API do Asaas`;
      throw new Error(`[Asaas API Error]: ${errorMsg}`);
    }

    return data as T;
  }

  /**
   * 1. Consulta ou Cadastra Cliente no Asaas por CPF/CNPJ
   */
  static async findOrCreateCustomer(input: AsaasCustomerInput): Promise<AsaasCustomerResponse> {
    const cleanCpf = input.cpfCnpj.replace(/\D/g, "");

    // Busca cliente existente por CPF
    try {
      const searchRes = await this.request<{ data: AsaasCustomerResponse[] }>(
        `/customers?cpfCnpj=${cleanCpf}`
      );

      if (searchRes.data && searchRes.data.length > 0) {
        return searchRes.data[0];
      }
    } catch (err) {
      console.warn("[Asaas] Erro ao buscar cliente por CPF, tentando criar novo:", err);
    }

    // Se não existir, cria novo cliente
    return await this.request<AsaasCustomerResponse>("/customers", {
      method: "POST",
      body: JSON.stringify({
        name: input.name,
        cpfCnpj: cleanCpf,
        email: input.email || undefined,
        phone: input.phone || undefined,
        mobilePhone: input.mobilePhone || input.phone || undefined,
        address: input.address || undefined,
        postalCode: input.postalCode ? input.postalCode.replace(/\D/g, "") : undefined,
        externalReference: input.externalReference || undefined,
        notificationDisabled: false, // Envia e-mail/SMS automático de cobrança
      }),
    });
  }

  /**
   * 2. Cria Cobrança (Boleto + PIX ou Cartão)
   */
  static async createPayment(input: AsaasCreatePaymentInput): Promise<AsaasPaymentResponse> {
    return await this.request<AsaasPaymentResponse>("/payments", {
      method: "POST",
      body: JSON.stringify({
        customer: input.customerId,
        billingType: input.billingType || "UNDEFINED",
        value: input.value,
        dueDate: input.dueDate,
        description: input.description,
        externalReference: input.externalReference,
        postalService: false,
        fine: input.fine || { value: 2.0 }, // 2% de multa padrão por atraso
        interest: input.interest || { value: 1.0 }, // 1% de juros ao mês
        discount: input.discount || undefined,
      }),
    });
  }

  /**
   * 3. Busca QR Code e Linha Copia e Cola do PIX para uma cobrança
   */
  static async getPixQrCode(paymentId: string): Promise<AsaasPixQrCodeResponse> {
    return await this.request<AsaasPixQrCodeResponse>(`/payments/${paymentId}/pixQrCode`);
  }

  /**
   * 4. Busca Código de Barras e Linha Digitável do Boleto
   */
  static async getIdentificationField(paymentId: string): Promise<AsaasIdentificationFieldResponse> {
    return await this.request<AsaasIdentificationFieldResponse>(
      `/payments/${paymentId}/identificationField`
    );
  }

  /**
   * 5. Cancela uma cobrança no Asaas
   */
  static async deletePayment(paymentId: string): Promise<{ deleted: boolean; id: string }> {
    return await this.request<{ deleted: boolean; id: string }>(`/payments/${paymentId}`, {
      method: "DELETE",
    });
  }
}

