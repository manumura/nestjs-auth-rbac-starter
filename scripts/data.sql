INSERT INTO role(name, description) VALUES
('ADMIN', 'Role Admin'),
('USER', 'Role User');

-- pwd = 12345678
INSERT INTO `user`(`password`, `email`, `name`, `is_active`, `created_at`, `updated_at`, `role_id`) 
VALUES ('$2b$12$hr2oZlCgSzak1g6fx3OqJOcuVW4dcHYNO0Z6frMexrQGmaFEi9/06', 'admin@email.com', 'admin', 1, NOW(), NOW(), 1);
