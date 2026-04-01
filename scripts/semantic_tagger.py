#!/usr/bin/env python3
"""
Semantic Note Tagger for Obsidian Zettelkasten
Tags orphaned notes with [[theme]] links and generates index files.
"""

import os
import re
import json
import sys
from pathlib import Path
from collections import defaultdict
from datetime import datetime

VAULT_ROOT = Path(__file__).parent.parent

# ─── Theme Taxonomy ──────────────────────────────────────────────────────────
# Each theme has primary (strong signal, 3pts) and secondary (weak signal, 1pt) keywords.
# Themes map to existing or new Path/Index files.

THEME_MAP = {
    "Biomedical Engineering": {
        "primary": [
            "biomedical", "fetal", "chorioanchor", "aneurysm", "aaa", "stent",
            "catheter", "surgery", "tissue engineering", "implant", "scaffold",
            "hydrogel", "cartilage", "artery", "vascular", "endovascular",
            "aortic", "platelet", "adhesion protein", "biomaterial",
            "biocompatible", "hemocompatib", "fetal heart", "chorioamniotic",
            "endograft", "graft", "thrombosis", "hemostasis", "fibrinogen",
            "albumin", "vroman", "apolipoprotein", "lipoprotein",
            "urease", "mineralization", "nanorod", "clay particle",
            "anti-biofilm", "biofilm", "antimicrobial", "hemolysis",
            "cytotoxicity", "cell viability", "cell adhesion", "fibronectin",
            "collagen", "shape memory", "electrospinning", "electrospun",
            "polyurethane", "poly(lactic", "polycaprolactone", "biopolymer",
            "hlhs", "hypoplastic", "atrial septum",
            "atherosclerosis", "myoblast", "osteoblast", "chondrocyte",
            "endothelial", "fibroblast", "mesenchymal", "stem cell",
            "bioreactor", "bioink", "3d print", "prosthetic",
            "medical imaging", "ecg", "ekg", "ultrasound",
            "blood pressure", "hemodynamic", "perfusion",
            "suture", "wound", "surgical", "clinical trial",
        ],
        "secondary": [
            "medical device", "in vivo", "in vitro", "bioassay",
            "degradation", "swelling ratio", "crosslink", "polymer blend",
            "drug delivery", "wound healing", "adsorption",
        ],
        "path": "Biomedical Engineering",
        "index": "Biomedical Engineering Index",
    },
    "Machine Learning": {
        "primary": [
            "machine learning", "deep learning", "neural network", "cnn",
            "autoencoder", "classifier", "anomaly detection",
            "transformer model", "bert model", "word embedding", "gan",
            "lstm", "rnn", "backpropagation", "loss function",
            "gradient descent", "convolutional", "recurrent neural",
            "attention mechanism", "tokeniz", "fine-tun", "pre-train",
            "word2vec", "tf-idf", "softmax", "relu", "dropout",
            "batch normalization", "feature extraction", "transfer learning",
            "reinforcement learning", "q-learning", "random forest",
            "isolation forest", "hyperopt", "xgboost",
        ],
        "secondary": [
            "overfitting", "underfitting", "hyperparameter", "learning rate",
            "adam optimizer", "confusion matrix", "f1 score", "auc", "roc",
            "training epoch", "model accuracy",
        ],
        "path": "Machine Learning",
        "index": "Machine Learning Index",
    },
    "Signal Processing": {
        "primary": [
            "fft", "fourier transform", "filter design", "bandpass",
            "lowpass", "highpass", "amplifier", "op-amp", "impedance",
            "frequency response", "signal processing", "spectral",
            "nyquist", "sampling rate", "aliasing", "modulation",
            "demodulation", "snr", "signal-to-noise", "adc", "dac",
            "oscilloscope", "waveform", "harmonic", "resonance frequency",
            "transfer function", "bode plot", "laplace",
            "signal decomposition", "signal power", "noise floor",
            "resistor", "capacitor", "inductor", "circuit",
            "voltage divider", "current source", "amplifier gain",
        ],
        "secondary": [
            "circuit design", "resistor network", "capacitor bank",
            "power supply design", "signal gain", "decibel",
            "accelerometer sensor", "transducer", "piezoelectric",
        ],
        "path": "Signal Processing",
        "index": "Signal Processing Index",
    },
    "Mechanical Engineering": {
        "primary": [
            "stress analysis", "strain", "bending moment", "shear force",
            "tensile", "compressive", "elastic modulus", "young's modulus",
            "poisson", "yield strength", "ultimate strength", "fatigue",
            "fracture mechanics", "crack propagation", "fea", "finite element",
            "beam theory", "euler-bernoulli", "timoshenko", "mohr's circle",
            "von mises", "hoop stress", "principal stress", "deformation",
            "buckling", "torsion", "moment of inertia", "cross section",
            "3-point bending", "3pb", "triaxiality",
            "bending stiffness", "fracture propagation", "pre-stretching",
            "unidirectional alignment", "tensile strength",
            "laser cutting", "injection molding", "resistive heating",
            "ncs calculation", "beam section",
        ],
        "secondary": [
            "material properties", "hardness", "ductility", "brittleness",
            "creep", "thermal expansion", "anisotropic", "isotropic",
            "composite", "laminate", "displacement", "stiffness",
        ],
        "path": "Mechanical Engineering",
        "index": "Mechanical Engineering Index",
    },
    "Statistics": {
        "primary": [
            "anova", "regression", "hypothesis test", "p-value",
            "confidence interval", "chi-squared", "t-test", "z-test",
            "normal distribution", "binomial", "poisson distribution",
            "standard deviation", "variance", "correlation", "covariance",
            "statistical significance", "null hypothesis", "alternative hypothesis",
            "degrees of freedom", "post-hoc", "bonferroni", "tukey",
            "mann-whitney", "wilcoxon", "kruskal-wallis", "fisher's exact",
        ],
        "secondary": [
            "sample size", "population", "mean", "median", "mode",
            "quartile", "percentile", "outlier", "skewness", "kurtosis",
            "bayesian", "frequentist", "likelihood", "prior",
        ],
        "path": "Statistics",
        "index": "Statistics Index",
    },
    "Research Methods": {
        "primary": [
            "bibliometric", "text mining", "web scraping", "pubmed",
            "keyword extraction", "literature review", "systematic review",
            "meta-analysis", "citation analysis", "research direction",
            "academic paper", "abstract extraction", "article scraping",
            "scopus", "web of science", "doi", "research methodology",
            "qualitative research", "quantitative research",
            "document categorization", "keyword sourcing", "keyword reduction",
            "citespace", "data analysis pipeline", "document range",
            "research expansion", "article metadata",
        ],
        "secondary": [
            "search strategy", "inclusion criteria", "exclusion criteria",
            "data collection", "research question", "methodology",
            "peer review", "impact factor", "h-index",
        ],
        "path": "Research Methods",
        "index": "Research Methods Index",
    },
    "Programming": {
        "primary": [
            "django", "flask", "rest api", "graphql",
            "javascript", "typescript", "react framework", "vue.js", "angular",
            "postgresql", "docker", "kubernetes", "ci/cd",
            "version control", "backend development", "frontend development",
            "jwt", "oauth", "endpoint", "middleware", "orm", "migration",
            "software development", "web development", "code refactor",
            "api call", "api key", "api client", "api rate",
            "async handling", "error handling", "file operations",
            "multiprocessing", "concurrency", "threading",
            "json parsing", "xml parsing", "csv processing",
            "assistant creation", "openai", "chatgpt api",
            "scraping script", "web scraper", "selenium",
            "bluetooth", "mqtt", "socket programming",
        ],
        "secondary": [
            "debug", "unit test", "integration test",
            "code review", "devops", "microservice", "webhook", "websocket",
            "caching", "redis", "celery",
        ],
        "path": "Programming",
        "index": "Tech Bro In the Making",
    },
    "Philosophy": {
        "primary": [
            "philosophy", "epistemolog", "metaphysic", "ontolog",
            "consciousness", "free will", "determinism", "existential",
            "phenomenolog", "dualism", "idealism",
            "nihilism", "absurdism", "stoicism", "utilitarianism",
            "deontolog", "virtue ethics", "teleolog",
            "euthanasia", "meaning of life",
            "philosophical", "moral philosophy", "ethics of",
        ],
        "secondary": [
            "plato", "aristotle", "kant", "nietzsche", "descartes",
            "heidegger", "sartre", "camus", "wittgenstein", "hume",
            "socrates", "spinoza",
        ],
        "path": "Philosophy",
        "index": "Concepts",
    },
    "Computational Neuroscience": {
        "primary": [
            "computational neuroscience", "neural coding", "brain model",
            "spiking neural", "hodgkin-huxley", "integrate-and-fire",
            "synaptic", "neurotransmit", "cortical", "hippocampal",
            "eeg", "fmri", "brain-computer interface", "bci",
            "neuromorphic", "connectome", "neural oscillation",
            "brain wave", "cognitive model",
        ],
        "secondary": [
            "neuron", "dendrite", "axon", "synapse", "plasticity",
            "long-term potentiation", "brain", "cortex", "cerebellum",
            "amygdala", "prefrontal",
        ],
        "path": "Computational Neuroscience",
        "index": "Concepts",
    },
    "Biomimetics": {
        "primary": [
            "biomimetic", "bio-inspired", "biomimic", "nature-inspired",
            "biomechanics", "biological system", "gecko adhesion",
            "lotus effect", "swarm intelligence",
        ],
        "secondary": [
            "evolution", "adaptation", "natural selection", "organism",
            "biological", "ecosystem",
        ],
        "path": "Biomimetics",
        "index": "Concepts",
    },
    "Money": {
        "primary": [
            "business model", "startup", "revenue", "profit", "investment",
            "venture capital", "saas", "monetiz", "pricing strategy",
            "financial planning", "runway", "bootstrap", "fundrais",
            "market analysis", "competitive advantage",
        ],
        "secondary": [
            "budget", "expense", "income", "savings", "portfolio",
            "stock", "crypto", "real estate", "passive income",
            "side hustle", "consulting",
        ],
        "path": "Money",
        "index": "Business Advice",
    },
    "Self Preservation": {
        "primary": [
            "fitness routine", "exercise program", "nutrition plan", "diet plan",
            "mental health", "wellness practice", "meditation practice",
            "mindfulness exercise", "therapy session", "self-care routine",
            "physical health", "workout", "progressive overload",
            "blood pressure", "heart rate monitor",
        ],
        "secondary": [
            "habit tracking", "daily routine", "resilience", "recovery plan",
            "stress management", "burnout prevention", "work-life balance",
        ],
        "path": "Self Preservation",
        "index": "Practices",
    },
    "Workflow & Tooling": {
        "primary": [
            "linux setup", "ubuntu setup", "debian setup", "arch linux",
            "vscode extension", "neovim config", "vim config",
            "cron job", "systemd service",
            "cybersecurity", "vpn setup", "firewall config",
            "os setup", "dual boot", "disk partition",
            "dotfiles", "shell config", "terminal emulator",
            "nordvpn", "appimage", "desktop setup",
        ],
        "secondary": [
            "workflow optimization", "keyboard layout",
            "package manager", "flatpak", "snap package",
        ],
        "path": "Workflow & Tooling",
        "index": "Workflow & Tooling Index",
    },
    "Architecture": {
        "primary": [
            "architecture", "building design", "urban planning",
            "structural design", "floor plan", "blueprint",
            "construction", "zoning", "facade", "interior design",
        ],
        "secondary": [
            "sustainable", "green building", "leed", "renovation",
            "restoration", "heritage",
        ],
        "path": "Architecture",
        "index": "Concepts",
    },
    "The Senses": {
        "primary": [
            "sensory perception", "visual perception", "auditory perception",
            "synesthesia", "proprioception", "olfactory", "gustatory",
            "sensory processing", "light and sight", "tactile perception",
        ],
        "secondary": [
            "retina", "optic nerve", "cochlea", "vestibular system",
        ],
        "path": "The Senses",
        "index": "Concepts",
    },
    "Connection": {
        "primary": [
            "human connection", "empathy", "social bond",
            "community building", "mentorship", "vulnerability",
            "interpersonal", "emotional bond", "deep conversation",
        ],
        "secondary": [
            "conflict resolution", "emotional intelligence",
            "active listening", "personal boundaries",
        ],
        "path": "Connection",
        "index": "Concepts",
    },
    "Death": {
        "primary": [
            "death", "mortality", "dying", "grief", "bereavement",
            "afterlife", "near-death", "end of life", "euthanasia",
            "hospice", "funeral",
        ],
        "secondary": [
            "legacy", "memento mori", "impermanence", "loss",
        ],
        "path": "Death",
        "index": "Concepts",
    },
    "Introspection": {
        "primary": [
            "self-reflection", "introspection", "self-awareness",
            "personal growth", "life review", "belief system", "worldview",
            "inner dialogue", "self-discovery", "guided journal",
        ],
        "secondary": [
            "authenticity", "self-examination",
        ],
        "path": "Introspection",
        "index": "Journal",
    },
    "Lucid Dream": {
        "primary": [
            "lucid dream", "dream journal", "dream recall",
            "reality check", "oneironautics", "sleep paralysis",
            "astral projection", "out-of-body experience",
            "had a dream", "inception", "dream state",
        ],
        "secondary": [
            "hypnagogic", "rem sleep", "sleep cycle",
        ],
        "path": "Lucid Dream",
        "index": "Journal",
    },
    "Change": {
        "primary": [
            "transformation", "paradigm shift",
            "personal transformation", "life transition", "reinvention",
            "evolution of thought", "radical change",
        ],
        "secondary": [
            "pivotal moment", "turning point",
        ],
        "path": "Change",
        "index": "Concepts",
    },
}

