import type { TupliteItem } from "./types";
declare abstract class SQLiteWrapper {
    abstract runQuery(sql: string): void;
    abstract listTables(): string[];
    tableExists: (table: string) => boolean;
    abstract getAsItems<T extends TupliteItem>(table: string, query: string): T[];
}
export { SQLiteWrapper };
