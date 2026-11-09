-- ==============================================================================
-- SISTEMA DE GESTÃO ESCOLAR - SETUP COMPLETO SUPABASE (POSTGRESQL)
-- Cole este script no SQL Editor do Supabase e clique em "RUN" (Ctrl + Enter)
-- ==============================================================================

-- 1. EXTENSÕES
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. TIPOS ENUM NATIVOS
DO $$ BEGIN
    CREATE TYPE "attendance_status" AS ENUM('PRESENT', 'ABSENT', 'JUSTIFIED');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE "enrollment_status" AS ENUM('ACTIVE', 'PENDING_PAYMENT', 'SUSPENDED', 'CANCELLED', 'COMPLETED');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE "invoice_status" AS ENUM('PENDING', 'PAID', 'OVERDUE', 'CANCELLED');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE "invoice_type" AS ENUM('ENROLLMENT_FEE', 'TUITION', 'MATERIAL', 'RENEGOTIATION');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE "payment_method" AS ENUM('PIX', 'BOLETO', 'CREDIT_CARD', 'DEBIT_CARD', 'CASH', 'BANK_TRANSFER');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE "shift" AS ENUM('MORNING', 'AFTERNOON', 'NIGHT', 'FULL_TIME');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE "user_role" AS ENUM('ADMIN', 'SECRETARY', 'TEACHER');
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- 3. TABELAS
CREATE TABLE IF NOT EXISTS "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(255) NOT NULL,
	"email" varchar(255) NOT NULL UNIQUE,
	"email_verified" timestamp,
	"image" text,
	"password_hash" text,
	"role" "user_role" DEFAULT 'SECRETARY' NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "accounts" (
	"user_id" uuid NOT NULL REFERENCES "users"("id") ON DELETE cascade,
	"type" varchar(255) NOT NULL,
	"provider" varchar(255) NOT NULL,
	"provider_account_id" varchar(255) NOT NULL,
	"refresh_token" text,
	"access_token" text,
	"expires_at" integer,
	"token_type" varchar(255),
	"scope" varchar(255),
	"id_token" text,
	"session_state" varchar(255),
	CONSTRAINT "accounts_provider_provider_account_id_pk" PRIMARY KEY("provider","provider_account_id")
);

CREATE TABLE IF NOT EXISTS "sessions" (
	"session_token" varchar(255) PRIMARY KEY NOT NULL,
	"user_id" uuid NOT NULL REFERENCES "users"("id") ON DELETE cascade,
	"expires" timestamp NOT NULL
);

