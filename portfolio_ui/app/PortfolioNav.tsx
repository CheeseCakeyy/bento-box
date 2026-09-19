"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import Traveler from "./Traveler";
import ScrollToTop from "./ScrollToTop";

const sections = [
  { href: "/work", label: "Work" },
  { href: "/tool-kit", label: "Tool kit" },
  { href: "/", label: "About" },
  { href: "/collection", label: "Collection" },
  { href: "/contact", label: "Contact" },
];

export default function PortfolioNav() {
  const pathname = usePathname().replace(/\/$/, "") || "/";
  const nav = useRef<HTMLElement>(null);
  const actor = useRef<HTMLSpanElement>(null);
  const shadow = useRef<HTMLSpanElement>(null);
  const position = useRef<number | null>(null);

  useEffect(() => {
    const root = nav.current;
    const sprite = actor.current;
    const ground = shadow.current;
    if (!root || !sprite || !ground) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    let flight: Animation | undefined;
    let shade: Animation | undefined;

    const move = (animate: boolean) => {
      const target = root.querySelector<HTMLElement>('[aria-current="page"]');
      if (!target) return;
      const x = target.offsetLeft + target.offsetWidth / 2;
      // Read the actual in-flight position before cancelling, so fast clicks stay continuous.
      const bounds = sprite.getBoundingClientRect();
      const start = position.current === null ? x : bounds.left + bounds.width / 2 - root.getBoundingClientRect().left - root.clientLeft;
      flight?.cancel();
      shade?.cancel();
      sprite.style.transform = `translateX(${x}px)`;
      ground.style.transform = `translateX(${x}px)`;
      sprite.style.opacity = "1";
      const previous = position.current;
      position.current = x;
      if (!animate || reduced.matches || previous === null || Math.abs(start - x) < 1) {
        sprite.dataset.moving = "false";
        return;
      }
      const direction = x > start ? 1 : -1;
      const height = Math.min(78, 36 + Math.abs(x - start) * .15);
      sprite.dataset.moving = "true";
      const duration = Math.min(850, 540 + Math.abs(x - start) * .65);
      flight = sprite.animate([
        { transform: `translate(${start}px, 0) scale(1.08,.88)`, offset: 0 },
        { transform: `translate(${start + (x - start) * .25}px, ${-height * .78}px) rotate(${direction * -9}deg)`, offset: .25 },
        { transform: `translate(${(start + x) / 2}px, ${-height}px) rotate(${direction * 3}deg)`, offset: .48 },
        { transform: `translate(${x}px, 0) scale(1.12,.84)`, offset: .84 },
        { transform: `translate(${x}px, -5px) scale(.97,1.03)`, offset: .93 },
        { transform: `translateX(${x}px)`, offset: 1 },
      ], { duration, easing: "linear" });
      shade = ground.animate([
        { transform: `translateX(${start}px) scale(1)`, opacity: .2 },
        { transform: `translateX(${(start + x) / 2}px) scale(.45)`, opacity: .07, offset: .48 },
        { transform: `translateX(${x}px) scale(1.2)`, opacity: .25, offset: .84 },
        { transform: `translateX(${x}px) scale(1)`, opacity: .2 },
      ], { duration });
      flight.onfinish = () => { sprite.dataset.moving = "false"; };
    };
    move(true);
    // Skip the observer's initial delivery; it must not cancel a route-change jump.
    let firstResize = true;
    const observer = new ResizeObserver(() => {
      if (firstResize) { firstResize = false; return; }
      move(false);
    });
    observer.observe(root);
    const stopMotion = () => move(false);
    reduced.addEventListener("change", stopMotion);
    return () => {
      observer.disconnect();
      reduced.removeEventListener("change", stopMotion);
      // Leave the current transform available to the next route's effect.
      if (flight?.playState === "running") flight.commitStyles();
      flight?.cancel();
      shade?.cancel();
    };
  }, [pathname]);

  return (
    <div className={`floating-nav-wrap traveler-nav-wrap${pathname === "/tool-kit" ? " toolkit-nav-wrap" : ""}`}>
      <nav ref={nav} className="floating-nav" aria-label="Primary navigation">
        <span ref={shadow} className="nav-traveler-shadow" aria-hidden="true" />
        <span ref={actor} className="nav-traveler" aria-hidden="true"><Traveler /></span>
        {sections.map(({ href, label }) => <Link key={href} href={href} className={pathname === href ? "is-current" : undefined} aria-current={pathname === href ? "page" : undefined}>{label}</Link>)}
      </nav>
      <ScrollToTop />
    </div>
  );
}
