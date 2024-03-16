import {
  ValueQueryItem,
  type TupliteItem,
  type TupliteValues,
  QueryItem,
  FunctionsQueryItem,
} from "./types.js"
import type { SQLiteWrapper } from "./wrapper.js"

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

function getWhereString<T extends TupliteItem>(
  query: ValueQueryItem<T>
): string {
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

function splitQuery<T extends TupliteItem>(
  query: QueryItem<T>
): [ValueQueryItem<T>, FunctionsQueryItem<T>] {
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

async function getCorrectSQLiteWrapper(path?: string): Promise<SQLiteWrapper> {
  if (typeof Bun !== "undefined") {
    return new (await import("./bun-sqlite-wrapper.js")).BunSQLiteWrapper(path)
  }
  if (typeof Deno !== "undefined") {
    if (typeof Deno.dlopen === "undefined") {
      return new (
        await import("./deno-sqlite-wasm-wrapper.ts")
      ).DenoSQLiteWASMWrapper(path)
    }

    return new (
      await import("./deno-sqlite-ffi-wrapper.ts")
    ).DenoSQLiteFFIWrapper(path)
  } else {
    return new (
      await import("./node-better-sqlite-wrapper.js")
    ).BetterSQLiteWrapper(path)
  }
}

export {
  getCorrectSQLiteWrapper,
  getRowType,
  getSQLType,
  getWhereString,
  splitQuery,
}
