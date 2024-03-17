// @ts-ignore
import { SQLiteWrapper } from "./wrapper.ts";
// @ts-ignore
import { DB } from "https://deno.land/x/sqlite/mod.ts";
export class DenoSQLiteWASMWrapper extends SQLiteWrapper {
    dbPath;
    db;
    constructor(path) {
        super();
        this.dbPath = path ?? ":memory:"; // check this later, it works though
        this.db = new DB(path, { mode: "create" });
        this.db.execute("PRAGMA journal_mode = WAL;");
    }
    runQuery(sql) {
        this.db.query(sql);
    }
    listTables() {
        return this.db
            .queryEntries("SELECT name FROM sqlite_master WHERE type='table'")
            .map((e) => e.name);
    }
    //   tableExists = (table: string) =>
    //     this.db.prepareQuery(
    //         "SELECT name FROM sqlite_master WHERE type='table' AND name=?",
    //       ).first(table)
    //       ? true
    //       : false;
    getAs(query) {
        return this.db.queryEntries(query);
    }
}
