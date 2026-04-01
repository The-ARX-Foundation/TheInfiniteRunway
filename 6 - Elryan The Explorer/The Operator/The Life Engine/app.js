// app.js — The Life Engine
// Emotion check-in with tamagotchi egregore, custom helpers, and real notifications

let emotionsData = {};
let selectedEmotions = [];
let quickEmotions = JSON.parse(localStorage.getItem('quickEmotions')) || [];
let favoriteEmotions = JSON.parse(localStorage.getItem('favoriteEmotions')) || [];
let quickEmotionMode = localStorage.getItem('quickEmotionMode') || 'frequent';
let customEmotions = JSON.parse(localStorage.getItem('tle_customEmotions')) || [];
let customActions = JSON.parse(localStorage.getItem('tle_customActions')) || {};
let notifyUrl = localStorage.getItem('tle_notifyUrl') || '';
let currentModalEmotionId = null;

// Load emotions data
async function loadEmotions() {
  try {
    const response = await fetch('emotions.json');
    emotionsData = await response.json();
    // Merge custom emotions
    if (customEmotions.length > 0) {
      emotionsData.emotions = emotionsData.emotions.concat(customEmotions);
    }
    // Merge custom actions into live data
    for (const [emotionId, actions] of Object.entries(customActions)) {
      if (!emotionsData.actions.you[emotionId]) {
        emotionsData.actions.you[emotionId] = [];
      }
      emotionsData.actions.you[emotionId] = emotionsData.actions.you[emotionId].concat(actions);
    }
    renderEmotions();
    setupEventListeners();
    updateModeIndicator();
    initCreature();
    renderCombos();
    // Load saved notify URL
    const savedUrl = localStorage.getItem('tle_notifyUrl');
    if (savedUrl) {
      document.getElementById('notifyUrl').value = savedUrl;
    }
  } catch (error) {
    console.error('Error loading emotions:', error);
  }
}

// Get all emotions (base + custom)
function getAllEmotions() {
  return emotionsData.emotions || [];
}

// Get quick emotions to display based on mode
function getQuickEmotionsToShow() {
  const all = getAllEmotions();
  if (quickEmotionMode === 'favorites') {
    if (favoriteEmotions.length === 0) return all.slice(0, 6);
    return all.filter(e => favoriteEmotions.includes(e.id));
  } else {
    if (quickEmotions.length === 0) return all.slice(0, 6);
    return all.filter(e => quickEmotions.includes(e.id));
  }
}

// Render all emotion buttons
function renderEmotions() {
  const all = getAllEmotions();

  // Quick emotions
  const quickGrid = document.getElementById('quickEmotionGrid');
  quickGrid.innerHTML = getQuickEmotionsToShow().map(e => createEmotionButton(e)).join('');

  // Category grids
  const categories = ['core', 'physical', 'sensory', 'needs'];
  const gridIds = ['coreEmotionGrid', 'physicalEmotionGrid', 'sensoryEmotionGrid', 'needsEmotionGrid'];
  categories.forEach((cat, i) => {
    const grid = document.getElementById(gridIds[i]);
    grid.innerHTML = all.filter(e => e.category === cat).map(e => createEmotionButton(e)).join('');
  });

  // Attach listeners to all emotion buttons
  document.querySelectorAll('.emotion-btn').forEach(btn => {
    btn.addEventListener('click', handleEmotionClick);
    btn.addEventListener('contextmenu', (e) => {
      e.preventDefault();
      handleEmotionLongPress(btn.dataset.emotionId);
    });
    btn.addEventListener('touchstart', startTouchTimer(btn));
  });

  // Favorite toggles
  document.querySelectorAll('.fav-toggle').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      toggleFavorite(btn.dataset.emotionId);
      renderEmotions();
      updateSelectedSummary();
    });
  });
}

// Create emotion button HTML with favorite star and usage-based sizing
function createEmotionButton(emotion) {
  const isSelected = selectedEmotions.includes(emotion.id);
  const isFavorite = favoriteEmotions.includes(emotion.id);
  const usageCount = parseInt(localStorage.getItem('tle_usage_' + emotion.id) || '0');
  const sizeClass = usageCount > 20 ? 'size-lg' : usageCount > 8 ? 'size-md' : '';

  return `
    <button
      class="emotion-btn ${isSelected ? 'selected' : ''} ${sizeClass}"
      data-emotion-id="${emotion.id}"
      style="${isSelected ? 'background-color: ' + emotion.color + ';' : ''}"
      title="Click to select, long-press for actions"
    >
      <span class="fav-toggle ${isFavorite ? 'active' : ''}" data-emotion-id="${emotion.id}" title="Toggle favorite">
        ${isFavorite ? '\u2605' : '\u2606'}
      </span>
      <span class="emotion-icon">${emotion.icon}</span>
      <span>${emotion.label}</span>
    </button>
  `;
}

