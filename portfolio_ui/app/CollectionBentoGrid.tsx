"use client";

import type { CSSProperties, KeyboardEvent, PointerEvent } from "react";
import { useEffect, useRef, useState } from "react";
import BookStack from "./BookStack";

type CardId = "books" | "poems" | "fragments" | "index";

type DragStyle = CSSProperties & {
  "--drag-x": string;
  "--drag-y": string;
};

const defaultOrder: CardId[] = ["books", "poems", "fragments", "index"];

const cardLabels: Record<CardId, string> = {
  books: "Books",
  poems: "Poems",
  fragments: "Fragments",
  index: "Archive index",
};

const isSavedOrder = (value: unknown): value is CardId[] =>
  Array.isArray(value) &&
  value.length === defaultOrder.length &&
  defaultOrder.every((id) => value.includes(id));

function CardContent({ id }: { id: CardId }) {
  if (id === "books") return <BookStack />;

  if (id === "poems") {
    return (
      <article className="collection-card collection-card--poems">
        <header className="collection-card__header">
          <span>Poems / Reading room</span>
          <span>02</span>
        </header>
        <div className="collection-poem-sheet" aria-label="Placeholder for a poem">
          <span />
          <span />
          <span />
          <span />
          <p>A quieter column for poems, drafts, and the occasional line that arrived first.</p>
        </div>
        <footer className="collection-card__footer">
          <span>Read slowly</span>
          <span aria-hidden="true">↓</span>
        </footer>
      </article>
    );
  }

  if (id === "fragments") {
    return (
      <article className="collection-card collection-card--fragments">
        <header className="collection-card__header">
          <span>Fragments / Loose ends</span>
          <span>03</span>
        </header>
        <div className="collection-fragments__body">
          <h3>Small things that stayed.</h3>
          <div className="collection-fragment-types" aria-label="Fragment categories">
            <span>Quotes</span>
            <span>One-liners</span>
            <span>Questions…</span>
          </div>
        </div>
      </article>
    );
  }

  return (
    <article className="collection-card collection-card--index">
      <header className="collection-card__header">
        <span>Archive index</span>
        <span>04</span>
      </header>
      <div className="collection-counts">
        <span><strong>Books</strong><i>03</i></span>
        <span><strong>Poems</strong><i>—</i></span>
        <span><strong>Fragments</strong><i>—</i></span>
      </div>
      <p>Counts appear as the shelves fill.</p>
    </article>
  );
}

