#!/usr/bin/env python3
"""
Media Migration Script for Obsidian Zettelkasten
Scans directories across the system for media files and routes them:
  - Photos        → Immich consume (personal photo/video backup)
  - Videos        → Immich consume (personal) OR Jellyfin (media library)
  - Audio/Music   → Jellyfin music library
  - PDFs/Docs     → Vault's 4 - Source Material/Attachments/

Architecture:
  Immich    = personal photos & videos (face detection, memories, timeline)
  Jellyfin  = consumable media library (music, movies, shows)
  Vault     = documents, PDFs, attachments for Zettelkasten

TODO: Infrastructure & Integration
──────────────────────────────────────────────────────────────────────────
[ ] Jellyfin setup — docker-compose config for Jellyfin on The Arxives
    - Mount music library at /media/elryan/The Arxives/jellyfin/music
    - Mount video library at /media/elryan/The Arxives/jellyfin/videos
    - Configure hardware transcoding if GPU available
[ ] Jellyfin music library structure — organize by Artist/Album/Track
    - Use ffprobe to read ID3/Vorbis tags for auto-sorting
    - Fallback: dump to unsorted/ if no tags found
[ ] Navidrome as lightweight alternative — if Jellyfin feels heavy for
    music-only use, Navidrome is purpose-built and supports Subsonic API
    (apps: Symfonium on Android, DSub, Ultrasonic)
[ ] Duplicate detection — hash-based (MD5/SHA256) dedup before moving,
    avoid filling Jellyfin/Immich with copies of the same file
[ ] Immich vs Jellyfin video routing — personal videos (phone recordings,
    screen captures) → Immich; media content (movies, shows, downloaded
    videos) → Jellyfin. Heuristic: DCIM paths / phone-style filenames
    go to Immich, everything else to Jellyfin
[ ] Configurable paths — read destinations from a .migrate_media.conf
    file or environment variables instead of hardcoding
[ ] Dry-run report export — --dry-run --report output.txt for reviewing
    large migrations before committing
[ ] Post-migration Obsidian note — auto-generate a vault note logging
    what was migrated, when, from where (for personal records)
──────────────────────────────────────────────────────────────────────────
"""

import os
import sys
import shutil
import subprocess
from pathlib import Path
from datetime import datetime

VAULT_ROOT = Path(__file__).parent.parent
MEDIA_BASE = VAULT_ROOT / "4 - Source Material"
IMMICH_CONSUME = Path("/media/elryan/The Arxives/immich/consume")
JELLYFIN_MUSIC = Path("/media/elryan/The Arxives/jellyfin/music")
JELLYFIN_VIDEOS = Path("/media/elryan/The Arxives/jellyfin/videos")

# ─── Audio Visualizer Config ────────────────────────────────────────────────
# Convert audio files to music videos with visualizers. Primary audio goes
# to Jellyfin for proper playback, but visualized versions can optionally
# be sent to Immich as shareable music video content.
#
# TODO: Audio Visualizer Pipeline
# ──────────────────────────────────────────────────────────────────────────
# [x] Basic FFmpeg showwaves visualizer (solid color bg + waveform)
# [ ] Spectrum analyzer mode (showspectrum filter) — frequency bands, more visual
# [ ] Audio vectorscope mode (avectorscope) — Lissajous patterns, organic feel
# [ ] Album art extraction — if audio has embedded cover art, use as background
#     instead of solid color (ffprobe → extract → composite)
# [ ] Custom background image support — pass --viz-bg /path/to/image.png
#     for branded backgrounds (ARX logo, persona art, etc.)
# [ ] Title overlay — burn track name + artist into the video
#     (drawtext filter, pull from ID3/Vorbis tags via ffprobe)
# [ ] Batch quality presets — --viz-quality low|med|high
#     low: 480p 15fps (fast, small), med: 720p 30fps, high: 1080p 30fps
# [ ] Duration-aware encoding — show progress bar / ETA for long albums
# [ ] Color theming — --viz-color scheme (neon, warm, cool, mono)
#     or auto-pick based on album art dominant color
# [ ] Multi-track album mode — concatenate tracks into one video with
#     chapter markers (ffmpeg -map_metadata)
# [ ] Jellyfin music video library — send visualized .mp4s to a separate
#     Jellyfin "Music Videos" library alongside the raw audio library
# ──────────────────────────────────────────────────────────────────────────

