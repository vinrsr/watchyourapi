CREATE TYPE "public"."alert_channel_type" AS ENUM('email', 'slack');--> statement-breakpoint
CREATE TYPE "public"."check_result" AS ENUM('success', 'timeout', 'error');--> statement-breakpoint
CREATE TYPE "public"."monitor_method" AS ENUM('GET', 'POST', 'HEAD');--> statement-breakpoint
CREATE TYPE "public"."monitor_status" AS ENUM('active', 'paused', 'down');--> statement-breakpoint
CREATE TABLE "alert_channels" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"type" "alert_channel_type" NOT NULL,
	"name" text NOT NULL,
	"config" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "checks" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"monitor_id" uuid NOT NULL,
	"status_code" integer,
	"response_time_ms" integer,
	"result" "check_result" NOT NULL,
	"error_message" text,
	"checked_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "incidents" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"monitor_id" uuid NOT NULL,
	"started_at" timestamp DEFAULT now(),
	"resolved_at" timestamp,
	"duration_seconds" integer,
	"cause" text
);
--> statement-breakpoint
CREATE TABLE "monitor_alert_channels" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"monitor_id" uuid NOT NULL,
	"alert_channel_id" uuid NOT NULL,
	CONSTRAINT "monitor_alert_channels_monitor_id_alert_channel_id_unique" UNIQUE("monitor_id","alert_channel_id")
);
--> statement-breakpoint
CREATE TABLE "monitors" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"name" text NOT NULL,
	"url" text NOT NULL,
	"method" "monitor_method" DEFAULT 'GET' NOT NULL,
	"interval_seconds" integer DEFAULT 60 NOT NULL,
	"timeout_seconds" integer DEFAULT 30 NOT NULL,
	"status" "monitor_status" DEFAULT 'active' NOT NULL,
	"last_checked_at" timestamp,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "refresh_tokens" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"token" text NOT NULL,
	"expires_at" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "refresh_tokens_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" text NOT NULL,
	"password_hash" text NOT NULL,
	"name" text NOT NULL,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "alert_channels" ADD CONSTRAINT "alert_channels_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "checks" ADD CONSTRAINT "checks_monitor_id_monitors_id_fk" FOREIGN KEY ("monitor_id") REFERENCES "public"."monitors"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "incidents" ADD CONSTRAINT "incidents_monitor_id_monitors_id_fk" FOREIGN KEY ("monitor_id") REFERENCES "public"."monitors"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "monitor_alert_channels" ADD CONSTRAINT "monitor_alert_channels_monitor_id_monitors_id_fk" FOREIGN KEY ("monitor_id") REFERENCES "public"."monitors"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "monitor_alert_channels" ADD CONSTRAINT "monitor_alert_channels_alert_channel_id_alert_channels_id_fk" FOREIGN KEY ("alert_channel_id") REFERENCES "public"."alert_channels"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "monitors" ADD CONSTRAINT "monitors_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "refresh_tokens" ADD CONSTRAINT "refresh_tokens_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;