CREATE TABLE IF NOT EXISTS "guardians" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"full_name" varchar(255) NOT NULL,
	"cpf" varchar(14) NOT NULL UNIQUE,
	"rg" varchar(20),
	"email" varchar(255) NOT NULL,
	"phone" varchar(20) NOT NULL,
	"relationship" varchar(50) NOT NULL,
	"address" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "students" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"guardian_id" uuid REFERENCES "guardians"("id") ON DELETE restrict,
	"full_name" varchar(255) NOT NULL,
	"cpf" varchar(14) UNIQUE,
	"rg" varchar(20),
	"birth_date" date NOT NULL,
	"email" varchar(255),
	"phone" varchar(20),
	"address" text,
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "courses" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(255) NOT NULL,
	"code" varchar(50) NOT NULL UNIQUE,
	"description" text,
	"duration_months" integer NOT NULL,
	"total_hours" integer,
	"base_price" numeric(10, 2) NOT NULL,
	"default_enrollment_fee" numeric(10, 2) DEFAULT '250.00' NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "classes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"course_id" uuid NOT NULL REFERENCES "courses"("id") ON DELETE restrict,
	"name" varchar(255) NOT NULL,
	"shift" "shift" NOT NULL,
	"room" varchar(100) NOT NULL,
	"capacity" integer NOT NULL,
	"start_date" date NOT NULL,
	"end_date" date NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "class_teachers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"class_id" uuid NOT NULL REFERENCES "classes"("id") ON DELETE cascade,
	"teacher_id" uuid NOT NULL REFERENCES "users"("id") ON DELETE restrict,
	"subject" varchar(100) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "enrollments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"enrollment_number" varchar(50) NOT NULL UNIQUE,
	"student_id" uuid NOT NULL REFERENCES "students"("id") ON DELETE restrict,
	"class_id" uuid NOT NULL REFERENCES "classes"("id") ON DELETE restrict,
	"status" "enrollment_status" DEFAULT 'ACTIVE' NOT NULL,
	"enrollment_fee" numeric(10, 2) DEFAULT '0.00' NOT NULL,
	"is_fee_paid" boolean DEFAULT false NOT NULL,
	"discount_percentage" numeric(5, 2) DEFAULT '0.00' NOT NULL,
	"discount_reason" text,
	"enrollment_date" timestamp DEFAULT now() NOT NULL,
	"confirmed_at" timestamp,
	"cancelled_at" timestamp,
	"cancellation_reason" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "lessons" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"class_id" uuid NOT NULL REFERENCES "classes"("id") ON DELETE cascade,
	"teacher_id" uuid NOT NULL REFERENCES "users"("id") ON DELETE restrict,
	"date" date NOT NULL,
	"topic" varchar(255) NOT NULL,
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "attendance" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"lesson_id" uuid NOT NULL REFERENCES "lessons"("id") ON DELETE cascade,
	"student_id" uuid NOT NULL REFERENCES "students"("id") ON DELETE cascade,
	"status" "attendance_status" DEFAULT 'PRESENT' NOT NULL,
	"justification" text,
	"recorded_by" uuid NOT NULL REFERENCES "users"("id") ON DELETE restrict,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "invoices" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"enrollment_id" uuid NOT NULL REFERENCES "enrollments"("id") ON DELETE restrict,
	"student_id" uuid NOT NULL REFERENCES "students"("id") ON DELETE restrict,
	"invoice_type" "invoice_type" DEFAULT 'TUITION' NOT NULL,
	"installment_number" integer NOT NULL,
	"total_installments" integer NOT NULL,
	"amount" numeric(10, 2) NOT NULL,
	"discount_amount" numeric(10, 2) DEFAULT '0.00' NOT NULL,
	"final_amount" numeric(10, 2) NOT NULL,
	"due_date" date NOT NULL,
	"status" "invoice_status" DEFAULT 'PENDING' NOT NULL,
	"gateway" varchar(50) DEFAULT 'INTERNAL' NOT NULL,
	"gateway_invoice_id" varchar(255),
	"gateway_payment_url" text,
	"barcode" varchar(100),
	"pix_copia_e_cola" text,
	"pix_qrcode_url" text,
	"last_synced_at" timestamp,
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "pos_terminals" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(100) NOT NULL,
	"provider" varchar(50) DEFAULT 'MERCADO_PAGO_POINT' NOT NULL,
	"device_id" varchar(100) NOT NULL UNIQUE,
	"model" varchar(50) DEFAULT 'SmartPOS',
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "payments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"invoice_id" uuid NOT NULL REFERENCES "invoices"("id") ON DELETE restrict,
	"amount_paid" numeric(10, 2) NOT NULL,
	"penalty_amount" numeric(10, 2) DEFAULT '0.00' NOT NULL,
	"interest_amount" numeric(10, 2) DEFAULT '0.00' NOT NULL,
	"discount_given" numeric(10, 2) DEFAULT '0.00' NOT NULL,
	"total_received" numeric(10, 2) NOT NULL,
	"paid_at" timestamp DEFAULT now() NOT NULL,
	"payment_method" "payment_method" NOT NULL,
	"pos_terminal_id" uuid REFERENCES "pos_terminals"("id") ON DELETE set null,
	"card_brand" varchar(50),
	"card_installments" integer DEFAULT 1,
	"authorization_code" varchar(100),
	"transaction_reference" varchar(255),
	"source" varchar(50) DEFAULT 'SMART_POS' NOT NULL,
	"received_by" uuid REFERENCES "users"("id") ON DELETE restrict,
	"created_at" timestamp DEFAULT now() NOT NULL
);

