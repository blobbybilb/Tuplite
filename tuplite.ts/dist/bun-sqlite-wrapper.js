import { SQLiteWrapper } from "./wrapper.js";
import { Database } from "bun:sqlite";
export class BunSQLiteWrapper extends SQLiteWrapper {
    dbPath;
    db;
    constructor(path) {
        super();
        this.dbPath = path ?? ":memory:";
        this.db = new Database(this.dbPath, { create: true });
        this.db.exec("PRAGMA journal_mode = WAL;");
    }
    runQuery(sql) {
        this.db.query(sql).run();
    }
    listTables() {
        return this.db
            .query("SELECT name FROM sqlite_master WHERE type='table'")
            .all()
            .map((e) => e.name);
    }
    tableExists = (table) => this.db
        .query("SELECT name FROM sqlite_master WHERE type='table' AND name=?")
        .get(table)
        ? true
        : false;
    getAs(query) {
        return this.db.query(query).all();
    }
}
