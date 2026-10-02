"use client";

import { useEffect, useRef, useState, type PointerEvent } from "react";

type Dataset = "moons" | "circles" | "spiral" | "xor";
type Label = 0 | 1;
type Point = { x: number; y: number; label: Label };

const DATASETS: Array<{ id: Dataset; label: string }> = [
  { id: "moons", label: "Moons" },
  { id: "circles", label: "Circles" },
  { id: "spiral", label: "Spiral" },
  { id: "xor", label: "XOR" },
];
const HIDDEN = 12;
const STEPS_PER_FRAME = 3;
const GRID_STEP = 13;
const MAX_POINTS = 420;

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

function makeDataset(kind: Dataset, seed: number): Point[] {
  const random = seededRandom(seed);
  const noise = (amount: number) => (random() + random() + random() - 1.5) * amount;
  return Array.from({ length: 160 }, (_, index): Point => {
    const label = (index % 2) as Label;
    if (kind === "moons") {
      const t = random() * Math.PI;
      const x = label ? 1 - Math.cos(t) : Math.cos(t);
      const y = label ? 0.5 - Math.sin(t) : Math.sin(t);
      return { x: (x - 0.5) * 0.78 + noise(0.12), y: (y - 0.25) * 0.78 + noise(0.12), label };
    }
    if (kind === "circles") {
      const angle = random() * Math.PI * 2;
      const radius = (label ? 0.72 : 0.3) + noise(0.12);
      return { x: Math.cos(angle) * radius, y: Math.sin(angle) * radius, label };
    }
    if (kind === "spiral") {
      const t = (Math.floor(index / 2) / 80) * 0.92 + 0.06;
      const angle = t * Math.PI * 3.2 + label * Math.PI;
      return { x: Math.cos(angle) * t * 0.92 + noise(0.05), y: Math.sin(angle) * t * 0.92 + noise(0.05), label };
    }
    let x = 0;
    let y = 0;
    do {
      x = random() * 1.8 - 0.9;
      y = random() * 1.8 - 0.9;
    } while (Math.abs(x) < 0.07 || Math.abs(y) < 0.07);
    return { x, y, label: (x * y > 0 ? 1 : 0) as Label };
  });
}

// A 2 → 12 → 12 → 1 tanh network trained with full-batch Adam, small enough to run every frame.
function createNetwork(seed: number) {
  const random = seededRandom(seed);
  const sizes = [2, HIDDEN, HIDDEN, 1];
  const weights = sizes.slice(1).map((size, layer) => {
    const fanIn = sizes[layer];
    const scale = Math.sqrt(1 / fanIn) * 1.6;
    return Float64Array.from({ length: size * fanIn }, () => (random() * 2 - 1) * scale);
  });
  const biases = sizes.slice(1).map((size) => new Float64Array(size));
  const params = [...weights, ...biases];
  const m = params.map((param) => new Float64Array(param.length));
  const v = params.map((param) => new Float64Array(param.length));
  const grads = params.map((param) => new Float64Array(param.length));
  const a1 = new Float64Array(HIDDEN);
  const a2 = new Float64Array(HIDDEN);
  const d1 = new Float64Array(HIDDEN);
  const d2 = new Float64Array(HIDDEN);
  let step = 0;

  const forward = (x: number, y: number) => {
    const [w1, w2, w3] = weights;
    const [b1, b2, b3] = biases;
    for (let j = 0; j < HIDDEN; j += 1) a1[j] = Math.tanh(w1[j * 2] * x + w1[j * 2 + 1] * y + b1[j]);
    for (let j = 0; j < HIDDEN; j += 1) {
      let sum = b2[j];
      for (let k = 0; k < HIDDEN; k += 1) sum += w2[j * HIDDEN + k] * a1[k];
      a2[j] = Math.tanh(sum);
    }
    let out = b3[0];
    for (let k = 0; k < HIDDEN; k += 1) out += w3[k] * a2[k];
    return 1 / (1 + Math.exp(-out));
  };

  const train = (points: Point[], learningRate: number) => {
    const [, w2, w3] = weights;
    const [gw1, gw2, gw3, gb1, gb2, gb3] = grads;
    grads.forEach((grad) => grad.fill(0));
    let loss = 0;
    let correct = 0;
    for (const point of points) {
      const p = forward(point.x, point.y);
      loss -= point.label ? Math.log(p + 1e-9) : Math.log(1 - p + 1e-9);
      if ((p > 0.5 ? 1 : 0) === point.label) correct += 1;
      const d3 = p - point.label;
      gb3[0] += d3;
      for (let k = 0; k < HIDDEN; k += 1) {
        gw3[k] += d3 * a2[k];
        d2[k] = d3 * w3[k] * (1 - a2[k] * a2[k]);
      }
      d1.fill(0);
      for (let j = 0; j < HIDDEN; j += 1) {
        gb2[j] += d2[j];
        for (let k = 0; k < HIDDEN; k += 1) {
          gw2[j * HIDDEN + k] += d2[j] * a1[k];
          d1[k] += d2[j] * w2[j * HIDDEN + k];
        }
      }
      for (let k = 0; k < HIDDEN; k += 1) {
        const delta = d1[k] * (1 - a1[k] * a1[k]);
        gb1[k] += delta;
        gw1[k * 2] += delta * point.x;
        gw1[k * 2 + 1] += delta * point.y;
      }
    }
    step += 1;
    const n = Math.max(1, points.length);
    const correction1 = 1 - 0.9 ** step;
    const correction2 = 1 - 0.999 ** step;
    params.forEach((param, index) => {
      const grad = grads[index];
      for (let i = 0; i < param.length; i += 1) {
        const g = grad[i] / n;
        m[index][i] = 0.9 * m[index][i] + 0.1 * g;
        v[index][i] = 0.999 * v[index][i] + 0.001 * g * g;
        param[i] -= (learningRate * (m[index][i] / correction1)) / (Math.sqrt(v[index][i] / correction2) + 1e-8);
      }
    });
    return { loss: loss / n, accuracy: correct / n };
  };

  return { forward, train };
}

