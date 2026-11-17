import Link from "next/link";
import { AuthShell } from "@/components/Shell";
import { ResetForm } from "@/components/Forms";
import { findUserByResetToken } from "@/lib/db";

export const metadata = { title: "Reset password — Xavier Shelter Hub" };
export const dynamic = "force-dynamic";

export default async function Page({ searchParams }) {
  const { token } = await searchParams;
  const valid = token && (await findUserByResetToken(token));

  if (!valid)
    return (
      <AuthShell
        title="Link expired"
        subtitle="This password reset link is invalid or has expired."
      >
        <Link href="/forgot-password" className="btn">Request a new link</Link>
      </AuthShell>
    );

  return (
    <AuthShell
      title="Set a new password"
      subtitle="Choose a strong password you haven't used before."
    >
      <ResetForm token={token} />
    </AuthShell>
  );
}
