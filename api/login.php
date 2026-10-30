<?php
// =========================================================
// Keskese Milash Association Netherlands - Admin Authentication API
// =========================================================

require_once __DIR__ . '/db.php';

// Only allow POST requests
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(["status" => "error", "message" => "Method not allowed. Only POST is accepted."]);
    exit();
}

$rawInput = file_get_contents('php://input');
$input = json_decode($rawInput, true);

if (!$input) {
    $input = $_POST;
}

$username = isset($input['username']) ? trim($input['username']) : '';
$password = isset($input['password']) ? trim($input['password']) : '';

if (empty($username) || empty($password)) {
    http_response_code(400);
    echo json_encode(["status" => "error", "message" => "Both username/email and password are required."]);
    exit();
}

try {
    // 1. Verify admins table exists; if not, create it dynamically
    $pdo->exec("CREATE TABLE IF NOT EXISTS admins (
        id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(100) UNIQUE NOT NULL,
        email VARCHAR(150) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        role VARCHAR(50) DEFAULT 'admin',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci");

    // Auto-migrate account: replace previous account with kesekesemlash
    try {
        $checkNew = $pdo->prepare("SELECT id FROM admins WHERE email = 'kesekesemlash@gmail.com' OR username = 'kesekesemlash'");
        $checkNew->execute();
        $newAdmin = $checkNew->fetch();

        if (!$newAdmin) {
            // Update taddeal account if exists, or insert new
            $upd = $pdo->prepare("UPDATE admins SET username = 'kesekesemlash', email = 'kesekesemlash@gmail.com', password_hash = 'Luul10.20', role = 'superadmin' WHERE username = 'taddeal' OR email = 'taddealmoges@gmail.com'");
            $upd->execute();
            if ($upd->rowCount() === 0) {
                $ins = $pdo->prepare("INSERT INTO admins (username, email, password_hash, role) VALUES ('kesekesemlash', 'kesekesemlash@gmail.com', 'Luul10.20', 'superadmin')");
                $ins->execute();
            }
        } else {
            // New account already exists, remove old taddeal account
            $pdo->exec("DELETE FROM admins WHERE username = 'taddeal' OR email = 'taddealmoges@gmail.com'");
            // Ensure correct password and superadmin role
            $pdo->prepare("UPDATE admins SET password_hash = 'Luul10.20', role = 'superadmin' WHERE id = ?")->execute([$newAdmin['id']]);
        }
    } catch (Exception $e) {}

    // 2. Check if admin exists; if table is empty, auto-seed default superadmin
    $countStmt = $pdo->query("SELECT COUNT(*) FROM admins");
    if ($countStmt->fetchColumn() == 0) {
        $seedStmt = $pdo->prepare("INSERT INTO admins (username, email, password_hash, role) VALUES (?, ?, ?, 'superadmin')");
        $seedStmt->execute(['kesekesemlash', 'kesekesemlash@gmail.com', 'Luul10.20']);
    }

    // 3. Search for admin by username or email
    $stmt = $pdo->prepare("SELECT id, username, email, password_hash, role FROM admins WHERE username = ? OR email = ? LIMIT 1");
    $stmt->execute([$username, $username]);
    $admin = $stmt->fetch();

    if (!$admin) {
        http_response_code(401);
        echo json_encode(["status" => "error", "message" => "Invalid username/email or password."]);
        exit();
    }

    // 4. Verify password (plain text check with hash fallback)
    $isValid = false;
    if ($password === $admin['password_hash'] || password_verify($password, $admin['password_hash'])) {
        $isValid = true;
    }

    if (!$isValid) {
        http_response_code(401);
        echo json_encode(["status" => "error", "message" => "Invalid username/email or password."]);
        exit();
    }

    // Ensure primary admin account is marked as superadmin
    $role = $admin['role'] ?: 'admin';
    if (strtolower($admin['username']) === 'kesekesemlash' || strtolower($admin['email']) === 'kesekesemlash@gmail.com') {
        $role = 'superadmin';
        try {
            $pdo->prepare("UPDATE admins SET role = 'superadmin' WHERE id = ?")->execute([$admin['id']]);
        } catch (Exception $e) {}
    }

    // 5. Generate secure session token
    $token = bin2hex(random_bytes(32));

    echo json_encode([
        "status" => "success",
        "message" => "Authentication successful",
        "token" => $token,
        "user" => [
            "id" => $admin['id'],
            "username" => $admin['username'],
            "email" => $admin['email'],
            "role" => $role
        ]
    ]);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => "Database authentication error: " . $e->getMessage()]);
}
