CREATE TYPE "public"."attendance_status" AS ENUM('PRESENT', 'ABSENT', 'JUSTIFIED');--> statement-breakpoint
CREATE TYPE "public"."enrollment_status" AS ENUM('ACTIVE', 'PENDING_PAYMENT', 'SUSPENDED', 'CANCELLED', 'COMPLETED');--> statement-breakpoint
CREATE TYPE "public"."invoice_status" AS ENUM('PENDING', 'PAID', 'OVERDUE', 'CANCELLED');--> statement-breakpoint
CREATE TYPE "public"."invoice_type" AS ENUM('ENROLLMENT_FEE', 'TUITION', 'MATERIAL', 'RENEGOTIATION');--> statement-breakpoint
CREATE TYPE "public"."payment_method" AS ENUM('PIX', 'BOLETO', 'CREDIT_CARD', 'DEBIT_CARD', 'CASH', 'BANK_TRANSFER');--> statement-breakpoint
CREATE TYPE "public"."shift" AS ENUM('MORNING', 'AFTERNOON', 'NIGHT', 'FULL_TIME');--> statement-breakpoint
CREATE TYPE "public"."user_role" AS ENUM('ADMIN', 'SECRETARY', 'TEACHER');--> statement-breakpoint
CREATE TABLE "accounts" (
	"user_id" uuid NOT NULL,
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
--> statement-breakpoint
CREATE TABLE "attendance" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"lesson_id" uuid NOT NULL,
	"student_id" uuid NOT NULL,
	"status" "attendance_status" DEFAULT 'PRESENT' NOT NULL,
	"justification" text,
	"recorded_by" uuid NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "class_teachers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"class_id" uuid NOT NULL,
	"teacher_id" uuid NOT NULL,
	"subject" varchar(100) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "classes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"course_id" uuid NOT NULL,
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
--> statement-breakpoint
CREATE TABLE "courses" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(255) NOT NULL,
	"code" varchar(50) NOT NULL,
	"description" text,
	"duration_months" integer NOT NULL,
	"total_hours" integer,
	"base_price" numeric(10, 2) NOT NULL,
	"default_enrollment_fee" numeric(10, 2) DEFAULT '250.00' NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "courses_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "enrollments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"enrollment_number" varchar(50) NOT NULL,
	"student_id" uuid NOT NULL,
	"class_id" uuid NOT NULL,
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
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "enrollments_enrollment_number_unique" UNIQUE("enrollment_number")
);
--> statement-breakpoint
CREATE TABLE "guardians" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"full_name" varchar(255) NOT NULL,
	"cpf" varchar(14) NOT NULL,
	"rg" varchar(20),
	"email" varchar(255) NOT NULL,
	"phone" varchar(20) NOT NULL,
	"relationship" varchar(50) NOT NULL,
	"address" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "guardians_cpf_unique" UNIQUE("cpf")
);
--> statement-breakpoint
CREATE TABLE "invoices" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"enrollment_id" uuid NOT NULL,
	"student_id" uuid NOT NULL,
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
--> statement-breakpoint
CREATE TABLE "lessons" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"class_id" uuid NOT NULL,
	"teacher_id" uuid NOT NULL,
	"date" date NOT NULL,
	"topic" varchar(255) NOT NULL,
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "payments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"invoice_id" uuid NOT NULL,
	"amount_paid" numeric(10, 2) NOT NULL,
	"penalty_amount" numeric(10, 2) DEFAULT '0.00' NOT NULL,
	"interest_amount" numeric(10, 2) DEFAULT '0.00' NOT NULL,
	"discount_given" numeric(10, 2) DEFAULT '0.00' NOT NULL,
	"total_received" numeric(10, 2) NOT NULL,
	"paid_at" timestamp DEFAULT now() NOT NULL,
	"payment_method" "payment_method" NOT NULL,
	"pos_terminal_id" uuid,
	"card_brand" varchar(50),
	"card_installments" integer DEFAULT 1,
	"authorization_code" varchar(100),
	"transaction_reference" varchar(255),
	"source" varchar(50) DEFAULT 'SMART_POS' NOT NULL,
	"received_by" uuid,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "pos_terminals" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(100) NOT NULL,
	"provider" varchar(50) DEFAULT 'MERCADO_PAGO_POINT' NOT NULL,
	"device_id" varchar(100) NOT NULL,
	"model" varchar(50) DEFAULT 'SmartPOS',
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "pos_terminals_device_id_unique" UNIQUE("device_id")
);
--> statement-breakpoint
CREATE TABLE "sessions" (
	"session_token" varchar(255) PRIMARY KEY NOT NULL,
	"user_id" uuid NOT NULL,
	"expires" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "students" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"guardian_id" uuid,
	"full_name" varchar(255) NOT NULL,
	"cpf" varchar(14),
	"rg" varchar(20),
	"birth_date" date NOT NULL,
	"email" varchar(255),
	"phone" varchar(20),
	"address" text,
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "students_cpf_unique" UNIQUE("cpf")
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(255) NOT NULL,
	"email" varchar(255) NOT NULL,
	"email_verified" timestamp,
	"image" text,
	"password_hash" text,
	"role" "user_role" DEFAULT 'SECRETARY' NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "accounts" ADD CONSTRAINT "accounts_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "attendance" ADD CONSTRAINT "attendance_lesson_id_lessons_id_fk" FOREIGN KEY ("lesson_id") REFERENCES "public"."lessons"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "attendance" ADD CONSTRAINT "attendance_student_id_students_id_fk" FOREIGN KEY ("student_id") REFERENCES "public"."students"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "attendance" ADD CONSTRAINT "attendance_recorded_by_users_id_fk" FOREIGN KEY ("recorded_by") REFERENCES "public"."users"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "class_teachers" ADD CONSTRAINT "class_teachers_class_id_classes_id_fk" FOREIGN KEY ("class_id") REFERENCES "public"."classes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "class_teachers" ADD CONSTRAINT "class_teachers_teacher_id_users_id_fk" FOREIGN KEY ("teacher_id") REFERENCES "public"."users"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "classes" ADD CONSTRAINT "classes_course_id_courses_id_fk" FOREIGN KEY ("course_id") REFERENCES "public"."courses"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "enrollments" ADD CONSTRAINT "enrollments_student_id_students_id_fk" FOREIGN KEY ("student_id") REFERENCES "public"."students"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "enrollments" ADD CONSTRAINT "enrollments_class_id_classes_id_fk" FOREIGN KEY ("class_id") REFERENCES "public"."classes"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_enrollment_id_enrollments_id_fk" FOREIGN KEY ("enrollment_id") REFERENCES "public"."enrollments"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_student_id_students_id_fk" FOREIGN KEY ("student_id") REFERENCES "public"."students"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lessons" ADD CONSTRAINT "lessons_class_id_classes_id_fk" FOREIGN KEY ("class_id") REFERENCES "public"."classes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lessons" ADD CONSTRAINT "lessons_teacher_id_users_id_fk" FOREIGN KEY ("teacher_id") REFERENCES "public"."users"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payments" ADD CONSTRAINT "payments_invoice_id_invoices_id_fk" FOREIGN KEY ("invoice_id") REFERENCES "public"."invoices"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payments" ADD CONSTRAINT "payments_pos_terminal_id_pos_terminals_id_fk" FOREIGN KEY ("pos_terminal_id") REFERENCES "public"."pos_terminals"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payments" ADD CONSTRAINT "payments_received_by_users_id_fk" FOREIGN KEY ("received_by") REFERENCES "public"."users"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "students" ADD CONSTRAINT "students_guardian_id_guardians_id_fk" FOREIGN KEY ("guardian_id") REFERENCES "public"."guardians"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "account_user_id_idx" ON "accounts" USING btree ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "unique_attendance_per_lesson_idx" ON "attendance" USING btree ("lesson_id","student_id");--> statement-breakpoint
CREATE INDEX "attendance_student_idx" ON "attendance" USING btree ("student_id");--> statement-breakpoint
CREATE UNIQUE INDEX "unique_class_teacher_subject_idx" ON "class_teachers" USING btree ("class_id","teacher_id","subject");--> statement-breakpoint
CREATE INDEX "classes_course_id_idx" ON "classes" USING btree ("course_id");--> statement-breakpoint
CREATE INDEX "classes_is_active_idx" ON "classes" USING btree ("is_active");--> statement-breakpoint
CREATE INDEX "enrollment_student_idx" ON "enrollments" USING btree ("student_id");--> statement-breakpoint
CREATE INDEX "enrollment_class_idx" ON "enrollments" USING btree ("class_id");--> statement-breakpoint
CREATE INDEX "enrollment_status_idx" ON "enrollments" USING btree ("status");--> statement-breakpoint
CREATE UNIQUE INDEX "unique_student_active_class_idx" ON "enrollments" USING btree ("student_id","class_id");--> statement-breakpoint
CREATE INDEX "guardians_cpf_idx" ON "guardians" USING btree ("cpf");--> statement-breakpoint
CREATE INDEX "guardians_email_idx" ON "guardians" USING btree ("email");--> statement-breakpoint
CREATE INDEX "invoice_student_idx" ON "invoices" USING btree ("student_id");--> statement-breakpoint
CREATE INDEX "invoice_due_date_idx" ON "invoices" USING btree ("due_date");--> statement-breakpoint
CREATE INDEX "invoice_status_idx" ON "invoices" USING btree ("status");--> statement-breakpoint
CREATE INDEX "invoice_enrollment_idx" ON "invoices" USING btree ("enrollment_id");--> statement-breakpoint
CREATE INDEX "invoice_gateway_id_idx" ON "invoices" USING btree ("gateway_invoice_id");--> statement-breakpoint
CREATE INDEX "invoice_type_idx" ON "invoices" USING btree ("invoice_type");--> statement-breakpoint
CREATE UNIQUE INDEX "unique_installment_enrollment_idx" ON "invoices" USING btree ("enrollment_id","installment_number");--> statement-breakpoint
CREATE INDEX "lessons_class_date_idx" ON "lessons" USING btree ("class_id","date");--> statement-breakpoint
CREATE INDEX "payment_invoice_idx" ON "payments" USING btree ("invoice_id");--> statement-breakpoint
CREATE INDEX "payment_paid_at_idx" ON "payments" USING btree ("paid_at");--> statement-breakpoint
CREATE INDEX "payment_transaction_ref_idx" ON "payments" USING btree ("transaction_reference");--> statement-breakpoint
CREATE INDEX "payment_pos_terminal_idx" ON "payments" USING btree ("pos_terminal_id");--> statement-breakpoint
CREATE INDEX "pos_device_id_idx" ON "pos_terminals" USING btree ("device_id");--> statement-breakpoint
CREATE INDEX "pos_is_active_idx" ON "pos_terminals" USING btree ("is_active");--> statement-breakpoint
CREATE INDEX "students_cpf_idx" ON "students" USING btree ("cpf");--> statement-breakpoint
CREATE INDEX "students_guardian_idx" ON "students" USING btree ("guardian_id");--> statement-breakpoint
CREATE INDEX "students_name_idx" ON "students" USING btree ("full_name");