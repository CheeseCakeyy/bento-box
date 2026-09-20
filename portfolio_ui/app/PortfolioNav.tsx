"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import ScrollToTop from "./ScrollToTop";

const sections = [
  { href: "/work", label: "Work" },
  { href: "/tool-kit", label: "Tool kit" },
  { href: "/", label: "About" },
  { href: "/collection", label: "Collection" },
  { href: "/contact", label: "Contact" },
];
const wakeFrames = [57, 54, 51, 48, 45, 42, 39, 12, 9, 6, 3];

export default function PortfolioNav() {
  const pathname = usePathname().replace(/\/$/, "") || "/";
  const nav = useRef<HTMLElement>(null);
  const actor = useRef<HTMLSpanElement>(null);
  const drawing = useRef<HTMLSpanElement>(null);
  const shadow = useRef<HTMLSpanElement>(null);
  const position = useRef<number | null>(null);
  const phase = useRef("sleeping");
  const frame = useRef(57);

  useEffect(() => {
    const root = nav.current;
    const cat = actor.current;
    const art = drawing.current;
    const ground = shadow.current;
    if (!root || !cat || !art || !ground) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    let raf = 0;
    const setFrame = (index: number) => {
      frame.current = index;
      art.style.backgroundPosition = `${(index % 8) * 100 / 7}% ${Math.floor(index / 8) * 100 / 7}%`;
    };
    const setPhase = (value: string) => {
      phase.current = value;
      cat.dataset.phase = value;
    };
    const place = (x: number) => {
      position.current = x;
      cat.style.transform = `translateX(${x}px)`;
      ground.style.transform = `translateX(${x}px)`;
      cat.style.opacity = "1";
    };
    const move = (animate: boolean) => {
      cancelAnimationFrame(raf);
      const target = root.querySelector<HTMLElement>('[aria-current="page"]');
      if (!target) return;
      const destination = target.offsetLeft + target.offsetWidth / 2;
      const start = position.current ?? destination;
      if (position.current === null || !animate || reduced.matches || Math.abs(destination - start) < 1) {
        place(destination);
        setFrame(57);
        setPhase("sleeping");
        return;
      }
      cat.dataset.facing = destination > start ? "right" : "left";
      // Reverse the supplied tumble to wake her, then use the original walking drawings.
      const needsWake = phase.current === "sleeping" || (phase.current === "settling" && frame.current >= 39);
      const wakingDuration = needsWake ? wakeFrames.length * 45 : 0;
      const walkingDuration = Math.min(1900, Math.max(600, Math.abs(destination - start) * 6));
      const began = performance.now();
      const tick = (now: number) => {
        const elapsed = now - began;
        if (elapsed < wakingDuration) {
          setPhase("waking");
          setFrame(wakeFrames[Math.min(wakeFrames.length - 1, Math.floor(elapsed / 45))]);
        } else if (elapsed < wakingDuration + walkingDuration) {
          const walking = elapsed - wakingDuration;
          setPhase("walking");
          setFrame(Math.floor(walking / 100) % 5);
          place(start + (destination - start) * walking / walkingDuration);
        } else {
          place(destination);
          const settlingFrame = 5 + Math.floor((elapsed - wakingDuration - walkingDuration) / 80);
          if (settlingFrame >= 57) {
            setFrame(57);
            setPhase("sleeping");
            return;
          }
          setPhase("settling");
          setFrame(settlingFrame);
        }
        raf = requestAnimationFrame(tick);
      };
      tick(began);
    };
    move(true);
    let firstResize = true;
    const observer = new ResizeObserver(() => {
      if (firstResize) { firstResize = false; return; }
      move(false);
    });
    observer.observe(root);
    const stopMotion = () => move(false);
    reduced.addEventListener("change", stopMotion);
    return () => {
      cancelAnimationFrame(raf);
      observer.disconnect();
      reduced.removeEventListener("change", stopMotion);
    };
  }, [pathname]);

  return (
    <div className={`floating-nav-wrap traveler-nav-wrap${pathname === "/tool-kit" ? " toolkit-nav-wrap" : ""}`}>
      <nav ref={nav} className="floating-nav" aria-label="Primary navigation">
        <span ref={shadow} className="nav-traveler-shadow" aria-hidden="true" />
        <span ref={actor} className="nav-cat" data-phase="sleeping" aria-hidden="true">
          <span className="nav-cat-facing"><span ref={drawing} className="nav-cat-art" /></span>
          <span className="nav-cat-dream">z<span>z</span></span>
        </span>
        {sections.map(({ href, label }) => <Link key={href} href={href} className={pathname === href ? "is-current" : undefined} aria-current={pathname === href ? "page" : undefined}>{label}</Link>)}
      </nav>
      <ScrollToTop />
    </div>
  );
}
