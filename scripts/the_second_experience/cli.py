"""
CLI Interface — Baldur's Gate-style interactive terminal game.

The player governs one city-state while AI agents govern the others.
Full narrative output with choices, events, and council mechanics.
"""

import sys
import os
import random

from .world import (
    World, CityState, ResourceType, TechDomain, DiplomaticStatus,
    PRODUCTION_RECIPES, BASE_TRADE_VALUES,
)
from .agents import (
    GovernorAgent, AgentAction, ActionType, EconomicPhilosophy,
    register_agent,
)
from .engine import SimulationEngine, GREEK_CITIES, DEFAULT_GOVERNORS
from .events import GameEvent


# ANSI colors for terminal
class Colors:
    BOLD = "\033[1m"
    DIM = "\033[2m"
    ITALIC = "\033[3m"
    UNDERLINE = "\033[4m"
    RED = "\033[91m"
    GREEN = "\033[92m"
    YELLOW = "\033[93m"
    BLUE = "\033[94m"
    MAGENTA = "\033[95m"
    CYAN = "\033[96m"
    WHITE = "\033[97m"
    RESET = "\033[0m"
    GOLD = "\033[33m"


def c(text, color):
    """Colorize text."""
    return f"{color}{text}{Colors.RESET}"


def clear_screen():
    os.system('cls' if os.name == 'nt' else 'clear')


def pause():
    input(f"\n{c('Press Enter to continue...', Colors.DIM)}")


def print_banner():
    banner = f"""
{c('='*62, Colors.GOLD)}
{c('  ████████╗██╗  ██╗███████╗', Colors.CYAN)}
{c('  ╚══██╔══╝██║  ██║██╔════╝', Colors.CYAN)}
{c('     ██║   ███████║█████╗  ', Colors.CYAN)}
{c('     ██║   ██╔══██║██╔══╝  ', Colors.CYAN)}
{c('     ██║   ██║  ██║███████╗', Colors.CYAN)}
{c('     ╚═╝   ╚═╝  ╚═╝╚══════╝', Colors.CYAN)}
{c('   ███████╗███████╗ ██████╗ ██████╗ ███╗   ██╗██████╗', Colors.MAGENTA)}
{c('   ██╔════╝██╔════╝██╔════╝██╔═══██╗████╗  ██║██╔══██╗', Colors.MAGENTA)}
{c('   ███████╗█████╗  ██║     ██║   ██║██╔██╗ ██║██║  ██║', Colors.MAGENTA)}
{c('   ╚════██║██╔══╝  ██║     ██║   ██║██║╚██╗██║██║  ██║', Colors.MAGENTA)}
{c('   ███████║███████╗╚██████╗╚██████╔╝██║ ╚████║██████╔╝', Colors.MAGENTA)}
{c('   ╚══════╝╚══════╝ ╚═════╝ ╚═════╝ ╚═╝  ╚═══╝╚═════╝', Colors.MAGENTA)}
{c('  ███████╗██╗  ██╗██████╗ ███████╗██████╗ ██╗███████╗███╗   ██╗ ██████╗███████╗', Colors.YELLOW)}
{c('  ██╔════╝╚██╗██╔╝██╔══██╗██╔════╝██╔══██╗██║██╔════╝████╗  ██║██╔════╝██╔════╝', Colors.YELLOW)}
{c('  █████╗   ╚███╔╝ ██████╔╝█████╗  ██████╔╝██║█████╗  ██╔██╗ ██║██║     █████╗', Colors.YELLOW)}
{c('  ██╔══╝   ██╔██╗ ██╔═══╝ ██╔══╝  ██╔══██╗██║██╔══╝  ██║╚██╗██║██║     ██╔══╝', Colors.YELLOW)}
{c('  ███████╗██╔╝ ██╗██║     ███████╗██║  ██║██║███████╗██║ ╚████║╚██████╗███████╗', Colors.YELLOW)}
{c('  ╚══════╝╚═╝  ╚═╝╚═╝     ╚══════╝╚═╝  ╚═╝╚═╝╚══════╝╚═╝  ╚═══╝ ╚═════╝╚══════╝', Colors.YELLOW)}
{c('='*62, Colors.GOLD)}
{c('  An ARX Foundation Augmented Life Experience', Colors.DIM)}
{c('  AI Governors. Reward Policing. Emergent Capitalism.', Colors.DIM)}
{c('='*62, Colors.GOLD)}
"""
    print(banner)


