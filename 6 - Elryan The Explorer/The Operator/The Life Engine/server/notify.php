<?php
/**
 * The Life Engine — Spouse Notification Endpoint
 *
 * Deploy this on your SiteGround hosting. Receives POST requests from
 * the PWA and sends notifications to the spouse.
 *
 * Setup:
 * 1. Upload this file to your hosting (e.g., yoursite.com/api/notify.php)
 * 2. Configure the $CONFIG values below
 * 3. Set the URL in the Life Engine Settings panel
 *
 * Notification methods (configure one or more):
 * - Email: sends email to spouse
 * - Push: sends web push notification (requires VAPID setup)
 * - Log: writes to a JSON log file the spouse can check
 */

// ===== CONFIGURATION =====
$CONFIG = [
    // Spouse email for notifications
    'spouse_email' => 'spouse@example.com',

    // Your name (shown in notifications)
    'sender_name' => 'Elryan',

    // Notification methods: 'email', 'push', 'log' (comma separated)
    'methods' => ['email', 'log'],

    // Allowed origins (your PWA URL)
    'allowed_origins' => ['*'],

    // Log file path (relative to this script)
    'log_file' => __DIR__ . '/notifications.json',

    // Push notification VAPID keys (generate at https://vapidkeys.com)
    // 'vapid_public' => '',
    // 'vapid_private' => '',
    // 'push_endpoint' => '',  // Spouse's push subscription endpoint
];

// ===== CORS HEADERS =====
$origin = $_SERVER['HTTP_ORIGIN'] ?? '*';
if (in_array('*', $CONFIG['allowed_origins']) || in_array($origin, $CONFIG['allowed_origins'])) {
    header("Access-Control-Allow-Origin: $origin");
}
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json');

// Handle preflight
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Only accept POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit;
}

// Parse JSON body
$input = file_get_contents('php://input');
$data = json_decode($input, true);

if (!$data || !isset($data['action'])) {
    http_response_code(400);
    echo json_encode(['error' => 'Missing action field']);
    exit;
}

$action = htmlspecialchars($data['action'], ENT_QUOTES, 'UTF-8');
$emotions = array_map(function($e) {
    return htmlspecialchars($e, ENT_QUOTES, 'UTF-8');
}, $data['emotions'] ?? []);
$timestamp = $data['timestamp'] ?? date('c');
$creature = htmlspecialchars($data['creature'] ?? 'creature', ENT_QUOTES, 'UTF-8');

$results = [];

// ===== EMAIL NOTIFICATION =====
if (in_array('email', $CONFIG['methods'])) {
    $to = $CONFIG['spouse_email'];
    $subject = "{$CONFIG['sender_name']} needs: {$action}";

    $emotionList = implode(', ', $emotions);
    $body = "{$CONFIG['sender_name']} is feeling: {$emotionList}\n\n";
    $body .= "They need: {$action}\n\n";
    $body .= "Sent via The Life Engine ({$creature})\n";
    $body .= "Time: " . date('g:i A', strtotime($timestamp));

    $headers = "From: noreply@" . $_SERVER['SERVER_NAME'] . "\r\n";
    $headers .= "Content-Type: text/plain; charset=UTF-8\r\n";

    $sent = mail($to, $subject, $body, $headers);
    $results['email'] = $sent ? 'sent' : 'failed';
}

// ===== LOG NOTIFICATION =====
if (in_array('log', $CONFIG['methods'])) {
    $log = [];
    if (file_exists($CONFIG['log_file'])) {
        $existing = file_get_contents($CONFIG['log_file']);
        $log = json_decode($existing, true) ?: [];
    }

    $log[] = [
        'action' => $action,
        'emotions' => $emotions,
        'creature' => $creature,
        'timestamp' => $timestamp,
        'read' => false
    ];

    // Keep last 100 entries
    if (count($log) > 100) {
        $log = array_slice($log, -100);
    }

    $written = file_put_contents($CONFIG['log_file'], json_encode($log, JSON_PRETTY_PRINT));
    $results['log'] = $written !== false ? 'saved' : 'failed';
}

// ===== RESPONSE =====
echo json_encode([
    'status' => 'ok',
    'results' => $results,
    'message' => "Notification sent: {$action}"
]);
