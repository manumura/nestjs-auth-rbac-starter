INSERT INTO oauth_provider(name)
VALUES
('GOOGLE'),
('FACEBOOK');

INSERT INTO role(name, description)
VALUES
('ADMIN', 'Role Admin'),
('USER', 'Role User');

INSERT INTO "user"
(uuid, "name", is_active, created_at, updated_at, role_id)
VALUES
('9153ec44-6052-4bcd-80d8-7462cffe99fb', 'admin', true, NOW(), NOW(), 1),
('816e0d9e-9cfe-4191-9d3b-58f27c28d3d7', 'manolo', true, NOW(), NOW(), 1);

-- pwd = 12345678
INSERT INTO "user_credentials"
("user_id", "password", email, is_email_verified)
SELECT id, '$2b$12$hr2oZlCgSzak1g6fx3OqJOcuVW4dcHYNO0Z6frMexrQGmaFEi9/06', 'admin@email.com', 1 FROM "user" WHERE "uuid" = '9153ec44-6052-4bcd-80d8-7462cffe99fb';

INSERT INTO "user_credentials"
("user_id", "password", email, is_email_verified)
SELECT id, '$2b$12$hr2oZlCgSzak1g6fx3OqJOcuVW4dcHYNO0Z6frMexrQGmaFEi9/06', 'emmanuel.mura@gmail.com', 1 FROM "user" WHERE "uuid" = '816e0d9e-9cfe-4191-9d3b-58f27c28d3d7';