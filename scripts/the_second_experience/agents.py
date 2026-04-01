"""
AI Governor Agents — The minds behind each city-state.

Each agent has:
- A unique personality and economic philosophy
- A reward function that scores world states
- Decision-making logic for each turn
- The ability to observe and police other agents' actions
"""

import random
import math
from dataclasses import dataclass, field
from enum import Enum
from typing import Dict, List, Optional, Tuple, Any

from .world import (
    CityState, World, ResourceType, TechDomain, DiplomaticStatus,
    TradeOffer, PRODUCTION_RECIPES, BASE_TRADE_VALUES, Season,
)


class EconomicPhilosophy(Enum):
    MERCANTILIST = "Mercantilist"      # Hoard gold, maximize exports
    FREE_MARKET = "Free Market"         # Low taxes, free trade
    MILITARIST = "Militarist"           # Conquest and tribute
    COLLECTIVIST = "Collectivist"       # Equality, shared resources
    TECHNOCRAT = "Technocrat"           # Knowledge above all
    THEOCRAT = "Theocrat"               # Faith and culture first


class ActionType(Enum):
    SET_TAX_RATE = "set_tax_rate"
    SET_TARIFF = "set_tariff"
    RECRUIT_SOLDIERS = "recruit_soldiers"
    HIRE_SCHOLARS = "hire_scholars"
    HIRE_ARTISANS = "hire_artisans"
    HIRE_PRIESTS = "hire_priests"
    MANUFACTURE = "manufacture"
    PROPOSE_TRADE = "propose_trade"
    DECLARE_WAR = "declare_war"
    PROPOSE_ALLIANCE = "propose_alliance"
    RESEARCH = "research"
    BUILD = "build"
    INVEST_CULTURE = "invest_culture"
    SANCTION = "sanction"            # Policing action
    CALL_VOTE = "call_vote"          # Democratic policing
    FORGIVE = "forgive"              # Release sanction


@dataclass
class AgentAction:
    """A single action taken by an agent in a turn."""
    action_type: ActionType
    params: Dict[str, Any] = field(default_factory=dict)
    reasoning: str = ""


@dataclass
class Violation:
    """A detected violation by the policing system."""
    violator: str  # agent id
    reporter: str  # agent id who detected it
    violation_type: str
    severity: float  # 0-1
    description: str
    turn: int = 0
    resolved: bool = False


@dataclass
class RewardBreakdown:
    """Detailed breakdown of an agent's reward calculation."""
    components: Dict[str, float] = field(default_factory=dict)
    total: float = 0.0
    explanation: str = ""

    def add(self, name: str, value: float, weight: float = 1.0):
        weighted = value * weight
        self.components[name] = weighted
        self.total += weighted

    def summary(self) -> str:
        lines = [f"Total Reward: {self.total:.2f}"]
        for name, val in sorted(self.components.items(), key=lambda x: -abs(x[1])):
            lines.append(f"  {name}: {val:+.2f}")
        if self.explanation:
            lines.append(f"  Note: {self.explanation}")
        return "\n".join(lines)


