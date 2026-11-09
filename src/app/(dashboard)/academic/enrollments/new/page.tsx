import { db } from "@/db";
import { classes } from "@/db/schema";
import { eq } from "drizzle-orm";
import { EnrollmentForm } from "@/modules/academic/components/enrollment-form";

export const dynamic = "force-dynamic";

export default async function NewEnrollmentPage() {
  let activeClasses: any[] = [];

  try {
    activeClasses = await db.query.classes.findMany({
      where: eq(classes.isActive, true),
      with: {
        course: true,
      },
    });
  } catch (error) {
    console.warn("Database not yet connected or seeded. Using fallback placeholder classes.");
  }

  // Fallback para desenvolvimento e testes visuais imediatos
  if (activeClasses.length === 0) {
    activeClasses = [
      {
        id: "a0000000-0000-0000-0000-000000000001",
        name: "Turma Alfa - Medicina (Manhã)",
        shift: "MORNING",
        capacity: 45,
        course: {
          name: "Extensivo Medicina & Biológicas 2026",
          durationMonths: 10,
          basePrice: "1250.00",
        },
      },
      {
        id: "b0000000-0000-0000-0000-000000000002",
        name: "Turma Beta - Pré-Enem (Noite)",
        shift: "NIGHT",
        capacity: 50,
        course: {
          name: "Intensivo Enem & Redação",
          durationMonths: 6,
          basePrice: "680.00",
        },
      },
    ];
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-slate-900">
          Nova Matrícula
        </h2>
        <p className="text-sm text-slate-500">
          Cadastre o aluno e responsável financeiro para gerar automaticamente o contrato e o plano de parcelas.
        </p>
      </div>

      <EnrollmentForm availableClasses={activeClasses} />
    </div>
  );
}

