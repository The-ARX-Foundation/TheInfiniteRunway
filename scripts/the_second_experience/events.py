"""
Events System — Random events, crises, and narrative encounters.

Baldur's Gate-style event system with branching choices,
consequences, and emergent storytelling.
"""

import random
from dataclasses import dataclass, field
from enum import Enum
from typing import Dict, List, Optional, Callable, Any

from .world import CityState, World, ResourceType, Season, DiplomaticStatus


class EventCategory(Enum):
    NATURAL = "Natural Disaster"
    ECONOMIC = "Economic Event"
    POLITICAL = "Political Crisis"
    MILITARY = "Military Event"
    CULTURAL = "Cultural Event"
    DIVINE = "Divine Omen"
    TRADE = "Trade Event"
    DISCOVERY = "Discovery"


@dataclass
class EventChoice:
    """A choice the player/agent can make in response to an event."""
    text: str
    effects: Dict[str, Any] = field(default_factory=dict)
    narration: str = ""  # what happens if chosen
    skill_check: Optional[str] = None  # e.g., "governance:3" means need Governance L3+
    risk: float = 0.0  # 0-1, chance of bad outcome


@dataclass
class GameEvent:
    """A narrative event that affects the world."""
    name: str
    category: EventCategory
    description: str
    choices: List[EventChoice] = field(default_factory=list)
    target_city: Optional[str] = None
    global_event: bool = False
    turn: int = 0

    # Conditions for triggering
    min_turn: int = 0
    season_req: Optional[Season] = None
    probability: float = 0.1

    def narrate(self) -> str:
        """Full narrative display."""
        lines = [
            f"--- {self.category.value} ---",
            f"  {self.name}",
            "",
            f"  {self.description}",
            "",
        ]
        if self.choices:
            lines.append("  What will you do?")
            for i, choice in enumerate(self.choices, 1):
                risk_str = ""
                if choice.risk > 0.3:
                    risk_str = " [RISKY]"
                elif choice.risk > 0:
                    risk_str = " [some risk]"
                skill_str = ""
                if choice.skill_check:
                    skill_str = f" (requires {choice.skill_check})"
                lines.append(f"    {i}. {choice.text}{skill_str}{risk_str}")
        return "\n".join(lines)


# ===== EVENT TEMPLATES =====

def _plague_event(city_name: str) -> GameEvent:
    return GameEvent(
        name="The Wasting Plague",
        category=EventCategory.NATURAL,
        description=(
            f"A terrible sickness spreads through the streets of {city_name}. "
            "Citizens collapse in the agora, and the air hangs heavy with despair. "
            "The physicians are overwhelmed."
        ),
        target_city=city_name,
        choices=[
            EventChoice(
                text="Quarantine the sick — sacrifice some to save many",
                effects={"population_loss": 0.05, "stability": 0.1, "happiness": -0.1},
                narration="The quarantine holds. Losses are contained, but the people mourn.",
                skill_check="medicine:2",
            ),
            EventChoice(
                text="Open the temples — pray for divine intervention",
                effects={"faith": 20, "population_loss": 0.10, "happiness": 0.05},
                narration="The faithful gather. Some find comfort; others find only death.",
                risk=0.4,
            ),
            EventChoice(
                text="Burn the infected quarter — extreme measures",
                effects={"population_loss": 0.08, "stability": -0.15, "grain": -100},
                narration="Fire consumes the plague district. The disease retreats, but at what cost?",
                risk=0.3,
            ),
            EventChoice(
                text="Send scholars to study the disease",
                effects={"knowledge": 30, "population_loss": 0.12, "research_medicine": 50},
                narration="The scholars work tirelessly. Many die, but knowledge is gained.",
                skill_check="medicine:3",
            ),
        ],
    )


def _trade_boom_event(city_name: str) -> GameEvent:
    return GameEvent(
        name="The Golden Caravan",
        category=EventCategory.TRADE,
        description=(
            f"A massive caravan from distant lands arrives at {city_name}'s gates! "
            "They carry exotic goods and tales of far-off empires. "
            "The merchants are eager to deal."
        ),
        target_city=city_name,
        choices=[
            EventChoice(
                text="Welcome them with open markets — free trade!",
                effects={"gold": 200, "culture": 15, "trade_routes": 1},
                narration="Commerce flows freely. Gold fills the coffers and ideas fill the minds.",
            ),
            EventChoice(
                text="Impose heavy tariffs — protect local merchants",
                effects={"gold": 100, "happiness_merchants": -0.1},
                narration="The tariffs fill the treasury, but the foreign merchants grumble.",
            ),
            EventChoice(
                text="Seize their goods — they're in our territory now",
                effects={"stockpile_bonus": 300, "reputation": -0.3, "stability": -0.1},
                narration="The caravan is stripped bare. Word of this treachery will spread.",
                risk=0.5,
            ),
        ],
    )


