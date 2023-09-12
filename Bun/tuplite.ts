import { Database } from "bun:sqlite"

export default class Tuplite {
  dbPath: string
  db: Database

  get tables() {
    const query = 'SELECT name FROM sqlite_master WHERE type="table";';
    const result = this.db.query(query).all();
    return result.map((row) => (row as any).name) as string[];
  }

  private constructor(dbPath: string) {
    this.dbPath = dbPath
    this.db = new Database(this.dbPath)
  }

  static openDb(dbPath: string) {
    return new Tuplite(dbPath)
  }

  static openInMemoryDb() {
    return new Tuplite(":memory:")
  }

  openTable<T>(tableName: string) {
    return new TupliteTable<T>(this.db, tableName)
  }
}

class TupliteTable<T> {
  db: Database
  tableName: string
  created: boolean

  constructor(db: Database, tableName: string) {
    this.db = db
    this.tableName = tableName

    this.created = this.tableExists()
  }

  createTable(tableName: string, columns: string) {
    const createTableQuery = `CREATE TABLE IF NOT EXISTS ${tableName} (${columns});`;
    this.db.exec(createTableQuery);
  }

  private tableExists() {
    const result = this.db.query(`SELECT name FROM sqlite_master WHERE type="table" AND name="${this.tableName}";`).all();
    return result.length > 0
  }

  add(data: T) {

  }

  static getFieldType(
}

type fieldTypes = string | number

export enum TupliteError { AlreadyExists }

const db = Tuplite.openInMemoryDb()
console.log(db.tables)
db.createTable("hi", "test")
console.log(db.tables)
