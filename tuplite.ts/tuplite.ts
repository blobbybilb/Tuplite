import type {
  QueryItem,
  TupliteItem,
  TupliteValues,
  ValueQueryItem,
  FunctionsQueryItem,
} from "./types.js"
import { getCorrectSQLiteWrapper, getRowType } from "./utils.js"
import { type SQLiteWrapper } from "./wrapper.js"

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
    const rowItemsString = Object.keys(item)
      .map((name, index) => `${name} ${rowType[index]}`)
      .join(", ")

    this.dbWrapper.runQuery(
      `CREATE TABLE IF NOT EXISTS ${this.table} (${rowItemsString})`
    )
    this.tableExists = true
  }

  add(item: T) {
    if (!this.tableExists) this.createTable(item)

    const rowNames = Object.keys(item)
    const rowValuesString = Object.values(item)
      .map((value) => (typeof value === "string" ? `'${value}'` : value))
      .join(", ")
    const rowNamesString = rowNames.join(", ")

    this.dbWrapper.runQuery(
      `INSERT INTO ${this.table} (${rowNamesString}) VALUES (${rowValuesString})`
    )
  }

  getNonFunctions(query: ValueQueryItem<T>): T[] {
    let queryKeys = Object.keys(query)

    if (queryKeys.length === 0) {
      return this.dbWrapper.getAsItems(`SELECT * FROM ${this.table}`)
    }

    const queryValuesString = Object.values(query)
      .map((value) => (typeof value === "string" ? `'${value}'` : value))
      .join(", ")
    const queryKeysString = queryKeys.join(", ")
    return this.dbWrapper.getAsItems(
      `SELECT * FROM ${this.table} WHERE (${queryKeysString}) = (${queryValuesString})`
    )
  }

  getRowIDs(query: ValueQueryItem<T>): number[] {
    let queryKeys = Object.keys(query)

    if (queryKeys.length === 0) {
      return this.dbWrapper.getRowIDs(`SELECT rowid FROM ${this.table}`)
    }

    const queryValuesString = Object.values(query)
      .map((value) => (typeof value === "string" ? `'${value}'` : value))
      .join(", ")
    const queryKeysString = queryKeys.join(", ")
    return this.dbWrapper.getRowIDs(
      `SELECT rowid FROM ${this.table} WHERE (${queryKeysString}) = (${queryValuesString})`
    )
  }

  get(query: QueryItem<T> = {}): T[] {
    // query is an object where the keys are the column names
    // and the values can either be a value to match or a function to filter

    /*
    - if query is empty, return all items
    - if query contains no functions, return items that match the query
    - if query contains only functions, get rowid of all items
    - otherwise, get rowid of items that match the query
    - for each rowid, get the item and check if it matches the functions
    */

    // ----------------- NEW CODE -----------------
    if (Object.values(query).every((value) => typeof value !== "function")) {
      return this.getNonFunctions(query as unknown as ValueQueryItem<T>)
    }

    let valuesQuery: ValueQueryItem<T> = {}
    let functionsQuery: FunctionsQueryItem<T> = {}
    for (const [key, value] of Object.entries(query)) {
      if (typeof value === "function") {
        // @ts-ignore
        functionsQuery[key] = value
      } else {
        // @ts-ignore
        valuesQuery[key] = value
      }
    }

    let rowIDs = this.getRowIDs(valuesQuery)
    let queryResult: T[] = []

    rowIDs.forEach((rowID) => {
      let item = this.dbWrapper.getAsItems<T>(
        `SELECT * FROM ${this.table} WHERE rowid = ${rowID}`
      )[0]

      if (
        Object.entries(functionsQuery).every(([key, value]) => value(item[key]))
      ) {
        queryResult.push(item)
      }
    })

    return queryResult

    // ----------------- OLD CODE -----------------

    let queryResult: T[]

    if (
      (
        Object.values(query).filter(
          (value) => typeof value !== "function"
        ) as TupliteValues[]
      ).length === 0
    ) {
      queryResult = this.dbWrapper.getAsItems(`SELECT * FROM ${this.table}`)
    } else {
      const queryKeys = Object.entries(query)
        .filter(([_, value]) => typeof value !== "function")
        .map(([key, _]) => `${key}`)
      const queryValuesString = Object.values(query)
        .filter((value) => typeof value !== "function")
        .map((value) => (typeof value === "string" ? `'${value}'` : value))
        .join(", ")

      const queryKeysString = queryKeys.join(", ")
      queryResult = this.dbWrapper.getAsItems(
        `SELECT * FROM ${this.table} WHERE (${queryKeysString}) = (${queryValuesString})`
      )
    }

    for (const [key, value] of Object.entries(query)) {
      if (typeof value === "function") {
        queryResult = queryResult.filter((item) => value(item[key]))
      }
    }

    return queryResult
  }

  del(item: QueryItem<T> = {}) {
    const queryKeys = Object.keys(item)
    const queryValuesString = Object.values(item)
      .map((value) => (typeof value === "string" ? `'${value}'` : value))
      .join(", ")

    if (queryKeys.length === 0) {
      this.dbWrapper.runQuery(`DELETE FROM ${this.table}`)
      return
    }

    const queryKeysString = queryKeys.join(", ")
    this.dbWrapper.runQuery(
      `DELETE FROM ${this.table} WHERE ${queryKeysString} = (${queryValuesString})`
    )
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
