"use client";

import { experiments } from "./WorkPreviews";

const TEASED = ["koi-pond", "keyspace", "cherry-blossom", "little-fizz"];

// A glimpse of the Web & interaction tab, so the experiments are not hidden behind it.
export default function WebTeaser() {
  const items = TEASED.map((slug) => experiments.find((experiment) => experiment.slug === slug)).filter((item) => item !== undefined);

  return (
    <section className="web-teaser" aria-labelledby="web-teaser-title">
      <header className="web-teaser__header">
        <div>
          <span className="showcase-eyebrow">Also on the next tab</span>
          <h2 id="web-teaser-title">Web &amp; interaction</h2>
        </div>
        <a href="#web" className="web-teaser__all">See all {String(experiments.length).padStart(2, "0")} <span aria-hidden="true">→</span></a>
      </header>
      <div className="web-teaser__list">
        {items.map((experiment) => (
          <a key={experiment.slug} href={`#web-${experiment.slug}`} className={`web-teaser__card web-teaser__card--${experiment.slug}`}>
            <span className="web-teaser__poster"><img src={experiment.poster} alt="" loading="lazy" /></span>
            <strong>{experiment.name}</strong>
            <span>{experiment.interaction}</span>
          </a>
        ))}
      </div>
    </section>
  );
}
