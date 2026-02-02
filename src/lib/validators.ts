import { z } from "zod";

const TIME_WINDOWS = ["Morning", "Afternoon", "Evening"] as const;

export const QuoteSchema = z
  .object({
    // Old field (optional now)
    productSlug: z.string().trim().min(1).optional().nullable(),

    // New field (optional but validated)
    productSlugs: z.array(z.string().trim().min(1)).optional().default([]),

    eventDate: z.string().trim().min(1, "Event date is required."),
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
