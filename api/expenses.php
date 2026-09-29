<?php
require_once __DIR__ . '/db.php';

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    try {
        $stmt = $pdo->query("SELECT * FROM expenses ORDER BY expense_date DESC, id DESC");
        $expenses = $stmt->fetchAll();

        $totalAmount = 0;
        foreach ($expenses as $e) {
            $totalAmount += floatval($e['amount']);
        }

        echo json_encode([
            "status" => "success",
            "total_expenses" => number_format($totalAmount, 2, '.', ''),
            "records" => $expenses
        ]);
    } catch (PDOException $e) {
        echo json_encode(["error" => $e->getMessage()]);
    }
    exit();
}

if ($method === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true) ?: $_POST;

    $category = isset($input['category']) ? trim($input['category']) : 'General';
    $description = isset($input['description']) ? trim($input['description']) : '';
    $amount = isset($input['amount']) ? floatval($input['amount']) : 0.00;
    $vendorName = isset($input['vendor_name']) ? trim($input['vendor_name']) : '';
    $expenseDate = isset($input['expense_date']) ? $input['expense_date'] : date('Y-m-d');
    $receiptRef = isset($input['receipt_reference']) ? trim($input['receipt_reference']) : '';

    if (empty($description) || $amount <= 0) {
        echo json_encode(["status" => "error", "message" => "Valid description and amount are required."]);
        exit();
    }

    try {
        $stmt = $pdo->prepare("INSERT INTO expenses (category, description, amount, vendor_name, expense_date, receipt_reference) VALUES (?, ?, ?, ?, ?, ?)");
        $stmt->execute([$category, $description, $amount, $vendorName, $expenseDate, $receiptRef]);

        echo json_encode(["status" => "success", "message" => "Expense recorded successfully."]);
    } catch (PDOException $e) {
        echo json_encode(["status" => "error", "message" => $e->getMessage()]);
    }
    exit();
}
