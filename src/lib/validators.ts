import { z } from "zod";

export const QuoteSchema = z.object({
  productSlug: z.string().trim().min(1).nullable().optional(),
  eventDate: z.string().trim().min(1),     // keep string; we validate format lightly
  timeWindow: z.enum(["Morning", "Afternoon", "Evening"]),
  city: z.string().trim().min(2),
  address: z.string().trim().min(5),
  name: z.string().trim().min(2),
  phone: z.string().trim().min(6),
  email: z.string().trim().email(),
  notes: z.string().trim().max(2000).optional().default(""),
  website: z.string().optional().default(""), // honeypot
});

export type QuoteInput = z.infer<typeof QuoteSchema>;