// Handle emotion click
function handleEmotionClick(e) {
  if (e.target.closest('.fav-toggle')) return;

  const emotionId = e.currentTarget.dataset.emotionId;
  const index = selectedEmotions.indexOf(emotionId);

  if (index > -1) {
    selectedEmotions.splice(index, 1);
  } else {
    selectedEmotions.push(emotionId);
    if (quickEmotionMode === 'frequent') addToQuickEmotions(emotionId);
    // Track usage for sizing
    const key = 'tle_usage_' + emotionId;
    localStorage.setItem(key, parseInt(localStorage.getItem(key) || '0') + 1);
  }

  renderEmotions();
  updateActionsPanel();
  updateSelectedSummary();
}

// Long press
let touchTimer;
function startTouchTimer(btn) {
  return (e) => {
    if (e.target.closest('.fav-toggle')) return;
    touchTimer = setTimeout(() => handleEmotionLongPress(btn.dataset.emotionId), 500);
  };
}
document.addEventListener('touchend', () => clearTimeout(touchTimer));
document.addEventListener('touchmove', () => clearTimeout(touchTimer));

function handleEmotionLongPress(emotionId) {
  const emotion = getAllEmotions().find(e => e.id === emotionId);
  const youActions = emotionsData.actions.you[emotionId] || [];

  if (!selectedEmotions.includes(emotionId)) {
    selectedEmotions.push(emotionId);
    if (quickEmotionMode === 'frequent') addToQuickEmotions(emotionId);
  }

  currentModalEmotionId = emotionId;
  showActionModal(emotion, youActions);
  updateActionsPanel();
  renderEmotions();
}

// Show action modal
function showActionModal(emotion, actions) {
  const modal = document.getElementById('actionModal');
  document.getElementById('modalTitle').textContent = 'What would help with "' + emotion.label + '"?';
  document.getElementById('modalEmotionName').textContent = emotion.label;

  document.getElementById('modalActions').innerHTML = actions
    .map(action => `
      <button
        class="modal-action-btn ${action.notifySpouse ? 'notify' : ''}"
        onclick="handleActionSelect('${action.text.replace(/'/g, "\\'")}', ${action.notifySpouse})"
      >
        ${action.text}
        ${action.notifySpouse ? '<span style="margin-left: auto;">\ud83d\udce2</span>' : ''}
      </button>
    `).join('');

  modal.classList.add('show');
}

// Handle action selection
function handleActionSelect(actionText, notifySpouse) {
  closeModal();
  if (notifySpouse) sendSpouseNotification(actionText);
}

// Real notification to spouse via PHP backend
async function sendSpouseNotification(actionText) {
  const url = notifyUrl || localStorage.getItem('tle_notifyUrl');

  if (!url) {
    showNotification('\ud83d\udce2 "' + actionText + '" \u2014 Set up notification URL in Settings to send to spouse!');
    return;
  }

  showNotification('\ud83d\udce1 Sending to spouse: "' + actionText + '"...');

  try {
    const emotionLabels = selectedEmotions.map(id => {
      const e = getAllEmotions().find(em => em.id === id);
      return e ? e.icon + ' ' + e.label : id;
    });

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: actionText,
        emotions: emotionLabels,
        timestamp: new Date().toISOString(),
        creature: creatureState.name
      })
    });

    if (response.ok) {
      showNotification('\u2705 Spouse notified: "' + actionText + '"');
    } else {
      showNotification('\u26a0\ufe0f Notification sent but server returned ' + response.status);
    }
  } catch (error) {
    showNotification('\ud83d\udce2 "' + actionText + '" \u2014 Could not reach server. Check URL in Settings.');
    console.error('Notification error:', error);
  }
}

// Show notification toast
function showNotification(message) {
  const toast = document.getElementById('notificationToast');
  toast.textContent = message;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 4000);
}

