<?php
// =========================================================
// Keskese Milash Association Netherlands - Meetings & Reports API
// =========================================================

require_once __DIR__ . '/db.php';

$method = $_SERVER['REQUEST_METHOD'];
$rawInput = file_get_contents('php://input');
$input = json_decode($rawInput, true) ?: $_POST ?: $_GET;

// Auto-migrate meetings table
try {
    $pdo->exec("CREATE TABLE IF NOT EXISTS meetings (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        meeting_date DATE NOT NULL,
        start_time VARCHAR(20) DEFAULT '12:00',
        end_time VARCHAR(20) DEFAULT '13:00',
        meeting_type VARCHAR(100) DEFAULT 'Leadership Meeting',
        location VARCHAR(255) DEFAULT 'Community Hall',
        attendees TEXT,
        issues_discussed TEXT,
        status VARCHAR(50) DEFAULT 'Scheduled',
        created_by VARCHAR(100) DEFAULT '',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )");
} catch (Exception $e) {}

// GET: Retrieve meetings
if ($method === 'GET' && (!isset($_GET['action']) || $_GET['action'] !== 'delete')) {
    $type = isset($_GET['type']) ? trim($_GET['type']) : '';
    $status = isset($_GET['status']) ? trim($_GET['status']) : '';
    $search = isset($_GET['search']) ? trim($_GET['search']) : '';

    try {
        $where = [];
        $params = [];

        if (!empty($type) && $type !== 'all') {
            $where[] = "meeting_type = ?";
            $params[] = $type;
        }

        if (!empty($status) && $status !== 'all') {
            $where[] = "status = ?";
            $params[] = $status;
        }

        if (!empty($search)) {
            $where[] = "(title LIKE ? OR attendees LIKE ? OR issues_discussed LIKE ? OR location LIKE ?)";
            $term = "%{$search}%";
            $params[] = $term;
            $params[] = $term;
            $params[] = $term;
            $params[] = $term;
        }

        $whereSQL = !empty($where) ? "WHERE " . implode(" AND ", $where) : "";
        $stmt = $pdo->prepare("SELECT * FROM meetings {$whereSQL} ORDER BY meeting_date DESC, start_time DESC, id DESC");
        $stmt->execute($params);
        $records = $stmt->fetchAll();

        echo json_encode([
            "status" => "success",
            "records" => $records
        ]);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(["status" => "error", "message" => $e->getMessage()]);
    }
    exit();
}

// DELETE: Remove a meeting
if ($method === 'DELETE' || (isset($_GET['action']) && $_GET['action'] === 'delete') || (is_array($input) && isset($input['action']) && $input['action'] === 'delete')) {
    $id = null;
    if (is_array($input) && !empty($input['id'])) $id = $input['id'];
    elseif (!empty($_POST['id'])) $id = $_POST['id'];
    elseif (!empty($_GET['id'])) $id = $_GET['id'];

    if (!$id) {
        http_response_code(400);
        echo json_encode(["status" => "error", "message" => "Meeting ID is required for deletion."]);
        exit();
    }

    try {
        $stmt = $pdo->prepare("DELETE FROM meetings WHERE id = ?");
        $stmt->execute([$id]);
        echo json_encode(["status" => "success", "message" => "Meeting removed successfully."]);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(["status" => "error", "message" => $e->getMessage()]);
    }
    exit();
}

// POST: Create or Update Meeting
if ($method === 'POST') {
    $id = isset($input['id']) && !empty($input['id']) ? intval($input['id']) : null;
    $title = isset($input['title']) ? trim($input['title']) : '';
    $meetingDate = isset($input['meeting_date']) ? $input['meeting_date'] : date('Y-m-d');
    $startTime = isset($input['start_time']) ? trim($input['start_time']) : '12:00';
    $endTime = isset($input['end_time']) ? trim($input['end_time']) : '13:00';
    $meetingType = isset($input['meeting_type']) ? trim($input['meeting_type']) : 'Leadership Meeting';
    $location = isset($input['location']) ? trim($input['location']) : 'Community Hall';
    $attendees = isset($input['attendees']) ? trim($input['attendees']) : '';
    $issuesDiscussed = isset($input['issues_discussed']) ? trim($input['issues_discussed']) : '';
    $status = isset($input['status']) ? trim($input['status']) : 'Scheduled';
    $createdBy = isset($input['created_by']) ? trim($input['created_by']) : '';

    if (empty($title)) {
        http_response_code(400);
        echo json_encode(["status" => "error", "message" => "Meeting topic/title is required."]);
        exit();
    }

    try {
        if ($id) {
            $stmt = $pdo->prepare("UPDATE meetings SET title=?, meeting_date=?, start_time=?, end_time=?, meeting_type=?, location=?, attendees=?, issues_discussed=?, status=? WHERE id=?");
            $stmt->execute([$title, $meetingDate, $startTime, $endTime, $meetingType, $location, $attendees, $issuesDiscussed, $status, $id]);
            echo json_encode(["status" => "success", "message" => "Meeting report updated successfully.", "id" => $id]);
        } else {
            $stmt = $pdo->prepare("INSERT INTO meetings (title, meeting_date, start_time, end_time, meeting_type, location, attendees, issues_discussed, status, created_by) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
            $stmt->execute([$title, $meetingDate, $startTime, $endTime, $meetingType, $location, $attendees, $issuesDiscussed, $status, $createdBy]);
            $newId = $pdo->lastInsertId();
            echo json_encode(["status" => "success", "message" => "Meeting recorded successfully.", "id" => $newId]);
        }
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(["status" => "error", "message" => $e->getMessage()]);
    }
    exit();
}
