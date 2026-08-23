"use client";

import { useState } from "react";

type FragmentItem = {
  text: string;
  source: string;
};

type FragmentCategory = {
  label: string;
  items: FragmentItem[];
};

const fragmentCategories: FragmentCategory[] = [
  {
    label: "One-liners",
    items: [
      {
        text: "I love a cute little morning text like: “The college burned down last night.”",
        source: "Saved line / Anup",
      },
      {
        text: "If you ever feel sad, just text me! I’ll sing for you, then you realize my voice is worse than your problems.",
        source: "Saved reel",
      },
      {
        text: "Use y = mx + b to calculate the slope of the line you just crossed.",
        source: "Saved line",
      },
      {
        text: "I knew it was a bad idea. Just wanted to see how bad.",
        source: "Saved reel",
      },
      {
        text: "Studying coz why the hell is she smarter than me.",
        source: "Saved reel",
      },
      {
        text: "I like my music at the volume where I can’t hear the world.",
        source: "Saved line",
      },
      {
        text: "Arguing with me is pointless; the grass is blue for me as long as it irritates you.",
        source: "Saved line",
      },
    ],
  },
  {
    label: "Quotes",
    items: [
      {
        text: "Distance isn’t the amount of miles between us; it’s the amount of things we don’t say to each other…",
        source: "We’re Not Really Strangers",
      },
      {
        text: "There’s no such thing as useless effort.",
        source: "Hinata Shoyo",
      },
      {
        text: "When you hit rock bottom, the only way to go is… Up! Up! Up!",
        source: "Saved line",
      },
      {
        text: "A real person has two reasons for doing anything… a good reason and the real reason.",
        source: "Anonymous",
      },
    ],
  },
  {
    label: "Absurd wisdom",
    items: [
      {
        text: "I went outside once. The graphics were terrible.",
        source: "Gamer",
      },
      {
        text: "Once a wise cat said: Meoww Meow Meoww.",
        source: "Cat",
      },
      {
        text: "If Internet Explorer is brave enough to ask you to be your default browser, you’re brave enough to ask that girl out.",
        source: "Internet folklore",
      },
      {
        text: "Damn, I can’t believe I missed my 8 AM class tomorrow. That’s crazy.",
        source: "Skipped Studio",
      },
      {
        text: "We all have that one friend who was born on their birthday.",
        source: "Saved reel",
      },
      {
        text: "The sooner you fall behind, the more time you’ll have to catch up!",
        source: "Internet wisdom",
      },
    ],
  },
];

export default function FragmentReader() {
  const [categoryIndex, setCategoryIndex] = useState(0);
  const [itemIndex, setItemIndex] = useState(0);
  const category = fragmentCategories[categoryIndex];
  const fragment = category.items[itemIndex];

  const selectCategory = (nextCategoryIndex: number) => {
    setCategoryIndex(nextCategoryIndex);
    setItemIndex(0);
  };

  const selectRelative = (direction: number) => {
    setItemIndex((current) => (
      current + direction + category.items.length
    ) % category.items.length);
  };

  return (
    <article className="collection-card collection-card--fragments">
      <header className="collection-card__header">
        <span>Fragments / Loose ends</span>
        <span>
          {String(itemIndex + 1).padStart(2, "0")} / {String(category.items.length).padStart(2, "0")}
        </span>
      </header>

      <div className="collection-fragments__body">
        <div className="fragment-reader__index">
          <h3>Small things that stayed.</h3>
          <div className="collection-fragment-types" aria-label="Fragment categories">
            {fragmentCategories.map((entry, index) => (
              <button
                className={index === categoryIndex ? "is-active" : ""}
                type="button"
                aria-pressed={index === categoryIndex}
                key={entry.label}
                onClick={() => selectCategory(index)}
              >
                <span>{entry.label}</span>
                <i>{String(entry.items.length).padStart(2, "0")}</i>
              </button>
            ))}
          </div>
        </div>

        <figure className="fragment-reader__stage" key={`${categoryIndex}-${itemIndex}`}>
          <blockquote aria-live="polite">{fragment.text}</blockquote>
          <figcaption>
            <span>{fragment.source}</span>
            <span>{category.label}</span>
          </figcaption>
          <div className="fragment-reader__controls" role="group" aria-label="Fragment controls">
            <button type="button" aria-label="Previous fragment" onClick={() => selectRelative(-1)}>
              <span aria-hidden="true">←</span>
            </button>
            <button type="button" aria-label="Next fragment" onClick={() => selectRelative(1)}>
              <span aria-hidden="true">→</span>
            </button>
          </div>
        </figure>
      </div>
    </article>
  );
}