# ─── Helpers ─────────────────────────────────────────────────────────────────

def parse_frontmatter(content):
    """Parse YAML frontmatter from markdown content. Returns (frontmatter_str, body_str, frontmatter_dict)."""
    if not content.startswith("---"):
        return "", content, {}

    # Find closing ---
    lines = content.split("\n")
    end_idx = None
    for i in range(1, len(lines)):
        if lines[i].strip() == "---":
            end_idx = i
            break

    if end_idx is None:
        return "", content, {}

    fm_lines = lines[1:end_idx]
    body = "\n".join(lines[end_idx + 1:])
    fm_str = "\n".join(lines[:end_idx + 1])

    # Simple YAML parsing for our needs
    fm_dict = {}
    current_key = None
    current_list = None
    for line in fm_lines:
        # Key: value
        kv_match = re.match(r'^(\w[\w\s]*?):\s*(.*)', line)
        if kv_match and not line.startswith("  ") and not line.startswith("\t"):
            if current_key and current_list is not None:
                fm_dict[current_key] = current_list
            current_key = kv_match.group(1).strip()
            val = kv_match.group(2).strip()
            if val:
                fm_dict[current_key] = val
                current_list = None
            else:
                current_list = []
        elif line.strip().startswith("- ") and current_key:
            if current_list is None:
                current_list = []
            current_list.append(line.strip()[2:].strip().strip('"').strip("'"))

    if current_key and current_list is not None:
        fm_dict[current_key] = current_list

    return fm_str, body, fm_dict


