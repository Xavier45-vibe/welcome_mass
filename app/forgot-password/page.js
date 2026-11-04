import Link from "next/link";
import { AuthShell } from "@/components/Shell";
import { ForgotForm } from "@/components/Forms";

export const metadata = { title: "Forgot password — Welcome Mass" };

export default function Page() {
  return (
    <AuthShell
      title="Forgot your password?"
      subtitle="Enter your email and we'll send you a link to reset it."
      footer={<>Remembered it? <Link href="/login" className="link">Back to sign in</Link></>}
    >
      <ForgotForm />
    </AuthShell>
  );
}
