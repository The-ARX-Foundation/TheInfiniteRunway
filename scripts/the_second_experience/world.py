"""
World State — The living world model for The Second Experience.

Tracks global state: all city-states, resources, trade routes,
diplomatic relations, global events, and the passage of time.
"""

import random
from dataclasses import dataclass, field
from enum import Enum
from typing import Dict, List, Optional, Tuple


class Season(Enum):
    SPRING = "Spring"
    SUMMER = "Summer"
    AUTUMN = "Autumn"
    WINTER = "Winter"


class DiplomaticStatus(Enum):
    WAR = "War"
    HOSTILE = "Hostile"
    COLD = "Cold"
    NEUTRAL = "Neutral"
    FRIENDLY = "Friendly"
    ALLIED = "Allied"
    TRADE_PACT = "Trade Pact"


class ResourceType(Enum):
    # Primary resources
    GRAIN = "Grain"
    TIMBER = "Timber"
    STONE = "Stone"
    IRON = "Iron"
    GOLD = "Gold"
    WINE = "Wine"
    OLIVE_OIL = "Olive Oil"
    CLAY = "Clay"
    MARBLE = "Marble"
    SILVER = "Silver"

    # Manufactured goods
    TOOLS = "Tools"
    WEAPONS = "Weapons"
    POTTERY = "Pottery"
    TEXTILES = "Textiles"
    SHIPS = "Ships"
    SCULPTURES = "Sculptures"

    # Abstract resources
    KNOWLEDGE = "Knowledge"
    CULTURE = "Culture"
    FAITH = "Faith"
    INFLUENCE = "Influence"


class TechDomain(Enum):
    AGRICULTURE = "Agriculture"
    MILITARY = "Military"
    TRADE = "Trade"
    PHILOSOPHY = "Philosophy"
    ARCHITECTURE = "Architecture"
    METALLURGY = "Metallurgy"
    NAVIGATION = "Navigation"
    GOVERNANCE = "Governance"
    MEDICINE = "Medicine"
    ARTS = "Arts"


# Resource production recipes: input -> output
PRODUCTION_RECIPES = {
    ResourceType.TOOLS: {ResourceType.IRON: 2, ResourceType.TIMBER: 1},
    ResourceType.WEAPONS: {ResourceType.IRON: 3, ResourceType.TIMBER: 1},
    ResourceType.POTTERY: {ResourceType.CLAY: 2},
    ResourceType.TEXTILES: {ResourceType.GRAIN: 1},  # flax from grain fields
    ResourceType.SHIPS: {ResourceType.TIMBER: 5, ResourceType.IRON: 2},
    ResourceType.SCULPTURES: {ResourceType.MARBLE: 3, ResourceType.TOOLS: 1},
}

# What each resource is worth in base trade value
BASE_TRADE_VALUES = {
    ResourceType.GRAIN: 1,
    ResourceType.TIMBER: 2,
    ResourceType.STONE: 2,
    ResourceType.IRON: 4,
    ResourceType.GOLD: 10,
    ResourceType.WINE: 3,
    ResourceType.OLIVE_OIL: 3,
    ResourceType.CLAY: 1,
    ResourceType.MARBLE: 5,
    ResourceType.SILVER: 7,
    ResourceType.TOOLS: 6,
    ResourceType.WEAPONS: 8,
    ResourceType.POTTERY: 3,
    ResourceType.TEXTILES: 4,
    ResourceType.SHIPS: 15,
    ResourceType.SCULPTURES: 12,
    ResourceType.KNOWLEDGE: 5,
    ResourceType.CULTURE: 4,
    ResourceType.FAITH: 3,
    ResourceType.INFLUENCE: 6,
}


