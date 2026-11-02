"""Sample laptop image paths (served by the FINDtech frontend static assets)."""

from __future__ import annotations

SAMPLE_LAPTOP_IMAGE_PATHS: list[str] = [
    "/images/laptops/apple-macbook-pro.jpg",
    "/images/laptops/dell-xps.jpg",
    "/images/laptops/razer-blade.jpg",
    "/images/laptops/asus-rog-zephyrus.jpg",
    "/images/laptops/lenovo-thinkpad.jpg",
    "/images/laptops/dell-alienware.jpg",
    "/images/laptops/apple-macbook-air.jpg",
    "/images/laptops/microsoft-surface.jpg",
    "/images/laptops/hp-spectre.jpg",
    "/images/laptops/samsung-galaxy-book.jpg",
    "/images/laptops/acer-predator.jpg",
    "/images/laptops/framework-laptop.jpg",
    "/images/laptops/msi-gaming.jpg",
]

DEFAULT_LAPTOP_IMAGE = SAMPLE_LAPTOP_IMAGE_PATHS[0]

MODEL_IMAGE_KEYWORDS: list[tuple[str, str]] = [
    ("macbook pro", "/images/laptops/apple-macbook-pro.jpg"),
    ("macbook air", "/images/laptops/apple-macbook-air.jpg"),
    ("apple", "/images/laptops/apple-macbook-pro.jpg"),
    ("alienware", "/images/laptops/dell-alienware.jpg"),
    ("xps", "/images/laptops/dell-xps.jpg"),
    ("dell", "/images/laptops/dell-xps.jpg"),
    ("thinkpad", "/images/laptops/lenovo-thinkpad.jpg"),
    ("legion", "/images/laptops/lenovo-thinkpad.jpg"),
    ("yoga", "/images/laptops/lenovo-thinkpad.jpg"),
    ("lenovo", "/images/laptops/lenovo-thinkpad.jpg"),
    ("zephyrus", "/images/laptops/asus-rog-zephyrus.jpg"),
    ("strix", "/images/laptops/asus-rog-zephyrus.jpg"),
    ("zenbook", "/images/laptops/asus-rog-zephyrus.jpg"),
    ("asus", "/images/laptops/asus-rog-zephyrus.jpg"),
    ("spectre", "/images/laptops/hp-spectre.jpg"),
    ("omen", "/images/laptops/hp-spectre.jpg"),
    ("hp", "/images/laptops/hp-spectre.jpg"),
    ("blade", "/images/laptops/razer-blade.jpg"),
    ("razer", "/images/laptops/razer-blade.jpg"),
    ("predator", "/images/laptops/acer-predator.jpg"),
    ("nitro", "/images/laptops/acer-predator.jpg"),
    ("acer", "/images/laptops/acer-predator.jpg"),
    ("surface", "/images/laptops/microsoft-surface.jpg"),
    ("microsoft", "/images/laptops/microsoft-surface.jpg"),
    ("galaxy book", "/images/laptops/samsung-galaxy-book.jpg"),
    ("samsung", "/images/laptops/samsung-galaxy-book.jpg"),
    ("raider", "/images/laptops/msi-gaming.jpg"),
    ("stealth", "/images/laptops/msi-gaming.jpg"),
    ("titan", "/images/laptops/msi-gaming.jpg"),
    ("msi", "/images/laptops/msi-gaming.jpg"),
    ("framework", "/images/laptops/framework-laptop.jpg"),
]


def resolve_laptop_image_by_name(name_or_brand: str) -> str:
    lower = name_or_brand.lower()
    for kw, path in MODEL_IMAGE_KEYWORDS:
        if kw in lower:
            return path
    return DEFAULT_LAPTOP_IMAGE


def _image_index(laptop_id: str) -> int:
    return sum(ord(c) for c in str(laptop_id)) % len(SAMPLE_LAPTOP_IMAGE_PATHS)


def _is_missing_image(url: str | None) -> bool:
    if not url or not str(url).strip():
        return True
    lower = str(url).strip().lower()
    return lower in ("null", "undefined", "none")


def resolve_laptop_image_url(laptop_id: str, image_url: str | None = None) -> str:
    """Return a guaranteed image path for API responses."""
    if not _is_missing_image(image_url) and "unsplash.com" not in str(image_url).lower():
        if str(image_url).startswith("/images/laptops/"):
            return str(image_url)
    return SAMPLE_LAPTOP_IMAGE_PATHS[_image_index(laptop_id)]

