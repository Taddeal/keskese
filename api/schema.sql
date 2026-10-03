-- =========================================================
-- Keskese Milash Association Netherlands - Database Schema
-- Compatible with cPanel / phpMyAdmin import
-- =========================================================


-- 1. Members Table (Registration & Directory)
CREATE TABLE IF NOT EXISTS members (
    id INT AUTO_INCREMENT PRIMARY KEY,
    member_id VARCHAR(50) UNIQUE NOT NULL,
    form_type VARCHAR(50) DEFAULT 'Membership',
    name VARCHAR(150) NOT NULL,
    email VARCHAR(150) NOT NULL,
    phone VARCHAR(50) NOT NULL,
    origin_village VARCHAR(150) DEFAULT '',
    address VARCHAR(255) DEFAULT '',
    message TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Member Dues & Statements Table (Canva Design Dues Tracker + Payment Categories)
CREATE TABLE IF NOT EXISTS member_dues (
    id INT AUTO_INCREMENT PRIMARY KEY,
    member_id VARCHAR(50) NOT NULL,
    member_name VARCHAR(150) NOT NULL,
    year INT NOT NULL,
    month VARCHAR(50) DEFAULT 'Annual',
    payment_type VARCHAR(100) DEFAULT 'Membership Dues',
    billed_amount DECIMAL(10, 2) DEFAULT 0.00,
    paid_amount DECIMAL(10, 2) DEFAULT 0.00,
    remaining_amount DECIMAL(10, 2) DEFAULT 0.00,
    payment_date DATE,
    receipt_number VARCHAR(100),
    payer_name VARCHAR(150),
    status ENUM('Paid', 'Pending', 'Partial') DEFAULT 'Pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_member_year (member_id, year)
);



-- 3. Expenses & Financial Outflows Table
CREATE TABLE IF NOT EXISTS expenses (
    id INT AUTO_INCREMENT PRIMARY KEY,
    category VARCHAR(100) NOT NULL,
    description TEXT NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    vendor_name VARCHAR(150),
    expense_date DATE NOT NULL,
    receipt_reference VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. News & Events Table
CREATE TABLE IF NOT EXISTS news (
    id INT AUTO_INCREMENT PRIMARY KEY,
    date DATE NOT NULL,
    title_en VARCHAR(255) NOT NULL,
    title_ti VARCHAR(255) NOT NULL,
    body_en TEXT NOT NULL,
    body_ti TEXT NOT NULL,
    image_url LONGTEXT,
    published BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert Sample Member Dues with Categories
INSERT INTO member_dues (member_id, member_name, year, month, payment_type, billed_amount, paid_amount, remaining_amount, payment_date, receipt_number, payer_name, status)
VALUES 
('1', 'Test Member', 2026, 'January', 'Membership Dues', 100.00, 100.00, 0.00, '2026-01-15', 'REC-2026-001', 'Test Member', 'Paid'),
('1', 'Test Member', 2026, 'February', 'Sport Event', 100.00, 50.00, 50.00, '2026-02-10', 'REC-2026-042', 'Test Member', 'Partial')
ON DUPLICATE KEY UPDATE id=id;

-- 5. Administrators Table (Admin Portal Access)
CREATE TABLE IF NOT EXISTS admins (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(100) UNIQUE NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'admin',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Seed Initial Super Admin
INSERT INTO admins (username, email, password_hash, role)
VALUES 
('taddeal', 'taddealmoges@gmail.com', '01010991Tad!@#', 'superadmin')
ON DUPLICATE KEY UPDATE password_hash='01010991Tad!@#', role='superadmin';

-- 6. Contact Us Inquiries Table
CREATE TABLE IF NOT EXISTS contacts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    email VARCHAR(150) NOT NULL,
    phone VARCHAR(50) DEFAULT '',
    subject VARCHAR(255) DEFAULT '',
    message TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


