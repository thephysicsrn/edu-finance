# Edu.Finance - Visão Geral do Produto (PRODUCT.md)

## 🎯 Propósito & Missão
O **Edu.Finance** é um software de gestão escolar e inteligência financeira desenvolvido especificamente para cursinhos preparatórios (vestibulares/concursos) e escolas particulares. Ele elimina a complexidade de processos manuais, unificando a jornada do aluno desde a matrícula até a cobrança e conciliação bancária automática.

---

## 👥 Perfis de Usuários (RBAC)

1. **Gestor Geral / Administrador (ADMIN)**
   * Acesso completo a métricas consolidadas (KPIs de faturamento, inadimplência, fluxo previsto vs. realizado).
   * Configuração de cursos, turmas e parâmetros da instituição.
   * Integrações com gateways bancários (Asaas).

2. **Secretaria & Atendimento (SECRETARY)**
   * Cadastro de novos alunos e responsáveis com validação estrita de CPF.
   * Realização de matrículas com cálculo automático de bolsas/descontos e geração atômica de carnê de parcelas.
   * Emissão de recibos e cobranças via PIX instantâneo e Boletos.

3. **Corpo Docente (TEACHER)**
   * Lançamento de diário de classe (tópicos de aula e diário de frequência/faltas).

---

## ⚡ Fluxos Centrais (Core Workflows)

* **Matrícula com Transação ACID Atômica:** Cadastro sincronizado de aluno, responsável, turma e faturamento das 10 a 12 mensalidades de uma só vez.
* **Cobrança Integrada Asaas (API v3):** Emissão de faturas com PIX QR Code instantâneo, Copia e Cola e boleto bancário FEBRABAN.
* **Conciliação Automática via Webhook:** Baixa instantânea e atômica de faturas no banco quando o aluno paga o PIX ou boleto.
* **Painel Analítico de Inadimplência:** Identificação em tempo real de parcelas vencidas e histórico de cobrança.