// Update selected summary
function updateSelectedSummary() {
  const summary = document.getElementById('selectedSummary');
  const chipsContainer = document.getElementById('selectedChips');
  const checkinBtn = document.getElementById('checkinBtn');

  if (selectedEmotions.length === 0) {
    summary.style.display = 'none';
    checkinBtn.style.display = 'none';
    return;
  }

  summary.style.display = 'block';
  checkinBtn.style.display = 'block';

  chipsContainer.innerHTML = selectedEmotions.map(emotionId => {
    const emotion = getAllEmotions().find(e => e.id === emotionId);
    if (!emotion) return '';
    return '<span class="chip" style="background-color: ' + emotion.color + ';">' + emotion.icon + ' ' + emotion.label + '</span>';
  }).join('');
}

// Update actions panel
function updateActionsPanel() {
  const actionsPanel = document.getElementById('actionsPanel');
  const actionsList = document.getElementById('actionsList');
  const clearBtn = document.getElementById('clearBtn');

  if (selectedEmotions.length === 0) {
    actionsPanel.style.display = 'none';
    clearBtn.style.display = 'none';
    return;
  }

  actionsPanel.style.display = 'block';
  clearBtn.style.display = 'block';

  const allActions = [];
  selectedEmotions.forEach(emotionId => {
    const emotion = getAllEmotions().find(e => e.id === emotionId);
    const youActions = emotionsData.actions.you[emotionId] || [];
    youActions.forEach(action => {
      allActions.push({ text: action.text, notifySpouse: action.notifySpouse, emotionId, emotion });
    });
  });

  const uniqueActions = Array.from(new Map(allActions.map(a => [a.text, a])).values());

  actionsList.innerHTML = uniqueActions.map(action => `
    <button
      class="action-item ${action.notifySpouse ? 'notify' : ''}"
      onclick="selectAction('${action.text.replace(/'/g, "\\'")}', ${action.notifySpouse})"
    >
      <span>${action.text}</span>
      ${action.notifySpouse ? '<span class="notify-badge">Tell spouse</span>' : ''}
    </button>
  `).join('');
}

function selectAction(actionText, notifySpouse) {
  if (notifySpouse) sendSpouseNotification(actionText);
}

// Quick emotions management
function addToQuickEmotions(emotionId) {
  if (!quickEmotions.includes(emotionId)) {
    quickEmotions.unshift(emotionId);
    if (quickEmotions.length > 6) quickEmotions.pop();
    localStorage.setItem('quickEmotions', JSON.stringify(quickEmotions));
  }
}

function toggleFavorite(emotionId) {
  const index = favoriteEmotions.indexOf(emotionId);
  if (index > -1) favoriteEmotions.splice(index, 1);
  else favoriteEmotions.push(emotionId);
  localStorage.setItem('favoriteEmotions', JSON.stringify(favoriteEmotions));
}

function updateModeIndicator() {
  const indicator = document.getElementById('modeIndicator');
  if (indicator) indicator.textContent = quickEmotionMode === 'frequent' ? '\ud83d\udcca Most Used' : '\u2b50 Favorites';
}

// Search
function searchEmotions(query) {
  const resultsContainer = document.getElementById('searchResults');
  if (query.trim() === '') { resultsContainer.innerHTML = ''; return; }

  const lowerQuery = query.toLowerCase();
  const results = getAllEmotions().filter(emotion =>
    emotion.label.toLowerCase().includes(lowerQuery) ||
    emotion.id.toLowerCase().includes(lowerQuery) ||
    emotion.category.toLowerCase().includes(lowerQuery)
  );

  if (results.length === 0) {
    resultsContainer.classList.add('empty');
    resultsContainer.innerHTML = '<p>No emotions found. Try another search!</p>';
    return;
  }

  resultsContainer.classList.remove('empty');
  resultsContainer.innerHTML = results.map(e => createEmotionButton(e)).join('');

  resultsContainer.querySelectorAll('.emotion-btn').forEach(btn => {
    btn.addEventListener('click', handleEmotionClick);
    btn.addEventListener('contextmenu', (e) => { e.preventDefault(); handleEmotionLongPress(btn.dataset.emotionId); });
  });
  resultsContainer.querySelectorAll('.fav-toggle').forEach(btn => {
    btn.addEventListener('click', (e) => { e.stopPropagation(); toggleFavorite(btn.dataset.emotionId); renderEmotions(); searchEmotions(query); });
  });
}

