import "./globals.css";
import "./ui.css";

export const metadata = {
  title: "Welcome Mass — Secure access",
  description: "Sign in to your Welcome Mass workspace.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