@dataclass
class Population:
    """Demographics of a city-state."""
    citizens: int = 1000
    slaves: int = 200
    merchants: int = 100
    soldiers: int = 150
    scholars: int = 50
    artisans: int = 80
    priests: int = 30

    @property
    def total(self) -> int:
        return (self.citizens + self.slaves + self.merchants +
                self.soldiers + self.scholars + self.artisans + self.priests)

    @property
    def labor_force(self) -> int:
        """Available workers for production."""
        return self.citizens + self.slaves + self.artisans

    @property
    def military_strength(self) -> int:
        return self.soldiers * 10  # base combat power

    def grow(self, happiness: float, food_ratio: float):
        """Population growth based on happiness and food availability."""
        growth_rate = 0.01 * happiness * min(food_ratio, 1.5)
        if food_ratio < 0.5:
            # Famine — population shrinks
            growth_rate = -0.03 * (1 - food_ratio)

        for attr in ['citizens', 'merchants', 'artisans']:
            current = getattr(self, attr)
            delta = max(-current, int(current * growth_rate))
            setattr(self, attr, current + delta)

        # Scholars and priests grow slower
        for attr in ['scholars', 'priests']:
            current = getattr(self, attr)
            delta = max(-current, int(current * growth_rate * 0.5))
            setattr(self, attr, current + delta)


@dataclass
class Technology:
    """Tech tree for a city-state."""
    levels: Dict[TechDomain, int] = field(default_factory=lambda: {
        domain: 1 for domain in TechDomain
    })
    research_points: Dict[TechDomain, float] = field(default_factory=lambda: {
        domain: 0.0 for domain in TechDomain
    })

    def research(self, domain: TechDomain, points: float):
        """Add research points. Level up at threshold."""
        self.research_points[domain] += points
        threshold = self.levels[domain] * 100  # increasing cost
        if self.research_points[domain] >= threshold:
            self.research_points[domain] -= threshold
            self.levels[domain] += 1
            return True  # leveled up
        return False

    def get_bonus(self, domain: TechDomain) -> float:
        """Production/effectiveness bonus from tech level."""
        return 1.0 + (self.levels[domain] - 1) * 0.15


@dataclass
class Treasury:
    """Financial state of a city-state."""
    gold_reserves: float = 500.0
    silver_reserves: float = 200.0
    tax_rate: float = 0.10  # 10% base tax
    trade_tariff: float = 0.05  # 5% on imports
    debt: float = 0.0
    corruption_level: float = 0.05  # 5% of revenue lost to corruption

    @property
    def net_worth(self) -> float:
        return self.gold_reserves + self.silver_reserves * 0.7 - self.debt

    def collect_taxes(self, population: Population, happiness: float) -> float:
        """Collect taxes. Compliance scales with happiness."""
        compliance = min(1.0, happiness * 0.8 + 0.2)
        base_revenue = population.total * self.tax_rate * 2.0
        actual_revenue = base_revenue * compliance * (1 - self.corruption_level)
        self.gold_reserves += actual_revenue
        return actual_revenue

    def pay_expenses(self, population: Population) -> float:
        """Pay military, scholars, priests."""
        military_cost = population.soldiers * 3.0
        scholar_cost = population.scholars * 2.0
        priest_cost = population.priests * 1.5
        total = military_cost + scholar_cost + priest_cost
        self.gold_reserves -= total
        if self.gold_reserves < 0:
            self.debt += abs(self.gold_reserves)
            self.gold_reserves = 0
        return total


