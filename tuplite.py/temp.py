import sqlite3
from typing import NamedTuple, List, TypeVar, Generic

DB_PATH = "example.db"


T = TypeVar("T", bound=NamedTuple)


# class TupliteError(StrEnum):
#     key_exists = "Key already exists"


class Storage(Generic[T]):
    table_name: str
    named_tuple_type: type[T]
    db_conn: sqlite3.Connection
    db_cursor: sqlite3.Cursor

    def __init__(
        self,
        table_name: str,
        named_tuple_type: type[T],
        primary_key_field: str | None = None,
        db_conn: sqlite3.Connection | None = None,
        db_cursor: sqlite3.Cursor | None = None,
    ) -> None:
        self.table_name = table_name
        self.named_tuple_type = named_tuple_type

        self.db_conn = db_conn if not db_conn is None else sqlite3.connect(DB_PATH)
        self.db_cursor = db_cursor if not db_cursor is None else self.db_conn.cursor()

        self.create_table_if_not_exists(primary_key_field)

    def create_table_if_not_exists(self, primary_key_field: str | None = None):
        fields = []
        for field, field_type in self.named_tuple_type.__annotations__.items():
            field_definition = f"{field} {self.get_field_type(field_type)}"
            if field == primary_key_field:
                field_definition += " PRIMARY KEY"
            fields.append(field_definition)
        fields_str = ", ".join(fields)

        query = f"CREATE TABLE IF NOT EXISTS {self.table_name} ({fields_str})"
        self.db_cursor.execute(query)

    def save_item(self, item: T):
        placeholders = ", ".join(
            ["?" for _ in range(len(self.named_tuple_type._fields))]
        )
        fields = ", ".join(self.named_tuple_type._fields)
        query = f"INSERT INTO {self.table_name} ({fields}) VALUES ({placeholders})"
        values = tuple(getattr(item, field) for field in self.named_tuple_type._fields)
        self.db_cursor.execute(query, values)
        self.db_conn.commit()

    def get_item(self, **kwargs: str) -> T | None:
        conditions = " AND ".join([f"{field} = ?" for field, value in kwargs.items()])
        query = f"SELECT * FROM {self.table_name} WHERE {conditions}"
        values = tuple(kwargs.values())
        self.db_cursor.execute(query, values)
        row = self.db_cursor.fetchone()
        if row:
            return self.named_tuple_type(*row)
        else:
            return None

    def delete_item(self, **kwargs):
        conditions = " AND ".join([f"{field} = ?" for field, value in kwargs.items()])
        query = f"DELETE FROM {self.table_name} WHERE {conditions}"
        values = tuple(kwargs.values())
        self.db_cursor.execute(query, values)
        self.conn.commit()

    def list_entries(self) -> List[T]:
        query = f"SELECT * FROM {self.table_name}"
        self.db_cursor.execute(query)
        rows = self.db_cursor.fetchall()
        entries = [self.named_tuple_type(*row) for row in rows]
        return entries

    def update_item(self, item: T):
        fields = ", ".join([f"{field} = ?" for field in self.named_tuple_type._fields])
        query = f"UPDATE {self.table_name} SET {fields} WHERE {self.named_tuple_type._fields[0]} = ?"
        values = tuple(
            getattr(item, field) for field in self.named_tuple_type._fields
        ) + (
            getattr(item, self.named_tuple_type._fields[0]),
        )
        self.db_cursor.execute(query, values)
        self.db_conn.commit()

    @staticmethod
    def get_field_type(field_type):
        if field_type == str:
            return "TEXT"
        elif field_type == int:
            return "INTEGER"
        elif field_type == float:
            return "REAL"
        else:
            raise ValueError(f"Unsupported field type: {field_type}")


# # testing:


class Person(NamedTuple):
    name: str
    age: float
    email: str


storage = Storage[Person]("persons", Person, primary_key_field="name")

person1 = Person("John Doe", 30.234, "john@example.com")
person2 = Person("Jane Smith", 25, "jane@example.com")


storage.save_item(person1)
storage.save_item(person2)

retrieved_person = storage.get_item(name="John Doe")
print(retrieved_person)
# # Output: Person(name='John Doe', age=30, email='john@example.com')

# storage.delete_item(name="Jane Smith")  # delete where

persons = storage.list_entries()
print(persons)
# Output: [Person(name='John Doe', age=30, email='john@example.com')]
