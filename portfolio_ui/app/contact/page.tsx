import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Contact — Adwait Tagalpallewar",
  description: "Start a conversation with Adwait Tagalpallewar about AI, data, software, research, or an interesting problem.",
};

const socialLinks = [
  { label: "GitHub", href: "https://github.com/CheeseCakeyy" },
  { label: "LinkedIn", href: "https://in.linkedin.com/in/adwait-tagalpallewar" },
  { label: "Kaggle", href: "https://www.kaggle.com/adwaittagalpallewar" },
];

export default function ContactPage() {
  return (
    <div className="site-shell contact-shell">
      <header className="site-header">
        <Link className="identity" href="/#about" aria-label="Return to Adwait Tagalpallewar’s portfolio">
          <span className="identity-mark" aria-hidden="true" />
          <span>Adwait Tagalpallewar</span>
        </Link>
        <span className="contact-header-label">Open to interesting problems</span>
      </header>

      <main className="contact-page">
        <div className="contact-kicker">
          <span>Contact / 01</span>
          <span>Pune, India · IST</span>
        </div>

        <section className="contact-hero" aria-labelledby="contact-title">
          <h1 id="contact-title">Let&apos;s talk about the idea that sounded simple five minutes ago.</h1>
          <p>
            Have a project, research direction, collaboration, or hard technical problem in mind?
            Send me a note on LinkedIn and tell me what you&apos;re trying to build.
          </p>
          <a
            className="contact-primary"
            href="https://in.linkedin.com/in/adwait-tagalpallewar"
            target="_blank"
            rel="noreferrer"
          >
            <span>Start a conversation</span>
            <span aria-hidden="true">↗</span>
          </a>
        </section>

        <section className="contact-links" aria-label="Other places to find Adwait">
          <span className="contact-links__label">Elsewhere</span>
          {socialLinks.map((link, index) => (
            <a key={link.label} href={link.href} target="_blank" rel="noreferrer">
              <span>{String(index + 1).padStart(2, "0")}</span>
              <strong>{link.label}</strong>
              <span aria-hidden="true">↗</span>
            </a>
          ))}
        </section>
      </main>

      <div className="floating-nav-wrap">
        <nav className="floating-nav" aria-label="Primary navigation">
          <Link href="/#work">Work</Link>
          <Link href="/#about">About</Link>
          <Link href="/collection">Collection</Link>
          <Link className="is-current" href="/contact" aria-current="page">Contact</Link>
        </nav>
      </div>
    </div>
  );
}
