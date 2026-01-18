CREATE TABLE "photos" (
	"id" serial PRIMARY KEY NOT NULL,
	"species_id" integer,
	"filename" text NOT NULL,
	"thumbnail_filename" text NOT NULL,
	"upload_date" timestamp with time zone DEFAULT now() NOT NULL,
	"original_date_taken" timestamp with time zone,
	"date_taken_source" text DEFAULT 'exif' NOT NULL,
	"is_favorite" boolean DEFAULT false NOT NULL,
	"notes" text
);
--> statement-breakpoint
CREATE TABLE "species" (
	"id" serial PRIMARY KEY NOT NULL,
	"common_name" text NOT NULL,
	"scientific_name" text,
	"description" text,
	"rarity" text DEFAULT 'common' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "photos" ADD CONSTRAINT "photos_species_id_species_id_fk" FOREIGN KEY ("species_id") REFERENCES "public"."species"("id") ON DELETE cascade ON UPDATE no action;