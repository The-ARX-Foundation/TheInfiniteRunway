// creature.js — The Life Engine Tamagotchi / Egregore System
// A chibi creature that feeds on your emotion check-ins

// ===== EMOTION COLOR LOOKUP =====
// Pulls color directly from loaded emotions data instead of hardcoded maps
let _emotionColorCache = {};

function getEmotionColor(emotionId) {
  if (_emotionColorCache[emotionId]) return _emotionColorCache[emotionId];
  // Try to find from loaded emotions data (set by app.js)
  if (typeof emotionsData !== 'undefined' && emotionsData.emotions) {
    const found = emotionsData.emotions.find(e => e.id === emotionId);
    if (found) {
      _emotionColorCache[emotionId] = found.color;
      return found.color;
    }
  }
  return null;
}

function getCreatureColor(emotions, fallback) {
  if (!emotions || emotions.length === 0) return fallback;
  const lastEmotion = emotions[emotions.length - 1];
  return getEmotionColor(lastEmotion) || fallback;
}

// Blend multiple emotion colors for a richer effect
function blendEmotionColors(emotions, fallback) {
  if (!emotions || emotions.length === 0) return fallback;
  if (emotions.length === 1) return getCreatureColor(emotions, fallback);

  // Average the RGB of last 3 emotions
  const recent = emotions.slice(-3);
  let r = 0, g = 0, b = 0, count = 0;
  for (const eid of recent) {
    const hex = getEmotionColor(eid);
    if (hex) {
      const parsed = hexToRgb(hex);
      if (parsed) { r += parsed.r; g += parsed.g; b += parsed.b; count++; }
    }
  }
  if (count === 0) return fallback;
  r = Math.round(r / count); g = Math.round(g / count); b = Math.round(b / count);
  return `rgb(${r},${g},${b})`;
}

function hexToRgb(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? { r: parseInt(result[1], 16), g: parseInt(result[2], 16), b: parseInt(result[3], 16) } : null;
}

// ===== CREATURE PACKS =====

const CREATURE_PACKS = {
  slime: {
    name: 'Slime',
    icon: '\ud83e\udee7',
    unlocked: true,
    draw: drawSlime
  },
  cat: {
    name: 'Cat',
    icon: '\ud83d\udc31',
    unlocked: true,
    draw: drawCat
  },
  ghost: {
    name: 'Ghost',
    icon: '\ud83d\udc7b',
    unlocked: true,
    draw: drawGhost
  },
  dragon: {
    name: 'Dragon',
    icon: '\ud83d\udc09',
    unlockedAt: 5,
    draw: drawDragon
  },
  mushroom: {
    name: 'Mushroom',
    icon: '\ud83c\udf44',
    unlockedAt: 10,
    draw: drawMushroom
  },
  fox: {
    name: 'Fox',
    icon: '\ud83e\udd8a',
    unlockedAt: 20,
    draw: drawFox
  }
};

const PERSONAS = [
  { id: 'the-operator', name: 'The Operator', icon: '\u2699\ufe0f' },
  { id: 'the-wizard', name: 'The Wizard', icon: '\ud83e\uddd9' },
  { id: 'the-capitalist', name: 'The Capitalist', icon: '\ud83d\udcb0' },
  { id: 'the-architect', name: 'The Architect', icon: '\ud83c\udfd7\ufe0f' },
  { id: 'the-explorer', name: 'The Explorer', icon: '\ud83e\udded' },
  { id: 'the-artist', name: 'The Artist', icon: '\ud83c\udfa8' },
  { id: 'the-healer', name: 'The Healer', icon: '\ud83d\udc9a' },
  { id: 'the-scholar', name: 'The Scholar', icon: '\ud83d\udcda' }
];

const THEMES = {
  cozy: {
    name: 'Cozy',
    icon: '\u2615',
    unlocked: true,
    bg: 'linear-gradient(135deg, #FAF8F3 0%, #F5F0E8 100%)',
    cardBg: '#FFFFFF',
    accent: '#D4A574',
    border: '#E8DCC8',
    secondaryBg: '#F5F0E8',
    textPrimary: '#2C2C2C',
    textSecondary: '#666666'
  },
  nature: {
    name: 'Nature',
    icon: '\ud83c\udf3f',
    unlocked: true,
    bg: 'linear-gradient(135deg, #E8F5E9 0%, #C8E6C9 100%)',
    cardBg: '#FFFFFF',
    accent: '#4CAF50',
    border: '#A5D6A7',
    secondaryBg: '#E8F5E9',
    textPrimary: '#1B5E20',
    textSecondary: '#388E3C'
  },
  gothic: {
    name: 'Gothic',
    icon: '\ud83d\udda4',
    unlockedAt: 3,
    bg: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
    cardBg: '#1a1a2e',
    accent: '#9B59B6',
    border: '#2C2C54',
    secondaryBg: '#16213e',
    textPrimary: '#E0E0E0',
    textSecondary: '#9E9E9E'
  },
  sunset: {
    name: 'Sunset',
    icon: '\ud83c\udf05',
    unlockedAt: 7,
    bg: 'linear-gradient(135deg, #FFF3E0 0%, #FFE0B2 100%)',
    cardBg: '#FFFFFF',
    accent: '#FF7043',
    border: '#FFCC80',
    secondaryBg: '#FFF3E0',
    textPrimary: '#BF360C',
    textSecondary: '#E64A19'
  },
  ocean: {
    name: 'Ocean',
    icon: '\ud83c\udf0a',
    unlockedAt: 15,
    bg: 'linear-gradient(135deg, #E0F7FA 0%, #B2EBF2 100%)',
    cardBg: '#FFFFFF',
    accent: '#00ACC1',
    border: '#80DEEA',
    secondaryBg: '#E0F7FA',
    textPrimary: '#006064',
    textSecondary: '#00838F'
  },
  void: {
    name: 'Void',
    icon: '\ud83c\udf11',
    unlockedAt: 30,
    bg: 'linear-gradient(135deg, #0d0d0d 0%, #1a0a2e 100%)',
    cardBg: '#0d0d0d',
    accent: '#7C4DFF',
    border: '#311B92',
    secondaryBg: '#1a0a2e',
    textPrimary: '#E8E8E8',
    textSecondary: '#B388FF'
  },
  sakura: {
    name: 'Sakura',
    icon: '\ud83c\udf38',
    unlockedAt: 12,
    bg: 'linear-gradient(135deg, #FCE4EC 0%, #F8BBD0 100%)',
    cardBg: '#FFFFFF',
    accent: '#E91E63',
    border: '#F48FB1',
    secondaryBg: '#FCE4EC',
    textPrimary: '#880E4F',
    textSecondary: '#C2185B'
  }
};