def classify_note(filename, content):
    """Classify a note into themes based on filename and content."""
    # Normalize text for matching
    filename_text = filename.replace("_", " ").replace("-", " ").replace(".md", "").lower()
    content_lower = content.lower()
    search_text = filename_text + " " + content_lower

    scores = {}
    for theme_name, theme_data in THEME_MAP.items():
        score = 0
        for kw in theme_data["primary"]:
            if kw.lower() in search_text:
                score += 3
        for kw in theme_data["secondary"]:
            if kw.lower() in search_text:
                score += 1
        if score > 0:
            scores[theme_name] = score

    if not scores:
        return []

    # Sort by score, take top themes above threshold
    sorted_themes = sorted(scores.items(), key=lambda x: -x[1])
    max_score = sorted_themes[0][1]

    # Require at least 6 points (two primary keyword hits) to be classified
    # For concept stubs with short content, lower to 3 (one primary hit)
    is_short = len(content) < 500
    min_threshold = 3 if is_short else 6

    result = []
    for theme, score in sorted_themes:
        if score >= min_threshold and len(result) < 3:
            result.append(theme)
        elif score >= max_score * 0.6 and len(result) < 3 and score >= min_threshold:
            result.append(theme)

    return result


def get_existing_topics(fm_dict):
    """Extract existing Topic values from frontmatter."""
    topics = fm_dict.get("Topic", [])
    if isinstance(topics, str):
        if topics.strip():
            topics = [topics]
        else:
            topics = []
    # Extract note names from [[...]] syntax
    existing = set()
    for t in topics:
        match = re.search(r'\[\[([^\]|]+)', t)
        if match:
            existing.add(match.group(1))
    return existing


