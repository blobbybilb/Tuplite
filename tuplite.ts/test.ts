import { TupliteDB } from "./tuplite.js"
import type { TupliteItem } from "./types.js"

console.log("\n\n\n")

const db = await TupliteDB.open()

interface TestItem1 extends TupliteItem {
  teststr1: string
  testint1: number
  testbool1: boolean
}

const testTable = db.openTable<TestItem1>("test")
console.log(
  "Tables at start:",
  db.dbWrapper.listTables(),
  "Table exists:",
  testTable.tableExists
)
testTable.add({ teststr1: "test1", testint1: 1, testbool1: true })
console.log(
  "Tables after add:",
  db.dbWrapper.listTables(),
  "Table exists:",
  testTable.tableExists
)
testTable.add({ teststr1: "test2", testint1: 2, testbool1: false })
testTable.add({ teststr1: "test3", testint1: 3, testbool1: true })
console.log("3 Items added: ", testTable.get().length === 3)
testTable.del({ teststr1: "test2" })
console.log("Item deleted: ", testTable.get().length === 2)
testTable.del({})
testTable.add({ teststr1: "test1", testint1: 1, testbool1: true })
testTable.add({ teststr1: "test2", testint1: 2, testbool1: false })
testTable.add({ teststr1: "test3", testint1: 3, testbool1: true })
console.log("3 Items added: ", testTable.get().length === 3)
console.log(
  "Basic get:",
  testTable.get({ teststr1: "test2" }).length === 1,
  testTable.get({ teststr1: "test2" })[0].testint1 === 2,
  testTable.get({ teststr1: "test3" })[0].testint1 === 3
)

console.log(
  "Get with function:",
  testTable.get({
    testint1: (value) => value > 1,
    teststr1: (v) => v.startsWith("t"),
  }).length === 2,
  testTable.get({
    testint1: (value) => value > 1,
    testbool1: true,
  }).length === 1
)

testTable.del({
  testint1: (value) => value > 0,
})
console.log("All items deleted: ", testTable.get().length === 0)

testTable.add({ teststr1: "test1", testint1: 1, testbool1: true })
testTable.add({ teststr1: "test2", testint1: 2, testbool1: false })
testTable.add({ teststr1: "test3", testint1: 3, testbool1: true })

testTable.update({ teststr1: "test2" }, { testint1: 20, testbool1: true })

console.log(
  "Update:",
  testTable.get({ teststr1: "test2" })[0].testint1 === 20,
  testTable.get({ teststr1: "test2" })[0].testbool1 == true
)

testTable.update({ testint1: (value) => value > 1 }, { testint1: 10 * 10 })

console.log(
  "Update with function:",
  testTable.get({ testint1: 100 }).length === 2
)

console.log("\n")
