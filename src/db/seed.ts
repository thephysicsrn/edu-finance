import { db } from "./index";
import {
  users,
  courses,
  classes,
  guardians,
  students,
  enrollments,
  invoices,
} from "./schema";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";

async function main() {
  console.log("🌱 Iniciando Database Seed...");

  // 1. Usuários de Acesso com Perfis RBAC
  const passwordHash = await bcrypt.hash("admin123", 10);

  const [adminUser] = await db
    .insert(users)
    .values({
      name: "Coordenador Geral (Admin)",
      email: "admin@cursinhopro.com.br",
      passwordHash,
      role: "ADMIN",
    })
    .onConflictDoUpdate({
      target: users.email,
      set: { name: "Coordenador Geral (Admin)", role: "ADMIN" },
    })
    .returning();

  const [secretaryUser] = await db
    .insert(users)
    .values({
      name: "Secretaria de Atendimento",
      email: "secretaria@cursinhopro.com.br",
      passwordHash: await bcrypt.hash("secretaria123", 10),
      role: "SECRETARY",
    })
    .onConflictDoUpdate({
      target: users.email,
      set: { role: "SECRETARY" },
    })
    .returning();

  const [teacherUser] = await db
    .insert(users)
    .values({
      name: "Prof. Carlos Eduardo (Física)",
      email: "professor@cursinhopro.com.br",
      passwordHash: await bcrypt.hash("prof123", 10),
      role: "TEACHER",
    })
    .onConflictDoUpdate({
      target: users.email,
      set: { role: "TEACHER" },
    })
    .returning();

  console.log("✅ Usuários criados com sucesso.");

  // 2. Cursos Preparatórios
  const [courseMed] = await db
    .insert(courses)
    .values({
      name: "Extensivo Medicina & Biológicas",
      code: "EXT-MED-2026",
      description: "Preparatório aprofundado com foco em vestibulares de alta concorrência.",
      durationMonths: 10,
      totalHours: 900,
      basePrice: "1250.00",
      isActive: true,
    })
    .onConflictDoNothing()
    .returning();

  const [courseEnem] = await db
    .insert(courses)
    .values({
      name: "Intensivo Enem Noturno",
      code: "INT-ENEM-2026",
      description: "Revisão focada nas matrizes de competência do Enem e Redação Nota 1000.",
      durationMonths: 6,
      totalHours: 450,
      basePrice: "680.00",
      isActive: true,
    })
    .onConflictDoNothing()
    .returning();

  console.log("✅ Cursos criados.");

  const currentCourse = courseMed || (await db.query.courses.findFirst());
  if (!currentCourse) return;

  // 3. Turmas
  const [classMedA] = await db
    .insert(classes)
    .values({
      courseId: currentCourse.id,
      name: "Turma Alfa - Medicina (Manhã)",
      shift: "MORNING",
      room: "Auditório 01",
      capacity: 45,
      startDate: "2026-02-01",
      endDate: "2026-11-30",
      isActive: true,
    })
    .returning();

  console.log("✅ Turma criada.");

  // 4. Responsável e Aluno Exemplo
  const [guardianDemo] = await db
    .insert(guardians)
    .values({
      fullName: "Mariana Alencar Silveira",
      cpf: "12345678901",
      email: "mariana.alencar@email.com",
      phone: "11988887777",
      relationship: "Mãe",
      address: "Av. Paulista, 1500 - Bela Vista, São Paulo - SP",
    })
    .returning();

  const [studentDemo] = await db
    .insert(students)
    .values({
      guardianId: guardianDemo.id,
      fullName: "Lucas Silveira Santos",
      cpf: "98765432100",
      birthDate: "2008-05-14",
      email: "lucas.silveira@email.com",
      phone: "11977776666",
      address: "Av. Paulista, 1500 - São Paulo - SP",
    })
    .returning();

  // 5. Matrícula com 10% de bolsa de mérito
  const [enrollmentDemo] = await db
    .insert(enrollments)
    .values({
      enrollmentNumber: "MAT-2026-1001",
      studentId: studentDemo.id,
      classId: classMedA.id,
      status: "ACTIVE",
      discountPercentage: "10.00",
      discountReason: "Bolsa Concurso de Bolsas 10%",
    })
    .returning();

  // 6. Mensalidades com uma Parcela Vencida (OVERDUE) para testar a query de inadimplência
  await db.insert(invoices).values([
    {
      enrollmentId: enrollmentDemo.id,
      studentId: studentDemo.id,
      installmentNumber: 1,
      totalInstallments: 10,
      amount: "1250.00",
      discountAmount: "125.00",
      finalAmount: "1125.00",
      dueDate: "2026-02-10",
      status: "PAID",
    },
    {
      enrollmentId: enrollmentDemo.id,
      studentId: studentDemo.id,
      installmentNumber: 2,
      totalInstallments: 10,
      amount: "1250.00",
      discountAmount: "125.00",
      finalAmount: "1125.00",
      dueDate: "2026-03-10",
      status: "OVERDUE", // Em atraso!
    },
    {
      enrollmentId: enrollmentDemo.id,
      studentId: studentDemo.id,
      installmentNumber: 3,
      totalInstallments: 10,
      amount: "1250.00",
      discountAmount: "125.00",
      finalAmount: "1125.00",
      dueDate: "2026-04-10",
      status: "PENDING",
    },
  ]);

  console.log("✅ Mensalidades de teste geradas.");
  console.log("🚀 Database Seed Concluído com Sucesso!");
  process.exit(0);
}

main().catch((err) => {
  console.error("❌ Falha no Seed:", err);
  process.exit(1);
});

