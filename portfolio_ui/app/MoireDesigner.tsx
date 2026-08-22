"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type Control = "left" | "thrust" | "right";
type TrailSegment = [number, number, number, number, number, number];

type MoirePalette = {
  paper: string;
  ink: string;
  accent: string;
};

const rotate = (angle: number, x: number, y: number) => [
  Math.cos(angle) * x - Math.sin(angle) * y,
  Math.sin(angle) * x + Math.cos(angle) * y,
] as const;

export default function MoireDesigner() {
  const stageRef = useRef<HTMLDivElement>(null);
  const inkCanvasRef = useRef<HTMLCanvasElement>(null);
  const shipCanvasRef = useRef<HTMLCanvasElement>(null);
  const frameRef = useRef<number | null>(null);
  const sizeRef = useRef({ width: 0, height: 0, dpr: 1 });
  const positionRef = useRef<[number, number]>([80, 180]);
  const velocityRef = useRef<[number, number]>([2.4, 0]);
  const angleRef = useRef(0);
  const segmentsRef = useRef<TrailSegment[]>([]);
  const paletteRef = useRef<MoirePalette>({
    paper: "rgb(255, 255, 255)",
    ink: "rgb(17, 17, 17)",
    accent: "rgb(255, 77, 46)",
  });
  const controlsRef = useRef<Record<Control, boolean>>({
    left: false,
    thrust: false,
    right: false,
  });
  const startedRef = useRef(false);
  const pausedRef = useRef(false);
  const [hasStarted, setHasStarted] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [status, setStatus] = useState("Ready when you are");

  const setControl = useCallback((control: Control, active: boolean) => {
    controlsRef.current[control] = active;
  }, []);

  const clearDesign = useCallback(() => {
    const canvas = inkCanvasRef.current;
    const { width, height } = sizeRef.current;
    if (!canvas || !width || !height) return;

    const context = canvas.getContext("2d");
    if (!context) return;

    context.save();
    context.setTransform(sizeRef.current.dpr, 0, 0, sizeRef.current.dpr, 0, 0);
    segmentsRef.current = [];
    context.fillStyle = paletteRef.current.paper;
    context.fillRect(0, 0, width, height);
    context.restore();

    positionRef.current = [width * 0.24, height * 0.5];
    velocityRef.current = [2.4, 0];
    angleRef.current = 0;
    setStatus("Fresh canvas");
  }, []);

  const makePng = useCallback(
    () =>
      new Promise<Blob | null>((resolve) => {
        const source = inkCanvasRef.current;
        if (!source) {
          resolve(null);
          return;
        }

        source.toBlob(resolve, "image/png");
      }),
    [],
  );

  const downloadPng = useCallback(async () => {
    const blob = await makePng();
    if (!blob) {
      setStatus("Could not export this design");
      return;
    }

    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.download = `moire-by-${Date.now()}.png`;
    link.href = url;
    link.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 1_000);
    setStatus("PNG saved");
  }, [makePng]);

  const shareDesign = useCallback(async () => {
    const blob = await makePng();
    if (!blob) {
      setStatus("Could not prepare this design");
      return;
    }

    const file = new File([blob], "moire-design.png", { type: "image/png" });
    const shareData = {
      title: "My moiré spaceship design",
      text: "I made this line design on Adwait Tagalpallewar’s portfolio.",
      files: [file],
    };

    if (navigator.share && (!navigator.canShare || navigator.canShare(shareData))) {
      try {
        await navigator.share(shareData);
        setStatus("Design shared");
        return;
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") return;
      }
    }

    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.download = "moire-design.png";
    link.href = url;
    link.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 1_000);
    setStatus("PNG saved — attach it to your message");
  }, [makePng]);

  const togglePaused = useCallback(() => {
    pausedRef.current = !pausedRef.current;
    setIsPaused(pausedRef.current);
    setStatus(pausedRef.current ? "Drawing paused" : "Drawing live");
  }, []);

  const startExperience = useCallback(() => {
    startedRef.current = true;
    pausedRef.current = false;
    setHasStarted(true);
    setIsPaused(false);
    setStatus("Drawing live");
    window.requestAnimationFrame(() => stageRef.current?.focus());
  }, []);

  useEffect(() => {
    const stage = stageRef.current;
    const inkCanvas = inkCanvasRef.current;
    const shipCanvas = shipCanvasRef.current;
    if (!stage || !inkCanvas || !shipCanvas) return;

    const colorProbe = document.createElement("canvas");
    colorProbe.width = 1;
    colorProbe.height = 1;
    const colorContext = colorProbe.getContext("2d", { willReadFrequently: true });

    const resolveCanvasColor = (value: string, fallback: string) => {
      if (!colorContext) return fallback;
      colorContext.clearRect(0, 0, 1, 1);
      colorContext.fillStyle = fallback;
      colorContext.fillStyle = value || fallback;
      colorContext.fillRect(0, 0, 1, 1);
      const [red, green, blue] = colorContext.getImageData(0, 0, 1, 1).data;
      return `rgb(${red}, ${green}, ${blue})`;
    };

    const readPalette = (): MoirePalette => {
      const styles = getComputedStyle(stage);
      return {
        paper: resolveCanvasColor(styles.getPropertyValue("--moire-paper").trim(), "#ffffff"),
        ink: resolveCanvasColor(styles.getPropertyValue("--moire-ink").trim(), "#111111"),
        accent: resolveCanvasColor(styles.getPropertyValue("--moire-accent").trim(), "#ff4d2e"),
      };
    };

    const redrawDesign = () => {
      const { width, height, dpr } = sizeRef.current;
      const ink = inkCanvas.getContext("2d");
      if (!ink || !width || !height) return;

      ink.save();
      ink.setTransform(dpr, 0, 0, dpr, 0, 0);
      ink.fillStyle = paletteRef.current.paper;
      ink.fillRect(0, 0, width, height);
      ink.strokeStyle = paletteRef.current.ink;
      ink.globalAlpha = 0.5;
      ink.lineWidth = 0.72;

      for (const segment of segmentsRef.current) {
        ink.beginPath();
        ink.moveTo(segment[0] * width, segment[1] * height);
        ink.lineTo(segment[2] * width, segment[3] * height);
        ink.lineTo(segment[4] * width, segment[5] * height);
        ink.stroke();
      }

      ink.restore();
    };

    const syncTheme = () => {
      paletteRef.current = readPalette();
      redrawDesign();
    };

    const resizeCanvas = () => {
      const bounds = stage.getBoundingClientRect();
      const width = Math.max(1, Math.floor(bounds.width));
      const height = Math.max(1, Math.floor(bounds.height));
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const previous = sizeRef.current;

      if (previous.width === width && previous.height === height && previous.dpr === dpr) {
        return;
      }

      for (const canvas of [inkCanvas, shipCanvas]) {
        canvas.width = Math.floor(width * dpr);
        canvas.height = Math.floor(height * dpr);
        canvas.style.width = `${width}px`;
        canvas.style.height = `${height}px`;
        canvas.getContext("2d")?.setTransform(dpr, 0, 0, dpr, 0, 0);
      }

      sizeRef.current = { width, height, dpr };
      redrawDesign();

      if (!previous.width) {
        positionRef.current = [width * 0.24, height * 0.5];
      } else {
        positionRef.current = [
          (positionRef.current[0] / previous.width) * width,
          (positionRef.current[1] / previous.height) * height,
        ];
      }
    };

    const observer = new ResizeObserver(resizeCanvas);
    observer.observe(stage);
    syncTheme();
    resizeCanvas();

    const themeObserver = new MutationObserver(syncTheme);
    themeObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme", "data-color-theme"],
    });

    let previousTime = performance.now();
    const animate = (time: number) => {
      const { width, height } = sizeRef.current;
      const ink = inkCanvas.getContext("2d");
      const ship = shipCanvas.getContext("2d");
      const step = Math.min((time - previousTime) / (1000 / 60), 2);
      previousTime = time;

      if (width && height && ink && ship && startedRef.current) {
        const controls = controlsRef.current;
        if (!pausedRef.current) {
          if (controls.left) angleRef.current -= 1.25 * step;
          if (controls.right) angleRef.current += 1.25 * step;

          const radians = angleRef.current * (Math.PI / 180);
          const velocity = velocityRef.current;
          const maxSpeed = 3.2;

          if (controls.thrust) {
            const target: [number, number] = [
              Math.cos(radians) * maxSpeed,
              Math.sin(radians) * maxSpeed,
            ];
            const dx = target[0] - velocity[0];
            const dy = target[1] - velocity[1];
            const distance = Math.hypot(dx, dy) || 1;
            const acceleration = Math.min(0.105 * step, distance);
            velocityRef.current = [
              velocity[0] + (dx / distance) * acceleration,
              velocity[1] + (dy / distance) * acceleration,
            ];
          }

          const nextVelocity = velocityRef.current;
          const position = positionRef.current;
          position[0] += nextVelocity[0] * step;
          position[1] += nextVelocity[1] * step;
          if (position[0] < 0) position[0] = width;
          if (position[0] > width) position[0] = 0;
          if (position[1] < 0) position[1] = height;
          if (position[1] > height) position[1] = 0;

          const trailLength = Math.hypot(width, height) + 30;
          const leftRay = rotate(radians - Math.PI - Math.PI / 8, 0, trailLength);
          const rightRay = rotate(radians + Math.PI / 8, 0, trailLength);
          ink.beginPath();
          ink.moveTo(position[0] + leftRay[0], position[1] + leftRay[1]);
          ink.lineTo(position[0], position[1]);
          ink.lineTo(position[0] + rightRay[0], position[1] + rightRay[1]);
          ink.strokeStyle = paletteRef.current.ink;
          ink.globalAlpha = 0.5;
          ink.lineWidth = 0.72;
          ink.stroke();
          ink.globalAlpha = 1;

          segmentsRef.current.push([
            (position[0] + leftRay[0]) / width,
            (position[1] + leftRay[1]) / height,
            position[0] / width,
            position[1] / height,
            (position[0] + rightRay[0]) / width,
            (position[1] + rightRay[1]) / height,
          ]);
          if (segmentsRef.current.length > 50_000) {
            segmentsRef.current.splice(0, 5_000);
          }
        }

        const radians = angleRef.current * (Math.PI / 180);
        const position = positionRef.current;
        const nose = rotate(radians, 15, 0);
        const rearTop = rotate(radians, -11, -8);
        const rearBottom = rotate(radians, -11, 8);
        ship.clearRect(0, 0, width, height);
        ship.beginPath();
        ship.moveTo(position[0] + rearTop[0], position[1] + rearTop[1]);
        ship.lineTo(position[0] + nose[0], position[1] + nose[1]);
        ship.lineTo(position[0] + rearBottom[0], position[1] + rearBottom[1]);
        ship.closePath();
        ship.fillStyle = paletteRef.current.ink;
        ship.fill();

        if (controls.thrust && !pausedRef.current) {
          const flame = rotate(radians, -19, 0);
          ship.beginPath();
          ship.moveTo(position[0] + rearTop[0] * 0.92, position[1] + rearTop[1] * 0.92);
          ship.lineTo(position[0] + flame[0], position[1] + flame[1]);
          ship.lineTo(position[0] + rearBottom[0] * 0.92, position[1] + rearBottom[1] * 0.92);
          ship.closePath();
          ship.fillStyle = paletteRef.current.accent;
          ship.fill();
        }
      }

      frameRef.current = requestAnimationFrame(animate);
    };

    frameRef.current = requestAnimationFrame(animate);
    return () => {
      observer.disconnect();
      themeObserver.disconnect();
      if (frameRef.current !== null) cancelAnimationFrame(frameRef.current);
    };
  }, []);

  const onKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (!startedRef.current) return;
    const key = event.key.toLowerCase();
    if (key === "a" || key === "arrowleft") setControl("left", true);
    if (key === "d" || key === "arrowright") setControl("right", true);
    if (key === "w" || key === "arrowup") setControl("thrust", true);
    if (key === " " && !event.repeat) togglePaused();
    if (key === "c" && !event.repeat) clearDesign();
    if (["a", "d", "w", "arrowleft", "arrowright", "arrowup", " "].includes(key)) {
      event.preventDefault();
    }
  };

  const onKeyUp = (event: React.KeyboardEvent<HTMLDivElement>) => {
    const key = event.key.toLowerCase();
    if (key === "a" || key === "arrowleft") setControl("left", false);
    if (key === "d" || key === "arrowright") setControl("right", false);
    if (key === "w" || key === "arrowup") setControl("thrust", false);
  };

  const controlButtonProps = (control: Control) => ({
    onPointerDown: (event: React.PointerEvent<HTMLButtonElement>) => {
      event.currentTarget.setPointerCapture(event.pointerId);
      stageRef.current?.focus();
      setControl(control, true);
    },
    onPointerUp: () => setControl(control, false),
    onPointerCancel: () => setControl(control, false),
    onLostPointerCapture: () => setControl(control, false),
  });

  return (
    <section className="moire-maker" aria-labelledby="moire-maker-title">
      <header className="moire-maker__header">
        <div>
          <span className="moire-maker__eyebrow">Interactive sketch 01</span>
          <h2 id="moire-maker-title">Pilot the line</h2>
        </div>
        <span className={`moire-maker__state ${!hasStarted ? "is-ready" : isPaused ? "is-paused" : ""}`}>
          {!hasStarted ? "Ready" : isPaused ? "Paused" : "Live"}
        </span>
      </header>

      <div
        ref={stageRef}
        className="moire-stage"
        role={hasStarted ? "application" : undefined}
        tabIndex={hasStarted ? 0 : -1}
        aria-label={hasStarted ? "Moiré spaceship canvas. Use A and D to turn, W to thrust, space to pause, and C to clear." : undefined}
        onKeyDown={onKeyDown}
        onKeyUp={onKeyUp}
        onBlur={() => {
          controlsRef.current = { left: false, thrust: false, right: false };
        }}
      >
        <canvas ref={inkCanvasRef} className="moire-stage__canvas moire-stage__ink" aria-hidden="true" />
        <canvas ref={shipCanvasRef} className="moire-stage__canvas" aria-hidden="true" />
        {!hasStarted ? (
          <button className="moire-launch" type="button" onClick={startExperience}>
            <span className="moire-launch__meta">Interactive canvas · Click to enter</span>
            <span className="moire-launch__art" aria-hidden="true">
              {Array.from({ length: 5 }, (_, index) => (
                <span className="moire-launch__ray" key={index} />
              ))}
              <span className="moire-launch__orbit" />
              <span className="moire-launch__ship" />
            </span>
            <span className="moire-launch__copy">
              <strong>Launch the sketch</strong>
              <small>Motion begins only when you choose.</small>
            </span>
            <span className="moire-launch__arrow" aria-hidden="true">↗</span>
          </button>
        ) : (
          <>
            <p className="moire-stage__hint">Hold to steer · leave a trail</p>
            <aside className="moire-control-panel" aria-label="Moiré drawing controls">
              <div className="moire-control-panel__header">
                <span>Flight deck</span>
                <strong aria-live="polite">{status}</strong>
              </div>

              <div className="moire-steering" aria-label="Spaceship steering controls">
                <button type="button" aria-label="Turn left" {...controlButtonProps("left")}>
                  <span aria-hidden="true">↶</span>
                  <small>A</small>
                </button>
                <button className="moire-steering__thrust" type="button" aria-label="Thrust" {...controlButtonProps("thrust")}>
                  <span aria-hidden="true">↑</span>
                  <small>W</small>
                </button>
                <button type="button" aria-label="Turn right" {...controlButtonProps("right")}>
                  <span aria-hidden="true">↷</span>
                  <small>D</small>
                </button>
              </div>

              <div className="moire-panel-actions">
                <button type="button" onClick={clearDesign}>Clear</button>
                <button type="button" onClick={togglePaused}>{isPaused ? "Resume" : "Pause"}</button>
                <button type="button" onClick={downloadPng}>Save PNG</button>
                <button className="moire-panel-actions__send" type="button" onClick={shareDesign}>Send ↗</button>
              </div>
            </aside>
          </>
        )}
      </div>
    </section>
  );
}
