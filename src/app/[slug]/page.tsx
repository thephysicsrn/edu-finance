import { notFound, redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getTenantBySlug } from "@/lib/tenants";
import { TenantLoginClient } from "./login/tenant-login-client";

interface TenantPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: TenantPageProps) {
  const { slug } = await params;
  const tenant = getTenantBySlug(slug);

  if (!tenant) {
    return {
      title: "Instituição não encontrada",
    };
  }

  return {
    title: `${tenant.name} - Acesso ao Sistema`,
    description: `Área de Acesso Restrito da Instituição ${tenant.name}.`,
    icons: {
      icon: tenant.iconUrl || "/call-logo.png",
      shortcut: tenant.iconUrl || "/call-logo.png",
      apple: tenant.iconUrl || "/call-logo.png",
    },
  };
}

export default async function TenantPage({ params }: TenantPageProps) {
  const { slug } = await params;
  const tenant = getTenantBySlug(slug);

  if (!tenant) {
    notFound();
  }

  const session = await auth();
  if (session?.user) {
    if (session.user.role === "GUARDIAN") {
      redirect("/portal-do-responsavel");
    }
    redirect("/dashboard");
  }

  return <TenantLoginClient tenant={tenant} />;
}
