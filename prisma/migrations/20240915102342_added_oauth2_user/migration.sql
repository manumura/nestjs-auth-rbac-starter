/*
  Warnings:

  - You are about to drop the column `email` on the `user` table. All the data in the column will be lost.
  - You are about to drop the column `password` on the `user` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "IDX_user_email";

-- AlterTable
ALTER TABLE "user" DROP COLUMN "email",
DROP COLUMN "password",
ALTER COLUMN "is_active" SET DEFAULT true;

-- CreateTable
CREATE TABLE "verify_email_token" (
    "user_id" INTEGER NOT NULL,
    "token" VARCHAR(50) NOT NULL,
    "expired_at" TIMESTAMP(0) NOT NULL,
    "created_at" TIMESTAMP(0) NOT NULL,
    "updated_at" TIMESTAMP(0),

    CONSTRAINT "verify_email_token_pkey" PRIMARY KEY ("user_id")
);

-- CreateTable
CREATE TABLE "oauth_provider" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(255) NOT NULL,

    CONSTRAINT "oauth_provider_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "oauth_user" (
    "oauth_provider_id" INTEGER NOT NULL,
    "user_id" INTEGER NOT NULL,
    "external_user_id" VARCHAR(255) NOT NULL,
    "email" VARCHAR(255),

    CONSTRAINT "oauth_user_pkey" PRIMARY KEY ("oauth_provider_id","user_id")
);

-- CreateTable
CREATE TABLE "user_credentials" (
    "user_id" INTEGER NOT NULL,
    "password" VARCHAR(255) NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "is_email_verified" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "user_credentials_pkey" PRIMARY KEY ("user_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "REL_verify_email_token_user_id" ON "verify_email_token"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "IDX_verify_email_token_token" ON "verify_email_token"("token");

-- CreateIndex
CREATE UNIQUE INDEX "IDX_oauth_provider_name" ON "oauth_provider"("name");

-- CreateIndex
CREATE UNIQUE INDEX "oauth_user_external_user_id_oauth_provider_id_key" ON "oauth_user"("external_user_id", "oauth_provider_id");

-- CreateIndex
CREATE UNIQUE INDEX "oauth_user_email_oauth_provider_id_key" ON "oauth_user"("email", "oauth_provider_id");

-- CreateIndex
CREATE UNIQUE INDEX "REL_user_credentials_user_id" ON "user_credentials"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "IDX_user_email" ON "user_credentials"("email");

-- AddForeignKey
ALTER TABLE "verify_email_token" ADD CONSTRAINT "FK_verify_email_token_user_id_user_id" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "oauth_user" ADD CONSTRAINT "oauth_user_oauth_provider_id_fkey" FOREIGN KEY ("oauth_provider_id") REFERENCES "oauth_provider"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "oauth_user" ADD CONSTRAINT "oauth_user_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_credentials" ADD CONSTRAINT "FK_user_credentials_user_id_user_id" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