// Add custom emotion
function addCustomEmotion() {
  const name = document.getElementById('customEmotionName').value.trim();
  const icon = document.getElementById('customEmotionIcon').value.trim();
  const color = document.getElementById('customEmotionColor').value;
  const category = document.getElementById('customEmotionCategory').value;

  if (!name || !icon) { showNotification('Please fill in name and icon!'); return; }

  const id = name.toLowerCase().replace(/\s+/g, '_');
  if (getAllEmotions().find(e => e.id === id)) { showNotification('An emotion with that name already exists!'); return; }

  const newEmotion = { id, label: name, icon, color, category };
  customEmotions.push(newEmotion);
  emotionsData.emotions.push(newEmotion);
  localStorage.setItem('tle_customEmotions', JSON.stringify(customEmotions));

  document.getElementById('customEmotionName').value = '';
  document.getElementById('customEmotionIcon').value = '';
  document.getElementById('addEmotionModal').classList.remove('show');
  renderEmotions();
  showNotification('Added "' + name + '" ' + icon);
}

// Add custom action/helper for an emotion
function addCustomAction() {
  const text = document.getElementById('customActionText').value.trim();
  const notifySpouse = document.getElementById('customActionNotify').checked;

  if (!text || !currentModalEmotionId) { showNotification('Please fill in the helper text!'); return; }

  const emotionId = currentModalEmotionId;
  if (!customActions[emotionId]) customActions[emotionId] = [];
  const newAction = { text, notifySpouse };
  customActions[emotionId].push(newAction);
  localStorage.setItem('tle_customActions', JSON.stringify(customActions));

  if (!emotionsData.actions.you[emotionId]) emotionsData.actions.you[emotionId] = [];
  emotionsData.actions.you[emotionId].push(newAction);

  document.getElementById('customActionText').value = '';
  document.getElementById('customActionNotify').checked = false;
  document.getElementById('addActionModal').classList.remove('show');

  const emotion = getAllEmotions().find(e => e.id === emotionId);
  if (emotion) showActionModal(emotion, emotionsData.actions.you[emotionId]);
  showNotification('Added helper: "' + text + '"');
}

// Check in — feed creature and log history
function checkIn() {
  if (selectedEmotions.length === 0) return;

  const history = JSON.parse(localStorage.getItem('tle_history') || '[]');
  history.push({ emotions: [...selectedEmotions], timestamp: new Date().toISOString() });
  if (history.length > 500) history.splice(0, history.length - 500);
  localStorage.setItem('tle_history', JSON.stringify(history));

  // Detect and save combos
  detectCombos([...selectedEmotions]);

  feedCreature([...selectedEmotions]);
  showNotification('\ud83d\udc3e ' + creatureState.name + ' gobbled up your feelings! +XP');

  // Refresh history and insights if visible
  const historyTab = document.getElementById('historyTab');
  if (historyTab && historyTab.classList.contains('active')) {
    renderHistory();
  }
  const insightsTab = document.getElementById('insightsTab');
  if (insightsTab && insightsTab.classList.contains('active')) {
    renderInsights();
  }
}

// ===== HISTORY TAB =====

function renderHistory() {
  const container = document.getElementById('historyContent');
  if (!container) return;

  const history = JSON.parse(localStorage.getItem('tle_history') || '[]');

  if (history.length === 0) {
    container.innerHTML = '<div class="history-empty"><p>No check-ins yet. Your timeline will appear here!</p></div>';
    return;
  }

  // Group by date
  const grouped = {};
  history.slice().reverse().forEach(entry => {
    const date = new Date(entry.timestamp);
    const dateKey = date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
    if (!grouped[dateKey]) grouped[dateKey] = [];
    grouped[dateKey].push(entry);
  });

  let html = '';
  for (const [dateLabel, entries] of Object.entries(grouped)) {
    html += '<div class="history-day">';
    html += '<div class="history-date">' + dateLabel + '</div>';

    entries.forEach(entry => {
      const time = new Date(entry.timestamp).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
      const emotionChips = entry.emotions.map(eid => {
        const emotion = getAllEmotions().find(e => e.id === eid);
        if (!emotion) return '<span class="history-chip">' + eid + '</span>';
        return '<span class="history-chip" style="background-color: ' + emotion.color + ';">' + emotion.icon + '</span>';
      }).join('');

      html += '<div class="history-entry">';
      html += '<span class="history-time">' + time + '</span>';
      html += '<div class="history-chips">' + emotionChips + '</div>';
      html += '</div>';
    });

    html += '</div>';
  }

  container.innerHTML = html;
}

// ===== INSIGHTS TAB =====

