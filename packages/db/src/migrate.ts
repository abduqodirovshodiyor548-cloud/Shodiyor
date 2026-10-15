import { config } from "@loiha/config";
import { createDb, runMigrations } from "./index.ts";

const db = createDb();
runMigrations(db);
db.$client.close();
console.log(`Migratsiyalar qo'llandi: ${config.databasePath}`);
