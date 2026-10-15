import { mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import Database from "better-sqlite3";
import { drizzle, type BetterSQLite3Database } from "drizzle-orm/better-sqlite3";
import { migrate } from "drizzle-orm/better-sqlite3/migrator";
import { config } from "@loiha/config";
import * as schema from "./schema.ts";

export * from "./schema.ts";
export { schema };

export type Db = BetterSQLite3Database<typeof schema> & { $client: Database.Database };

const MIGRATIONS_DIR = join(dirname(fileURLToPath(import.meta.url)), "..", "drizzle");

export function createDb(path: string = config.databasePath): Db {
  if (path !== ":memory:") mkdirSync(dirname(path), { recursive: true });
  const sqlite = new Database(path);
  sqlite.pragma("journal_mode = WAL");
  sqlite.pragma("foreign_keys = ON");
  sqlite.pragma("busy_timeout = 5000");
  return drizzle(sqlite, { schema }) as Db;
}

export function runMigrations(db: Db): void {
  migrate(db, { migrationsFolder: MIGRATIONS_DIR });
}

let shared: Db | undefined;

/** Jarayon bo'yicha yagona ulanish; birinchi chaqiruvda migratsiyalarni qo'llaydi. */
export function getDb(): Db {
  if (!shared) {
    shared = createDb();
    runMigrations(shared);
  }
  return shared;
}
