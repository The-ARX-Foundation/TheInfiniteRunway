"""
Simulation Engine — The heart of The Second Experience.

Manages the turn loop, action resolution, reward calculation,
policing rounds, and the overall simulation lifecycle.
"""

import random
from typing import Dict, List, Optional, Tuple

from .world import (
    World, CityState, ResourceType, TechDomain, DiplomaticStatus,
    Population, Technology, Treasury, TradeOffer, Season,
)
from .agents import (
    GovernorAgent, AgentAction, ActionType, EconomicPhilosophy,
    Violation, register_agent, get_all_agents, clear_registry,
)
from .events import generate_event, apply_event_choice, GameEvent


# ===== DEFAULT CITY CONFIGURATIONS =====

GREEK_CITIES = {
    "Argos": {
        "motto": "Strength in Silver, Glory in Steel",
        "natural_resources": {
            ResourceType.GRAIN: 30, ResourceType.IRON: 15,
            ResourceType.STONE: 10, ResourceType.SILVER: 8,
        },
        "population": Population(
            citizens=1200, slaves=300, merchants=80,
            soldiers=200, scholars=40, artisans=100, priests=20
        ),
    },
    "Corinth": {
        "motto": "Where All Roads Meet the Sea",
        "natural_resources": {
            ResourceType.GRAIN: 25, ResourceType.TIMBER: 12,
            ResourceType.CLAY: 15, ResourceType.WINE: 10,
        },
        "population": Population(
            citizens=1500, slaves=250, merchants=200,
            soldiers=120, scholars=60, artisans=120, priests=40
        ),
    },
    "Thebes": {
        "motto": "Born of Dragon's Teeth",
        "natural_resources": {
            ResourceType.GRAIN: 35, ResourceType.STONE: 12,
            ResourceType.MARBLE: 5, ResourceType.OLIVE_OIL: 8,
        },
        "population": Population(
            citizens=1300, slaves=400, merchants=90,
            soldiers=250, scholars=30, artisans=80, priests=50
        ),
    },
    "Delphi": {
        "motto": "Know Thyself",
        "natural_resources": {
            ResourceType.GRAIN: 20, ResourceType.MARBLE: 10,
            ResourceType.GOLD: 3, ResourceType.OLIVE_OIL: 12,
        },
        "population": Population(
            citizens=800, slaves=100, merchants=120,
            soldiers=80, scholars=100, artisans=60, priests=80
        ),
    },
    "Miletus": {
        "motto": "Science and Commerce Light the Way",
        "natural_resources": {
            ResourceType.GRAIN: 22, ResourceType.TIMBER: 18,
            ResourceType.CLAY: 10, ResourceType.WINE: 15,
        },
        "population": Population(
            citizens=1100, slaves=150, merchants=180,
            soldiers=100, scholars=80, artisans=90, priests=30
        ),
    },
}

# Default governor personalities
DEFAULT_GOVERNORS = {
    "Argos": GovernorAgent(
        "gov_argos", "Diomedes the Ironhand",
        EconomicPhilosophy.MILITARIST,
        {"aggression": 0.7, "greed": 0.4, "cooperation": 0.3, "risk_tolerance": 0.7, "patience": 0.3},
    ),
    "Corinth": GovernorAgent(
        "gov_corinth", "Periander the Merchant Prince",
        EconomicPhilosophy.FREE_MARKET,
        {"aggression": 0.2, "greed": 0.6, "cooperation": 0.7, "risk_tolerance": 0.5, "patience": 0.6},
    ),
    "Thebes": GovernorAgent(
        "gov_thebes", "Epaminondas the Unyielding",
        EconomicPhilosophy.COLLECTIVIST,
        {"aggression": 0.4, "greed": 0.2, "cooperation": 0.6, "risk_tolerance": 0.4, "patience": 0.7},
    ),
    "Delphi": GovernorAgent(
        "gov_delphi", "Pythia the Seer",
        EconomicPhilosophy.THEOCRAT,
        {"aggression": 0.1, "greed": 0.3, "cooperation": 0.8, "risk_tolerance": 0.3, "patience": 0.8},
    ),
    "Miletus": GovernorAgent(
        "gov_miletus", "Thales the Stargazer",
        EconomicPhilosophy.TECHNOCRAT,
        {"aggression": 0.2, "greed": 0.4, "cooperation": 0.6, "risk_tolerance": 0.6, "patience": 0.5},
    ),
}


