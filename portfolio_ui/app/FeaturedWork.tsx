"use client";

import { useEffect, useRef, type ReactNode } from "react";
import Link from "next/link";

// Private-leaderboard ROC AUC per saved experiment, from the F1 Pit Stops project.
const f1Progression = [0.93265, 0.93609, 0.93609, 0.94878, 0.95068, 0.95256, 0.95315, 0.95369];

function F1Sparkline() {
  const min = 0.93;
  const max = 0.956;
  const points = f1Progression.map((score, index) => [
    8 + (index / (f1Progression.length - 1)) * 184,
    92 - ((score - min) / (max - min)) * 80,
  ]);
  const path = points.map(([x, y], index) => `${index ? "L" : "M"}${x.toFixed(1)} ${y.toFixed(1)}`).join(" ");
  const [lastX, lastY] = points[points.length - 1];

  return (
    <svg className="featured-card__chart" viewBox="0 0 200 100" preserveAspectRatio="none" aria-hidden="true">
      {[24, 48, 72].map((y) => <line key={y} x1="0" x2="200" y1={y} y2={y} />)}
      <path className="featured-card__area" d={`${path} L${lastX} 100 L8 100 Z`} />
      <path className="featured-card__line" d={path} />
      {points.map(([x, y], index) => <circle key={index} cx={x} cy={y} r={index === points.length - 1 ? 3.4 : 1.8} />)}
      <circle className="featured-card__pulse" cx={lastX} cy={lastY} r="7" />
    </svg>
  );
}

// VectorFlow placeholder: one stroke redrawn frame by frame as cubic Béziers, handles and all.
type Curve = number[]; // p0, c1, c2, p1, c3, c4, p2 as x/y pairs
const vectorFrames: Curve[] = [
  [18, 78, 46, 20, 84, 22, 100, 56, 116, 90, 152, 98, 182, 38],
  [18, 62, 44, 96, 82, 94, 100, 52, 118, 12, 154, 20, 182, 70],
  [18, 74, 58, 36, 80, 72, 100, 42, 120, 12, 146, 86, 182, 52],
];
const loopedFrames = [...vectorFrames, vectorFrames[0]];
const curvePath = (c: Curve, dy = 0) =>
  `M${c[0]} ${c[1] + dy} C${c[2]} ${c[3] + dy} ${c[4]} ${c[5] + dy} ${c[6]} ${c[7] + dy} C${c[8]} ${c[9] + dy} ${c[10]} ${c[11] + dy} ${c[12]} ${c[13] + dy}`;
const valuesAt = (index: number, offset = 0) => loopedFrames.map((frame) => frame[index] + offset).join(";");
const timing = {
  dur: "7.5s",
  repeatCount: "indefinite",
  calcMode: "spline",
  keyTimes: "0;0.33;0.66;1",
  keySplines: "0.45 0 0.2 1;0.45 0 0.2 1;0.45 0 0.2 1",
};
const handles = [[0, 2], [6, 4], [6, 8], [12, 10]];
const controls = [2, 4, 8, 10];
const anchors = [0, 6, 12];

function VectorFlowVisual() {
  const svg = useRef<SVGSVGElement>(null);
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) svg.current?.pauseAnimations();
  }, []);
  const first = vectorFrames[0];

  return (
    <svg ref={svg} className="featured-card__vector" viewBox="0 0 200 112" aria-hidden="true">
      <defs>
        <pattern id="vectorflow-pixels" width="6" height="6" patternUnits="userSpaceOnUse">
          <rect x="1" y="1" width="3.2" height="3.2" rx="0.6" />
        </pattern>
      </defs>
      <rect className="featured-card__pixels" x="0" y="0" width="200" height="112" />
      <rect className="featured-card__scan" x="-40" y="0" width="40" height="112">
        <animate attributeName="x" values="-40;200" dur="2.5s" repeatCount="indefinite" />
      </rect>
      {[18, 9].map((dy) => (
        <path key={dy} className="featured-card__ghost" d={curvePath(first, dy)}>
          <animate attributeName="d" values={loopedFrames.map((frame) => curvePath(frame, dy)).join(";")} {...timing} begin={`-${dy / 18}s`} />
        </path>
      ))}
      {handles.map(([from, to]) => (
        <line key={`${from}-${to}`} className="featured-card__handle" x1={first[from]} y1={first[from + 1]} x2={first[to]} y2={first[to + 1]}>
          <animate attributeName="x1" values={valuesAt(from)} {...timing} />
          <animate attributeName="y1" values={valuesAt(from + 1)} {...timing} />
          <animate attributeName="x2" values={valuesAt(to)} {...timing} />
          <animate attributeName="y2" values={valuesAt(to + 1)} {...timing} />
        </line>
      ))}
      <path className="featured-card__curve" d={curvePath(first)}>
        <animate attributeName="d" values={loopedFrames.map((frame) => curvePath(frame)).join(";")} {...timing} />
      </path>
      {controls.map((index) => (
        <circle key={index} className="featured-card__control" cx={first[index]} cy={first[index + 1]} r="2.2">
          <animate attributeName="cx" values={valuesAt(index)} {...timing} />
          <animate attributeName="cy" values={valuesAt(index + 1)} {...timing} />
        </circle>
      ))}
      {anchors.map((index) => (
        <rect key={index} className="featured-card__anchor" x={first[index] - 3} y={first[index + 1] - 3} width="6" height="6">
          <animate attributeName="x" values={valuesAt(index, -3)} {...timing} />
          <animate attributeName="y" values={valuesAt(index + 1, -3)} {...timing} />
        </rect>
      ))}
      <text className="featured-card__tag" x="8" y="13">MP4 → CUBIC BÉZIER</text>
      <g className="featured-card__timeline">
        <line x1="8" x2="192" y1="104" y2="104" />
        {Array.from({ length: 24 }, (_, index) => <line key={index} x1={8 + index * 8} x2={8 + index * 8} y1="101.5" y2="104" />)}
        <rect y="100" width="3" height="8" rx="1" x="8">
          <animate attributeName="x" values="8;189" dur="7.5s" repeatCount="indefinite" />
        </rect>
      </g>
    </svg>
  );
}

