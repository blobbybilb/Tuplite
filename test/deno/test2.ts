import {
  TupliteDB,
  type TupliteItem,
} from "https://raw.githubusercontent.com/blobbybilb/Tuplite/main/tuplite.ts/dist/index.js";

console.log("\n\n\n");

const db = await TupliteDB.open();

interface TestItem1 extends TupliteItem {
  teststr1: string;
  testint1: number;
  testbool1: boolean;
}

const testTable = db.openTable<TestItem1>("test");
console.log(
  "Tables at start:",
  db.dbWrapper.listTables(),
  "Table exists:",
  testTable.tableExists
);
testTable.add({ teststr1: "test1", testint1: 1, testbool1: true });
console.log(
  "Tables after add:",
  db.dbWrapper.listTables(),
  "Table exists:",
  testTable.tableExists
);
testTable.add({ teststr1: "test2", testint1: 2, testbool1: false });
testTable.add({ teststr1: "test3", testint1: 3, testbool1: true });
console.log("3 Items added: ", testTable.get().length === 3);
testTable.del({ teststr1: "test2" });
console.log("Item deleted: ", testTable.get().length === 2);
testTable.del({});
testTable.add({ teststr1: "test1", testint1: 1, testbool1: true });
testTable.add({ teststr1: "test2", testint1: 2, testbool1: false });
testTable.add({ teststr1: "test3", testint1: 3, testbool1: true });
console.log("3 Items added: ", testTable.get().length === 3);
console.log(
  "Basic get:",
  testTable.get({ teststr1: "test2" }).length === 1,
  testTable.get({ teststr1: "test2" })[0].testint1 === 2,
  testTable.get({ teststr1: "test3" })[0].testint1 === 3
);

console.log(
  "Get with function:",
  testTable.get({ testint1: (value) => value > 1 }).length === 2
);

console.log("\n\n\n");
