declare abstract class SQLiteWrapper {
    abstract runQuery(sql: string): void;
    abstract listTables(): string[];
    tableExists: (table: string) => boolean;
    abstract getAs<T>(query: string): T[];
}
export { SQLiteWrapper };
