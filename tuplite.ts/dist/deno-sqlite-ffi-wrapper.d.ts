import { SQLiteWrapper } from "./wrapper.ts";
import { Database } from "jsr:@db/sqlite@0.11";
export declare class DenoSQLiteFFIWrapper extends SQLiteWrapper {
    dbPath: string;
    db: Database;
    constructor(path?: string);
    runQuery(sql: string): void;
    listTables(): string[];
    tableExists: (table: string) => boolean;
    getAs<T>(query: string): T[];
}
