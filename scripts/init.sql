CREATE DATABASE demo-auth-rbac CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci;

GRANT ALL PRIVILEGES ON *.* TO 'mysqluser'@'%';
FLUSH PRIVILEGES;