export default function CollectionBentoGrid() {
  const [order, setOrder] = useState<CardId[]>(defaultOrder);
  const [hasLoaded, setHasLoaded] = useState(false);
  const [dragging, setDragging] = useState<CardId | null>(null);
  const [dropTarget, setDropTarget] = useState<CardId | null>(null);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [announcement, setAnnouncement] = useState("");
  const dragOrigin = useRef<{ id: CardId; x: number; y: number; pointerId: number } | null>(null);
  const dropTargetRef = useRef<CardId | null>(null);

  useEffect(() => {
    try {
      const saved = JSON.parse(window.localStorage.getItem("collection-bento-order") ?? "null");
      if (isSavedOrder(saved)) setOrder(saved);
    } catch {
      // Keep the editorial default when storage is unavailable or malformed.
    }
    setHasLoaded(true);
  }, []);

  useEffect(() => {
    if (!hasLoaded) return;
    try {
      window.localStorage.setItem("collection-bento-order", JSON.stringify(order));
    } catch {
      // Reordering still works for this visit when storage is unavailable.
    }
  }, [hasLoaded, order]);

  const swapCards = (from: CardId, to: CardId) => {
    if (from === to) return;

    setOrder((current) => {
      const next = [...current];
      const fromIndex = next.indexOf(from);
      const toIndex = next.indexOf(to);
      [next[fromIndex], next[toIndex]] = [next[toIndex], next[fromIndex]];
      return next;
    });
    setAnnouncement(`${cardLabels[from]} swapped with ${cardLabels[to]}.`);
  };

  const findDropTarget = (clientX: number, clientY: number, draggedId: CardId) => {
    for (const element of document.elementsFromPoint(clientX, clientY)) {
      const block = (element as HTMLElement).closest<HTMLElement>("[data-bento-id]");
      const id = block?.dataset.bentoId as CardId | undefined;
      if (id && id !== draggedId) return id;
    }
    return null;
  };

  const updateDropTarget = (nextTarget: CardId | null) => {
    dropTargetRef.current = nextTarget;
    setDropTarget(nextTarget);
  };

  const finishDrag = (handle: HTMLButtonElement) => {
    const origin = dragOrigin.current;
    if (origin && handle.hasPointerCapture(origin.pointerId)) {
      handle.releasePointerCapture(origin.pointerId);
    }
    if (origin && dropTargetRef.current) swapCards(origin.id, dropTargetRef.current);
    dragOrigin.current = null;
    setDragging(null);
    updateDropTarget(null);
    setOffset({ x: 0, y: 0 });
  };

  const onPointerDown = (id: CardId, event: PointerEvent<HTMLButtonElement>) => {
    if (event.button !== 0) return;
    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);
    dragOrigin.current = { id, x: event.clientX, y: event.clientY, pointerId: event.pointerId };
    setDragging(id);
    updateDropTarget(null);
    setOffset({ x: 0, y: 0 });
  };

  const onPointerMove = (event: PointerEvent<HTMLButtonElement>) => {
    const origin = dragOrigin.current;
    if (!origin) return;
    setOffset({ x: event.clientX - origin.x, y: event.clientY - origin.y });
    updateDropTarget(findDropTarget(event.clientX, event.clientY, origin.id));
  };

  const onHandleKeyDown = (id: CardId, event: KeyboardEvent<HTMLButtonElement>) => {
    const index = order.indexOf(id);
    let targetIndex = index;

    if (event.key === "ArrowLeft" || event.key === "ArrowUp") targetIndex = index - 1;
    if (event.key === "ArrowRight" || event.key === "ArrowDown") targetIndex = index + 1;
    if (event.key === "Home") targetIndex = 0;
    if (event.key === "End") targetIndex = order.length - 1;
    if (targetIndex === index || targetIndex < 0 || targetIndex >= order.length) return;

    event.preventDefault();
    swapCards(id, order[targetIndex]);
  };

  return (
    <>
      <p className="visually-hidden" id="collection-bento-instructions">
        Drag a card by its dotted handle to swap it with another card. Keyboard users can focus a
        handle and use the arrow, Home, or End keys.
      </p>
      <div className="collection-bento__grid" aria-describedby="collection-bento-instructions">
        {order.map((id) => {
          const isDragging = dragging === id;
          const style: DragStyle = {
            "--drag-x": isDragging ? `${offset.x}px` : "0px",
            "--drag-y": isDragging ? `${offset.y}px` : "0px",
          };

          return (
            <div
              className={`collection-bento-block collection-bento-block--${id}${isDragging ? " is-dragging" : ""}${dropTarget === id ? " is-drop-target" : ""}`}
              data-bento-id={id}
              key={id}
              style={style}
            >
              <CardContent id={id} />
              <button
                className="collection-drag-handle"
                type="button"
                aria-label={`Rearrange ${cardLabels[id]} block`}
                title={`Drag to rearrange ${cardLabels[id]}`}
                onKeyDown={(event) => onHandleKeyDown(id, event)}
                onPointerDown={(event) => onPointerDown(id, event)}
                onPointerMove={onPointerMove}
                onPointerUp={(event) => finishDrag(event.currentTarget)}
                onPointerCancel={(event) => finishDrag(event.currentTarget)}
              >
                <span aria-hidden="true" />
              </button>
            </div>
          );
        })}
      </div>
      <p className="visually-hidden" aria-live="polite">{announcement}</p>
    </>
  );
}
