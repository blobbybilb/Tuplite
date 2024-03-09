import type { TupliteItem } from "./types"
import { SQLiteWrapper } from "./wrapper"
import { Database } from "bun:sqlite"

export class BunSQLite extends SQLiteWrapper {
    dbPath: string
    db: Database

    constructor(path?: string) {
        super()
        this.dbPath = path ?? ":memory:"
        this.db = new Database(this.dbPath, { create: true })
        this.db.exec("PRAGMA journal_mode = WAL;");
    }

    runQuery(sql: string): void {
        this.db.query(sql).run()
    }

    listTables(): string[] {
        return this.db.query("SELECT name FROM sqlite_master WHERE type='table'").all().map((e: any) => e.name) as string[]
    }

    tableExists = (table: string) =>
        this.db.query("SELECT name FROM sqlite_master WHERE type='table' AND name=?").get(table) ? true : false

    getAsItems<T extends TupliteItem>(table: string, query: string): T[] {
        return this.db.query(query).all() as T[]
    }
}
