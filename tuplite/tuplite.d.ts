import type { QueryItem, TupliteItem } from "./types";
import { type SQLiteWrapper } from "./wrapper";
declare class TupliteDB {
    dbWrapper: SQLiteWrapper;
    private constructor();
    static open(path?: string): Promise<TupliteDB>;
    static openWithWrapper(wrapper: SQLiteWrapper): TupliteDB;
    openTable<T extends TupliteItem>(table: string): TupliteTable<T>;
    deleteTable(table: string): void;
}
declare class TupliteTable<T extends TupliteItem> {
    dbWrapper: SQLiteWrapper;
    table: string;
    tableExists: boolean;
    constructor(dbWrapper: SQLiteWrapper, table: string);
    createTable(item: T): void;
    add(item: T): void;
    get(query?: QueryItem<T>): T[];
    del(item: TupliteItem): void;
    update(item: TupliteItem, newItem: TupliteItem): void;
}
export { TupliteDB, TupliteTable };
