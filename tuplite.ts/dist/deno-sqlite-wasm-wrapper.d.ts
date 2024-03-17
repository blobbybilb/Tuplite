import { SQLiteWrapper } from "./wrapper.ts";
import { DB } from "https://deno.land/x/sqlite/mod.ts";
export declare class DenoSQLiteWASMWrapper extends SQLiteWrapper {
    dbPath: string;
    db: DB;
    constructor(path?: string);
    runQuery(sql: string): void;
    listTables(): string[];
    getAs<T>(query: string): T[];
}
