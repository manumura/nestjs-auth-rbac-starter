DROP TABLE IF EXISTS public."reset_password_token";
DROP TABLE IF EXISTS public."authentication_token";
DROP TABLE IF EXISTS public."user";
DROP TABLE IF EXISTS public."role";

CREATE TABLE public."role" (
	"id" serial4 NOT NULL,
	"name" varchar(255) NOT NULL,
	"description" varchar(255) NOT NULL,
	CONSTRAINT "role_pkey" PRIMARY KEY (id)
);
CREATE UNIQUE INDEX "IDX_role_name" ON public.role (name);

CREATE TABLE public."user" (
	"id" serial4 NOT NULL,
	"password" varchar(255) NOT NULL,
	"email" varchar(255) NOT NULL,
	"name" varchar(100) NULL,
	"is_active" bool NOT NULL,
	"image_id" varchar(255) NULL,
  	"image_url" varchar(255) NULL,
	"created_at" timestamp(0) NOT NULL,
	"updated_at" timestamp(0) NULL,
	"role_id" int4 NOT NULL,
	CONSTRAINT "user_pkey" PRIMARY KEY (id)
);
CREATE INDEX "AK_user_role_id" ON public."user" USING btree (role_id);
CREATE UNIQUE INDEX "IDX_user_email" ON public."user" USING btree (email);

ALTER TABLE public."user" ADD CONSTRAINT "FK_user_role_id_role_id" FOREIGN KEY (role_id) REFERENCES public."role"(id) ON DELETE SET NULL ON UPDATE CASCADE;

CREATE TABLE public."authentication_token" (
	"user_id" int4 NOT NULL,
	"access_token" varchar(255) NOT NULL,
	"access_token_expire_at" timestamp(0) NOT NULL,
	"refresh_token" varchar(255) NOT NULL,
	"refresh_token_expire_at" timestamp(0) NOT NULL,
	"created_at" timestamp(0) NOT NULL,
	CONSTRAINT "authentication_token_pkey" PRIMARY KEY (user_id)
);
CREATE UNIQUE INDEX "IDX_authentication_token_access_token" ON public.authentication_token (access_token);
CREATE UNIQUE INDEX "IDX_authentication_token_refresh_token" ON public.authentication_token (refresh_token);
CREATE UNIQUE INDEX "REL_authentication_token_user_id" ON public.authentication_token (user_id);

ALTER TABLE public."authentication_token" ADD CONSTRAINT "FK_authentication_token_user_id_user_id" FOREIGN KEY (user_id) REFERENCES public."user"(id) ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE public."reset_password_token" (
	"user_id" int4 NOT NULL,
	"token" varchar(50) NOT NULL,
	"expired_at" timestamp(0) NOT NULL,
	"created_at" timestamp(0) NOT NULL,
	"updated_at" timestamp(0) NULL,
	CONSTRAINT "reset_password_token_pkey" PRIMARY KEY (user_id)
);
CREATE UNIQUE INDEX "IDX_reset_password_token_token" ON public.reset_password_token (token);
CREATE UNIQUE INDEX "REL_reset_password_token_user_id" ON public.reset_password_token (user_id);

ALTER TABLE public."reset_password_token" ADD CONSTRAINT "FK_reset_password_token_user_id_user_id" FOREIGN KEY (user_id) REFERENCES public."user"(id) ON DELETE CASCADE ON UPDATE CASCADE;
