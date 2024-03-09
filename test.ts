import { Database } from "bun:sqlite"

const db = new Database(":memory:", { create: true })

db.exec("PRAGMA journal_mode = WAL;")

db.query("CREATE TABLE test (teststr1 TEXT, testint1 INTEGER, testbool1 BOOLEAN)").run()
db.query("INSERT INTO test (teststr1, testint1, testbool1) VALUES ('test1', 1, 1)").run()
db.query("INSERT INTO test (teststr1, testint1, testbool1) VALUES ('test2', 2, 0)").run()
db.query("INSERT INTO test (teststr1, testint1, testbool1) VALUES ('test3', 3, 1)").run()

const q = db.query("SELECT * FROM test")

console.log(q.get())
console.log(q.get())