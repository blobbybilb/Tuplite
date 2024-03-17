import { SQLiteWrapper } from "./wrapper.js";
import BetterSqlite3 from "better-sqlite3";
export class BetterSQLiteWrapper extends SQLiteWrapper {
    dbPath;
    db;
    constructor(path) {
        super();
        this.dbPath = path ?? ":memory:";
        this.db = new BetterSqlite3(this.dbPath);
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
