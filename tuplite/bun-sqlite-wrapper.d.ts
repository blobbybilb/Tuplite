/// <reference types="bun-types" />
import type { TupliteItem } from "./types";
import { SQLiteWrapper } from "./wrapper";
import { Database } from "bun:sqlite";
export declare class BunSQLite extends SQLiteWrapper {
    dbPath: string;
    db: Database;
    constructor(path?: string);
    runQuery(sql: string): void;
    listTables(): string[];
    tableExists: (table: string) => boolean;
    getAsItems<T extends TupliteItem>(table: string, query: string): T[];
}
