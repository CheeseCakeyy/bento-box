"use client";

import Link from "next/link";
import ThemeSwitcher from "../ThemeSwitcher";
import DomeGallery from "./DomeGallery";
import { TOOLS } from "./tools";
import "./tool-kit.css";

export default function ToolkitExperience() {
  return (
    <div className="toolkit-shell">
      <main className="toolkit-page" aria-labelledby="toolkit-title">
        <header className="toolkit-header">
          <div className="toolkit-header__left">
            <Link className="toolkit-back" href="/#about">
              ← Main menu
            </Link>
            <span className="toolkit-route">02 / Tool kit</span>
            <h1 id="toolkit-title">The working set.</h1>
          </div>

          <div className="toolkit-header__right">
            <p className="toolkit-instructions">
              Drag to orbit
              <br />
              Tap a card to inspect
            </p>
            <ThemeSwitcher />
          </div>
        </header>

        <div className="toolkit-legend" aria-label="Tool categories">
          <span>Languages</span>
          <span>ML / AI</span>
          <span>LLMs</span>
          <span>Data</span>
        </div>

        <DomeGallery tools={TOOLS} animateIn />

        <footer className="toolkit-footer">
          <span>{TOOLS.length} tools / one evolving system</span>
          <Link href="/work">Back to work →</Link>
        </footer>

        <div className="floating-nav-wrap toolkit-nav-wrap">
          <nav className="floating-nav" aria-label="Primary navigation">
            <Link href="/work">Work</Link>
            <Link className="is-current" href="/tool-kit" aria-current="page">
              Tool kit
            </Link>
            <Link href="/#about">About</Link>
            <Link href="/collection">Collection</Link>
            <Link href="/contact">Contact</Link>
          </nav>
        </div>
      </main>
    </div>
  );
}
