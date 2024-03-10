type TupliteValues = string | number | boolean;
type TupliteItem = Record<string, TupliteValues>;
type QueryItem<T extends TupliteItem> = {
    [P in keyof T as (string extends P ? never : P)]?: T[P] | ((arg: T[P]) => boolean);
};
export { type TupliteValues, type TupliteItem, type QueryItem };