def _earthquake_event(city_name: str) -> GameEvent:
    return GameEvent(
        name="Poseidon's Wrath",
        category=EventCategory.NATURAL,
        description=(
            f"The ground beneath {city_name} trembles violently! "
            "Buildings crack, the harbor wall crumbles, and citizens flee to open ground. "
            "The earth god is displeased."
        ),
        target_city=city_name,
        choices=[
            EventChoice(
                text="Rebuild immediately — mobilize all labor",
                effects={"timber": -100, "stone": -150, "stability": 0.1, "buildings_lost": 1},
                narration="The people rally. Through sweat and stone, the city rises again.",
            ),
            EventChoice(
                text="Use this as a chance to redesign the city",
                effects={"timber": -200, "stone": -200, "culture": 20, "architecture_research": 40},
                narration="From rubble comes vision. The new districts are marvels of design.",
                skill_check="architecture:3",
            ),
            EventChoice(
                text="Appeal to allies for aid",
                effects={"diplomacy_test": True, "stability": -0.05},
                narration="Messengers ride to neighboring cities. Will they answer the call?",
            ),
        ],
    )


def _philosophical_debate_event(city_name: str) -> GameEvent:
    return GameEvent(
        name="The Great Dialectic",
        category=EventCategory.CULTURAL,
        description=(
            f"Two rival philosophers draw crowds in {city_name}'s agora. "
            "One argues for the supremacy of reason; the other for the divine will. "
            "The city watches, divided."
        ),
        target_city=city_name,
        choices=[
            EventChoice(
                text="Support the rationalist — fund a school of logic",
                effects={"knowledge": 25, "faith": -10, "scholars": 10},
                narration="The Academy of Reason opens its doors. Truth through argument prevails.",
            ),
            EventChoice(
                text="Support the theologian — build a grand temple",
                effects={"faith": 30, "knowledge": -5, "priests": 10, "marble": -50},
                narration="The temple rises, its columns gleaming. The faithful gather in devotion.",
            ),
            EventChoice(
                text="Let them debate freely — the best idea wins",
                effects={"culture": 20, "happiness": 0.05, "knowledge": 10, "faith": 10},
                narration="The debate rages for days. Both sides sharpen their arguments. The city is richer for it.",
            ),
        ],
    )


def _slave_revolt_event(city_name: str) -> GameEvent:
    return GameEvent(
        name="Chains Broken",
        category=EventCategory.POLITICAL,
        description=(
            f"The enslaved people of {city_name} have risen! "
            "Armed with stolen tools and desperate courage, they barricade "
            "the harbor district. Their leader demands freedom or death."
        ),
        target_city=city_name,
        choices=[
            EventChoice(
                text="Crush the revolt with military force",
                effects={"slaves_lost": 0.3, "stability": 0.1, "happiness": -0.15, "soldiers_lost": 10},
                narration="Blood runs in the streets. Order is restored, but at a terrible price.",
                risk=0.3,
            ),
            EventChoice(
                text="Negotiate — free some, compensate owners",
                effects={"slaves_freed": 0.5, "gold": -200, "happiness": 0.1, "stability": 0.05},
                narration="Compromise is reached. Some find freedom; others find coin. Peace holds.",
            ),
            EventChoice(
                text="Abolish slavery entirely — a new era begins",
                effects={"slaves_freed": 1.0, "happiness": 0.2, "stability": -0.1, "culture": 30, "labor_loss": True},
                narration="The chains fall. The city trembles with change. History will remember this day.",
            ),
            EventChoice(
                text="Offer the rebels land outside the walls",
                effects={"slaves_freed": 0.4, "population_loss": 0.03, "stability": 0.05},
                narration="A new settlement rises beyond the walls. Former slaves become farmers.",
            ),
        ],
    )


