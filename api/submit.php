<?php
// =========================================================
// Keskese Milash Association Netherlands - Form Submissions API
// Handles both Membership Applications & Contact Messages
// =========================================================

require_once __DIR__ . '/db.php';

$rawInput = file_get_contents('php://input');
$input = json_decode($rawInput, true);

if (!$input) {
    $input = $_POST ?: $_GET;
}

$formType = isset($input['formType']) ? trim($input['formType']) : 'Membership';
$name = isset($input['name']) ? trim($input['name']) : '';
$email = isset($input['email']) ? trim($input['email']) : '';
$phone = isset($input['phone']) ? trim($input['phone']) : '';
$message = isset($input['message']) ? trim($input['message']) : '';

if (empty($name) || empty($email)) {
    http_response_code(400);
    echo json_encode(["status" => "error", "message" => "Name and Email are required."]);
    exit();
}

// -------------------------------------------------------------
// 1. CONTACT US SUBMISSIONS -> Dedicated `contacts` Table
// -------------------------------------------------------------
if (strcasecmp($formType, 'Contact') === 0) {
    $subject = isset($input['subject']) ? trim($input['subject']) : (isset($input['topic']) ? trim($input['topic']) : 'General Inquiry');

    try {
        $pdo->exec("CREATE TABLE IF NOT EXISTS contacts (
            id INT AUTO_INCREMENT PRIMARY KEY,
            name VARCHAR(150) NOT NULL,
            email VARCHAR(150) NOT NULL,
            phone VARCHAR(50) DEFAULT '',
            subject VARCHAR(255) DEFAULT '',
            message TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )");

        $stmt = $pdo->prepare("INSERT INTO contacts (name, email, phone, subject, message) VALUES (?, ?, ?, ?, ?)");
        $stmt->execute([$name, $email, $phone, $subject, $message]);

        echo json_encode([
            "status" => "success",
            "message" => "Your message has been sent successfully!",
            "contact_id" => $pdo->lastInsertId()
        ]);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(["status" => "error", "message" => "Database error: " . $e->getMessage()]);
    }
    exit();
}

// -------------------------------------------------------------
// 2. MEMBERSHIP SUBMISSIONS -> Dedicated `members` Table
// -------------------------------------------------------------
$originVillage = isset($input['originVillage']) ? trim($input['originVillage']) : '';
$address = isset($input['address']) ? trim($input['address']) : '';

try {
    $pdo->exec("CREATE TABLE IF NOT EXISTS members (
        id INT AUTO_INCREMENT PRIMARY KEY,
        member_id VARCHAR(50) UNIQUE NOT NULL,
        form_type VARCHAR(50) DEFAULT 'Membership',
        name VARCHAR(150) NOT NULL,
        email VARCHAR(150) NOT NULL,
        phone VARCHAR(50) NOT NULL,
        origin_village VARCHAR(150) DEFAULT '',
        address VARCHAR(255) DEFAULT '',
        message TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )");

    // Auto-generate Member ID (e.g. KM-001)
    $countStmt = $pdo->query("SELECT COUNT(*) FROM members");
    $nextId = $countStmt->fetchColumn() + 1;
    $memberId = "KM-" . str_pad($nextId, 3, "0", STR_PAD_LEFT);

    $stmt = $pdo->prepare("INSERT INTO members (member_id, form_type, name, email, phone, origin_village, address, message) VALUES (?, 'Membership', ?, ?, ?, ?, ?, ?)");
    $stmt->execute([$memberId, $name, $email, $phone, $originVillage, $address, $message]);

    echo json_encode([
        "status" => "success",
        "message" => "Membership application received successfully!",
        "member_id" => $memberId
    ]);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => "Database error: " . $e->getMessage()]);
}
