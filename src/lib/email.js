import nodemailer from "nodemailer";

let transporter;

function getTransporter() {
  if (transporter) return transporter;

  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASSWORD;

  if (!user || !pass) return null;

  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || "smtp.gmail.com",
    port: Number(process.env.SMTP_PORT || 587),
    secure: process.env.SMTP_SECURE === "true",
    auth: { user, pass },
    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 20000,
  });

  return transporter;
}

function escapeHtml(value = "") {
  return String(value).replace(/[&<>\"']/g, (character) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '\"': "&quot;",
    "'": "&#39;",
  })[character]);
}

export async function sendEmail({ to, subject, text, html }) {
  const mailer = getTransporter();
  const from = process.env.EMAIL_FROM || process.env.SMTP_USER;

  if (!mailer || !from || !to || !subject || (!text && !html)) {
    console.warn(
      "TradeBridge email skipped: configure SMTP_USER, SMTP_PASSWORD, EMAIL_FROM and provide recipient/content."
    );
    return { success: false, reason: "EMAIL_NOT_CONFIGURED" };
  }

  try {
    await mailer.sendMail({
      from,
      to: Array.isArray(to) ? to.join(", ") : to,
      subject,
      ...(text ? { text } : {}),
      ...(html ? { html } : {}),
    });

    return { success: true };
  } catch (error) {
    console.error("TradeBridge Gmail SMTP delivery error:", error?.message || error);
    return { success: false, reason: "EMAIL_DELIVERY_ERROR" };
  }
}

export function emailLayout(title, content) {
  return `<!doctype html><html><body style="margin:0;background:#f8fafc;font-family:Arial,sans-serif;color:#0f172a"><div style="max-width:600px;margin:32px auto;background:#fff;border:1px solid #e2e8f0;border-radius:12px;overflow:hidden"><div style="padding:22px 28px;background:#0f172a;color:#fff;font-size:22px;font-weight:700">Trade<span style="color:#fbbf24">Bridge</span></div><div style="padding:28px"><h1 style="font-size:21px;margin:0 0 16px">${escapeHtml(title)}</h1>${content}<p style="margin-top:28px;color:#64748b;font-size:12px">This is an automated notification from TradeBridge.</p></div></div></body></html>`;
}

export function safeEmailText(value) {
  return escapeHtml(value);
}

export function getSiteUrl() {
  return (process.env.NEXT_PUBLIC_SITE_URL || process.env.BETTER_AUTH_URL || "").replace(/\/$/, "");
}