-- 4. ÍNDICES DE ALTA PERFORMANCE
CREATE INDEX IF NOT EXISTS "account_user_id_idx" ON "accounts" ("user_id");
CREATE UNIQUE INDEX IF NOT EXISTS "unique_attendance_per_lesson_idx" ON "attendance" ("lesson_id", "student_id");
CREATE INDEX IF NOT EXISTS "attendance_student_idx" ON "attendance" ("student_id");
CREATE UNIQUE INDEX IF NOT EXISTS "unique_class_teacher_subject_idx" ON "class_teachers" ("class_id", "teacher_id", "subject");
CREATE INDEX IF NOT EXISTS "classes_course_id_idx" ON "classes" ("course_id");
CREATE INDEX IF NOT EXISTS "classes_is_active_idx" ON "classes" ("is_active");
CREATE INDEX IF NOT EXISTS "enrollment_student_idx" ON "enrollments" ("student_id");
CREATE INDEX IF NOT EXISTS "enrollment_class_idx" ON "enrollments" ("class_id");
CREATE INDEX IF NOT EXISTS "enrollment_status_idx" ON "enrollments" ("status");
CREATE UNIQUE INDEX IF NOT EXISTS "unique_student_active_class_idx" ON "enrollments" ("student_id", "class_id");
CREATE INDEX IF NOT EXISTS "guardians_cpf_idx" ON "guardians" ("cpf");
CREATE INDEX IF NOT EXISTS "guardians_email_idx" ON "guardians" ("email");
CREATE INDEX IF NOT EXISTS "invoice_student_idx" ON "invoices" ("student_id");
CREATE INDEX IF NOT EXISTS "invoice_due_date_idx" ON "invoices" ("due_date");
CREATE INDEX IF NOT EXISTS "invoice_status_idx" ON "invoices" ("status");
CREATE INDEX IF NOT EXISTS "invoice_enrollment_idx" ON "invoices" ("enrollment_id");
CREATE INDEX IF NOT EXISTS "invoice_gateway_id_idx" ON "invoices" ("gateway_invoice_id");
CREATE INDEX IF NOT EXISTS "invoice_type_idx" ON "invoices" ("invoice_type");
CREATE UNIQUE INDEX IF NOT EXISTS "unique_installment_enrollment_idx" ON "invoices" ("enrollment_id", "installment_number");
CREATE INDEX IF NOT EXISTS "lessons_class_date_idx" ON "lessons" ("class_id", "date");
CREATE INDEX IF NOT EXISTS "payment_invoice_idx" ON "payments" ("invoice_id");
CREATE INDEX IF NOT EXISTS "payment_paid_at_idx" ON "payments" ("paid_at");
CREATE INDEX IF NOT EXISTS "payment_transaction_ref_idx" ON "payments" ("transaction_reference");
CREATE INDEX IF NOT EXISTS "payment_pos_terminal_idx" ON "payments" ("pos_terminal_id");
CREATE INDEX IF NOT EXISTS "pos_device_id_idx" ON "pos_terminals" ("device_id");
CREATE INDEX IF NOT EXISTS "pos_is_active_idx" ON "pos_terminals" ("is_active");
CREATE INDEX IF NOT EXISTS "students_cpf_idx" ON "students" ("cpf");
CREATE INDEX IF NOT EXISTS "students_guardian_idx" ON "students" ("guardian_id");
CREATE INDEX IF NOT EXISTS "students_name_idx" ON "students" ("full_name");

-- 5. DADOS INICIAIS DE DEMONSTRAÇÃO (SEED)
-- Usuário Administrador (senha inicial: admin123)
INSERT INTO "users" ("id", "name", "email", "password_hash", "role", "is_active")
VALUES (
  '11111111-1111-1111-1111-111111111111',
  'Coordenador Geral (Admin)',
  'admin@cursinhopro.com.br',
  '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy',
  'ADMIN',
  true
)
ON CONFLICT ("email") DO UPDATE SET "password_hash" = EXCLUDED."password_hash";

