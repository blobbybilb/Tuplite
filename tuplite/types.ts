type TupliteValues = string | number | boolean
type TupliteItem = Record<string, TupliteValues>
type QueryItem<T extends TupliteItem> = { [P in keyof T as (string extends P ? never : P)]?: T[P] | ((arg: T[P]) => boolean) }

// interface Test1 extends Item {
//     somestr: string
//     someint: number
//     somebool: boolean
// }
// type Test2 = query<Test1>

export { type TupliteValues, type TupliteItem, type QueryItem }