// GeoHab placeholder: a stylised cove where a model sweep classifies the seafloor into the
// five real habitat classes, each drawn as its own glyph so it reads in any theme.
type Habitat = "alg" | "fmat" | "nvb" | "sgam" | "sgz";
const HABITATS: Array<{ id: Habitat; code: string }> = [
  { id: "alg", code: "ALG" },
  { id: "fmat", code: "FMAT" },
  { id: "nvb", code: "NVB" },
  { id: "sgam", code: "SGAM" },
  { id: "sgz", code: "SGZ" },
];
const SEABED_BOTTOM = 94;
const coastAt = (x: number) => 30 + 16 * Math.sin((x + 20) / 34) + 6 * Math.sin(x / 11 + 2);
// Integer hash keeps the pattern identical on the server and in the browser.
const noiseAt = (i: number, j: number, salt: number) => {
  let h = Math.imul(i * 374761393 + j * 668265263 + salt * 2147483647, 1274126177);
  h = Math.imul(h ^ (h >>> 13), 1103515245);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
};
const seabedCells = (() => {
  const cells: Array<{ x: number; y: number; habitat: Habitat }> = [];
  for (let i = 0; i < 29; i += 1) {
    for (let j = 0; j < 14; j += 1) {
      const x = 3.5 + i * 7;
      const y = 3.5 + j * 7;
      const depth = y - coastAt(x);
      if (depth < 3 || y > SEABED_BOTTOM - 2) continue;
      const d = depth + (noiseAt(i, j, 1) - 0.5) * 10;
      let habitat: Habitat = d < 9 ? "sgz" : d < 19 ? "sgam" : d < 33 ? "alg" : "nvb";
      if (d > 14 && d < 42 && noiseAt(i, j, 2) > 0.84) habitat = "fmat";
      cells.push({ x, y, habitat });
    }
  }
  return cells;
})();
const coastline = Array.from({ length: 41 }, (_, index) => `${index ? "L" : "M"}${index * 5} ${coastAt(index * 5).toFixed(1)}`).join(" ");
const contours = [12, 25, 40, 56].map((offset) =>
  Array.from({ length: 41 }, (_, index) => {
    const x = index * 5;
    return `${index ? "L" : "M"}${x} ${Math.min(SEABED_BOTTOM, coastAt(x) + offset + 2 * Math.sin(x / 9 + offset)).toFixed(1)}`;
  }).join(" "),
);
const sweep = { dur: "6s", repeatCount: "indefinite" };

function HabitatGlyph({ habitat, x, y }: { habitat: Habitat; x: number; y: number }) {
  if (habitat === "alg") return <circle className="geo-alg" cx={x} cy={y} r="1.7" />;
  if (habitat === "fmat") return <rect className="geo-fmat" x={x - 1.6} y={y - 1.6} width="3.2" height="3.2" />;
  if (habitat === "sgam") return <line className="geo-grass" x1={x} y1={y - 2.2} x2={x} y2={y + 2.2} />;
  if (habitat === "sgz") return <line className="geo-grass" x1={x - 1.8} y1={y + 1.8} x2={x + 1.8} y2={y - 1.8} />;
  return <circle className="geo-nvb" cx={x} cy={y} r="0.8" />;
}

