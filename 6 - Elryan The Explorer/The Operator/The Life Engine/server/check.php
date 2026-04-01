<?php
/**
 * The Life Engine — Spouse Check Endpoint
 *
 * The spouse opens this page (or hits this API) to see pending notifications.
 * Returns unread notifications and marks them as read.
 *
 * Usage:
 * - Browser: yoursite.com/api/check.php (shows a nice HTML page)
 * - API: yoursite.com/api/check.php?format=json (returns JSON)
 */

$LOG_FILE = __DIR__ . '/notifications.json';

header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET');

$format = $_GET['format'] ?? 'html';

// Load notifications
$notifications = [];
if (file_exists($LOG_FILE)) {
    $raw = file_get_contents($LOG_FILE);
    $notifications = json_decode($raw, true) ?: [];
}

// Get unread
$unread = array_filter($notifications, function($n) { return !$n['read']; });

// Mark all as read
$notifications = array_map(function($n) {
    $n['read'] = true;
    return $n;
}, $notifications);
file_put_contents($LOG_FILE, json_encode($notifications, JSON_PRETTY_PRINT));

if ($format === 'json') {
    header('Content-Type: application/json');
    echo json_encode(['unread' => array_values($unread), 'total' => count($notifications)]);
    exit;
}

// HTML view for spouse
$unreadList = array_values($unread);
$recentAll = array_reverse(array_slice($notifications, -20));
?>
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Life Engine - Messages</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      background: linear-gradient(135deg, #FAF8F3 0%, #F5F0E8 100%);
      min-height: 100vh;
      padding: 20px;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      background: white;
      border-radius: 20px;
      padding: 30px;
      box-shadow: 0 10px 30px rgba(0,0,0,0.08);
    }
    h1 { font-size: 24px; margin-bottom: 8px; }
    .subtitle { color: #666; margin-bottom: 24px; }
    .badge {
      display: inline-block;
      background: #FF6B6B;
      color: white;
      padding: 4px 12px;
      border-radius: 20px;
      font-size: 13px;
      font-weight: 600;
      margin-left: 8px;
    }
    .notification {
      padding: 16px;
      border-radius: 12px;
      margin-bottom: 12px;
      border: 2px solid #E8DCC8;
    }
    .notification.unread {
      background: #FFF3E0;
      border-color: #FFB74D;
    }
    .notification .action { font-weight: 600; font-size: 16px; margin-bottom: 6px; }
    .notification .emotions { color: #666; font-size: 14px; margin-bottom: 4px; }
    .notification .time { color: #999; font-size: 12px; }
    .notification .creature { color: #D4A574; font-size: 12px; }
    .empty { text-align: center; padding: 40px; color: #999; font-style: italic; }
    .refresh-btn {
      display: block;
      width: 100%;
      padding: 14px;
      background: #D4A574;
      border: none;
      border-radius: 12px;
      color: white;
      font-weight: 600;
      font-size: 15px;
      cursor: pointer;
      margin-top: 16px;
    }
    .refresh-btn:hover { opacity: 0.9; }
    .section-title { font-size: 16px; font-weight: 600; margin: 20px 0 12px; color: #333; }
  </style>
  <meta http-equiv="refresh" content="30">
</head>
<body>
  <div class="container">
    <h1>Messages from your person
      <?php if (count($unreadList) > 0): ?>
        <span class="badge"><?= count($unreadList) ?> new</span>
      <?php endif; ?>
    </h1>
    <p class="subtitle">Auto-refreshes every 30 seconds</p>

    <?php if (count($unreadList) > 0): ?>
      <div class="section-title">New</div>
      <?php foreach ($unreadList as $n): ?>
        <div class="notification unread">
          <div class="action"><?= htmlspecialchars($n['action']) ?></div>
          <div class="emotions">Feeling: <?= htmlspecialchars(implode(', ', $n['emotions'])) ?></div>
          <div class="time"><?= date('g:i A, M j', strtotime($n['timestamp'])) ?></div>
          <div class="creature">via <?= htmlspecialchars($n['creature']) ?></div>
        </div>
      <?php endforeach; ?>
    <?php else: ?>
      <div class="empty">No new messages right now. All is well.</div>
    <?php endif; ?>

    <?php if (count($recentAll) > 0): ?>
      <div class="section-title">Recent</div>
      <?php foreach ($recentAll as $n): ?>
        <div class="notification">
          <div class="action"><?= htmlspecialchars($n['action']) ?></div>
          <div class="emotions">Feeling: <?= htmlspecialchars(implode(', ', $n['emotions'])) ?></div>
          <div class="time"><?= date('g:i A, M j', strtotime($n['timestamp'])) ?></div>
        </div>
      <?php endforeach; ?>
    <?php endif; ?>

    <button class="refresh-btn" onclick="location.reload()">Refresh Now</button>
  </div>
</body>
</html>