def _market_crash_event(city_name: str) -> GameEvent:
    return GameEvent(
        name="The Great Panic",
        category=EventCategory.ECONOMIC,
        description=(
            f"Rumors of debased coinage spread through {city_name}'s markets! "
            "Merchants hoard goods, prices skyrocket, and citizens rush to the "
            "grain stores. Confidence is collapsing."
        ),
        target_city=city_name,
        choices=[
            EventChoice(
                text="Open the state granaries — stabilize prices",
                effects={"grain": -200, "stability": 0.15, "happiness": 0.1},
                narration="The granaries open. Prices stabilize. The people breathe easier.",
            ),
            EventChoice(
                text="Let the market correct itself — the invisible hand",
                effects={"gold": -100, "stability": -0.1, "happiness": -0.1},
                narration="The correction is brutal. Weaker merchants fall; stronger ones survive.",
                risk=0.4,
            ),
            EventChoice(
                text="Mint new coins backed by silver reserves",
                effects={"silver": -100, "stability": 0.1, "trade_confidence": 0.2},
                narration="Fresh silver coins restore confidence. The economy breathes again.",
                skill_check="trade:2",
            ),
        ],
    )


def _barbarian_raid_event(city_name: str) -> GameEvent:
    return GameEvent(
        name="Riders on the Horizon",
        category=EventCategory.MILITARY,
        description=(
            f"Scouts report a large raiding party approaching {city_name}! "
            "Their banners are unknown, but their intent is clear. "
            "The watchtowers sound the alarm."
        ),
        target_city=city_name,
        choices=[
            EventChoice(
                text="Man the walls — defend the city!",
                effects={"military_battle": True, "grain": -50},
                narration="Arrows fly, shields clash. The city stands defiant!",
            ),
            EventChoice(
                text="Pay tribute — gold is cheaper than blood",
                effects={"gold": -300, "stability": -0.05, "happiness": -0.05},
                narration="Gold changes hands. The raiders depart... for now.",
            ),
            EventChoice(
                text="Send an envoy — negotiate an alliance",
                effects={"diplomacy_test": True, "risk_battle": True},
                narration="A brave soul rides out under flag of truce. The camp waits in silence.",
                risk=0.5,
                skill_check="governance:2",
            ),
        ],
    )


def _divine_omen_event(city_name: str) -> GameEvent:
    return GameEvent(
        name="The Oracle Speaks",
        category=EventCategory.DIVINE,
        description=(
            f"The Oracle at the temple of {city_name} falls into a trance! "
            "Her words echo through the marble halls: \"A great change comes. "
            "The stars align for those bold enough to seize destiny.\""
        ),
        target_city=city_name,
        choices=[
            EventChoice(
                text="Heed the oracle — invest in the prophesied domain",
                effects={"faith": 15, "random_tech_boost": 30, "culture": 10},
                narration="The city acts on faith. Whether wisdom or folly, time will tell.",
            ),
            EventChoice(
                text="Dismiss it as superstition — focus on practical matters",
                effects={"faith": -10, "knowledge": 15, "stability": 0.05},
                narration="The scholars nod approvingly. The priests mutter darkly.",
            ),
        ],
    )


def _discovery_event(city_name: str) -> GameEvent:
    resource = random.choice([ResourceType.GOLD, ResourceType.SILVER, ResourceType.MARBLE, ResourceType.IRON])
    return GameEvent(
        name="The Hidden Vein",
        category=EventCategory.DISCOVERY,
        description=(
            f"Miners in the hills near {city_name} have struck something extraordinary — "
            f"a rich vein of {resource.value}! The discovery could reshape the city's fortune."
        ),
        target_city=city_name,
        choices=[
            EventChoice(
                text="State-controlled mining operation",
                effects={"resource_discovery": resource.value, "amount": 200, "corruption": 0.02},
                narration="The state takes control. Production begins under watchful eyes.",
            ),
            EventChoice(
                text="Grant mining rights to merchants — private enterprise",
                effects={"resource_discovery": resource.value, "amount": 150, "merchants_bonus": 20, "tax_revenue": 50},
                narration="Merchants bid furiously. The mine changes hands. Commerce thrives.",
            ),
            EventChoice(
                text="Establish a worker-owned cooperative",
                effects={"resource_discovery": resource.value, "amount": 120, "happiness": 0.1, "equality_bonus": True},
                narration="The miners own their labor. It's slower, but spirits are high.",
            ),
        ],
    )


# Master event list
EVENT_GENERATORS = [
    _plague_event,
    _trade_boom_event,
    _earthquake_event,
    _philosophical_debate_event,
    _slave_revolt_event,
    _market_crash_event,
    _barbarian_raid_event,
    _divine_omen_event,
    _discovery_event,
]


