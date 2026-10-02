"use client";

import { useEffect, useRef, useState, type KeyboardEvent, type PointerEvent } from "react";

// Mirrors VectorFlow's own Bézier playground: drag the four points, double-click to reset.
type Point = { x: number; y: number };
const WIDTH = 400;
const HEIGHT = 200;
const START: Point[] = [{ x: 40, y: 160 }, { x: 110, y: 28 }, { x: 290, y: 28 }, { x: 360, y: 160 }];
const LABELS = ["P₀", "P₁", "P₂", "P₃"];
const clamp = (value: number, max: number) => Math.round(Math.max(8, Math.min(max - 8, value)));

export default function BezierPlayground() {
  const svg = useRef<SVGSVGElement>(null);
  const [points, setPoints] = useState(START);
  const [dragging, setDragging] = useState<number | null>(null);
  const [p0, p1, p2, p3] = points;
  const curve = `M${p0.x} ${p0.y} C${p1.x} ${p1.y} ${p2.x} ${p2.y} ${p3.x} ${p3.y}`;

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) svg.current?.pauseAnimations();
  }, []);

  const toLocal = (event: PointerEvent<SVGSVGElement>) => {
    const box = event.currentTarget.getBoundingClientRect();
    return {
      x: clamp(((event.clientX - box.left) / box.width) * WIDTH, WIDTH),
      y: clamp(((event.clientY - box.top) / box.height) * HEIGHT, HEIGHT),
    };
  };
  const move = (index: number, next: Point) => setPoints((current) => current.map((point, i) => (i === index ? next : point)));
  const nudge = (event: KeyboardEvent<SVGGElement>, index: number) => {
    const step = event.shiftKey ? 10 : 2;
    const delta = { ArrowLeft: [-step, 0], ArrowRight: [step, 0], ArrowUp: [0, -step], ArrowDown: [0, step] }[event.key];
    if (!delta) return;
    event.preventDefault();
    const point = points[index];
    move(index, { x: clamp(point.x + delta[0], WIDTH), y: clamp(point.y + delta[1], HEIGHT) });
  };

  return (
    <div className="bezier-playground">
      <svg
        ref={svg}
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        aria-label="Cubic Bézier playground. Drag a point or focus it and use the arrow keys. Double-click to reset."
        className={dragging !== null ? "is-dragging" : ""}
        onPointerMove={(event) => { if (dragging !== null) move(dragging, toLocal(event)); }}
        onPointerUp={() => setDragging(null)}
        onPointerCancel={() => setDragging(null)}
        onDoubleClick={() => setPoints(START)}
      >
        <line className="bezier-playground__handle" x1={p0.x} y1={p0.y} x2={p1.x} y2={p1.y} />
        <line className="bezier-playground__handle" x1={p3.x} y1={p3.y} x2={p2.x} y2={p2.y} />
        <path className="bezier-playground__hull" d={`M${p0.x} ${p0.y} L${p1.x} ${p1.y} L${p2.x} ${p2.y} L${p3.x} ${p3.y}`} />
        <path className="bezier-playground__curve" d={curve} />
        <circle className="bezier-playground__tracer" r="3.5">
          <animateMotion dur="3.2s" repeatCount="indefinite" path={curve} />
        </circle>
        {points.map((point, index) => (
          <g
            key={LABELS[index]}
            className={`bezier-playground__point ${index === 0 || index === 3 ? "is-anchor" : "is-control"}`}
            role="slider"
            tabIndex={0}
            aria-label={`${LABELS[index]} at ${point.x}, ${point.y}`}
            aria-valuetext={`${point.x}, ${point.y}`}
            onPointerDown={(event) => {
              event.currentTarget.ownerSVGElement?.setPointerCapture(event.pointerId);
              setDragging(index);
            }}
            onKeyDown={(event) => nudge(event, index)}
          >
            <circle className="bezier-playground__hit" cx={point.x} cy={point.y} r="16" />
            {index === 0 || index === 3
              ? <rect x={point.x - 5} y={point.y - 5} width="10" height="10" rx="1.5" />
              : <circle cx={point.x} cy={point.y} r="5.5" />}
            <text x={point.x + 10} y={point.y - 9}>{LABELS[index]}</text>
          </g>
        ))}
      </svg>
      <div className="bezier-playground__readout" aria-hidden="true">
        {points.map((point, index) => <span key={LABELS[index]}><b>{LABELS[index]}</b>{point.x}, {point.y}</span>)}
        <em>Drag a point · double-click to reset</em>
      </div>
    </div>
  );
}
