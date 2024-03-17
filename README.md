# Tuplite

A zero-config, zero-SQL type based DB interface (for SQLite)

Made for TypeScript ~~and Python~~, and uses their type systems to provide a fully managed, type-safe, and easy to use DB interface.

## Install

```bash
npm install tuplite # Node
deno add @blob/tuplite # Deno (when running, it requires --unstable-ffi)
bun install tuplite # Bun

```

<!-- pip install tuplite # Python (WIP) -->

## Usage

**TypeScript:**

```typescript
import { TupliteDB, type TupliteItem } from "tuplite";

// Opens a DB file, or uses an in-memory DB if no path is given
// Automatically uses the right SQLite library for Node/Deno/Bun
const db = await TupliteDB.open("test.db");

// Define your normal typescript type, extending TupliteItem to ensure it works with Tuplite
interface User extends TupliteItem {
  id: number;
  name: string;
  active: boolean;
}

// Just give Tuplite your TS type and a table name. That's it! No SQL, schema-ing, etc.
const users = db.openTable<User>("user");

// Start using your DB table with a simple interface, with full type checking!
users.add({ id: 1, name: "test1", active: true });
users.add({ id: 2, name: "test2", active: false });

// Query the DB by 0 or more properties, again with full type checking
users.get({ id: 1 }); // [{ id: 1, name: "test1", active: true }]

// Pass in a function for more advanced querying, with... full type checking!
users.get({ name: (name) => name.endsWith("2") }); // [{ id: 2, name: "test2", active: false }]

// updating and deleting is just as easy, and guess what it has? Full type checking!
users.mod({ id: 1 }, { name: "test1-updated" }); // modifies the 1st item to: [{ id: 1, name: "test1-updated", active: true }]

users.del({ active: false }); // deletes inactive users

// Note: the db.openTable method takes a second optional argument, which is a list of indexes to create. Example:
const users = db.openTable<User>("user", ["id", "name"]); // creates indexes for the id and name columns, which can speed up read queries (but does come with an extra storage and write overhead)

// And that's the entire API!
```

## History/Name

This project started as "a python NamedTuple based interface to SQLite" (hence the name) as part of another project, mostly because I didn't like SQL and wanted a zero-dev-overhead way to use SQLite. I then wanted something like this for a TypeScript project, so I made a TypeScript version that worked only in Bun, and added more features like querying by functions, powered by fun TypeScript stuff like this:

```typescript
// from types.ts
type TupliteItem = Record<string, TupliteValues>;
type QueryItem<T extends TupliteItem> = {
  [P in keyof T as string extends P ? never : P]?:
    | T[P]
    | ((arg: T[P]) => boolean);
};
```

Then, I decided to make it a proper project, making it work with Deno and Node, and not doing questionable things like loading all the rows into memory when querying by functions (it now checks them one at a time). I made some final improvements (like allowing queries by function in `del` and `mod` as well as in `get`), and I think it is now feature complete and ready to be used.

As for a Python version: looking at what makes me like the TypeScript version and considering the differences in what the type systems of the two languages can do, I think I will wait until I need it for some project again. Currently, I don't think there's a way to make something like the TS mapped types above in Python, which would make it lose the things that make it nice/friendly to use, while still being much more narrow than existing libraries.

## License

LGPLv2.1
