CREATE TABLE "haikubox_detections" (
	"id" serial PRIMARY KEY NOT NULL,
	"species_common_name" text NOT NULL,
	"species_id" integer,
	"yearly_count" integer DEFAULT 0 NOT NULL,
	"last_heard_at" timestamp with time zone,
	"data_year" integer NOT NULL,
	"synced_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "haikubox_sync_log" (
	"id" serial PRIMARY KEY NOT NULL,
	"sync_type" text NOT NULL,
	"status" text NOT NULL,
	"records_processed" integer DEFAULT 0,
	"error_message" text,
	"synced_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "haikubox_detections" ADD CONSTRAINT "haikubox_detections_species_id_species_id_fk" FOREIGN KEY ("species_id") REFERENCES "public"."species"("id") ON DELETE set null ON UPDATE no action;