@dataclass
class CityState:
    """A complete city-state in the simulation."""
    name: str
    governor_id: str  # which AI agent governs this
    motto: str = ""

    # Core systems
    population: Population = field(default_factory=Population)
    technology: Technology = field(default_factory=Technology)
    treasury: Treasury = field(default_factory=Treasury)

    # Resources
    stockpile: Dict[ResourceType, float] = field(default_factory=lambda: {
        ResourceType.GRAIN: 500,
        ResourceType.TIMBER: 200,
        ResourceType.STONE: 150,
        ResourceType.IRON: 50,
        ResourceType.CLAY: 100,
    })

    # Natural resource production rates (per turn, before modifiers)
    natural_resources: Dict[ResourceType, float] = field(default_factory=dict)

    # State
    happiness: float = 0.7  # 0-1 scale
    stability: float = 0.8  # 0-1 scale
    culture_points: float = 0.0
    faith_points: float = 0.0

    # Infrastructure
    buildings: List[str] = field(default_factory=list)
    trade_routes: List[str] = field(default_factory=list)  # city names

    # History
    turn_founded: int = 0
    events_log: List[str] = field(default_factory=list)

    @property
    def food_ratio(self) -> float:
        """How well-fed is the population? grain / (pop * consumption_rate)"""
        grain = self.stockpile.get(ResourceType.GRAIN, 0)
        needed = self.population.total * 0.5  # 0.5 grain per person per turn
        return grain / max(needed, 1)

    def produce_resources(self):
        """Generate resources from natural production + labor."""
        ag_bonus = self.technology.get_bonus(TechDomain.AGRICULTURE)
        labor = self.population.labor_force

        for resource, base_rate in self.natural_resources.items():
            # Production = base_rate * tech_bonus * sqrt(labor/100)
            labor_factor = (labor / 100) ** 0.5
            produced = base_rate * ag_bonus * labor_factor
            self.stockpile[resource] = self.stockpile.get(resource, 0) + produced

    def consume_resources(self):
        """Population consumes grain and other basics."""
        grain_needed = self.population.total * 0.5
        grain_available = self.stockpile.get(ResourceType.GRAIN, 0)
        consumed = min(grain_needed, grain_available)
        self.stockpile[ResourceType.GRAIN] = grain_available - consumed

        # Wine and olive oil boost happiness
        wine = self.stockpile.get(ResourceType.WINE, 0)
        if wine > 0:
            wine_consumed = min(wine, self.population.total * 0.05)
            self.stockpile[ResourceType.WINE] -= wine_consumed
            self.happiness = min(1.0, self.happiness + 0.01)

    def manufacture(self, product: ResourceType, quantity: int = 1) -> bool:
        """Attempt to manufacture goods from raw materials."""
        recipe = PRODUCTION_RECIPES.get(product)
        if not recipe:
            return False

        # Check if we have enough inputs
        for input_resource, amount_needed in recipe.items():
            if self.stockpile.get(input_resource, 0) < amount_needed * quantity:
                return False

        # Consume inputs, produce output
        for input_resource, amount_needed in recipe.items():
            self.stockpile[input_resource] -= amount_needed * quantity

        tech_bonus = self.technology.get_bonus(TechDomain.METALLURGY)
        produced = quantity * tech_bonus
        self.stockpile[product] = self.stockpile.get(product, 0) + produced
        return True

    def update_happiness(self):
        """Recalculate happiness based on multiple factors."""
        factors = []
        # Food
        factors.append(min(1.0, self.food_ratio) * 0.3)
        # Wealth
        wealth_per_capita = self.treasury.net_worth / max(self.population.total, 1)
        factors.append(min(1.0, wealth_per_capita / 5.0) * 0.2)
        # Low taxes
        factors.append((1.0 - self.treasury.tax_rate) * 0.15)
        # Culture
        culture_per_capita = self.culture_points / max(self.population.total, 1)
        factors.append(min(1.0, culture_per_capita / 2.0) * 0.15)
        # Stability
        factors.append(self.stability * 0.2)

        self.happiness = max(0.05, min(1.0, sum(factors)))

    def update_stability(self):
        """Stability based on happiness, military, corruption."""
        mil_ratio = self.population.soldiers / max(self.population.total, 1)
        stability_factors = [
            self.happiness * 0.4,
            min(1.0, mil_ratio * 10) * 0.2,  # some military helps
            (1.0 - self.treasury.corruption_level) * 0.2,
            (1.0 - min(1.0, self.treasury.debt / 1000)) * 0.2,
        ]
        target = sum(stability_factors)
        # Stability moves slowly toward target
        self.stability += (target - self.stability) * 0.3
        self.stability = max(0.05, min(1.0, self.stability))

    def summary(self) -> str:
        """Human-readable summary of city state."""
        lines = [
            f"=== {self.name} ===",
            f"  Motto: \"{self.motto}\"",
            f"  Governor: {self.governor_id}",
            f"  Population: {self.population.total:,}",
            f"    Citizens: {self.population.citizens} | Merchants: {self.population.merchants}",
            f"    Soldiers: {self.population.soldiers} | Scholars: {self.population.scholars}",
            f"    Artisans: {self.population.artisans} | Priests: {self.population.priests}",
            f"  Happiness: {self.happiness:.0%} | Stability: {self.stability:.0%}",
            f"  Treasury: {self.treasury.gold_reserves:.0f}g / {self.treasury.silver_reserves:.0f}s",
            f"  Tax Rate: {self.treasury.tax_rate:.0%} | Debt: {self.treasury.debt:.0f}",
            f"  Food Ratio: {self.food_ratio:.1f}x",
            f"  Key Resources:",
        ]
        for res, amount in sorted(self.stockpile.items(), key=lambda x: -x[1])[:6]:
            if amount > 0:
                lines.append(f"    {res.value}: {amount:.0f}")

        top_tech = sorted(self.technology.levels.items(), key=lambda x: -x[1])[:3]
        lines.append(f"  Top Tech: {', '.join(f'{d.value} L{l}' for d, l in top_tech)}")

        return "\n".join(lines)


