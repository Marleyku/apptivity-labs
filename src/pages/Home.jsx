import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import BetaForm, { BetaReward } from '../components/BetaForm.jsx';
import { BrandMark, IconArrow, IconExternal } from '../components/Icons.jsx';
import Reveal from '../components/Reveal.jsx';
import ShotFrame from '../components/ShotFrame.jsx';

const PRODUCTS = [
  {
    id: 'miles2go',
    name: 'Miles2Go',
    kicker: 'Vehicle life',
    tagline: 'Car care, made beautifully simple.',
    description:
      'Keep fuel, maintenance, mileage, reminders, and the real cost of every vehicle together—without the spreadsheet headache.',
    href: 'https://mymiles2go.com',
    image: '/products/miles2go-dashboard.png',
    alt: 'Miles2Go dashboard showing vehicles, quick actions, and reminders',
  },
  {
    id: 'favorbank',
    name: 'FavorBank',
    kicker: 'Relationships',
    tagline: 'Small acts. Stronger relationships.',
    description:
      'A thoughtful way for couples and families to notice effort, express appreciation, and turn everyday kindness into connection.',
    href: 'https://favorbank.app',
    image: '/products/favorbank-dashboard.png',
    alt: 'FavorBank home dashboard with shared FavorBucks balances and open tasks',
  },
  {
    id: 'apptivity',
    name: 'APPtivity',
    kicker: 'Meaningful activities',
    tagline: 'Make meaningful time happen.',
    description:
      'Plan activities that bring people together—families, friends, faith groups, and communities—with more purpose and less friction.',
    href: 'https://goapptivity.com',
    image: '/products/apptivity-dashboard.png',
    alt: 'APPtivity dashboard showing the Discover, Plan, Act, Reflect trail',
  },
];

function Brand({ className = '', href = '#top' }) {
  const Comp = href.startsWith('#') ? 'a' : Link;
  const props = href.startsWith('#') ? { href } : { to: href };
  return (
    <Comp className={`brand ${className}`.trim()} aria-label="APPtivity Labs home" {...props}>
      <BrandMark />
      <span>
        APPtivity <b>Labs</b>
      </span>
    </Comp>
  );
}

export default function Home() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <main>
      <header className={`site-header${scrolled ? ' is-scrolled' : ''}`}>
        <Brand />
        <nav className="desktop-nav" aria-label="Main navigation">
          <a href="#products">Products</a>
          <a href="#beta">Beta test</a>
          <a href="#approach">Our approach</a>
          <a href="#about">About</a>
        </nav>
        <a className="nav-cta" href="mailto:hello@apptivity.online">
          Let’s connect <IconArrow />
        </a>
      </header>

      <section className="hero" id="top">
        <div className="hero-copy">
          <p className="eyebrow">Thoughtful software for real life</p>
          <h1>
            More life.
            <br />
            <span>Less logistics.</span>
          </h1>
          <p className="hero-lead">
            APPtivity Labs builds focused web apps that help people strengthen relationships, plan
            meaningful activities, and organize everyday life.
          </p>
          <div className="hero-actions">
            <a className="button button-primary" href="#products">
              Explore our products <IconArrow />
            </a>
            <a className="button button-quiet" href="#beta">
              Join a beta
            </a>
          </div>
        </div>
        <div className="hero-visual">
          <ShotFrame
            src="/products/miles2go-dashboard.png"
            alt="Miles2Go product dashboard"
            label="miles2go.com"
          />
        </div>
      </section>

      <section className="products" id="products">
        {PRODUCTS.map((product, index) => (
          <Reveal key={product.id}>
            <article
              className={`product-section${index % 2 === 1 ? ' product-section-reverse' : ''}`}
              id={product.id}
            >
              <div className="product-copy">
                <p className="section-kicker">{product.kicker}</p>
                <h2>{product.name}</h2>
                <p className="tagline">{product.tagline}</p>
                <p>{product.description}</p>
                <a
                  className="product-link"
                  href={product.href}
                  target="_blank"
                  rel="noreferrer"
                >
                  Visit {product.name} <IconExternal />
                </a>
              </div>
              <ShotFrame src={product.image} alt={product.alt} label={product.href.replace(/^https:\/\//, '')} />
            </article>
          </Reveal>
        ))}
      </section>

      <section className="approach" id="approach">
        <div className="approach-inner">
          <p className="section-kicker">The APPtivity idea</p>
          <h2>Software should clear the way for a better life.</h2>
          <p className="approach-lead">
            We start with real human friction—the forgotten maintenance, the hard-to-plan Saturday,
            the effort that goes unnoticed—and design simple tools that help people move forward
            together.
          </p>
          <div className="principles">
            <article>
              <span>01</span>
              <h3>Human first</h3>
              <p>Technology supports the relationship. It never becomes the relationship.</p>
            </article>
            <article>
              <span>02</span>
              <h3>Useful by design</h3>
              <p>Clear, approachable experiences that solve actual everyday problems.</p>
            </article>
            <article>
              <span>03</span>
              <h3>Meaningful momentum</h3>
              <p>Small, thoughtful actions compound into stronger lives and communities.</p>
            </article>
          </div>
        </div>
      </section>

      <section className="beta" id="beta">
        <div>
          <p className="section-kicker">Help build what’s next</p>
          <h2>Be among the first to try it.</h2>
          <p>
            Sign up to beta test Miles2Go, FavorBank, or APPtivity. Use the product in real life,
            tell us what works, and help us make it genuinely useful before launch.
          </p>
          <BetaReward />
        </div>
        <BetaForm />
      </section>

      <section className="about" id="about">
        <div className="about-panel">
          <div className="about-art" aria-hidden="true" />
          <div className="about-copy">
            <p className="section-kicker">Built in Utah. Made for everywhere.</p>
            <h2>Big ideas for everyday people.</h2>
            <p>
              APPtivity Labs is an independent software company focused on the overlooked spaces
              between productivity and human connection. We believe the best technology doesn’t ask
              for more of your attention—it gives more of your life back.
            </p>
            <a href="mailto:hello@apptivity.online">
              Start a conversation <IconArrow />
            </a>
          </div>
        </div>
      </section>

      <section className="closing">
        <p>Less friction. More connection.</p>
        <h2>
          Let’s make life
          <br />
          work better.
        </h2>
        <a className="button button-light" href="mailto:hello@apptivity.online">
          hello@apptivity.online <IconArrow />
        </a>
      </section>

      <footer>
        <Brand className="brand-footer" href="#top" />
        <p className="footer-links">
          <Link to="/sms-opt-in">SMS Opt-In</Link>
          <a href="mailto:hello@apptivity.online">Contact</a>
        </p>
        <p>© 2026 APPtivity Labs, LLC</p>
      </footer>
    </main>
  );
}
