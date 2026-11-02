"""In-memory MongoDB-compatible store for local development without Atlas."""

from __future__ import annotations

import re
from copy import deepcopy
from typing import Any, Optional

from bson import ObjectId


def _new_id() -> ObjectId:
    return ObjectId()


class InsertOneResult:
    def __init__(self, inserted_id: ObjectId):
        self.inserted_id = inserted_id


class InsertManyResult:
    def __init__(self, inserted_ids: list[ObjectId]):
        self.inserted_ids = inserted_ids


class MemoryCursor:
    def __init__(self, docs: list[dict[str, Any]]):
        self._docs = docs

    def sort(self, key: str | list, direction: int | None = None) -> MemoryCursor:
        if isinstance(key, list):
            for field, dir_ in reversed(key):
                self._docs = sorted(
                    self._docs,
                    key=lambda d, f=field: d.get(f, 0),
                    reverse=dir_ == -1,
                )
        else:
            self._docs = sorted(
                self._docs,
                key=lambda d, k=key: d.get(k, 0),
                reverse=(direction or 1) == -1,
            )
        return self

    def skip(self, n: int) -> MemoryCursor:
        self._docs = self._docs[n:]
        return self

    def limit(self, n: int) -> MemoryCursor:
        self._docs = self._docs[:n]
        return self

    async def to_list(self, length: Optional[int] = None) -> list[dict[str, Any]]:
        if length is not None:
            return deepcopy(self._docs[:length])
        return deepcopy(self._docs)


def _field_matches(value: Any, condition: Any) -> bool:
    if isinstance(condition, dict):
        if "$regex" in condition:
            flags = re.IGNORECASE if condition.get("$options") == "i" else 0
            return bool(re.search(condition["$regex"], str(value or ""), flags))
        if "$gte" in condition:
            return value is not None and value >= condition["$gte"]
        if "$lte" in condition:
            return value is not None and value <= condition["$lte"]
        if "$in" in condition:
            if isinstance(value, list):
                return any(v in condition["$in"] for v in value)
            return value in condition["$in"]
    return value == condition


def _doc_matches(doc: dict[str, Any], query: dict[str, Any]) -> bool:
    if not query:
        return True
    if "$or" in query:
        return any(_doc_matches(doc, sub) for sub in query["$or"])
    for key, cond in query.items():
        if key == "$or":
            continue
        val = doc.get(key)
        if key == "_id":
            if isinstance(cond, dict) and "$in" in cond:
                if val not in cond["$in"]:
                    return False
            elif val != cond:
                return False
            continue
        if isinstance(cond, dict) and "$in" in cond and isinstance(val, list):
            if not any(item in cond["$in"] for item in val):
                return False
            continue
        if not _field_matches(val, cond):
            return False
    return True


class MemoryCollection:
    def __init__(self, name: str, store: dict[str, list[dict[str, Any]]]):
        self.name = name
        self._store = store
        if name not in store:
            store[name] = []

    @property
    def _docs(self) -> list[dict[str, Any]]:
        return self._store[self.name]

    async def find_one(self, query: dict[str, Any]) -> Optional[dict[str, Any]]:
        for doc in self._docs:
            if _doc_matches(doc, query):
                return deepcopy(doc)
        return None

    def find(self, query: Optional[dict[str, Any]] = None) -> MemoryCursor:
        q = query or {}
        matched = [d for d in self._docs if _doc_matches(d, q)]
        return MemoryCursor(matched)

    async def insert_one(self, doc: dict[str, Any]) -> InsertOneResult:
        new_doc = deepcopy(doc)
        if "_id" not in new_doc:
            new_doc["_id"] = _new_id()
        self._docs.append(new_doc)
        return InsertOneResult(new_doc["_id"])

    async def insert_many(self, documents: list[dict[str, Any]]) -> InsertManyResult:
        ids: list[ObjectId] = []
        for doc in documents:
            new_doc = deepcopy(doc)
            if "_id" not in new_doc:
                new_doc["_id"] = _new_id()
            self._docs.append(new_doc)
            ids.append(new_doc["_id"])
        return InsertManyResult(ids)

    async def count_documents(self, query: Optional[dict[str, Any]] = None) -> int:
        q = query or {}
        return sum(1 for d in self._docs if _doc_matches(d, q))

    async def delete_one(self, query: dict[str, Any]) -> None:
        for i, doc in enumerate(self._docs):
            if _doc_matches(doc, query):
                del self._docs[i]
                return

    async def distinct(self, field: str) -> list[Any]:
        values: set[Any] = set()
        for doc in self._docs:
            val = doc.get(field)
            if isinstance(val, list):
                for item in val:
                    if item:
                        values.add(item)
            elif val is not None:
                values.add(val)
        return list(values)

    async def create_index(self, *args, **kwargs) -> str:
        return "memory_index"

    def aggregate(self, pipeline: list[dict[str, Any]]) -> MemoryCursor:
        docs = deepcopy(self._docs)
        for stage in pipeline:
            if "$match" in stage:
                docs = [d for d in docs if _doc_matches(d, stage["$match"])]
            elif "$group" in stage:
                group = stage["$group"]
                if group.get("_id") is None:
                    total_sessions = len(docs)
                    total_matches = sum(d.get("result_count", 0) for d in docs)
                    avg = total_matches / total_sessions if total_sessions else 0
                    docs = [
                        {
                            "_id": None,
                            "total_sessions": total_sessions,
                            "total_matches": total_matches,
                            "avg_matches": avg,
                        }
                    ]
        return MemoryCursor(docs)


class MemoryDatabase:
    """Minimal async DB facade compatible with Motor usage in repositories."""

    def __init__(self, name: str = "findtech"):
        self.name = name
        self._store: dict[str, list[dict[str, Any]]] = {}

    def __getitem__(self, collection_name: str) -> MemoryCollection:
        return MemoryCollection(collection_name, self._store)
