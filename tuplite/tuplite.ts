import type { QueryItem, TupliteItem, TupliteValues } from "./types"
import { getCorrectSQLiteWrapper, getRowType } from "./utils"
import { type SQLiteWrapper } from "./wrapper"


class TupliteDB {
    dbWrapper: SQLiteWrapper

    private constructor(wrapper: SQLiteWrapper) {
        this.dbWrapper = wrapper
    }

    static async open(path?: string): Promise<TupliteDB> {
        return new TupliteDB(await getCorrectSQLiteWrapper(path))
    }

    static openWithWrapper(wrapper: SQLiteWrapper): TupliteDB {
        return new TupliteDB(wrapper)
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
        const rowItemsString = Object.keys(item).map((name, index) => `${name} ${rowType[index]}`).join(", ")

        this.dbWrapper.runQuery(`CREATE TABLE IF NOT EXISTS ${this.table} (${rowItemsString})`)
        this.tableExists = true
    }

    add(item: T) {
        if (!this.tableExists) this.createTable(item)

        const rowNames = Object.keys(item)
        const rowValuesString = Object.values(item).map((value) => typeof value === "string" ? `'${value}'` : value).join(", ")
        const rowNamesString = rowNames.join(", ")

        this.dbWrapper.runQuery(`INSERT INTO ${this.table} (${rowNamesString}) VALUES (${rowValuesString})`)
    }

    get(query: QueryItem<T> = {}): T[] {
        // query is an object where the keys are the column names
        // and the values can either be a value to match or a function to filter

        let queryResult: T[]

        if ((Object.values(query).filter((value) => typeof value !== "function") as TupliteValues[]).length === 0) {
            queryResult = this.dbWrapper.getAsItems(this.table, `SELECT * FROM ${this.table}`)
        } else {
            const queryKeys = Object.entries(query)
                .filter(([_, value]) => typeof value !== "function")
                .map(([key, _]) => `${key}`)
            const queryValuesString = Object.values(query)
                .filter((value) => typeof value !== "function")
                .map((value) => typeof value === "string" ? `'${value}'` : value).join(", ")

            const queryKeysString = queryKeys.join(", ")
            queryResult = this.dbWrapper
                .getAsItems(this.table, `SELECT * FROM ${this.table} WHERE (${queryKeysString}) = (${queryValuesString})`)
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
            this.dbWrapper.runQuery(`DELETE FROM ${this.table}`)
            return
        }

        const queryKeysString = queryKeys.join(", ")
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

export { TupliteDB, TupliteTable }