import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const user = await getCurrentUser();
  const workspaceHref = user ? "/dashboard" : "/login";

  return (
    <main className="pf-landing">
      <div className="pf-grain" aria-hidden="true" />
      <div className="pf-ambient pf-ambient-one" aria-hidden="true" />
      <div className="pf-ambient pf-ambient-two" aria-hidden="true" />

      <header className="pf-nav">
        <Link href="/" className="pf-brand" aria-label="PICT Finance Society home">
          <span className="pf-brand-logo-frame"><img className="pf-brand-logo" src="/pict-finance-society-logo.png" alt="PICT Finance Society official logo" /></span>
          <span className="pf-brand-copy"><strong>PICT Finance Society</strong><small>PICT · PUNE</small></span>
        </Link>
        <nav className="pf-nav-links" aria-label="Main navigation">
          <a href="#society">The society</a>
          <a href="#explore">Explore</a>
          <a href="#community">Community</a>
        </nav>
        <div className="pf-nav-actions">
          {user ? (
            <Link href="/dashboard" className="pf-nav-cta">Member workspace <span>↗</span></Link>
          ) : (
            <>
              <Link href="/login" className="pf-nav-login">Log in</Link>
              <Link href="/register" className="pf-nav-cta">Join the society <span>↗</span></Link>
            </>
          )}
        </div>
      </header>

      <section className="pf-hero">
        <div className="pf-hero-grid" aria-hidden="true" />
        <div className="pf-hero-copy">
          <div className="pf-kicker"><span className="pf-kicker-dot" /> A STUDENT-LED FINANCE COMMUNITY <i /></div>
          <h1>Think beyond<br />the <em>numbers.</em></h1>
          <p className="pf-hero-lead">A place for curious minds at PICT to explore finance, decode markets, challenge ideas and create something meaningful — together.</p>
          <div className="pf-hero-actions">
            <Link href={user ? "/dashboard" : "/register"} className="pf-button pf-button-lime">
              {user ? "Enter member workspace" : "Become a member"} <span>↗</span>
            </Link>
            <a href="#society" className="pf-button pf-button-quiet"><span className="pf-button-play">↓</span> Discover the society</a>
          </div>
          <div className="pf-hero-note"><span /> CURIOSITY IS THE START. CONTRIBUTION IS THE IMPACT.</div>
        </div>

        <div className="pf-hero-art" aria-label="Animated PICT Finance Society visual">
          <div className="pf-art-halo" />
          <div className="pf-orbit pf-orbit-a"><span /></div>
          <div className="pf-orbit pf-orbit-b"><span /></div>
          <div className="pf-orbit pf-orbit-c"><span /></div>
          <div className="pf-art-cross pf-cross-a">+</div>
          <div className="pf-art-cross pf-cross-b">✳</div>
          <div className="pf-art-monogram pf-official-logo-card">
            <img className="pf-hero-official-logo" src="/pict-finance-society-logo.png" alt="PICT Finance Society official logo" />
            <span className="pf-monogram-full">PICT FINANCE SOCIETY</span>
            <i />
          </div>
          <div className="pf-float-card pf-float-card-top"><span className="pf-float-icon">↗</span><span><b>Ideas in motion</b><small>Learn · Analyse · Grow</small></span></div>
          <div className="pf-float-card pf-float-card-bottom"><span className="pf-pulse-bars"><i /><i /><i /><i /><i /></span><span><b>Curiosity compounds.</b><small>Knowledge creates perspective.</small></span></div>
          <svg className="pf-art-chart" viewBox="0 0 500 220" fill="none" aria-hidden="true">
            <defs>
              <linearGradient id="pf-chart-fill" x1="250" y1="14" x2="250" y2="220" gradientUnits="userSpaceOnUse">
                <stop stopColor="#C9F36D" stopOpacity=".28" />
                <stop offset="1" stopColor="#C9F36D" stopOpacity="0" />
              </linearGradient>
            </defs>
            <path className="pf-chart-area" d="M0 185 C48 174 47 138 96 150 S152 119 185 132 S236 80 276 101 S328 72 358 82 S410 27 500 18 V220 H0Z" fill="url(#pf-chart-fill)" />
            <path className="pf-chart-line" d="M0 185 C48 174 47 138 96 150 S152 119 185 132 S236 80 276 101 S328 72 358 82 S410 27 500 18" stroke="#C9F36D" strokeWidth="2.5" strokeLinecap="round" />
            <circle className="pf-chart-point" cx="358" cy="82" r="5" fill="#C9F36D" />
            <circle className="pf-chart-point pf-chart-point-late" cx="500" cy="18" r="5" fill="#C9F36D" />
          </svg>
          <div className="pf-art-caption">A DIFFERENT WAY TO SEE THE WORLD <span>01 / PICT FS</span></div>
        </div>
        <a href="#society" className="pf-scroll-cue"><span /> SCROLL TO EXPLORE</a>
      </section>

      <div className="pf-marquee" aria-label="Areas of interest">
        <div className="pf-marquee-track">
          {Array.from({ length: 2 }).map((_, index) => (
            <span key={index}>MARKETS <i>✳</i> ECONOMICS <i>✳</i> INVESTING <i>✳</i> RESEARCH <i>✳</i> IDEAS <i>✳</i> COLLABORATION <i>✳</i></span>
          ))}
        </div>
      </div>

      <section className="pf-intro" id="society">
        <div className="pf-section-index"><span>01</span><i /> THE SOCIETY</div>
        <div className="pf-intro-grid">
          <h2>Finance is a lens.<br /><em>Curiosity is the edge.</em></h2>
          <div className="pf-intro-copy">
            <p className="pf-intro-lead">The PICT Finance Society brings together students who want to understand the forces shaping business, money, markets and the world around us.</p>
            <p>Through shared learning, thoughtful discussion, research and practical exploration, we make finance more approachable — and give ideas room to grow. Whether you are just getting started or already following the markets, there is space to learn, contribute and find your perspective.</p>
            <Link href={user ? "/dashboard" : "/register"} className="pf-text-link">{user ? "Continue to your member space" : "Find your place in the society"} <span>↗</span></Link>
          </div>
        </div>
      </section>

      <section className="pf-explore" id="explore">
        <div className="pf-section-index"><span>02</span><i /> WHAT WE EXPLORE</div>
        <div className="pf-explore-heading">
          <h2>Many questions.<br /><em>One curious community.</em></h2>
          <p>Follow an interest, learn a new perspective and connect the dots between finance and everything around it.</p>
        </div>
        <div className="pf-focus-grid">
          <article className="pf-focus-card pf-focus-markets">
            <div className="pf-card-meta">01 <span>MARKET MINDSET</span></div>
            <div className="pf-card-art pf-mini-chart"><i /><i /><i /><i /><i /><b>↗</b></div>
            <h3>Markets &amp; investing</h3>
            <p>Explore how markets move, how financial systems work and what shapes investment decisions.</p>
            <span className="pf-card-arrow">↗</span>
          </article>
          <article className="pf-focus-card pf-focus-research">
            <div className="pf-card-meta">02 <span>RESEARCH CULTURE</span></div>
            <div className="pf-card-art pf-mini-orbit"><i /><i /><i /><b>R</b></div>
            <h3>Research &amp; insight</h3>
            <p>Ask better questions, look beyond headlines and turn ideas into clear, thoughtful insights.</p>
            <span className="pf-card-arrow">↗</span>
          </article>
          <article className="pf-focus-card pf-focus-build">
            <div className="pf-card-meta">03 <span>BUILD TOGETHER</span></div>
            <div className="pf-card-art pf-mini-blocks"><i /><i /><i /><i /></div>
            <h3>Projects &amp; collaboration</h3>
            <p>Bring different strengths together, exchange perspectives and make learning practical.</p>
            <span className="pf-card-arrow">↗</span>
          </article>
        </div>
      </section>

      <section className="pf-community" id="community">
        <div className="pf-community-orbit" aria-hidden="true"><span>PF</span></div>
        <div className="pf-section-index"><span>03</span><i /> THE COMMUNITY</div>
        <div className="pf-community-content">
          <div className="pf-community-kicker">A SOCIETY BUILT BY STUDENTS</div>
          <h2>Bring your questions.<br /><em>Leave with perspective.</em></h2>
          <p>Be part of a community that learns out loud, thinks critically and values every contribution along the way.</p>
          <Link href={user ? "/dashboard" : "/register"} className="pf-button pf-button-lime">{user ? "Open your workspace" : "Join PICT Finance Society"} <span>↗</span></Link>
        </div>
      </section>

      <footer className="pf-footer">
        <Link href="/" className="pf-brand pf-footer-brand"><span className="pf-brand-logo-frame"><img className="pf-brand-logo" src="/pict-finance-society-logo.png" alt="PICT Finance Society official logo" /></span><span className="pf-brand-copy"><strong>PICT Finance Society</strong><small>PICT · PUNE</small></span></Link>
        <span>THINK DEEPER. SEE FURTHER. BUILD TOGETHER.</span>
        <div><Link href="/login">Member login</Link><Link href="/admin/login">Admin</Link></div>
      </footer>
    </main>
  );
}
