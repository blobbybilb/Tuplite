// @ts-ignore
import { SQLiteWrapper } from "./wrapper.ts"
// @ts-ignore
import { DB } from "https://deno.land/x/sqlite/mod.ts"

export class DenoSQLiteWASMWrapper extends SQLiteWrapper {
  dbPath: string
  db: DB

  constructor(path?: string) {
    super()
    this.dbPath = path ?? ":memory:" // check this later, it works though
    this.db = new DB(path, { mode: "create" })
    this.db.execute("PRAGMA journal_mode = WAL;")
  }

  runQuery(sql: string): void {
    this.db.query(sql)
  }

  listTables(): string[] {
    return this.db
      .queryEntries("SELECT name FROM sqlite_master WHERE type='table'")
      .map((e: any) => e.name) as string[]
  }

  //   tableExists = (table: string) =>
  //     this.db.prepareQuery(
  //         "SELECT name FROM sqlite_master WHERE type='table' AND name=?",
  //       ).first(table)
  //       ? true
  //       : false;

  getAs<T>(query: string): T[] {
    return this.db.queryEntries(query) as unknown as T[]
  }
}