-- Cursos Demonstrativos
INSERT INTO "courses" ("id", "name", "code", "description", "duration_months", "total_hours", "base_price", "default_enrollment_fee", "is_active")
VALUES
(
  '22222222-2222-2222-2222-222222222222',
  'Extensivo Medicina & Biológicas 2026',
  'EXT-MED-2026',
  'Preparatório aprofundado com foco em vestibulares de alta concorrência.',
  10,
  900,
  1250.00,
  250.00,
  true
),
(
  '33333333-3333-3333-3333-333333333333',
  'Intensivo Enem & Redação Nota 1000',
  'INT-ENEM-2026',
  'Revisão focada nas matrizes de competência do Enem.',
  6,
  450,
  680.00,
  200.00,
  true
)
ON CONFLICT ("code") DO NOTHING;

-- Turma Demonstrativa
INSERT INTO "classes" ("id", "course_id", "name", "shift", "room", "capacity", "start_date", "end_date", "is_active")
VALUES (
  '44444444-4444-4444-4444-444444444444',
  '22222222-2222-2222-2222-222222222222',
  'Turma Alfa - Medicina (Manhã)',
  'MORNING',
  'Auditório 01',
  45,
  '2026-02-01',
  '2026-11-30',
  true
)
ON CONFLICT ("id") DO NOTHING;

-- Responsável Demonstrativo
INSERT INTO "guardians" ("id", "full_name", "cpf", "email", "phone", "relationship", "address")
VALUES (
  '55555555-5555-5555-5555-555555555555',
  'Mariana Alencar Silveira',
  '12345678901',
  'mariana.alencar@email.com',
  '11988887777',
  'Mãe',
  'Av. Paulista, 1500 - Bela Vista, São Paulo - SP'
)
ON CONFLICT ("cpf") DO NOTHING;

-- Aluno Demonstrativo
INSERT INTO "students" ("id", "guardian_id", "full_name", "cpf", "birth_date", "email", "phone", "address")
VALUES (
  '66666666-6666-6666-6666-666666666666',
  '55555555-5555-5555-5555-555555555555',
  'Lucas Silveira Santos',
  '98765432100',
  '2008-05-14',
  'lucas.silveira@email.com',
  '11977776666',
  'Av. Paulista, 1500 - São Paulo - SP'
)
ON CONFLICT ("cpf") DO NOTHING;

-- Matrícula Demonstrativa
INSERT INTO "enrollments" ("id", "enrollment_number", "student_id", "class_id", "status", "enrollment_fee", "is_fee_paid", "discount_percentage", "discount_reason", "enrollment_date")
VALUES (
  '77777777-7777-7777-7777-777777777777',
  'MAT-2026-1001',
  '66666666-6666-6666-6666-666666666666',
  '44444444-4444-4444-4444-444444444444',
  'ACTIVE',
  250.00,
  true,
  10.00,
  'Bolsa Concurso de Mérito 10%',
  now()
)
ON CONFLICT ("enrollment_number") DO NOTHING;

-- Mensalidades de Exemplo (com uma OVERDUE para testar o painel de Inadimplência)
INSERT INTO "invoices" ("id", "enrollment_id", "student_id", "invoice_type", "installment_number", "total_installments", "amount", "discount_amount", "final_amount", "due_date", "status")
VALUES
(
  '88888888-8888-8888-8888-888888888881',
  '77777777-7777-7777-7777-777777777777',
  '66666666-6666-6666-6666-666666666666',
  'TUITION',
  1,
  10,
  1250.00,
  125.00,
  1125.00,
  '2026-02-10',
  'PAID'
),
(
  '88888888-8888-8888-8888-888888888882',
  '77777777-7777-7777-7777-777777777777',
  '66666666-6666-6666-6666-666666666666',
  'TUITION',
  2,
  10,
  1250.00,
  125.00,
  1125.00,
  '2026-03-10',
  'OVERDUE'
),
(
  '88888888-8888-8888-8888-888888888883',
  '77777777-7777-7777-7777-777777777777',
  '66666666-6666-6666-6666-666666666666',
  'TUITION',
  3,
  10,
  1250.00,
  125.00,
  1125.00,
  '2026-04-10',
  'PENDING'
)
ON CONFLICT ("id") DO NOTHING;
