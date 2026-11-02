from __future__ import annotations

from pydantic import BaseModel, Field

from app.constants.laptop_images import resolve_laptop_image_url


class LaptopResponse(BaseModel):
    id: str
    name: str
    brand: str
    price: float
    cpu: str
    gpu: str
    ram_gb: int
    storage_gb: int
    display: str
    battery_hours: float
    weight_kg: float
    use_cases: list[str]
    image_url: str
    rating: float
    tags: list[str]

    @classmethod
    def from_document(cls, doc: dict) -> "LaptopResponse":
        return cls(
            id=str(doc["_id"]),
            name=doc["name"],
            brand=doc["brand"],
            price=doc["price"],
            cpu=doc["cpu"],
            gpu=doc["gpu"],
            ram_gb=doc["ram_gb"],
            storage_gb=doc["storage_gb"],
            display=doc["display"],
            battery_hours=doc["battery_hours"],
            weight_kg=doc["weight_kg"],
            use_cases=doc.get("use_cases", []),
            image_url=resolve_laptop_image_url(str(doc["_id"]), doc.get("image_url")),
            rating=doc.get("rating", 4.0),
            tags=doc.get("tags", []),
        )


class LaptopCreate(BaseModel):
    name: str
    brand: str
    price: float = Field(gt=0)
    cpu: str
    gpu: str
    ram_gb: int = Field(ge=4)
    storage_gb: int = Field(ge=128)
    display: str
    battery_hours: float = Field(ge=1)
    weight_kg: float = Field(gt=0)
    use_cases: list[str] = []
    image_url: str
    rating: float = Field(ge=0, le=5, default=4.0)
    tags: list[str] = []
