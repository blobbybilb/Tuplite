import type { TupliteItem } from "./types.ts"
import { SQLiteWrapper } from "./wrapper.ts"
import { Database } from "jsr:@db/sqlite@0.11"

export class DenoSQLiteFFIWrapper extends SQLiteWrapper {
  dbPath: string
  db: Database

  constructor(path?: string) {
    super()
    this.dbPath = path ?? ":memory:"
    this.db = new Database(this.dbPath, { create: true })
    this.db.exec("PRAGMA journal_mode = WAL;")
  }

  runQuery(sql: string): void {
    this.db.prepare(sql).run()
  }

  listTables(): string[] {
    return this.db
      .prepare("SELECT name FROM sqlite_master WHERE type='table'")
      .all()
      .map((e: any) => e.name) as string[]
  }

  tableExists = (table: string) =>
    this.db
      .prepare("SELECT name FROM sqlite_master WHERE type='table' AND name=?")
      .get(table)
      ? true
      : false

  getAsItems<T extends TupliteItem>(query: string): T[] {
    return this.db.prepare(query).all() as T[]
  }
}
