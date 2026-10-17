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
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci");

    // Auto-convert table to utf8mb4 if it was created with latin1
    $colCheck = $pdo->query("SHOW FULL COLUMNS FROM news WHERE Field = 'title_ti'")->fetch();
    if ($colCheck && isset($colCheck['Collation']) && strpos($colCheck['Collation'], 'utf8mb4') === false) {
        $pdo->exec("ALTER TABLE news CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci");
    }

    // Ensure pdf columns exist if upgrading from older version
    $hasPdf = $pdo->query("SHOW COLUMNS FROM news LIKE 'pdf_url'")->fetch();
    if (!$hasPdf) {
        $pdo->exec("ALTER TABLE news ADD COLUMN pdf_url TEXT, ADD COLUMN pdf_name VARCHAR(255) DEFAULT ''");
    }
} catch (Exception $e) {}

$method = $_SERVER['REQUEST_METHOD'];
$rawInput = file_get_contents('php://input');
$input = json_decode($rawInput, true) ?: $_POST ?: $_GET;

// File Upload Endpoint (PDFs and Images via multipart/form-data)
if ($method === 'POST' && ((isset($_GET['action']) && $_GET['action'] === 'upload') || isset($_FILES['file']))) {
    if (!isset($_FILES['file']) || $_FILES['file']['error'] !== UPLOAD_ERR_OK) {
        http_response_code(400);
        $errMsg = 'No file uploaded or upload error occurred.';
        if (isset($_FILES['file']['error'])) {
            switch ($_FILES['file']['error']) {
                case UPLOAD_ERR_INI_SIZE:
                case UPLOAD_ERR_FORM_SIZE:
                    $errMsg = 'File size exceeds server upload limit.';
                    break;
                case UPLOAD_ERR_PARTIAL:
                    $errMsg = 'File was only partially uploaded.';
                    break;
                case UPLOAD_ERR_NO_FILE:
                    $errMsg = 'No file was uploaded.';
                    break;
            }
        }
        echo json_encode(["status" => "error", "message" => $errMsg]);
        exit();
    }

    $file = $_FILES['file'];
    $type = isset($_POST['type']) ? $_POST['type'] : (isset($_GET['type']) ? $_GET['type'] : 'document');
    $originalName = basename($file['name']);
    $ext = strtolower(pathinfo($originalName, PATHINFO_EXTENSION));

    if ($type === 'image') {
        $allowedExts = ['jpg', 'jpeg', 'png', 'gif', 'webp'];
        if (!in_array($ext, $allowedExts)) {
            http_response_code(400);
            echo json_encode(["status" => "error", "message" => "Only JPG, PNG, GIF, and WEBP image files are allowed."]);
            exit();
        }
        $targetSubdir = 'images';
    } else {
        if ($ext !== 'pdf') {
            http_response_code(400);
            echo json_encode(["status" => "error", "message" => "Only PDF documents are allowed."]);
            exit();
        }
        $targetSubdir = 'documents';
    }

    $uploadDir = __DIR__ . '/../uploads/' . $targetSubdir;
    if (!is_dir($uploadDir)) {
        @mkdir($uploadDir, 0755, true);
    }

    $safeName = preg_replace('/[^a-zA-Z0-9_\-\.]/', '_', pathinfo($originalName, PATHINFO_FILENAME));
    $finalFilename = time() . '_' . bin2hex(random_bytes(4)) . '_' . $safeName . '.' . $ext;
    $targetPath = $uploadDir . '/' . $finalFilename;

    if (move_uploaded_file($file['tmp_name'], $targetPath)) {
        $fileUrl = '/uploads/' . $targetSubdir . '/' . $finalFilename;
        echo json_encode([
            "status" => "success",
            "url" => $fileUrl,
            "name" => $originalName,
            "size" => $file['size']
        ]);
    } else {
        http_response_code(500);
        echo json_encode(["status" => "error", "message" => "Failed to save uploaded file on server."]);
    }
    exit();
}

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
        // Remove physical PDF and Image files from disk if present
        try {
            $selStmt = $pdo->prepare("SELECT image_url, pdf_url FROM news WHERE id = ?");
            $selStmt->execute([$id]);
            $existing = $selStmt->fetch();
            if ($existing) {
                if (!empty($existing['pdf_url']) && strpos($existing['pdf_url'], '/uploads/documents/') === 0) {
                    $pdfDiskPath = __DIR__ . '/..' . $existing['pdf_url'];
                    if (file_exists($pdfDiskPath)) @unlink($pdfDiskPath);
                }
                if (!empty($existing['image_url']) && strpos($existing['image_url'], '/uploads/images/') === 0) {
                    $imgDiskPath = __DIR__ . '/..' . $existing['image_url'];
                    if (file_exists($imgDiskPath)) @unlink($imgDiskPath);
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

    // If image is a base64 data URL, extract and save it to /uploads/images/
    if (!empty($image) && strpos($image, 'data:image/') === 0) {
        $imgUploadDir = __DIR__ . '/../uploads/images';
        if (!is_dir($imgUploadDir)) {
            @mkdir($imgUploadDir, 0755, true);
        }
        if (preg_match('/^data:image\/(\w+);base64,/', $image, $matches)) {
            $ext = strtolower($matches[1]);
            if ($ext === 'jpeg') $ext = 'jpg';
            $base64Img = substr($image, strpos($image, ',') + 1);
            $decodedImg = base64_decode($base64Img);
            if ($decodedImg !== false && strlen($decodedImg) > 0) {
                $imgFilename = 'img_' . time() . '_' . bin2hex(random_bytes(4)) . '.' . $ext;
                if (@file_put_contents($imgUploadDir . '/' . $imgFilename, $decodedImg)) {
                    $image = '/uploads/images/' . $imgFilename;
                }
            }
        }
    }

    // Handle PDF upload from base64 data URL (fallback support)
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
                    "image" => $image,
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
            "image" => $image,
            "pdf_url" => $pdf_url,
            "pdf_name" => $pdf_name
        ]);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(["status" => "error", "message" => $e->getMessage()]);
    }
    exit();
}
