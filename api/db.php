<?php
// =========================================================
// Keskese Milash Association Netherlands - Database Connection
// =========================================================

// CORS & Anti-Cache Headers for React Frontend
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
header("Content-Type: application/json; charset=UTF-8");
header("Cache-Control: no-store, no-cache, must-revalidate, max-age=0");
header("Cache-Control: post-check=0, pre-check=0", false);
header("Pragma: no-cache");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

if (file_exists(__DIR__ . '/config.php')) {
    require_once __DIR__ . '/config.php';
}

$db_host = (defined('DB_HOST') && DB_HOST !== '') ? DB_HOST : (getenv('DB_HOST') ?: 'localhost');
$db_name = (defined('DB_NAME') && DB_NAME !== '') ? DB_NAME : (getenv('DB_NAME') ?: 'keskesem_keskese');
$db_user = (defined('DB_USER') && DB_USER !== '') ? DB_USER : (getenv('DB_USER') ?: 'keskesem_keskese');
$db_pass = (defined('DB_PASS') && DB_PASS !== '') ? DB_PASS : (getenv('DB_PASS') ?: 'Passw0rd@123');

try {
    $pdo = new PDO("mysql:host=$db_host;dbname=$db_name;charset=utf8mb4", $db_user, $db_pass, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_EMULATE_PREPARES => false,
    ]);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["status" => "error", "error" => "Database connection failed: " . $e->getMessage()]);
    exit();
}
