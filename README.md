# Cursinho Pro - Sistema de Gestão Escolar & Financeira

Sistema completo e integrado para gestão acadêmica e financeira de cursinhos preparatórios e escolas particulares, desenvolvido com **Next.js (App Router)**, **TypeScript**, **PostgreSQL**, **Drizzle ORM**, **Auth.js v5** e **Tailwind CSS + shadcn/ui**.

---

## 🚀 Stack Tecnológica

- **Framework Web**: Next.js 15+ (App Router, Server Actions, React 19)
- **Linguagem**: TypeScript (Strict Mode)
- **Banco de Dados**: PostgreSQL
- **ORM**: Drizzle ORM + Drizzle Kit
- **Autenticação & RBAC**: Auth.js (NextAuth v5) com perfis `ADMIN`, `SECRETARY`, `TEACHER`
- **Validação de Schemas**: Zod
- **Estilização & UI**: Tailwind CSS, shadcn/ui primitives, Lucide React Icons

---

## 📁 Arquitetura Modular (Feature-Driven Monolith)

```text
src/
├── app/
│   ├── (auth)/login/page.tsx               # Login e autenticação por credenciais
│   ├── (dashboard)/
│   │   ├── layout.tsx                      # Layout com Sidebar, Header e Breadcrumb
│   │   ├── page.tsx                        # Dashboard com KPIs e atalhos rápidos
│   │   ├── academic/
│   │   │   ├── students/page.tsx           # Listagem e fichas de alunos
│   │   │   ├── classes/page.tsx            # Turmas, salas e ocupação/capacidade
│   │   │   ├── enrollments/new/page.tsx    # Wizard interativo de Nova Matrícula
│   │   │   └── attendance/page.tsx         # Diário de presença/falta e justificativas
│   │   └── financial/
│   │       ├── invoices/page.tsx           # Gestão de mensalidades e status
│   │       ├── defaulters/page.tsx         # Painel analítico de Inadimplência & Cobrança
│   │       └── cashflow/page.tsx           # Relatório Previsto vs. Realizado por turma
│   └── api/
│       ├── auth/[...nextauth]/route.ts     # Handlers de Autenticação
│       └── cron/overdue-check/route.ts     # Cron diário para atualizar faturas vencidas
├── components/
│   ├── ui/                                 # Primitivas de UI (Button, Badge, Card, Table...)
│   └── shared/                             # Componentes estruturais (Sidebar, Header)
├── db/
│   ├── index.ts                            # Pool de conexão PostgreSQL (postgres-js / pg)
│   ├── schema/index.ts                     # Schema Drizzle ORM unificado com Enums e FKs
│   └── seed.ts                             # Carga inicial de usuários, turmas e faturas demo
├── lib/
│   ├── auth.ts                             # Configuração Auth.js v5 com RBAC
│   ├── permissions.ts                      # Controle de permissões por perfil
│   └── utils.ts                            # Formatadores (BRL, CPF, Telefone, Datas)
└── modules/
    ├── academic/
    │   ├── actions/enrollment.actions.ts   # Core Transactional Action (db.transaction)
    │   ├── components/enrollment-form.tsx  # Formulário reativo de Matrícula
    │   └── schemas/enrollment.schema.ts    # Validação Zod da matrícula
    └── financial/
        ├── actions/payment.actions.ts      # Baixa de faturas com juros/multa/desconto
        ├── queries/defaulters.queries.ts   # Query agregada de inadimplentes
        └── schemas/payment.schema.ts       # Validação Zod de pagamentos
```

---

## ⚙️ Pré-requisitos & Instalação

### 1. Variáveis de Ambiente

Crie ou edite o arquivo `.env.local`:

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/gestao_escolar?schema=public"
AUTH_SECRET="f6c8d7e9a1b2c3d4e5f60718293a4b5c6d7e8f90a1b2c3d4e5f6a7b8c9d0e1f2"
NEXTAUTH_URL="http://localhost:3000"
NEXT_PUBLIC_APP_NAME="Cursinho Pro - Gestão Escolar"
```

### 2. Instalação de Dependências

```bash
npm install
```

> **Dica para ambientes Windows com Google Drive Desktop:**
> Se o projeto estiver em uma unidade virtual do Google Drive (`G:\`), recomenda-se clonar o repositório em uma pasta local (`C:\Projetos\...`) para evitar travas de sincronização nos milhares de arquivos do `node_modules`.

### 3. Sincronização do Banco de Dados & Seed

Execute as migrações automáticas do Drizzle e popule com dados de demonstração:

```bash
# Cria as tabelas diretamente no PostgreSQL
npm run db:push

# Popula usuários, turmas, alunos e mensalidades de teste
npm run db:seed
```

### 4. Executar em Desenvolvimento

```bash
npm run dev
```

Acesse: `http://localhost:3000`

---

## 🔑 Credenciais Padrão do Seed

| Perfil | E-mail | Senha |
| :--- | :--- | :--- |
| **Administrador (Geral)** | `admin@cursinhopro.com.br` | `admin123` |
| **Secretaria** | `secretaria@cursinhopro.com.br` | `secretaria123` |
| **Professor** | `professor@cursinhopro.com.br` | `prof123` |

---

## 💡 Destaques Arquiteturais da Solução

### 1. Transação Atômica de Matrícula (`createEnrollmentAction`)
- Executa dentro de um bloco `db.transaction(async (tx) => ...)`.
- Reutiliza responsável por CPF ou cadastra novo.
- Reutiliza/cadastra aluno vinculado ao responsável.
- Checa a lotação da turma em tempo real antes de persistir (`activeEnrollments < capacity`).
- Gera o código único da matrícula (`MAT-2026-XXXX`).
- Calcula o cronograma financeiro completo de mensalidades (`invoices`) de acordo com a duração do curso (`durationMonths`), aplicando bolsa/desconto comercial e dia de vencimento fixo.

### 2. Monitoramento de Inadimplência em Tempo Real
- Query analítica agregada com `sum`, `count` e cálculo nativo de dias em atraso (`max(current_date - dueDate)`).
- Identifica tanto faturas marcadas como `OVERDUE` quanto faturas `PENDING` cuja data de vencimento já expirou.
- Link direto de cobrança via **WhatsApp** com mensagem pré-formatada para o responsável financeiro.
- Endpoint de Cron Job (`/api/cron/overdue-check`) para atualização automática diária de status.

### 3. Integridade Referencial Financeira
- Tabelas de faturas e pagamentos utilizam regras `onDelete: "restrict"`, impedindo que alunos com histórico financeiro sejam deletados por engano.
- Precisão monetária configurada em `decimal(10, 2)` para evitar imprecisões de ponto flutuante.