VISUALIZER_STYLES = {
    "waveform": {
        # showwaves: classic waveform, clean and readable
        "filter": "showwaves=s=1280x720:mode=cline:rate=30:colors=0x00FFAA",
        "description": "Waveform line on dark background",
    },
    "spectrum": {
        # showspectrum: frequency spectrum, colorful
        "filter": "showspectrum=s=1280x720:mode=combined:color=intensity:scale=cbrt",
        "description": "Frequency spectrum heatmap",
    },
    "vectorscope": {
        # avectorscope: Lissajous-style stereo visualization
        "filter": "avectorscope=s=1280x720:mode=lissajous_xy:draw=dot:scale=cbrt",
        "description": "Stereo vectorscope (Lissajous patterns)",
    },
}

DEFAULT_VIZ_STYLE = "waveform"

# ─── Destinations ────────────────────────────────────────────────────────────
# "immich"       → Immich consume folder (personal photos + videos)
# "jellyfin"     → Jellyfin music library (audio files)
# "Attachments"  → Vault: 4 - Source Material/Attachments/

EXTENSION_MAP = {
    # Images → Immich
    ".png":  "immich",
    ".jpg":  "immich",
    ".jpeg": "immich",
    ".gif":  "immich",
    ".webp": "immich",
    ".bmp":  "immich",
    ".tiff": "immich",
    ".tif":  "immich",
    ".svg":  "immich",
    ".ico":  "immich",
    ".heic": "immich",
    ".heif": "immich",
    ".raw":  "immich",
    ".cr2":  "immich",
    ".nef":  "immich",
    ".arw":  "immich",
    ".dng":  "immich",
    # Videos → Immich
    ".mp4":  "immich",
    ".mov":  "immich",
    ".mkv":  "immich",
    ".avi":  "immich",
    ".wmv":  "immich",
    ".flv":  "immich",
    ".webm": "immich",
    ".m4v":  "immich",
    ".3gp":  "immich",
    # Audio → Jellyfin music library
    ".mp3":  "jellyfin",
    ".wav":  "jellyfin",
    ".flac": "jellyfin",
    ".aac":  "jellyfin",
    ".ogg":  "jellyfin",
    ".m4a":  "jellyfin",
    ".wma":  "jellyfin",
    ".aiff": "jellyfin",
    ".opus": "jellyfin",
    # Documents → Vault Attachments
    ".pdf":  "Attachments",
    ".doc":  "Attachments",
    ".docx": "Attachments",
    ".ppt":  "Attachments",
    ".pptx": "Attachments",
    ".xls":  "Attachments",
    ".xlsx": "Attachments",
    ".csv":  "Attachments",
    ".zip":  "Attachments",
    ".rar":  "Attachments",
    ".7z":   "Attachments",
}

# ─── Default Scan Directories ───────────────────────────────────────────────
# Common user directories to scan. Override with CLI args.

DEFAULT_SCAN_DIRS = [
    "~/Desktop",
    "~/Downloads",
    "~/Documents",
    "~/Pictures",
    "~/Videos",
    "~/Music",
    "~/Public",
]

# ─── Directories to Always Exclude ──────────────────────────────────────────
# Matched against any component in the path (case-insensitive).

EXCLUDE_DIRS = {
    # Games
    "steam", "steamapps", ".steam", "lutris", "heroic",
    "gog games", ".local/share/steam",
    "proton", "compatdata", "shadercache",
    "unity", "unreal", "epic games",
    # System / runtime
    ".cache", ".local/share/trash", ".thumbnails",
    "node_modules", "__pycache__", ".git",
    "site-packages", ".venv", "venv",
    ".npm", ".cargo", ".rustup",
    # App data unlikely to have personal media
    ".config", ".mozilla", ".thunderbird",
    "snap", "flatpak", ".var",
    # Obsidian internals (don't re-ingest vault media)
    ".obsidian", ".smart-env", ".trash",
    # The vault's own source material (avoid duplicates)
    "4 - source material",
    # Immich / Jellyfin (avoid re-ingesting)
    "immich", "jellyfin",
}

# ─── Helpers ─────────────────────────────────────────────────────────────────

