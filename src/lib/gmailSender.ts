import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY!);

export async function sendGmail(opts: {
  to: string;
  subject: string;
  text: string;
  replyTo?: string;
}) {
  const from = process.env.RESEND_FROM!;

  console.log("RESEND FROM:", from);
  console.log("RESEND TO:", opts.to);

  if (!process.env.RESEND_API_KEY) {
    throw new Error("Missing RESEND_API_KEY");
  }
  if (!from) {
    throw new Error("Missing RESEND_FROM");
  }
  if (!opts.to) {
    throw new Error("Missing 'to'");
  }

  try {
    const { data, error } = await resend.emails.send({
      from,
      to: opts.to,
      subject: opts.subject,
      text: opts.text,
      replyTo: opts.replyTo ? [opts.replyTo] : undefined,
    });

    if (error) {
      console.error("RESEND SEND ERROR:", error);
      throw new Error(error.message);
    }

    console.log("RESEND SENT OK:", data?.id);
    return data;
  } catch (err: any) {
    const details = err?.message || err;
    console.error("RESEND UNEXPECTED ERROR:", details);
    throw err;
  }
}