def add_topics_to_frontmatter(content, new_themes):
    """Add [[theme]] links to the Topic field in frontmatter. Preserves existing content."""
    if not new_themes:
        return content

    lines = content.split("\n")

    # Find frontmatter boundaries
    if not lines[0].strip() == "---":
        return content

    end_idx = None
    for i in range(1, len(lines)):
        if lines[i].strip() == "---":
            end_idx = i
            break

    if end_idx is None:
        return content

    # Find Topic field
    topic_idx = None
    topic_end_idx = None
    for i in range(1, end_idx):
        if re.match(r'^Topic:', lines[i]):
            topic_idx = i
            # Find where Topic entries end
            topic_end_idx = i + 1
            while topic_end_idx < end_idx and lines[topic_end_idx].strip().startswith("- "):
                topic_end_idx += 1
            break

    if topic_idx is None:
        # No Topic field, insert one before Status
        status_idx = None
        for i in range(1, end_idx):
            if re.match(r'^Status:', lines[i]):
                status_idx = i
                break
        if status_idx is None:
            status_idx = end_idx

        topic_lines = ["Topic:"]
        for theme in new_themes:
            topic_lines.append(f'  - "[[{theme}]]"')
        lines = lines[:status_idx] + topic_lines + lines[status_idx:]
        return "\n".join(lines)

    # Collect existing topic entries
    existing_topics = set()
    existing_entries = []
    for i in range(topic_idx + 1, topic_end_idx):
        entry = lines[i].strip()
        existing_entries.append(lines[i])
        match = re.search(r'\[\[([^\]|]+)', entry)
        if match:
            existing_topics.add(match.group(1))

    # Add new themes that don't already exist
    new_entries = []
    for theme in new_themes:
        if theme not in existing_topics:
            new_entries.append(f'  - "[[{theme}]]"')

    if not new_entries:
        return content

    # Check if Topic line has inline value
    topic_line = lines[topic_idx]
    topic_match = re.match(r'^Topic:\s*$', topic_line)
    if topic_match or not existing_entries:
        # Empty Topic: field, or Topic: with no list items
        # Ensure Topic: line is clean
        lines[topic_idx] = "Topic:"
        insert_point = topic_idx + 1
        # Insert existing entries (if any non-list inline value)
        inline_val = re.match(r'^Topic:\s+(.+)', lines[topic_idx] if not topic_match else "")
        new_lines = lines[:insert_point] + existing_entries + new_entries + lines[topic_end_idx:]
    else:
        # Already has list entries, append after them
        new_lines = lines[:topic_end_idx] + new_entries + lines[topic_end_idx:]

    return "\n".join(new_lines)


def add_themes_line_to_body(content, themes):
    """Add a Themes: line after the frontmatter closing ---."""
    if not themes:
        return content

    lines = content.split("\n")

    # Find second --- (end of frontmatter)
    if not lines[0].strip() == "---":
        return content

    end_idx = None
    for i in range(1, len(lines)):
        if lines[i].strip() == "---":
            end_idx = i
            break

    if end_idx is None:
        return content

    # Check if there's already a Themes: line shortly after frontmatter
    check_range = min(end_idx + 5, len(lines))
    for i in range(end_idx + 1, check_range):
        if lines[i].strip().startswith("Themes:"):
            # Already has themes line, update it
            theme_links = ", ".join(f"[[{t}]]" for t in themes)
            # Merge with existing
            existing_match = re.findall(r'\[\[([^\]|]+)', lines[i])
            all_themes = list(dict.fromkeys(existing_match + list(themes)))
            theme_links = ", ".join(f"[[{t}]]" for t in all_themes)
            lines[i] = f"Themes: {theme_links}"
            return "\n".join(lines)

    # Insert Themes line after frontmatter
    theme_links = ", ".join(f"[[{t}]]" for t in themes)
    themes_line = f"\nThemes: {theme_links}"

    # Find a good insertion point - after the --- and any blank lines
    insert_idx = end_idx + 1

    # If next line is also --- (double separator pattern), skip it
    if insert_idx < len(lines) and lines[insert_idx].strip() == "---":
        insert_idx += 1

    # Insert after blank line if present, or add one
    if insert_idx < len(lines) and lines[insert_idx].strip() == "":
        lines.insert(insert_idx + 1, f"Themes: {theme_links}")
        lines.insert(insert_idx + 2, "")
    else:
        lines.insert(insert_idx, "")
        lines.insert(insert_idx + 1, f"Themes: {theme_links}")
        lines.insert(insert_idx + 2, "")

    return "\n".join(lines)


