"use client";

import { useEffect, useState } from "react";

type Theme = "dark" | "light" | "system";

const themeOptions: Array<{
  value: Theme;
  label: string;
  icon?: string;
  symbol?: string;
}> = [
  { value: "dark", icon: "/icons/theme-dark.png", label: "Use dark theme" },
  { value: "light", icon: "/icons/theme-light.png", label: "Use light theme" },
  { value: "system", symbol: "▣", label: "Use system theme" },
];

function EmptyLines({ count = 3 }: { count?: number }) {
  return (
    <div className="empty-lines" aria-hidden="true">
      {Array.from({ length: count }, (_, index) => (
        <span key={index} />
      ))}
    </div>
  );
}

export default function AboutPage() {
  const [theme, setTheme] = useState<Theme>("dark");
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const savedTheme = window.localStorage.getItem("portfolio-theme") as Theme | null;
    if (savedTheme && themeOptions.some((option) => option.value === savedTheme)) {
      setTheme(savedTheme);
    }
  }, []);

  useEffect(() => {
    const media = window.matchMedia("(prefers-color-scheme: dark)");

    const applyTheme = () => {
      const resolvedTheme = theme === "system" ? (media.matches ? "dark" : "light") : theme;
      document.documentElement.dataset.theme = resolvedTheme;
    };

    applyTheme();
    window.localStorage.setItem("portfolio-theme", theme);
    media.addEventListener("change", applyTheme);

    return () => media.removeEventListener("change", applyTheme);
  }, [theme]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 80);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className="site-shell">
      <header className="site-header">
        <a className="identity" href="#about" aria-label="Go to the About page">
          <span className="identity-mark" aria-hidden="true" />
          <span>Adwait Tagalpallewar</span>
        </a>

        <div className="theme-switcher" aria-label="Theme controls">
          <span className={`theme-indicator theme-indicator--${theme}`} aria-hidden="true" />
          {themeOptions.map((option) => (
            <button
              key={option.value}
              className={theme === option.value ? "is-active" : ""}
              type="button"
              aria-label={option.label}
              aria-pressed={theme === option.value}
              onClick={() => setTheme(option.value)}
            >
              {option.icon ? (
                <img className="theme-option-icon" src={option.icon} alt="" />
              ) : (
                <span className="theme-option-symbol" aria-hidden="true">
                  {option.symbol}
                </span>
              )}
            </button>
          ))}
        </div>
      </header>

      <main id="about" className="about-page">
        <section className="intro" aria-label="Introductory heading and disciplines">
          <h1 className="hero-heading">Engineer crafting intelligent systems and experiments.</h1>
          <div className="discipline-row" aria-label="Discipline links">
            <span className="discipline-label">What I do</span>
            <a href="#portfolio-grid">Train models</a>
            <a href="#portfolio-grid">Analyze results</a>
            <a href="#portfolio-grid">Experiments</a>
            <a href="#portfolio-grid">Competitive ML</a>
          </div>
        </section>

        <section id="portfolio-grid" className="portfolio-grid" aria-label="About page sections">
          <article className="panel panel--bio" aria-label="Profile and biography section">
            <div className="bio-media placeholder-surface" />
            <EmptyLines count={3} />
            <div className="bio-actions" aria-hidden="true">
              <span />
              <span />
            </div>
          </article>

          <article className="panel panel--side-project" aria-label="Latest side project section">
            <div className="side-project-mark" aria-hidden="true" />
            <EmptyLines count={2} />
          </article>

          <article className="panel panel--workspace" aria-label="Workspace section">
            <div className="workspace-window placeholder-surface" aria-hidden="true" />
          </article>

          <article className="panel panel--system" aria-label="System monitor section">
            <div className="system-screen" aria-hidden="true" />
          </article>

          <article className="panel panel--pantone" aria-label="Color swatch section">
            <div className="pantone-swatch" aria-hidden="true" />
          </article>

          <article className="panel panel--color" aria-label="Interactive color section">
            <div className="color-grid" aria-hidden="true">
              <span />
              <span />
              <span />
            </div>
          </article>

          <article className="panel panel--sneak" aria-label="In progress section">
            <div className="sneak-heading" aria-hidden="true">
              <span />
              <span />
            </div>
            <div className="reveal-bar" aria-hidden="true" />
            <div className="sneak-media placeholder-surface" aria-hidden="true" />
          </article>

          <article className="panel panel--photos" aria-label="Camera roll section">
            <div className="photo-dots" aria-hidden="true">
              {Array.from({ length: 9 }, (_, index) => (
                <span key={index} />
              ))}
            </div>
            <div className="photo-frame placeholder-surface" aria-hidden="true" />
          </article>

          <article className="panel panel--code" aria-label="Code explorer section">
            <div className="code-tree" aria-hidden="true">
              {Array.from({ length: 9 }, (_, index) => (
                <span key={index} />
              ))}
            </div>
          </article>

          <article className="panel panel--tools" aria-label="Tools section">
            <div className="tool-slots" aria-hidden="true">
              <span />
              <span />
              <span />
            </div>
          </article>

          <article className="panel panel--sketch" aria-label="Sketchbook section">
            <div className="sketch-grid" aria-hidden="true" />
          </article>

          <article className="panel panel--stamps" aria-label="Collection section">
            <div className="stamp-grid" aria-hidden="true" />
            <EmptyLines count={3} />
          </article>

          <article className="panel panel--notes" aria-label="Notes section">
            <EmptyLines count={2} />
          </article>
        </section>
      </main>

      <div className="floating-nav-wrap">
        <nav className="floating-nav" aria-label="Primary navigation">
          <a href="#work">Work</a>
          <a className="is-current" href="#about" aria-current="page">
            About
          </a>
          <a href="#shop">Shop</a>
          <a href="#contact">Contact</a>
        </nav>
        <button
          className={`scroll-top ${scrolled ? "is-visible" : ""}`}
          type="button"
          aria-label="Scroll to top"
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        >
          ↑
        </button>
      </div>
    </div>
  );
}
