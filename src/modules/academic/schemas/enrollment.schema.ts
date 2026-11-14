import { z } from "zod";

export const createEnrollmentSchema = z
  .object({
    isSelfResponsible: z.boolean().default(false).optional(),

    guardian: z.object({
      fullName: z.string().min(3, "Nome do responsável deve ter pelo menos 3 caracteres"),
      cpf: z
        .string()
        .transform((val) => val.replace(/\D/g, ""))
        .refine((val) => val.length === 11, "CPF do responsável deve conter 11 dígitos"),
      email: z.string().email("E-mail do responsável inválido"),
      phone: z.string().min(10, "Telefone do responsável deve ter DDD + número"),
      relationship: z.string().min(2, "Grau de parentesco é obrigatório (ex: Mãe, Pai, Tutor, Próprio Aluno)"),
      address: z.string().optional(),
    }),

    student: z.object({
      fullName: z.string().min(3, "Nome do aluno deve ter pelo menos 3 caracteres"),
      cpf: z
        .string()
        .transform((val) => val.replace(/\D/g, ""))
        .refine(
          (val) => val.length === 0 || val.length === 11,
          "CPF do aluno deve conter 11 dígitos ou ser deixado em branco"
        )
        .optional(),
      birthDate: z
        .string()
        .regex(/^\d{4}-\d{2}-\d{2}$/, "Data de nascimento inválida (use AAAA-MM-DD)"),
      email: z.string().email("E-mail do aluno inválido").optional().or(z.literal("")),
      phone: z.string().optional(),
      address: z.string().optional(),
    }),

    classId: z.string().uuid("Selecione uma turma válida"),
    
    // Condições Comerciais, Taxa de Matrícula e Material Didático
    enrollmentFee: z.coerce.number().min(0, "Taxa de matrícula não pode ser negativa").default(250),
    materialFee: z.coerce.number().min(0, "Taxa de material não pode ser negativa").default(0),
    materialInstallments: z.coerce.number().int().min(1, "Parcelamento mínimo é 1x").max(12, "Parcelamento máximo é 12x").default(1),
    materialPaymentMode: z.enum([
      "INSTALLMENT_WITH_TUITION", // Parcelado junto com a mensalidade do curso (discriminado)
      "SEPARATE_AT_ENROLLMENT",   // À vista no ato da matrícula
      "INSTALLMENT_SEPARATE",     // Parcelado em parcelas exclusivas de material
    ]).default("INSTALLMENT_WITH_TUITION"),
    unifyWithExistingInvoices: z.boolean().default(true).optional(),
    discountPercentage: z.coerce.number().min(0, "Desconto não pode ser negativo").max(100, "Desconto máximo é 100%").default(0),
    discountReason: z.string().optional(),

    dueDay: z.coerce.number().int().min(1, "Dia mínimo é 1").max(28, "Dia de vencimento deve ser até 28"),
    firstInstallmentDate: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, "Data da 1ª parcela inválida (use AAAA-MM-DD)"),
  })
  .superRefine((data, ctx) => {
    if (data.isSelfResponsible) {
      if (!data.student.cpf || data.student.cpf.length !== 11) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "O CPF do aluno é obrigatório quando ele for o próprio responsável financeiro.",
          path: ["student", "cpf"],
        });
      }
      if (!data.student.email) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "O e-mail do aluno é obrigatório para envio de cobranças e faturas.",
          path: ["student", "email"],
        });
      }
      if (!data.student.phone || data.student.phone.length < 10) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "O telefone/WhatsApp do aluno é obrigatório para notificações financeiras.",
          path: ["student", "phone"],
        });
      }
    }
  });

export type CreateEnrollmentInput = z.infer<typeof createEnrollmentSchema>;
