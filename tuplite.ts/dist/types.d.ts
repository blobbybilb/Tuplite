type TupliteValues = string | number | boolean;
type TupliteItem = Record<string, TupliteValues>;
type QueryItem<T extends TupliteItem> = {
    [P in keyof T as string extends P ? never : P]?: T[P] | ((arg: T[P]) => boolean);
};
type ValueQueryItem<T extends TupliteItem> = {
    [P in keyof T as string extends P ? never : P]?: T[P];
};
type FunctionsQueryItem<T extends TupliteItem> = {
    [P in keyof T as string extends P ? never : P]?: (arg: T[P]) => boolean;
};
export type { TupliteValues, TupliteItem, QueryItem, ValueQueryItem, FunctionsQueryItem, };
