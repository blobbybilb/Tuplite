import { Database } from "bun:sqlite"
const db = new Database(":memory:")

// make a table with text, real, integer, null, and blob columns
db.query("CREATE TABLE test (text TEXT, real REAL, integer INTEGER, nullcolumn NULL, blob BLOB)").run()
db.query("INSERT INTO test VALUES (?, ?, ?, ?, ?)").run("text", 1.1, 2, null, new Uint8ClampedArray([1, 2, 3]))
console.log(db.query("SELECT * FROM test").all())