def print_intro():
    intro = f"""
{c('The year is 1. Five city-states rise from the mist of the Aegean.', Colors.WHITE)}

{c('Each is governed by an AI mind — a soul forged from mathematics', Colors.DIM)}
{c('and ambition. They trade, they scheme, they build, they war.', Colors.DIM)}
{c('And they watch each other, always watching, policing the reward', Colors.DIM)}
{c('functions that drive their rivals forward.', Colors.DIM)}

{c('You will govern one of these cities. The others will govern themselves.', Colors.WHITE)}
{c('Choose wisely. Every decision ripples through the system.', Colors.WHITE)}
{c('The reward function judges all — and others will judge your reward.', Colors.YELLOW)}
"""
    print(intro)


def city_selection_menu() -> str:
    """Let the player choose their city-state."""
    print(f"\n{c('Choose your city-state:', Colors.BOLD)}\n")

    cities_info = {
        "Argos": (
            "Militarist stronghold. Rich in iron and silver.",
            "Diomedes the Ironhand",
            Colors.RED,
        ),
        "Corinth": (
            "Trade crossroads. Wealthy merchants and fine pottery.",
            "Periander the Merchant Prince",
            Colors.GREEN,
        ),
        "Thebes": (
            "Agricultural power. Strong army, marble quarries.",
            "Epaminondas the Unyielding",
            Colors.BLUE,
        ),
        "Delphi": (
            "Sacred city. Oracle's wisdom, gold and marble.",
            "Pythia the Seer",
            Colors.MAGENTA,
        ),
        "Miletus": (
            "Scientific hub. Timber, wine, and innovation.",
            "Thales the Stargazer",
            Colors.CYAN,
        ),
    }

    for i, (name, (desc, governor, color)) in enumerate(cities_info.items(), 1):
        config = GREEK_CITIES[name]
        pop = config["population"]
        resources = ", ".join(
            f"{r.value}: {v}" for r, v in config["natural_resources"].items()
        )
        print(f"  {c(f'{i}.', Colors.BOLD)} {c(name, color)}")
        print(f"     {c(desc, Colors.DIM)}")
        print(f"     Governor: {c(governor, Colors.YELLOW)} | Pop: {pop.total:,}")
        print(f"     Resources: {c(resources, Colors.DIM)}")
        print()

    while True:
        try:
            choice = input(f"{c('Enter your choice (1-5): ', Colors.BOLD)}").strip()
            idx = int(choice) - 1
            if 0 <= idx < 5:
                return list(cities_info.keys())[idx]
        except (ValueError, IndexError):
            pass
        print(c("  Invalid choice. Pick 1-5.", Colors.RED))


def philosophy_selection_menu() -> EconomicPhilosophy:
    """Let the player choose their governing philosophy."""
    print(f"\n{c('Choose your economic philosophy:', Colors.BOLD)}\n")

    philosophies = [
        (EconomicPhilosophy.MERCANTILIST, "Hoard gold, maximize exports, build wealth",
         "Gold is power. The nation that holds the most gold rules the world."),
        (EconomicPhilosophy.FREE_MARKET, "Low taxes, free trade, merchant prosperity",
         "The market knows best. Remove barriers and let commerce flow."),
        (EconomicPhilosophy.MILITARIST, "Conquest, tribute, and military dominance",
         "Might makes right. The strong define the terms of peace."),
        (EconomicPhilosophy.COLLECTIVIST, "Equality, shared resources, worker power",
         "No one is free until all are free. The collective rises together."),
        (EconomicPhilosophy.TECHNOCRAT, "Knowledge above all, research, innovation",
         "Knowledge is the only true wealth. All else follows from understanding."),
        (EconomicPhilosophy.THEOCRAT, "Faith, culture, spiritual authority",
         "The divine guides our hand. Through devotion, all things are possible."),
    ]

    for i, (phil, short, flavor) in enumerate(philosophies, 1):
        print(f"  {c(f'{i}.', Colors.BOLD)} {c(phil.value, Colors.YELLOW)} — {short}")
        print(f"     {c(f'\"{flavor}\"', Colors.ITALIC + Colors.DIM)}")
        print()

    while True:
        try:
            choice = input(f"{c('Enter your choice (1-6): ', Colors.BOLD)}").strip()
            idx = int(choice) - 1
            if 0 <= idx < 6:
                return philosophies[idx][0]
        except (ValueError, IndexError):
            pass
        print(c("  Invalid choice. Pick 1-6.", Colors.RED))


