import type { Metadata } from "next";
import Link from "next/link";
import CopyEmailButton from "../CopyEmailButton";
import ThemeSwitcher from "../ThemeSwitcher";

export const metadata: Metadata = {
  title: "Contact — Adwait Tagalpallewar",
  description: "Start a conversation with Adwait Tagalpallewar about AI, data, software, research, or an interesting problem.",
};

const socialLinks = [
  { label: "Discord", href: "https://discord.com/users/1215365835393343590" },
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
        <ThemeSwitcher />
      </header>

      <main className="contact-page">
        <section className="contact-center" aria-labelledby="contact-title">
          <p>Say hi or talk future projects</p>
          <h1 id="contact-title">
            <a href="mailto:tagalpallewaradwait@gmail.com">tagalpallewaradwait@gmail.com</a>
          </h1>
          <div className="contact-pills" aria-label="Ways to contact Adwait">
            <CopyEmailButton email="tagalpallewaradwait@gmail.com" />
            {socialLinks.map((link) => (
              <a key={link.label} href={link.href} target="_blank" rel="noreferrer">
                {link.label}
              </a>
            ))}
          </div>
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