function renderInsights() {
  const container = document.getElementById('insightsContent');
  if (!container) return;

  const history = JSON.parse(localStorage.getItem('tle_history') || '[]');
  const streak = typeof getStreakData === 'function' ? getStreakData() : { currentStreak: 0, longestStreak: 0 };

  if (history.length < 3) {
    container.innerHTML = '<div class="insights-empty"><p>Check in a few more times to see your patterns!</p></div>';
    return;
  }

  // Compute stats
  const emotionCounts = {};
  const dayCounts = {};
  const hourCounts = {};
  const comboMap = {};

  history.forEach(entry => {
    const date = new Date(entry.timestamp);
    const dayName = date.toLocaleDateString('en-US', { weekday: 'long' });
    const hour = date.getHours();

    dayCounts[dayName] = (dayCounts[dayName] || 0) + 1;
    hourCounts[hour] = (hourCounts[hour] || 0) + 1;

    entry.emotions.forEach(eid => {
      emotionCounts[eid] = (emotionCounts[eid] || 0) + 1;
    });

    // Track combos
    if (entry.emotions.length >= 2) {
      const key = entry.emotions.slice().sort().join('+');
      comboMap[key] = (comboMap[key] || 0) + 1;
    }
  });

  // Top emotions
  const topEmotions = Object.entries(emotionCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  // Most active day
  const topDay = Object.entries(dayCounts).sort((a, b) => b[1] - a[1])[0];

  // Most active hour
  const topHour = Object.entries(hourCounts).sort((a, b) => b[1] - a[1])[0];
  const hourLabel = topHour ? formatHour(parseInt(topHour[0])) : '';

  // Most common combo
  const topCombo = Object.entries(comboMap).sort((a, b) => b[1] - a[1])[0];

  // Time range
  const firstDate = new Date(history[0].timestamp);
  const daysSinceFirst = Math.max(1, Math.ceil((Date.now() - firstDate.getTime()) / 86400000));
  const avgPerDay = (history.length / daysSinceFirst).toFixed(1);

  let html = '<div class="insights-grid">';

  // Stats cards
  html += '<div class="insight-card stat-card">';
  html += '<div class="stat-number">' + history.length + '</div>';
  html += '<div class="stat-label">Total Check-ins</div>';
  html += '</div>';

  html += '<div class="insight-card stat-card">';
  html += '<div class="stat-number">' + avgPerDay + '</div>';
  html += '<div class="stat-label">Daily Average</div>';
  html += '</div>';

  html += '<div class="insight-card stat-card">';
  html += '<div class="stat-number">' + streak.longestStreak + '</div>';
  html += '<div class="stat-label">Longest Streak</div>';
  html += '</div>';

  html += '<div class="insight-card stat-card">';
  html += '<div class="stat-number">' + Object.keys(emotionCounts).length + '</div>';
  html += '<div class="stat-label">Emotions Used</div>';
  html += '</div>';

  html += '</div>'; // end stats grid

  // Top emotions
  html += '<div class="insight-card">';
  html += '<h4>Your Top Emotions</h4>';
  html += '<div class="insight-bar-list">';
  const maxCount = topEmotions[0] ? topEmotions[0][1] : 1;
  topEmotions.forEach(([eid, count]) => {
    const emotion = getAllEmotions().find(e => e.id === eid);
    const pct = Math.round((count / maxCount) * 100);
    if (emotion) {
      html += '<div class="insight-bar-row">';
      html += '<span class="insight-bar-label">' + emotion.icon + ' ' + emotion.label + '</span>';
      html += '<div class="insight-bar-track"><div class="insight-bar-fill" style="width: ' + pct + '%; background-color: ' + emotion.color + ';"></div></div>';
      html += '<span class="insight-bar-count">' + count + '</span>';
      html += '</div>';
    }
  });
  html += '</div></div>';

  // Patterns
  html += '<div class="insight-card">';
  html += '<h4>Patterns</h4>';
  html += '<ul class="insight-patterns">';

  if (topDay) {
    html += '<li>You check in most on <strong>' + topDay[0] + 's</strong> (' + topDay[1] + ' times)</li>';
  }
  if (topHour) {
    html += '<li>Your peak check-in time is <strong>' + hourLabel + '</strong></li>';
  }
  if (topCombo && topCombo[1] >= 2) {
    const comboEmotions = topCombo[0].split('+').map(eid => {
      const e = getAllEmotions().find(em => em.id === eid);
      return e ? e.icon + ' ' + e.label : eid;
    });
    html += '<li>Your most common combo: <strong>' + comboEmotions.join(' + ') + '</strong> (' + topCombo[1] + ' times)</li>';
  }

  // Recent trend
  const recentHistory = history.slice(-10);
  const recentPositive = recentHistory.filter(e =>
    e.emotions.some(id => ['happy', 'calm', 'grateful', 'hopeful', 'loved', 'content', 'excited'].includes(id))
  ).length;
  const recentHeavy = recentHistory.filter(e =>
    e.emotions.some(id => ['sad', 'angry', 'scared', 'ashamed', 'numb', 'overwhelmed'].includes(id))
  ).length;

  if (recentPositive > recentHeavy * 2) {
    html += '<li>Recent trend: <strong>Mostly positive</strong> vibes lately</li>';
  } else if (recentHeavy > recentPositive * 2) {
    html += '<li>Recent trend: <strong>Going through it</strong> \u2014 your creature is here for you</li>';
  } else if (recentHistory.length >= 5) {
    html += '<li>Recent trend: <strong>Mixed feelings</strong> \u2014 that\'s completely normal</li>';
  }

  html += '</ul></div>';

  container.innerHTML = html;
}

function formatHour(hour) {
  if (hour === 0) return '12 AM';
  if (hour < 12) return hour + ' AM';
  if (hour === 12) return '12 PM';
  return (hour - 12) + ' PM';
}

// ===== EMOTION COMBOS =====

function detectCombos(emotions) {
  if (emotions.length < 2) return;

  const combos = JSON.parse(localStorage.getItem('tle_combos') || '{}');
  const key = emotions.slice().sort().join('+');

  combos[key] = (combos[key] || 0) + 1;

  // Auto-name combos that hit 3 occurrences
  const comboNames = JSON.parse(localStorage.getItem('tle_comboNames') || '{}');
  if (combos[key] === 3 && !comboNames[key]) {
    // Auto-generate a name from the emotions
    const labels = emotions.map(eid => {
      const e = getAllEmotions().find(em => em.id === eid);
      return e ? e.label : eid;
    });
    comboNames[key] = labels.join(' + ');
    localStorage.setItem('tle_comboNames', JSON.stringify(comboNames));
    showNotification('New combo discovered: "' + comboNames[key] + '"!');
  }

  localStorage.setItem('tle_combos', JSON.stringify(combos));
  renderCombos();
}

function renderCombos() {
  const container = document.getElementById('comboSection');
  if (!container) return;

  const combos = JSON.parse(localStorage.getItem('tle_combos') || '{}');
  const comboNames = JSON.parse(localStorage.getItem('tle_comboNames') || '{}');

  // Only show combos that have occurred 3+ times
  const frequentCombos = Object.entries(combos)
    .filter(([, count]) => count >= 3)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  if (frequentCombos.length === 0) {
    container.style.display = 'none';
    return;
  }

  container.style.display = 'block';

  const comboHtml = frequentCombos.map(([key, count]) => {
    const emotionIds = key.split('+');
    const icons = emotionIds.map(eid => {
      const e = getAllEmotions().find(em => em.id === eid);
      return e ? e.icon : '';
    }).join(' ');
    const name = comboNames[key] || key;

    return `
      <button class="combo-btn" data-combo="${key}" title="${name} (used ${count}x)">
        <span class="combo-icons">${icons}</span>
        <span class="combo-name">${name}</span>
        <span class="combo-count">${count}x</span>
      </button>
    `;
  }).join('');

  container.innerHTML = '<h3>Your Combos</h3><div class="combo-list">' + comboHtml + '</div>';

  // Attach combo click handlers
  container.querySelectorAll('.combo-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const emotionIds = btn.dataset.combo.split('+');
      selectedEmotions = [...emotionIds];
      renderEmotions();
      updateActionsPanel();
      updateSelectedSummary();
    });
  });

  // Long-press to rename combo
  container.querySelectorAll('.combo-btn').forEach(btn => {
    btn.addEventListener('contextmenu', (e) => {
      e.preventDefault();
      const key = btn.dataset.combo;
      const currentName = comboNames[key] || key;
      const newName = prompt('Rename this combo:', currentName);
      if (newName && newName.trim()) {
        comboNames[key] = newName.trim();
        localStorage.setItem('tle_comboNames', JSON.stringify(comboNames));
        renderCombos();
        showNotification('Combo renamed to "' + newName.trim() + '"');
      }
    });
  });
}

