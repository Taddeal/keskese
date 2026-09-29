<?php
require_once __DIR__ . '/db.php';

$method = $_SERVER['REQUEST_METHOD'];

// Member Dues Lookup / Admin Fetch with Search & Pagination
if ($method === 'GET') {
    $memberId = isset($_GET['member_id']) ? trim($_GET['member_id']) : '';
    $year = isset($_GET['year']) ? intval($_GET['year']) : date('Y');

    // Single Member Dues Statement Lookup
    if (!empty($memberId)) {
        try {
            $stmt = $pdo->prepare("SELECT * FROM member_dues WHERE (member_id = ? OR member_id = ?) AND year = ? ORDER BY id ASC");
            $stmt->execute([$memberId, ltrim($memberId, 'KM-'), $year]);
            $records = $stmt->fetchAll();

            $totalBilled = 0;
            $totalPaid = 0;
            $totalRemaining = 0;

            foreach ($records as $r) {
                $totalBilled += floatval($r['billed_amount']);
                $totalPaid += floatval($r['paid_amount']);
                $totalRemaining += floatval($r['remaining_amount']);
            }

            echo json_encode([
                "status" => "success",
                "member_id" => $memberId,
                "year" => $year,
                "totals" => [
                    "billed" => number_format($totalBilled, 2, '.', ''),
                    "paid" => number_format($totalPaid, 2, '.', ''),
                    "remaining" => number_format($totalRemaining, 2, '.', '')
                ],
                "records" => $records
            ]);
        } catch (PDOException $e) {
            echo json_encode(["status" => "error", "message" => $e->getMessage()]);
        }
        exit();
    }

    // Admin Fetch All Dues with Pagination & Search
    $page = isset($_GET['page']) ? max(1, intval($_GET['page'])) : 1;
    $limit = isset($_GET['limit']) ? max(1, intval($_GET['limit'])) : 10;
    $offset = ($page - 1) * $limit;
    $search = isset($_GET['search']) ? trim($_GET['search']) : '';
    $paymentType = isset($_GET['payment_type']) ? trim($_GET['payment_type']) : '';

    try {
        $whereClauses = [];
        $params = [];

        if (!empty($search)) {
            $whereClauses[] = "(member_id LIKE ? OR member_name LIKE ? OR payment_type LIKE ? OR month LIKE ? OR receipt_number LIKE ? OR payer_name LIKE ? OR status LIKE ?)";
            $searchTerm = "%{$search}%";
            $params = array_merge($params, array_fill(0, 7, $searchTerm));
        }

        if (!empty($paymentType) && $paymentType !== 'all') {
            $whereClauses[] = "payment_type = ?";
            $params[] = $paymentType;
        }

        $whereSQL = !empty($whereClauses) ? "WHERE " . implode(" AND ", $whereClauses) : "";

        // Count Total
        $countStmt = $pdo->prepare("SELECT COUNT(*) FROM member_dues {$whereSQL}");
        $countStmt->execute($params);
        $totalRecords = $countStmt->fetchColumn();

        // Fetch Paginated Records
        $stmt = $pdo->prepare("SELECT * FROM member_dues {$whereSQL} ORDER BY id DESC LIMIT {$limit} OFFSET {$offset}");
        $stmt->execute($params);
        $records = $stmt->fetchAll();

        echo json_encode([
            "status" => "success",
            "total_records" => intval($totalRecords),
            "total_pages" => ceil($totalRecords / $limit),
            "current_page" => $page,
            "limit" => $limit,
            "records" => $records
        ]);
    } catch (PDOException $e) {
        echo json_encode(["status" => "error", "message" => $e->getMessage()]);
    }
    exit();
}

// Add / Update Dues Record (Admin)
if ($method === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true) ?: $_POST;

    $memberId = isset($input['member_id']) ? trim($input['member_id']) : '';
    $memberName = isset($input['member_name']) ? trim($input['member_name']) : '';
    $year = isset($input['year']) ? intval($input['year']) : date('Y');
    $month = isset($input['month']) ? trim($input['month']) : 'Annual';
    $paymentType = isset($input['payment_type']) ? trim($input['payment_type']) : 'Membership Dues';
    $billed = isset($input['billed_amount']) ? floatval($input['billed_amount']) : 0.00;
    $paid = isset($input['paid_amount']) ? floatval($input['paid_amount']) : 0.00;
    $remaining = $billed - $paid;
    if ($remaining < 0) $remaining = 0.00;

    $paymentDate = isset($input['payment_date']) ? $input['payment_date'] : date('Y-m-d');
    $receiptNo = isset($input['receipt_number']) ? trim($input['receipt_number']) : 'REC-' . date('Y') . '-' . rand(100, 999);
    $payerName = isset($input['payer_name']) ? trim($input['payer_name']) : $memberName;

    $status = 'Pending';
    if ($paid >= $billed && $billed > 0) {
        $status = 'Paid';
    } elseif ($paid > 0) {
        $status = 'Partial';
    }

    try {
        $stmt = $pdo->prepare("INSERT INTO member_dues (member_id, member_name, year, month, payment_type, billed_amount, paid_amount, remaining_amount, payment_date, receipt_number, payer_name, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
        $stmt->execute([$memberId, $memberName, $year, $month, $paymentType, $billed, $paid, $remaining, $paymentDate, $receiptNo, $payerName, $status]);

        echo json_encode(["status" => "success", "message" => "Dues record saved successfully.", "receipt_number" => $receiptNo]);
    } catch (PDOException $e) {
        echo json_encode(["status" => "error", "message" => $e->getMessage()]);
    }
    exit();
}
