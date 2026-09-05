"use client";

import { useState } from "react";
import type { Tool } from "./DomeGallery";
import Link from "next/link";
import ThemeSwitcher from "../ThemeSwitcher";
import DomeGallery from "./DomeGallery";
import { TOOLS } from "./tools";
import "./tool-kit.css";

export default function ToolkitExperience() {
  const [activeCategory, setActiveCategory] = useState<Tool["category"] | null>(null);
  const categories: Tool["category"][] = ["Languages", "ML / AI", "LLMs", "Data", "Engineering"];
  const matchCount = TOOLS.filter((tool) => !activeCategory || tool.category === activeCategory).length;
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

        <div className="toolkit-legend" role="group" aria-label="Highlight tools by category">
          <button type="button" aria-pressed={!activeCategory} onClick={() => setActiveCategory(null)}>All</button>
          {categories.map((category) => (
            <button key={category} type="button" aria-pressed={activeCategory === category}
              onClick={() => setActiveCategory((current) => current === category ? null : category)}>
              {category}
            </button>
          ))}
        </div>
        <DomeGallery tools={TOOLS} activeCategory={activeCategory} animateIn />

        <footer className="toolkit-footer">
          <span role="status" aria-live="polite">{activeCategory ? `${matchCount} highlighted / ${activeCategory}` : `${TOOLS.length} tools & skills / explore a category`}</span>
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