// Render theme grid
function renderThemeGrid() {
  const grid = document.getElementById('themeGrid');
  grid.innerHTML = Object.entries(THEMES).map(([id, theme]) => {
    const unlocked = creatureState.unlockedThemes.includes(id);
    const active = creatureState.theme === id;
    return '<button class="theme-option ' + (active ? 'active' : '') + ' ' + (!unlocked ? 'locked' : '') + '" data-theme="' + id + '" ' + (!unlocked ? 'disabled' : '') + '>' +
      '<span class="theme-icon">' + theme.icon + '</span>' +
      '<span>' + theme.name + '</span>' +
      (!unlocked ? '<span class="lock-label">Lv. ' + theme.unlockedAt + '</span>' : '') +
      '</button>';
  }).join('');

  grid.querySelectorAll('.theme-option:not(.locked)').forEach(btn => {
    btn.addEventListener('click', () => {
      applyTheme(btn.dataset.theme);
      renderThemeGrid();
      showNotification('Theme: ' + THEMES[btn.dataset.theme].name + ' ' + THEMES[btn.dataset.theme].icon);
    });
  });
}

// Render creature modal
function renderCreatureModal() {
  document.getElementById('creatureNameInput').value = creatureState.name;

  const packGrid = document.getElementById('creaturePackGrid');
  packGrid.innerHTML = Object.entries(CREATURE_PACKS).map(([id, pack]) => {
    const unlocked = creatureState.unlockedCreatures.includes(id);
    const active = creatureState.pack === id;
    return '<button class="creature-option ' + (active ? 'active' : '') + ' ' + (!unlocked ? 'locked' : '') + '" data-pack="' + id + '" ' + (!unlocked ? 'disabled' : '') + '>' +
      '<span class="creature-pack-icon">' + pack.icon + '</span>' +
      '<span>' + pack.name + '</span>' +
      (!unlocked ? '<span class="lock-label">Lv. ' + pack.unlockedAt + '</span>' : '') +
      '</button>';
  }).join('');

  packGrid.querySelectorAll('.creature-option:not(.locked)').forEach(btn => {
    btn.addEventListener('click', () => {
      creatureState.pack = btn.dataset.pack;
      creatureState.personaCreatures[creatureState.persona] = btn.dataset.pack;
      saveCreatureState();
      updateCreatureUI();
      renderCreatureModal();
    });
  });

  const personaGrid = document.getElementById('personaGrid');
  personaGrid.innerHTML = PERSONAS.map(p => {
    const active = creatureState.persona === p.id;
    const assignedCreature = creatureState.personaCreatures[p.id];
    return '<button class="persona-option ' + (active ? 'active' : '') + '" data-persona="' + p.id + '">' +
      '<span>' + p.icon + '</span>' +
      '<span>' + p.name + '</span>' +
      (assignedCreature && CREATURE_PACKS[assignedCreature] ? '<span class="persona-creature">' + CREATURE_PACKS[assignedCreature].icon + '</span>' : '') +
      '</button>';
  }).join('');

  personaGrid.querySelectorAll('.persona-option').forEach(btn => {
    btn.addEventListener('click', () => {
      creatureState.persona = btn.dataset.persona;
      const savedPack = creatureState.personaCreatures[btn.dataset.persona];
      if (savedPack && creatureState.unlockedCreatures.includes(savedPack)) {
        creatureState.pack = savedPack;
      }
      saveCreatureState();
      updateCreatureUI();
      renderCreatureModal();
    });
  });
}

