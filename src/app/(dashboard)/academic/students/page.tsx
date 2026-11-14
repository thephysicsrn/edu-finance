import { db } from "@/db";
import { students, classes } from "@/db/schema";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, UserPlus } from "lucide-react";
import Link from "next/link";
import { StudentsTable } from "@/modules/academic/components/students-table";

export const dynamic = "force-dynamic";

export default async function StudentsPage() {
  let studentList: any[] = [];
  let availableClasses: any[] = [];

  try {
    const [fetchedStudents, fetchedClasses] = await Promise.all([
      db.query.students.findMany({
        with: {
          guardian: true,
          enrollments: {
            with: {
              class: true,
            },
          },
        },
        limit: 100,
      }),
      db.query.classes.findMany({
        with: {
          course: true,
        },
      }),
    ]);

    studentList = fetchedStudents;
    availableClasses = fetchedClasses;
  } catch (error) {
    console.warn("Database not yet connected or seeded. Showing placeholder student list.");
  }

  // Preenche dados demonstrativos caso ainda não existam no banco
  if (availableClasses.length === 0) {
    availableClasses = [
      {
        id: "demo-cls-1",
        name: "Turma Alfa - Medicina (Manhã)",
        shift: "MORNING",
        capacity: 40,
        course: {
          name: "Extensivo Medicina & Biológicas",
          basePrice: "1250.00",
        },
      },
      {
        id: "demo-cls-2",
        name: "Turma Beta - ITA/IME & Exatas (Tarde)",
        shift: "AFTERNOON",
        capacity: 35,
        course: {
          name: "Preparatório Militar & Exatas",
          basePrice: "1100.00",
        },
      },
      {
        id: "demo-cls-3",
        name: "Turma Gama - Redação Nota 1000 & Linguagens",
        shift: "NIGHT",
        capacity: 30,
        course: {
          name: "Módulo Intensivo de Redação",
          basePrice: "450.00",
        },
      },
    ];
  }

  if (studentList.length === 0) {
    studentList = [
      {
        id: "demo-st-1",
        fullName: "Lucas Silveira Santos",
        cpf: "98765432100",
        birthDate: "2008-05-14",
        email: "lucas.silveira@email.com",
        phone: "11977776666",
        guardian: {
          fullName: "Mariana Alencar Silveira",
          phone: "11988887777",
        },
        enrollments: [
          {
            id: "demo-en-1",
            status: "ACTIVE",
            classId: "demo-cls-1",
            class: {
              id: "demo-cls-1",
              name: "Turma Alfa - Medicina (Manhã)",
              shift: "MORNING",
            },
          },
          {
            id: "demo-en-1b",
            status: "ACTIVE",
            classId: "demo-cls-3",
            class: {
              id: "demo-cls-3",
              name: "Turma Gama - Redação Nota 1000",
              shift: "NIGHT",
            },
          },
        ],
      },
      {
        id: "demo-st-2",
        fullName: "Beatriz Nogueira Ribeiro",
        cpf: "45678912300",
        birthDate: "2007-09-22",
        email: "beatriz.ribeiro@email.com",
        phone: "11966665555",
        guardian: {
          fullName: "Carlos Eduardo Ribeiro",
          phone: "11955554444",
        },
        enrollments: [
          {
            id: "demo-en-2",
            status: "ACTIVE",
            classId: "demo-cls-2",
            class: {
              id: "demo-cls-2",
              name: "Turma Beta - ITA/IME & Exatas (Tarde)",
              shift: "AFTERNOON",
            },
          },
        ],
      },
    ];
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            <Users className="h-6 w-6 text-indigo-600" />
            Alunos & Cadastros
          </h2>
          <p className="text-sm text-slate-500">
            Listagem geral de alunos matriculados, gestão multiturma e transferência de sala.
          </p>
        </div>
        <Link href="/academic/enrollments/new">
          <Button className="gap-2 bg-indigo-600 hover:bg-indigo-700 text-white">
            <UserPlus className="h-4 w-4" />
            Nova Matrícula
          </Button>
        </Link>
      </div>

      <Card className="border-slate-200 shadow-sm">
        <CardHeader className="pb-3 border-b border-slate-100">
          <CardTitle className="text-base text-slate-900">
            Relação Geral de Alunos & Turmas
          </CardTitle>
          <CardDescription>
            Consulte responsáveis, histórico de turmas matriculadas ou efetue a transferência entre turmas.
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-4">
          <StudentsTable
            initialStudents={studentList}
            availableClasses={availableClasses}
          />
        </CardContent>
      </Card>
    </div>
  );
}
