<?php
require_once __DIR__ . '/db.php';

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    try {
        $stmt = $pdo->query("SELECT id, member_id AS memberId, form_type AS formType, name, email, phone, origin_village AS originVillage, address, message, created_at AS dateJoined FROM members ORDER BY id DESC");
        $members = $stmt->fetchAll();
        echo json_encode($members);
    } catch (PDOException $e) {
        echo json_encode(["error" => $e->getMessage()]);
    }
    exit();
}

if ($method === 'DELETE' || ($method === 'POST' && isset($_GET['action']) && $_GET['action'] === 'delete')) {
    $input = json_decode(file_get_contents('php://input'), true) ?: $_POST ?: $_GET;
    $id = isset($input['id']) ? $input['id'] : null;

    if (!$id) {
        echo json_encode(["status" => "error", "message" => "Member ID is required for deletion."]);
        exit();
    }

    try {
        $stmt = $pdo->prepare("DELETE FROM members WHERE id = ? OR member_id = ?");
        $stmt->execute([$id, $id]);
        echo json_encode(["status" => "success", "message" => "Member deleted successfully."]);
    } catch (PDOException $e) {
        echo json_encode(["status" => "error", "message" => $e->getMessage()]);
    }
    exit();
}
