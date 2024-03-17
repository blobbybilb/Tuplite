import { ValueQueryItem, type TupliteItem, type TupliteValues, QueryItem, FunctionsQueryItem } from "./types.js";
import type { SQLiteWrapper } from "./wrapper.js";
declare function getSQLType(value: TupliteValues): string;
declare function getRowType(item: TupliteItem): {
    [key: string]: string;
};
declare function getWhereString<T extends TupliteItem>(query: ValueQueryItem<T>): string;
declare function splitQuery<T extends TupliteItem>(query: QueryItem<T>): [ValueQueryItem<T>, FunctionsQueryItem<T>];
declare function getCorrectSQLiteWrapper(path?: string): Promise<SQLiteWrapper>;
export { getCorrectSQLiteWrapper, getRowType, getSQLType, getWhereString, splitQuery, };
