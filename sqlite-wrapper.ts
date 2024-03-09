type validTypes = string | number | boolean
type Item = Record<string, validTypes>


function getSQLType(value: validTypes): string {
    if (typeof value === "string") {
        return "TEXT"
    } if (typeof value === "number") {
        return "REAL"
    } if (typeof value === "boolean") {
        return "INTEGER"
    } if (value === null) {
        return "NULL"
    } else {
        throw new Error("Invalid type")
    }
}


abstract class SQLiteWrapper {
    abstract dbPath: string
    constructor(path?: string) { }
    abstract listTables(): string[]
    abstract deleteTable(table: string): void
    tableExists(table: string): boolean {
        return this.listTables().includes(table)
    }
}