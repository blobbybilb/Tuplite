import { getCorrectSQLiteWrapper, getRowType, getWhereString, splitQuery, } from "./utils.js";
class TupliteDB {
    dbWrapper;
    constructor(wrapper) {
        this.dbWrapper = wrapper;
    }
    static async open(path) {
        return new TupliteDB(await getCorrectSQLiteWrapper(path));
    }
    static openWithWrapper(wrapper) {
        return new TupliteDB(wrapper);
    }
    openTable(table, indices = []) {
        // @ts-ignore
        return new TupliteTable(this.dbWrapper, table, indices);
    }
    deleteTable(table) {
        this.dbWrapper.runQuery(`DROP TABLE ${table}`);
    }
}
class TupliteTable {
    dbWrapper;
    table;
    tableExists;
    boolColumns = [];
    indices = [];
    constructor(dbWrapper, table, indices = []) {
        this.dbWrapper = dbWrapper;
        this.table = table;
        this.tableExists = this.dbWrapper.tableExists(table);
        this.indices = indices;
        if (this.tableExists) {
            this.setBoolColumns();
            this.createIndices(indices);
        }
    }
    getCurrentIndices() {
        const l = ("idx_tuplite_" + this.table + "_").length;
        return this.dbWrapper
            .getAs("PRAGMA index_list(" + this.table + ")")
            .filter((item) => item.name.startsWith("idx_tuplite_" + this.table + "_"))
            .map((item) => item.name.substring(l));
    }
    createIndices(indices) {
        this.getCurrentIndices().forEach((index) => {
            if (!indices.includes(index)) {
                console.log("Dropping index", index);
                this.dbWrapper.runQuery(`DROP INDEX idx_tuplite_${this.table}_${index}`);
            }
        });
        const existingIndices = this.getCurrentIndices();
        indices.forEach((index) => {
            if (!existingIndices.includes(index)) {
                console.log("Creating index", index);
                this.dbWrapper.runQuery(`CREATE INDEX idx_tuplite_${this.table}_${index} ON ${this.table} (${index})`);
            }
        });
    }
    setBoolColumns() {
        this.boolColumns = this.dbWrapper
            .getAs("PRAGMA table_info(" + this.table + ")")
            .filter((item) => item.type === "INTEGER_boolean")
            .map((item) => item.name);
    }
    convertBool(items) {
        return items.map((item) => {
            for (const boolTable of this.boolColumns) {
                const value = item[boolTable];
                if (value === 0) {
                    // @ts-ignore
                    item[boolTable] = false;
                }
                else if (value === 1) {
                    // @ts-ignore
                    item[boolTable] = true;
                }
            }
            return item;
        });
    }
    createTable(item) {
        const rowType = getRowType(item);
        const rowItemsString = Object.keys(item)
            .map((name) => `${name} ${rowType[name]}`)
            .join(", ");
        this.dbWrapper.runQuery(`CREATE TABLE IF NOT EXISTS ${this.table} (${rowItemsString})`);
        this.tableExists = true;
        this.setBoolColumns();
        this.createIndices(this.indices);
    }
    add(item) {
        if (!this.tableExists)
            this.createTable(item);
        const rowNames = Object.keys(item);
        const rowValuesString = Object.values(item)
            .map((value) => (typeof value === "string" ? `'${value}'` : value))
            .join(", ");
        const rowNamesString = rowNames.join(", ");
        this.dbWrapper.runQuery(`INSERT INTO ${this.table} (${rowNamesString}) VALUES (${rowValuesString})`);
    }
    getRowIDs(query) {
        let queryKeys = Object.keys(query);
        if (queryKeys.length === 0) {
            return this.dbWrapper
                .getAs(`SELECT rowid FROM ${this.table}`)
                .map((item) => item.rowid);
        }
        const queryValuesString = Object.values(query)
            .map((value) => (typeof value === "string" ? `'${value}'` : value))
            .join(", ");
        const queryKeysString = queryKeys.join(", ");
        return this.dbWrapper
            .getAs(`SELECT rowid FROM ${this.table} WHERE (${queryKeysString}) = (${queryValuesString})`)
            .map((item) => item.rowid);
    }
    get(query = {}) {
        // query is an object where the keys are the column names
        // and the values can either be a value to match or a function to filter
        /*
        - if query is empty, return all items
        - if query contains no functions, return items that match the query
        - if query contains only functions, get rowid of all items
        - otherwise, get rowid of items that match the query
        - for each rowid, get the item and check if it matches the functions
        */
        if (!this.tableExists)
            return [];
        if (Object.values(query).every((value) => typeof value !== "function")) {
            const items = this.dbWrapper.getAs(`SELECT * FROM ${this.table} ${getWhereString(query)}`);
            return this.convertBool(items);
        }
        let [valuesQuery, functionsQuery] = splitQuery(query);
        let rowIDs = this.getRowIDs(valuesQuery);
        let queryResult = [];
        rowIDs.forEach((rowID) => {
            let item = this.dbWrapper.getAs(`SELECT * FROM ${this.table} WHERE rowid = ${rowID}`)[0];
            if (
            // @ts-ignore
            Object.entries(functionsQuery).every(([key, value]) => value(item[key]))) {
                queryResult.push(item);
            }
        });
        return this.convertBool(queryResult);
    }
    del(query = {}) {
        if (!this.tableExists)
            return;
        if (Object.values(query).every((value) => typeof value !== "function")) {
            this.dbWrapper.runQuery(`DELETE FROM ${this.table} ${getWhereString(query)}`);
            return;
        }
        let [valuesQuery, functionsQuery] = splitQuery(query);
        let rowIDs = this.getRowIDs(valuesQuery);
        rowIDs.forEach((rowID) => {
            let item = this.dbWrapper.getAs(`SELECT * FROM ${this.table} WHERE rowid = ${rowID}`)[0];
            if (
            // @ts-ignore
            Object.entries(functionsQuery).every(([key, value]) => value(item[key]))) {
                this.dbWrapper.runQuery(`DELETE FROM ${this.table} WHERE rowid = ${rowID}`);
            }
        });
    }
    mod(query, modifications) {
        if (!this.tableExists)
            return;
        if (Object.values(query).every((value) => typeof value !== "function")) {
            this.dbWrapper.runQuery(`UPDATE ${this.table} SET ${Object.entries(modifications)
                .map(([key, value]) => `${key} = ${value}`)
                .join(", ")} ${getWhereString(query)}`);
            return;
        }
        let [valuesQuery, functionsQuery] = splitQuery(query);
        let rowIDs = this.getRowIDs(valuesQuery);
        rowIDs.forEach((rowID) => {
            let item = this.dbWrapper.getAs(`SELECT * FROM ${this.table} WHERE rowid = ${rowID}`)[0];
            if (
            // @ts-ignore
            Object.entries(functionsQuery).every(([key, value]) => value(item[key]))) {
                this.dbWrapper.runQuery(`UPDATE ${this.table} SET ${Object.entries(modifications)
                    .map(([key, value]) => `${key} = ${value}`)
                    .join(", ")} WHERE rowid = ${rowID}`);
            }
        });
    }
}
export { TupliteDB, TupliteTable };
