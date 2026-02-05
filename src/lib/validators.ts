// src/lib/validators.ts
import { z } from "zod";

const TIME_WINDOWS = ["Morning", "Afternoon", "Evening"] as const;

function isYmd(s: string) {
  // Strict YYYY-MM-DD
  if (!/^\d{4}-\d{2}-\d{2}$/.test(s)) return false;
  const [y, m, d] = s.split("-").map(Number);
  if (!y || !m || !d) return false;
  if (m < 1 || m > 12) return false;
  if (d < 1 || d > 31) return false;
  // Simple check is fine here since we compare lexicographically too
  return true;
}

export const QuoteSchema = z
  .object({
    // Old field (optional now)
    productSlug: z.string().trim().min(1).optional().nullable(),

    // New field (optional but validated)
    productSlugs: z.array(z.string().trim().min(1)).optional().default([]),

    eventStartDate: z.string().trim().min(1, "Start date is required."),
    eventEndDate: z.string().trim().min(1, "End date is required."),

    timeWindow: z.enum(TIME_WINDOWS),
    city: z.string().trim().min(1, "City is required."),
    address: z.string().trim().min(1, "Address is required."),
    name: z.string().trim().min(1, "Name is required."),

    // keep as strings (empty allowed, we enforce rule below)
    phone: z.string().trim().optional().default(""),
    email: z.string().trim().optional().default(""),

    notes: z.string().optional().default(""),
    website: z.string().optional().default(""),
  })
  .superRefine((data, ctx) => {
    // Validate date format
    if (data.eventStartDate && !isYmd(data.eventStartDate)) {
      ctx.addIssue({
        code: "custom",
        path: ["eventStartDate"],
        message: "Start date must be in YYYY-MM-DD format.",
      });
    }
    if (data.eventEndDate && !isYmd(data.eventEndDate)) {
      ctx.addIssue({
        code: "custom",
        path: ["eventEndDate"],
        message: "End date must be in YYYY-MM-DD format.",
      });
    }

    // Rule: end >= start (lexicographic works for YYYY-MM-DD)
    if (data.eventStartDate && data.eventEndDate && data.eventEndDate < data.eventStartDate) {
      ctx.addIssue({
        code: "custom",
        path: ["eventEndDate"],
        message: "End date must be on or after start date.",
      });
    }

    // Rule: at least one contact method
    const hasPhone = (data.phone ?? "").trim().length > 0;
    const hasEmail = (data.email ?? "").trim().length > 0;
    if (!hasPhone && !hasEmail) {
      ctx.addIssue({
        code: "custom",
        path: ["phone"],
        message: "Please provide at least a phone number or an email address.",
      });
    }

    // Rule: at least one product selected
    const slugs = (data.productSlugs ?? []).filter((s) => s.trim().length > 0);
    const single = (data.productSlug ?? "").trim();

    if (slugs.length === 0 && !single) {
      ctx.addIssue({
        code: "custom",
        path: ["productSlugs"],
        message: "Please select at least one product.",
      });
    }
  });

export type QuoteInput = z.infer<typeof QuoteSchema>;
