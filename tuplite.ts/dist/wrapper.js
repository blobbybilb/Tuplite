class SQLiteWrapper {
    tableExists = (table) => this.listTables().includes(table);
}
export { SQLiteWrapper };
