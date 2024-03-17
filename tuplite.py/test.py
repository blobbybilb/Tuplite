from typing import NamedTuple, TypedDict


# make a NamedTuple, TypedDict, and dataclass
class NT(NamedTuple):
    x: int
    y: int


class TD(TypedDict):
    x: int
    y: int


from dataclasses import dataclass


@dataclass
class DC:
    x: int
    y: int


# create instances of each
nt = NT(1, 2)
td = TD(x=1, y=2)
dc = DC(1, 2)

# print the instances
print(nt, type(nt))
print(td, type(td))
print(dc, type(dc))

# modify the instances
# nt.x = 3
dc.x = 3

# print the modified instances
print(nt, type(nt))
print(td, type(td))
print(dc, type(dc))
