import { type TupliteItem, type TupliteValues } from "./types";
import type { SQLiteWrapper } from "./wrapper";
declare function getSQLType(value: TupliteValues): string;
declare function getRowType(item: TupliteItem): string[];
declare function getCorrectSQLiteWrapper(path?: string): Promise<SQLiteWrapper>;
export { getSQLType, getRowType, getCorrectSQLiteWrapper };
