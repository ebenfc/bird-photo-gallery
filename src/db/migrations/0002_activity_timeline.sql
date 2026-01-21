CREATE TABLE "haikubox_activity_log" (
	"id" serial PRIMARY KEY NOT NULL,
	"species_common_name" text NOT NULL,
	"species_id" integer,
	"detected_at" timestamp with time zone NOT NULL,
	"hour_of_day" integer NOT NULL,
	"day_of_week" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "haikubox_activity_log" ADD CONSTRAINT "haikubox_activity_log_species_id_species_id_fk" FOREIGN KEY ("species_id") REFERENCES "public"."species"("id") ON DELETE set null ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "haikubox_activity_log" ADD CONSTRAINT "haikubox_activity_log_species_common_name_detected_at_unique" UNIQUE("species_common_name","detected_at");
--> statement-breakpoint
CREATE INDEX "activity_species_hour_idx" ON "haikubox_activity_log" USING btree ("species_common_name","hour_of_day");
--> statement-breakpoint
CREATE INDEX "activity_detected_at_idx" ON "haikubox_activity_log" USING btree ("detected_at");
