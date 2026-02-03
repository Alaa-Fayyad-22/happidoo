// src/lib/faq.ts
export type FaqItem = {
  q: string;
  a: string; // keep as plain text (or you can switch to ReactNode later)
  tags?: string[];
};

export const FAQ: FaqItem[] = [
  {
    q: "How do I book an inflatable?",
    a: "Send a quote request from the website with your event date, location, and the inflatables you want. We’ll confirm availability and reply with the final price and details.",
    tags: ["booking"],
  },
  {
    q: "How long is the rental?",
    a: "Most rentals are for the day. If you need extra hours or an overnight rental, mention it in your request and we’ll confirm what’s possible.",
    tags: ["rental"],
  },
  {
    q: "Do you deliver and set up?",
    a: "Yes. We deliver, set up, and pick up. Setup includes securing the inflatable and testing it before we leave.",
    tags: ["delivery", "setup"],
  },
  {
    q: "What areas do you serve?",
    a: "We serve nearby cities and can often travel further for larger bookings. Send your city/address in the quote request and we’ll confirm.",
    tags: ["delivery"],
  },
  {
    q: "What do I need at the location?",
    a: "A flat area, enough space around the inflatable, and a power source. If power is far, tell us so we can plan extensions or alternatives.",
    tags: ["setup"],
  },
  {
    q: "Can inflatables be used indoors?",
    a: "Yes, as long as the ceiling height and floor space are enough and the surface is suitable. Share the indoor space details when requesting.",
    tags: ["setup"],
  },
  {
    q: "What if the weather is bad?",
    a: "Safety first. High winds and heavy rain can cancel a setup. If weather looks risky, we’ll coordinate with you ahead of time to reschedule.",
    tags: ["weather"],
  },
  {
    q: "How do payments work?",
    a: "We confirm the price after checking details. Payment method and any deposit requirements will be explained in the confirmation message.",
    tags: ["payment"],
  },
  {
    q: "Is there a security deposit?",
    a: "Sometimes, depending on the inflatable and event type. If needed, we’ll tell you clearly before the booking is confirmed.",
    tags: ["payment"],
  },
  {
    q: "Are the inflatables cleaned?",
    a: "Yes. We clean and sanitize between rentals as part of our standard process.",
    tags: ["safety"],
  },
];
