type TupliteValues = string | number | boolean
type TupliteItem = Record<string, TupliteValues>
type QueryItem<T extends TupliteItem> = {
  [P in keyof T as string extends P ? never : P]?:
    | T[P]
    | ((arg: T[P]) => boolean)
}
type ValueQueryItem<T extends TupliteItem> = {
  [P in keyof T as string extends P ? never : P]?: T[P]
}
type FunctionsQueryItem<T extends TupliteItem> = {
  [P in keyof T as string extends P ? never : P]?: (arg: T[P]) => boolean
}

// interface Test1 extends TupliteItem {
//   somestr: string
//   someint: number
//   somebool: boolean
// }
// type Test2 = QueryItem<Test1>
// type Test3 = ValueQueryItem<Test1>

export type {
  TupliteValues,
  TupliteItem,
  QueryItem,
  ValueQueryItem,
  FunctionsQueryItem,
}
