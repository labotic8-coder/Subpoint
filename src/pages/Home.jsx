import React, { useEffect, useRef, useState } from "react";
import heroAgent from "../assets/hero-agent.png";
import "./Home.css";

/* ---------- helpers ---------- */

function useReveal() {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add("is-visible");
          io.unobserve(el);
        }
      },
      { threshold: 0.15 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return ref;
}

function Reveal({ as: Tag = "div", className = "", children, ...rest }) {
  const ref = useReveal();
  return (
    <Tag ref={ref} className={`reveal ${className}`} {...rest}>
      {children}
    </Tag>
  );
}

function useCountUp(target, duration = 1800) {
  const [value, setValue] = useState(0);
  const ref = useRef(null);
  const started = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true;
          const start = performance.now();
          const step = (now) => {
            const progress = Math.min((now - start) / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            setValue(Math.floor(eased * target));
            if (progress < 1) requestAnimationFrame(step);
            else setValue(target);
          };
          requestAnimationFrame(step);
          io.unobserve(el);
        }
      },
      { threshold: 0.4 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [target, duration]);

  return [value, ref];
}

/* ---------- data ---------- */

const NAV_LINKS = ["Services", "Networks", "Dashboard", "Reviews", "FAQ"];

const TRUST_STATS = [
  { value: 50000, suffix: "+", label: "Active users" },
  { value: 1000000, suffix: "+", label: "Transactions processed" },
  { value: 999, suffix: "%", label: "Success rate", decimal: true },
];

const NETWORKS = [
  { name: "MTN", color: "#FFC700", text: "#0A1A33" },
  { name: "Airtel", color: "#E4002B", text: "#FFFFFF" },
  { name: "Glo", color: "#0E7C3A", text: "#FFFFFF" },
  { name: "9mobile", color: "#0A6B4F", text: "#FFFFFF" },
];

const SERVICES = [
  { title: "Airtime", desc: "Instant top-up on every major network.", icon: "phone" },
  { title: "Data", desc: "Affordable bundles delivered in seconds.", icon: "data" },
  { title: "Electricity", desc: "Pay disco bills without leaving home.", icon: "bolt" },
  { title: "Cable TV", desc: "DStv, GOtv and Startimes renewals.", icon: "tv" },
  { title: "WAEC", desc: "Result checker pins, instantly issued.", icon: "cap" },
  { title: "NECO", desc: "Registration and result tokens.", icon: "book" },
  { title: "JAMB", desc: "UTME PINs and profile reprints.", icon: "doc" },
  { title: "Wallet", desc: "Fund once, pay for everything.", icon: "wallet" },
  { title: "Referral", desc: "Earn for every friend you bring.", icon: "users" },
  { title: "Gift Cards", desc: "Trade and redeem top brands.", icon: "gift" },
];

const FEATURES = [
  { title: "Bank-grade security", desc: "256-bit encryption and tokenised transactions keep every wallet locked down." },
  { title: "Sub-second delivery", desc: "Our switch routes requests to the fastest available channel, automatically." },
  { title: "Always reconciled", desc: "Failed transactions are auto-reversed to your wallet — no support ticket needed." },
  { title: "Built for scale", desc: "From a single recharge to bulk disbursement, the rails don't change." },
];

const TESTIMONIALS = [
  { name: "Amaka O.", role: "Reseller, Lagos", quote: "Recharges land before I close the app. SubtoUse pays for itself in saved time alone." },
  { name: "Bashir T.", role: "Small business owner, Kano", quote: "I moved my entire airtime business here. Uptime has been flawless for months." },
  { name: "Ifeoma N.", role: "Student, Enugu", quote: "JAMB and WAEC pins, electricity, data — one wallet, zero stress during exam season." },
];

const FAQS = [
  { q: "How fast are transactions processed?", a: "Most airtime and data purchases complete in under three seconds. Electricity and cable renewals typically confirm within thirty seconds." },
  { q: "What happens if a transaction fails?", a: "Failed transactions are automatically detected and reversed to your wallet, usually within minutes — no need to contact support." },
  { q: "Can I automate bulk recharges?", a: "Yes. Our API and bulk dashboard let businesses schedule and disburse airtime or data at scale." },
  { q: "Is my wallet balance protected?", a: "Every wallet is secured with bank-grade encryption and two-factor authentication on withdrawal." },
];

/* ---------- icon set (inline svg, single stroke style) ---------- */

