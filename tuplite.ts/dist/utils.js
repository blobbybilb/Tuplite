function getSQLType(value) {
    // Removed because it causes errors (also probably safer)
    // if (value === null) {
    //     return "NULL"
    // }
    switch (typeof value) {
        case "string":
            return "TEXT";
        case "number":
            return "REAL";
        case "boolean":
            return "INTEGER_boolean";
        default:
            throw new Error(`Invalid type: ${value}`);
    }
}
function getRowType(item) {
    let rowType = {};
    for (const [key, value] of Object.entries(item)) {
        rowType[key] = getSQLType(value);
    }
    return rowType;
}
function getWhereString(query) {
    let queryKeys = Object.keys(query);
    if (queryKeys.length === 0) {
        return "";
    }
    const queryValuesString = Object.values(query)
        .map((value) => (typeof value === "string" ? `'${value}'` : value))
        .join(", ");
    const queryKeysString = queryKeys.join(", ");
    return ` WHERE (${queryKeysString}) = (${queryValuesString})`;
}
function splitQuery(query) {
    let valuesQuery = {};
    let functionsQuery = {};
    for (const [key, value] of Object.entries(query)) {
        if (typeof value === "function") {
            // @ts-ignore
            functionsQuery[key] = value;
        }
        else {
            // @ts-ignore
            valuesQuery[key] = value;
        }
    }
    return [valuesQuery, functionsQuery];
}
async function getCorrectSQLiteWrapper(path) {
    // @ts-ignore
    if (typeof Bun !== "undefined") {
        return new (await import("./bun-sqlite-wrapper.js")).BunSQLiteWrapper(path);
    }
    // @ts-ignore
    if (typeof Deno !== "undefined") {
        // @ts-ignore
        if (typeof Deno.dlopen === "undefined") {
            return new // @ts-ignore
             (await import("./deno-sqlite-wasm-wrapper.ts")).DenoSQLiteWASMWrapper(path);
        }
        return new // @ts-ignore
         (await import("./deno-sqlite-ffi-wrapper.ts")).DenoSQLiteFFIWrapper(path);
    }
    else {
        return new (await import("./node-better-sqlite-wrapper.js")).BetterSQLiteWrapper(path);
    }
}
export { getCorrectSQLiteWrapper, getRowType, getSQLType, getWhereString, splitQuery, };
