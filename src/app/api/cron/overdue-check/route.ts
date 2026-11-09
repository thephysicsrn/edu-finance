import { NextResponse } from "next/server";
import { syncOverdueInvoicesStatus } from "@/modules/financial/queries/defaulters.queries";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  // Opcional: Checar Bearer token de autorização CRON
  const authHeader = request.headers.get("authorization");
  if (
    process.env.CRON_SECRET &&
    authHeader !== `Bearer ${process.env.CRON_SECRET}`
  ) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const result = await syncOverdueInvoicesStatus();

  return NextResponse.json({
    success: true,
    message: "Rotina de virada de inadimplência concluída.",
    updatedCount: result.count,
    timestamp: new Date().toISOString(),
  });
}