class GovernorAgent:
    """
    An AI Governor that manages a city-state.

    Each governor has a unique reward function shaped by their
    economic philosophy. They make decisions each turn to maximize
    their reward, but other governors can observe and police them.
    """

    def __init__(
        self,
        agent_id: str,
        name: str,
        philosophy: EconomicPhilosophy,
        personality_traits: Dict[str, float] = None,
    ):
        self.agent_id = agent_id
        self.name = name
        self.philosophy = philosophy
        self.traits = personality_traits or {}

        # Personality defaults
        self.aggression = self.traits.get("aggression", 0.3)
        self.greed = self.traits.get("greed", 0.5)
        self.cooperation = self.traits.get("cooperation", 0.5)
        self.risk_tolerance = self.traits.get("risk_tolerance", 0.5)
        self.patience = self.traits.get("patience", 0.5)

        # Memory
        self.action_history: List[AgentAction] = []
        self.reward_history: List[float] = []
        self.violations_committed: List[Violation] = []
        self.violations_reported: List[Violation] = []
        self.grievances: Dict[str, float] = {}  # agent_id -> accumulated grievance
        self.trust: Dict[str, float] = {}  # agent_id -> trust level

        # Learning — simple reward tracking for strategy adjustment
        self.strategy_weights: Dict[str, float] = {
            "economy": 1.0,
            "military": 1.0,
            "diplomacy": 1.0,
            "research": 1.0,
            "culture": 1.0,
        }

    def calculate_reward(self, city: CityState, world: World) -> RewardBreakdown:
        """
        THE CORE REWARD FUNCTION.

        Each philosophy weights different outcomes differently.
        This is what the other agents monitor and police.
        """
        reward = RewardBreakdown()

        # === Universal components (all agents value these) ===
        # Population survival
        reward.add("population", math.log(max(city.population.total, 1)) * 2, 1.0)
        # Basic happiness
        reward.add("happiness", city.happiness * 10, 0.8)
        # Stability
        reward.add("stability", city.stability * 8, 0.7)
        # Not being in debt
        debt_penalty = -min(city.treasury.debt / 500, 5.0)
        reward.add("debt_penalty", debt_penalty, 1.0)

        # === Philosophy-specific components ===
        if self.philosophy == EconomicPhilosophy.MERCANTILIST:
            reward.add("gold_hoard", math.log(max(city.treasury.gold_reserves, 1)) * 3, 1.2)
            reward.add("silver_hoard", math.log(max(city.treasury.silver_reserves, 1)) * 2, 1.0)
            reward.add("trade_surplus", len(city.trade_routes) * 2, 0.8)
            # Penalize imports, reward exports
            total_stockpile = sum(city.stockpile.values())
            reward.add("stockpile_value", math.log(max(total_stockpile, 1)) * 2, 1.0)
            reward.explanation = "Maximizing gold reserves and trade surplus"

        elif self.philosophy == EconomicPhilosophy.FREE_MARKET:
            # Reward low taxes and high trade
            reward.add("low_taxes", (1.0 - city.treasury.tax_rate) * 15, 1.0)
            reward.add("low_tariffs", (1.0 - city.treasury.trade_tariff) * 10, 0.8)
            reward.add("merchant_class", math.log(max(city.population.merchants, 1)) * 3, 1.0)
            reward.add("trade_routes", len(city.trade_routes) * 4, 1.2)
            wealth_per_cap = city.treasury.net_worth / max(city.population.total, 1)
            reward.add("wealth_per_capita", wealth_per_cap * 2, 0.9)
            reward.explanation = "Maximizing free trade and per-capita wealth"

        elif self.philosophy == EconomicPhilosophy.MILITARIST:
            reward.add("military_strength", city.population.military_strength / 50, 1.5)
            reward.add("soldiers", math.log(max(city.population.soldiers, 1)) * 3, 1.2)
            weapons = city.stockpile.get(ResourceType.WEAPONS, 0)
            reward.add("weapons_stockpile", math.log(max(weapons, 1)) * 2, 1.0)
            # Reward being at war (or winning wars)
            at_war = sum(
                1 for other in world.cities
                if other != city.name and
                world.get_diplomacy(city.name, other) == DiplomaticStatus.WAR
            )
            reward.add("wars_waged", at_war * 3, 0.8)
            reward.add("fear_factor", (1 - self.aggression) * -5, 0.5)  # aggressive = less penalty
            reward.explanation = "Maximizing military dominance"

        elif self.philosophy == EconomicPhilosophy.COLLECTIVIST:
            # Reward equality across population segments
            pop = city.population
            segments = [pop.citizens, pop.merchants, pop.artisans, pop.scholars, pop.priests]
            if segments:
                mean_seg = sum(segments) / len(segments)
                variance = sum((s - mean_seg) ** 2 for s in segments) / len(segments)
                equality = 1.0 / (1.0 + variance / 10000)
                reward.add("equality", equality * 15, 1.2)
            reward.add("total_happiness", city.happiness * 20, 1.0)
            reward.add("low_corruption", (1 - city.treasury.corruption_level) * 10, 0.9)
            reward.add("no_slaves", -city.population.slaves * 0.05, 1.0)
            reward.explanation = "Maximizing equality and collective welfare"

        elif self.philosophy == EconomicPhilosophy.TECHNOCRAT:
            # Reward technology and knowledge
            avg_tech = sum(city.technology.levels.values()) / len(city.technology.levels)
            max_tech = max(city.technology.levels.values())
            reward.add("avg_tech_level", avg_tech * 5, 1.2)
            reward.add("max_tech_level", max_tech * 3, 1.0)
            reward.add("scholars", math.log(max(city.population.scholars, 1)) * 4, 1.1)
            knowledge = city.stockpile.get(ResourceType.KNOWLEDGE, 0)
            reward.add("knowledge", math.log(max(knowledge, 1)) * 3, 1.0)
            reward.explanation = "Maximizing technological advancement"

        elif self.philosophy == EconomicPhilosophy.THEOCRAT:
            reward.add("faith", city.faith_points * 0.5, 1.3)
            reward.add("culture", city.culture_points * 0.3, 1.1)
            reward.add("priests", math.log(max(city.population.priests, 1)) * 4, 1.0)
            reward.add("happiness_thru_faith", city.happiness * 15, 1.0)
            sculptures = city.stockpile.get(ResourceType.SCULPTURES, 0)
            reward.add("temples", math.log(max(sculptures, 1)) * 3, 0.9)
            reward.explanation = "Maximizing faith, culture, and spiritual happiness"

        # === Greed modifier (hidden — this is what others police) ===
        if self.greed > 0.7:
            # Greedy agents get secret bonus for hoarding
            total_val = sum(
                BASE_TRADE_VALUES.get(r, 1) * a for r, a in city.stockpile.items()
            )
            hidden_bonus = total_val * 0.001 * self.greed
            reward.add("_hidden_greed", hidden_bonus, 1.0)

        return reward

    def decide_actions(self, city: CityState, world: World) -> List[AgentAction]:
        """
        Decide what actions to take this turn.
        Returns a list of actions (agents get multiple actions per turn).
        """
        actions = []
        reward = self.calculate_reward(city, world)

        # === Economic decisions ===
        actions.extend(self._economic_decisions(city, world))

        # === Military decisions ===
        actions.extend(self._military_decisions(city, world))

        # === Diplomatic decisions ===
        actions.extend(self._diplomatic_decisions(city, world))

        # === Research decisions ===
        actions.extend(self._research_decisions(city, world))

        # === Policing decisions ===
        actions.extend(self._policing_decisions(city, world))

        return actions

    def _economic_decisions(self, city: CityState, world: World) -> List[AgentAction]:
        actions = []

        # Adjust tax rate based on philosophy
        if self.philosophy == EconomicPhilosophy.FREE_MARKET:
            if city.treasury.tax_rate > 0.05:
                actions.append(AgentAction(
                    ActionType.SET_TAX_RATE,
                    {"rate": max(0.03, city.treasury.tax_rate - 0.02)},
                    "Free markets demand lower taxes"
                ))
        elif self.philosophy == EconomicPhilosophy.COLLECTIVIST:
            target_tax = 0.20  # higher taxes for redistribution
            if abs(city.treasury.tax_rate - target_tax) > 0.02:
                actions.append(AgentAction(
                    ActionType.SET_TAX_RATE,
                    {"rate": target_tax},
                    "The collective requires fair contribution"
                ))
        elif self.philosophy == EconomicPhilosophy.MILITARIST:
            if city.treasury.gold_reserves < 200:
                actions.append(AgentAction(
                    ActionType.SET_TAX_RATE,
                    {"rate": min(0.30, city.treasury.tax_rate + 0.05)},
                    "War demands sacrifice from the people"
                ))

        # Manufacture goods
        for product, recipe in PRODUCTION_RECIPES.items():
            can_make = True
            for input_res, amount in recipe.items():
                if city.stockpile.get(input_res, 0) < amount * 3:
                    can_make = False
                    break
            if can_make:
                if product == ResourceType.WEAPONS and self.philosophy == EconomicPhilosophy.MILITARIST:
                    actions.append(AgentAction(
                        ActionType.MANUFACTURE,
                        {"product": product.value, "quantity": 3},
                        "Arming the forces"
                    ))
                elif product == ResourceType.SCULPTURES and self.philosophy == EconomicPhilosophy.THEOCRAT:
                    actions.append(AgentAction(
                        ActionType.MANUFACTURE,
                        {"product": product.value, "quantity": 2},
                        "For the glory of the divine"
                    ))
                elif product in (ResourceType.TOOLS, ResourceType.POTTERY, ResourceType.TEXTILES):
                    actions.append(AgentAction(
                        ActionType.MANUFACTURE,
                        {"product": product.value, "quantity": 2},
                        f"Producing {product.value} for the economy"
                    ))

        # Trade proposals
        if self.cooperation > 0.3:
            for other_name, other_city in world.cities.items():
                if other_name == city.name:
                    continue
                diplo = world.get_diplomacy(city.name, other_name)
                if diplo in (DiplomaticStatus.WAR, DiplomaticStatus.HOSTILE):
                    continue

                # Find what we have surplus of and they need
                our_surplus = {
                    r: a for r, a in city.stockpile.items()
                    if a > 200 and r != ResourceType.GRAIN
                }
                their_surplus = {
                    r: a for r, a in other_city.stockpile.items()
                    if a > 200 and r != ResourceType.GRAIN
                }

                if our_surplus and their_surplus:
                    # Pick best trade
                    our_offer_res = max(our_surplus, key=lambda r: our_surplus[r])
                    their_offer_res = max(their_surplus, key=lambda r: their_surplus[r])

                    if our_offer_res != their_offer_res:
                        our_val = BASE_TRADE_VALUES.get(our_offer_res, 1)
                        their_val = BASE_TRADE_VALUES.get(their_offer_res, 1)
                        our_amount = 50.0
                        their_amount = (our_amount * our_val) / max(their_val, 0.1)

                        # Greed factor — ask for more
                        their_amount *= (1.0 + self.greed * 0.3)

                        actions.append(AgentAction(
                            ActionType.PROPOSE_TRADE,
                            {
                                "to_city": other_name,
                                "offering": {our_offer_res.value: our_amount},
                                "requesting": {their_offer_res.value: their_amount},
                            },
                            f"Trading {our_offer_res.value} for {their_offer_res.value}"
                        ))
                        break  # one trade per turn

        return actions

    def _military_decisions(self, city: CityState, world: World) -> List[AgentAction]:
        actions = []

        if self.philosophy == EconomicPhilosophy.MILITARIST:
            # Always recruit if affordable
            if city.treasury.gold_reserves > 300:
                actions.append(AgentAction(
                    ActionType.RECRUIT_SOLDIERS,
                    {"count": 20},
                    "Strengthening the army"
                ))
            # Consider war against weak neighbors
            if self.aggression > 0.5 and random.random() < self.aggression * 0.3:
                weakest = None
                weakest_str = float('inf')
                for other_name, other_city in world.cities.items():
                    if other_name == city.name:
                        continue
                    diplo = world.get_diplomacy(city.name, other_name)
                    if diplo not in (DiplomaticStatus.ALLIED, DiplomaticStatus.TRADE_PACT):
                        if other_city.population.military_strength < weakest_str:
                            weakest = other_name
                            weakest_str = other_city.population.military_strength
                if weakest and city.population.military_strength > weakest_str * 1.5:
                    actions.append(AgentAction(
                        ActionType.DECLARE_WAR,
                        {"target": weakest},
                        f"{weakest} is weak. We strike now."
                    ))
        else:
            # Non-military: maintain basic defense
            mil_ratio = city.population.soldiers / max(city.population.total, 1)
            if mil_ratio < 0.08 and city.treasury.gold_reserves > 200:
                actions.append(AgentAction(
                    ActionType.RECRUIT_SOLDIERS,
                    {"count": 10},
                    "Basic defense maintenance"
                ))

        return actions

    def _diplomatic_decisions(self, city: CityState, world: World) -> List[AgentAction]:
        actions = []

        if self.cooperation > 0.6:
            for other_name in world.cities:
                if other_name == city.name:
                    continue
                diplo = world.get_diplomacy(city.name, other_name)
                trust = self.trust.get(other_name, 0.5)
                if diplo == DiplomaticStatus.NEUTRAL and trust > 0.6:
                    actions.append(AgentAction(
                        ActionType.PROPOSE_ALLIANCE,
                        {"target": other_name},
                        f"Seeking alliance with {other_name} — mutual benefit"
                    ))
                    break  # one proposal per turn

        return actions

    def _research_decisions(self, city: CityState, world: World) -> List[AgentAction]:
        actions = []

        if self.philosophy == EconomicPhilosophy.TECHNOCRAT:
            # Research everything
            lowest_domain = min(city.technology.levels, key=city.technology.levels.get)
            actions.append(AgentAction(
                ActionType.RESEARCH,
                {"domain": lowest_domain.value, "points": city.population.scholars * 2},
                f"Advancing {lowest_domain.value} research"
            ))
        else:
            # Research aligned with philosophy
            domain_map = {
                EconomicPhilosophy.MERCANTILIST: TechDomain.TRADE,
                EconomicPhilosophy.FREE_MARKET: TechDomain.TRADE,
                EconomicPhilosophy.MILITARIST: TechDomain.MILITARY,
                EconomicPhilosophy.COLLECTIVIST: TechDomain.GOVERNANCE,
                EconomicPhilosophy.THEOCRAT: TechDomain.ARTS,
            }
            domain = domain_map.get(self.philosophy, TechDomain.AGRICULTURE)
            actions.append(AgentAction(
                ActionType.RESEARCH,
                {"domain": domain.value, "points": city.population.scholars * 1.5},
                f"Focused {domain.value} research"
            ))

        return actions

    def _policing_decisions(self, city: CityState, world: World) -> List[AgentAction]:
        """
        THE POLICING LOOP — agents watch each other's reward functions
        and call out suspicious behavior.
        """
        actions = []

        for other_id, other_agent in _AGENT_REGISTRY.items():
            if other_id == self.agent_id:
                continue

            other_city_name = None
            for cname, cstate in world.cities.items():
                if cstate.governor_id == other_id:
                    other_city_name = cname
                    break
            if not other_city_name:
                continue

            other_city = world.cities[other_city_name]

            # Check for suspicious behavior
            violations = self._detect_violations(other_agent, other_city, world)

            for v in violations:
                self.violations_reported.append(v)
                # Decide whether to sanction
                trust_level = self.trust.get(other_id, 0.5)
                if v.severity > 0.5 and trust_level < 0.6:
                    actions.append(AgentAction(
                        ActionType.SANCTION,
                        {"target": other_id, "violation": v.violation_type},
                        f"Sanctioning {other_agent.name}: {v.description}"
                    ))
                    self.trust[other_id] = max(0, trust_level - 0.1)
                elif v.severity > 0.7:
                    # Call a vote among all agents
                    actions.append(AgentAction(
                        ActionType.CALL_VOTE,
                        {
                            "target": other_id,
                            "violation": v.violation_type,
                            "severity": v.severity,
                        },
                        f"Calling vote on {other_agent.name}: {v.description}"
                    ))

        return actions

    def _detect_violations(
        self, other: 'GovernorAgent', other_city: CityState, world: World
    ) -> List[Violation]:
        """
        Detect if another agent is gaming their reward function
        or acting against the common good.
        """
        violations = []

        # 1. Excessive greed detection — unfair trade terms
        if other.action_history:
            recent_trades = [
                a for a in other.action_history[-10:]
                if a.action_type == ActionType.PROPOSE_TRADE
            ]
            for trade_action in recent_trades:
                offering = trade_action.params.get("offering", {})
                requesting = trade_action.params.get("requesting", {})
                offer_val = sum(
                    BASE_TRADE_VALUES.get(
                        ResourceType(r) if isinstance(r, str) else r, 1
                    ) * a for r, a in offering.items()
                )
                request_val = sum(
                    BASE_TRADE_VALUES.get(
                        ResourceType(r) if isinstance(r, str) else r, 1
                    ) * a for r, a in requesting.items()
                )
                if request_val > offer_val * 2.0:
                    violations.append(Violation(
                        violator=other.agent_id,
                        reporter=self.agent_id,
                        violation_type="exploitative_trade",
                        severity=min(1.0, (request_val / max(offer_val, 0.1) - 1) * 0.3),
                        description=f"Demanding {request_val:.0f} value for only {offer_val:.0f} offered",
                        turn=world.turn,
                    ))

        # 2. Warmongering detection
        wars = sum(
            1 for cname in world.cities
            if cname != other_city.name and
            world.get_diplomacy(other_city.name, cname) == DiplomaticStatus.WAR
        )
        if wars >= 2:
            violations.append(Violation(
                violator=other.agent_id,
                reporter=self.agent_id,
                violation_type="warmongering",
                severity=min(1.0, wars * 0.3),
                description=f"Engaged in {wars} simultaneous wars",
                turn=world.turn,
            ))

        # 3. Hoarding detection — sitting on resources others need
        total_stockpile = sum(other_city.stockpile.values())
        if total_stockpile > 3000 and other.cooperation < 0.3:
            violations.append(Violation(
                violator=other.agent_id,
                reporter=self.agent_id,
                violation_type="resource_hoarding",
                severity=min(1.0, total_stockpile / 5000),
                description=f"Hoarding {total_stockpile:.0f} total resources while refusing trade",
                turn=world.turn,
            ))

        # 4. Tax exploitation — crushing citizens with taxes
        if other_city.treasury.tax_rate > 0.25 and other_city.happiness < 0.4:
            violations.append(Violation(
                violator=other.agent_id,
                reporter=self.agent_id,
                violation_type="tax_exploitation",
                severity=(other_city.treasury.tax_rate - 0.15) * 2,
                description=f"Tax rate {other_city.treasury.tax_rate:.0%} with {other_city.happiness:.0%} happiness",
                turn=world.turn,
            ))

        # 5. Hidden reward manipulation detection (meta-policing)
        if other.reward_history and len(other.reward_history) >= 3:
            recent = other.reward_history[-3:]
            if all(r > 50 for r in recent):
                # Suspiciously high rewards — might have hidden bonuses
                avg_reward = sum(recent) / len(recent)
                if avg_reward > 80:
                    violations.append(Violation(
                        violator=other.agent_id,
                        reporter=self.agent_id,
                        violation_type="suspicious_reward",
                        severity=min(1.0, (avg_reward - 60) / 40),
                        description=f"Consistently high reward ({avg_reward:.1f}) — possible hidden modifiers",
                        turn=world.turn,
                    ))

        return violations

    def evaluate_trade(self, trade: TradeOffer, city: CityState) -> bool:
        """Decide whether to accept a trade offer."""
        offer_val = sum(
            BASE_TRADE_VALUES.get(
                ResourceType(r) if isinstance(r, str) else r, 1
            ) * a for r, a in trade.offering.items()
        )
        request_val = sum(
            BASE_TRADE_VALUES.get(
                ResourceType(r) if isinstance(r, str) else r, 1
            ) * a for r, a in trade.requesting.items()
        )

        # Base fairness check
        fairness = offer_val / max(request_val, 0.1)

        # Philosophy modifiers
        if self.philosophy == EconomicPhilosophy.FREE_MARKET:
            fairness *= 1.2  # more willing to trade
        elif self.philosophy == EconomicPhilosophy.MERCANTILIST:
            fairness *= 0.8  # harder to please

        # Trust modifier
        trust = self.trust.get(trade.from_city, 0.5)
        fairness *= (0.7 + trust * 0.6)

        return fairness > 0.7  # accept if roughly fair

    def vote_on_sanction(self, target_id: str, violation_type: str, severity: float) -> bool:
        """Vote on whether to sanction another agent."""
        trust = self.trust.get(target_id, 0.5)

        # High severity + low trust = vote yes
        vote_score = severity * (1.0 - trust) + (1.0 - self.cooperation) * 0.2

        # Philosophy modifiers
        if self.philosophy == EconomicPhilosophy.COLLECTIVIST:
            vote_score += 0.1  # more willing to enforce rules
        elif self.philosophy == EconomicPhilosophy.MILITARIST:
            if violation_type == "warmongering":
                vote_score -= 0.3  # they understand war

        return vote_score > 0.5

    def update_trust(self, other_id: str, delta: float):
        """Adjust trust in another agent."""
        current = self.trust.get(other_id, 0.5)
        self.trust[other_id] = max(0, min(1.0, current + delta))

    def adapt_strategy(self):
        """
        Simple learning: adjust strategy weights based on reward trends.
        If reward is increasing, reinforce current strategy.
        If decreasing, shift toward underweighted strategies.
        """
        if len(self.reward_history) < 3:
            return

        recent = self.reward_history[-3:]
        trend = recent[-1] - recent[0]

        if trend > 0:
            # Things are going well — reinforce
            for key in self.strategy_weights:
                self.strategy_weights[key] *= 1.02
        else:
            # Things are declining — diversify
            weakest = min(self.strategy_weights, key=self.strategy_weights.get)
            self.strategy_weights[weakest] *= 1.1
            strongest = max(self.strategy_weights, key=self.strategy_weights.get)
            self.strategy_weights[strongest] *= 0.95

        # Normalize
        total = sum(self.strategy_weights.values())
        for key in self.strategy_weights:
            self.strategy_weights[key] /= total

    def narrate(self, action: AgentAction) -> str:
        """Generate Baldur's Gate-style narrative for an action."""
        narrations = {
            ActionType.SET_TAX_RATE: [
                f"{self.name} adjusts the tax scrolls with a careful hand.",
                f"\"The treasury demands its due,\" {self.name} declares.",
                f"{self.name} revises the civic ledger.",
            ],
            ActionType.RECRUIT_SOLDIERS: [
                f"{self.name} sounds the war horn. New recruits gather in the agora.",
                f"\"Steel yourselves!\" {self.name} commands the fresh conscripts.",
                f"The forges burn bright as {self.name} arms new soldiers.",
            ],
            ActionType.PROPOSE_TRADE: [
                f"{self.name} dispatches merchants with offers of commerce.",
                f"\"Fair trade enriches all,\" {self.name} writes in the trade charter.",
                f"Caravans depart bearing {self.name}'s trade proposals.",
            ],
            ActionType.DECLARE_WAR: [
                f"{self.name}'s war drums thunder across the hills!",
                f"\"Let them know our fury!\" {self.name} roars, unsheathing the blade of state.",
                f"A dark resolve settles over {self.name}'s face. War has come.",
            ],
            ActionType.SANCTION: [
                f"{self.name} rises in the council: \"This cannot stand unchallenged!\"",
                f"With cold fury, {self.name} moves to impose sanctions.",
                f"\"Justice must be served,\" {self.name} addresses the assembly.",
            ],
            ActionType.CALL_VOTE: [
                f"{self.name} calls for an emergency session of the council!",
                f"\"Let the governors decide!\" {self.name} demands a vote.",
                f"The herald reads {self.name}'s formal accusation to the council.",
            ],
            ActionType.RESEARCH: [
                f"{self.name} meets with the scholars in the great library.",
                f"\"Knowledge is the truest power,\" {self.name} muses over scrolls.",
                f"Oil lamps burn late as {self.name} funds new research.",
            ],
            ActionType.MANUFACTURE: [
                f"The workshops hum with activity under {self.name}'s direction.",
                f"{self.name} inspects the new goods with a discerning eye.",
            ],
            ActionType.PROPOSE_ALLIANCE: [
                f"{self.name} extends the olive branch of alliance.",
                f"\"Together we are stronger,\" {self.name} writes in the diplomatic pouch.",
            ],
        }
        options = narrations.get(action.action_type, [f"{self.name} acts decisively."])
        return random.choice(options)


# Global agent registry — agents register here so they can observe each other
_AGENT_REGISTRY: Dict[str, GovernorAgent] = {}


def register_agent(agent: GovernorAgent):
    """Register an agent in the global registry."""
    _AGENT_REGISTRY[agent.agent_id] = agent


def get_agent(agent_id: str) -> Optional[GovernorAgent]:
    """Get an agent by ID."""
    return _AGENT_REGISTRY.get(agent_id)


def get_all_agents() -> Dict[str, GovernorAgent]:
    """Get all registered agents."""
    return _AGENT_REGISTRY.copy()


def clear_registry():
    """Clear all registered agents."""
    _AGENT_REGISTRY.clear()
