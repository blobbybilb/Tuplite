import { SQLiteWrapper } from "./wrapper.js";
import BetterSqlite3 from "better-sqlite3";
export declare class BetterSQLiteWrapper extends SQLiteWrapper {
    dbPath: string;
    db: BetterSqlite3.Database;
    constructor(path?: string);
    runQuery(sql: string): void;
    listTables(): string[];
    tableExists: (table: string) => boolean;
    getAs<T>(query: string): T[];
}
