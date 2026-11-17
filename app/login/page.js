import Link from "next/link";
import { AuthShell } from "@/components/Shell";
import { LoginForm } from "@/components/Forms";

export const metadata = { title: "Sign in — Xavier Shelter Hub" };

export default function Page() {
  return (
    <AuthShell
      title="Welcome back"
      subtitle="Sign in to continue to your workspace."
      footer={<>New here? <Link href="/signup" className="link">Create an account</Link></>}
    >
      <LoginForm />
    </AuthShell>
  );
}
