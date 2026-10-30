<?php
// =========================================================
// Keskese Milash Association Netherlands - System Settings API
// =========================================================

require_once __DIR__ . '/db.php';

// Auto-create settings table if it does not exist
try {
    $pdo->exec("CREATE TABLE IF NOT EXISTS settings (
        setting_key VARCHAR(100) PRIMARY KEY,
        setting_value TEXT,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci");

    // Seed default settings if empty
    $check = $pdo->query("SELECT COUNT(*) FROM settings")->fetchColumn();
    if ($check == 0) {
        $pdo->exec("INSERT INTO settings (setting_key, setting_value) VALUES 
            ('phone', '+31 6 86445539'),
            ('email', 'info@keskesemilash.org'),
            ('address', 'Association Keskese Milash Netherlands')
        ");
    }
} catch (Exception $e) {}

$method = $_SERVER['REQUEST_METHOD'];

// GET: Return all settings
if ($method === 'GET') {
    try {
        $stmt = $pdo->query("SELECT setting_key, setting_value FROM settings");
        $rows = $stmt->fetchAll();
        $settings = [];
        foreach ($rows as $r) {
            $settings[$r['setting_key']] = $r['setting_value'];
        }

        // Guarantee defaults if keys are missing
        if (!isset($settings['phone']) || empty($settings['phone'])) {
            $settings['phone'] = '+31 6 86445539';
        }
        if (!isset($settings['email']) || empty($settings['email'])) {
            $settings['email'] = 'info@keskesemilash.org';
        }

        echo json_encode([
            "status" => "success",
            "settings" => $settings
        ]);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(["status" => "error", "message" => $e->getMessage()]);
    }
    exit();
}

// POST: Update settings
if ($method === 'POST') {
    $rawInput = file_get_contents('php://input');
    $input = json_decode($rawInput, true) ?: $_POST;

    if (!is_array($input) || empty($input)) {
        http_response_code(400);
        echo json_encode(["status" => "error", "message" => "No settings data provided."]);
        exit();
    }

    try {
        $stmt = $pdo->prepare("INSERT INTO settings (setting_key, setting_value) VALUES (?, ?) ON DUPLICATE KEY UPDATE setting_value = ?");
        
        foreach ($input as $key => $val) {
            $cleanKey = trim(preg_replace('/[^a-zA-Z0-9_\-]/', '', $key));
            $cleanVal = trim(strval($val));
            if (!empty($cleanKey)) {
                $stmt->execute([$cleanKey, $cleanVal, $cleanVal]);
            }
        }

        // Return updated settings
        $getStmt = $pdo->query("SELECT setting_key, setting_value FROM settings");
        $rows = $getStmt->fetchAll();
        $updated = [];
        foreach ($rows as $r) {
            $updated[$r['setting_key']] = $r['setting_value'];
        }

        echo json_encode([
            "status" => "success",
            "message" => "Settings updated successfully.",
            "settings" => $updated
        ]);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(["status" => "error", "message" => $e->getMessage()]);
    }
    exit();
}
