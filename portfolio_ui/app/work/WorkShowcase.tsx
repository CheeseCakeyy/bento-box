"use client";

import { useCallback, useEffect, useRef, useState, type ReactNode, type KeyboardEvent } from "react";
import { experiments, ExperimentDialog, PreviewFrame, type Experiment } from "./WorkPreviews";

function ComponentFilm({ experiment, active }: { experiment: Experiment; active: boolean }) {
  const video = useRef<HTMLVideoElement>(null);
  const [paused, setPaused] = useState(false);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    const element = video.current;
    if (!element) return;
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => {
      if (active && !paused && !document.hidden && !motion.matches) void element.play().catch(() => {});
      else element.pause();
    };
    sync();
    document.addEventListener("visibilitychange", sync);
    motion.addEventListener("change", sync);
    return () => {
      element.pause();
      document.removeEventListener("visibilitychange", sync);
      motion.removeEventListener("change", sync);
    };
  }, [active, paused]);

  function toggle() {
    const element = video.current;
    if (!element) return;
    if (element.paused) { setPaused(false); void element.play().catch(() => {}); }
    else { setPaused(true); element.pause(); }
  }

  return <>
    <video ref={video} className="component-film" src={experiment.videoSrc} poster={experiment.poster} muted loop playsInline preload={active ? "auto" : "none"} aria-label={`${experiment.name} moving preview`} onPlay={() => setPlaying(true)} onPause={() => setPlaying(false)} />
    <div className="component-film-controls">
      <button type="button" onClick={toggle} aria-label={`${playing ? "Pause" : "Play"} ${experiment.name} animation`} title={playing ? "Pause animation" : "Play animation"}>{playing ? "Ⅱ" : "▷"}</button>
      {experiment.slug === "chill" && <button type="button" aria-label="Replay CHILL pouring animation" title="Replay pouring animation" onClick={() => { if (video.current) { video.current.currentTime = 0; setPaused(false); void video.current.play().catch(() => {}); } }}>↻</button>}
    </div>
  </>;
}

function ExperimentCard({ experiment, onOpen, expanded, index }: { experiment: Experiment; onOpen: () => void; expanded: boolean; index: number }) {
  const stage = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const element = stage.current;
    if (!element) return;
    // Load nearby previews once; preserve their state when scrolling away or expanding.
    const observer = new IntersectionObserver(([entry]) => {
      setActive(entry.isIntersecting);
      if (entry.isIntersecting) setReady(true);
    }, { rootMargin: "160px" });
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return <article className={`experiment-card experiment-card--${experiment.slug}`} aria-labelledby={`component-${experiment.slug}`}>
    <div ref={stage} className="experiment-card__stage">
      {experiment.video ? <ComponentFilm experiment={experiment} active={active && !expanded} /> : ready ? <PreviewFrame experiment={experiment} compact /> : experiment.poster ? <img className="experiment-frame__poster" src={experiment.poster} alt="" /> : <div className="component-awaiting" aria-hidden="true"><span /></div>}
    </div>
    <div className="experiment-card__caption">
      <div><h2 id={`component-${experiment.slug}`}><span>{String(index + 1).padStart(2, "0")}</span>{experiment.name}</h2><p>{experiment.interaction}</p></div>
      <button type="button" className="experiment-expand" onClick={onOpen} aria-label={`Expand ${experiment.name}`} aria-haspopup="dialog" aria-expanded={expanded}>Expand <span aria-hidden="true">↗</span></button>
    </div>
  </article>;
}

