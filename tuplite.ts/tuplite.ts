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

  splitQuery(query: QueryItem<T>): [ValueQueryItem<T>, FunctionsQueryItem<T>] {
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
    return [valuesQuery, functionsQuery]
  }

  getWhereString(query: ValueQueryItem<T>): string {
    let queryKeys = Object.keys(query)

    if (queryKeys.length === 0) {
      return ""
    }

    const queryValuesString = Object.values(query)
      .map((value) => (typeof value === "string" ? `'${value}'` : value))
      .join(", ")
    const queryKeysString = queryKeys.join(", ")
    return ` WHERE (${queryKeysString}) = (${queryValuesString})`
  }

  getRowIDs(query: ValueQueryItem<T>): number[] {
    // console.log(this.getWhereString(query))
    return this.dbWrapper
      .getAs<{ rowid: number }>(
        `SELECT rowid FROM ${this.table} ${this.getWhereString(query)}`
      )
      .map((item) => item.rowid)
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

    if (Object.values(query).every((value) => typeof value !== "function")) {
      return this.dbWrapper.getAs<T>(
        `SELECT * FROM ${this.table} ${this.getWhereString(
          query as unknown as ValueQueryItem<T>
        )}`
      )
    }

    let [valuesQuery, functionsQuery] = this.splitQuery(query)

    let rowIDs = this.getRowIDs(valuesQuery)
    let queryResult: T[] = []

    rowIDs.forEach((rowID) => {
      let item = this.dbWrapper.getAs<T>(
        `SELECT * FROM ${this.table} WHERE rowid = ${rowID}`
      )[0]

      if (
        // @ts-ignore
        Object.entries(functionsQuery).every(([key, value]) => value(item[key]))
      ) {
        queryResult.push(item)
      }
    })

    return queryResult
  }

  del(query: QueryItem<T> = {}) {
    if (Object.values(query).every((value) => typeof value !== "function")) {
      this.dbWrapper.runQuery(
        `DELETE FROM ${this.table} ${this.getWhereString(
          query as unknown as ValueQueryItem<T>
        )}`
      )
      return
    }

    let [valuesQuery, functionsQuery] = this.splitQuery(query)

    let rowIDs = this.getRowIDs(valuesQuery)

    rowIDs.forEach((rowID) => {
      let item = this.dbWrapper.getAs<T>(
        `SELECT * FROM ${this.table} WHERE rowid = ${rowID}`
      )[0]

      if (
        // @ts-ignore
        Object.entries(functionsQuery).every(([key, value]) => value(item[key]))
      ) {
        this.dbWrapper.runQuery(
          `DELETE FROM ${this.table} WHERE rowid = ${rowID}`
        )
      }
    })
  }

  update(item: QueryItem<T>, newItem: ValueQueryItem<T>) {
    if (Object.values(item).every((value) => typeof value !== "function")) {
      this.dbWrapper.runQuery(
        `UPDATE ${this.table} SET ${Object.entries(newItem)
          .map(([key, value]) => `${key} = ${value}`)
          .join(", ")} ${this.getWhereString(
          item as unknown as ValueQueryItem<T>
        )}`
      )
      return
    }

    let [valuesQuery, functionsQuery] = this.splitQuery(item)

    let rowIDs = this.getRowIDs(valuesQuery)

    rowIDs.forEach((rowID) => {
      let item = this.dbWrapper.getAs<T>(
        `SELECT * FROM ${this.table} WHERE rowid = ${rowID}`
      )[0]

      if (
        // @ts-ignore
        Object.entries(functionsQuery).every(([key, value]) => value(item[key]))
      ) {
        this.dbWrapper.runQuery(
          `UPDATE ${this.table} SET ${Object.entries(newItem)
            .map(([key, value]) => `${key} = ${value}`)
            .join(", ")} WHERE rowid = ${rowID}`
        )
      }
    })
  }
}

export { TupliteDB, TupliteTable }