function GeoHabVisual() {
  const svg = useRef<SVGSVGElement>(null);
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      svg.current?.pauseAnimations();
      svg.current?.setCurrentTime(3.6);
    }
  }, []);

  return (
    <svg ref={svg} className="featured-card__vector featured-card__geohab" viewBox="0 0 200 112" aria-hidden="true">
      <defs>
        <pattern id="geohab-hatch" width="4" height="4" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
          <line x1="0" y1="0" x2="0" y2="4" />
        </pattern>
        <clipPath id="geohab-sweep">
          <rect x="0" y="0" width="0" height="112">
            <animate attributeName="width" values="0;200;200" keyTimes="0;0.6;1" {...sweep} />
          </rect>
        </clipPath>
      </defs>
      <path className="featured-card__land" d={`${coastline} L200 0 L0 0 Z`} />
      {contours.map((d) => <path key={d} className="featured-card__contour" d={d} />)}
      <path className="featured-card__coast" d={coastline} />
      <g className="featured-card__backscatter">
        {seabedCells.map((cell) => <circle key={`${cell.x}-${cell.y}`} cx={cell.x} cy={cell.y} r="0.7" />)}
      </g>
      <g clipPath="url(#geohab-sweep)">
        <g>
          <animate attributeName="opacity" values="1;1;0" keyTimes="0;0.9;1" {...sweep} />
          {seabedCells.map((cell) => <HabitatGlyph key={`${cell.x}-${cell.y}`} {...cell} />)}
        </g>
      </g>
      <line className="featured-card__sweep" x1="0" x2="0" y1="0" y2={SEABED_BOTTOM}>
        <animate attributeName="x1" values="0;200;200" keyTimes="0;0.6;1" {...sweep} />
        <animate attributeName="x2" values="0;200;200" keyTimes="0;0.6;1" {...sweep} />
        <animate attributeName="opacity" values="1;1;0;0" keyTimes="0;0.58;0.6;1" {...sweep} />
      </line>
      <text className="featured-card__tag" x="8" y="13">REFUGE COVE · 25 CM GRID</text>
      <text className="featured-card__tag" x="192" y="13" textAnchor="end">N ↑</text>
      <g className="featured-card__legend">
        <rect x="0" y={SEABED_BOTTOM + 2} width="200" height={112 - SEABED_BOTTOM - 2} />
        {HABITATS.map((item, index) => (
          <g key={item.id}>
            <HabitatGlyph habitat={item.id} x={12 + index * 38} y={SEABED_BOTTOM + 9} />
            <text className="featured-card__tag" x={18 + index * 38} y={SEABED_BOTTOM + 11}>{item.code}</text>
          </g>
        ))}
      </g>
    </svg>
  );
}

const projects: Array<{
  id: string;
  index: string;
  focus: string;
  name: string;
  summary: string;
  metric: string;
  metricLabel: string;
  note: string;
  visual: ReactNode;
  href: string | null;
}> = [
  {
    id: "geohab",
    index: "01",
    focus: "Geospatial ML",
    name: "GeoHab",
    summary: "Predicting five seafloor habitat classes from bathymetry and backscatter.",
    metric: "0.859",
    metricLabel: "Private weighted F1",
    note: "1st public · 13th private",
    visual: <GeoHabVisual />,
    href: "/work#geohab",
  },
  {
    id: "f1-pit-stops",
    index: "02",
    focus: "Predictive ML",
    name: "F1 Pit Stops",
    summary: "Lap-level model that turns tyre, timing and race context into a pit-stop probability.",
    metric: "0.954",
    metricLabel: "Private ROC AUC",
    note: "+0.018 over baseline",
    visual: <F1Sparkline />,
    href: "/work#f1-pit-stops",
  },
  {
    id: "vectorflow",
    index: "03",
    focus: "Desktop app · Video",
    name: "VectorFlow",
    summary: "Redraws any video as animated cubic Bézier curves. Choose a video, convert, then preview or export.",
    metric: "Auto",
    metricLabel: "No manual tracing",
    note: "Local Windows app",
    visual: <VectorFlowVisual />,
    // No project page yet, so this card is not a link.
    href: null,
  },
];

export default function FeaturedWork() {
  return (
    <section className="about-group featured-work" aria-labelledby="featured-work-title">
      <header className="featured-work__header">
        <h2 className="about-group__label" id="featured-work-title"><span>02</span>Selected work</h2>
        <Link href="/work" className="featured-work__all">All projects <span aria-hidden="true">↗</span></Link>
      </header>
      <div className="featured-work__list">
        {projects.map((project) => {
          const body = (
            <>
              <span className="featured-card__visual">{project.visual}</span>
              <span className="featured-card__meta">
                <span>{project.index} / {project.focus}</span>
                <span aria-hidden="true">{project.href ? "↗" : "New"}</span>
              </span>
              <strong className="featured-card__name">{project.name}</strong>
              <span className="featured-card__summary">{project.summary}</span>
              <span className="featured-card__result">
                <b>{project.metric}</b>
                <span>{project.metricLabel}<small>{project.note}</small></span>
              </span>
            </>
          );
          return project.href
            ? <Link key={project.id} href={project.href} className={`featured-card featured-card--${project.id}`}>{body}</Link>
            : <article key={project.id} className={`featured-card featured-card--${project.id} is-static`}>{body}</article>;
        })}
      </div>
    </section>
  );
}
