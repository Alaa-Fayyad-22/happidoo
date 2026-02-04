import nodemailer from "nodemailer";

const host = process.env.SMTP_HOST!;
const port = Number(process.env.SMTP_PORT || 465);
const secure = (process.env.SMTP_SECURE || "true") === "true";
const user = process.env.SMTP_USER!;
const pass = process.env.SMTP_PASS!;

export const mailFrom = process.env.MAIL_FROM || user;

export function getTransport() {
  if (!host || !user || !pass) {
    throw new Error("SMTP env vars missing (SMTP_HOST/SMTP_USER/SMTP_PASS).");
  }

  return nodemailer.createTransport({
    host,
    port,
    secure,
    auth: { user, pass },
  });
}
