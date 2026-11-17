import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { logout } from "@/app/actions";
import { Logo } from "@/components/Shell";

export const metadata = { title: "Dashboard — Xavier Shelter Hub" };
export const dynamic = "force-dynamic";

export default async function Dashboard() {
  const user = await getSession();
  if (!user) redirect("/login");
  const first = user.name.split(" ")[0];

  return (
    <div className="dash portal">
      <header className="portal-header">
        <Logo />
        <span className="portal-label">YOUR ACCOUNT</span>
        <div className="user">
          <span className="avatar" aria-hidden="true">{user.name[0].toUpperCase()}</span>
          <span className="email">{user.email}</span>
          <form action={logout}>
            <button className="btn ghost sm" type="submit">Sign out</button>
          </form>
        </div>
      </header>
      <main className="portal-main">
        <section className="portal-welcome" aria-labelledby="welcome-title">
          <div className="portal-welcome-copy">
            <span className="eyebrow">WELCOME MASS <span aria-hidden="true">/</span> OVERVIEW</span>
            <h1 id="welcome-title">Welcome onboard,<br /><span>{first}.</span></h1>
            <p>Your account is ready. This is your personal space to get started.</p>
          </div>
          <div className="portal-emblem" aria-hidden="true">
            <span>W</span>
            <i />
          </div>
        </section>

        <div className="portal-grid">
          <section className="portal-card account-card" aria-labelledby="account-title">
            <div className="portal-card-heading">
              <div>
                <span className="eyebrow">ACCOUNT</span>
                <h2 id="account-title">Your details</h2>
              </div>
              <span className="status-pill"><i aria-hidden="true" /> Active</span>
            </div>
            <dl className="account-details">
              <div>
                <dt>Full name</dt>
                <dd>{user.name}</dd>
              </div>
              <div>
                <dt>Email address</dt>
                <dd>{user.email}</dd>
              </div>
            </dl>
          </section>

          <section className="portal-card ready-card" aria-labelledby="ready-title">
            <span className="ready-mark" aria-hidden="true">✓</span>
            <span className="eyebrow">YOU'RE ALL SET</span>
            <h2 id="ready-title">Welcome to your portal.</h2>
            <p>You're signed in and can return to your account whenever you need.</p>
          </section>
        </div>

        <footer className="portal-footer">
          <span>Xavier Shelter Hub</span>
          <span>Secure account access</span>
        </footer>
      </main>
    </div>
  );
}