const ICONS = {
  phone: <path d="M7 2h6a1 1 0 0 1 1 1v18a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V3a1 1 0 0 1 1-1Zm3 17h0" />,
  data: <path d="M4 19V9m6 10V5m6 14v-7M3 19h18" />,
  bolt: <path d="M12 2 4 14h6l-1 8 9-13h-6l1-7Z" />,
  tv: <path d="M4 5h16v12H4zM9 21h6M8 5l4-3 4 3" />,
  cap: <path d="m12 4 9 4-9 4-9-4 9-4Zm-6 6v5c0 1.5 2.7 3 6 3s6-1.5 6-3v-5" />,
  book: <path d="M4 5a2 2 0 0 1 2-2h12v17H6a2 2 0 0 0-2 2V5Zm2 13h12" />,
  doc: <path d="M7 2h7l5 5v15H7V2Zm7 0v5h5M9 13h6M9 17h6" />,
  wallet: <path d="M3 7a2 2 0 0 1 2-2h13a1 1 0 0 1 1 1v3M3 7v11a2 2 0 0 0 2 2h15a1 1 0 0 0 1-1v-5a1 1 0 0 0-1-1h-4a2 2 0 1 0 0 4M3 7l4-4h9" />,
  users: <path d="M9 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm-7 9c0-3.3 3.1-6 7-6s7 2.7 7 6M17 5.5a3.5 3.5 0 0 1 0 7M22 21c0-2.7-2.2-5-5-5.7" />,
  gift: <path d="M3 9h18v4H3V9Zm1 4h16v8H4v-8ZM12 9v12M12 9c-1.5-3-5-4-5-1.5S9 9 12 9Zm0 0c1.5-3 5-4 5-1.5S15 9 12 9Z" />,
};

function Icon({ name }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      {ICONS[name]}
    </svg>
  );
}

/* ---------- component ---------- */

