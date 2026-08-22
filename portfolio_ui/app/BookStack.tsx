"use client";

import type { CSSProperties, KeyboardEvent, PointerEvent } from "react";
import { useRef, useState } from "react";

const books = [
  {
    title: "Data Science from Scratch",
    author: "Joel Grus",
    detail: "First Principles with Python · Second Edition",
    cover: "/collection/books/01-data-science-from-scratch.jpg",
  },
  {
    title: "Deep Learning with Python",
    author: "François Chollet",
    detail: "A practical route into deep learning with Python",
    cover: "/collection/books/02-deep-learning-with-python.jpg",
  },
  {
    title: "Trustworthy Online Controlled Experiments",
    author: "Ron Kohavi · Diane Tang · Ya Xu",
    detail: "A Practical Guide to A/B Testing",
    cover: "/collection/books/03-trustworthy-online-controlled-experiments.jpg",
  },
];

type BookStyle = CSSProperties & {
  "--book-x": string;
  "--book-hover-x": string;
  "--book-y": string;
  "--book-rotate": string;
  "--book-scale": number;
};

export default function BookStack() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [dragOffset, setDragOffset] = useState(0);
  const startX = useRef<number | null>(null);
  const currentDrag = useRef(0);
  const didDrag = useRef(false);
  const activeBook = books[activeIndex];

  const selectRelative = (direction: number) => {
    setActiveIndex((current) => (current + direction + books.length) % books.length);
  };

  const relativeOffset = (index: number) => {
    let offset = index - activeIndex;
    if (offset > books.length / 2) offset -= books.length;
    if (offset < -books.length / 2) offset += books.length;
    return offset;
  };

  const onPointerDown = (event: PointerEvent<HTMLDivElement>) => {
    event.currentTarget.setPointerCapture(event.pointerId);
    startX.current = event.clientX;
    didDrag.current = false;
  };

  const onPointerMove = (event: PointerEvent<HTMLDivElement>) => {
    if (startX.current === null) return;
    const offset = Math.max(-90, Math.min(90, event.clientX - startX.current));
    if (Math.abs(offset) > 5) didDrag.current = true;
    currentDrag.current = offset;
    setDragOffset(offset);
  };

  const finishDrag = () => {
    if (startX.current === null) return;
    if (currentDrag.current < -34) selectRelative(1);
    if (currentDrag.current > 34) selectRelative(-1);
    startX.current = null;
    currentDrag.current = 0;
    setDragOffset(0);
  };

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "ArrowRight") {
      event.preventDefault();
      selectRelative(1);
    }
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      selectRelative(-1);
    }
    if (event.key === "Home") {
      event.preventDefault();
      setActiveIndex(0);
    }
    if (event.key === "End") {
      event.preventDefault();
      setActiveIndex(books.length - 1);
    }
  };

  return (
    <article className="collection-card collection-card--books">
      <header className="collection-card__header">
        <span>Books / Interactive shelf</span>
        <span>{String(activeIndex + 1).padStart(2, "0")} / {String(books.length).padStart(2, "0")}</span>
      </header>

      <div className="collection-books__body">
        <div
          className={`interactive-book-stack ${startX.current !== null ? "is-dragging" : ""}`}
          role="group"
          aria-label="Book cover carousel. Drag, swipe, or use the left and right arrow keys."
          tabIndex={0}
          style={{ "--book-drag": `${dragOffset}px` } as CSSProperties}
          onKeyDown={onKeyDown}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={finishDrag}
          onPointerCancel={finishDrag}
        >
          {books.map((book, index) => {
            const offset = relativeOffset(index);
            const depth = Math.abs(offset);
            const style: BookStyle = {
              "--book-x": `${offset * 46}px`,
              "--book-hover-x": `${offset * 68}px`,
              "--book-y": `${depth * 12}px`,
              "--book-rotate": `${offset * 7}deg`,
              "--book-scale": 1 - depth * 0.065,
              zIndex: books.length - depth,
            };

            return (
              <button
                className={`interactive-book-cover ${index === activeIndex ? "is-active" : ""}`}
                key={book.cover}
                type="button"
                style={style}
                aria-label={`Select ${book.title} by ${book.author}`}
                aria-pressed={index === activeIndex}
                onClick={() => {
                  if (!didDrag.current) setActiveIndex(index);
                }}
              >
                <img src={book.cover} alt={`${book.title} book cover`} draggable={false} />
              </button>
            );
          })}

          <div className="interactive-book-nav">
            <button type="button" aria-label="Previous book" onClick={() => selectRelative(-1)}>←</button>
            <span>Drag · swipe · arrows</span>
            <button type="button" aria-label="Next book" onClick={() => selectRelative(1)}>→</button>
          </div>
        </div>

        <div className="collection-card__copy collection-book-details" aria-live="polite">
          <small>Selected / {String(activeIndex + 1).padStart(2, "0")}</small>
          <h3>{activeBook.title}</h3>
          <p className="collection-book-details__author">{activeBook.author}</p>
          <p>{activeBook.detail}</p>
          <div className="collection-book-dots" aria-hidden="true">
            {books.map((book, index) => (
              <i className={index === activeIndex ? "is-active" : ""} key={book.cover} />
            ))}
          </div>
        </div>
      </div>
    </article>
  );
}
