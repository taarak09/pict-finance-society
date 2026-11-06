import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const user = await getCurrentUser();
  const memberHref = user ? "/dashboard" : "/register";

  return (
    <main className="pf-landing">
      <section className="pf-opening" aria-label="PICT Finance Society">
        <div className="pf-opening-orbit pf-opening-orbit-one" />
        <div className="pf-opening-orbit pf-opening-orbit-two" />
        <div className="pf-opening-content">
          <span className="pf-opening-mark">PICT · PUNE</span>
          <h1 className="pf-opening-title"><span>PICT</span> <em>Finance</em> <span>Society</span></h1>
          <p>WHERE FINANCE MEETS CURIOSITY</p>
          <div className="pf-opening-rule"><i /></div>
        </div>
      </section>
      <header className="pf-nav">
        <Link href="/" className="pf-brand" aria-label="PICT Finance Society home">
          <span className="pf-brand-logo-frame"><img className="pf-brand-logo" src="/pict-finance-society-logo.png" alt="PICT Finance Society logo" /></span>
          <span className="pf-brand-copy"><strong>PICT Finance Society</strong><small>PUNE INSTITUTE OF COMPUTER TECHNOLOGY</small></span>
        </Link>
        <nav className="pf-nav-links" aria-label="Main navigation">
          <a href="#about">About</a><a href="#focus">What we do</a><a href="#community">Community</a>
        </nav>
        <div className="pf-nav-actions">
          {user ? <Link href="/dashboard" className="pf-nav-cta">Member workspace <span>↗</span></Link> : <><Link href="/login" className="pf-nav-login">Log in</Link><Link href="/register" className="pf-nav-cta">Join the society <span>↗</span></Link></>}
        </div>
      </header>

      <section className="pf-hero">
        <div className="pf-hero-copy">
          <div className="pf-kicker"><span /> STUDENT-LED · PICT PUNE</div>
          <h1>Finance is more<br />than <em>numbers.</em></h1>
          <p className="pf-hero-lead">A student community exploring markets, money, business and the ideas shaping our world. Learn together, ask better questions and put knowledge into practice.</p>
          <div className="pf-hero-actions">
            <Link href={memberHref} className="pf-button pf-button-primary">{user ? "Go to your workspace" : "Become a member"} <span>↗</span></Link>
            <a href="#about" className="pf-text-link">Get to know us <span>↓</span></a>
          </div>
          <div className="pf-hero-note">PICT FINANCE SOCIETY <i /> LEARN · DISCUSS · BUILD</div>
        </div>
        <div className="pf-hero-visual" aria-hidden="true">
          <div className="pf-visual-top"><span>MARKET PULSE</span><span>PICT / FINANCE</span></div>
          <div className="pf-visual-chart"><svg viewBox="0 0 560 260" role="presentation"><path className="pf-chart-grid" d="M0 50H560M0 110H560M0 170H560M0 230H560M70 0V260M180 0V260M290 0V260M400 0V260M510 0V260"/><path className="pf-chart-area" d="M0 210 C45 195 58 205 92 168 S150 180 180 135 S240 145 270 110 S320 128 350 85 S410 105 445 62 S500 72 560 22 L560 260 L0 260Z"/><path className="pf-chart-line" d="M0 210 C45 195 58 205 92 168 S150 180 180 135 S240 145 270 110 S320 128 350 85 S410 105 445 62 S500 72 560 22"/></svg></div>
          <div className="pf-visual-bottom"><strong>LEARN THE LANGUAGE OF FINANCE.</strong><span>01 — EXPLORE · 02 — ANALYSE · 03 — BUILD</span></div>
        </div>
      </section>

      <section className="pf-intro" id="about">
        <div className="pf-section-label"><span>01</span> ABOUT THE SOCIETY</div>
        <div className="pf-intro-grid">
          <h2>Curious about finance?<br /><em>You're in the right place.</em></h2>
          <div className="pf-intro-copy">
            <p className="pf-intro-lead">The PICT Finance Society brings together students who want to understand how financial ideas connect with the world around them.</p>
            <p>Whether you're following the markets, learning the basics of investing, interested in fintech or simply curious about how businesses work, there's room to explore. We believe the best learning happens when people share what they know and stay open to new perspectives.</p>
            <Link href={memberHref} className="pf-inline-link">{user ? "Visit your member workspace" : "Find your place in the society"} ↗</Link>
          </div>
        </div>
      </section>

      <section className="pf-focus" id="focus">
        <div className="pf-section-label"><span>02</span> WHAT WE EXPLORE</div>
        <div className="pf-focus-heading"><h2>Ideas worth<br /><em>looking into.</em></h2><p>From financial markets to technology and teamwork, explore the subjects that interest you and learn alongside your peers.</p></div>
        <div className="pf-focus-grid">
          <article className="pf-focus-card"><div className="pf-card-number">01 / MARKETS</div><div className="pf-card-symbol">↗</div><h3>Markets &amp; investing</h3><p>Understand how markets work, follow economic developments and learn to think critically about investment decisions.</p></article>
          <article className="pf-focus-card"><div className="pf-card-number">02 / KNOWLEDGE</div><div className="pf-card-symbol">◎</div><h3>Finance &amp; research</h3><p>Make complex topics approachable through discussions, independent learning and sharing useful insights.</p></article>
          <article className="pf-focus-card"><div className="pf-card-number">03 / TECHNOLOGY</div><div className="pf-card-symbol">⌘</div><h3>FinTech &amp; projects</h3><p>Explore where finance meets technology, collaborate on ideas and turn learning into practical experience.</p></article>
        </div>
      </section>

      <section className="pf-community" id="community">
        <div className="pf-community-copy"><div className="pf-section-label"><span>03</span> LEARN BY TAKING PART</div><h2>Bring your curiosity.<br /><em>Build your perspective.</em></h2><p>Take part in discussions, explore new ideas and contribute to a student-led space for finance, markets and technology.</p><Link href={memberHref} className="pf-button pf-button-primary">{user ? "Open member workspace" : "Join the society"} <span>↗</span></Link></div>
        <div className="pf-community-art" aria-hidden="true"><div className="pf-art-ring" /><div className="pf-art-core">P<span>F</span>S</div><div className="pf-art-caption">THINK · QUESTION · GROW</div></div>
      </section>

      <footer className="pf-footer">
        <Link href="/" className="pf-brand pf-footer-brand"><span className="pf-brand-logo-frame"><img className="pf-brand-logo" src="/pict-finance-society-logo.png" alt="PICT Finance Society logo" /></span><span className="pf-brand-copy"><strong>PICT Finance Society</strong><small>PICT · PUNE</small></span></Link>
        <span>LEARN TOGETHER. THINK CRITICALLY. KEEP EXPLORING.</span>
        <div><Link href="/login">Member login</Link><Link href="/admin/login">Coordinator login</Link></div>
      </footer>
    </main>
  );
}
