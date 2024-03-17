/// <reference types="bun-types" resolution-mode="require"/>
import { SQLiteWrapper } from "./wrapper.js";
import { Database } from "bun:sqlite";
export declare class BunSQLiteWrapper extends SQLiteWrapper {
    dbPath: string;
    db: Database;
    constructor(path?: string);
    runQuery(sql: string): void;
    listTables(): string[];
    tableExists: (table: string) => boolean;
    getAs<T>(query: string): T[];
}