@dataclass
class TradeOffer:
    """A trade proposal between city-states."""
    from_city: str
    to_city: str
    offering: Dict[ResourceType, float]
    requesting: Dict[ResourceType, float]
    turn_proposed: int = 0
    accepted: bool = False


@dataclass
class World:
    """The complete world state."""
    cities: Dict[str, CityState] = field(default_factory=dict)
    diplomacy: Dict[Tuple[str, str], DiplomaticStatus] = field(default_factory=dict)
    pending_trades: List[TradeOffer] = field(default_factory=list)
    global_events: List[str] = field(default_factory=list)
    turn: int = 0
    year: int = 1
    season: Season = Season.SPRING

    def advance_season(self):
        """Move to next season."""
        seasons = list(Season)
        idx = seasons.index(self.season)
        self.season = seasons[(idx + 1) % 4]
        if self.season == Season.SPRING:
            self.year += 1

    def get_diplomacy(self, city_a: str, city_b: str) -> DiplomaticStatus:
        """Get diplomatic status between two cities."""
        key = tuple(sorted([city_a, city_b]))
        return self.diplomacy.get(key, DiplomaticStatus.NEUTRAL)

    def set_diplomacy(self, city_a: str, city_b: str, status: DiplomaticStatus):
        """Set diplomatic status between two cities."""
        key = tuple(sorted([city_a, city_b]))
        self.diplomacy[key] = status

    def execute_trade(self, trade: TradeOffer) -> bool:
        """Execute an accepted trade between cities."""
        from_city = self.cities.get(trade.from_city)
        to_city = self.cities.get(trade.to_city)
        if not from_city or not to_city:
            return False

        # Verify both sides can fulfill
        for res, amount in trade.offering.items():
            if from_city.stockpile.get(res, 0) < amount:
                return False
        for res, amount in trade.requesting.items():
            if to_city.stockpile.get(res, 0) < amount:
                return False

        # Execute transfer
        for res, amount in trade.offering.items():
            from_city.stockpile[res] -= amount
            to_city.stockpile[res] = to_city.stockpile.get(res, 0) + amount

        for res, amount in trade.requesting.items():
            to_city.stockpile[res] -= amount
            from_city.stockpile[res] = from_city.stockpile.get(res, 0) + amount

        # Apply tariffs
        tariff_a = from_city.treasury.trade_tariff
        tariff_b = to_city.treasury.trade_tariff
        trade_value = sum(
            BASE_TRADE_VALUES.get(r, 1) * a for r, a in trade.offering.items()
        )
        from_city.treasury.gold_reserves += trade_value * tariff_a
        to_city.treasury.gold_reserves += trade_value * tariff_b

        return True

    def world_summary(self) -> str:
        """Full world state summary."""
        lines = [
            f"{'='*60}",
            f"  THE SECOND EXPERIENCE — Year {self.year}, {self.season.value}",
            f"  Turn {self.turn}",
            f"{'='*60}",
            "",
        ]
        for city in self.cities.values():
            lines.append(city.summary())
            lines.append("")

        # Diplomatic relations
        if self.diplomacy:
            lines.append("--- Diplomatic Relations ---")
            for (a, b), status in self.diplomacy.items():
                if status != DiplomaticStatus.NEUTRAL:
                    lines.append(f"  {a} <-> {b}: {status.value}")
            lines.append("")

        return "\n".join(lines)
