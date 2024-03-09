import { type TupliteItem, type TupliteValues } from "./types"
import type { SQLiteWrapper } from "./wrapper"

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

async function getCorrectSQLiteWrapper(path?: string): Promise<SQLiteWrapper> {
    if (typeof Bun !== "undefined") {
        return new (await import("./bun-sqlite-wrapper")).BunSQLite(path)
    } else {
        throw new Error("No SQLite wrapper found")
    }
}

export { getSQLType, getRowType, getCorrectSQLiteWrapper }