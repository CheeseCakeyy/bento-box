"use client";

import type { CSSProperties } from "react";
import { useState } from "react";

type PoemLineStyle = CSSProperties & {
  "--poem-line": number;
};

const poem = {
  label: "Untitled / 01",
  lines: [
    "I’M IN LOVE, BUT I’LL WAIT.",
    "KINDA WANT TO HEAR IT FROM HER,",
    "THAT SHE’D LIKE TO DATE.",
    "I WONDER IF IT IS MY FATE,",
    "CUZ TIME THAT I SPENT WITH HER WAS GREAT!!",
    "I WANT TO CONFESS BUT THE SAME THOUGHT STRIKS ME,",
    "IS IT TOO LATE?? IS IT TOO LATE??",
  ],
};

export default function PoemReader() {
  const [reading, setReading] = useState(0);

  return (
    <article className="collection-card collection-card--poems">
      <header className="collection-card__header">
        <span>Poems / Reading room</span>
        <span>01 / 01</span>
      </header>

      <figure className="poem-reader" key={reading}>
        <blockquote aria-label={poem.lines.join(" ")}>
          {poem.lines.map((line, index) => (
            <span
              className={`poem-reader__line${index === poem.lines.length - 1 ? " is-refrain" : ""}`}
              key={line}
              style={{ "--poem-line": index } as PoemLineStyle}
            >
              {line}
            </span>
          ))}
        </blockquote>
        <figcaption>
          <span>{poem.label} · Original</span>
          <span className="poem-reader__context">
            Context / Written for a film-review presentation—the film was about waiting for the
            right moment to ask the love of your life out.
          </span>
        </figcaption>
      </figure>

      <footer className="collection-card__footer poem-reader__footer">
        <span>Read slowly</span>
        <button type="button" onClick={() => setReading((current) => current + 1)}>
          Read again <span aria-hidden="true">↻</span>
        </button>
      </footer>
    </article>
  );
}
