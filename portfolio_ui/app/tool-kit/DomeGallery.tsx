"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import "./DomeGallery.css";

export type Tool = {
  name: string;
  mark: string;
  category: "Languages" | "ML / AI" | "LLMs" | "Data";
  accent: string;
};

type DomeGalleryProps = {
  tools: Tool[];
  animateIn?: boolean;
  fit?: number;
  minRadius?: number;
  maxVerticalRotationDeg?: number;
  dragSensitivity?: number;
  segments?: number;
};

type DomeItem = Tool & { x: number; y: number; index: number };

type DragState = {
  pointerId: number;
  startX: number;
  startY: number;
  startRotation: { x: number; y: number };
};

const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max);

function buildItems(tools: Tool[], segments: number): DomeItem[] {
  const columns = Array.from({ length: segments }, (_, index) => -segments / 2 + index);
  const rows = [-4, -2, 0, 2, 4];

  return columns.flatMap((x, column) =>
    rows.map((baseY, row) => {
      const index = column * rows.length + row;
      const tool = tools[((index % tools.length) + tools.length) % tools.length];

      return {
        ...tool,
        x: x * 2,
        y: baseY + (column % 2 ? 1 : 0),
        index,
      };
    }),
  );
}

export default function DomeGallery({
  tools,
  animateIn = false,
  fit = 0.64,
  minRadius = 520,
  maxVerticalRotationDeg = 9,
  dragSensitivity = 18,
  segments = 32,
}: DomeGalleryProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const sphereRef = useRef<HTMLDivElement>(null);
  const rotationRef = useRef({ x: -1.5, y: 0 });
  const dragRef = useRef<DragState | null>(null);
  const didDragRef = useRef(false);
  const [selected, setSelected] = useState<Tool | null>(null);
  const items = useMemo(() => buildItems(tools, segments), [segments, tools]);

  const applyRotation = useCallback((x: number, y: number) => {
    if (sphereRef.current) {
      sphereRef.current.style.transform =
        `translateZ(calc(var(--dome-radius) * -1)) rotateX(${x}deg) rotateY(${y}deg)`;
    }
  }, []);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const updateRadius = () => {
      const { width, height } = root.getBoundingClientRect();
      const radius = Math.max(minRadius, Math.min(width * fit, height * 1.22));
      root.style.setProperty("--dome-radius", `${Math.round(radius)}px`);
      applyRotation(rotationRef.current.x, rotationRef.current.y);
    };

    updateRadius();
    const observer = new ResizeObserver(updateRadius);
    observer.observe(root);
    return () => observer.disconnect();
  }, [applyRotation, fit, minRadius]);

  useEffect(() => {
    if (!selected) return;

    const close = (event: KeyboardEvent) => {
      if (event.key === "Escape") setSelected(null);
    };

    window.addEventListener("keydown", close);
    return () => window.removeEventListener("keydown", close);
  }, [selected]);

  const handlePointerDown = (event: React.PointerEvent<HTMLElement>) => {
    if (event.pointerType === "mouse" && event.button !== 0) return;

    event.currentTarget.setPointerCapture(event.pointerId);
    dragRef.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      startRotation: { ...rotationRef.current },
    };
    didDragRef.current = false;
  };

  const handlePointerMove = (event: React.PointerEvent<HTMLElement>) => {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== event.pointerId) return;

    const moveX = event.clientX - drag.startX;
    const moveY = event.clientY - drag.startY;
    if (Math.abs(moveX) > 3 || Math.abs(moveY) > 3) didDragRef.current = true;

    const next = {
      x: clamp(
        drag.startRotation.x - moveY / dragSensitivity,
        -maxVerticalRotationDeg,
        maxVerticalRotationDeg,
      ),
      y: drag.startRotation.y + moveX / dragSensitivity,
    };

    rotationRef.current = next;
    applyRotation(next.x, next.y);
  };

  const handlePointerEnd = (event: React.PointerEvent<HTMLElement>) => {
    if (dragRef.current?.pointerId !== event.pointerId) return;
    if (didDragRef.current) event.preventDefault();
    dragRef.current = null;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  };

  const handleToolClick = (
    _event: React.MouseEvent<HTMLButtonElement>,
    tool: Tool,
  ) => {
    setSelected(tool);
  };

  return (
    <div
      ref={rootRef}
      className={`dome-root ${animateIn ? "dome-root--entering" : ""}`}
      style={{ "--dome-segments": segments } as React.CSSProperties}
    >
      <div
        className="dome-main"
        aria-label="Interactive dome of tools. Drag to rotate."
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerEnd}
        onPointerCancel={handlePointerEnd}
      >
        <div className="dome-stage">
          <div ref={sphereRef} className="dome-sphere">
            {items.map((item) => (
              <div
                className="dome-item"
                key={`${item.name}-${item.index}`}
                style={
                  {
                    "--dome-x": item.x,
                    "--dome-y": item.y,
                    "--dome-enter-delay": `${300 + (item.index % tools.length) * 28}ms`,
                  } as React.CSSProperties
                }
              >
                <button
                  className="tool-tile"
                  type="button"
                  aria-label={`Open ${item.name} card`}
                  onClick={(event) => handleToolClick(event, item)}
                >
                  <span className="tool-tile__top">
                    <span>{String((item.index % tools.length) + 1).padStart(2, "0")}</span>
                    <span>{item.category}</span>
                  </span>
                  <strong style={{ color: item.accent }}>{item.mark}</strong>
                  <span className="tool-tile__name">{item.name}</span>
                </button>
              </div>
            ))}
          </div>
        </div>
        <div className="dome-shade" aria-hidden="true" />
        <div className="dome-scanlines" aria-hidden="true" />
      </div>

      {selected && (
        <div className="tool-detail" role="dialog" aria-modal="true" aria-label={`${selected.name} details`}>
          <button
            className="tool-detail__scrim"
            type="button"
            aria-label="Close tool card"
            onClick={() => setSelected(null)}
          />
          <article className="tool-detail__card">
            <span className="tool-detail__category">{selected.category}</span>
            <strong style={{ color: selected.accent }}>{selected.mark}</strong>
            <h2>{selected.name}</h2>
            <p>Part of the toolkit I use to turn messy signals into working systems.</p>
            <button type="button" onClick={() => setSelected(null)}>
              Close / Esc
            </button>
          </article>
        </div>
      )}
    </div>
  );
}