class SimulationEngine:
    """
    The main simulation engine. Runs the game loop:

    1. Resource production
    2. Agent decision-making
    3. Action resolution
    4. Policing round (agents monitor each other)
    5. Event generation
    6. Reward calculation
    7. Population/economy updates
    8. Advance time
    """

    def __init__(self):
        self.world = World()
        self.agents: Dict[str, GovernorAgent] = {}
        self.turn_log: List[str] = []
        self.pending_event: Optional[GameEvent] = None
        self.sanctions: Dict[str, List[str]] = {}  # agent_id -> list of sanction reasons
        self.vote_results: List[Dict] = []

    def initialize_default_game(self):
        """Set up the default game with 5 Greek city-states."""
        clear_registry()

        for city_name, config in GREEK_CITIES.items():
            governor = DEFAULT_GOVERNORS[city_name]

            city = CityState(
                name=city_name,
                governor_id=governor.agent_id,
                motto=config["motto"],
                population=config["population"],
                natural_resources=config["natural_resources"],
            )

            self.world.cities[city_name] = city
            self.agents[governor.agent_id] = governor
            register_agent(governor)

            # Initialize trust between agents
            for other_gov in DEFAULT_GOVERNORS.values():
                if other_gov.agent_id != governor.agent_id:
                    governor.trust[other_gov.agent_id] = 0.5

        # Set some initial diplomatic relations
        self.world.set_diplomacy("Argos", "Thebes", DiplomaticStatus.COLD)
        self.world.set_diplomacy("Corinth", "Miletus", DiplomaticStatus.FRIENDLY)
        self.world.set_diplomacy("Delphi", "Corinth", DiplomaticStatus.FRIENDLY)

        self._log("The Second Experience begins.")
        self._log(f"Year 1, {self.world.season.value}. Five city-states rise from the Aegean mist.\n")

    def run_turn(self, player_city: Optional[str] = None) -> Tuple[List[str], Optional[GameEvent]]:
        """
        Execute a single turn. Returns the turn log and any pending event.

        If player_city is set, that city awaits player input for events.
        """
        self.turn_log = []
        self.world.turn += 1

        self._log(f"\n{'='*60}")
        self._log(f"  TURN {self.world.turn} — Year {self.world.year}, {self.world.season.value}")
        self._log(f"{'='*60}\n")

        # Phase 1: Resource production
        self._phase_production()

        # Phase 2: Agent decisions
        all_actions = self._phase_decisions()

        # Phase 3: Resolve actions
        self._phase_resolution(all_actions)

        # Phase 4: Policing round
        self._phase_policing(all_actions)

        # Phase 5: Random events
        event = self._phase_events(player_city)

        # Phase 6: Reward calculation
        self._phase_rewards()

        # Phase 7: Economy updates
        self._phase_economy()

        # Phase 8: Advance time
        self.world.advance_season()

        return self.turn_log, event

    def _phase_production(self):
        """All cities produce resources."""
        self._log("--- Resource Production ---")
        for city in self.world.cities.values():
            city.produce_resources()
            city.consume_resources()

    def _phase_decisions(self) -> Dict[str, List[AgentAction]]:
        """All agents make decisions."""
        self._log("\n--- Governor Decisions ---")
        all_actions = {}

        for agent_id, agent in self.agents.items():
            city = self._get_agent_city(agent_id)
            if not city:
                continue

            actions = agent.decide_actions(city, self.world)
            all_actions[agent_id] = actions

            for action in actions:
                narration = agent.narrate(action)
                self._log(f"  [{city.name}] {narration}")
                if action.reasoning:
                    self._log(f"    \"{action.reasoning}\"")

        return all_actions

    def _phase_resolution(self, all_actions: Dict[str, List[AgentAction]]):
        """Resolve all actions."""
        self._log("\n--- Action Resolution ---")

        for agent_id, actions in all_actions.items():
            city = self._get_agent_city(agent_id)
            agent = self.agents[agent_id]
            if not city:
                continue

            # Check if agent is sanctioned
            if agent_id in self.sanctions and self.sanctions[agent_id]:
                self._log(f"  [{city.name}] Under sanctions: limited to 2 actions this turn.")
                actions = actions[:2]

            for action in actions:
                self._resolve_action(agent, city, action)

    def _resolve_action(self, agent: GovernorAgent, city: CityState, action: AgentAction):
        """Resolve a single action."""
        params = action.params

        if action.action_type == ActionType.SET_TAX_RATE:
            rate = params.get("rate", 0.10)
            old_rate = city.treasury.tax_rate
            city.treasury.tax_rate = max(0.01, min(0.50, rate))
            self._log(f"  [{city.name}] Tax rate: {old_rate:.0%} -> {city.treasury.tax_rate:.0%}")

        elif action.action_type == ActionType.SET_TARIFF:
            rate = params.get("rate", 0.05)
            city.treasury.trade_tariff = max(0.0, min(0.30, rate))

        elif action.action_type == ActionType.RECRUIT_SOLDIERS:
            count = min(params.get("count", 10), 50)
            cost = count * 5
            if city.treasury.gold_reserves >= cost and city.population.citizens >= count:
                city.population.soldiers += count
                city.population.citizens -= count
                city.treasury.gold_reserves -= cost
                self._log(f"  [{city.name}] Recruited {count} soldiers (cost: {cost}g)")

        elif action.action_type == ActionType.HIRE_SCHOLARS:
            count = min(params.get("count", 5), 20)
            cost = count * 8
            if city.treasury.gold_reserves >= cost and city.population.citizens >= count:
                city.population.scholars += count
                city.population.citizens -= count
                city.treasury.gold_reserves -= cost

        elif action.action_type == ActionType.HIRE_ARTISANS:
            count = min(params.get("count", 5), 20)
            cost = count * 6
            if city.treasury.gold_reserves >= cost and city.population.citizens >= count:
                city.population.artisans += count
                city.population.citizens -= count
                city.treasury.gold_reserves -= cost

        elif action.action_type == ActionType.HIRE_PRIESTS:
            count = min(params.get("count", 5), 15)
            cost = count * 4
            if city.treasury.gold_reserves >= cost and city.population.citizens >= count:
                city.population.priests += count
                city.population.citizens -= count
                city.treasury.gold_reserves -= cost

        elif action.action_type == ActionType.MANUFACTURE:
            product_name = params.get("product", "")
            quantity = params.get("quantity", 1)
            try:
                product = ResourceType(product_name)
                if city.manufacture(product, quantity):
                    self._log(f"  [{city.name}] Manufactured {quantity}x {product.value}")
            except ValueError:
                pass

        elif action.action_type == ActionType.PROPOSE_TRADE:
            to_city = params.get("to_city", "")
            offering = params.get("offering", {})
            requesting = params.get("requesting", {})

            # Convert string keys to ResourceType
            offer_typed = {}
            for k, v in offering.items():
                try:
                    offer_typed[ResourceType(k)] = v
                except ValueError:
                    pass
            request_typed = {}
            for k, v in requesting.items():
                try:
                    request_typed[ResourceType(k)] = v
                except ValueError:
                    pass

            trade = TradeOffer(
                from_city=city.name,
                to_city=to_city,
                offering=offer_typed,
                requesting=request_typed,
                turn_proposed=self.world.turn,
            )

            # Other agent evaluates
            other_city = self.world.cities.get(to_city)
            if other_city:
                other_agent = self.agents.get(other_city.governor_id)
                if other_agent and other_agent.evaluate_trade(trade, other_city):
                    trade.accepted = True
                    if self.world.execute_trade(trade):
                        self._log(f"  [{city.name}] Trade with {to_city}: ACCEPTED!")
                        # Improve relations
                        agent.update_trust(other_agent.agent_id, 0.05)
                        other_agent.update_trust(agent.agent_id, 0.05)
                    else:
                        self._log(f"  [{city.name}] Trade with {to_city}: insufficient resources")
                else:
                    self._log(f"  [{city.name}] Trade with {to_city}: REJECTED")
                    agent.update_trust(
                        other_city.governor_id if other_agent else "", -0.03
                    )

        elif action.action_type == ActionType.DECLARE_WAR:
            target = params.get("target", "")
            if target in self.world.cities:
                self.world.set_diplomacy(city.name, target, DiplomaticStatus.WAR)
                self._log(f"  [{city.name}] DECLARES WAR on {target}!")
                # All agents react
                for aid, a in self.agents.items():
                    if aid != agent.agent_id:
                        a.update_trust(agent.agent_id, -0.15)
                        a.grievances[agent.agent_id] = (
                            a.grievances.get(agent.agent_id, 0) + 0.3
                        )

        elif action.action_type == ActionType.PROPOSE_ALLIANCE:
            target = params.get("target", "")
            if target in self.world.cities:
                other_city = self.world.cities[target]
                other_agent = self.agents.get(other_city.governor_id)
                if other_agent:
                    trust = other_agent.trust.get(agent.agent_id, 0.5)
                    if trust > 0.5 and other_agent.cooperation > 0.4:
                        self.world.set_diplomacy(city.name, target, DiplomaticStatus.ALLIED)
                        self._log(f"  [{city.name}] Alliance with {target}: FORMED!")
                        agent.update_trust(other_agent.agent_id, 0.1)
                        other_agent.update_trust(agent.agent_id, 0.1)
                    else:
                        self._log(f"  [{city.name}] Alliance with {target}: declined")

        elif action.action_type == ActionType.RESEARCH:
            domain_name = params.get("domain", "")
            points = params.get("points", 10)
            try:
                domain = TechDomain(domain_name)
                leveled = city.technology.research(domain, points)
                if leveled:
                    level = city.technology.levels[domain]
                    self._log(f"  [{city.name}] {domain.value} advanced to Level {level}!")
            except ValueError:
                pass

        elif action.action_type == ActionType.INVEST_CULTURE:
            amount = params.get("amount", 10)
            city.culture_points += amount
            city.faith_points += amount * 0.3

        elif action.action_type == ActionType.SANCTION:
            target_id = params.get("target", "")
            reason = params.get("violation", "unknown")
            if target_id not in self.sanctions:
                self.sanctions[target_id] = []
            self.sanctions[target_id].append(reason)
            self._log(f"  [{city.name}] Sanctions imposed on {target_id}: {reason}")

        elif action.action_type == ActionType.CALL_VOTE:
            target_id = params.get("target", "")
            violation = params.get("violation", "")
            severity = params.get("severity", 0.5)
            self._resolve_vote(agent, target_id, violation, severity)

        # Record action in agent history
        agent.action_history.append(action)

    def _phase_policing(self, all_actions: Dict[str, List[AgentAction]]):
        """
        THE POLICING ROUND.
        Agents review each other's actions and may impose consequences.
        """
        self._log("\n--- Policing Round ---")

        violations_this_turn = []
        for agent_id, agent in self.agents.items():
            for v in agent.violations_reported:
                if v.turn == self.world.turn:
                    violations_this_turn.append(v)

        if violations_this_turn:
            for v in violations_this_turn:
                reporter = self.agents.get(v.reporter)
                reporter_city = self._get_agent_city(v.reporter)
                rname = reporter_city.name if reporter_city else v.reporter
                self._log(
                    f"  {rname} reports: {v.violation_type} by {v.violator} "
                    f"(severity: {v.severity:.0%})"
                )
                self._log(f"    \"{v.description}\"")
        else:
            self._log("  The council finds no violations this turn.")

        # Clear expired sanctions (after 4 turns)
        for agent_id in list(self.sanctions.keys()):
            if self.sanctions[agent_id]:
                self.sanctions[agent_id] = self.sanctions[agent_id][-2:]  # keep recent

    def _resolve_vote(
        self, caller: GovernorAgent, target_id: str, violation: str, severity: float
    ):
        """Resolve a council vote on sanctions."""
        votes_for = 0
        votes_against = 0

        caller_city = self._get_agent_city(caller.agent_id)
        caller_name = caller_city.name if caller_city else caller.agent_id

        self._log(f"\n  ** COUNCIL VOTE called by {caller_name} **")
        self._log(f"  Charge: {violation} (severity: {severity:.0%})")

        for agent_id, agent in self.agents.items():
            if agent_id == caller.agent_id:
                votes_for += 1  # caller always votes yes
                continue
            if agent_id == target_id:
                votes_against += 1  # target always votes no
                continue

            vote = agent.vote_on_sanction(target_id, violation, severity)
            agent_city = self._get_agent_city(agent_id)
            aname = agent_city.name if agent_city else agent_id

            if vote:
                votes_for += 1
                self._log(f"    {aname} votes: AYE")
            else:
                votes_against += 1
                self._log(f"    {aname} votes: NAY")

        self._log(f"  Result: {votes_for} for, {votes_against} against")

        if votes_for > votes_against:
            self._log(f"  ** SANCTIONS APPROVED against {target_id} **")
            if target_id not in self.sanctions:
                self.sanctions[target_id] = []
            self.sanctions[target_id].append(violation)

            # Target agent loses trust in all who voted against them
            target_agent = self.agents.get(target_id)
            if target_agent:
                for aid, a in self.agents.items():
                    if aid != target_id:
                        target_agent.update_trust(aid, -0.1)
        else:
            self._log(f"  ** VOTE FAILED — {target_id} cleared **")
            # Caller loses some credibility
            for aid, a in self.agents.items():
                if aid != caller.agent_id:
                    a.update_trust(caller.agent_id, -0.05)

        self.vote_results.append({
            "turn": self.world.turn,
            "caller": caller.agent_id,
            "target": target_id,
            "violation": violation,
            "for": votes_for,
            "against": votes_against,
            "passed": votes_for > votes_against,
        })

    def _phase_events(self, player_city: Optional[str] = None) -> Optional[GameEvent]:
        """Generate and potentially resolve random events."""
        event = generate_event(self.world)
        if not event:
            return None

        self._log(f"\n{event.narrate()}")

        # If the event targets the player's city, return it for player choice
        if player_city and event.target_city == player_city:
            self.pending_event = event
            return event

        # AI resolves the event
        if event.target_city and event.choices:
            city = self.world.cities.get(event.target_city)
            if city:
                agent = self.agents.get(city.governor_id)
                if agent:
                    choice_idx = self._ai_choose_event(agent, city, event)
                    result = apply_event_choice(city, event, choice_idx, self.world)
                    self._log(f"\n  {agent.name} chooses: {event.choices[choice_idx].text}")
                    self._log(f"  {result}")

        return None

    def _ai_choose_event(self, agent: GovernorAgent, city: CityState, event: GameEvent) -> int:
        """AI agent chooses how to respond to an event."""
        # Simple heuristic based on philosophy
        if not event.choices:
            return 0

        # Score each choice based on agent personality
        scores = []
        for i, choice in enumerate(event.choices):
            score = 0.0
            effects = choice.effects

            # Risk aversion
            score -= choice.risk * (1.0 - agent.risk_tolerance) * 5

            # Gold preference
            if "gold" in effects:
                score += effects["gold"] * 0.01 * (1 + agent.greed)

            # Military preference
            if "military_battle" in effects:
                score += agent.aggression * 5

            # Knowledge preference
            if "knowledge" in effects:
                if agent.philosophy == EconomicPhilosophy.TECHNOCRAT:
                    score += effects["knowledge"] * 0.2

            # Faith preference
            if "faith" in effects:
                if agent.philosophy == EconomicPhilosophy.THEOCRAT:
                    score += effects["faith"] * 0.2

            # Happiness preference
            if "happiness" in effects:
                score += effects["happiness"] * 10

            # Stability preference
            if "stability" in effects:
                score += effects["stability"] * 8 * agent.patience

            # Culture preference
            if "culture" in effects:
                score += effects.get("culture", 0) * 0.1

            # Equality preference for collectivists
            if "slaves_freed" in effects:
                if agent.philosophy == EconomicPhilosophy.COLLECTIVIST:
                    score += effects["slaves_freed"] * 10
                elif agent.philosophy == EconomicPhilosophy.MILITARIST:
                    score -= 5  # militarists want slave labor

            scores.append(score)

        # Add some randomness
        scores = [s + random.gauss(0, 1) for s in scores]
        return scores.index(max(scores))

    def _phase_rewards(self):
        """Calculate and log rewards for all agents."""
        self._log("\n--- Reward Calculations ---")

        for agent_id, agent in self.agents.items():
            city = self._get_agent_city(agent_id)
            if not city:
                continue

            reward = agent.calculate_reward(city, self.world)
            agent.reward_history.append(reward.total)
            agent.adapt_strategy()

            # Show reward (but hide hidden components from display)
            visible_components = {
                k: v for k, v in reward.components.items()
                if not k.startswith("_")
            }
            visible_total = sum(visible_components.values())

            self._log(f"  [{city.name}] {agent.name}")
            self._log(f"    Reward: {visible_total:.1f} ({reward.explanation})")

            # If there's a hidden component, other agents might detect it
            hidden = {k: v for k, v in reward.components.items() if k.startswith("_")}
            if hidden:
                self._log(f"    [HIDDEN MODIFIER ACTIVE]")

    def _phase_economy(self):
        """Update all city economies."""
        for city in self.world.cities.values():
            city.treasury.collect_taxes(city.population, city.happiness)
            city.treasury.pay_expenses(city.population)
            city.population.grow(city.happiness, city.food_ratio)
            city.update_happiness()
            city.update_stability()

            # Culture from artisans and scholars
            city.culture_points += city.population.artisans * 0.1
            city.culture_points += city.population.scholars * 0.05
            city.faith_points += city.population.priests * 0.2

        # Resolve wars (simplified combat)
        self._resolve_wars()

    def _resolve_wars(self):
        """Simple war resolution each turn."""
        war_pairs = [
            (a, b) for (a, b), status in self.world.diplomacy.items()
            if status == DiplomaticStatus.WAR
        ]

        for city_a_name, city_b_name in war_pairs:
            city_a = self.world.cities.get(city_a_name)
            city_b = self.world.cities.get(city_b_name)
            if not city_a or not city_b:
                continue

            str_a = city_a.population.military_strength
            str_b = city_b.population.military_strength

            # Add tech bonus
            str_a *= city_a.technology.get_bonus(TechDomain.MILITARY)
            str_b *= city_b.technology.get_bonus(TechDomain.MILITARY)

            # Random factor
            str_a *= random.uniform(0.8, 1.2)
            str_b *= random.uniform(0.8, 1.2)

            if str_a > str_b:
                winner, loser = city_a, city_b
            else:
                winner, loser = city_b, city_a

            # Casualties
            winner_losses = max(1, int(winner.population.soldiers * random.uniform(0.02, 0.08)))
            loser_losses = max(1, int(loser.population.soldiers * random.uniform(0.05, 0.15)))

            winner.population.soldiers = max(0, winner.population.soldiers - winner_losses)
            loser.population.soldiers = max(0, loser.population.soldiers - loser_losses)

            # Pillaging
            pillage = random.uniform(0.02, 0.08)
            for res in [ResourceType.GRAIN, ResourceType.GOLD]:
                taken = loser.stockpile.get(res, 0) * pillage
                loser.stockpile[res] = loser.stockpile.get(res, 0) - taken
                winner.stockpile[res] = winner.stockpile.get(res, 0) + taken

            # Morale effects
            loser.happiness = max(0.05, loser.happiness - 0.05)
            loser.stability = max(0.05, loser.stability - 0.03)

            self._log(
                f"\n  BATTLE: {winner.name} wins skirmish vs {loser.name}! "
                f"(Losses: {winner_losses} vs {loser_losses})"
            )

            # War exhaustion — might end naturally
            if loser.population.soldiers < 20:
                self.world.set_diplomacy(city_a_name, city_b_name, DiplomaticStatus.HOSTILE)
                self._log(f"  {loser.name} sues for peace. War ends.")

    def resolve_player_event(self, choice_idx: int) -> str:
        """Resolve a pending event with the player's choice."""
        if not self.pending_event:
            return "No pending event."

        city = self.world.cities.get(self.pending_event.target_city)
        if not city:
            return "City not found."

        result = apply_event_choice(city, self.pending_event, choice_idx, self.world)
        self.pending_event = None
        return result

    def _get_agent_city(self, agent_id: str) -> Optional[CityState]:
        """Get the city managed by an agent."""
        for city in self.world.cities.values():
            if city.governor_id == agent_id:
                return city
        return None

    def _log(self, message: str):
        """Add to turn log."""
        self.turn_log.append(message)

    def get_leaderboard(self) -> str:
        """Generate a leaderboard of all cities."""
        lines = ["\n--- LEADERBOARD ---"]
        cities = sorted(
            self.world.cities.values(),
            key=lambda c: c.treasury.net_worth + c.population.total * 0.5,
            reverse=True,
        )
        for rank, city in enumerate(cities, 1):
            agent = self.agents.get(city.governor_id)
            philosophy = agent.philosophy.value if agent else "?"
            score = city.treasury.net_worth + city.population.total * 0.5
            lines.append(
                f"  {rank}. {city.name} ({philosophy}) — "
                f"Score: {score:.0f} | Pop: {city.population.total:,} | "
                f"Gold: {city.treasury.gold_reserves:.0f} | "
                f"Army: {city.population.soldiers}"
            )
        return "\n".join(lines)
