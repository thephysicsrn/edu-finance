import { notFound } from "next/navigation";
import { getTenantBySlug } from "@/lib/tenants";
import { TenantLoginClient } from "./tenant-login-client";

interface TenantLoginPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: TenantLoginPageProps) {
  const { slug } = await params;
  const tenant = getTenantBySlug(slug);

  if (!tenant) {
    return {
      title: "Login - Instituição não encontrada",
    };
  }

  return {
    title: `Acesso Restrito - ${tenant.name}`,
    description: `Área restrita de acesso aos professores, secretaria e administração do ${tenant.name}.`,
    icons: {
      icon: tenant.iconUrl || "/call-logo.png",
      shortcut: tenant.iconUrl || "/call-logo.png",
      apple: tenant.iconUrl || "/call-logo.png",
    },
  };
}

export default async function TenantLoginPage({ params }: TenantLoginPageProps) {
  const { slug } = await params;
  const tenant = getTenantBySlug(slug);

  if (!tenant) {
    notFound();
  }

  return <TenantLoginClient tenant={tenant} />;
}
