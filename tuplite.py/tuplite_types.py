from collections import namedtuple
from typing import Dict, NamedTuple, TypedDict


type TupliteValues = str | int | float | bool
type TupliteItem = Dict[str, TupliteValues]


class Test1(NamedTuple):
    pass
