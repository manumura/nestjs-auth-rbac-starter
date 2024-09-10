INSERT INTO oauth_provider(name)
VALUES
('GOOGLE'),
('FACEBOOK');

INSERT INTO role(name, description)
VALUES
('ADMIN', 'Role Admin'),
('USER', 'Role User');

-- pwd = 12345678
INSERT INTO public."user"
("password", email, "name", is_active, is_email_verified, created_at, updated_at, role_id)
VALUES
('$2b$12$hr2oZlCgSzak1g6fx3OqJOcuVW4dcHYNO0Z6frMexrQGmaFEi9/06', 'admin@email.com', 'admin', true, true, NOW(), NOW(), 1),
('$2b$12$hr2oZlCgSzak1g6fx3OqJOcuVW4dcHYNO0Z6frMexrQGmaFEi9/06', 'emmanuel.mura@gmail.com', 'manolo', true, true, NOW(), NOW(), 1);
