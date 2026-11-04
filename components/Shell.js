export function Logo() {
  return (
    <div className="logo">
      <span className="mark">W</span>
      <span>Welcome Mass</span>
    </div>
  );
}

export function AuthShell({ title, subtitle, children, footer }) {
  return (
    <main className="auth">
      <section className="hero">
        <Logo />
        <div className="hero-copy">
          <h2>Shelter, simplified.</h2>
          <p>
            One secure place to manage your account, your team and your
            day — designed to stay out of your way.
          </p>
          <ul>
            <li>Encrypted credentials &amp; protected sessions</li>
            <li>Fast, distraction-free sign in</li>
            <li>Recover access in under a minute</li>
          </ul>
        </div>
        <small>© {new Date().getFullYear()} Welcome Mass</small>
      </section>
      <section className="panel">
        <div className="card">
          <div className="mobile-logo"><Logo /></div>
          <h1>{title}</h1>
          <p className="sub">{subtitle}</p>
          {children}
          {footer && <p className="foot">{footer}</p>}
        </div>
      </section>
    </main>
  );
}
