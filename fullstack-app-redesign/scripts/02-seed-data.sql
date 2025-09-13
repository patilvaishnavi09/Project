-- Insert admin user (password: admin123)
INSERT OR IGNORE INTO users (username, email, password_hash, role) VALUES 
('admin', 'admin@example.com', '$2b$10$rOzJqQqQqQqQqQqQqQqQqOzJqQqQqQqQqQqQqQqQqOzJqQqQqQqQqQ', 'admin');

-- Insert sample users (password: user123)
INSERT OR IGNORE INTO users (username, email, password_hash, role) VALUES 
('john_doe', 'john@example.com', '$2b$10$rOzJqQqQqQqQqQqQqQqQqOzJqQqQqQqQqQqQqQqQqOzJqQqQqQqQqQ', 'user'),
('jane_smith', 'jane@example.com', '$2b$10$rOzJqQqQqQqQqQqQqQqQqOzJqQqQqQqQqQqQqQqQqOzJqQqQqQqQqQ', 'user');

-- Insert store owners (password: owner123)
INSERT OR IGNORE INTO users (username, email, password_hash, role) VALUES 
('store_owner1', 'owner1@example.com', '$2b$10$rOzJqQqQqQqQqQqQqQqQqOzJqQqQqQqQqQqQqQqQqOzJqQqQqQqQqQ', 'store_owner'),
('store_owner2', 'owner2@example.com', '$2b$10$rOzJqQqQqQqQqQqQqQqQqOzJqQqQqQqQqQqQqQqQqOzJqQqQqQqQqQ', 'store_owner');

-- Insert sample stores
INSERT OR IGNORE INTO stores (name, description, owner_id, location, phone, email) VALUES 
('Tech Paradise', 'Your one-stop shop for all tech gadgets', 4, '123 Tech Street, Silicon Valley', '+1-555-0123', 'info@techparadise.com'),
('Green Grocers', 'Fresh organic produce and groceries', 5, '456 Green Avenue, Downtown', '+1-555-0456', 'hello@greengrocers.com');

-- Insert sample ratings
INSERT OR IGNORE INTO ratings (store_id, user_id, rating, comment) VALUES 
(1, 2, 5, 'Excellent service and great products!'),
(1, 3, 4, 'Good selection, but a bit pricey'),
(2, 2, 5, 'Fresh vegetables and friendly staff'),
(2, 3, 4, 'Great quality organic produce');
