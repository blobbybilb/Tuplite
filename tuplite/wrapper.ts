
import type { TupliteItem } from "./types"

abstract class SQLiteWrapper {
    abstract runQuery(sql: string): void
    abstract listTables(): string[]
    tableExists = (table: string) => this.listTables().includes(table)
    abstract getAsItems<T extends TupliteItem>(table: string, query: string): T[]
}



export { SQLiteWrapper }