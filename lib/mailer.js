import nodemailer from "nodemailer";

export function getMailConfig() {
  const host = process.env.SMTP_HOST?.trim();
  const username = process.env.SMTP_USER?.trim();
  const password = process.env.SMTP_PASSWORD;
  const from = process.env.MAIL_FROM?.trim();

  if (![host, username, password, from].some(Boolean)) return null;
  if (!host || !from) {
    throw new Error("SMTP_HOST and MAIL_FROM are required for email delivery.");
  }
  if (Boolean(username) !== Boolean(password)) {
    throw new Error("Set both SMTP_USER and SMTP_PASSWORD, or leave both blank.");
  }

  const port = Number(process.env.SMTP_PORT || 587);
  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error("SMTP_PORT must be a valid port number.");
  }

  const secureSetting = process.env.SMTP_SECURE;
  return {
    host,
    port,
    secure: secureSetting ? secureSetting.toLowerCase() === "true" : port === 465,
    from,
    ...(username ? { auth: { user: username, pass: password } } : {}),
  };
}

export function getAppOrigin() {
  const configuredOrigin =
    process.env.APP_URL ||
    (process.env.NODE_ENV === "production" ? "" : "http://localhost:3000");

  if (!configuredOrigin) {
    throw new Error("APP_URL must be configured for password-reset emails.");
  }

  let url;
  try {
    url = new URL(configuredOrigin);
  } catch {
    throw new Error("APP_URL must be a valid absolute URL.");
  }

  if (!["http:", "https:"].includes(url.protocol)) {
    throw new Error("APP_URL must use HTTP or HTTPS.");
  }
  if (process.env.NODE_ENV === "production" && url.protocol !== "https:") {
    throw new Error("APP_URL must use HTTPS in production.");
  }
  return url.origin;
}

export async function sendPasswordResetEmail({ to, link }, config) {
  const transporter = nodemailer.createTransport(config);
  await transporter.sendMail({
    from: config.from,
    to,
    subject: "Reset your Xavier Shelter Hub password",
    text: [
      "A password reset was requested for your Xavier Shelter Hub account.",
      "",
      `Use this link within 30 minutes to choose a new password: ${link}`,
      "",
      "If you did not request this, you can ignore this email.",
    ].join("\n"),
  });
}