def should_exclude(path):
    """Check if any path component matches an excluded directory."""
    parts_lower = [p.lower() for p in path.parts]
    for exc in EXCLUDE_DIRS:
        if exc in parts_lower:
            return True
        # Also check joined subpaths for multi-level excludes like ".local/share/steam"
        if "/" in exc:
            joined = str(path).lower()
            if exc in joined:
                return True
    return False


def resolve_conflict(dest_path):
    """If dest_path already exists, append a numeric suffix before the extension."""
    if not dest_path.exists():
        return dest_path
    stem = dest_path.stem
    suffix = dest_path.suffix
    parent = dest_path.parent
    counter = 1
    while True:
        new_name = f"{stem} ({counter}){suffix}"
        candidate = parent / new_name
        if not candidate.exists():
            return candidate
        counter += 1


def get_dest_path(target, filename):
    """Resolve the target string to an actual destination directory path."""
    if target == "immich":
        return IMMICH_CONSUME / filename
    elif target == "jellyfin":
        return JELLYFIN_MUSIC / filename
    else:
        return MEDIA_BASE / target / filename


def check_ffmpeg():
    """Check if ffmpeg is available on the system."""
    try:
        subprocess.run(["ffmpeg", "-version"], capture_output=True, check=True)
        return True
    except (FileNotFoundError, subprocess.CalledProcessError):
        return False


def audio_to_visualizer_video(audio_path, output_path, style=DEFAULT_VIZ_STYLE):
    """Convert an audio file to a video with a visualizer using FFmpeg.

    Returns True on success, False on failure.
    """
    viz = VISUALIZER_STYLES.get(style, VISUALIZER_STYLES[DEFAULT_VIZ_STYLE])

    cmd = [
        "ffmpeg", "-y",
        "-i", str(audio_path),
        "-filter_complex", f"[0:a]{viz['filter']}[v]",
        "-map", "[v]",
        "-map", "0:a",
        "-c:v", "libx264",
        "-preset", "medium",
        "-crf", "23",
        "-c:a", "aac",
        "-b:a", "192k",
        "-shortest",
        "-movflags", "+faststart",
        str(output_path),
    ]

    try:
        result = subprocess.run(cmd, capture_output=True, text=True, timeout=600)
        if result.returncode != 0:
            print(f"    FFmpeg error: {result.stderr[-200:]}")
            return False
        return True
    except subprocess.TimeoutExpired:
        print(f"    FFmpeg timed out processing {audio_path.name}")
        return False
    except Exception as e:
        print(f"    FFmpeg exception: {e}")
        return False


def scan_recursive(source_dirs):
    """Recursively scan directories for media files, respecting exclusions."""
    routable = []   # (source_path, target_key)
    skipped_ext = 0
    skipped_hidden = 0
    dirs_excluded = 0

    for source_dir in source_dirs:
        source_dir = Path(source_dir).expanduser().resolve()
        if not source_dir.is_dir():
            print(f"  Warning: '{source_dir}' not found, skipping.")
            continue

        for dirpath, dirnames, filenames in os.walk(source_dir):
            current = Path(dirpath)

            # Prune excluded directories in-place (prevents os.walk from descending)
            orig_count = len(dirnames)
            dirnames[:] = [
                d for d in dirnames
                if not should_exclude(current / d) and not d.startswith(".")
            ]
            dirs_excluded += orig_count - len(dirnames)

            for fname in filenames:
                if fname.startswith("."):
                    skipped_hidden += 1
                    continue

                fpath = current / fname
                ext = fpath.suffix.lower()
                target = EXTENSION_MAP.get(ext)

                if target is None:
                    skipped_ext += 1
                else:
                    routable.append((fpath, target))

    return routable, skipped_ext, skipped_hidden, dirs_excluded


