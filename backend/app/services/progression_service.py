import math
from datetime import datetime


# hours_for_level(n) = LEVEL_HOURS_CONSTANT * (n - 1) ** 2
# Tuned so ~2,000 hours ≈ level 21, ~25,000 hours ≈ level 71 (Eternal Gamer territory)
LEVEL_HOURS_CONSTANT = 5

TITLE_TIERS = [
    (1, "Newcomer"),
    (5, "Player"),
    (15, "Explorer"),
    (30, "Veteran"),
    (50, "Champion"),
    (75, "Legend"),
]


def hours_for_level(level: int) -> float:
    """Total cumulative hours required to REACH this level."""
    if level <= 1:
        return 0
    return LEVEL_HOURS_CONSTANT * (level - 1) ** 2


def title_for_level(level: int) -> str:
    title = TITLE_TIERS[0][1]
    for threshold, name in TITLE_TIERS:
        if level >= threshold:
            title = name
        else:
            break
    return title


def calculate_progression(total_hours: float) -> dict:
    """
    Compute a player's GameLegacy level, title, and progress toward
    the next level based on total lifetime gaming hours.
    """
    if total_hours <= 0:
        level = 1
    else:
        level = max(int(1 + math.sqrt(total_hours / LEVEL_HOURS_CONSTANT)), 1)

    current_floor = hours_for_level(level)
    next_floor = hours_for_level(level + 1)

    span = next_floor - current_floor
    progress = (total_hours - current_floor) / span if span > 0 else 0
    progress = max(0.0, min(1.0, progress))

    return {
        "level": level,
        "title": title_for_level(level),
        "current_hours": round(total_hours, 1),
        "hours_for_current_level": round(current_floor, 1),
        "hours_for_next_level": round(next_floor, 1),
        "progress_percent": round(progress * 100, 1),
    }


GAMELEGACY_ACHIEVEMENTS = [
    {
        "id": "the_beginning",
        "name": "The Beginning",
        "description": "Connect your first account.",
    },
    {
        "id": "the_archivist",
        "name": "The Archivist",
        "description": "Create a gaming history covering 10 years.",
    },
    {
        "id": "the_collector",
        "name": "The Collector",
        "description": "Own 500 games.",
    },
    {
        "id": "the_eternal_gamer",
        "name": "The Eternal Gamer",
        "description": "Reach 25,000 lifetime gaming hours.",
    },
]


def calculate_gamelegacy_achievements(
    total_games: int,
    total_hours: float,
    earliest_account_year: int | None,
) -> list[dict]:
    """
    Compute progress toward GameLegacy's own exclusive achievements
    (PRD section 9), based on a player's combined identity stats.
    """
    current_year = datetime.utcnow().year
    years_of_history = max((current_year - earliest_account_year), 0) if earliest_account_year else 0

    results = []
    for ach in GAMELEGACY_ACHIEVEMENTS:
        if ach["id"] == "the_beginning":
            current, target = 1, 1
        elif ach["id"] == "the_archivist":
            current, target = years_of_history, 10
        elif ach["id"] == "the_collector":
            current, target = total_games, 500
        elif ach["id"] == "the_eternal_gamer":
            current, target = total_hours, 25000
        else:
            current, target = 0, 1

        progress_percent = round(min(current / target, 1.0) * 100, 1) if target > 0 else 0

        results.append({
            **ach,
            "achieved": current >= target,
            "progress_current": round(float(current), 1),
            "progress_target": float(target),
            "progress_percent": progress_percent,
        })

    return results