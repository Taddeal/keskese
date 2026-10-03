<?php
// =========================================================
// Keskese Milash Association Netherlands - Admin Management API
// Only accessible by Super Admin
// =========================================================

require_once __DIR__ . '/db.php';

$method = $_SERVER['REQUEST_METHOD'];
$rawInput = file_get_contents('php://input');
$input = json_decode($rawInput, true) ?: $_POST ?: $_GET;

// Helper: Ensure admins table exists with role column
try {
    $pdo->exec("CREATE TABLE IF NOT EXISTS admins (
        id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(100) UNIQUE NOT NULL,
        email VARCHAR(150) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        role VARCHAR(50) DEFAULT 'admin',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )");
} catch (Exception $e) {}

// GET: List all administrators (excluding sensitive password hashes)
if ($method === 'GET' && (!isset($_GET['action']) || $_GET['action'] !== 'delete')) {
    try {
        $stmt = $pdo->query("SELECT id, username, email, role, created_at FROM admins ORDER BY id ASC");
        $admins = $stmt->fetchAll();
        echo json_encode([
            "status" => "success",
            "records" => $admins
        ]);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(["status" => "error", "message" => $e->getMessage()]);
    }
    exit();
}

// DELETE: Remove an administrator
if ($method === 'DELETE' || (isset($_GET['action']) && $_GET['action'] === 'delete') || (is_array($input) && isset($input['action']) && $input['action'] === 'delete')) {
    $id = null;
    if (is_array($input) && !empty($input['id'])) $id = $input['id'];
    elseif (!empty($_POST['id'])) $id = $_POST['id'];
    elseif (!empty($_GET['id'])) $id = $_GET['id'];

    if (!$id) {
        http_response_code(400);
        echo json_encode(["status" => "error", "message" => "Admin ID is required."]);
        exit();
    }

    try {
        // Prevent deleting the primary superadmin
        $stmt = $pdo->prepare("SELECT username, email FROM admins WHERE id = ?");
        $stmt->execute([$id]);
        $target = $stmt->fetch();

        if ($target && (strtolower($target['username']) === 'taddeal' || strtolower($target['email']) === 'taddealmoges@gmail.com')) {
            http_response_code(403);
            echo json_encode(["status" => "error", "message" => "The primary Super Admin account cannot be deleted."]);
            exit();
        }

        $delStmt = $pdo->prepare("DELETE FROM admins WHERE id = ?");
        $delStmt->execute([$id]);

        echo json_encode([
            "status" => "success",
            "message" => "Admin user deleted successfully."
        ]);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(["status" => "error", "message" => $e->getMessage()]);
    }
    exit();
}

// POST: Add New Administrator
if ($method === 'POST') {
    $username = isset($input['username']) ? trim($input['username']) : '';
    $email = isset($input['email']) ? trim($input['email']) : '';
    $password = isset($input['password']) ? trim($input['password']) : '';
    $role = isset($input['role']) && in_array(strtolower($input['role']), ['superadmin', 'admin']) ? strtolower($input['role']) : 'admin';

    if (empty($username) || empty($email) || empty($password)) {
        http_response_code(400);
        echo json_encode(["status" => "error", "message" => "Username, email, and password are all required."]);
        exit();
    }

    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        http_response_code(400);
        echo json_encode(["status" => "error", "message" => "Please provide a valid email address."]);
        exit();
    }

    try {
        // Check if username already exists
        $checkStmt = $pdo->prepare("SELECT id FROM admins WHERE username = ? OR email = ?");
        $checkStmt->execute([$username, $email]);
        if ($checkStmt->fetch()) {
            http_response_code(409);
            echo json_encode(["status" => "error", "message" => "An admin with this username or email already exists."]);
            exit();
        }

        // Insert new admin user
        $stmt = $pdo->prepare("INSERT INTO admins (username, email, password_hash, role) VALUES (?, ?, ?, ?)");
        $stmt->execute([$username, $email, $password, $role]);
        $newId = $pdo->lastInsertId();

        echo json_encode([
            "status" => "success",
            "message" => "Admin user created successfully.",
            "admin" => [
                "id" => $newId,
                "username" => $username,
                "email" => $email,
                "role" => $role
            ]
        ]);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(["status" => "error", "message" => $e->getMessage()]);
    }
    exit();
}
