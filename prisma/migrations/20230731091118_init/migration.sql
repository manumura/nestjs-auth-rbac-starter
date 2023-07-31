-- CreateTable
CREATE TABLE "authentication_token" (
    "user_id" INTEGER NOT NULL,
    "access_token" VARCHAR(255) NOT NULL,
    "access_token_expire_at" TIMESTAMP(0) NOT NULL,
    "refresh_token" VARCHAR(255) NOT NULL,
    "refresh_token_expire_at" TIMESTAMP(0) NOT NULL,
    "created_at" TIMESTAMP(0) NOT NULL,

    CONSTRAINT "authentication_token_pkey" PRIMARY KEY ("user_id")
);

-- CreateTable
CREATE TABLE "reset_password_token" (
    "user_id" INTEGER NOT NULL,
    "token" VARCHAR(50) NOT NULL,
    "expired_at" TIMESTAMP(0) NOT NULL,
    "created_at" TIMESTAMP(0) NOT NULL,
    "updated_at" TIMESTAMP(0),

    CONSTRAINT "reset_password_token_pkey" PRIMARY KEY ("user_id")
);

-- CreateTable
CREATE TABLE "role" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "description" VARCHAR(255) NOT NULL,

    CONSTRAINT "role_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user" (
    "id" SERIAL NOT NULL,
    "password" VARCHAR(255) NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "name" VARCHAR(100),
    "is_active" BOOLEAN NOT NULL,
    "image_id" VARCHAR(255),
    "image_url" VARCHAR(255),
    "created_at" TIMESTAMP(0) NOT NULL,
    "updated_at" TIMESTAMP(0),
    "role_id" INTEGER NOT NULL,

    CONSTRAINT "user_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "REL_authentication_token_user_id" ON "authentication_token"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "IDX_authentication_token_access_token" ON "authentication_token"("access_token");

-- CreateIndex
CREATE UNIQUE INDEX "IDX_authentication_token_refresh_token" ON "authentication_token"("refresh_token");

-- CreateIndex
CREATE UNIQUE INDEX "REL_reset_password_token_user_id" ON "reset_password_token"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "IDX_reset_password_token_token" ON "reset_password_token"("token");

-- CreateIndex
CREATE UNIQUE INDEX "IDX_role_name" ON "role"("name");

-- CreateIndex
CREATE UNIQUE INDEX "IDX_user_email" ON "user"("email");

-- CreateIndex
CREATE INDEX "AK_user_role_id" ON "user"("role_id");

-- AddForeignKey
ALTER TABLE "authentication_token" ADD CONSTRAINT "FK_authentication_token_user_id_user_id" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reset_password_token" ADD CONSTRAINT "FK_reset_password_token_user_id_user_id" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user" ADD CONSTRAINT "FK_user_role_id_role_id" FOREIGN KEY ("role_id") REFERENCES "role"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
