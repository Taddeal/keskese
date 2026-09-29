<?php
require_once __DIR__ . '/db.php';

$input = json_decode(file_get_contents('php://input'), true);

if (!$input) {
    $input = $_POST ?: $_GET;
}

$formType = isset($input['formType']) ? trim($input['formType']) : 'Membership';
$name = isset($input['name']) ? trim($input['name']) : '';
$email = isset($input['email']) ? trim($input['email']) : '';
$phone = isset($input['phone']) ? trim($input['phone']) : '';
$originVillage = isset($input['originVillage']) ? trim($input['originVillage']) : '';
$address = isset($input['address']) ? trim($input['address']) : '';
$message = isset($input['message']) ? trim($input['message']) : (isset($input['subject']) ? trim($input['subject']) : '');

if (empty($name) || empty($email)) {
    echo json_encode(["status" => "error", "message" => "Name and Email are required."]);
    exit();
}

// Generate unique Member ID if not set (e.g. KM-101)
$countStmt = $pdo->query("SELECT COUNT(*) FROM members");
$nextId = $countStmt->fetchColumn() + 1;
$memberId = "KM-" . str_pad($nextId, 3, "0", STR_PAD_LEFT);

try {
    $stmt = $pdo->prepare("INSERT INTO members (member_id, form_type, name, email, phone, origin_village, address, message) VALUES (?, ?, ?, ?, ?, ?, ?, ?)");
    $stmt->execute([$memberId, $formType, $name, $email, $phone, $originVillage, $address, $message]);

    echo json_encode([
        "status" => "success",
        "message" => "Submission received successfully!",
        "member_id" => $memberId
    ]);
} catch (PDOException $e) {
    echo json_encode(["status" => "error", "message" => "Database error: " . $e->getMessage()]);
}
