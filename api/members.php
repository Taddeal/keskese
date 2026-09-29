<?php
require_once __DIR__ . '/db.php';

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    $page = isset($_GET['page']) ? max(1, intval($_GET['page'])) : 1;
    $limit = isset($_GET['limit']) ? max(1, intval($_GET['limit'])) : 10;
    $offset = ($page - 1) * $limit;
    $search = isset($_GET['search']) ? trim($_GET['search']) : '';

    try {
        $whereClauses = [];
        $params = [];

        if (!empty($search)) {
            $whereClauses[] = "(member_id LIKE ? OR name LIKE ? OR email LIKE ? OR phone LIKE ? OR origin_village LIKE ? OR address LIKE ?)";
            $searchTerm = "%{$search}%";
            $params = array_fill(0, 6, $searchTerm);
        }

        $whereSQL = !empty($whereClauses) ? "WHERE " . implode(" AND ", $whereClauses) : "";

        // Count Total
        $countStmt = $pdo->prepare("SELECT COUNT(*) FROM members {$whereSQL}");
        $countStmt->execute($params);
        $totalRecords = $countStmt->fetchColumn();

        // Fetch Records
        $stmt = $pdo->prepare("SELECT id, member_id AS memberId, form_type AS formType, name, email, phone, origin_village AS originVillage, address, message, created_at AS dateJoined FROM members {$whereSQL} ORDER BY id DESC LIMIT {$limit} OFFSET {$offset}");
        $stmt->execute($params);
        $members = $stmt->fetchAll();

        echo json_encode([
            "status" => "success",
            "total_records" => intval($totalRecords),
            "total_pages" => ceil($totalRecords / $limit),
            "current_page" => $page,
            "limit" => $limit,
            "records" => $members
        ]);
    } catch (PDOException $e) {
        echo json_encode(["status" => "error", "message" => $e->getMessage()]);
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
