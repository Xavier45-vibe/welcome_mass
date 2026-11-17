export function Logo() {
  return (
    <div className="logo">
      <span className="mark">
        <img src="/xavier-shelter-mark.png" alt="" width="42" height="42" />
      </span>
      <span className="logo-copy">
        <strong>Xavier Shelter Hub</strong>
        <small>Operations &amp; Mortgage Management</small>
      </span>
    </div>
  );
}

export function AuthShell({ title, subtitle, children, footer }) {
  return (
    <main className="auth">
      <section className="hero">
        <Logo />
        <div className="hero-copy">
          <span className="eyebrow">OPERATIONS, IN ONE PLACE</span>
          <h2>A clearer view of every move.</h2>
          <p>
            Your work, your property portfolio, and the details that keep
            everything moving—together in one secure workspace.
          </p>
          <div className="hero-note">
            <span className="note-icon" aria-hidden="true">X</span>
            <span>
              <strong>Your work, always within reach</strong>
              <small>One secure home for your operations.</small>
            </span>
            <span className="note-arrow" aria-hidden="true">↗</span>
          </div>
        </div>
        <div className="hero-footer">
          <span>© {new Date().getFullYear()} Xavier Shelter</span>
          <span>SECURE PORTAL ACCESS</span>
        </div>
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