// Setup all event listeners
function setupEventListeners() {
  // Expand toggle
  const expandToggle = document.getElementById('expandToggle');
  const allEmotionsContent = document.querySelector('.all-emotions-content');
  expandToggle.addEventListener('click', () => {
    expandToggle.classList.toggle('open');
    allEmotionsContent.classList.toggle('open');
  });

  // Tab switching (now with history and insights tabs)
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const tabName = btn.dataset.tab;
      document.querySelectorAll('.tab-content').forEach(tab => tab.classList.remove('active'));
      document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
      document.getElementById(tabName + 'Tab').classList.add('active');
      btn.classList.add('active');
      if (tabName !== 'search') {
        document.getElementById('searchInput').value = '';
        document.getElementById('searchResults').innerHTML = '';
      }
      // Render tab content on switch
      if (tabName === 'history') renderHistory();
      if (tabName === 'insights') renderInsights();
    });
  });

  // Search
  document.getElementById('searchInput').addEventListener('input', (e) => searchEmotions(e.target.value));

  // Settings modal
  document.getElementById('settingsBtn').addEventListener('click', () => document.getElementById('settingsModal').classList.add('show'));
  document.getElementById('settingsClose').addEventListener('click', () => document.getElementById('settingsModal').classList.remove('show'));
  document.getElementById('settingsModal').addEventListener('click', (e) => { if (e.target.id === 'settingsModal') e.target.classList.remove('show'); });

  // Notify URL
  document.getElementById('notifyUrl').addEventListener('change', (e) => {
    notifyUrl = e.target.value.trim();
    localStorage.setItem('tle_notifyUrl', notifyUrl);
    showNotification('Notification URL saved!');
  });

  // Mode buttons
  document.getElementById('modeFrequent').addEventListener('click', () => {
    quickEmotionMode = 'frequent';
    localStorage.setItem('quickEmotionMode', 'frequent');
    updateModeButtons();
    updateModeIndicator();
    renderEmotions();
  });
  document.getElementById('modeFavorites').addEventListener('click', () => {
    quickEmotionMode = 'favorites';
    localStorage.setItem('quickEmotionMode', 'favorites');
    updateModeButtons();
    updateModeIndicator();
    renderEmotions();
  });

  // Clear & Check in
  document.getElementById('clearBtn').addEventListener('click', () => {
    selectedEmotions = [];
    renderEmotions();
    updateSelectedSummary();
    updateActionsPanel();
  });
  document.getElementById('checkinBtn').addEventListener('click', checkIn);

  // Action modal
  document.getElementById('modalClose').addEventListener('click', closeModal);
  document.getElementById('actionModal').addEventListener('click', (e) => { if (e.target.id === 'actionModal') closeModal(); });

  // Add custom action from action modal
  document.getElementById('addActionInline').addEventListener('click', () => {
    const emotion = getAllEmotions().find(e => e.id === currentModalEmotionId);
    document.getElementById('addActionTitle').textContent = 'Add Helper for ' + (emotion ? emotion.label : 'emotion');
    document.getElementById('addActionModal').classList.add('show');
  });

  // Add custom emotion modal
  document.getElementById('addEmotionBtn').addEventListener('click', () => document.getElementById('addEmotionModal').classList.add('show'));
  document.getElementById('addEmotionClose').addEventListener('click', () => document.getElementById('addEmotionModal').classList.remove('show'));
  document.getElementById('addEmotionModal').addEventListener('click', (e) => { if (e.target.id === 'addEmotionModal') e.target.classList.remove('show'); });
  document.getElementById('saveCustomEmotion').addEventListener('click', addCustomEmotion);

  // Add custom action modal
  document.getElementById('addActionClose').addEventListener('click', () => document.getElementById('addActionModal').classList.remove('show'));
  document.getElementById('addActionModal').addEventListener('click', (e) => { if (e.target.id === 'addActionModal') e.target.classList.remove('show'); });
  document.getElementById('saveCustomAction').addEventListener('click', addCustomAction);

  // Theme modal
  document.getElementById('themeBtn').addEventListener('click', () => { renderThemeGrid(); document.getElementById('themeModal').classList.add('show'); });
  document.getElementById('themeClose').addEventListener('click', () => document.getElementById('themeModal').classList.remove('show'));
  document.getElementById('themeModal').addEventListener('click', (e) => { if (e.target.id === 'themeModal') e.target.classList.remove('show'); });

  // Creature modal
  document.getElementById('creatureBtn').addEventListener('click', () => { renderCreatureModal(); document.getElementById('creatureModal').classList.add('show'); });
  document.getElementById('creatureClose').addEventListener('click', () => document.getElementById('creatureModal').classList.remove('show'));
  document.getElementById('creatureModal').addEventListener('click', (e) => { if (e.target.id === 'creatureModal') e.target.classList.remove('show'); });
  document.getElementById('creatureNameInput').addEventListener('change', (e) => {
    creatureState.name = e.target.value.trim() || 'Mochi';
    saveCreatureState();
    updateCreatureUI();
  });
}

// Update mode buttons
function updateModeButtons() {
  const freq = document.getElementById('modeFrequent');
  const fav = document.getElementById('modeFavorites');
  if (quickEmotionMode === 'frequent') { freq.classList.add('active'); fav.classList.remove('active'); }
  else { freq.classList.remove('active'); fav.classList.add('active'); }
}

function closeModal() {
  document.getElementById('actionModal').classList.remove('show');
}

// Initialize
loadEmotions();