function ExperimentGallery({ selected, onSelect, focusSlug }: { selected: Experiment | null; onSelect: (experiment: Experiment) => void; focusSlug: string | null }) {
  const rail = useRef<HTMLDivElement>(null);
  const progress = useRef<HTMLSpanElement>(null);
  const scrollTo = useRef<(value: number, absolute?: boolean) => boolean>(() => false);
  const [position, setPosition] = useState({ current: 1, start: true, end: false });

  useEffect(() => {
    const view = rail.current;
    if (!view) return;
    let frame = 0;
    let scrollFrame = 0;
    let previousTime = 0;
    let target = view.scrollLeft;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => {
      frame = 0;
      const max = view.scrollWidth - view.clientWidth;
      const card = view.firstElementChild as HTMLElement | null;
      const step = (card?.offsetWidth || view.clientWidth) + parseFloat(getComputedStyle(view).gap || "0");
      const next = { current: Math.min(experiments.length, Math.round(view.scrollLeft / step) + 1), start: view.scrollLeft < 2, end: view.scrollLeft >= max - 2 };
      setPosition((previous) => previous.current === next.current && previous.start === next.start && previous.end === next.end ? previous : next);
      if (progress.current) progress.current.style.transform = `scaleX(${max > 0 ? view.scrollLeft / max : 1})`;
    };
    const schedule = () => {
      if (!scrollFrame) target = view.scrollLeft;
      if (!frame) frame = requestAnimationFrame(update);
    };
    const animate = (now: number) => {
      const elapsed = previousTime ? Math.min(now - previousTime, 64) : 16;
      previousTime = now;
      target = Math.max(0, Math.min(view.scrollWidth - view.clientWidth, target));
      const remaining = target - view.scrollLeft;
      if (Math.abs(remaining) < .75) {
        view.scrollLeft = target;
        scrollFrame = 0;
        previousTime = 0;
        view.classList.remove("is-scrolling");
        schedule();
        return;
      }
      // A minimum pixel step avoids stalling when a browser rounds scrollLeft.
      const step = Math.min(Math.abs(remaining), Math.max(1, Math.abs(remaining) * (1 - Math.exp(-elapsed / 85))));
      view.scrollLeft += Math.sign(remaining) * step;
      scrollFrame = requestAnimationFrame(animate);
    };
    const slide = (value: number, absolute = false) => {
      const max = Math.max(0, view.scrollWidth - view.clientWidth);
      const next = Math.max(0, Math.min(max, absolute ? value : (scrollFrame ? target : view.scrollLeft) + value));
      if (!Number.isFinite(next)) return false;
      // Consume wheel events until the visible rail has actually reached its edge.
      if (Math.abs(next - view.scrollLeft) < .75 && !scrollFrame) return false;
      target = next;
      if (reduced.matches) {
        cancelAnimationFrame(scrollFrame);
        scrollFrame = 0;
        previousTime = 0;
        view.classList.remove("is-scrolling");
        view.scrollLeft = target;
        schedule();
        return true;
      }
      view.classList.add("is-scrolling");
      if (!scrollFrame) scrollFrame = requestAnimationFrame(animate);
      return true;
    };
    const interrupt = () => {
      cancelAnimationFrame(scrollFrame);
      scrollFrame = 0;
      previousTime = 0;
      target = view.scrollLeft;
      view.classList.remove("is-scrolling");
    };
    scrollTo.current = slide;
    const wheel = (event: WheelEvent) => {
      if (event.ctrlKey) return;
      const delta = Math.abs(event.deltaX) > Math.abs(event.deltaY) ? event.deltaX : event.deltaY;
      const pixels = delta * (event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? view.clientWidth : 1);
      if (slide(pixels)) event.preventDefault();
    };
    const receive = (event: MessageEvent) => {
      if (event.origin !== window.location.origin || event.data?.type !== "experiment:wheel") return;
      if (![...view.querySelectorAll("iframe")].some((iframe) => iframe.contentWindow === event.source)) return;
      const delta = Number(event.data.delta);
      if (Number.isFinite(delta) && !slide(delta)) window.scrollBy(0, delta);
    };
    const observer = new ResizeObserver(schedule);
    observer.observe(view);
    view.addEventListener("scroll", schedule, { passive: true });
    view.addEventListener("wheel", wheel, { passive: false });
    view.addEventListener("pointerdown", interrupt, { passive: true });
    window.addEventListener("message", receive);
    update();
    return () => {
      cancelAnimationFrame(frame);
      cancelAnimationFrame(scrollFrame);
      scrollTo.current = () => false;
      observer.disconnect();
      view.removeEventListener("scroll", schedule);
      view.removeEventListener("wheel", wheel);
      view.removeEventListener("pointerdown", interrupt);
      window.removeEventListener("message", receive);
    };
  }, []);

  // A teaser poster on the ML tab links straight to its card in the rail.
  useEffect(() => {
    const view = rail.current;
    const index = experiments.findIndex((experiment) => experiment.slug === focusSlug);
    const card = view?.children[index] as HTMLElement | undefined;
    const first = view?.firstElementChild as HTMLElement | null;
    if (!view || !card || !first) return;
    const frame = requestAnimationFrame(() => scrollTo.current(card.offsetLeft - first.offsetLeft, true));
    return () => cancelAnimationFrame(frame);
  }, [focusSlug]);

  function move(direction: number) {
    const view = rail.current;
    const card = view?.firstElementChild as HTMLElement | null;
    if (!view || !card) return;
    const step = card.offsetWidth + parseFloat(getComputedStyle(view).gap || "0");
    scrollTo.current(direction * step);
  }

  return <div className="component-gallery">
    <div className="showcase-section-note"><p>A little room for play.</p><span>Scroll sideways. Try something.</span></div>
    {/* eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions, jsx-a11y/no-noninteractive-tabindex -- A named scroll region supports arrow, Home, and End navigation. */}
    <div ref={rail} className="experiment-rail" role="region" aria-label="Interactive web components. Scroll sideways, swipe, or use the arrow buttons." tabIndex={0} onKeyDown={(event) => {
      if (event.target !== event.currentTarget) return;
      if (event.key === "ArrowLeft" || event.key === "ArrowRight") { event.preventDefault(); move(event.key === "ArrowRight" ? 1 : -1); }
      if (event.key === "Home" || event.key === "End") { event.preventDefault(); scrollTo.current(event.key === "Home" ? 0 : rail.current?.scrollWidth ?? 0, true); }
    }}>
      {experiments.map((experiment, index) => <ExperimentCard key={experiment.slug} index={index} experiment={experiment} onOpen={() => onSelect(experiment)} expanded={selected?.slug === experiment.slug} />)}
    </div>
    <div className="component-gallery__footer">
      <span className="component-gallery__count">{String(position.current).padStart(2, "0")} <span>/ {String(experiments.length).padStart(2, "0")}</span></span>
      <div className="component-gallery__progress" aria-hidden="true"><span ref={progress} /></div>
      <div className="component-gallery__arrows"><button type="button" onClick={() => move(-1)} disabled={position.start} aria-label="Previous components">←</button><button type="button" onClick={() => move(1)} disabled={position.end} aria-label="Next components">→</button></div>
    </div>
  </div>;
}

