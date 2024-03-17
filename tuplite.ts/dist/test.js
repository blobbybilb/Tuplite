import { TupliteDB } from "./tuplite.js";
console.log("\n\n\n");
const db = await TupliteDB.open();
const testTable = db.openTable("test", ["teststr1", "testint1"]);
console.log("Tables at start:", db.dbWrapper.listTables(), "Table not exists:", !testTable.tableExists);
testTable.add({ teststr1: "test1", testint1: 1, testbool1: true });
console.log("Tables after add:", db.dbWrapper.listTables(), "Table exists:", testTable.tableExists);
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
console.log("Basic get:", testTable.get({ teststr1: "test2" }).length === 1, testTable.get({ teststr1: "test2" })[0].testint1 === 2, testTable.get({ teststr1: "test3" })[0].testint1 === 3);
console.log("Get with function:", testTable.get({
    testint1: (value) => value > 1,
    teststr1: (v) => v.startsWith("t"),
}).length === 2, testTable.get({
    testint1: (value) => value > 1,
    testbool1: true,
}).length === 1);
testTable.del({
    testint1: (value) => value > 0,
});
console.log("All items deleted: ", testTable.get().length === 0);
testTable.add({ teststr1: "test1", testint1: 1, testbool1: true });
testTable.add({ teststr1: "test2", testint1: 2, testbool1: false });
testTable.add({ teststr1: "test3", testint1: 3, testbool1: true });
testTable.mod({ teststr1: "test2" }, { testint1: 20, testbool1: true });
console.log("Update:", testTable.get({ teststr1: "test2" })[0].testint1 === 20, testTable.get({ teststr1: "test2" })[0].testbool1 == true);
testTable.mod({ testint1: (value) => value > 1 }, { testint1: 10 * 10 });
console.log("Update with function:", testTable.get({ testint1: 100 }).length === 2);
testTable.del();
testTable.add({ teststr1: "test1", testint1: 1, testbool1: true });
// console.log(testTable.get())
console.log("\n");
function compareTestItem2s(...items) {
    for (let i = 0; i < items.length - 1; i++) {
        if (items[i].teststr2 !== items[i + 1].teststr2 ||
            items[i].testint2 !== items[i + 1].testint2 ||
            items[i].testbool2 !== items[i + 1].testbool2 ||
            items[i].teststr3 !== items[i + 1].teststr3) {
            return false;
        }
    }
    return true;
}
const testTable2 = db.openTable("test2");
testTable2.add({
    teststr2: "test1",
    testint2: 1,
    testbool2: true,
    teststr3: "1111",
});
testTable2.add({
    teststr2: "test2",
    testint2: 2,
    testbool2: false,
    teststr3: "2222",
});
testTable2.add({
    teststr2: "test3",
    testint2: 3,
    testbool2: true,
    teststr3: "3333",
});
testTable2.add({
    teststr2: "something",
    testint2: 40,
    testbool2: false,
    teststr3: "4444",
});
// Check get works correctly, make sure objects are equal (check values, not references)
testTable2.get({ testint2: (value) => value < 3 });
console.log("Get with function:", compareTestItem2s(testTable2.get({
    testint2: (value) => value < 3,
    teststr2: (arg) => arg.startsWith("test"),
})[0], {
    teststr2: "test1",
    testint2: 1,
    testbool2: true,
    teststr3: "1111",
}));
testTable2.del({ testint2: (value) => value < 3 });
console.log("Delete with function:", testTable2.get().length === 2);
testTable2.mod({ testint2: (value) => value > 2 }, { testint2: 100 });
console.log("Update with function:", testTable2.get({ testint2: 100 }).length === 2);
// console.log("\n")
// const testTable3 = db.openTable<TestItem1>("test_3", ["teststr1", "testint1"])
// console.log(testTable3.getCurrentIndices())
// testTable3.add({ teststr1: "test1", testint1: 1, testbool1: true })
// console.log(testTable3.getCurrentIndices())
// const testTable3_2 = db.openTable<TestItem2>("test_3", [
//   "testbool1",
//   "testint1",
// ])
// console.log(testTable3_2.getCurrentIndices())
// console.log(
//   db
//     .openTable<TestItem1>("test_3", ["teststr1", "testint1", "testbool1"])
//     .getCurrentIndices()
// )
// console.log(db.openTable<TestItem1>("test_3", []).getCurrentIndices())
console.log("\n\n\n");
