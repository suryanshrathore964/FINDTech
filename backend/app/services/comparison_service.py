from __future__ import annotations

from app.core.exceptions import NotFoundError, ValidationError
from app.repositories.laptop_repository import LaptopRepository
from app.schemas.comparison import CategoryWinner, ComparisonResponse
from app.schemas.laptop import LaptopResponse


class ComparisonService:
    def __init__(self, laptop_repo: LaptopRepository | None = None):
        self.laptop_repo = laptop_repo or LaptopRepository()

    async def compare(self, laptop_ids: list[str]) -> ComparisonResponse:
        if len(laptop_ids) < 2:
            raise ValidationError("At least 2 laptops required for comparison")

        docs = await self.laptop_repo.find_by_ids(laptop_ids)
        if len(docs) < 2:
            raise NotFoundError("One or more laptops not found")

        laptops = [LaptopResponse.from_document(d) for d in docs]
        winners = self._compute_winners(laptops)
        summary = self._build_summary(laptops, winners)

        return ComparisonResponse(laptops=laptops, winners=winners, summary=summary)

    def _compute_winners(self, laptops: list[LaptopResponse]) -> list[CategoryWinner]:
        categories = [
            ("price", "Lowest price", lambda lp: lp.price, min),
            ("rating", "Highest rating", lambda lp: lp.rating, max),
            ("ram", "Most RAM", lambda lp: lp.ram_gb, max),
            ("storage", "Most storage", lambda lp: lp.storage_gb, max),
            ("battery", "Best battery", lambda lp: lp.battery_hours, max),
            ("portability", "Lightest", lambda lp: lp.weight_kg, min),
        ]
        winners: list[CategoryWinner] = []
        for key, label, getter, agg in categories:
            best = agg(laptops, key=getter)
            winners.append(
                CategoryWinner(
                    category=key,
                    winner_id=best.id,
                    winner_name=best.name,
                    reason=f"{label}: {getter(best)}",
                )
            )
        return winners

    def _build_summary(
        self, laptops: list[LaptopResponse], winners: list[CategoryWinner]
    ) -> str:
        names = ", ".join(lp.name for lp in laptops)
        win_counts: dict[str, int] = {}
        for w in winners:
            win_counts[w.winner_id] = win_counts.get(w.winner_id, 0) + 1
        top_id = max(win_counts, key=win_counts.get)
        top = next(lp for lp in laptops if lp.id == top_id)
        return (
            f"Compared {len(laptops)} laptops ({names}). "
            f"{top.brand} {top.name} leads with {win_counts[top_id]} category wins."
        )
