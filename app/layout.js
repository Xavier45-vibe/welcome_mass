import "./globals.css";
import "./ui.css";

export const metadata = {
  title: "Xavier Shelter Hub — Secure access",
  description: "Sign in to your Xavier Shelter Hub workspace.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
