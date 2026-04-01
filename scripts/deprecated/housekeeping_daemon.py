#!/usr/bin/env python3
"""
housekeeping_daemon.py
======================
DEPRECATED — superseded by Claude Code scheduled remote agents (/schedule).
Kept as a no-Claude fallback for environments without claude.ai access
(air-gapped machines, containers, CI). Not actively maintained.
See: 0 - Housekeeping/Automated Housekeeping Schedule.md § Remote Scheduled Agents

-----

Portable scheduler for vault automated housekeeping. Implements the same
schedule as the systemd timers — use this on any machine where systemd
is unavailable (containers, WSL, macOS, etc.).

Usage:
    python3 scripts/housekeeping_daemon.py           # foreground (Ctrl-C to stop)
    python3 scripts/housekeeping_daemon.py --daemon  # daemonize (writes PID to logs/daemon.pid)
    python3 scripts/housekeeping_daemon.py --stop    # stop a running daemon
    python3 scripts/housekeeping_daemon.py --status  # show next scheduled runs
    python3 scripts/housekeeping_daemon.py --run <task>  # run one task immediately

Schedule:
    Daily   06:05   orphan-report      (semantic_tagger.py --report)
    Weekly  Sun 22:00  semantic-tag    (semantic_tagger.py)
    Weekly  Mon 06:00  project-scan    (scan_projects.py --report)
    Monthly 1st 07:00  tfidf-tag       (tfidf_tagger.py)
    Monthly 1st 07:20  path-index      (directories2path_n_index.py)
"""

import sys
import os
import time
import subprocess
import logging
import signal
import argparse
from datetime import datetime, timedelta
from pathlib import Path

VAULT = Path(__file__).parent.parent.resolve()
LOGS = VAULT / "logs"
LOGS.mkdir(exist_ok=True)
PID_FILE = LOGS / "daemon.pid"

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    handlers=[
        logging.FileHandler(LOGS / "housekeeping.log"),
        logging.StreamHandler(sys.stdout),
    ],
)
log = logging.getLogger("housekeeping")


# ---------------------------------------------------------------------------
# Task definitions
# ---------------------------------------------------------------------------

def run_task(name: str, args: list[str], log_file: str | None = None):
    log_path = LOGS / (log_file or "housekeeping.log")
    cmd = [sys.executable] + args
    log.info(f"Starting task: {name}")
    try:
        with open(log_path, "a") as f:
            result = subprocess.run(
                cmd,
                cwd=str(VAULT),
                stdout=f,
                stderr=f,
                timeout=600,  # 10 minute max per task
            )
        if result.returncode == 0:
            log.info(f"Task {name} completed OK")
        else:
            log.warning(f"Task {name} exited with code {result.returncode}")
    except subprocess.TimeoutExpired:
        log.error(f"Task {name} timed out after 10 minutes")
    except Exception as e:
        log.error(f"Task {name} failed: {e}")


TASKS = {
    "orphan-report": lambda: run_task(
        "orphan-report",
        ["scripts/semantic_tagger.py", "--report"],
        "daily-orphan-report.txt",
    ),
    "semantic-tag": lambda: run_task(
        "semantic-tag",
        ["scripts/semantic_tagger.py"],
    ),
    "project-scan": lambda: run_task(
        "project-scan",
        ["scripts/scan_projects.py", "--report"],
    ),
    "tfidf-tag": lambda: run_task(
        "tfidf-tag",
        ["scripts/tfidf_tagger.py"],
    ),
    "path-index": lambda: run_task(
        "path-index",
        ["scripts/directories2path_n_index.py"],
    ),
}


# ---------------------------------------------------------------------------
# Schedule helpers
# ---------------------------------------------------------------------------

def next_daily(hour: int, minute: int) -> datetime:
    """Next occurrence of HH:MM today or tomorrow."""
    now = datetime.now()
    candidate = now.replace(hour=hour, minute=minute, second=0, microsecond=0)
    if candidate <= now:
        candidate += timedelta(days=1)
    return candidate


def next_weekday(weekday: int, hour: int, minute: int) -> datetime:
    """Next occurrence of weekday (0=Mon … 6=Sun) at HH:MM."""
    now = datetime.now()
    days_ahead = (weekday - now.weekday()) % 7
    candidate = (now + timedelta(days=days_ahead)).replace(
        hour=hour, minute=minute, second=0, microsecond=0
    )
    if candidate <= now:
        candidate += timedelta(weeks=1)
    return candidate