export default function WorkShowcase({ children }: { children: ReactNode }) {
  const [tab, setTab] = useState<"ml" | "web">("ml");
  const [selected, setSelected] = useState<Experiment | null>(null);
  const [focusSlug, setFocusSlug] = useState<string | null>(null);
  const root = useRef<HTMLDivElement>(null);
  const tabButtons = useRef<(HTMLButtonElement | null)[]>([]);
  const closePreview = useCallback(() => setSelected(null), []);

  useEffect(() => {
    const update = () => {
      const hash = window.location.hash;
      const web = hash === "#web" || hash.startsWith("#web-");
      setTab(web ? "web" : "ml");
      setFocusSlug(hash.startsWith("#web-") ? hash.slice(5) : null);
      // Deep links from the About page (#geohab, #competitions…) land on, and open, their section;
      // web links (#web-koi-pond…) land on the tabs so the chosen card is in view.
      const target = web ? hash.startsWith("#web-") ? root.current : null
        : hash.length > 1 && hash !== "#ml" ? document.getElementById(hash.slice(1)) : null;
      if (!target) return;
      if (target instanceof HTMLDetailsElement) target.open = true;
      requestAnimationFrame(() => target.scrollIntoView({
        block: "start",
        behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth",
      }));
    };
    update();
    window.addEventListener("hashchange", update);
    return () => window.removeEventListener("hashchange", update);
  }, []);

  function choose(value: "ml" | "web") {
    setTab(value);
    window.history.replaceState(null, "", `${window.location.pathname}${window.location.search}#${value}`);
  }
  function navigateTabs(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    if (event.altKey || event.ctrlKey || event.metaKey) return;
    let next = index;
    if (event.key === "ArrowRight" || event.key === "ArrowLeft") next = 1 - index;
    else if (event.key === "Home") next = 0;
    else if (event.key === "End") next = 1;
    else return;
    event.preventDefault();
    choose(next === 0 ? "ml" : "web");
    tabButtons.current[next]?.focus();
  }

  return <div ref={root} className="work-showcase">
    <div className="showcase-tabs" role="tablist" aria-label="Project categories">
      {([{ id: "ml", label: "ML & systems", count: "04" }, { id: "web", label: "Web & interaction", count: String(experiments.length).padStart(2, "0") }] as const).map((item, index) => <button key={item.id} ref={(element) => { tabButtons.current[index] = element; }} type="button" role="tab" id={`work-tab-${item.id}`} aria-selected={tab === item.id} aria-controls={`work-panel-${item.id}`} tabIndex={tab === item.id ? 0 : -1} onClick={() => choose(item.id)} onKeyDown={(event) => navigateTabs(event, index)}>{item.label}<span>{item.count}</span></button>)}
      <span className="showcase-tab-note" aria-hidden="true">Selected projects / 2026</span>
    </div>
    <section role="tabpanel" id="work-panel-ml" aria-labelledby="work-tab-ml" tabIndex={0} hidden={tab !== "ml"} className="showcase-panel showcase-panel--ml">{children}</section>
    <section role="tabpanel" id="work-panel-web" aria-labelledby="work-tab-web" tabIndex={0} hidden={tab !== "web"} className="showcase-panel showcase-panel--web">
      {tab === "web" && <ExperimentGallery selected={selected} onSelect={setSelected} focusSlug={focusSlug} />}
    </section>
    {selected && <ExperimentDialog experiment={selected} onClose={closePreview} />}
  </div>;
}
