import type { TupliteItem } from "./types.js"
import { SQLiteWrapper } from "./wrapper.js"
import BetterSqlite3 from "better-sqlite3"

export class BetterSQLiteWrapper extends SQLiteWrapper {
  dbPath: string
  db: BetterSqlite3.Database

  constructor(path?: string) {
    super()
    this.dbPath = path ?? ":memory:"
    this.db = new BetterSqlite3(this.dbPath)
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

  getAs<T>(query: string): T[] {
    return this.db.prepare(query).all() as T[]
  }
}