def next_monthly(day: int, hour: int, minute: int) -> datetime:
    """Next occurrence of the Nth of the month at HH:MM."""
    now = datetime.now()
    # Try this month first
    try:
        candidate = now.replace(day=day, hour=hour, minute=minute, second=0, microsecond=0)
    except ValueError:
        candidate = None
    if candidate is None or candidate <= now:
        # Advance to next month
        if now.month == 12:
            candidate = now.replace(year=now.year + 1, month=1, day=day,
                                    hour=hour, minute=minute, second=0, microsecond=0)
        else:
            candidate = now.replace(month=now.month + 1, day=day,
                                    hour=hour, minute=minute, second=0, microsecond=0)
    return candidate


def build_schedule() -> list[tuple[datetime, str]]:
    return [
        (next_daily(6, 5),         "orphan-report"),
        (next_weekday(6, 22, 0),   "semantic-tag"),   # 6 = Sunday
        (next_weekday(0, 6, 0),    "project-scan"),   # 0 = Monday
        (next_monthly(1, 7, 0),    "tfidf-tag"),
        (next_monthly(1, 7, 20),   "path-index"),
    ]


# ---------------------------------------------------------------------------
# Daemon helpers
# ---------------------------------------------------------------------------

def daemonize():
    """Double-fork to fully detach from terminal."""
    if os.fork() > 0:
        sys.exit(0)
    os.setsid()
    if os.fork() > 0:
        sys.exit(0)
    # Redirect stdin/stdout/stderr to /dev/null
    with open(os.devnull, "r") as f:
        os.dup2(f.fileno(), sys.stdin.fileno())
    # Keep our logging handlers; close only the terminal stdout/stderr
    PID_FILE.write_text(str(os.getpid()))
    log.info(f"Daemon started (PID {os.getpid()})")


def stop_daemon():
    if not PID_FILE.exists():
        print("No daemon PID file found. Is the daemon running?")
        sys.exit(1)
    pid = int(PID_FILE.read_text().strip())
    try:
        os.kill(pid, signal.SIGTERM)
        PID_FILE.unlink()
        print(f"Sent SIGTERM to daemon PID {pid}")
    except ProcessLookupError:
        print(f"Process {pid} not found. Cleaning up stale PID file.")
        PID_FILE.unlink()


def show_status():
    schedule = build_schedule()
    print(f"\n{'Task':<20} {'Next Run':<25}")
    print("-" * 46)
    for dt, name in sorted(schedule):
        print(f"{name:<20} {dt.strftime('%Y-%m-%d %H:%M')}")
    print()
    if PID_FILE.exists():
        print(f"Daemon PID: {PID_FILE.read_text().strip()}")
    else:
        print("Daemon: not running")


# ---------------------------------------------------------------------------
# Main loop
# ---------------------------------------------------------------------------

def run_loop():
    schedule = build_schedule()
    log.info("Housekeeping daemon running. Schedule:")
    for dt, name in sorted(schedule):
        log.info(f"  {name}: {dt.strftime('%Y-%m-%d %H:%M')}")

    while True:
        now = datetime.now()
        fired = []
        next_schedule = []

        for dt, name in schedule:
            if now >= dt:
                TASKS[name]()
                fired.append(name)
                # Reschedule
                if name == "orphan-report":
                    next_schedule.append((next_daily(6, 5), name))
                elif name == "semantic-tag":
                    next_schedule.append((next_weekday(6, 22, 0), name))
                elif name == "project-scan":
                    next_schedule.append((next_weekday(0, 6, 0), name))
                elif name == "tfidf-tag":
                    next_schedule.append((next_monthly(1, 7, 0), name))
                elif name == "path-index":
                    next_schedule.append((next_monthly(1, 7, 20), name))
            else:
                next_schedule.append((dt, name))

        schedule = next_schedule

        if fired:
            log.info(f"Next scheduled runs:")
            for dt, name in sorted(schedule):
                log.info(f"  {name}: {dt.strftime('%Y-%m-%d %H:%M')}")

        # Sleep 60 seconds between checks
        time.sleep(60)


# ---------------------------------------------------------------------------
# Entry point
# ---------------------------------------------------------------------------

def main():
    parser = argparse.ArgumentParser(description="Vault housekeeping daemon")
    parser.add_argument("--daemon", action="store_true", help="Run as background daemon")
    parser.add_argument("--stop", action="store_true", help="Stop running daemon")
    parser.add_argument("--status", action="store_true", help="Show schedule and daemon status")
    parser.add_argument("--run", metavar="TASK", help=f"Run a task immediately: {list(TASKS)}")
    args = parser.parse_args()

    if args.stop:
        stop_daemon()
        return

    if args.status:
        show_status()
        return

    if args.run:
        if args.run not in TASKS:
            print(f"Unknown task '{args.run}'. Available: {list(TASKS)}")
            sys.exit(1)
        TASKS[args.run]()
        return

    if args.daemon:
        daemonize()

    run_loop()


if __name__ == "__main__":
    main()
