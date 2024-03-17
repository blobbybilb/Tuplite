import { TupliteDB, type TupliteItem } from "tuplite";

// Opens a DB file, or uses an in-memory DB if no path is given
// Automatically uses the right SQLite library for Node/Deno/Bun
const db = await TupliteDB.open("test.db");

// Define your normal typescript type
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

users.get({ id: 1 }); // Query the DB by 0 or more properties, again with full type checking

// Pass in a function for more advanced querying, with... full type checking!
users.get({ name: (name) => name.endsWith("2") });

// updating and deleting is just as easy, and guess what it has? Full type checking!
users.update({ id: 1 }, { name: "test1-updated" });
users.del({});

// And that's the entire API