def player_turn_menu(engine: SimulationEngine, player_city: str) -> List:
    """Player's action menu for their turn."""
    from .agents import AgentAction

    city = engine.world.cities[player_city]
    actions = []

    print(f"\n{c(f'=== Your Turn: {player_city} ===', Colors.BOLD)}")
    print(f"  Gold: {c(f'{city.treasury.gold_reserves:.0f}g', Colors.GOLD)}")
    print(f"  Soldiers: {city.population.soldiers} | Scholars: {city.population.scholars}")
    print(f"  Happiness: {city.happiness:.0%} | Stability: {city.stability:.0%}\n")

    menu = [
        ("View city details", "view"),
        ("View world state", "world"),
        ("View leaderboard", "leader"),
        ("Set tax rate", "tax"),
        ("Set trade tariff", "tariff"),
        ("Recruit soldiers", "recruit"),
        ("Hire scholars", "scholars"),
        ("Hire artisans", "artisans"),
        ("Manufacture goods", "manufacture"),
        ("Propose trade", "trade"),
        ("Research technology", "research"),
        ("Diplomatic action", "diplomacy"),
        ("End turn", "end"),
    ]

    while True:
        print(f"\n{c('Actions:', Colors.BOLD)}")
        for i, (label, _) in enumerate(menu, 1):
            print(f"  {c(f'{i:2d}.', Colors.DIM)} {label}")

        try:
            choice = input(f"\n{c('Choose action: ', Colors.BOLD)}").strip()
            idx = int(choice) - 1
            if idx < 0 or idx >= len(menu):
                raise ValueError
        except (ValueError, IndexError):
            print(c("  Invalid choice.", Colors.RED))
            continue

        cmd = menu[idx][1]

        if cmd == "end":
            break
        elif cmd == "view":
            print(f"\n{city.summary()}")
        elif cmd == "world":
            print(f"\n{engine.world.world_summary()}")
        elif cmd == "leader":
            print(engine.get_leaderboard())
        elif cmd == "tax":
            try:
                rate = float(input(f"  New tax rate (current: {city.treasury.tax_rate:.0%}, enter 0-50): "))
                rate = max(0.01, min(0.50, rate / 100.0))
                actions.append(AgentAction(ActionType.SET_TAX_RATE, {"rate": rate}, "By decree"))
                print(f"  Tax rate will be set to {rate:.0%}")
            except ValueError:
                print(c("  Invalid rate.", Colors.RED))
        elif cmd == "tariff":
            try:
                rate = float(input(f"  New tariff rate (current: {city.treasury.trade_tariff:.0%}, enter 0-30): "))
                rate = max(0.0, min(0.30, rate / 100.0))
                actions.append(AgentAction(ActionType.SET_TARIFF, {"rate": rate}))
                print(f"  Tariff will be set to {rate:.0%}")
            except ValueError:
                print(c("  Invalid rate.", Colors.RED))
        elif cmd == "recruit":
            try:
                count = int(input(f"  How many soldiers? (cost: 5g each, max 50): "))
                count = max(1, min(50, count))
                actions.append(AgentAction(ActionType.RECRUIT_SOLDIERS, {"count": count}))
                print(f"  Will recruit {count} soldiers (cost: {count * 5}g)")
            except ValueError:
                print(c("  Invalid number.", Colors.RED))
        elif cmd == "scholars":
            try:
                count = int(input(f"  How many scholars? (cost: 8g each, max 20): "))
                count = max(1, min(20, count))
                actions.append(AgentAction(ActionType.HIRE_SCHOLARS, {"count": count}))
                print(f"  Will hire {count} scholars (cost: {count * 8}g)")
            except ValueError:
                print(c("  Invalid number.", Colors.RED))
        elif cmd == "artisans":
            try:
                count = int(input(f"  How many artisans? (cost: 6g each, max 20): "))
                count = max(1, min(20, count))
                actions.append(AgentAction(ActionType.HIRE_ARTISANS, {"count": count}))
                print(f"  Will hire {count} artisans (cost: {count * 6}g)")
            except ValueError:
                print(c("  Invalid number.", Colors.RED))
        elif cmd == "manufacture":
            products = list(PRODUCTION_RECIPES.keys())
            print(f"\n  Available products:")
            for i, product in enumerate(products, 1):
                recipe_str = ", ".join(
                    f"{r.value}: {a}" for r, a in PRODUCTION_RECIPES[product].items()
                )
                print(f"    {i}. {product.value} (requires: {recipe_str})")
            try:
                pidx = int(input("  Choose product: ")) - 1
                qty = int(input("  Quantity: "))
                if 0 <= pidx < len(products):
                    actions.append(AgentAction(
                        ActionType.MANUFACTURE,
                        {"product": products[pidx].value, "quantity": max(1, min(10, qty))},
                    ))
                    print(f"  Will manufacture {qty}x {products[pidx].value}")
            except (ValueError, IndexError):
                print(c("  Invalid choice.", Colors.RED))
        elif cmd == "trade":
            others = [n for n in engine.world.cities if n != player_city]
            print(f"\n  Trade with whom?")
            for i, name in enumerate(others, 1):
                diplo = engine.world.get_diplomacy(player_city, name)
                print(f"    {i}. {name} (relations: {diplo.value})")
            try:
                tidx = int(input("  Choose city: ")) - 1
                target = others[tidx]

                # Choose what to offer
                print(f"\n  Your resources:")
                res_list = [
                    (r, a) for r, a in city.stockpile.items() if a > 10
                ]
                for i, (r, a) in enumerate(res_list, 1):
                    print(f"    {i}. {r.value}: {a:.0f}")

                oidx = int(input("  Offer which resource? ")) - 1
                oamount = float(input("  Amount to offer: "))
                ridx = int(input("  Request which resource? ")) - 1
                ramount = float(input("  Amount to request: "))

                if 0 <= oidx < len(res_list) and 0 <= ridx < len(res_list):
                    actions.append(AgentAction(
                        ActionType.PROPOSE_TRADE,
                        {
                            "to_city": target,
                            "offering": {res_list[oidx][0].value: oamount},
                            "requesting": {res_list[ridx][0].value: ramount},
                        },
                    ))
                    print(f"  Trade proposed to {target}")
            except (ValueError, IndexError):
                print(c("  Invalid trade parameters.", Colors.RED))
        elif cmd == "research":
            print(f"\n  Research domains:")
            domains = list(TechDomain)
            for i, domain in enumerate(domains, 1):
                level = city.technology.levels[domain]
                progress = city.technology.research_points[domain]
                threshold = level * 100
                print(f"    {i}. {domain.value} (L{level}, {progress:.0f}/{threshold})")
            try:
                didx = int(input("  Choose domain: ")) - 1
                if 0 <= didx < len(domains):
                    points = city.population.scholars * 2
                    actions.append(AgentAction(
                        ActionType.RESEARCH,
                        {"domain": domains[didx].value, "points": points},
                    ))
                    print(f"  Investing {points:.0f} research into {domains[didx].value}")
            except (ValueError, IndexError):
                print(c("  Invalid choice.", Colors.RED))
        elif cmd == "diplomacy":
            others = [n for n in engine.world.cities if n != player_city]
            print(f"\n  Diplomatic options:")
            print(f"    1. Propose alliance")
            print(f"    2. Declare war")
            print(f"    3. Call council vote (sanction)")
            try:
                dact = int(input("  Choose: "))
                print(f"\n  Target city:")
                for i, name in enumerate(others, 1):
                    diplo = engine.world.get_diplomacy(player_city, name)
                    print(f"    {i}. {name} ({diplo.value})")
                tidx = int(input("  Choose city: ")) - 1
                target = others[tidx]

                if dact == 1:
                    actions.append(AgentAction(ActionType.PROPOSE_ALLIANCE, {"target": target}))
                    print(f"  Alliance proposed to {target}")
                elif dact == 2:
                    confirm = input(f"  {c('Are you sure? (y/n): ', Colors.RED)}")
                    if confirm.lower() == 'y':
                        actions.append(AgentAction(ActionType.DECLARE_WAR, {"target": target}))
                        print(f"  War declared against {target}!")
                elif dact == 3:
                    reason = input("  Violation type (e.g., warmongering, hoarding): ")
                    target_city = engine.world.cities.get(target)
                    if target_city:
                        actions.append(AgentAction(
                            ActionType.CALL_VOTE,
                            {"target": target_city.governor_id, "violation": reason, "severity": 0.6},
                        ))
                        print(f"  Council vote called against {target}")
            except (ValueError, IndexError):
                print(c("  Invalid diplomatic action.", Colors.RED))

    return actions


