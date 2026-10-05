<?php
// =========================================================
// Keskese Milash Association Netherlands - Leadership & Organization Structure API
// =========================================================

require_once __DIR__ . '/db.php';

$method = $_SERVER['REQUEST_METHOD'];
$rawInput = file_get_contents('php://input');
$input = json_decode($rawInput, true) ?: $_POST ?: $_GET;

// Auto-migrate leadership table
try {
    $pdo->exec("CREATE TABLE IF NOT EXISTS leadership (
        id INT AUTO_INCREMENT PRIMARY KEY,
        term VARCHAR(50) NOT NULL,
        category VARCHAR(100) NOT NULL,
        name VARCHAR(150) NOT NULL,
        role_title VARCHAR(150) DEFAULT '',
        phone VARCHAR(50) DEFAULT '',
        email VARCHAR(150) DEFAULT '',
        display_order INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )");

    // Seed sample leadership data if empty
    $count = $pdo->query("SELECT COUNT(*) FROM leadership")->fetchColumn();
    if ($count == 0) {
        $seedStmt = $pdo->prepare("INSERT INTO leadership (term, category, name, role_title) VALUES (?, ?, ?, ?)");
        $seedStmt->execute(['2026-2028', 'Parliament Leaders', 'Sened Luul', 'Parliament Leader']);
        $seedStmt->execute(['2026-2028', 'Executive Leaders', 'Dawit Luu', 'Executive Leader']);
    }
} catch (Exception $e) {}

// GET: Retrieve Leadership list
if ($method === 'GET' && (!isset($_GET['action']) || $_GET['action'] !== 'delete')) {
    $term = isset($_GET['term']) ? trim($_GET['term']) : '';
    $category = isset($_GET['category']) ? trim($_GET['category']) : '';

    try {
        $where = [];
        $params = [];

        if (!empty($term) && $term !== 'all') {
            $where[] = "term = ?";
            $params[] = $term;
        }

        if (!empty($category) && $category !== 'all') {
            $where[] = "category = ?";
            $params[] = $category;
        }

        $whereSQL = !empty($where) ? "WHERE " . implode(" AND ", $where) : "";
        $stmt = $pdo->prepare("SELECT * FROM leadership {$whereSQL} ORDER BY term DESC, category ASC, display_order ASC, id ASC");
        $stmt->execute($params);
        $records = $stmt->fetchAll();

        // Also fetch distinct terms for filter dropdowns
        $termsStmt = $pdo->query("SELECT DISTINCT term FROM leadership ORDER BY term DESC");
        $availableTerms = $termsStmt->fetchAll(PDO::FETCH_COLUMN);

        echo json_encode([
            "status" => "success",
            "records" => $records,
            "terms" => $availableTerms
        ]);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(["status" => "error", "message" => $e->getMessage()]);
    }
    exit();
}

// DELETE: Remove a leader
if ($method === 'DELETE' || (isset($_GET['action']) && $_GET['action'] === 'delete') || (is_array($input) && isset($input['action']) && $input['action'] === 'delete')) {
    $id = null;
    if (is_array($input) && !empty($input['id'])) $id = $input['id'];
    elseif (!empty($_POST['id'])) $id = $_POST['id'];
    elseif (!empty($_GET['id'])) $id = $_GET['id'];

    if (!$id) {
        http_response_code(400);
        echo json_encode(["status" => "error", "message" => "Leader ID is required for deletion."]);
        exit();
    }

    try {
        $stmt = $pdo->prepare("DELETE FROM leadership WHERE id = ?");
        $stmt->execute([$id]);
        echo json_encode(["status" => "success", "message" => "Leader removed successfully."]);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(["status" => "error", "message" => $e->getMessage()]);
    }
    exit();
}

// POST: Add or Update Leader
if ($method === 'POST') {
    $id = isset($input['id']) && !empty($input['id']) ? intval($input['id']) : null;
    $term = isset($input['term']) ? trim($input['term']) : '2026-2028';
    $category = isset($input['category']) ? trim($input['category']) : 'Executive Leaders';
    $name = isset($input['name']) ? trim($input['name']) : '';
    $roleTitle = isset($input['role_title']) ? trim($input['role_title']) : '';
    $phone = isset($input['phone']) ? trim($input['phone']) : '';
    $email = isset($input['email']) ? trim($input['email']) : '';
    $order = isset($input['display_order']) ? intval($input['display_order']) : 0;

    if (empty($name)) {
        http_response_code(400);
        echo json_encode(["status" => "error", "message" => "Leader name is required."]);
        exit();
    }

    try {
        if ($id) {
            // Update
            $stmt = $pdo->prepare("UPDATE leadership SET term=?, category=?, name=?, role_title=?, phone=?, email=?, display_order=? WHERE id=?");
            $stmt->execute([$term, $category, $name, $roleTitle, $phone, $email, $order, $id]);
            echo json_encode(["status" => "success", "message" => "Leader updated successfully.", "id" => $id]);
        } else {
            // Insert
            $stmt = $pdo->prepare("INSERT INTO leadership (term, category, name, role_title, phone, email, display_order) VALUES (?, ?, ?, ?, ?, ?, ?)");
            $stmt->execute([$term, $category, $name, $roleTitle, $phone, $email, $order]);
            $newId = $pdo->lastInsertId();
            echo json_encode(["status" => "success", "message" => "Leader added successfully.", "id" => $newId]);
        }
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(["status" => "error", "message" => $e->getMessage()]);
    }
    exit();
}
