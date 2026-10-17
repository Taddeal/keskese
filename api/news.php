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
        pdf_url TEXT,
        pdf_name VARCHAR(255) DEFAULT '',
        published BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )");
    $pdo->exec("ALTER TABLE news MODIFY COLUMN image_url LONGTEXT");
    try { $pdo->exec("ALTER TABLE news ADD COLUMN pdf_url TEXT"); } catch (Exception $ex) {}
    try { $pdo->exec("ALTER TABLE news ADD COLUMN pdf_name VARCHAR(255) DEFAULT ''"); } catch (Exception $ex) {}
} catch (Exception $e) {}

$method = $_SERVER['REQUEST_METHOD'];
$rawInput = file_get_contents('php://input');
$input = json_decode($rawInput, true) ?: $_POST ?: $_GET;

// GET News / Events
if ($method === 'GET' && (!isset($_GET['action']) || $_GET['action'] !== 'delete')) {
    $includeDrafts = isset($_GET['admin']) && $_GET['admin'] === 'true';
    try {
        if ($includeDrafts) {
            $stmt = $pdo->query("SELECT id, date, title_en, title_ti, body_en, body_ti, image_url AS image, pdf_url, pdf_name, published, created_at FROM news ORDER BY date DESC, id DESC");
        } else {
            $stmt = $pdo->query("SELECT id, date, title_en, title_ti, body_en, body_ti, image_url AS image, pdf_url, pdf_name, published, created_at FROM news WHERE published = 1 ORDER BY date DESC, id DESC");
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
        // Remove physical PDF file from disk if present
        try {
            $selStmt = $pdo->prepare("SELECT pdf_url FROM news WHERE id = ?");
            $selStmt->execute([$id]);
            $existing = $selStmt->fetch();
            if ($existing && !empty($existing['pdf_url']) && strpos($existing['pdf_url'], '/uploads/documents/') === 0) {
                $pdfDiskPath = __DIR__ . '/..' . $existing['pdf_url'];
                if (file_exists($pdfDiskPath)) {
                    @unlink($pdfDiskPath);
                }
            }
        } catch (Exception $e) {}

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
    $pdf_url = isset($input['pdf_url']) ? trim($input['pdf_url']) : '';
    $pdf_name = isset($input['pdf_name']) ? trim($input['pdf_name']) : '';
    $published = isset($input['published']) ? ($input['published'] ? 1 : 0) : 1;

    // Handle PDF upload from base64 data URL
    if (!empty($input['pdf_file']) && strpos($input['pdf_file'], 'data:') === 0) {
        $uploadDir = __DIR__ . '/../uploads/documents';
        if (!is_dir($uploadDir)) {
            @mkdir($uploadDir, 0755, true);
        }

        $parts = explode(',', $input['pdf_file']);
        $base64Data = isset($parts[1]) ? $parts[1] : '';
        $decodedPdf = base64_decode($base64Data);

        if ($decodedPdf !== false && strlen($decodedPdf) > 0) {
            $safeName = preg_replace('/[^a-zA-Z0-9_\-\.]/', '_', $pdf_name);
            if (empty($safeName) || !preg_match('/\.pdf$/i', $safeName)) {
                $safeName = 'doc_' . time() . '.pdf';
            } else {
                $safeName = time() . '_' . $safeName;
            }

            $filePath = $uploadDir . '/' . $safeName;
            if (@file_put_contents($filePath, $decodedPdf)) {
                // Remove old PDF file if being replaced
                if (!empty($pdf_url) && strpos($pdf_url, '/uploads/documents/') === 0) {
                    $oldFile = __DIR__ . '/..' . $pdf_url;
                    if (file_exists($oldFile)) @unlink($oldFile);
                }
                $pdf_url = '/uploads/documents/' . $safeName;
            }
        }
    } elseif (isset($input['remove_pdf']) && $input['remove_pdf'] === true) {
        if (!empty($pdf_url) && strpos($pdf_url, '/uploads/documents/') === 0) {
            $oldFile = __DIR__ . '/..' . $pdf_url;
            if (file_exists($oldFile)) @unlink($oldFile);
        }
        $pdf_url = '';
        $pdf_name = '';
    }

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
                $stmt = $pdo->prepare("UPDATE news SET date=?, title_en=?, title_ti=?, body_en=?, body_ti=?, image_url=?, pdf_url=?, pdf_name=?, published=? WHERE id=?");
                $stmt->execute([$date, $titleEn, $titleTi, $bodyEn, $bodyTi, $image, $pdf_url, $pdf_name, $published, $id]);
                echo json_encode([
                    "status" => "success", 
                    "message" => "News post updated.", 
                    "id" => $id,
                    "pdf_url" => $pdf_url,
                    "pdf_name" => $pdf_name
                ]);
                exit();
            }
        }

        // Create new post
        $stmt = $pdo->prepare("INSERT INTO news (date, title_en, title_ti, body_en, body_ti, image_url, pdf_url, pdf_name, published) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)");
        $stmt->execute([$date, $titleEn, $titleTi, $bodyEn, $bodyTi, $image, $pdf_url, $pdf_name, $published]);
        $newId = $pdo->lastInsertId();

        echo json_encode([
            "status" => "success",
            "message" => "News post created successfully.",
            "id" => $newId,
            "pdf_url" => $pdf_url,
            "pdf_name" => $pdf_name
        ]);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(["status" => "error", "message" => $e->getMessage()]);
    }
    exit();
}
