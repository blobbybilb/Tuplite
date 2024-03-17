import type { QueryItem, TupliteItem, ValueQueryItem } from "./types.js";
import { type SQLiteWrapper } from "./wrapper.js";
declare class TupliteDB {
    dbWrapper: SQLiteWrapper;
    private constructor();
    static open(path?: string): Promise<TupliteDB>;
    static openWithWrapper(wrapper: SQLiteWrapper): TupliteDB;
    openTable<T extends TupliteItem>(table: string, indices?: (keyof QueryItem<T>)[]): TupliteTable<T>;
    deleteTable(table: string): void;
}
declare class TupliteTable<T extends TupliteItem> {
    dbWrapper: SQLiteWrapper;
    table: string;
    tableExists: boolean;
    boolColumns: (keyof T)[];
    indices: string[];
    constructor(dbWrapper: SQLiteWrapper, table: string, indices?: string[]);
    private getCurrentIndices;
    private createIndices;
    private setBoolColumns;
    private convertBool;
    createTable(item: T): void;
    add(item: T): void;
    private getRowIDs;
    get(query?: QueryItem<T>): T[];
    del(query?: QueryItem<T>): void;
    mod(query: QueryItem<T>, modifications: ValueQueryItem<T>): void;
}
export { TupliteDB, TupliteTable };
