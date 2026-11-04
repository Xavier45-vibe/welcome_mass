import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { logout } from "@/app/actions";
import { Logo } from "@/components/Shell";

export const metadata = { title: "Dashboard — Welcome Mass" };
export const dynamic = "force-dynamic";

export default async function Dashboard() {
  const user = await getSession();
  if (!user) redirect("/login");
  const first = user.name.split(" ")[0];

  return (
    <div className="dash">
      <header>
        <Logo />
        <div className="user">
          <span className="avatar">{user.name[0].toUpperCase()}</span>
          <span className="email">{user.email}</span>
          <form action={logout}>
            <button className="btn ghost sm" type="submit">Sign out</button>
          </form>
        </div>
      </header>
      <main>
        <div className="welcome">
          <span className="badge">Signed in</span>
          <h1>Welcome onboard, {first}.</h1>
          <p>Your account is ready. We're glad to have you with us.</p>
        </div>
      </main>
    </div>
  );
}