def generate_event(world: World) -> Optional[GameEvent]:
    """
    Potentially generate a random event for this turn.
    Events become more likely as the game progresses.
    """
    # Base probability increases with turns
    base_prob = 0.15 + (world.turn * 0.005)
    base_prob = min(base_prob, 0.6)

    if random.random() > base_prob:
        return None

    # Pick a random city
    if not world.cities:
        return None
    city_name = random.choice(list(world.cities.keys()))

    # Pick a random event type
    generator = random.choice(EVENT_GENERATORS)
    event = generator(city_name)
    event.turn = world.turn

    # Season-specific modifiers
    if world.season == Season.WINTER:
        # More likely for crises in winter
        if event.category in (EventCategory.NATURAL, EventCategory.ECONOMIC):
            return event
    if world.season == Season.SPRING:
        # More likely for discoveries and trade in spring
        if event.category in (EventCategory.TRADE, EventCategory.DISCOVERY):
            return event

    return event


def apply_event_choice(
    city: CityState, event: GameEvent, choice_idx: int, world: World
) -> str:
    """Apply the effects of an event choice and return narration."""
    if choice_idx >= len(event.choices):
        return "No valid choice made."

    choice = event.choices[choice_idx]
    effects = choice.effects
    narration_lines = [choice.narration]

    # Risk roll
    if choice.risk > 0 and random.random() < choice.risk:
        narration_lines.append("  ** But fate is cruel... things go worse than expected! **")
        # Double negative effects
        for key in list(effects.keys()):
            val = effects[key]
            if isinstance(val, (int, float)) and val < 0:
                effects[key] = val * 1.5

    # Apply effects
    if "population_loss" in effects:
        loss = effects["population_loss"]
        lost = int(city.population.citizens * loss)
        city.population.citizens = max(10, city.population.citizens - lost)
        narration_lines.append(f"  Lost {lost} citizens.")

    if "gold" in effects:
        city.treasury.gold_reserves += effects["gold"]
        city.treasury.gold_reserves = max(0, city.treasury.gold_reserves)

    if "silver" in effects:
        city.treasury.silver_reserves += effects["silver"]
        city.treasury.silver_reserves = max(0, city.treasury.silver_reserves)

    if "grain" in effects:
        grain = city.stockpile.get(ResourceType.GRAIN, 0) + effects["grain"]
        city.stockpile[ResourceType.GRAIN] = max(0, grain)

    if "timber" in effects:
        timber = city.stockpile.get(ResourceType.TIMBER, 0) + effects["timber"]
        city.stockpile[ResourceType.TIMBER] = max(0, timber)

    if "stone" in effects:
        stone = city.stockpile.get(ResourceType.STONE, 0) + effects["stone"]
        city.stockpile[ResourceType.STONE] = max(0, stone)

    if "marble" in effects:
        marble = city.stockpile.get(ResourceType.MARBLE, 0) + effects["marble"]
        city.stockpile[ResourceType.MARBLE] = max(0, marble)

    if "stability" in effects:
        city.stability = max(0.05, min(1.0, city.stability + effects["stability"]))

    if "happiness" in effects:
        city.happiness = max(0.05, min(1.0, city.happiness + effects["happiness"]))

    if "faith" in effects:
        city.faith_points += effects["faith"]

    if "culture" in effects:
        city.culture_points += effects["culture"]

    if "knowledge" in effects:
        city.stockpile[ResourceType.KNOWLEDGE] = (
            city.stockpile.get(ResourceType.KNOWLEDGE, 0) + effects["knowledge"]
        )

    if "scholars" in effects:
        city.population.scholars += effects["scholars"]

    if "priests" in effects:
        city.population.priests += effects["priests"]

    if "slaves_freed" in effects:
        freed = int(city.population.slaves * effects["slaves_freed"])
        city.population.slaves -= freed
        city.population.citizens += freed
        narration_lines.append(f"  {freed} enslaved people gained freedom.")

    if "corruption" in effects:
        city.treasury.corruption_level = min(
            0.5, city.treasury.corruption_level + effects["corruption"]
        )

    if "resource_discovery" in effects:
        res = ResourceType(effects["resource_discovery"])
        amount = effects.get("amount", 100)
        city.stockpile[res] = city.stockpile.get(res, 0) + amount
        # Also boost natural production
        city.natural_resources[res] = city.natural_resources.get(res, 0) + amount * 0.1
        narration_lines.append(f"  Gained {amount} {res.value} and a new production source!")

    if "soldiers_lost" in effects:
        city.population.soldiers = max(0, city.population.soldiers - effects["soldiers_lost"])

    return "\n".join(narration_lines)
