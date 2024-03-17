abstract class SQLiteWrapper {
  abstract runQuery(sql: string): void
  abstract listTables(): string[]
  tableExists: (table: string) => boolean = (table) =>
    this.listTables().includes(table)
  abstract getAs<T>(query: string): T[]
}

export { SQLiteWrapper }
