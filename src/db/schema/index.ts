import {
  pgTable,
  pgEnum,
  uuid,
  varchar,
  text,
  timestamp,
  date,
  integer,
  decimal,
  boolean,
  index,
  uniqueIndex,
  primaryKey,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// ==========================================
// 1. ENUMS NATIVOS (PostgreSQL)
// ==========================================

export const userRoleEnum = pgEnum("user_role", [
  "ADMIN",
  "SECRETARY",
  "TEACHER",
  "GUARDIAN",
]);

export const enrollmentStatusEnum = pgEnum("enrollment_status", [
  "ACTIVE",
  "PENDING_PAYMENT",
  "SUSPENDED",
  "CANCELLED",
  "COMPLETED",
]);

export const shiftEnum = pgEnum("shift", [
  "MORNING",
  "AFTERNOON",
  "NIGHT",
  "FULL_TIME",
]);

export const attendanceStatusEnum = pgEnum("attendance_status", [
  "PRESENT",
  "ABSENT",
  "JUSTIFIED",
]);

export const invoiceStatusEnum = pgEnum("invoice_status", [
  "PENDING",
  "PAID",
  "OVERDUE",
  "CANCELLED",
]);

export const invoiceTypeEnum = pgEnum("invoice_type", [
  "ENROLLMENT_FEE", // Taxa de Matrícula / Inscrição
  "TUITION",        // Mensalidade Regular do Cursinho
  "MATERIAL",       // Apostilas / Material Didático
  "RENEGOTIATION",  // Acordo / Renegociação
]);

export const paymentMethodEnum = pgEnum("payment_method", [
  "PIX",
  "BOLETO",
  "CREDIT_CARD",
  "DEBIT_CARD",
  "CASH",
  "BANK_TRANSFER",
]);

// ==========================================
// 2. MÓDULO DE AUTENTICAÇÃO E USUÁRIOS (Auth.js v5)
// ==========================================

export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  emailVerified: timestamp("email_verified", { mode: "date" }),
  image: text("image"),
  passwordHash: text("password_hash"),
  role: userRoleEnum("role").default("SECRETARY").notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const accounts = pgTable(
  "accounts",
  {
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    type: varchar("type", { length: 255 }).notNull(),
    provider: varchar("provider", { length: 255 }).notNull(),
    providerAccountId: varchar("provider_account_id", { length: 255 }).notNull(),
    refresh_token: text("refresh_token"),
    access_token: text("access_token"),
    expires_at: integer("expires_at"),
    token_type: varchar("token_type", { length: 255 }),
    scope: varchar("scope", { length: 255 }),
    id_token: text("id_token"),
    session_state: varchar("session_state", { length: 255 }),
  },
  (account) => [
    primaryKey({ columns: [account.provider, account.providerAccountId] }),
    index("account_user_id_idx").on(account.userId),
  ]
);

export const sessions = pgTable("sessions", {
  sessionToken: varchar("session_token", { length: 255 }).primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  expires: timestamp("expires", { mode: "date" }).notNull(),
});

// ==========================================
// 3. MÓDULO ACADÊMICO
// ==========================================

export const guardians = pgTable(
  "guardians",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    fullName: varchar("full_name", { length: 255 }).notNull(),
    cpf: varchar("cpf", { length: 14 }).notNull().unique(),
    rg: varchar("rg", { length: 20 }),
    email: varchar("email", { length: 255 }).notNull(),
    phone: varchar("phone", { length: 20 }).notNull(),
    relationship: varchar("relationship", { length: 50 }).notNull(),
    address: text("address"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => [
    index("guardians_cpf_idx").on(table.cpf),
    index("guardians_email_idx").on(table.email),
  ]
);

export const students = pgTable(
  "students",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    guardianId: uuid("guardian_id").references(() => guardians.id, {
      onDelete: "restrict",
    }),
    fullName: varchar("full_name", { length: 255 }).notNull(),
    cpf: varchar("cpf", { length: 14 }).unique(),
    rg: varchar("rg", { length: 20 }),
    birthDate: date("birth_date").notNull(),
    email: varchar("email", { length: 255 }),
    phone: varchar("phone", { length: 20 }),
    address: text("address"),
    notes: text("notes"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => [
    index("students_cpf_idx").on(table.cpf),
    index("students_guardian_idx").on(table.guardianId),
    index("students_name_idx").on(table.fullName),
  ]
);

export const courses = pgTable("courses", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  code: varchar("code", { length: 50 }).notNull().unique(),
  description: text("description"),
  durationMonths: integer("duration_months").notNull(),
  totalHours: integer("total_hours"),
  basePrice: decimal("base_price", { precision: 10, scale: 2 }).notNull(),
  defaultEnrollmentFee: decimal("default_enrollment_fee", { precision: 10, scale: 2 })
    .default("250.00")
    .notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const classes = pgTable(
  "classes",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    courseId: uuid("course_id")
      .notNull()
      .references(() => courses.id, { onDelete: "restrict" }),
    name: varchar("name", { length: 255 }).notNull(),
    shift: shiftEnum("shift").notNull(),
    room: varchar("room", { length: 100 }).notNull(),
    capacity: integer("capacity").notNull(),
    startDate: date("start_date").notNull(),
    endDate: date("end_date").notNull(),
    isActive: boolean("is_active").default(true).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => [
    index("classes_course_id_idx").on(table.courseId),
    index("classes_is_active_idx").on(table.isActive),
  ]
);

export const classTeachers = pgTable(
  "class_teachers",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    classId: uuid("class_id")
      .notNull()
      .references(() => classes.id, { onDelete: "cascade" }),
    teacherId: uuid("teacher_id")
      .notNull()
      .references(() => users.id, { onDelete: "restrict" }),
    subject: varchar("subject", { length: 100 }).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("unique_class_teacher_subject_idx").on(
      table.classId,
      table.teacherId,
      table.subject
    ),
  ]
);

export const enrollments = pgTable(
  "enrollments",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    enrollmentNumber: varchar("enrollment_number", { length: 50 }).notNull().unique(),
    studentId: uuid("student_id")
      .notNull()
      .references(() => students.id, { onDelete: "restrict" }),
    classId: uuid("class_id")
      .notNull()
      .references(() => classes.id, { onDelete: "restrict" }),
    status: enrollmentStatusEnum("status").default("ACTIVE").notNull(),
    enrollmentFee: decimal("enrollment_fee", { precision: 10, scale: 2 })
      .default("0.00")
      .notNull(),
    isFeePaid: boolean("is_fee_paid").default(false).notNull(),
    materialFee: decimal("material_fee", { precision: 10, scale: 2 })
      .default("0.00")
      .notNull(),
    materialInstallments: integer("material_installments").default(1).notNull(),
    discountPercentage: decimal("discount_percentage", {
      precision: 5,
      scale: 2,
    }).default("0.00").notNull(),
    discountReason: text("discount_reason"),
    enrollmentDate: timestamp("enrollment_date").defaultNow().notNull(),
    confirmedAt: timestamp("confirmed_at"),
    cancelledAt: timestamp("cancelled_at"),
    cancellationReason: text("cancellation_reason"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => [
    index("enrollment_student_idx").on(table.studentId),
    index("enrollment_class_idx").on(table.classId),
    index("enrollment_status_idx").on(table.status),
    uniqueIndex("unique_student_active_class_idx").on(
      table.studentId,
      table.classId
    ),
  ]
);

export const lessons = pgTable(
  "lessons",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    classId: uuid("class_id")
      .notNull()
      .references(() => classes.id, { onDelete: "cascade" }),
    teacherId: uuid("teacher_id")
      .notNull()
      .references(() => users.id, { onDelete: "restrict" }),
    date: date("date").notNull(),
    topic: varchar("topic", { length: 255 }).notNull(),
    notes: text("notes"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    index("lessons_class_date_idx").on(table.classId, table.date),
  ]
);

export const attendance = pgTable(
  "attendance",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    lessonId: uuid("lesson_id")
      .notNull()
      .references(() => lessons.id, { onDelete: "cascade" }),
    studentId: uuid("student_id")
      .notNull()
      .references(() => students.id, { onDelete: "cascade" }),
    status: attendanceStatusEnum("status").default("PRESENT").notNull(),
    justification: text("justification"),
    recordedBy: uuid("recorded_by")
      .notNull()
      .references(() => users.id, { onDelete: "restrict" }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("unique_attendance_per_lesson_idx").on(
      table.lessonId,
      table.studentId
    ),
    index("attendance_student_idx").on(table.studentId),
  ]
);

// ==========================================
// 4. MÓDULO FINANCEIRO & SMARTPOS (MAQUININHAS)
// ==========================================

export const posTerminals = pgTable(
  "pos_terminals",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    name: varchar("name", { length: 100 }).notNull(), // Ex: "Maquininha Balcão 1"
    provider: varchar("provider", { length: 50 }).default("MERCADO_PAGO_POINT").notNull(), // MERCADO_PAGO_POINT, STONE, PAGBANK
    deviceId: varchar("device_id", { length: 100 }).notNull().unique(), // Serial Number / ID do dispositivo
    model: varchar("model", { length: 50 }).default("SmartPOS"), // SmartPOS, Point Pro 2, etc.
    isActive: boolean("is_active").default(true).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => [
    index("pos_device_id_idx").on(table.deviceId),
    index("pos_is_active_idx").on(table.isActive),
  ]
);

export const invoices = pgTable(
  "invoices",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    enrollmentId: uuid("enrollment_id")
      .notNull()
      .references(() => enrollments.id, { onDelete: "restrict" }),
    studentId: uuid("student_id")
      .notNull()
      .references(() => students.id, { onDelete: "restrict" }),
    invoiceType: invoiceTypeEnum("invoice_type").default("TUITION").notNull(),
    installmentNumber: integer("installment_number").notNull(),
    totalInstallments: integer("total_installments").notNull(),
    amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
    discountAmount: decimal("discount_amount", { precision: 10, scale: 2 })
      .default("0.00")
      .notNull(),
    finalAmount: decimal("final_amount", { precision: 10, scale: 2 }).notNull(),
    tuitionAmount: decimal("tuition_amount", { precision: 10, scale: 2 }),
    materialAmount: decimal("material_amount", { precision: 10, scale: 2 })
      .default("0.00")
      .notNull(),
    isUnified: boolean("is_unified").default(false).notNull(),
    unifiedDetails: text("unified_details"),
    dueDate: date("due_date").notNull(),
    status: invoiceStatusEnum("status").default("PENDING").notNull(),

    // Campos de Integração com Gateways e SmartPOS
    gateway: varchar("gateway", { length: 50 }).default("INTERNAL").notNull(),
    gatewayInvoiceId: varchar("gateway_invoice_id", { length: 255 }),
    gatewayPaymentUrl: text("gateway_payment_url"),
    barcode: varchar("barcode", { length: 100 }),
    pixCopiaECola: text("pix_copia_e_cola"),
    pixQrCodeUrl: text("pix_qrcode_url"),
    lastSyncedAt: timestamp("last_synced_at"),

    notes: text("notes"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => [
    index("invoice_student_idx").on(table.studentId),
    index("invoice_due_date_idx").on(table.dueDate),
    index("invoice_status_idx").on(table.status),
    index("invoice_enrollment_idx").on(table.enrollmentId),
    index("invoice_gateway_id_idx").on(table.gatewayInvoiceId),
    index("invoice_type_idx").on(table.invoiceType),
    uniqueIndex("unique_installment_enrollment_idx").on(
      table.enrollmentId,
      table.installmentNumber
    ),
  ]
);

export const payments = pgTable(
  "payments",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    invoiceId: uuid("invoice_id")
      .notNull()
      .references(() => invoices.id, { onDelete: "restrict" }),
    amountPaid: decimal("amount_paid", { precision: 10, scale: 2 }).notNull(),
    penaltyAmount: decimal("penalty_amount", { precision: 10, scale: 2 })
      .default("0.00")
      .notNull(),
    interestAmount: decimal("interest_amount", { precision: 10, scale: 2 })
      .default("0.00")
      .notNull(),
    discountGiven: decimal("discount_given", { precision: 10, scale: 2 })
      .default("0.00")
      .notNull(),
    totalReceived: decimal("total_received", { precision: 10, scale: 2 }).notNull(),
    paidAt: timestamp("paid_at").defaultNow().notNull(),
    paymentMethod: paymentMethodEnum("payment_method").notNull(),
    
    // Dados da Maquininha (SmartPOS)
    posTerminalId: uuid("pos_terminal_id").references(() => posTerminals.id, {
      onDelete: "set null",
    }),
    cardBrand: varchar("card_brand", { length: 50 }),          // Visa, Mastercard, Elo, etc.
    cardInstallments: integer("card_installments").default(1),  // 1x, 2x, 3x...
    authorizationCode: varchar("authorization_code", { length: 100 }), // Código de Autorização do banco
    transactionReference: varchar("transaction_reference", { length: 255 }), // NSU / ID da Transação
    source: varchar("source", { length: 50 }).default("SMART_POS").notNull(), // SMART_POS, GATEWAY_WEBHOOK, MANUAL

    receivedBy: uuid("received_by")
      .references(() => users.id, { onDelete: "restrict" }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    index("payment_invoice_idx").on(table.invoiceId),
    index("payment_paid_at_idx").on(table.paidAt),
    index("payment_transaction_ref_idx").on(table.transactionReference),
    index("payment_pos_terminal_idx").on(table.posTerminalId),
  ]
);

export const classTransfers = pgTable(
  "class_transfers",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    studentId: uuid("student_id")
      .notNull()
      .references(() => students.id, { onDelete: "cascade" }),
    enrollmentId: uuid("enrollment_id")
      .references(() => enrollments.id, { onDelete: "set null" }),
    fromClassId: uuid("from_class_id")
      .notNull()
      .references(() => classes.id, { onDelete: "restrict" }),
    toClassId: uuid("to_class_id")
      .notNull()
      .references(() => classes.id, { onDelete: "restrict" }),
    reason: text("reason"),
    transferredAt: timestamp("transferred_at").defaultNow().notNull(),
    transferredBy: uuid("transferred_by")
      .references(() => users.id, { onDelete: "set null" }),
  },
  (table) => [
    index("transfers_student_idx").on(table.studentId),
    index("transfers_from_class_idx").on(table.fromClassId),
    index("transfers_to_class_idx").on(table.toClassId),
  ]
);

// ==========================================
// 5. RELACIONAMENTOS (Drizzle Relations API)
// ==========================================

export const usersRelations = relations(users, ({ many }) => ({
  accounts: many(accounts),
  sessions: many(sessions),
  taughtClasses: many(classTeachers),
  givenLessons: many(lessons),
  registeredPayments: many(payments),
}));

export const guardiansRelations = relations(guardians, ({ many }) => ({
  students: many(students),
}));

export const studentsRelations = relations(students, ({ one, many }) => ({
  guardian: one(guardians, {
    fields: [students.guardianId],
    references: [guardians.id],
  }),
  enrollments: many(enrollments),
  invoices: many(invoices),
  attendances: many(attendance),
}));

export const coursesRelations = relations(courses, ({ many }) => ({
  classes: many(classes),
}));

export const classesRelations = relations(classes, ({ one, many }) => ({
  course: one(courses, {
    fields: [classes.courseId],
    references: [courses.id],
  }),
  teachers: many(classTeachers),
  enrollments: many(enrollments),
  lessons: many(lessons),
}));

export const classTeachersRelations = relations(classTeachers, ({ one }) => ({
  class: one(classes, {
    fields: [classTeachers.classId],
    references: [classes.id],
  }),
  teacher: one(users, {
    fields: [classTeachers.teacherId],
    references: [users.id],
  }),
}));

export const enrollmentsRelations = relations(enrollments, ({ one, many }) => ({
  student: one(students, {
    fields: [enrollments.studentId],
    references: [students.id],
  }),
  class: one(classes, {
    fields: [enrollments.classId],
    references: [classes.id],
  }),
  invoices: many(invoices),
}));

export const lessonsRelations = relations(lessons, ({ one, many }) => ({
  class: one(classes, {
    fields: [lessons.classId],
    references: [classes.id],
  }),
  teacher: one(users, {
    fields: [lessons.teacherId],
    references: [users.id],
  }),
  attendances: many(attendance),
}));

export const attendanceRelations = relations(attendance, ({ one }) => ({
  lesson: one(lessons, {
    fields: [attendance.lessonId],
    references: [lessons.id],
  }),
  student: one(students, {
    fields: [attendance.studentId],
    references: [students.id],
  }),
  recorder: one(users, {
    fields: [attendance.recordedBy],
    references: [users.id],
  }),
}));

export const invoicesRelations = relations(invoices, ({ one, many }) => ({
  enrollment: one(enrollments, {
    fields: [invoices.enrollmentId],
    references: [enrollments.id],
  }),
  student: one(students, {
    fields: [invoices.studentId],
    references: [students.id],
  }),
  payments: many(payments),
}));

export const posTerminalsRelations = relations(posTerminals, ({ many }) => ({
  payments: many(payments),
}));

export const paymentsRelations = relations(payments, ({ one }) => ({
  invoice: one(invoices, {
    fields: [payments.invoiceId],
    references: [invoices.id],
  }),
  terminal: one(posTerminals, {
    fields: [payments.posTerminalId],
    references: [posTerminals.id],
  }),
  receiver: one(users, {
    fields: [payments.receivedBy],
    references: [users.id],
  }),
}));

export const classTransfersRelations = relations(classTransfers, ({ one }) => ({
  student: one(students, {
    fields: [classTransfers.studentId],
    references: [students.id],
  }),
  fromClass: one(classes, {
    fields: [classTransfers.fromClassId],
    references: [classes.id],
  }),
  toClass: one(classes, {
    fields: [classTransfers.toClassId],
    references: [classes.id],
  }),
  transferredByUser: one(users, {
    fields: [classTransfers.transferredBy],
    references: [users.id],
  }),
}));