# ─── Epistemic Status ────────────────────────────────────────────────────────
# Applied to AI-sourced notes to track verification state.
# AI-Unverified  → raw from export, stance empty, not cross-checked
# Resonant       → you remember this being true; stance section populated
# Partially-Verified → has at least one Evidence wikilink
# Verified       → explicitly set by vault owner
# Refuted        → identified as hallucination

AI_SOURCE_MARKERS = {"chatgpt", "claude", "ai conversation", "llm export"}

HALLUCINATION_RED_FLAGS = [
    (r'\b\d+\s*%', "specific percentage"),
    (r'\b(studies show|research shows|research indicates|studies indicate)\b', "anonymous authority"),
    (r'\b(always|never|the only way|impossible to|guaranteed to)\b', "absolute claim"),
    (r'\b(experts agree|scientists believe|researchers found|it is known that)\b', "anonymous authority"),
    (r'\baccording to\b', "cited claim — verify source"),
    (r'\bin (19|20)\d{2},\s+\w[\w\s]{1,30}(found|showed|discovered|proved|demonstrated)\b', "specific citation"),
]


def is_ai_sourced(fm_dict):
    """Return True if the note's Index or Topic contains an AI source marker."""
    index_vals = fm_dict.get("Index", [])
    if isinstance(index_vals, str):
        index_vals = [index_vals]
    for v in index_vals:
        if any(m in v.lower() for m in AI_SOURCE_MARKERS):
            return True
    return False


def detect_red_flags(body):
    """Return list of (pattern_label, matched_text) found in body."""
    import re as _re
    flags = []
    for pattern, label in HALLUCINATION_RED_FLAGS:
        matches = _re.findall(pattern, body, _re.IGNORECASE)
        if matches:
            flags.append((label, matches[0] if isinstance(matches[0], str) else matches[0][0]))
    return flags


def determine_epistemic_status(fm_dict, body):
    """Determine appropriate Epistemic_Status for an AI-sourced note."""
    # Already has a manually set status other than AI-Unverified → leave it
    current = fm_dict.get("Epistemic_Status", "").strip()
    if current in ("Verified", "Refuted", "Resonant", "Partially-Verified"):
        return current

    # Check for Evidence links
    evidence_section = ""
    in_evidence = False
    for line in body.split("\n"):
        if "evidence" in line.lower() and line.strip().startswith("-"):
            in_evidence = True
        if in_evidence:
            evidence_section += line
            if line.strip() == "" or (line.strip().startswith("-") and "evidence" not in line.lower()):
                break
    has_evidence = "[[" in evidence_section and "Evidence:" not in evidence_section.replace("Evidence:", "")

    # Check for populated stance
    stance_content = ""
    in_stance = False
    for line in body.split("\n"):
        if re.match(r'^#+\s*my current stance', line, re.IGNORECASE):
            in_stance = True
            continue
        if in_stance:
            if re.match(r'^#+\s', line):
                break
            stance_content += line.strip()
    has_stance = bool(stance_content.strip()) and stance_content.strip() != "-"

    # Check Evidence section for actual wikilinks
    evidence_match = re.search(r'- Evidence:\s*(.*)', body)
    has_evidence_link = bool(evidence_match and "[[" in evidence_match.group(1))

    if has_evidence_link:
        return "Partially-Verified"
    if has_stance:
        return "Resonant"
    return "AI-Unverified"


def add_epistemic_status_to_frontmatter(content, status):
    """Insert or update Epistemic_Status field in frontmatter, after Status field."""
    lines = content.split("\n")
    if not lines or lines[0].strip() != "---":
        return content

    end_idx = None
    for i in range(1, len(lines)):
        if lines[i].strip() == "---":
            end_idx = i
            break
    if end_idx is None:
        return content

    # Check if field already exists
    for i in range(1, end_idx):
        if re.match(r'^Epistemic_Status:', lines[i]):
            current_val = lines[i].split(":", 1)[1].strip()
            # Don't downgrade manually set statuses
            if current_val in ("Verified", "Refuted") and status not in ("Verified", "Refuted"):
                return content
            lines[i] = f"Epistemic_Status: {status}"
            return "\n".join(lines)

    # Insert after Status: field
    status_idx = None
    for i in range(1, end_idx):
        if re.match(r'^Status:', lines[i]):
            status_idx = i
            break

    insert_after = status_idx if status_idx is not None else end_idx - 1
    lines.insert(insert_after + 1, f"Epistemic_Status: {status}")
    return "\n".join(lines)


