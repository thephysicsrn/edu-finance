import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getTenantBySlug } from "@/lib/tenants";
import { TenantLoginClient } from "./[slug]/login/tenant-login-client";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Call Cursos Isolados - Acesso ao Sistema",
  description:
    "Área de Acesso Restrito da Instituição Call Cursos Isolados. Gestão Escolar & Financeira por Edu.Finance.",
  icons: {
    icon: "/call-logo.png",
    shortcut: "/call-logo.png",
    apple: "/call-logo.png",
  },
};

export default async function HomePage() {
  const session = await auth();

  if (session?.user) {
    if (session.user.role === "GUARDIAN") {
      redirect("/portal-do-responsavel");
    }
    redirect("/dashboard");
  }

  const tenant = getTenantBySlug("call")!;
  return <TenantLoginClient tenant={tenant} />;
}
