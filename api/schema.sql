-- ========================================================
-- Association Keskese Milash Netherlands - Database Schema
-- Complete MySQL Tables & Seed Data for Production
-- ========================================================

-- 1. News & Events Table (Announcements, Event flyers & Documents)
CREATE TABLE IF NOT EXISTS news (
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. Members Directory Table (Registrations & Applications)
CREATE TABLE IF NOT EXISTS members (
    id INT AUTO_INCREMENT PRIMARY KEY,
    member_id VARCHAR(50) UNIQUE NOT NULL,
    form_type VARCHAR(50) DEFAULT 'individual',
    name VARCHAR(150) NOT NULL,
    email VARCHAR(150) NOT NULL,
    phone VARCHAR(50) DEFAULT '',
    origin_village VARCHAR(150) DEFAULT '',
    address TEXT,
    message TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. Operating Expenses Table (Financial Outflows)
CREATE TABLE IF NOT EXISTS expenses (
    id INT AUTO_INCREMENT PRIMARY KEY,
    category VARCHAR(100) NOT NULL,
    description TEXT NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    vendor_name VARCHAR(150) DEFAULT '',
    expense_date DATE NOT NULL,
    receipt_reference VARCHAR(100) DEFAULT '',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. Member Dues & Event Payments Table (Financial Inflows)
CREATE TABLE IF NOT EXISTS member_dues (
    id INT AUTO_INCREMENT PRIMARY KEY,
    member_id VARCHAR(50) NOT NULL,
    member_name VARCHAR(150) NOT NULL,
    year INT NOT NULL,
    month VARCHAR(50) NOT NULL,
    payment_type VARCHAR(100) DEFAULT 'Membership Dues',
    billed_amount DECIMAL(10,2) DEFAULT 100.00,
    paid_amount DECIMAL(10,2) DEFAULT 0.00,
    remaining_amount DECIMAL(10,2) DEFAULT 0.00,
    payment_date DATE DEFAULT NULL,
    receipt_number VARCHAR(100) DEFAULT '',
    payer_name VARCHAR(150) DEFAULT '',
    accepted_by VARCHAR(100) DEFAULT '',
    status VARCHAR(50) DEFAULT 'Pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Seed Initial Super Admin
INSERT INTO admins (username, email, password_hash, role)
VALUES 
('kesekesemlash', 'kesekesemlash@gmail.com', 'Luul10.20', 'superadmin')
ON DUPLICATE KEY UPDATE password_hash='Luul10.20', role='superadmin';

-- 6. Contact Us Inquiries Table
CREATE TABLE IF NOT EXISTS contacts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    email VARCHAR(150) NOT NULL,
    phone VARCHAR(50) DEFAULT '',
    subject VARCHAR(255) DEFAULT '',
    message TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 7. Organization Structure & Leadership Directory
CREATE TABLE IF NOT EXISTS leadership (
    id INT AUTO_INCREMENT PRIMARY KEY,
    term VARCHAR(50) NOT NULL,
    category VARCHAR(100) NOT NULL,
    name VARCHAR(150) NOT NULL,
    role_title VARCHAR(150) DEFAULT '',
    phone VARCHAR(50) DEFAULT '',
    email VARCHAR(150) DEFAULT '',
    display_order INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Seed Sample Leaders
INSERT INTO leadership (term, category, name, role_title)
VALUES 
('2026-2028', 'Parliament Leaders', 'Sened Luul', 'Parliament Leader'),
('2026-2028', 'Executive Leaders', 'Dawit Luu', 'Executive Leader')
ON DUPLICATE KEY UPDATE name=name;

-- 8. Meetings Planning & Reports Table
CREATE TABLE IF NOT EXISTS meetings (
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 9. System & Contact Settings Table
CREATE TABLE IF NOT EXISTS settings (
    setting_key VARCHAR(100) PRIMARY KEY,
    setting_value TEXT,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO settings (setting_key, setting_value) VALUES 
('phone', '+31 6 86445539'),
('email', 'info@keskesemilash.org'),
('address', 'Association Keskese Milash Netherlands')
ON DUPLICATE KEY UPDATE setting_key=setting_key;
