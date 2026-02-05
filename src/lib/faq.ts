// src/lib/faq.ts
export type FaqItem = {
  q: string;
  a: string; // keep as plain text (or you can switch to ReactNode later)
  tags?: string[];
};

export const FAQ: FaqItem[] = [
  {
    q: "How do I book an inflatable game??",
    a: "A: You can book by sending us a message on WhatsApp or by submitting a quote request through our website. Please include your event date, location, and the inflatable games you’re interested in. We’ll confirm availability and reply with pricing and details.ion, and the inflatables you want. We’ll confirm availability and reply with the final price and details.",
    tags: ["booking"],
    
  },
  {
    q: "How long is the rental?",
    a: "Our pricing is based on a one-day rental. If you need the inflatable for more than one day, please inform us in advance so we can prepare a quotation accordingly..",
    tags: ["rental", "pricing"],
    
  },
  {
    q: " Do you deliver and set up the inflatables?",
    a: "Yes, we handle delivery, setup, and pick-up. Our setup includes securely anchoring the inflatable and testing it to ensure it’s ready for safe use before we leave.",
    tags: ["delivery", "setup"],
    
  },
  {
    q: "What areas do you serve?",
    a: "We serve all areas across Lebanon. Simply include your location in your quote request, and we’ll confirm availability.",
    tags: ["coverage", "locations"],
    
  },
  {
    q: "What do I need to provide at the location",
    a: "You’ll need a flat area with enough space around the inflatable and access to a power source",
    tags: ["requirements", "power"],

  },
  {
    q: "Can inflatables be used indoors?",
    a: "Yes, as long as the ceiling height and floor space are enough and the surface is suitable. Share the indoor space details when requesting",
    tags: ["indoor", "requirements"],
    
  },
  {
    q: "What if the weather is bad?",
    a: "Safety first! High winds and heavy rain can cancel a setup. If weather looks risky, we’ll coordinate with you ahead of time to reschedule.",
    tags: ["safety", "weather"],

  },
  {
    q: "How do payments work?",
    a: "Payment details are outlined in our Terms and Conditions on the website. Please review them for information on deposits, payment methods, and deadlines.",
    tags: ["payments", "terms"],
  },
  {
    q: "Are the inflatables cleaned?",
    a: "Yes, we clean and sanitize the inflatables after setup as part of our standard process.",
    tags: ["cleaning", "hygiene"],
    
  },
  {
    q: "How many children can use an inflatable at once?",
    a: "The number of children depends on the inflatable. We’ll provide the recommended capacity when you request a quote",
    tags: ["capacity", "safety"],
    
  },
  {
    q: "How long does setup and takedown take?",
    a: "Setup and takedown times vary depending on the number and size of inflatables. We’ll provide an estimate when confirming your booking",
    tags: ["setup", "logistics"],
    
  },
  {
    q: "Can I cancel or reschedule my booking?",
    a: "Please refer to our Terms and Conditions for information on cancellations and rescheduling.",
    tags: ["cancellation", "policies"],
  },
  {
    q: "Is adult supervision required?",
    a: "Adult supervision is recommended to ensure safety. Adults should stay off the inflatable, as their weight reduces the maximum number of children that can use it at once",
    tags: ["safety", "supervision"],
  } ,
  {
    q: "Is there anyone to stay with the inflatables during the event?",
    a: "Having someone on-site is optional. You can choose to supervise the inflatables yourself or request our staff for assistance",
    tags: ["safety", "staff"],
  } 
];