def print_plan(routable, skipped_ext, skipped_hidden, dirs_excluded):
    """Print a summary grouped by destination."""
    if not routable:
        print("\n  No media files found.")
        return

    by_target = {}
    total_size = 0
    for src, target in routable:
        by_target.setdefault(target, []).append(src)

    print(f"\n  Media files found: {len(routable)}")
    print(f"  Skipped: {skipped_ext} unrecognized extensions, {skipped_hidden} hidden files")
    print(f"  Excluded directories pruned: {dirs_excluded}")

    # Named destinations first (Immich, Jellyfin), then vault targets
    named_targets = {
        "immich": f"Immich ({IMMICH_CONSUME})",
        "jellyfin": f"Jellyfin Music ({JELLYFIN_MUSIC})",
    }

    for target_key in ["immich", "jellyfin"]:
        if target_key not in by_target:
            continue
        files = by_target[target_key]
        size = sum(f.stat().st_size for f in files) / (1024 * 1024)
        total_size += size
        print(f"\n  → {named_targets[target_key]}  [{len(files)} files, {size:.1f} MB]")
        for f in sorted(files)[:30]:
            print(f"    {f}")
        if len(files) > 30:
            print(f"    ... and {len(files) - 30} more")

    # Vault destinations
    for target in sorted(by_target):
        if target in named_targets:
            continue
        files = by_target[target]
        size = sum(f.stat().st_size for f in files) / (1024 * 1024)
        total_size += size
        dest = MEDIA_BASE / target
        print(f"\n  → {dest}/  [{len(files)} files, {size:.1f} MB]")
        for f in sorted(files)[:30]:
            print(f"    {f}")
        if len(files) > 30:
            print(f"    ... and {len(files) - 30} more")

    print(f"\n  Total: {len(routable)} files, {total_size:.1f} MB")


def execute_migration(routable, mode="move", visualize=False, viz_style=DEFAULT_VIZ_STYLE):
    """Move or copy files to their destinations.
    If visualize=True, audio files get converted to music videos and sent to Immich.
    """
    results = {"moved": 0, "visualized": 0, "errors": []}

    # Ensure destination directories exist
    IMMICH_CONSUME.mkdir(parents=True, exist_ok=True)
    JELLYFIN_MUSIC.mkdir(parents=True, exist_ok=True)
    (MEDIA_BASE / "Attachments").mkdir(parents=True, exist_ok=True)

    for src, target in routable:
        # Audio files: send to Jellyfin, optionally also create visualizer video
        if target == "jellyfin" and visualize:
            # Send original audio to Jellyfin for proper playback
            jf_dest = resolve_conflict(JELLYFIN_MUSIC / src.name)
            try:
                if mode == "copy":
                    shutil.copy2(src, jf_dest)
                else:
                    shutil.copy2(src, jf_dest)  # always copy first, delete later
                results["moved"] += 1
            except Exception as e:
                results["errors"].append((src, str(e)))
                print(f"  ERROR: {src.name} — {e}")
                continue

            # Also generate a visualizer music video for Immich
            video_name = src.stem + ".mp4"
            video_dest = resolve_conflict(IMMICH_CONSUME / video_name)
            print(f"  Visualizing: {src.name} → {video_dest.name}  ({viz_style})")
            if audio_to_visualizer_video(src, video_dest, style=viz_style):
                results["visualized"] += 1
            else:
                results["errors"].append((src, "visualizer conversion failed (audio still sent to Jellyfin)"))

            # Clean up original if moving (not copying)
            if mode != "copy":
                src.unlink()
            continue

        # Normal file routing
        if target == "immich":
            dest_dir = IMMICH_CONSUME
        elif target == "jellyfin":
            dest_dir = JELLYFIN_MUSIC
        else:
            dest_dir = MEDIA_BASE / target

        dest_path = resolve_conflict(dest_dir / src.name)

        try:
            if mode == "copy":
                shutil.copy2(src, dest_path)
            else:
                shutil.move(str(src), str(dest_path))
            results["moved"] += 1
        except Exception as e:
            results["errors"].append((src, str(e)))
            print(f"  ERROR: {src.name} — {e}")

    return results


# ─── CLI ─────────────────────────────────────────────────────────────────────

