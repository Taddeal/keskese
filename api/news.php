<?php
require_once __DIR__ . '/db.php';

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    $includeDrafts = isset($_GET['admin']) && $_GET['admin'] === 'true';
    try {
        if ($includeDrafts) {
            $stmt = $pdo->query("SELECT id, date, title_en, title_ti, body_en, body_ti, image_url AS image, published FROM news ORDER BY date DESC, id DESC");
        } else {
            $stmt = $pdo->query("SELECT id, date, title_en, title_ti, body_en, body_ti, image_url AS image, published FROM news WHERE published = TRUE ORDER BY date DESC, id DESC");
        }
        $news = $stmt->fetchAll();
        echo json_encode($news);
    } catch (PDOException $e) {
        echo json_encode(["error" => $e->getMessage()]);
    }
    exit();
}

if ($method === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true) ?: $_POST;

    $id = isset($input['id']) ? $input['id'] : null;
    $date = isset($input['date']) ? $input['date'] : date('Y-m-d');
    $titleEn = isset($input['title_en']) ? trim($input['title_en']) : '';
    $titleTi = isset($input['title_ti']) ? trim($input['title_ti']) : '';
    $bodyEn = isset($input['body_en']) ? trim($input['body_en']) : '';
    $bodyTi = isset($input['body_ti']) ? trim($input['body_ti']) : '';
    $image = isset($input['image']) ? trim($input['image']) : '';
    $published = isset($input['published']) ? ($input['published'] ? 1 : 0) : 1;

    try {
        if ($id) {
            $stmt = $pdo->prepare("UPDATE news SET date=?, title_en=?, title_ti=?, body_en=?, body_ti=?, image_url=?, published=? WHERE id=?");
            $stmt->execute([$date, $titleEn, $titleTi, $bodyEn, $bodyTi, $image, $published, $id]);
            echo json_encode(["status" => "success", "message" => "News post updated."]);
        } else {
            $stmt = $pdo->prepare("INSERT INTO news (date, title_en, title_ti, body_en, body_ti, image_url, published) VALUES (?, ?, ?, ?, ?, ?, ?)");
            $stmt->execute([$date, $titleEn, $titleTi, $bodyEn, $bodyTi, $image, $published]);
            echo json_encode(["status" => "success", "message" => "News post created."]);
        }
    } catch (PDOException $e) {
        echo json_encode(["status" => "error", "message" => $e->getMessage()]);
    }
    exit();
}

if ($method === 'DELETE') {
    $input = json_decode(file_get_contents('php://input'), true) ?: $_GET;
    $id = isset($input['id']) ? $input['id'] : null;

    if ($id) {
        try {
            $stmt = $pdo->prepare("DELETE FROM news WHERE id = ?");
            $stmt->execute([$id]);
            echo json_encode(["status" => "success", "message" => "News post deleted."]);
        } catch (PDOException $e) {
            echo json_encode(["status" => "error", "message" => $e->getMessage()]);
        }
    }
    exit();
}
