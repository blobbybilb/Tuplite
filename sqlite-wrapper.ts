import { Database } from "bun:sqlite"

type TupliteValues = string | number | boolean
type TupliteItem = Record<string, TupliteValues>
type QueryItem<T extends TupliteItem> = { [P in keyof T as (string extends P ? never : P)]?: T[P] | ((arg: T[P]) => boolean) }

// interface Test1 extends Item {
//     somestr: string
//     someint: number
//     somebool: boolean
// }
// type Test2 = query<Test1>


function getSQLType(value: TupliteValues): string {
    // Removed because it causes errors (also probably safer)
    // if (value === null) {
    //     return "NULL"
    // }

    switch (typeof value) {
        case "string":
            return "TEXT"
        case "number":
            return "REAL"
        case "boolean":
            return "INTEGER"
        default:
            throw new Error(`Invalid type: ${value}`)
    }
}

function getRowType(item: TupliteItem): string[] {
    return Object.entries(item).map(([_, value]) => getSQLType(value))
}

abstract class SQLiteWrapper {
    abstract runQuery(sql: string): void
    abstract listTables(): string[]
    tableExists = (table: string) => this.listTables().includes(table)
    abstract getAsItem<T extends TupliteItem>(table: string, query: string): T[]
}

class BunSQLite extends SQLiteWrapper {
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

    getAsItem<T extends TupliteItem>(table: string, query: string): T[] {
        return this.db.query(query).all() as T[]
    }
}

class TupliteDB {
    dbWrapper: SQLiteWrapper

    constructor(path?: string) {
        this.dbWrapper = new BunSQLite(path)
    }

    openTable<T extends TupliteItem>(table: string): TupliteTable<T> {
        return new TupliteTable<T>(this.dbWrapper, table)
    }

    deleteTable(table: string) {
        this.dbWrapper.runQuery(`DROP TABLE ${table}`)
    }
}


class TupliteTable<T extends TupliteItem> {
    dbWrapper: SQLiteWrapper
    table: string
    tableExists: boolean

    constructor(dbWrapper: SQLiteWrapper, table: string) {
        this.dbWrapper = dbWrapper
        this.table = table
        this.tableExists = this.dbWrapper.tableExists(table)
    }

    createTable(item: T) {
        const rowType = getRowType(item)
        const rowNamesString = Object.keys(item).map((name, index) => `${name} ${rowType[index]}`).join(", ")
        // this.db.query(`CREATE TABLE IF NOT EXISTS ${this.table} (${rowNamesString})`).run()
        this.dbWrapper.runQuery(`CREATE TABLE IF NOT EXISTS ${this.table} (${rowNamesString})`)
        this.tableExists = true
    }

    add(item: T) {
        if (!this.tableExists) this.createTable(item)

        const rowNames = Object.keys(item)
        const rowValuesString = Object.values(item).map((value) => typeof value === "string" ? `'${value}'` : value).join(", ")
        const rowNamesString = rowNames.join(", ")
        // this.db.query(`INSERT INTO ${this.table} (${rowNamesString}) VALUES (${rowValuesString})`).run()
        this.dbWrapper.runQuery(`INSERT INTO ${this.table} (${rowNamesString}) VALUES (${rowValuesString})`)
    }

    get(query: QueryItem<T> = {}): T[] {
        let queryResult: T[]

        if ((Object.values(query).filter((value) => typeof value !== "function") as TupliteValues[]).length === 0) {
            // queryResult = this.db.query(`SELECT * FROM ${this.table}`).all() as T[]
            queryResult = this.dbWrapper.getAsItem(this.table, `SELECT * FROM ${this.table}`)
        } else {
            const queryKeys = Object.entries(query)
                .filter(([_, value]) => typeof value !== "function")
                .map(([key, _]) => `${key}`)
            const queryValuesString = Object.values(query)
                .filter((value) => typeof value !== "function")
                .map((value) => typeof value === "string" ? `'${value}'` : value).join(", ")

            const queryKeysString = queryKeys.join(", ")
            // queryResult = this.db.query(`SELECT * FROM ${this.table} WHERE (${queryKeysString}) = (${queryValuesString})`).all() as T[]
            queryResult = this.dbWrapper.getAsItem(this.table, `SELECT * FROM ${this.table} WHERE (${queryKeysString}) = (${queryValuesString})`)
        }

        for (const [key, value] of Object.entries(query)) {
            if (typeof value === "function") {
                queryResult = queryResult.filter((item) => value(item[key]))
            }
        }

        return queryResult
    }

    del(item: TupliteItem) {
        const queryKeys = Object.keys(item)
        const queryValuesString = Object.values(item).map((value) => typeof value === "string" ? `'${value}'` : value).join(", ")

        if (queryKeys.length === 0) {
            // this.db.query(`DELETE FROM ${this.table}`).run()
            this.dbWrapper.runQuery(`DELETE FROM ${this.table}`)
            return
        }

        const queryKeysString = queryKeys.join(", ")
        // this.db.query(`DELETE FROM ${this.table} WHERE ${queryKeysString} = (${queryValuesString})`).run()
        this.dbWrapper.runQuery(`DELETE FROM ${this.table} WHERE ${queryKeysString} = (${queryValuesString})`)
    }

    update(item: TupliteItem, newItem: TupliteItem) {
        const oldItems = this.get(item as QueryItem<T>) // TODO ensure this is correct
        this.del(item)
        for (const oldItem of oldItems) {
            this.add({ ...oldItem, ...newItem })
        }
    }
}


export { TupliteDB, TupliteTable, SQLiteWrapper, type TupliteValues, type TupliteItem }