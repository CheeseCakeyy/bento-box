"use client";

import type { CSSProperties } from "react";
import { useState } from "react";

type PoemLineStyle = CSSProperties & {
  "--poem-line": number;
};

type Poem = {
  label: string;
  context?: string;
  closing?: boolean;
  stanzas: string[][];
};

const poems: Poem[] = [
  {
    label: "Untitled / 01",
    context:
      "Written for a film-review presentation—the film was about waiting for the right moment to ask the love of your life out.",
    stanzas: [
      [
        "I’M IN LOVE, BUT I’LL WAIT.",
        "KINDA WANT TO HEAR IT FROM HER,",
        "THAT SHE’D LIKE TO DATE.",
        "I WONDER IF IT IS MY FATE,",
        "CUZ TIME THAT I SPENT WITH HER WAS GREAT!!",
        "I WANT TO CONFESS BUT THE SAME THOUGHT STRIKS ME,",
        "IS IT TOO LATE?? IS IT TOO LATE??",
      ],
    ],
  },
  {
    label: "Untitled / 02",
    stanzas: [
      [
        "Today was really cold",
        "I had put her on hold",
        "Cuz I was tryna be bold",
        "Shaping my feelings about her into a mold",
      ],
      [
        "What came out was purely gold",
        "But",
        "She said she didn’t understand it",
        "And started walking a path that was 12 years old",
      ],
      [
        "This was a story not to be told",
        "My heart felt heavy so I had to let it go",
      ],
    ],
  },
  {
    label: "Untitled / 03",
    stanzas: [
      [
        "My friend is absent, why I wonder,",
        "Coming to college today feels like a blunder",
      ],
      [
        "Learning all this shit, life feels like",
        "I wanna surrender,",
      ],
      ["Sitting aimlessly without any agenda"],
    ],
  },
  {
    label: "Untitled / 04",
    stanzas: [
      [
        "She’s the reason I live or die,",
        "That’s the truth, doesn’t matter how much I deny.",
      ],
      [
        "She’s the reason my days feel hopeful but dry",
        "I still keep on wondering why",
        "Her beauty and that sparkling side eye",
        "It just explains, why sea is important to the sky!",
      ],
    ],
  },
  {
    label: "More / Soon",
    closing: true,
    stanzas: [["More will be added when the poet in me finds inspiration again."]],
  },
];

export default function PoemReader() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [reading, setReading] = useState(0);
  const poem = poems[activeIndex];
  const allLines = poem.stanzas.flat();
  const isClosing = poem.closing === true;

  const selectRelative = (direction: number) => {
    setActiveIndex((current) => (current + direction + poems.length) % poems.length);
    setReading(0);
  };

  return (
    <article className="collection-card collection-card--poems">
      <header className="collection-card__header">
        <span>Poems / Reading room</span>
        <span>{String(activeIndex + 1).padStart(2, "0")} / {String(poems.length).padStart(2, "0")}</span>
      </header>

      <figure
        className={`poem-reader${isClosing ? " is-closing" : ""}`}
        key={`${activeIndex}-${reading}`}
      >
        <blockquote aria-label={allLines.join(" ")}>
          {poem.stanzas.map((stanza, stanzaIndex) => (
            <span className="poem-reader__stanza" key={stanza.join("-")}>
              {stanza.map((line, lineIndex) => {
                const animationIndex = poem.stanzas
                  .slice(0, stanzaIndex)
                  .reduce((total, current) => total + current.length, 0) + lineIndex;
                const isRefrain = !isClosing &&
                  stanzaIndex === poem.stanzas.length - 1 && lineIndex === stanza.length - 1;

                return (
                  <span
                    className={`poem-reader__line${isRefrain ? " is-refrain" : ""}`}
                    key={line}
                    style={{ "--poem-line": animationIndex } as PoemLineStyle}
                  >
                    {line}
                  </span>
                );
              })}
            </span>
          ))}
        </blockquote>
        <figcaption>
          <span>{poem.label} · {isClosing ? "To be continued" : "Original"}</span>
          {poem.context ? (
            <span className="poem-reader__context">Context / {poem.context}</span>
          ) : null}
        </figcaption>
      </figure>

      <footer className="collection-card__footer poem-reader__footer">
        <span>Read slowly</span>
        <div className="poem-reader__controls" role="group" aria-label="Poem controls">
          <button type="button" aria-label="Previous poem" onClick={() => selectRelative(-1)}>
            <span aria-hidden="true">←</span>
          </button>
          <button
            type="button"
            aria-label="Read this poem again"
            onClick={() => setReading((current) => current + 1)}
          >
            <span aria-hidden="true">↻</span>
          </button>
          <button type="button" aria-label="Next poem" onClick={() => selectRelative(1)}>
            <span aria-hidden="true">→</span>
          </button>
        </div>
      </footer>
    </article>
  );
}