def print_usage():
    styles = ", ".join(VISUALIZER_STYLES.keys())
    print(f"""
Usage: migrate_media.py [OPTIONS] [source_directories...]

Scans directories recursively for media files and routes them:
  Photos/Videos  →  Immich consume (/media/elryan/The Arxives/immich/consume)
  Audio/Music    →  Jellyfin music (/media/elryan/The Arxives/jellyfin/music)
  PDFs/Docs      →  Vault (4 - Source Material/Attachments/)

If no source directories are given, scans these defaults:
  ~/Desktop  ~/Downloads  ~/Documents  ~/Pictures  ~/Videos  ~/Music  ~/Public

Automatically excludes: game dirs (Steam, Lutris, Heroic, etc.),
  system/cache dirs, node_modules, .git, vault internals, and more.

Options:
  --dry-run            Preview what would happen without moving anything
  --copy               Copy files instead of moving (keeps originals)
  --exclude DIR        Add a directory name to the exclusion list (repeatable)
  --include DIR        Remove a directory name from the exclusion list (repeatable)
  --visualize          Also create visualizer music videos from audio, send to Immich
  --viz-style STYLE    Visualizer style: {styles} (default: {DEFAULT_VIZ_STYLE})
  -y, --yes            Skip confirmation prompt
  -h, --help           Show this help message

Examples:
  ./scripts/migrate_media.py --dry-run
  ./scripts/migrate_media.py --visualize --viz-style spectrum
  ./scripts/migrate_media.py --visualize --keep-originals ~/Music
  ./scripts/migrate_media.py --dry-run --exclude "my project"
  ./scripts/migrate_media.py --copy -y
""")


def main():
    args = sys.argv[1:]

    if "-h" in args or "--help" in args:
        print_usage()
        sys.exit(0)

    dry_run = "--dry-run" in args
    copy_mode = "--copy" in args
    auto_yes = "-y" in args or "--yes" in args
    visualize = "--visualize" in args

    # Parse valued flags
    extra_excludes = []
    extra_includes = []
    viz_style = DEFAULT_VIZ_STYLE
    i = 0
    positional = []
    while i < len(args):
        if args[i] == "--exclude" and i + 1 < len(args):
            extra_excludes.append(args[i + 1].lower())
            i += 2
        elif args[i] == "--include" and i + 1 < len(args):
            extra_includes.append(args[i + 1].lower())
            i += 2
        elif args[i] == "--viz-style" and i + 1 < len(args):
            viz_style = args[i + 1]
            if viz_style not in VISUALIZER_STYLES:
                print(f"Error: Unknown viz style '{viz_style}'. Options: {', '.join(VISUALIZER_STYLES)}")
                sys.exit(1)
            i += 2
        elif args[i].startswith("-"):
            i += 1
        else:
            positional.append(args[i])
            i += 1

    # Update exclusions
    for exc in extra_excludes:
        EXCLUDE_DIRS.add(exc)
    for inc in extra_includes:
        EXCLUDE_DIRS.discard(inc)

    # Determine source directories
    source_dirs = positional if positional else DEFAULT_SCAN_DIRS

    # Check ffmpeg availability if visualizing
    if visualize and not check_ffmpeg():
        print("Error: --visualize requires ffmpeg. Install it: sudo apt install ffmpeg")
        sys.exit(1)

    print(f"Media Migration — {datetime.now().strftime('%Y-%m-%d %H:%M')}")
    print(f"Scanning: {', '.join(str(s) for s in source_dirs)}")
    print(f"Routing:")
    print(f"  Photos/Videos → {IMMICH_CONSUME}")
    print(f"  Audio/Music   → {JELLYFIN_MUSIC}")
    if visualize:
        print(f"    + visualized .mp4 → {IMMICH_CONSUME}  (style: {viz_style})")
    print(f"  PDFs/Docs     → {MEDIA_BASE / 'Attachments'}")
    mode_label = "copy" if copy_mode else "move"
    print(f"Mode: {mode_label}{'  (dry run)' if dry_run else ''}")

    # Scan
    routable, skipped_ext, skipped_hidden, dirs_excluded = scan_recursive(source_dirs)

    print_plan(routable, skipped_ext, skipped_hidden, dirs_excluded)

    if not routable:
        print("\nNothing to migrate.")
        sys.exit(0)

    if dry_run:
        print("\n  Dry run complete. No files were moved.")
        sys.exit(0)

    # Confirm
    if not auto_yes:
        print()
        answer = input(f"  Proceed to {mode_label} {len(routable)} file(s)? [y/N] ").strip().lower()
        if answer not in ("y", "yes"):
            print("  Aborted.")
            sys.exit(0)

    print()
    results = execute_migration(
        routable,
        mode="copy" if copy_mode else "move",
        visualize=visualize,
        viz_style=viz_style,
    )

    print(f"\nDone. {results['moved']} file(s) migrated.")
    if results.get("visualized"):
        print(f"  {results['visualized']} audio file(s) converted to music videos.")
    if results["errors"]:
        print(f"{len(results['errors'])} error(s) occurred.")
        sys.exit(1)


if __name__ == "__main__":
    main()
