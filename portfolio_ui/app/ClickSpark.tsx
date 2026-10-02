"use client";

import { useEffect, useRef, type MouseEvent, type ReactNode } from "react";
import { playClickSound } from "./clickSound";

type Spark = { x: number; y: number; angle: number; started: number };

type Props = {
  children: ReactNode;
  sparkColor?: string;
  sparkSize?: number;
  sparkRadius?: number;
  sparkCount?: number;
  duration?: number;
  modal?: boolean;
};

// Adapted from React Bits' ClickSpark for viewport-wide bursts.
// Same-origin embedded demos forward clicks to this layer.
export default function ClickSpark({ children, sparkColor = "#a47855", sparkSize = 9, sparkRadius = 22, sparkCount = 8, duration = 650, modal = false }: Props) {
  const root = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const burst = useRef<(x: number, y: number) => void>(() => {});

  useEffect(() => {
    const element = root.current;
    const surface = canvas.current;
    const context = surface?.getContext("2d");
    if (!element || !surface || !context) return;
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let frame = 0;
    let width = 0;
    let height = 0;
    let sparks: Spark[] = [];

    const resize = () => {
      const ratio = Math.min(window.devicePixelRatio || 1, 2);
      width = window.innerWidth;
      height = window.innerHeight;
      surface.width = Math.ceil(width * ratio);
      surface.height = Math.ceil(height * ratio);
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
    };
    const draw = (now: number) => {
      frame = 0;
      context.clearRect(0, 0, width, height);
      sparks = sparks.filter((spark) => {
        const progress = Math.min(1, (now - spark.started) / duration);
        if (progress >= 1) return false;
        const eased = progress * (2 - progress);
        const distance = eased * sparkRadius;
        const length = sparkSize * (1 - eased);
        const dx = Math.cos(spark.angle);
        const dy = Math.sin(spark.angle);
        context.beginPath();
        context.moveTo(spark.x + distance * dx, spark.y + distance * dy);
        context.lineTo(spark.x + (distance + length) * dx, spark.y + (distance + length) * dy);
        context.strokeStyle = sparkColor;
        context.lineWidth = 1.8;
        context.lineCap = "round";
        context.stroke();
        return true;
      });
      if (sparks.length) frame = requestAnimationFrame(draw);
    };
    burst.current = (clientX, clientY) => {
      if (motion.matches) return;
      const x = clientX;
      const y = clientY;
      if (x < 0 || y < 0 || x > width || y > height) return;
      const started = performance.now();
      sparks.push(...Array.from({ length: sparkCount }, (_, index) => ({ x, y, angle: index * Math.PI * 2 / sparkCount, started })));
      if (!frame) frame = requestAnimationFrame(draw);
    };
    const receive = (event: MessageEvent) => {
      if (event.origin !== window.location.origin || event.data?.type !== "experiment:click") return;
      const iframe = [...element.querySelectorAll("iframe")].find((item) => item.contentWindow === event.source);
      if (!iframe) return;
      const x = Number(event.data.x);
      const y = Number(event.data.y);
      if (!Number.isFinite(x) || !Number.isFinite(y) || x < 0 || y < 0 || x > iframe.clientWidth || y > iframe.clientHeight) return;
      const bounds = iframe.getBoundingClientRect();
      playClickSound();
      burst.current(bounds.left + x, bounds.top + y);
    };
    resize();
    window.addEventListener("resize", resize);
    window.addEventListener("message", receive);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", resize);
      window.removeEventListener("message", receive);
      burst.current = () => {};
    };
  }, [duration, sparkColor, sparkCount, sparkRadius, sparkSize]);

  const click = (event: MouseEvent<HTMLDivElement>) => {
    playClickSound();
    if (event.detail === 0 && event.target instanceof Element) {
      const bounds = event.target.getBoundingClientRect();
      burst.current(bounds.left + bounds.width / 2, bounds.top + bounds.height / 2);
    } else burst.current(event.clientX, event.clientY);
  };
  return <div ref={root} className={`site-click-spark${modal ? " site-click-spark--modal" : ""}`} onClickCapture={click}>
    {children}
    <canvas ref={canvas} className="click-spark__canvas" aria-hidden="true" />
  </div>;
}