export default function TrainLab() {
  const stageRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const epochRef = useRef<HTMLSpanElement>(null);
  const lossRef = useRef<HTMLSpanElement>(null);
  const accuracyRef = useRef<HTMLSpanElement>(null);
  const sparkRef = useRef<SVGPolylineElement>(null);
  const pointsRef = useRef<Point[]>(makeDataset("moons", 7));
  const networkRef = useRef(createNetwork(11));
  const runningRef = useRef(true);
  const resetStatsRef = useRef(() => {});
  const [dataset, setDataset] = useState<Dataset>("moons");
  const [brush, setBrush] = useState<Label>(1);
  const [running, setRunning] = useState(true);
  const [seed, setSeed] = useState(11);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      runningRef.current = false;
      // eslint-disable-next-line react-hooks/set-state-in-effect -- Reduced-motion visitors start paused; this is a browser-only preference.
      setRunning(false);
    }
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    const stage = stageRef.current;
    const context = canvas?.getContext("2d");
    if (!canvas || !stage || !context) return;

    let width = 1;
    let height = 1;
    let frame = 0;
    let visible = true;
    let epoch = 0;
    let losses: number[] = [];
    let palette = { ink: "#e9e9e2", muted: "rgba(233,233,226,0.46)", panel: "#121212" };

    const readPalette = () => {
      const styles = getComputedStyle(stage);
      palette = {
        ink: styles.getPropertyValue("--text").trim() || palette.ink,
        muted: styles.getPropertyValue("--text-muted").trim() || palette.muted,
        panel: styles.getPropertyValue("--panel").trim() || palette.panel,
      };
    };
    const resize = () => {
      const bounds = canvas.getBoundingClientRect();
      const ratio = Math.min(window.devicePixelRatio || 1, 2);
      width = Math.max(1, bounds.width);
      height = Math.max(1, bounds.height);
      canvas.width = Math.round(width * ratio);
      canvas.height = Math.round(height * ratio);
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
    };
    resetStatsRef.current = () => {
      epoch = 0;
      losses = [];
    };

    const scale = () => Math.min(width, height) * 0.44;
    const draw = () => {
      const network = networkRef.current;
      const s = scale();
      context.clearRect(0, 0, width, height);
      // Halftone decision field: dot size is confidence, ink is the predicted class.
      for (let y = GRID_STEP / 2; y < height; y += GRID_STEP) {
        for (let x = GRID_STEP / 2; x < width; x += GRID_STEP) {
          const p = network.forward((x - width / 2) / s, -(y - height / 2) / s);
          const confidence = Math.abs(p - 0.5) * 2;
          const radius = (GRID_STEP / 2 - 1.4) * Math.sqrt(confidence);
          if (radius < 0.5) continue;
          context.globalAlpha = p > 0.5 ? 0.5 : 0.22;
          context.fillStyle = p > 0.5 ? palette.ink : palette.muted;
          context.beginPath();
          context.arc(x, y, radius, 0, Math.PI * 2);
          context.fill();
        }
      }
      context.globalAlpha = 1;
      for (const point of pointsRef.current) {
        const x = width / 2 + point.x * s;
        const y = height / 2 - point.y * s;
        context.beginPath();
        context.arc(x, y, 4.2, 0, Math.PI * 2);
        context.lineWidth = 1.8;
        if (point.label) {
          context.fillStyle = palette.ink;
          context.strokeStyle = palette.panel;
          context.fill();
          context.stroke();
        } else {
          context.fillStyle = palette.panel;
          context.strokeStyle = palette.ink;
          context.fill();
          context.stroke();
        }
      }
    };

    const tick = () => {
      frame = window.requestAnimationFrame(tick);
      if (!visible || document.hidden) return;
      if (runningRef.current && pointsRef.current.length) {
        let result = { loss: 0, accuracy: 0 };
        for (let i = 0; i < STEPS_PER_FRAME; i += 1) result = networkRef.current.train(pointsRef.current, 0.03);
        epoch += STEPS_PER_FRAME;
        losses.push(result.loss);
        if (losses.length > 90) losses.shift();
        if (epochRef.current) epochRef.current.textContent = String(epoch).padStart(5, "0");
        if (lossRef.current) lossRef.current.textContent = result.loss.toFixed(3);
        if (accuracyRef.current) accuracyRef.current.textContent = `${Math.round(result.accuracy * 100)}%`;
        if (sparkRef.current) {
          const max = Math.max(0.75, ...losses);
          sparkRef.current.setAttribute("points", losses.map((loss, index) => `${index},${(24 - (loss / max) * 22).toFixed(1)}`).join(" "));
        }
      }
      draw();
    };

    readPalette();
    resize();
    const resizeObserver = new ResizeObserver(() => {
      resize();
      draw();
    });
    resizeObserver.observe(canvas);
    const themeObserver = new MutationObserver(readPalette);
    themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme", "data-color-theme"] });
    const visibility = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
    });
    visibility.observe(stage);
    frame = window.requestAnimationFrame(tick);

    return () => {
      window.cancelAnimationFrame(frame);
      resizeObserver.disconnect();
      themeObserver.disconnect();
      visibility.disconnect();
    };
  }, []);

  const reset = (nextSeed: number) => {
    networkRef.current = createNetwork(nextSeed);
    resetStatsRef.current();
    if (sparkRef.current) sparkRef.current.setAttribute("points", "");
    setSeed(nextSeed);
  };

  const chooseDataset = (next: Dataset) => {
    pointsRef.current = makeDataset(next, seed + next.length);
    setDataset(next);
    reset(seed + 1);
  };

  const toggleRunning = () => {
    runningRef.current = !runningRef.current;
    setRunning(runningRef.current);
  };

  const addPoint = (event: PointerEvent<HTMLCanvasElement>) => {
    const bounds = event.currentTarget.getBoundingClientRect();
    const s = Math.min(bounds.width, bounds.height) * 0.44;
    const label: Label = event.shiftKey || event.button === 2 ? (brush ? 0 : 1) : brush;
    const point = {
      x: (event.clientX - bounds.left - bounds.width / 2) / s,
      y: -(event.clientY - bounds.top - bounds.height / 2) / s,
      label,
    };
    pointsRef.current = [...pointsRef.current.slice(-(MAX_POINTS - 1)), point];
  };

  return (
    <article className="panel panel--lab train-lab" aria-labelledby="train-lab-title">
      <header className="train-lab__header">
        <div>
          <h3 id="train-lab-title">Train lab</h3>
          <p>A tiny neural network, training live in your browser. Paint points and watch the boundary bend.</p>
        </div>
        <span className="train-lab__epoch">Epoch <span ref={epochRef}>00000</span></span>
      </header>

      <div ref={stageRef} className="train-lab__stage">
        <canvas
          ref={canvasRef}
          role="img"
          aria-label={`Decision boundary of a small neural network learning the ${dataset} dataset. Click to add ${brush ? "filled" : "hollow"} points.`}
          onPointerDown={addPoint}
          onContextMenu={(event) => event.preventDefault()}
        />
        <div className="train-lab__readout" aria-live="off">
          <span>Loss <b ref={lossRef}>—</b></span>
          <span>Accuracy <b ref={accuracyRef}>—</b></span>
          <svg viewBox="0 0 90 24" preserveAspectRatio="none" aria-hidden="true"><polyline ref={sparkRef} points="" /></svg>
        </div>
        <span className="train-lab__net" aria-hidden="true">2 → 12 → 12 → 1 · tanh · Adam</span>
      </div>

      <div className="train-lab__controls">
        <div className="train-lab__datasets" role="group" aria-label="Dataset">
          {DATASETS.map((item) => (
            <button key={item.id} type="button" aria-pressed={dataset === item.id} onClick={() => chooseDataset(item.id)}>{item.label}</button>
          ))}
        </div>
        <div className="train-lab__actions">
          <div className="train-lab__brush" role="group" aria-label="Point class to paint">
            <button type="button" aria-pressed={brush === 1} aria-label="Paint filled points" onClick={() => setBrush(1)}><i className="is-filled" /></button>
            <button type="button" aria-pressed={brush === 0} aria-label="Paint hollow points" onClick={() => setBrush(0)}><i /></button>
          </div>
          <button type="button" className="train-lab__run" onClick={toggleRunning}>{running ? "Pause" : "Train"}</button>
          <button type="button" onClick={() => reset(seed + 1)} aria-label="Reset the network weights">Reset ↻</button>
        </div>
      </div>
    </article>
  );
}