def add_red_flag_warning(content, flags):
    """Append a red-flag warning block after the frontmatter if flags exist."""
    if not flags:
        return content

    lines = content.split("\n")
    end_idx = None
    for i in range(1, len(lines)):
        if lines[i].strip() == "---":
            end_idx = i
            break
    if end_idx is None:
        return content

    # Don't add if warning already exists
    body = "\n".join(lines[end_idx:])
    if ">[!warning] Hallucination Flags" in body:
        return content

    warning_lines = [
        "",
        ">[!warning] Hallucination Flags",
        ">Automated scan detected potentially unreliable patterns — verify before trusting:",
    ]
    for label, sample in flags[:5]:
        warning_lines.append(f">- **{label}**: `{sample}`")

    # Insert right after frontmatter closing ---
    insert_idx = end_idx + 1
    # Skip double --- separator if present
    if insert_idx < len(lines) and lines[insert_idx].strip() == "---":
        insert_idx += 1

    lines = lines[:insert_idx] + warning_lines + lines[insert_idx:]
    return "\n".join(lines)


def scan_vault_notes():
    """Scan the vault for all markdown files and their metadata."""
    notes = []
    skip_dirs = {".obsidian", ".git", "scripts", ".trash", "1 - Templates"}

    for root, dirs, files in os.walk(VAULT_ROOT):
        # Skip hidden/system dirs
        dirs[:] = [d for d in dirs if d not in skip_dirs and not d.startswith(".")]

        rel_root = os.path.relpath(root, VAULT_ROOT)
        for f in files:
            if not f.endswith(".md"):
                continue

            filepath = os.path.join(root, f)
            rel_path = os.path.relpath(filepath, VAULT_ROOT)

            try:
                with open(filepath, "r", encoding="utf-8", errors="replace") as fh:
                    content = fh.read()
            except Exception:
                continue

            fm_str, body, fm_dict = parse_frontmatter(content)
            existing_topics = get_existing_topics(fm_dict)

            notes.append({
                "filepath": filepath,
                "rel_path": rel_path,
                "filename": f,
                "content": content,
                "body": body,
                "fm_dict": fm_dict,
                "existing_topics": existing_topics,
                "section": rel_root.split(os.sep)[0] if os.sep in rel_root else rel_root,
            })

    return notes


def generate_report(notes, classifications):
    """Generate a dry-run report."""
    theme_counts = defaultdict(int)
    unclassified = []
    multi_theme = []

    for note, themes in zip(notes, classifications):
        if not themes:
            unclassified.append(note["rel_path"])
        else:
            for t in themes:
                theme_counts[t] += 1
            if len(themes) > 1:
                multi_theme.append((note["rel_path"], themes))

    print("\n" + "=" * 70)
    print("SEMANTIC TAGGING DRY-RUN REPORT")
    print("=" * 70)

    print(f"\nTotal notes scanned: {len(notes)}")
    print(f"Notes classified: {len(notes) - len(unclassified)}")
    print(f"Notes unclassified: {len(unclassified)}")
    print(f"Notes with multiple themes (interoperability): {len(multi_theme)}")

    print("\n--- Theme Distribution ---")
    for theme, count in sorted(theme_counts.items(), key=lambda x: -x[1]):
        print(f"  {theme}: {count} notes")

    print(f"\n--- Multi-Theme Notes (first 20) ---")
    for path, themes in multi_theme[:20]:
        print(f"  {path}: {', '.join(themes)}")

    print(f"\n--- Unclassified Notes (first 30) ---")
    for path in unclassified[:30]:
        print(f"  {path}")

    # Epistemic status report for AI-sourced notes
    ep_counts = defaultdict(int)
    flagged_notes = []
    for note in notes:
        if is_ai_sourced(note["fm_dict"]):
            _, body, fm = parse_frontmatter(note["content"])
            ep_status = fm.get("Epistemic_Status", determine_epistemic_status(fm, body))
            ep_counts[ep_status] += 1
            flags = detect_red_flags(body)
            if flags:
                flagged_notes.append((note["rel_path"], flags))

    if ep_counts:
        print(f"\n--- Epistemic Status (AI-sourced notes) ---")
        for status, count in sorted(ep_counts.items(), key=lambda x: -x[1]):
            print(f"  {status}: {count}")
        print(f"  Red-flag patterns detected in: {len(flagged_notes)} notes")
        for path, flags in flagged_notes[:10]:
            labels = ", ".join(f[0] for f in flags)
            print(f"    {path}: {labels}")

    return theme_counts, unclassified, multi_theme


