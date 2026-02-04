// src/lib/smtpSender.ts
import nodemailer from "nodemailer";

type SendMailArgs = {
  to: string;
  subject: string;
  text: string;
  replyTo?: string;
};

function getSmtpTransport() {
  const host = process.env.SMTP_HOST!;
  const port = Number(process.env.SMTP_PORT || 465);
  const secure = (process.env.SMTP_SECURE || "true") === "true";
  const user = process.env.SMTP_USER!;
  const pass = process.env.SMTP_PASS!;

  if (!host || !user || !pass) {
    throw new Error("Missing SMTP env vars (SMTP_HOST/SMTP_USER/SMTP_PASS).");
  }

  return nodemailer.createTransport({
    host,
    port,
    secure,
    auth: { user, pass },
  });
}

export async function sendSMTP({ to, subject, text, replyTo }: SendMailArgs) {
  const from = process.env.MAIL_FROM || process.env.SMTP_USER!;
  const transport = getSmtpTransport();

  await transport.sendMail({
    from,
    to,
    subject,
    text,
    replyTo,
  });
}
