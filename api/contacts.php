<?php
// =========================================================
// Keskese Milash Association Netherlands - Contacts API
// =========================================================

require_once __DIR__ . '/db.php';

// Auto-create contacts table if it does not exist
$pdo->exec("CREATE TABLE IF NOT EXISTS contacts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    email VARCHAR(150) NOT NULL,
    phone VARCHAR(50) DEFAULT '',
    subject VARCHAR(255) DEFAULT '',
    message TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)");

$method = $_SERVER['REQUEST_METHOD'];

// GET Contacts with Search & Pagination
if ($method === 'GET') {
    $page = isset($_GET['page']) ? max(1, intval($_GET['page'])) : 1;
    $limit = isset($_GET['limit']) ? max(1, intval($_GET['limit'])) : 10;
    $offset = ($page - 1) * $limit;
    $search = isset($_GET['search']) ? trim($_GET['search']) : '';

    try {
        $whereClauses = [];
        $params = [];

        if (!empty($search)) {
            $whereClauses[] = "(name LIKE ? OR email LIKE ? OR phone LIKE ? OR subject LIKE ? OR message LIKE ?)";
            $searchTerm = "%{$search}%";
            $params = array_fill(0, 5, $searchTerm);
        }

        $whereSQL = !empty($whereClauses) ? "WHERE " . implode(" AND ", $whereClauses) : "";

        // Total count
        $countStmt = $pdo->prepare("SELECT COUNT(*) FROM contacts {$whereSQL}");
        $countStmt->execute($params);
        $totalRecords = $countStmt->fetchColumn();

        // Records
        $stmt = $pdo->prepare("SELECT id, name, email, phone, subject, message, created_at AS dateSubmitted FROM contacts {$whereSQL} ORDER BY id DESC LIMIT {$limit} OFFSET {$offset}");
        $stmt->execute($params);
        $records = $stmt->fetchAll();

        echo json_encode([
            "status" => "success",
            "total_records" => intval($totalRecords),
            "total_pages" => ceil($totalRecords / $limit),
            "current_page" => $page,
            "limit" => $limit,
            "records" => $records
        ]);
    } catch (PDOException $e) {
        echo json_encode(["status" => "error", "message" => $e->getMessage()]);
    }
    exit();
}

// DELETE Contact Message
if ($method === 'DELETE' || ($method === 'POST' && (isset($_GET['action']) && $_GET['action'] === 'delete'))) {
    $input = json_decode(file_get_contents('php://input'), true) ?: $_POST ?: $_GET;
    $id = isset($input['id']) ? $input['id'] : (isset($_GET['id']) ? $_GET['id'] : null);

    if (!$id) {
        echo json_encode(["status" => "error", "message" => "Contact ID is required."]);
        exit();
    }

    try {
        $stmt = $pdo->prepare("DELETE FROM contacts WHERE id = ?");
        $stmt->execute([$id]);
        echo json_encode(["status" => "success", "message" => "Contact message deleted successfully."]);
    } catch (PDOException $e) {
        echo json_encode(["status" => "error", "message" => $e->getMessage()]);
    }
    exit();
}
