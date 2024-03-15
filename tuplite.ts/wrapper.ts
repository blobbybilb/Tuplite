import type { TupliteItem } from "./types.js"

abstract class SQLiteWrapper {
  abstract runQuery(sql: string): void
  abstract listTables(): string[]
  tableExists = (table: string) => this.listTables().includes(table)
  abstract getAsItems<T extends TupliteItem>(query: string): T[]
}

export { SQLiteWrapper }