def apply_tags(notes, classifications, dry_run=False):
    """Apply semantic tags to notes."""
    modified_count = 0
    theme_note_map = defaultdict(list)  # theme -> list of note names

    for note, themes in zip(notes, classifications):
        if not themes:
            continue

        # Skip Path/Index files themselves (they're the targets, not sources)
        if note["rel_path"].startswith("2 - Paths/") or note["rel_path"].startswith("3 - Indexes/"):
            # But still record them in theme map
            continue

        # Skip templates and housekeeping
        if note["rel_path"].startswith("1 - Templates/") or note["rel_path"].startswith("0 - Housekeeping/"):
            continue

        # Filter out themes already in existing topics
        new_themes = [t for t in themes if t not in note["existing_topics"]]

        if not new_themes and not themes:
            continue

        # Record in theme map for index generation (use all themes, not just new)
        note_name = note["filename"].replace(".md", "").replace("_", " ")
        for t in themes:
            theme_note_map[t].append({
                "name": note_name,
                "filename": note["filename"],
                "rel_path": note["rel_path"],
            })

        if not new_themes:
            continue

        if dry_run:
            modified_count += 1
            continue

        content = note["content"]

        # 1. Add to frontmatter Topic field
        content = add_topics_to_frontmatter(content, new_themes)

        # 2. Add Themes line to body
        content = add_themes_line_to_body(content, themes)  # Use all themes for body line

        # 3. Epistemic status for AI-sourced notes
        if is_ai_sourced(note["fm_dict"]):
            _, body, fm = parse_frontmatter(content)
            ep_status = determine_epistemic_status(fm, body)
            content = add_epistemic_status_to_frontmatter(content, ep_status)
            flags = detect_red_flags(body)
            if flags:
                content = add_red_flag_warning(content, flags)

        # Write back
        try:
            with open(note["filepath"], "w", encoding="utf-8") as fh:
                fh.write(content)
            modified_count += 1
        except Exception as e:
            print(f"  ERROR writing {note['rel_path']}: {e}")

    return modified_count, theme_note_map


def populate_path_file(path_file, theme_name, theme_notes, related_paths):
    """Populate an existing or new Path file with linked notes."""
    filepath = VAULT_ROOT / "2 - Paths" / f"{path_file}.md"

    if filepath.exists():
        with open(filepath, "r", encoding="utf-8") as f:
            content = f.read()

        # Find the end of frontmatter
        lines = content.split("\n")
        end_idx = None
        if lines[0].strip() == "---":
            for i in range(1, len(lines)):
                if lines[i].strip() == "---":
                    end_idx = i
                    break

        if end_idx is None:
            return

        # Check for double --- separator
        fm_end = end_idx + 1
        if fm_end < len(lines) and lines[fm_end].strip() == "---":
            fm_end += 1

        # Preserve frontmatter, replace body
        fm_content = "\n".join(lines[:fm_end])
    else:
        # Create new path file
        now = datetime.now().strftime("%Y-%m-%d %H:%M")
        fm_content = f"""---
Date Created: "{now}"
Last Updated: "{now}"
tags:
  - Path
Topic:
Status: Unweathered
Published: false
---
---"""

    # Group notes by sub-section
    concept_notes = [n for n in theme_notes if "Concepts" in n["rel_path"]]
    source_notes = [n for n in theme_notes if "Source Material" in n["rel_path"] and "Concepts" not in n["rel_path"]]
    journal_notes = [n for n in theme_notes if "Journal" in n["rel_path"]]
    persona_notes = [n for n in theme_notes if "Elryan" in n["rel_path"]]
    other_notes = [n for n in theme_notes if n not in concept_notes + source_notes + journal_notes + persona_notes]

    body_parts = [f"\n\n## {theme_name}\n"]

    if other_notes:
        body_parts.append("\n### Notes")
        for n in sorted(other_notes, key=lambda x: x["name"])[:50]:
            body_parts.append(f"- [[{n['name']}]]")

    if concept_notes:
        body_parts.append(f"\n### Concepts ({len(concept_notes)} notes)")
        # Show first 80, then summarize
        for n in sorted(concept_notes, key=lambda x: x["name"])[:80]:
            body_parts.append(f"- [[{n['filename'].replace('.md', '')}|{n['name']}]]")
        if len(concept_notes) > 80:
            body_parts.append(f"- *...and {len(concept_notes) - 80} more concepts*")

    if source_notes:
        body_parts.append("\n### Source Material")
        for n in sorted(source_notes, key=lambda x: x["name"])[:30]:
            body_parts.append(f"- [[{n['name']}]]")

    if journal_notes:
        body_parts.append("\n### Journal Entries")
        for n in sorted(journal_notes, key=lambda x: x["name"])[:20]:
            body_parts.append(f"- [[{n['name']}]]")

    if persona_notes:
        body_parts.append("\n### Persona Notes")
        for n in sorted(persona_notes, key=lambda x: x["name"])[:20]:
            body_parts.append(f"- [[{n['name']}]]")

    if related_paths:
        body_parts.append("\n### Related Paths")
        for rp in related_paths:
            body_parts.append(f"- [[{rp}]]")

    full_content = fm_content + "\n".join(body_parts) + "\n"

    with open(filepath, "w", encoding="utf-8") as f:
        f.write(full_content)


