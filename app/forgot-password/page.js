import Link from "next/link";
import { AuthShell } from "@/components/Shell";
import { ForgotForm } from "@/components/Forms";

export const metadata = { title: "Forgot password — Xavier Shelter Hub" };

export default function Page() {
  return (
    <AuthShell
      title="Forgot your password?"
      subtitle="Enter the email address associated with your account to start resetting your password."
      footer={<>Remembered it? <Link href="/login" className="link">Back to sign in</Link></>}
    >
      <ForgotForm />
    </AuthShell>
  );
}
