backfill_event_range.sqlUPDATE "Lead"
SET
  "eventStartDate" = COALESCE("eventStartDate", "eventDate"),
  "eventEndDate"   = COALESCE("eventEndDate", "eventDate")
WHERE "eventDate" IS NOT NULL;