// ===== CREATURE STATE =====

let creatureState = JSON.parse(localStorage.getItem('tle_creature')) || {
  name: 'Mochi',
  pack: 'slime',
  persona: 'the-operator',
  xp: 0,
  level: 1,
  totalCheckins: 0,
  lastFedEmotions: [],
  lastFedTime: null,
  mood: 'neutral',
  theme: 'cozy',
  unlockedThemes: ['cozy', 'nature'],
  unlockedCreatures: ['slime', 'cat', 'ghost'],
  personaCreatures: {}
};

function saveCreatureState() {
  localStorage.setItem('tle_creature', JSON.stringify(creatureState));
}

// ===== XP AND LEVELING =====

function addXP(amount) {
  creatureState.xp += amount;
  const xpNeeded = creatureState.level * 50;
  if (creatureState.xp >= xpNeeded) {
    creatureState.xp -= xpNeeded;
    creatureState.level++;
    checkUnlocks();
    showNotification(`Level up! ${creatureState.name} is now Lv. ${creatureState.level}!`);
  }
  updateCreatureUI();
  saveCreatureState();
}

function checkUnlocks() {
  const level = creatureState.level;
  let newUnlock = false;

  for (const [id, theme] of Object.entries(THEMES)) {
    if (theme.unlockedAt && level >= theme.unlockedAt && !creatureState.unlockedThemes.includes(id)) {
      creatureState.unlockedThemes.push(id);
      showNotification(`New theme unlocked: ${theme.name} ${theme.icon}`);
      newUnlock = true;
    }
  }

  for (const [id, pack] of Object.entries(CREATURE_PACKS)) {
    if (pack.unlockedAt && level >= pack.unlockedAt && !creatureState.unlockedCreatures.includes(id)) {
      creatureState.unlockedCreatures.push(id);
      showNotification(`New creature unlocked: ${pack.name} ${pack.icon}`);
      newUnlock = true;
    }
  }

  return newUnlock;
}

// ===== STREAK SYSTEM =====

function getStreakData() {
  const data = JSON.parse(localStorage.getItem('tle_streak')) || {
    currentStreak: 0,
    longestStreak: 0,
    lastCheckinDate: null
  };
  return data;
}

function updateStreak() {
  const streak = getStreakData();
  const today = new Date().toISOString().split('T')[0];

  if (streak.lastCheckinDate === today) {
    // Already checked in today, no streak change
    return streak;
  }

  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

  if (streak.lastCheckinDate === yesterday) {
    // Consecutive day — streak continues
    streak.currentStreak++;
  } else if (streak.lastCheckinDate === null) {
    // First ever check-in
    streak.currentStreak = 1;
  } else {
    // Streak broken
    streak.currentStreak = 1;
  }

  streak.lastCheckinDate = today;
  if (streak.currentStreak > streak.longestStreak) {
    streak.longestStreak = streak.currentStreak;
  }

  // Streak milestone bonus XP
  const milestones = [3, 7, 14, 30, 60, 100];
  if (milestones.includes(streak.currentStreak)) {
    const bonusXP = streak.currentStreak * 2;
    showNotification(`${streak.currentStreak}-day streak! +${bonusXP} bonus XP`);
    addXP(bonusXP);
  }

  localStorage.setItem('tle_streak', JSON.stringify(streak));
  updateStreakDisplay();
  return streak;
}

function updateStreakDisplay() {
  const streak = getStreakData();
  const el = document.getElementById('streakDisplay');
  if (!el) return;

  if (streak.currentStreak > 0) {
    // Flame intensity scales with streak
    let flame = '\ud83d\udd25';
    if (streak.currentStreak >= 30) flame = '\ud83d\udd25\ud83d\udd25\ud83d\udd25';
    else if (streak.currentStreak >= 14) flame = '\ud83d\udd25\ud83d\udd25';
    el.textContent = `${flame} ${streak.currentStreak} day${streak.currentStreak > 1 ? 's' : ''}`;
    el.style.display = 'inline-block';
  } else {
    el.style.display = 'none';
  }
}

// ===== FEED CREATURE =====

function feedCreature(emotions) {
  creatureState.lastFedEmotions = emotions;
  creatureState.lastFedTime = Date.now();
  creatureState.totalCheckins++;

  // Clear emotion color cache so fresh colors are picked up
  _emotionColorCache = {};

  // Determine mood from emotions
  const positiveEmotions = ['happy', 'calm', 'grateful', 'hopeful', 'loved', 'content', 'excited'];
  const heavyEmotions = ['sad', 'angry', 'scared', 'ashamed', 'numb', 'overwhelmed'];
  const needsEmotions = ['lonely', 'need_hug', 'need_talk', 'need_space'];

  const hasPositive = emotions.some(e => positiveEmotions.includes(e));
  const hasHeavy = emotions.some(e => heavyEmotions.includes(e));
  const hasNeeds = emotions.some(e => needsEmotions.includes(e));

  if (hasPositive && !hasHeavy) {
    creatureState.mood = 'happy';
  } else if (hasHeavy && !hasPositive) {
    creatureState.mood = 'concerned';
  } else if (hasNeeds) {
    creatureState.mood = 'attentive';
  } else if (hasPositive && hasHeavy) {
    creatureState.mood = 'processing';
  } else {
    creatureState.mood = 'neutral';
  }

  // XP: base 10 + bonus for variety
  const xpGain = 10 + Math.min(emotions.length * 3, 15);
  addXP(xpGain);

  // Update streak
  updateStreak();

  // Animate the feeding
  animateFeeding();
  saveCreatureState();
}

