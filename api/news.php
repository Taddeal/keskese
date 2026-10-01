<?php
// =========================================================
// Keskese Milash Association Netherlands - News & Events API
// =========================================================

require_once __DIR__ . '/db.php';

try {
    $pdo->exec("CREATE TABLE IF NOT EXISTS news (
        id INT AUTO_INCREMENT PRIMARY KEY,
        date DATE NOT NULL,
        title_en VARCHAR(255) NOT NULL,
        title_ti VARCHAR(255) NOT NULL,
        body_en TEXT NOT NULL,
        body_ti TEXT NOT NULL,
        image_url LONGTEXT,
        published BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )");
    $pdo->exec("ALTER TABLE news MODIFY COLUMN image_url LONGTEXT");
} catch (Exception $e) {}

$method = $_SERVER['REQUEST_METHOD'];
$rawInput = file_get_contents('php://input');
$input = json_decode($rawInput, true) ?: $_POST ?: $_GET;

// GET News / Events
if ($method === 'GET' && (!isset($_GET['action']) || $_GET['action'] !== 'delete')) {
    $includeDrafts = isset($_GET['admin']) && $_GET['admin'] === 'true';
    try {
        if ($includeDrafts) {
            $stmt = $pdo->query("SELECT id, date, title_en, title_ti, body_en, body_ti, image_url AS image, published, created_at FROM news ORDER BY date DESC, id DESC");
        } else {
            $stmt = $pdo->query("SELECT id, date, title_en, title_ti, body_en, body_ti, image_url AS image, published, created_at FROM news WHERE published = 1 ORDER BY date DESC, id DESC");
        }
        $news = $stmt->fetchAll();
        echo json_encode(["status" => "success", "records" => $news]);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(["status" => "error", "message" => $e->getMessage()]);
    }
    exit();
}

// DELETE News / Event
if ($method === 'DELETE' || (isset($_GET['action']) && $_GET['action'] === 'delete') || (is_array($input) && isset($input['action']) && $input['action'] === 'delete')) {
    $id = null;
    if (is_array($input) && !empty($input['id'])) $id = $input['id'];
    elseif (!empty($_POST['id'])) $id = $_POST['id'];
    elseif (!empty($_GET['id'])) $id = $_GET['id'];

    if (!$id) {
        http_response_code(400);
        echo json_encode(["status" => "error", "message" => "Post ID is required for deletion."]);
        exit();
    }

    try {
        $stmt = $pdo->prepare("DELETE FROM news WHERE id = ?");
        $stmt->execute([$id]);
        echo json_encode(["status" => "success", "message" => "News post deleted successfully."]);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(["status" => "error", "message" => $e->getMessage()]);
    }
    exit();
}

// POST: Create or Update News / Event
if ($method === 'POST') {
    $id = isset($input['id']) && !empty($input['id']) ? $input['id'] : null;
    $date = isset($input['date']) && !empty($input['date']) ? $input['date'] : date('Y-m-d');
    $titleEn = isset($input['title_en']) ? trim($input['title_en']) : '';
    $titleTi = isset($input['title_ti']) ? trim($input['title_ti']) : '';
    $bodyEn = isset($input['body_en']) ? trim($input['body_en']) : '';
    $bodyTi = isset($input['body_ti']) ? trim($input['body_ti']) : '';
    $image = isset($input['image']) ? trim($input['image']) : '';
    $published = isset($input['published']) ? ($input['published'] ? 1 : 0) : 1;

    if (empty($titleEn) && empty($titleTi)) {
        http_response_code(400);
        echo json_encode(["status" => "error", "message" => "At least an English or Tigrinya title is required."]);
        exit();
    }

    try {
        if ($id && is_numeric($id)) {
            // Check if post exists in DB to update
            $checkStmt = $pdo->prepare("SELECT id FROM news WHERE id = ?");
            $checkStmt->execute([$id]);
            if ($checkStmt->fetch()) {
                $stmt = $pdo->prepare("UPDATE news SET date=?, title_en=?, title_ti=?, body_en=?, body_ti=?, image_url=?, published=? WHERE id=?");
                $stmt->execute([$date, $titleEn, $titleTi, $bodyEn, $bodyTi, $image, $published, $id]);
                echo json_encode(["status" => "success", "message" => "News post updated.", "id" => $id]);
                exit();
            }
        }

        // Create new post
        $stmt = $pdo->prepare("INSERT INTO news (date, title_en, title_ti, body_en, body_ti, image_url, published) VALUES (?, ?, ?, ?, ?, ?, ?)");
        $stmt->execute([$date, $titleEn, $titleTi, $bodyEn, $bodyTi, $image, $published]);
        $newId = $pdo->lastInsertId();

        echo json_encode([
            "status" => "success",
            "message" => "News post created successfully.",
            "id" => $newId
        ]);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(["status" => "error", "message" => $e->getMessage()]);
    }
    exit();
}
