import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

const connectionString =
  process.env.DATABASE_URL ||
  "postgresql://postgres:postgres@localhost:5432/gestao_escolar";

// Global cache to avoid exhausting connections in Next.js hot-reload development
declare global {
  // eslint-disable-next-line no-var
  var __postgres_client: postgres.Sql | undefined;
}

// Detecção de SSL para Supabase, Google Cloud SQL e ambientes gerenciados
const isSslRequired =
  connectionString.includes("sslmode=require") ||
  connectionString.includes("ssl=true") ||
  connectionString.includes("supabase") ||
  (process.env.NODE_ENV === "production" &&
    !connectionString.includes("localhost") &&
    !connectionString.includes("/cloudsql/"));

// Transaction Poolers como Supavisor (porta 6543) exigem desativação de prepared statements
const isTransactionPooler = connectionString.includes(":6543");

const client =
  global.__postgres_client ||
  postgres(connectionString, {
    max: process.env.NODE_ENV === "production" ? 15 : 10,
    idle_timeout: 20,
    connect_timeout: 15,
    ssl: isSslRequired ? "require" : undefined,
    prepare: isTransactionPooler ? false : true,
  });

if (process.env.NODE_ENV !== "production") {
  global.__postgres_client = client;
}

export const db = drizzle(client, { schema });
export type DatabaseInstance = typeof db;

