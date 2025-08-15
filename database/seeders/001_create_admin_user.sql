- Create admin user if it doesn't exist
INSERT OR IGNORE INTO users (name, email, phonenumber, password_hash, role)
VALUES (
    'Admin',
    'admin@shree-dattagu.com',
    '1234567890',
    -- Default password: admin123
    '$2b$10$5QxZv.hp2yHHH8nqZAXkqOYXB2JgH8fHvNHJYFOxSzN3rWGRiFIZK',
    'admin'
);