// ===== MOOD TEXT =====

function getMoodText() {
  const moods = {
    happy: ['feeling great!', 'so happy!', 'vibing~', 'loves this!'],
    concerned: ['worried about you', 'here for you', 'sending love', 'holding space'],
    attentive: ['listening...', 'paying attention', 'here with you', 'all ears'],
    processing: ['thinking...', 'processing...', 'sitting with it', 'taking it in'],
    neutral: ['waiting...', 'ready!', 'here~', 'at your side'],
    hungry: ['feed me emotions!', 'check in?', 'how are you?', 'missing you']
  };

  if (creatureState.lastFedTime && (Date.now() - creatureState.lastFedTime > 6 * 60 * 60 * 1000)) {
    const hungryTexts = moods.hungry;
    return hungryTexts[Math.floor(Math.random() * hungryTexts.length)];
  }

  const moodTexts = moods[creatureState.mood] || moods.neutral;
  return moodTexts[Math.floor(Math.random() * moodTexts.length)];
}

// ===== UPDATE UI =====

function updateCreatureUI() {
  const nameEl = document.getElementById('creatureName');
  const moodEl = document.getElementById('creatureMood');
  const xpFill = document.getElementById('xpFill');
  const xpLabel = document.getElementById('xpLabel');

  if (nameEl) nameEl.textContent = creatureState.name;
  if (moodEl) moodEl.textContent = getMoodText();

  const xpNeeded = creatureState.level * 50;
  const pct = Math.min((creatureState.xp / xpNeeded) * 100, 100);
  if (xpFill) xpFill.style.width = pct + '%';
  if (xpLabel) xpLabel.textContent = `Lv. ${creatureState.level} \u00b7 ${creatureState.xp}/${xpNeeded} XP`;

  updateStreakDisplay();
  drawCreature();
}

// ===== APPLY THEME =====

function applyTheme(themeId) {
  const theme = THEMES[themeId];
  if (!theme) return;

  creatureState.theme = themeId;
  saveCreatureState();

  const root = document.documentElement;
  root.style.setProperty('--primary-bg', 'transparent');
  root.style.setProperty('--secondary-bg', theme.secondaryBg);
  root.style.setProperty('--text-primary', theme.textPrimary);
  root.style.setProperty('--text-secondary', theme.textSecondary);
  root.style.setProperty('--border-color', theme.border);
  root.style.setProperty('--accent', theme.accent);

  document.body.style.background = theme.bg;
  const container = document.getElementById('appContainer');
  if (container) container.style.background = theme.cardBg;
}

// ===== NIGHT MODE AUTO-SWITCH =====

let _nightModeApplied = false;
let _userThemeBeforeNight = null;

function checkNightMode() {
  const hour = new Date().getHours();
  const isNight = hour >= 21 || hour < 6;

  if (isNight && !_nightModeApplied) {
    // Check if user has Gothic or Void unlocked
    const nightTheme = creatureState.unlockedThemes.includes('void') ? 'void' :
                        creatureState.unlockedThemes.includes('gothic') ? 'gothic' : null;
    if (nightTheme && creatureState.theme !== 'void' && creatureState.theme !== 'gothic') {
      _userThemeBeforeNight = creatureState.theme;
      applyTheme(nightTheme);
      _nightModeApplied = true;
      showNotification(`Night mode: switched to ${THEMES[nightTheme].name} ${THEMES[nightTheme].icon}`);
    }
  } else if (!isNight && _nightModeApplied) {
    // Restore daytime theme
    if (_userThemeBeforeNight) {
      applyTheme(_userThemeBeforeNight);
      showNotification(`Good morning! Back to ${THEMES[_userThemeBeforeNight].name} ${THEMES[_userThemeBeforeNight].icon}`);
      _userThemeBeforeNight = null;
    }
    _nightModeApplied = false;
  }
}

// ===== DRAWING =====

let animFrame = 0;
let feedAnim = 0;