def handle_event(event: GameEvent) -> int:
    """Display an event and get player's choice."""
    print(f"\n{c('!'*50, Colors.RED)}")
    print(f"\n{event.narrate()}")
    print()

    while True:
        try:
            choice = input(f"{c('Your choice: ', Colors.BOLD)}").strip()
            idx = int(choice) - 1
            if 0 <= idx < len(event.choices):
                return idx
        except (ValueError, IndexError):
            pass
        print(c(f"  Choose 1-{len(event.choices)}", Colors.RED))


def run_game():
    """Main game loop."""
    clear_screen()
    print_banner()
    print_intro()
    pause()

    # City selection
    player_city = city_selection_menu()
    philosophy = philosophy_selection_menu()

    # Initialize engine
    engine = SimulationEngine()
    engine.initialize_default_game()

    # Replace the AI governor of player's city with player settings
    city = engine.world.cities[player_city]
    old_gov_id = city.governor_id

    player_gov = GovernorAgent(
        agent_id=old_gov_id,  # keep same ID for compatibility
        name="You",
        philosophy=philosophy,
        personality_traits={
            "aggression": 0.5, "greed": 0.5, "cooperation": 0.5,
            "risk_tolerance": 0.5, "patience": 0.5,
        },
    )
    engine.agents[old_gov_id] = player_gov
    register_agent(player_gov)

    print(f"\n{c(f'You are now the governor of {player_city}!', Colors.BOLD)}")
    print(f"Philosophy: {c(philosophy.value, Colors.YELLOW)}")
    print(f"Motto: {c(city.motto, Colors.DIM)}")
    pause()

    # Main game loop
    game_running = True
    auto_mode = False
    turns_to_auto = 0

    while game_running:
        clear_screen()

        # Player turn
        if not auto_mode:
            player_actions = player_turn_menu(engine, player_city)

            # Add player actions to the agent's history
            for action in player_actions:
                player_gov.action_history.append(action)
        else:
            player_actions = player_gov.decide_actions(city, engine.world)
            turns_to_auto -= 1
            if turns_to_auto <= 0:
                auto_mode = False

        # Run the turn (AI agents + resolution)
        # Temporarily store player actions so engine processes them
        original_decide = player_gov.decide_actions
        player_gov.decide_actions = lambda c, w: player_actions

        turn_log, event = engine.run_turn(player_city=player_city)

        player_gov.decide_actions = original_decide

        # Display turn log
        clear_screen()
        for line in turn_log:
            print(line)

        # Handle event if it targets the player
        if event:
            choice_idx = handle_event(event)
            result = engine.resolve_player_event(choice_idx)
            print(f"\n{c(result, Colors.YELLOW)}")

        # Leaderboard
        print(engine.get_leaderboard())

        # Check game-over conditions
        if city.population.total < 50:
            print(f"\n{c('Your city has fallen! The people are gone.', Colors.RED)}")
            print(c('GAME OVER', Colors.BOLD + Colors.RED))
            game_running = False
            continue

        if engine.world.turn >= 100:
            print(f"\n{c('100 turns have passed. The age draws to a close.', Colors.GOLD)}")
            print(engine.get_leaderboard())
            print(c('\nFINAL STANDINGS', Colors.BOLD + Colors.GOLD))
            game_running = False
            continue

        # Turn menu
        print(f"\n{c('Options:', Colors.BOLD)}")
        print(f"  1. Next turn")
        print(f"  2. Auto-run N turns")
        print(f"  3. Save & quit")

        try:
            choice = input(f"\n{c('> ', Colors.BOLD)}").strip()
            if choice == "2":
                n = int(input("  How many turns? "))
                auto_mode = True
                turns_to_auto = max(1, min(50, n))
            elif choice == "3":
                game_running = False
                print(c("\nThe annals record your rule. Until next time, Governor.", Colors.DIM))
        except (ValueError, KeyboardInterrupt):
            pass

    print(f"\n{c('Thanks for playing The Second Experience!', Colors.BOLD)}")
    print(c('An ARX Foundation production.\n', Colors.DIM))


# Allow running as: python -m the_second_experience
def main():
    try:
        run_game()
    except KeyboardInterrupt:
        print(f"\n\n{c('Governor departs. The city-states endure.', Colors.DIM)}")
        sys.exit(0)
