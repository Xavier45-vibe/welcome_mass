import Link from "next/link";
import { AuthShell } from "@/components/Shell";
import { SignupForm } from "@/components/Forms";

export const metadata = { title: "Create account — Xavier Shelter Hub" };

export default function Page() {
  return (
    <AuthShell
      title="Create your account"
      subtitle="It takes less than a minute to get started."
      footer={<>Already have an account? <Link href="/login" className="link">Sign in</Link></>}
    >
      <SignupForm />
    </AuthShell>
  );
}
