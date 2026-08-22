"use client";

import { useEffect, useRef, useState } from "react";

type LatentPoint = {
  cluster: number;
  angle: number;
  radius: number;
  size: number;
  drift: number;
  phase: number;
};

const clusterNames = ["AI", "Data", "Software"];
const restingCenters = [
  [0.43, 0.43],
  [0.57, 0.43],
  [0.5, 0.57],
];
const expandedCenters = [
  [0.28, 0.34],
  [0.72, 0.35],
  [0.5, 0.7],
];

function seededRandom(seed: number) {
  let state = seed >>> 0;
  return () => {
    state += 0x6d2b79f5;
    let value = state;
    value = Math.imul(value ^ (value >>> 15), value | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
}

function createPoints(seed: number) {
  const random = seededRandom(seed);
  return Array.from({ length: 72 }, (_, index): LatentPoint => ({
    cluster: index % clusterNames.length,
    angle: random() * Math.PI * 2,
    radius: 0.025 + random() * 0.13,
    size: 1.2 + random() * 2.2,
    drift: 0.14 + random() * 0.32,
    phase: random() * Math.PI * 2,
  }));
}

export default function LatentSpace() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const activeRef = useRef(false);
  const pointerRef = useRef<{ x: number; y: number } | null>(null);
  const [active, setActive] = useState(false);
  const [seed, setSeed] = useState(17);

  const setInteractionActive = (nextActive: boolean) => {
    activeRef.current = nextActive;
    setActive(nextActive);
    if (!nextActive) pointerRef.current = null;
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const context = canvas.getContext("2d");
    if (!context) return;

    const points = createPoints(seed);
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let width = 1;
    let height = 1;
    let animationFrame = 0;
    let separation = activeRef.current ? 1 : 0;
    let palette = {
      point: "#e9e9e2",
      muted: "rgba(233, 233, 226, 0.25)",
      accent: "#e9e9e2",
    };

    const readPalette = () => {
      const styles = getComputedStyle(document.documentElement);
      const accent = styles.getPropertyValue("--accent-glow").trim();
      palette = {
        point: styles.getPropertyValue("--text").trim() || "#e9e9e2",
        muted: styles.getPropertyValue("--text-muted").trim() || "rgba(233, 233, 226, 0.25)",
        accent: accent && accent !== "transparent" ? accent : styles.getPropertyValue("--text").trim(),
      };
    };

    const resize = () => {
      const bounds = canvas.getBoundingClientRect();
      const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
      width = Math.max(1, bounds.width);
      height = Math.max(1, bounds.height);
      canvas.width = Math.round(width * pixelRatio);
      canvas.height = Math.round(height * pixelRatio);
      context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
    };

    const draw = (time: number) => {
      const targetSeparation = activeRef.current ? 1 : 0;
      separation += (targetSeparation - separation) * (reduceMotion ? 1 : 0.075);
      context.clearRect(0, 0, width, height);

      const positions = points.map((point) => {
        const resting = restingCenters[point.cluster];
        const expanded = expandedCenters[point.cluster];
        const centerX = (resting[0] + (expanded[0] - resting[0]) * separation) * width;
        const centerY = (resting[1] + (expanded[1] - resting[1]) * separation) * height;
        const motion = reduceMotion ? 0 : time * 0.00018 * point.drift;
        const radius = point.radius * Math.min(width, height) * (0.7 + separation * 0.3);
        let x = centerX + Math.cos(point.angle + motion + point.phase) * radius;
        let y = centerY + Math.sin(point.angle + motion * 1.3 + point.phase) * radius * 0.72;

        const pointer = pointerRef.current;
        if (pointer && activeRef.current && !reduceMotion) {
          const pointerX = pointer.x * width;
          const pointerY = pointer.y * height;
          const deltaX = x - pointerX;
          const deltaY = y - pointerY;
          const distance = Math.hypot(deltaX, deltaY);
          const influence = Math.max(0, 1 - distance / 82);
          if (distance > 0) {
            x += (deltaX / distance) * influence * 18;
            y += (deltaY / distance) * influence * 18;
          }
        }

        return { ...point, x, y };
      });

      context.lineWidth = 0.7;
      context.strokeStyle = palette.muted;
      for (let i = 0; i < positions.length; i += 1) {
        for (let j = i + 1; j < positions.length; j += 1) {
          const first = positions[i];
          const second = positions[j];
          if (first.cluster !== second.cluster) continue;
          const distance = Math.hypot(first.x - second.x, first.y - second.y);
          if (distance > 44) continue;
          context.globalAlpha = (1 - distance / 44) * (0.14 + separation * 0.18);
          context.beginPath();
          context.moveTo(first.x, first.y);
          context.lineTo(second.x, second.y);
          context.stroke();
        }
      }

      positions.forEach((point) => {
        context.globalAlpha = 0.38 + separation * 0.46;
        context.fillStyle = point.cluster === 0 ? palette.accent : palette.point;
        context.beginPath();
        context.arc(point.x, point.y, point.size, 0, Math.PI * 2);
        context.fill();
      });
      context.globalAlpha = 1;

      if (!reduceMotion) animationFrame = window.requestAnimationFrame(draw);
    };

    readPalette();
    resize();
    const resizeObserver = new ResizeObserver(resize);
    const themeObserver = new MutationObserver(readPalette);
    resizeObserver.observe(canvas);
    themeObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme", "data-color-theme"],
    });
    animationFrame = window.requestAnimationFrame(draw);

    return () => {
      window.cancelAnimationFrame(animationFrame);
      resizeObserver.disconnect();
      themeObserver.disconnect();
    };
  }, [seed]);

  return (
    <button
      className={`latent-space ${active ? "is-active" : ""}`}
      type="button"
      aria-label={`Latent space visualization, seed ${seed}. Hover to separate clusters or activate to generate a new sample.`}
      onClick={() => setSeed((currentSeed) => (currentSeed % 99) + 1)}
      onFocus={() => setInteractionActive(true)}
      onBlur={() => setInteractionActive(false)}
      onPointerEnter={() => setInteractionActive(true)}
      onPointerLeave={() => setInteractionActive(false)}
      onPointerMove={(event) => {
        const bounds = event.currentTarget.getBoundingClientRect();
        pointerRef.current = {
          x: (event.clientX - bounds.left) / bounds.width,
          y: (event.clientY - bounds.top) / bounds.height,
        };
      }}
    >
      <canvas ref={canvasRef} aria-hidden="true" />
      <span className="latent-space__header">
        <span>Latent space</span>
        <span>Seed {String(seed).padStart(2, "0")}</span>
      </span>
      {clusterNames.map((name) => (
        <span key={name} className={`latent-space__label latent-space__label--${name.toLowerCase()}`}>
          {name}
        </span>
      ))}
      <span className="latent-space__footer">
        <span>{active ? "Clusters separated" : "Hover to inspect"}</span>
        <span>Click to resample ↗</span>
      </span>
    </button>
  );
}
