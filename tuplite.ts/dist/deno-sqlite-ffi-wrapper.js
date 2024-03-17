import { SQLiteWrapper } from "./wrapper.ts";
import { Database } from "jsr:@db/sqlite@0.11";
export class DenoSQLiteFFIWrapper extends SQLiteWrapper {
    dbPath;
    db;
    constructor(path) {
        super();
        this.dbPath = path ?? ":memory:";
        this.db = new Database(this.dbPath, { create: true });
        this.db.exec("PRAGMA journal_mode = WAL;");
    }
    runQuery(sql) {
        this.db.prepare(sql).run();
    }
    listTables() {
        return this.db
            .prepare("SELECT name FROM sqlite_master WHERE type='table'")
            .all()
            .map((e) => e.name);
    }
    tableExists = (table) => this.db
        .prepare("SELECT name FROM sqlite_master WHERE type='table' AND name=?")
        .get(table)
        ? true
        : false;
    getAs(query) {
        return this.db.prepare(query).all();
    }
}
