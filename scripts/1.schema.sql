-- public.oauth_provider definition

-- Drop table

-- DROP TABLE public.oauth_provider;

CREATE TABLE public.oauth_provider (
	id serial4 NOT NULL,
	"name" varchar(255) NOT NULL,
	CONSTRAINT oauth_provider_pkey PRIMARY KEY (id)
);
CREATE UNIQUE INDEX "IDX_oauth_provider_name" ON public.oauth_provider USING btree (name);


-- public."role" definition

-- Drop table

-- DROP TABLE public."role";

CREATE TABLE public."role" (
	id serial4 NOT NULL,
	"name" varchar(255) NOT NULL,
	description varchar(255) NOT NULL,
	CONSTRAINT role_pkey PRIMARY KEY (id)
);
CREATE UNIQUE INDEX "IDX_role_name" ON public.role USING btree (name);


-- public."user" definition

-- Drop table

-- DROP TABLE public."user";

CREATE TABLE public."user" (
	id serial4 NOT NULL,
	"uuid" uuid DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(100) NULL,
	is_active bool DEFAULT true NOT NULL,
	image_id varchar(255) NULL,
	image_url varchar(255) NULL,
	created_at timestamp(0) NOT NULL,
	updated_at timestamp(0) NULL,
	role_id int4 NOT NULL,
	CONSTRAINT user_pkey PRIMARY KEY (id),
	CONSTRAINT "FK_user_role_id_role_id" FOREIGN KEY (role_id) REFERENCES public."role"(id) ON DELETE RESTRICT ON UPDATE CASCADE
);
CREATE INDEX "AK_user_role_id" ON public."user" USING btree (role_id);
CREATE UNIQUE INDEX "IDX_user_uuid" ON public."user" USING btree (uuid);


-- public.user_credentials definition

-- Drop table

-- DROP TABLE public.user_credentials;

CREATE TABLE public.user_credentials (
	user_id int4 NOT NULL,
	"password" varchar(255) NOT NULL,
	email varchar(255) NOT NULL,
	is_email_verified bool DEFAULT false NOT NULL,
	CONSTRAINT user_credentials_pkey PRIMARY KEY (user_id),
	CONSTRAINT "FK_user_credentials_user_id_user_id" FOREIGN KEY (user_id) REFERENCES public."user"(id) ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE UNIQUE INDEX "IDX_user_email" ON public.user_credentials USING btree (email);
CREATE UNIQUE INDEX "REL_user_credentials_user_id" ON public.user_credentials USING btree (user_id);


-- public.verify_email_token definition

-- Drop table

-- DROP TABLE public.verify_email_token;

CREATE TABLE public.verify_email_token (
	user_id int4 NOT NULL,
	"token" varchar(50) NOT NULL,
	expired_at timestamp(0) NOT NULL,
	created_at timestamp(0) NOT NULL,
	updated_at timestamp(0) NULL,
	CONSTRAINT verify_email_token_pkey PRIMARY KEY (user_id),
	CONSTRAINT "FK_verify_email_token_user_id_user_id" FOREIGN KEY (user_id) REFERENCES public."user"(id) ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE UNIQUE INDEX "IDX_verify_email_token_token" ON public.verify_email_token USING btree (token);
CREATE UNIQUE INDEX "REL_verify_email_token_user_id" ON public.verify_email_token USING btree (user_id);


-- public.authentication_token definition

-- Drop table

-- DROP TABLE public.authentication_token;

CREATE TABLE public.authentication_token (
	user_id int4 NOT NULL,
	access_token varchar(255) NOT NULL,
	access_token_expire_at timestamp(0) NOT NULL,
	refresh_token varchar(255) NOT NULL,
	refresh_token_expire_at timestamp(0) NOT NULL,
	created_at timestamp(0) NOT NULL,
	CONSTRAINT authentication_token_pkey PRIMARY KEY (user_id),
	CONSTRAINT "FK_authentication_token_user_id_user_id" FOREIGN KEY (user_id) REFERENCES public."user"(id) ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE UNIQUE INDEX "IDX_authentication_token_access_token" ON public.authentication_token USING btree (access_token);
CREATE UNIQUE INDEX "IDX_authentication_token_refresh_token" ON public.authentication_token USING btree (refresh_token);
CREATE UNIQUE INDEX "REL_authentication_token_user_id" ON public.authentication_token USING btree (user_id);


-- public.oauth_user definition

-- Drop table

-- DROP TABLE public.oauth_user;

CREATE TABLE public.oauth_user (
	oauth_provider_id int4 NOT NULL,
	user_id int4 NOT NULL,
	external_user_id varchar(255) NOT NULL,
	email varchar(255) NULL,
	CONSTRAINT oauth_user_pkey PRIMARY KEY (oauth_provider_id, user_id),
	CONSTRAINT oauth_user_oauth_provider_id_fkey FOREIGN KEY (oauth_provider_id) REFERENCES public.oauth_provider(id) ON DELETE CASCADE ON UPDATE CASCADE,
	CONSTRAINT oauth_user_user_id_fkey FOREIGN KEY (user_id) REFERENCES public."user"(id) ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE UNIQUE INDEX oauth_user_email_oauth_provider_id_key ON public.oauth_user USING btree (email, oauth_provider_id);
CREATE UNIQUE INDEX oauth_user_external_user_id_oauth_provider_id_key ON public.oauth_user USING btree (external_user_id, oauth_provider_id);


-- public.reset_password_token definition

-- Drop table

-- DROP TABLE public.reset_password_token;

CREATE TABLE public.reset_password_token (
	user_id int4 NOT NULL,
	"token" varchar(50) NOT NULL,
	expired_at timestamp(0) NOT NULL,
	created_at timestamp(0) NOT NULL,
	updated_at timestamp(0) NULL,
	CONSTRAINT reset_password_token_pkey PRIMARY KEY (user_id),
	CONSTRAINT "FK_reset_password_token_user_id_user_id" FOREIGN KEY (user_id) REFERENCES public."user"(id) ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE UNIQUE INDEX "IDX_reset_password_token_token" ON public.reset_password_token USING btree (token);
CREATE UNIQUE INDEX "REL_reset_password_token_user_id" ON public.reset_password_token USING btree (user_id);