function drawCreature() {
  const canvas = document.getElementById('creatureCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  const pack = CREATURE_PACKS[creatureState.pack];
  if (pack && pack.draw) {
    pack.draw(ctx, canvas.width, canvas.height, creatureState.mood, animFrame, feedAnim, creatureState.lastFedEmotions);
  }

  // Draw evolution effects on top
  drawEvolutionEffects(ctx, canvas.width, canvas.height, animFrame);
}

function animateFeeding() {
  feedAnim = 30;
  const interval = setInterval(() => {
    feedAnim--;
    drawCreature();
    if (feedAnim <= 0) {
      clearInterval(interval);
      feedAnim = 0;
    }
  }, 50);
}

// Idle animation loop
function idleLoop() {
  animFrame = (animFrame + 1) % 600; // Extended cycle for richer idle behaviors
  drawCreature();
  requestAnimationFrame(idleLoop);
}

// ===== EVOLUTION VISUALS =====
// Level milestones add persistent visual flair to the creature

function drawEvolutionEffects(ctx, w, h, frame) {
  const level = creatureState.level;
  const cx = w / 2;

  // Level 5+: Sparkle aura
  if (level >= 5) {
    const sparkleCount = Math.min(Math.floor(level / 5), 6);
    for (let i = 0; i < sparkleCount; i++) {
      const angle = (frame * 0.02 + i * (Math.PI * 2 / sparkleCount));
      const dist = 75 + Math.sin(frame * 0.03 + i) * 10;
      const sx = cx + Math.cos(angle) * dist;
      const sy = h / 2 + Math.sin(angle) * dist * 0.5;
      const sparkleSize = 2 + Math.sin(frame * 0.1 + i * 2) * 1.5;
      const alpha = 0.3 + Math.sin(frame * 0.08 + i) * 0.2;

      ctx.fillStyle = `rgba(255, 215, 0, ${alpha})`;
      // Draw a 4-point star
      ctx.save();
      ctx.translate(sx, sy);
      ctx.rotate(frame * 0.02);
      ctx.beginPath();
      for (let p = 0; p < 4; p++) {
        const a = p * Math.PI / 2;
        ctx.lineTo(Math.cos(a) * sparkleSize * 2, Math.sin(a) * sparkleSize * 2);
        ctx.lineTo(Math.cos(a + Math.PI / 4) * sparkleSize * 0.5, Math.sin(a + Math.PI / 4) * sparkleSize * 0.5);
      }
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    }
  }

  // Level 10+: Gentle halo
  if (level >= 10) {
    const haloAlpha = 0.1 + Math.sin(frame * 0.03) * 0.05;
    const haloY = h / 2 - 55;
    ctx.strokeStyle = `rgba(255, 223, 100, ${haloAlpha})`;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.ellipse(cx, haloY, 35 + Math.sin(frame * 0.02) * 3, 10, 0, 0, Math.PI * 2);
    ctx.stroke();

    // Inner halo glow
    ctx.strokeStyle = `rgba(255, 223, 100, ${haloAlpha * 0.5})`;
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.ellipse(cx, haloY, 33 + Math.sin(frame * 0.02) * 3, 8, 0, 0, Math.PI * 2);
    ctx.stroke();
  }

  // Level 20+: Crown
  if (level >= 20) {
    const crownY = h / 2 - 65 + Math.sin(frame * 0.04) * 2;
    const crownW = 30;

    ctx.fillStyle = '#FFD700';
    ctx.beginPath();
    ctx.moveTo(cx - crownW, crownY + 12);
    ctx.lineTo(cx - crownW, crownY);
    ctx.lineTo(cx - crownW * 0.5, crownY + 6);
    ctx.lineTo(cx, crownY - 8);
    ctx.lineTo(cx + crownW * 0.5, crownY + 6);
    ctx.lineTo(cx + crownW, crownY);
    ctx.lineTo(cx + crownW, crownY + 12);
    ctx.closePath();
    ctx.fill();

    // Crown jewels
    ctx.fillStyle = '#E53935';
    ctx.beginPath();
    ctx.arc(cx, crownY - 2, 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#2196F3';
    ctx.beginPath();
    ctx.arc(cx - 14, crownY + 4, 2.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(cx + 14, crownY + 4, 2.5, 0, Math.PI * 2);
    ctx.fill();
  }
}

// ===== CREATURE DRAW FUNCTIONS =====
// Each creature uses getCreatureColor() to pull from emotions.json dynamically

// === SLIME ===
function drawSlime(ctx, w, h, mood, frame, feed, emotions) {
  const cx = w / 2;
  const cy = h / 2 + 20;
  const breathe = Math.sin(frame * 0.05) * 4;
  const bounce = feed > 0 ? Math.sin(feed * 0.3) * 15 : 0;

  // Idle behavior: occasional blink (every ~4 seconds at 60fps)
  const blinkCycle = frame % 240;
  const isBlinking = blinkCycle >= 235 && blinkCycle <= 239;

  // Idle behavior: gentle wobble
  const wobble = Math.sin(frame * 0.02) * 2;

  const bodyColor = getCreatureColor(emotions, '#7EC8E3');

  // Shadow
  ctx.fillStyle = 'rgba(0,0,0,0.08)';
  ctx.beginPath();
  ctx.ellipse(cx + wobble * 0.5, cy + 55, 50, 12, 0, 0, Math.PI * 2);
  ctx.fill();

  // Body (blobby with wobble)
  ctx.fillStyle = bodyColor;
  ctx.beginPath();
  ctx.ellipse(cx + wobble, cy - bounce, 55 + breathe, 50 - breathe * 0.5, 0, 0, Math.PI * 2);
  ctx.fill();

  // Sheen
  ctx.fillStyle = 'rgba(255,255,255,0.3)';
  ctx.beginPath();
  ctx.ellipse(cx - 15 + wobble, cy - 25 - bounce, 15, 10, -0.3, 0, Math.PI * 2);
  ctx.fill();

  // Eyes
  const eyeY = cy - 5 - bounce;
  if (isBlinking) {
    // Blink — closed lines
    ctx.strokeStyle = '#2C2C2C';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(cx - 20 + wobble, eyeY);
    ctx.lineTo(cx - 10 + wobble, eyeY);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(cx + 10 + wobble, eyeY);
    ctx.lineTo(cx + 20 + wobble, eyeY);
    ctx.stroke();
  } else if (mood === 'happy' || mood === 'processing') {
    ctx.strokeStyle = '#2C2C2C';
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.arc(cx - 15 + wobble, eyeY, 8, Math.PI, 0);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(cx + 15 + wobble, eyeY, 8, Math.PI, 0);
    ctx.stroke();
  } else if (mood === 'concerned') {
    ctx.fillStyle = '#2C2C2C';
    ctx.beginPath();
    ctx.arc(cx - 15 + wobble, eyeY, 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(cx + 15 + wobble, eyeY, 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#2C2C2C';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(cx - 24 + wobble, eyeY - 14);
    ctx.lineTo(cx - 8 + wobble, eyeY - 10);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(cx + 24 + wobble, eyeY - 14);
    ctx.lineTo(cx + 8 + wobble, eyeY - 10);
    ctx.stroke();
  } else {
    ctx.fillStyle = '#2C2C2C';
    ctx.beginPath();
    ctx.arc(cx - 15 + wobble, eyeY, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(cx + 15 + wobble, eyeY, 5, 0, Math.PI * 2);
    ctx.fill();
  }

  // Mouth
  if (mood === 'happy') {
    ctx.strokeStyle = '#2C2C2C';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(cx + wobble, eyeY + 15, 8, 0, Math.PI);
    ctx.stroke();
  } else if (mood === 'concerned') {
    ctx.strokeStyle = '#2C2C2C';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(cx + wobble, eyeY + 22, 6, Math.PI, 0);
    ctx.stroke();
  } else {
    ctx.fillStyle = '#2C2C2C';
    ctx.beginPath();
    ctx.arc(cx + wobble, eyeY + 15, 3, 0, Math.PI * 2);
    ctx.fill();
  }

  // Blush
  ctx.fillStyle = 'rgba(255,150,150,0.3)';
  ctx.beginPath();
  ctx.ellipse(cx - 30 + wobble, eyeY + 8, 10, 6, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(cx + 30 + wobble, eyeY + 8, 10, 6, 0, 0, Math.PI * 2);
  ctx.fill();

  // Feed sparkles
  if (feed > 0) {
    for (let i = 0; i < 5; i++) {
      const angle = (feed * 0.2 + i * 1.2);
      const dist = 60 + feed * 1.5;
      const sx = cx + Math.cos(angle) * dist;
      const sy = cy - bounce + Math.sin(angle) * dist * 0.6;
      ctx.fillStyle = `rgba(255, 215, 0, ${feed / 30})`;
      ctx.beginPath();
      ctx.arc(sx, sy, 3, 0, Math.PI * 2);
      ctx.fill();
    }
  }
}

// === CAT ===
function drawCat(ctx, w, h, mood, frame, feed, emotions) {
  const cx = w / 2;
  const cy = h / 2 + 20;
  const breathe = Math.sin(frame * 0.05) * 3;
  const bounce = feed > 0 ? Math.sin(feed * 0.3) * 12 : 0;
  const tailWag = Math.sin(frame * 0.08) * 15;

  // Idle behavior: ear twitch every ~5 seconds
  const earTwitchCycle = frame % 300;
  const earTwitch = (earTwitchCycle >= 290 && earTwitchCycle <= 295) ? Math.sin(earTwitchCycle * 0.5) * 5 : 0;

  // Idle behavior: occasional slow blink
  const blinkCycle = frame % 360;
  const isBlinking = blinkCycle >= 350 && blinkCycle <= 355;

  // Idle behavior: tail has independent flicks
  const tailFlick = (frame % 180 > 170) ? Math.sin(frame * 0.5) * 25 : tailWag;

  const bodyColor = getCreatureColor(emotions, '#333333');

  // Shadow
  ctx.fillStyle = 'rgba(0,0,0,0.08)';
  ctx.beginPath();
  ctx.ellipse(cx, cy + 55, 45, 10, 0, 0, Math.PI * 2);
  ctx.fill();

  // Tail with independent flick
  ctx.strokeStyle = bodyColor;
  ctx.lineWidth = 8;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(cx + 40, cy + 20 - bounce);
  ctx.quadraticCurveTo(cx + 70, cy - 10 - bounce + tailFlick, cx + 60, cy - 40 - bounce + tailFlick);
  ctx.stroke();

  // Body
  ctx.fillStyle = bodyColor;
  ctx.beginPath();
  ctx.ellipse(cx, cy + 10 - bounce, 45 + breathe, 40, 0, 0, Math.PI * 2);
  ctx.fill();

  // Head
  ctx.beginPath();
  ctx.arc(cx, cy - 30 - bounce, 35, 0, Math.PI * 2);
  ctx.fill();

  // Ears (with twitch)
  ctx.beginPath();
  ctx.moveTo(cx - 28, cy - 55 - bounce);
  ctx.lineTo(cx - 18 + earTwitch, cy - 80 - bounce);
  ctx.lineTo(cx - 5, cy - 55 - bounce);
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(cx + 28, cy - 55 - bounce);
  ctx.lineTo(cx + 18 - earTwitch, cy - 80 - bounce);
  ctx.lineTo(cx + 5, cy - 55 - bounce);
  ctx.fill();

  // Inner ears
  ctx.fillStyle = '#FFB6C1';
  ctx.beginPath();
  ctx.moveTo(cx - 24, cy - 56 - bounce);
  ctx.lineTo(cx - 18 + earTwitch, cy - 72 - bounce);
  ctx.lineTo(cx - 10, cy - 56 - bounce);
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(cx + 24, cy - 56 - bounce);
  ctx.lineTo(cx + 18 - earTwitch, cy - 72 - bounce);
  ctx.lineTo(cx + 10, cy - 56 - bounce);
  ctx.fill();

  // Eyes
  const eyeY = cy - 30 - bounce;
  if (isBlinking) {
    ctx.strokeStyle = '#FFF';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(cx - 18, eyeY);
    ctx.lineTo(cx - 6, eyeY);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(cx + 6, eyeY);
    ctx.lineTo(cx + 18, eyeY);
    ctx.stroke();
  } else if (mood === 'happy') {
    ctx.strokeStyle = '#FFF';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(cx - 12, eyeY, 6, Math.PI, 0);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(cx + 12, eyeY, 6, Math.PI, 0);
    ctx.stroke();
  } else {
    ctx.fillStyle = '#FFD700';
    ctx.beginPath();
    ctx.ellipse(cx - 12, eyeY, 6, 7, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#000';
    ctx.beginPath();
    ctx.ellipse(cx - 12, eyeY, 2.5, 6, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#FFD700';
    ctx.beginPath();
    ctx.ellipse(cx + 12, eyeY, 6, 7, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#000';
    ctx.beginPath();
    ctx.ellipse(cx + 12, eyeY, 2.5, 6, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  // Nose + mouth
  ctx.fillStyle = '#FFB6C1';
  ctx.beginPath();
  ctx.moveTo(cx, eyeY + 8);
  ctx.lineTo(cx - 4, eyeY + 12);
  ctx.lineTo(cx + 4, eyeY + 12);
  ctx.fill();

  // Whiskers
  ctx.strokeStyle = 'rgba(255,255,255,0.5)';
  ctx.lineWidth = 1;
  [-1, 1].forEach(side => {
    for (let i = -1; i <= 1; i++) {
      ctx.beginPath();
      ctx.moveTo(cx + side * 15, eyeY + 13 + i * 4);
      ctx.lineTo(cx + side * 45, eyeY + 10 + i * 6);
      ctx.stroke();
    }
  });

  // Feed sparkles
  if (feed > 0) {
    for (let i = 0; i < 5; i++) {
      const angle = (feed * 0.2 + i * 1.2);
      const dist = 55 + feed * 1.5;
      const sx = cx + Math.cos(angle) * dist;
      const sy = cy - bounce + Math.sin(angle) * dist * 0.6;
      ctx.fillStyle = `rgba(255, 215, 0, ${feed / 30})`;
      ctx.beginPath();
      ctx.arc(sx, sy, 3, 0, Math.PI * 2);
      ctx.fill();
    }
  }
}

// === GHOST ===
function drawGhost(ctx, w, h, mood, frame, feed, emotions) {
  const cx = w / 2;
  const cy = h / 2 + 10;
  const float = Math.sin(frame * 0.04) * 8;
  const bounce = feed > 0 ? Math.sin(feed * 0.3) * 10 : 0;

  // Idle behavior: horizontal drift
  const drift = Math.sin(frame * 0.015) * 12;

  // Idle behavior: slight rotation/tilt
  const tilt = Math.sin(frame * 0.025) * 0.05;

  // Idle behavior: phase through (opacity pulse)
  const phaseAlpha = 0.75 + Math.sin(frame * 0.03) * 0.1;

  const bodyColor = `rgba(200, 200, 255, ${phaseAlpha})`;

  // Shadow (follows drift)
  ctx.fillStyle = 'rgba(0,0,0,0.05)';
  ctx.beginPath();
  ctx.ellipse(cx + drift * 0.3, cy + 65 - float * 0.3, 40, 8, 0, 0, Math.PI * 2);
  ctx.fill();

  // Body with tilt
  ctx.save();
  ctx.translate(cx + drift, cy - float - bounce);
  ctx.rotate(tilt);

  ctx.fillStyle = bodyColor;
  ctx.beginPath();
  ctx.arc(0, -20, 45, Math.PI, 0);
  ctx.lineTo(45, 30);
  for (let i = 0; i <= 6; i++) {
    const x = 45 - i * 15;
    const y = 30 + (i % 2 === 0 ? 15 : 0);
    ctx.lineTo(x, y);
  }
  ctx.closePath();
  ctx.fill();

  // Glow
  ctx.fillStyle = `rgba(200, 200, 255, ${phaseAlpha * 0.2})`;
  ctx.beginPath();
  ctx.arc(0, -20, 55, 0, Math.PI * 2);
  ctx.fill();

  // Eyes
  const eyeY = -25;
  if (mood === 'happy') {
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(-14, eyeY, 7, Math.PI, 0);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(14, eyeY, 7, Math.PI, 0);
    ctx.stroke();
  } else {
    ctx.fillStyle = '#333';
    ctx.beginPath();
    ctx.ellipse(-14, eyeY, 7, 9, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#FFF';
    ctx.beginPath();
    ctx.arc(-16, eyeY - 3, 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#333';
    ctx.beginPath();
    ctx.ellipse(14, eyeY, 7, 9, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#FFF';
    ctx.beginPath();
    ctx.arc(12, eyeY - 3, 3, 0, Math.PI * 2);
    ctx.fill();
  }

  // Mouth
  ctx.fillStyle = '#333';
  ctx.beginPath();
  ctx.arc(0, eyeY + 16, 5, 0, Math.PI * 2);
  ctx.fill();

  // Blush
  ctx.fillStyle = 'rgba(255,150,200,0.3)';
  ctx.beginPath();
  ctx.ellipse(-28, eyeY + 10, 8, 5, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(28, eyeY + 10, 8, 5, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();

  // Feed sparkles
  if (feed > 0) {
    for (let i = 0; i < 6; i++) {
      const angle = (feed * 0.15 + i * 1.05);
      const dist = 55 + feed;
      const sx = cx + drift + Math.cos(angle) * dist;
      const sy = cy - float - bounce + Math.sin(angle) * dist * 0.5;
      ctx.fillStyle = `rgba(180, 180, 255, ${feed / 30})`;
      ctx.beginPath();
      ctx.arc(sx, sy, 3, 0, Math.PI * 2);
      ctx.fill();
    }
  }
}

// === DRAGON ===
function drawDragon(ctx, w, h, mood, frame, feed, emotions) {
  const cx = w / 2;
  const cy = h / 2 + 15;
  const breathe = Math.sin(frame * 0.05) * 3;
  const bounce = feed > 0 ? Math.sin(feed * 0.3) * 12 : 0;

  // Idle behavior: wing flap
  const wingFlap = Math.sin(frame * 0.06) * 8;

  // Idle behavior: smoke puffs (periodic)
  const smokeCycle = frame % 200;
  const isSmokePuffing = smokeCycle >= 180;

  const bodyColor = getCreatureColor(emotions, '#2E7D32');

  // Shadow
  ctx.fillStyle = 'rgba(0,0,0,0.08)';
  ctx.beginPath();
  ctx.ellipse(cx, cy + 55, 50, 12, 0, 0, Math.PI * 2);
  ctx.fill();

  // Wings with flap animation
  ctx.fillStyle = bodyColor + '66';
  ctx.beginPath();
  ctx.moveTo(cx - 30, cy - 10 - bounce);
  ctx.quadraticCurveTo(cx - 80, cy - 50 - bounce + breathe - wingFlap, cx - 60, cy - 70 - bounce - wingFlap);
  ctx.quadraticCurveTo(cx - 45, cy - 40 - bounce, cx - 25, cy - 20 - bounce);
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(cx + 30, cy - 10 - bounce);
  ctx.quadraticCurveTo(cx + 80, cy - 50 - bounce + breathe - wingFlap, cx + 60, cy - 70 - bounce - wingFlap);
  ctx.quadraticCurveTo(cx + 45, cy - 40 - bounce, cx + 25, cy - 20 - bounce);
  ctx.fill();

  // Body
  ctx.fillStyle = bodyColor;
  ctx.beginPath();
  ctx.ellipse(cx, cy + 10 - bounce, 40 + breathe, 35, 0, 0, Math.PI * 2);
  ctx.fill();

  // Belly
  ctx.fillStyle = '#FFF9C4';
  ctx.beginPath();
  ctx.ellipse(cx, cy + 15 - bounce, 25, 22, 0, 0, Math.PI * 2);
  ctx.fill();

  // Head
  ctx.fillStyle = bodyColor;
  ctx.beginPath();
  ctx.arc(cx, cy - 30 - bounce, 28, 0, Math.PI * 2);
  ctx.fill();

  // Horns
  ctx.fillStyle = '#FFD54F';
  ctx.beginPath();
  ctx.moveTo(cx - 18, cy - 52 - bounce);
  ctx.lineTo(cx - 12, cy - 72 - bounce);
  ctx.lineTo(cx - 6, cy - 52 - bounce);
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(cx + 18, cy - 52 - bounce);
  ctx.lineTo(cx + 12, cy - 72 - bounce);
  ctx.lineTo(cx + 6, cy - 52 - bounce);
  ctx.fill();

  // Eyes
  const eyeY = cy - 30 - bounce;
  ctx.fillStyle = '#FFF';
  ctx.beginPath();
  ctx.arc(cx - 10, eyeY, 7, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(cx + 10, eyeY, 7, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#000';
  ctx.beginPath();
  ctx.ellipse(cx - 10, eyeY, 3, 5, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(cx + 10, eyeY, 3, 5, 0, 0, Math.PI * 2);
  ctx.fill();

  // Nostrils
  ctx.fillStyle = '#1B5E20';
  ctx.beginPath();
  ctx.arc(cx - 5, eyeY + 12, 2, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(cx + 5, eyeY + 12, 2, 0, Math.PI * 2);
  ctx.fill();

  // Idle smoke puffs or mood smoke
  if (isSmokePuffing || mood === 'concerned' || (emotions && emotions.includes('angry'))) {
    ctx.fillStyle = 'rgba(200,200,200,0.4)';
    const smokeOffset = isSmokePuffing ? (smokeCycle - 180) * 0.5 : 0;
    for (let i = 0; i < 3; i++) {
      ctx.beginPath();
      ctx.arc(cx - 8 + i * 8, eyeY + 5 - i * 8 - smokeOffset, 4 + i, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // Feed sparkles
  if (feed > 0) {
    for (let i = 0; i < 5; i++) {
      const angle = (feed * 0.2 + i * 1.2);
      const dist = 60 + feed * 1.5;
      const sx = cx + Math.cos(angle) * dist;
      const sy = cy - bounce + Math.sin(angle) * dist * 0.6;
      ctx.fillStyle = `rgba(255, 100, 0, ${feed / 30})`;
      ctx.beginPath();
      ctx.arc(sx, sy, 4, 0, Math.PI * 2);
      ctx.fill();
    }
  }
}

// === MUSHROOM ===
function drawMushroom(ctx, w, h, mood, frame, feed, emotions) {
  const cx = w / 2;
  const cy = h / 2 + 25;
  const breathe = Math.sin(frame * 0.04) * 3;
  const bounce = feed > 0 ? Math.sin(feed * 0.3) * 10 : 0;

  // Idle behavior: spore particles floating up
  const sporeCycle = frame % 120;

  const capColor = getCreatureColor(emotions, '#E53935');

  // Shadow
  ctx.fillStyle = 'rgba(0,0,0,0.06)';
  ctx.beginPath();
  ctx.ellipse(cx, cy + 45, 35, 8, 0, 0, Math.PI * 2);
  ctx.fill();

  // Idle: floating spores
  for (let i = 0; i < 4; i++) {
    const sporeAge = (sporeCycle + i * 30) % 120;
    if (sporeAge < 80) {
      const sporeX = cx - 30 + i * 20 + Math.sin(frame * 0.03 + i) * 8;
      const sporeY = cy + 30 - sporeAge * 1.2;
      const sporeAlpha = 1 - sporeAge / 80;
      ctx.fillStyle = `rgba(255, 255, 200, ${sporeAlpha * 0.4})`;
      ctx.beginPath();
      ctx.arc(sporeX, sporeY, 2, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // Stem
  ctx.fillStyle = '#FFF8E1';
  ctx.beginPath();
  ctx.roundRect(cx - 18, cy - 10 - bounce, 36, 50, 8);
  ctx.fill();

  // Cap
  ctx.fillStyle = capColor;
  ctx.beginPath();
  ctx.ellipse(cx, cy - 15 - bounce, 50 + breathe, 35, 0, Math.PI, 0);
  ctx.fill();

  // Spots
  ctx.fillStyle = '#FFF';
  ctx.beginPath();
  ctx.arc(cx - 20, cy - 30 - bounce, 8, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(cx + 15, cy - 35 - bounce, 6, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(cx + 5, cy - 25 - bounce, 5, 0, Math.PI * 2);
  ctx.fill();

  // Face
  const eyeY = cy + 10 - bounce;
  ctx.fillStyle = '#333';
  ctx.beginPath();
  ctx.arc(cx - 8, eyeY, 3, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(cx + 8, eyeY, 3, 0, Math.PI * 2);
  ctx.fill();

  if (mood === 'happy') {
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(cx, eyeY + 8, 5, 0, Math.PI);
    ctx.stroke();
  }

  // Blush
  ctx.fillStyle = 'rgba(255,150,150,0.3)';
  ctx.beginPath();
  ctx.ellipse(cx - 15, eyeY + 5, 6, 4, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(cx + 15, eyeY + 5, 6, 4, 0, 0, Math.PI * 2);
  ctx.fill();

  // Feed sparkles
  if (feed > 0) {
    for (let i = 0; i < 5; i++) {
      const angle = (feed * 0.2 + i * 1.2);
      const dist = 50 + feed * 1.5;
      const sx = cx + Math.cos(angle) * dist;
      const sy = cy - bounce + Math.sin(angle) * dist * 0.5;
      ctx.fillStyle = `rgba(255, 215, 0, ${feed / 30})`;
      ctx.beginPath();
      ctx.arc(sx, sy, 3, 0, Math.PI * 2);
      ctx.fill();
    }
  }
}

// === FOX ===
function drawFox(ctx, w, h, mood, frame, feed, emotions) {
  const cx = w / 2;
  const cy = h / 2 + 20;
  const breathe = Math.sin(frame * 0.05) * 3;
  const bounce = feed > 0 ? Math.sin(feed * 0.3) * 12 : 0;
  const tailWag = Math.sin(frame * 0.06) * 20;

  // Idle behavior: head tilt
  const headTilt = Math.sin(frame * 0.02) * 0.04;

  // Idle behavior: sniff (nose bob)
  const sniffCycle = frame % 150;
  const isSniffing = sniffCycle >= 140;
  const sniffBob = isSniffing ? Math.sin(sniffCycle * 0.8) * 3 : 0;

  const bodyColor = '#E65100';

  // Shadow
  ctx.fillStyle = 'rgba(0,0,0,0.08)';
  ctx.beginPath();
  ctx.ellipse(cx, cy + 55, 48, 10, 0, 0, Math.PI * 2);
  ctx.fill();

  // Tail
  ctx.fillStyle = bodyColor;
  ctx.beginPath();
  ctx.moveTo(cx + 35, cy + 15 - bounce);
  ctx.quadraticCurveTo(cx + 75, cy - 20 - bounce + tailWag, cx + 65, cy - 50 - bounce + tailWag);
  ctx.quadraticCurveTo(cx + 55, cy - 30 - bounce + tailWag, cx + 40, cy + 10 - bounce);
  ctx.fill();
  ctx.fillStyle = '#FFF';
  ctx.beginPath();
  ctx.arc(cx + 65, cy - 48 - bounce + tailWag, 8, 0, Math.PI * 2);
  ctx.fill();

  // Body
  ctx.fillStyle = bodyColor;
  ctx.beginPath();
  ctx.ellipse(cx, cy + 10 - bounce, 42 + breathe, 35, 0, 0, Math.PI * 2);
  ctx.fill();

  // White belly
  ctx.fillStyle = '#FFF';
  ctx.beginPath();
  ctx.ellipse(cx, cy + 15 - bounce, 25, 22, 0, 0, Math.PI * 2);
  ctx.fill();

  // Head (with tilt)
  ctx.save();
  ctx.translate(cx, cy - 28 - bounce);
  ctx.rotate(headTilt);

  ctx.fillStyle = bodyColor;
  ctx.beginPath();
  ctx.arc(0, 0, 30, 0, Math.PI * 2);
  ctx.fill();

  // Ears
  ctx.beginPath();
  ctx.moveTo(-24, -22);
  ctx.lineTo(-16, -50);
  ctx.lineTo(-4, -22);
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(24, -22);
  ctx.lineTo(16, -50);
  ctx.lineTo(4, -22);
  ctx.fill();

  // White face
  ctx.fillStyle = '#FFF';
  ctx.beginPath();
  ctx.moveTo(-15, 3);
  ctx.lineTo(0, 18 + sniffBob);
  ctx.lineTo(15, 3);
  ctx.closePath();
  ctx.fill();

  // Eyes
  const eyeY = -2;
  ctx.fillStyle = '#333';
  ctx.beginPath();
  ctx.arc(-12, eyeY, 4, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(12, eyeY, 4, 0, Math.PI * 2);
  ctx.fill();

  // Nose (with sniff bob)
  ctx.fillStyle = '#333';
  ctx.beginPath();
  ctx.arc(0, eyeY + 12 + sniffBob, 4, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();

  // Feed sparkles
  if (feed > 0) {
    for (let i = 0; i < 5; i++) {
      const angle = (feed * 0.2 + i * 1.2);
      const dist = 55 + feed * 1.5;
      const sx = cx + Math.cos(angle) * dist;
      const sy = cy - bounce + Math.sin(angle) * dist * 0.6;
      ctx.fillStyle = `rgba(255, 150, 0, ${feed / 30})`;
      ctx.beginPath();
      ctx.arc(sx, sy, 3, 0, Math.PI * 2);
      ctx.fill();
    }
  }
}

// ===== INITIALIZE =====

function initCreature() {
  updateCreatureUI();
  applyTheme(creatureState.theme);
  updateStreakDisplay();
  requestAnimationFrame(idleLoop);

  // Check night mode on init and every 5 minutes
  checkNightMode();
  setInterval(checkNightMode, 5 * 60 * 1000);
}