export default function Home() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [openFaq, setOpenFaq] = useState(0);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const [usersVal, usersRef] = useCountUp(50000);
  const [txVal, txRef] = useCountUp(1000000);
  const [rateVal, rateRef] = useCountUp(999);

  return (
    <div className="su">
      {/* ---------------- NAVBAR ---------------- */}
      <header className={`su-nav ${scrolled ? "su-nav--scrolled" : ""}`}>
        <div className="su-nav__inner">
          <a className="su-brand" href="#top">
            <span className="su-brand__mark">
              <span className="su-brand__mark-dot" />
            </span>
            SubtoUse
          </a>

          <nav className={`su-nav__links ${menuOpen ? "su-nav__links--open" : ""}`}>
            {NAV_LINKS.map((l) => (
              <a key={l} href={`#${l.toLowerCase()}`} onClick={() => setMenuOpen(false)}>
                {l}
              </a>
            ))}
            <div className="su-nav__cta-mobile">
              <a className="su-btn su-btn--ghost" href="#login">Log in</a>
              <a className="su-btn su-btn--primary" href="#signup">Get started</a>
            </div>
          </nav>

          <div className="su-nav__actions">
            <a className="su-btn su-btn--ghost" href="#login">Log in</a>
            <a className="su-btn su-btn--primary" href="#signup">
              <span>Get started</span>
            </a>
          </div>

          <button
            className={`su-burger ${menuOpen ? "su-burger--open" : ""}`}
            aria-label="Toggle menu"
            onClick={() => setMenuOpen((v) => !v)}
          >
            <span /><span /><span />
          </button>
        </div>
      </header>

      {/* ---------------- HERO ---------------- */}
      <section className="su-hero" id="top">
        <div className="su-hero__bg" aria-hidden="true">
          <div className="su-hero__grid" />
          <div className="su-glow su-glow--a" />
          <div className="su-glow su-glow--b" />
        </div>

        <div className="su-hero__inner">
          <div className="su-hero__copy">
            <Reveal as="span" className="su-eyebrow">
              <span className="su-eyebrow__dot" /> Trusted payment infrastructure
            </Reveal>

            <Reveal as="h1" className="su-hero__title">
              Recharge, pay bills,
              <br />
              and move money
              <br />
              <span className="su-hero__title-accent">in one tap.</span>
            </Reveal>

            <Reveal as="p" className="su-hero__desc">
              SubtoUse is the fastest way to buy airtime, data, electricity and exam
              pins across Nigeria — built on infrastructure trusted by resellers and
              businesses processing millions of transactions every month.
            </Reveal>

            <Reveal className="su-hero__actions">
              <a href="/Register" className="su-btn su-btn--primary su-btn--lg">
                Create free account
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
              </a>
              <a href="#dashboard" className="su-btn su-btn--secondary su-btn--lg">
                See it in action
              </a>
            </Reveal>

            <Reveal className="su-hero__badges">
              <div className="su-badge">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2 4 5v6c0 5 3.4 9.4 8 11 4.6-1.6 8-6 8-11V5l-8-3Z" /><path d="m9 12 2 2 4-4" /></svg>
                PCI-DSS compliant
              </div>
              <div className="su-badge">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="9" /><path d="m9 12 2 2 4-4" /></svg>
                99.9% uptime SLA
              </div>
              <div className="su-badge">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4.5 8-11V5l-8-3-8 3v6c0 6.5 8 11 8 11Z" /></svg>
                Bank-grade encryption
              </div>
            </Reveal>
          </div>

          <Reveal className="su-hero__visual">
            <div className="su-hero__visual-glow" />
            <div className="su-hero__rings">
              <span className="su-ring su-ring--1" />
              <span className="su-ring su-ring--2" />
            </div>

            <img
              src={heroAgent}
              alt="SubtoUse agent presenting MTN, Airtel, Glo and 9mobile network options"
              className="su-hero__image"
            />

            <div className="su-float su-float--wallet">
              <div className="su-float__icon su-float__icon--blue"><Icon name="wallet" /></div>
              <div>
                <div className="su-float__label">Wallet balance</div>
                <div className="su-float__value">₦248,500.00</div>
              </div>
            </div>

            <div className="su-float su-float--success">
              <div className="su-float__icon su-float__icon--green">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5" /></svg>
              </div>
              <div>
                <div className="su-float__label">Data purchase</div>
                <div className="su-float__value su-float__value--success">Successful</div>
              </div>
            </div>

            <div className="su-float su-float--analytics">
              <div className="su-float__label">This month</div>
              <svg className="su-float__chart" viewBox="0 0 120 40" fill="none">
                <polyline points="0,32 20,26 40,28 60,14 80,18 100,6 120,10" stroke="#3B82F6" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <div className="su-float__value">+38.2%</div>
            </div>

            <div className="su-float su-float--recharge">
              <div className="su-float__icon su-float__icon--purple"><Icon name="phone" /></div>
              <div>
                <div className="su-float__label">MTN recharge</div>
                <div className="su-float__value">₦1,000.00</div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ---------------- TRUSTED BY ---------------- */}
      <section className="su-trust">
        <div className="su-section__inner su-trust__inner">
          <Reveal as="p" className="su-trust__label">Powering payments for everyday Nigerians and growing businesses</Reveal>
          <div className="su-trust__stats">
            <div className="su-trust__stat" ref={usersRef}>
              <span className="su-trust__stat-value">{usersVal.toLocaleString()}+</span>
              <span className="su-trust__stat-label">Users</span>
            </div>
            <div className="su-trust__divider" />
            <div className="su-trust__stat" ref={txRef}>
              <span className="su-trust__stat-value">{(txVal / 1000000).toFixed(txVal === 1000000 ? 0 : 1)}M+</span>
              <span className="su-trust__stat-label">Transactions</span>
            </div>
            <div className="su-trust__divider" />
            <div className="su-trust__stat" ref={rateRef}>
              <span className="su-trust__stat-value">{(rateVal / 10).toFixed(1)}%</span>
              <span className="su-trust__stat-label">Success rate</span>
            </div>
          </div>
        </div>
      </section>

      {/* ---------------- NETWORKS ---------------- */}
      <section className="su-section" id="networks">
        <div className="su-section__inner">
          <Reveal className="su-section__head">
            <span className="su-eyebrow su-eyebrow--dark"><span className="su-eyebrow__dot" /> Network coverage</span>
            <h2>Every major network. One wallet.</h2>
            <p>Top up any line in seconds — no switching apps, no waiting on confirmations.</p>
          </Reveal>

          <div className="su-networks">
            {NETWORKS.map((n, i) => (
              <Reveal key={n.name} className="su-network-card" style={{ transitionDelay: `${i * 80}ms` }}>
                <div className="su-network-card__badge" style={{ background: n.color, color: n.text }}>
                  {n.name}
                </div>
                <span className="su-network-card__name">{n.name}</span>
                <span className="su-network-card__tag">Airtime &amp; data</span>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ---------------- SERVICES ---------------- */}
      <section className="su-section su-section--tint" id="services">
        <div className="su-section__inner">
          <Reveal className="su-section__head">
            <span className="su-eyebrow su-eyebrow--dark"><span className="su-eyebrow__dot" /> What you can do</span>
            <h2>One platform for every bill.</h2>
            <p>From airtime to exam pins, every essential payment lives in a single, fast dashboard.</p>
          </Reveal>

          <div className="su-services">
            {SERVICES.map((s, i) => (
              <Reveal key={s.title} className="su-service-card" style={{ transitionDelay: `${(i % 5) * 70}ms` }}>
                <div className="su-service-card__icon"><Icon name={s.icon} /></div>
                <h3>{s.title}</h3>
                <p>{s.desc}</p>
                <span className="su-service-card__arrow">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
                </span>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ---------------- WHY CHOOSE US ---------------- */}
      <section className="su-section">
        <div className="su-section__inner">
          <Reveal className="su-section__head">
            <span className="su-eyebrow su-eyebrow--dark"><span className="su-eyebrow__dot" /> Why SubtoUse</span>
            <h2>Built like financial infrastructure, not a side project.</h2>
          </Reveal>

          <div className="su-features">
            {FEATURES.map((f, i) => (
              <Reveal key={f.title} className="su-feature-card" style={{ transitionDelay: `${i * 90}ms` }}>
                <span className="su-feature-card__index">{String(i + 1).padStart(2, "0")}</span>
                <h3>{f.title}</h3>
                <p>{f.desc}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ---------------- DASHBOARD PREVIEW ---------------- */}
      <section className="su-section su-dashboard" id="dashboard">
        <div className="su-section__inner">
          <Reveal className="su-section__head su-section__head--center">
            <span className="su-eyebrow su-eyebrow--light"><span className="su-eyebrow__dot" /> Inside your dashboard</span>
            <h2 className="su-dashboard__title">Every transaction, in full view.</h2>
            <p className="su-dashboard__sub">Track spending, automate recurring bills and reconcile instantly.</p>
          </Reveal>

          <Reveal className="su-dashboard__frame">
            <div className="su-dashboard__topbar">
              <div className="su-dashboard__dots"><span /><span /><span /></div>
              <div className="su-dashboard__url">app.subtouse.com/dashboard</div>
            </div>
            <div className="su-dashboard__body">
              <aside className="su-dashboard__side">
                {["Overview", "Transactions", "Bills", "Wallet", "Settings"].map((item, i) => (
                  <div key={item} className={`su-dashboard__side-item ${i === 0 ? "is-active" : ""}`}>{item}</div>
                ))}
              </aside>
              <div className="su-dashboard__main">
                <div className="su-dashboard__cards">
                  <div className="su-dashboard__metric">
                    <span>Wallet balance</span>
                    <strong>₦248,500.00</strong>
                    <em className="up">+12.4% this week</em>
                  </div>
                  <div className="su-dashboard__metric">
                    <span>Transactions today</span>
                    <strong>1,284</strong>
                    <em className="up">+8.1%</em>
                  </div>
                  <div className="su-dashboard__metric">
                    <span>Success rate</span>
                    <strong>99.9%</strong>
                    <em className="neutral">Stable</em>
                  </div>
                </div>
                <div className="su-dashboard__graph">
                  <svg viewBox="0 0 400 120" preserveAspectRatio="none">
                    <defs>
                      <linearGradient id="suGraphFill" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.35" />
                        <stop offset="100%" stopColor="#3B82F6" stopOpacity="0" />
                      </linearGradient>
                    </defs>
                    <polyline
                      points="0,90 40,80 80,85 120,55 160,65 200,35 240,45 280,20 320,30 360,12 400,22"
                      fill="none" stroke="#3B82F6" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
                    />
                    <polygon points="0,90 40,80 80,85 120,55 160,65 200,35 240,45 280,20 320,30 360,12 400,22 400,120 0,120" fill="url(#suGraphFill)" />
                  </svg>
                </div>
                <div className="su-dashboard__rows">
                  {[
                    { name: "MTN Airtime", amount: "-₦1,000.00", time: "2 min ago" },
                    { name: "PHCN Electricity", amount: "-₦5,200.00", time: "1 hr ago" },
                    { name: "Wallet funding", amount: "+₦20,000.00", time: "3 hrs ago" },
                  ].map((r) => (
                    <div key={r.name} className="su-dashboard__row">
                      <span>{r.name}</span>
                      <span className={r.amount.startsWith("+") ? "up" : ""}>{r.amount}</span>
                      <span className="su-dashboard__row-time">{r.time}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ---------------- TESTIMONIALS ---------------- */}
      <section className="su-section" id="reviews">
        <div className="su-section__inner">
          <Reveal className="su-section__head">
            <span className="su-eyebrow su-eyebrow--dark"><span className="su-eyebrow__dot" /> Loved by our users</span>
            <h2>People run real businesses on SubtoUse.</h2>
          </Reveal>

          <div className="su-testimonials">
            {TESTIMONIALS.map((t, i) => (
              <Reveal key={t.name} className="su-testimonial-card" style={{ transitionDelay: `${i * 100}ms` }}>
                <div className="su-testimonial-card__stars">
                  {Array.from({ length: 5 }).map((_, s) => (
                    <svg key={s} width="14" height="14" viewBox="0 0 24 24" fill="#FBBF24"><path d="m12 2 3.1 6.3 7 1-5 4.9 1.2 6.9-6.3-3.3-6.3 3.3 1.2-6.9-5-4.9 7-1L12 2Z" /></svg>
                  ))}
                </div>
                <p>&ldquo;{t.quote}&rdquo;</p>
                <div className="su-testimonial-card__person">
                  <div className="su-testimonial-card__avatar">{t.name.charAt(0)}</div>
                  <div>
                    <strong>{t.name}</strong>
                    <span>{t.role}</span>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ---------------- FAQ ---------------- */}
      <section className="su-section su-section--tint" id="faq">
        <div className="su-section__inner su-section__inner--narrow">
          <Reveal className="su-section__head">
            <span className="su-eyebrow su-eyebrow--dark"><span className="su-eyebrow__dot" /> Questions</span>
            <h2>Frequently asked questions.</h2>
          </Reveal>

          <div className="su-faq">
            {FAQS.map((f, i) => (
              <Reveal key={f.q} className={`su-faq__item ${openFaq === i ? "is-open" : ""}`}>
                <button className="su-faq__question" onClick={() => setOpenFaq(openFaq === i ? -1 : i)}>
                  {f.q}
                  <span className="su-faq__icon">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M5 12h14M12 5v14" /></svg>
                  </span>
                </button>
                <div className="su-faq__answer">
                  <p>{f.a}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ---------------- FINAL CTA ---------------- */}
      <section className="su-cta">
        <div className="su-cta__glow" />
        <Reveal className="su-cta__inner">
          <h2>Ready to move faster with your money?</h2>
          <p>Join thousands of Nigerians who trust SubtoUse for instant, reliable payments.</p>
          <div className="su-cta__actions">
            <a href="/Register" className="su-btn su-btn--white su-btn--lg">Create free account</a>
            <a href="#dashboard" className="su-btn su-btn--outline su-btn--lg">Talk to sales</a>
          </div>
        </Reveal>
      </section>

      {/* ---------------- FOOTER ---------------- */}
      <footer className="su-footer">
        <div className="su-section__inner su-footer__inner">
          <div className="su-footer__top">
            <div className="su-footer__brand">
              <a className="su-brand su-brand--footer" href="#top">
                <span className="su-brand__mark"><span className="su-brand__mark-dot" /></span>
                SubtoUse
              </a>
              <p>Instant payments infrastructure for everyday Nigeria.</p>
            </div>

            <div className="su-footer__col">
              <h4>Product</h4>
              <a href="#services">Airtime &amp; Data</a>
              <a href="#services">Bill Payments</a>
              <a href="#dashboard">Dashboard</a>
              <a href="#services">Gift Cards</a>
            </div>
            <div className="su-footer__col">
              <h4>Company</h4>
              <a href="#top">About</a>
              <a href="#reviews">Reviews</a>
              <a href="#faq">FAQ</a>
              <a href="#top">Careers</a>
            </div>
            <div className="su-footer__col">
              <h4>Legal</h4>
              <a href="#top">Privacy Policy</a>
              <a href="#top">Terms of Service</a>
              <a href="#top">Compliance</a>
            </div>
          </div>

          <div className="su-footer__bottom">
            <span>© {new Date().getFullYear()} SubtoUse. All rights reserved.</span>
            <div className="su-footer__social">
              <a href="#top" aria-label="Twitter">𝕏</a>
              <a href="#top" aria-label="Instagram">◎</a>
              <a href="#top" aria-label="LinkedIn">in</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
