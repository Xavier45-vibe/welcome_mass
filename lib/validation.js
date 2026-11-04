export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export const normalizeEmail = (v) => String(v || "").trim().toLowerCase();

export function passwordIssues(pw) {
  const issues = [];
  if (pw.length < 8) issues.push("at least 8 characters");
  if (!/[a-z]/.test(pw)) issues.push("a lowercase letter");
  if (!/[A-Z]/.test(pw)) issues.push("an uppercase letter");
  if (!/\d/.test(pw)) issues.push("a number");
  return issues;
}

export function passwordScore(pw) {
  let s = 0;
  if (pw.length >= 8) s++;
  if (pw.length >= 12) s++;
  if (/[a-z]/.test(pw) && /[A-Z]/.test(pw)) s++;
  if (/\d/.test(pw) && /[^A-Za-z0-9]/.test(pw)) s++;
  return s; // 0..4
}