def create_index_file(index_name, theme_name, theme_notes, related_indexes):
    """Create or update an index file."""
    filepath = VAULT_ROOT / "3 - Indexes" / f"{index_name}.md"

    now = datetime.now().strftime("%Y-%m-%d %H:%M")

    if filepath.exists():
        with open(filepath, "r", encoding="utf-8") as f:
            content = f.read()

        lines = content.split("\n")
        end_idx = None
        if lines[0].strip() == "---":
            for i in range(1, len(lines)):
                if lines[i].strip() == "---":
                    end_idx = i
                    break

        if end_idx is None:
            return

        fm_end = end_idx + 1
        if fm_end < len(lines) and lines[fm_end].strip() == "---":
            fm_end += 1

        # Get existing body content (non-empty lines after frontmatter)
        existing_body = "\n".join(lines[fm_end:]).strip()
        fm_content = "\n".join(lines[:fm_end])

        # If existing body has substantial content, preserve it and append
        if len(existing_body) > 20 and "[[" in existing_body:
            # Already populated, skip
            return
    else:
        fm_content = f"""---
Date Created: "{now}"
Last Updated: "{now}"
tags:
  - Index
Topic:
  - "[[{theme_name}]]"
Status: Unweathered
Published: false
---
---"""

    # Group by type
    concept_notes = [n for n in theme_notes if "Concepts" in n["rel_path"]]
    source_notes = [n for n in theme_notes if "Source Material" in n["rel_path"] and "Concepts" not in n["rel_path"]]
    other_notes = [n for n in theme_notes if n not in concept_notes + source_notes]

    body_parts = [f"\n\n{theme_name} — curated index of related notes.\n"]

    if other_notes:
        body_parts.append("\n## Key Notes")
        for n in sorted(other_notes, key=lambda x: x["name"]):
            body_parts.append(f"- [[{n['name']}]]")

    if concept_notes:
        body_parts.append(f"\n## Concepts ({len(concept_notes)})")
        for n in sorted(concept_notes, key=lambda x: x["name"]):
            body_parts.append(f"- [[{n['filename'].replace('.md', '')}|{n['name']}]]")

    if source_notes:
        body_parts.append("\n## Source Material")
        for n in sorted(source_notes, key=lambda x: x["name"]):
            body_parts.append(f"- [[{n['name']}]]")

    if related_indexes:
        body_parts.append("\n## Related")
        for ri in related_indexes:
            body_parts.append(f"- [[{ri}]]")

    full_content = fm_content + "\n".join(body_parts) + "\n"

    with open(filepath, "w", encoding="utf-8") as f:
        f.write(full_content)


def find_related_themes(theme_name, multi_theme_notes):
    """Find themes that co-occur with this theme."""
    related = defaultdict(int)
    for _, themes in multi_theme_notes:
        if theme_name in themes:
            for t in themes:
                if t != theme_name:
                    related[t] += 1
    return [t for t, c in sorted(related.items(), key=lambda x: -x[1]) if c >= 2]


def main():
    dry_run = "--dry-run" in sys.argv
    report_only = "--report" in sys.argv

    if dry_run or report_only:
        print("Running in DRY-RUN mode (no files will be modified)")
    else:
        print("Running in LIVE mode (files will be modified)")

    print("\nScanning vault...")
    notes = scan_vault_notes()
    print(f"Found {len(notes)} notes")

    print("\nClassifying notes...")
    classifications = []
    for note in notes:
        themes = classify_note(note["filename"], note["content"])
        classifications.append(themes)

    # Generate report
    theme_counts, unclassified, multi_theme = generate_report(notes, classifications)

    if report_only:
        return

    if dry_run:
        print("\nDry-run tag application...")
        modified, theme_note_map = apply_tags(notes, classifications, dry_run=True)
        print(f"Would modify {modified} notes")
        return

    # Apply tags
    print("\nApplying semantic tags...")
    modified, theme_note_map = apply_tags(notes, classifications)
    print(f"Modified {modified} notes")

    # Compute related paths from multi-theme co-occurrence
    related_map = {}
    for theme_name in THEME_MAP:
        related_map[theme_name] = find_related_themes(theme_name, multi_theme)

    # Populate/create Path files
    print("\nPopulating Path files...")
    for theme_name, theme_data in THEME_MAP.items():
        path_name = theme_data["path"]
        if theme_name in theme_note_map and theme_note_map[theme_name]:
            related_paths = [THEME_MAP[r]["path"] for r in related_map.get(theme_name, []) if r in THEME_MAP]
            populate_path_file(path_name, theme_name, theme_note_map[theme_name], related_paths)
            print(f"  Path: {path_name} ({len(theme_note_map[theme_name])} notes)")

    # Create/update Index files
    print("\nCreating Index files...")
    created_indexes = set()
    for theme_name, theme_data in THEME_MAP.items():
        index_name = theme_data["index"]
        if index_name in created_indexes:
            continue
        if theme_name in theme_note_map and theme_note_map[theme_name]:
            # Collect all notes for this index (may span multiple themes)
            all_index_notes = []
            for tn, td in THEME_MAP.items():
                if td["index"] == index_name and tn in theme_note_map:
                    all_index_notes.extend(theme_note_map[tn])
            # Deduplicate
            seen = set()
            deduped = []
            for n in all_index_notes:
                if n["rel_path"] not in seen:
                    seen.add(n["rel_path"])
                    deduped.append(n)

            related_indexes = []
            for r in related_map.get(theme_name, []):
                if r in THEME_MAP and THEME_MAP[r]["index"] != index_name:
                    related_indexes.append(THEME_MAP[r]["index"])
            related_indexes = list(dict.fromkeys(related_indexes))

            create_index_file(index_name, theme_name, deduped, related_indexes)
            created_indexes.add(index_name)
            print(f"  Index: {index_name} ({len(deduped)} notes)")

    print("\nDone!")
    print(f"Total notes tagged: {modified}")
    print(f"Theme distribution: {dict(theme_counts)}")


if __name__ == "__main__":
    main()
