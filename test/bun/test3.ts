import { Database } from 'bun:sqlite';
import { TupliteDB, type TupliteItem } from 'tuplite';

const sqliteDB = new Database('tempdb1.db');

sqliteDB.run('PRAGMA journal_mode = WAL');

interface Test extends TupliteItem {
    name: string;
    num: number;
    int: number;
}

let lastTime = performance.now();

function time(msg: string) {
    const now = performance.now();
    console.log(msg, ((now - lastTime) / 1000).toFixed(2));
    lastTime = now;
}

const tupliteDB = (await TupliteDB.open('tempdb2.db')).openTable<Test>('test');

time('start')

sqliteDB.run('CREATE TABLE test (name TEXT, num REAL, int INTEGER)');

const stmt = sqliteDB.prepare('INSERT INTO test (name, num, int) VALUES (?, ?, ?)');

for (let i = 0; i < 1000; i++) {
    stmt.run('name ' + i, Math.random(), i);
}

for (let i = 0; i < 1000; i++) {
    stmt.run('something ' + i, Math.random(), i);
}

time('sqlite insert');

for (let i = 0; i < 1000; i++) {
    tupliteDB.add({ name: 'name ' + i, num: Math.random(), int: i });
}

for (let i = 0; i < 1000; i++) {
    tupliteDB.add({ name: 'something ' + i, num: Math.random(), int: i });
}

time('tuplite insert');

// Querying with LIKE

for (let i = 0; i < 1000; i++) {
    sqliteDB.query('SELECT * FROM test WHERE name LIKE "name%"');
}

time('sqlite query');

// for (let i = 0; i < 1000; i++) {
//     tupliteDB.query({ name: { $like: 'name%' } });
// }

for (let i = 0; i < 1000; i++) {
    tupliteDB.get({ name: n => n.startsWith('name') });
    // tupliteDB.get({ name: "name 1" });
}

time('tuplite query');

// Querying with > and <
for (let i = 0; i < 10000; i++) {
    sqliteDB.query('SELECT * FROM test WHERE num > 0.5');
}

time('sqlite query');

for (let i = 0; i < 10000; i++) {
    tupliteDB.get({ num: n => n > 0.5 });
}

time('tuplite query');