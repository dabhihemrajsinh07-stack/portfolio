<?php
declare(strict_types=1);

header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['ok' => false, 'error' => 'Method not allowed']);
    exit;
}

require __DIR__ . '/db.php';

$raw = file_get_contents('php://input');
$data = json_decode($raw, true);

if (!is_array($data)) {
    http_response_code(400);
    echo json_encode(['ok' => false, 'error' => 'Invalid JSON body']);
    exit;
}

$name = isset($data['name']) ? trim((string) $data['name']) : '';
$email = isset($data['email']) ? trim((string) $data['email']) : '';
$message = isset($data['message']) ? trim((string) $data['message']) : '';

if ($name === '' || mb_strlen($name) > 120) {
    http_response_code(422);
    echo json_encode(['ok' => false, 'error' => 'Please enter a valid name (max 120 characters).']);
    exit;
}

if ($email === '' || !filter_var($email, FILTER_VALIDATE_EMAIL) || mb_strlen($email) > 255) {
    http_response_code(422);
    echo json_encode(['ok' => false, 'error' => 'Please enter a valid email address.']);
    exit;
}

if ($message === '' || mb_strlen($message) > 10000) {
    http_response_code(422);
    echo json_encode(['ok' => false, 'error' => 'Please enter a message (max 10,000 characters).']);
    exit;
}

$ip = isset($_SERVER['REMOTE_ADDR']) ? substr((string) $_SERVER['REMOTE_ADDR'], 0, 45) : '';
$ua = isset($_SERVER['HTTP_USER_AGENT']) ? substr((string) $_SERVER['HTTP_USER_AGENT'], 0, 512) : '';

try {
    $conn = db();
    $stmt = $conn->prepare(
        'INSERT INTO contact_submissions (name, email, message, ip_address, user_agent) VALUES (?, ?, ?, ?, ?)'
    );
    $stmt->bind_param('sssss', $name, $email, $message, $ip, $ua);
    $stmt->execute();
    $stmt->close();
    $conn->close();
} catch (Throwable $e) {
    http_response_code(500);
    echo json_encode(['ok' => false, 'error' => 'Could not save your message. Check the database is set up.']);
    exit;
}

echo json_encode(['ok' => true]);
