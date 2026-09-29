"use client";

import { useCallback, useEffect, useRef, useState, type ReactNode, type KeyboardEvent, type RefObject } from "react";

type Experiment = {
  slug: string;
  name: string;
  description: string;
  medium: string;
  hint: string;
  poster: string;
  inline?: boolean;
  featured?: boolean;
  video?: boolean;
};

const experiments: Experiment[] = [
  { slug: "keyspace", name: "Keyspace", description: "Small keys. A whole world.", medium: "Creative coding · Keyboard interaction", hint: "Scroll to transform. Type, drag, and make it your own.", poster: "/experiments/keyspace/globe.webp", featured: true },
  { slug: "koi-pond", name: "Koi Pond", description: "Leave a ripple. Stay a while.", medium: "Watercolor · Interactive simulation", hint: "Touch the water, feed the koi, or try another drawing medium.", poster: "/experiments/koi-pond/art/poster.webp", inline: true },
  { slug: "no-plan-calendar", name: "No Plan Calendar", description: "A little company, every day.", medium: "Illustration · Everyday interaction", hint: "Pick a day, skip ahead, or find your way back to today.", poster: "", inline: true },
  { slug: "cherry-blossom", name: "Cherry Blossom", description: "A quiet pool. A moment of spring.", medium: "WebGL · Water & light", hint: "Touch the water or drop a stone to send ripples through the petals.", poster: "/experiments/cherry-blossom/assets/blossom-scene.webp" },
  { slug: "little-fizz", name: "Little Fizz", description: "Small friend. Big feelings.", medium: "WebGL · Playful physics", hint: "Move your pointer to lead the ice puppy. Tap for a little happy.", poster: "/experiments/little-fizz/poster.webp" },
  { slug: "rain-mouse", name: "Rain Mouse", description: "A little shelter from the rain.", medium: "Illustration · Motion study", hint: "A quiet six-second loop. Play, pause, or watch the rain a little longer.", poster: "/experiments/rain-mouse/poster.webp", video: true },
];

function demoUrl(experiment: Experiment, compact = false) {
  return `/experiments/${experiment.slug}/index.html${compact ? "?embed=card" : ""}`;
}

function PreviewFrame({ experiment, compact = false, frameRef }: { experiment: Experiment; compact?: boolean; frameRef?: RefObject<HTMLIFrameElement | null> }) {
  const [loaded, setLoaded] = useState(false);
  const [slow, setSlow] = useState(false);
  useEffect(() => {
    const timer = setTimeout(() => setSlow(true), 12000);
    return () => clearTimeout(timer);
  }, []);

  return <div className={`experiment-frame ${loaded ? "is-loaded" : ""}`}>
    {!loaded && <div className="experiment-loading" role="status"><span />{slow ? "Taking a little longer…" : "Opening a small world…"}{slow && <a href={demoUrl(experiment)} target="_blank" rel="noreferrer">Open separately ↗</a>}</div>}
    <iframe ref={frameRef} src={`${demoUrl(experiment, compact)}${!compact && experiment.inline ? "?embed=expanded" : ""}`} title={`${experiment.name} ${compact ? "inline" : "expanded"} interactive preview`} loading={compact ? "lazy" : "eager"} onLoad={() => setLoaded(true)} />
  </div>;
}

function ExperimentDialog({ experiment, onClose }: { experiment: Experiment; onClose: () => void }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const frame = useRef<HTMLIFrameElement>(null);
  const video = useRef<HTMLVideoElement>(null);
  const closeButton = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const element = dialog.current;
    if (!element) return;
    const previousFocus = document.activeElement as HTMLElement | null;
    const previousOverflow = document.body.style.overflow;
    element.showModal();
    closeButton.current?.focus();
    document.body.style.overflow = "hidden";
    const receive = (event: MessageEvent) => {
      if (event.origin === window.location.origin && event.source === frame.current?.contentWindow && event.data?.type === "experiment:close") onClose();
    };
    const backdrop = (event: MouseEvent) => { if (event.target === element) onClose(); };
    element.addEventListener("click", backdrop);
    window.addEventListener("message", receive);
    if (video.current && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) video.current.play().catch(() => {});
    return () => {
      window.removeEventListener("message", receive);
      element.removeEventListener("click", backdrop);
      element.close();
      document.body.style.overflow = previousOverflow;
      previousFocus?.focus({ preventScroll: true });
    };
  }, [onClose]);

  return <dialog ref={dialog} className={`experiment-dialog ${experiment.video ? "experiment-dialog--film" : ""}`} aria-labelledby="experiment-title" aria-describedby="experiment-hint" onCancel={(event) => { event.preventDefault(); onClose(); }}>
    <div className="experiment-dialog__card">
      <header className="experiment-dialog__header">
        <div><span className="showcase-eyebrow">{experiment.medium}</span><h2 id="experiment-title">{experiment.name}</h2></div>
        <div className="experiment-dialog__actions"><a href={experiment.video ? "/experiments/rain-mouse/rain-mouse.mp4" : demoUrl(experiment)} target="_blank" rel="noreferrer" aria-label={`Open ${experiment.name} in a new tab`}>Open separately ↗</a><button ref={closeButton} type="button" onClick={onClose} aria-label="Close preview"><span aria-hidden="true">×</span></button></div>
      </header>
      <div className="experiment-dialog__stage">
        {experiment.video ? <video ref={video} src="/experiments/rain-mouse/rain-mouse.mp4" poster={experiment.poster} controls loop muted playsInline aria-label="Rain Mouse animated illustration" /> : <PreviewFrame experiment={experiment} frameRef={frame} />}
      </div>
      <footer className="experiment-dialog__footer"><p id="experiment-hint">{experiment.hint}</p><span>ESC to close</span></footer>
    </div>
  </dialog>;
}

function ExperimentCard({ experiment, onOpen, expanded }: { experiment: Experiment; onOpen: () => void; expanded: boolean }) {
  return <article className={`experiment-card experiment-card--${experiment.slug} ${experiment.featured ? "experiment-card--featured" : ""}`}>
    <div className="experiment-card__stage">
      {experiment.inline ? <>
        <PreviewFrame experiment={experiment} compact />
        <button className="experiment-expand" type="button" onClick={onOpen} aria-label={`Expand ${experiment.name}`} aria-haspopup="dialog" aria-expanded={expanded}>↗</button>
      </> : <button className="experiment-poster" type="button" onClick={onOpen} aria-label={`Open ${experiment.name} preview`} aria-haspopup="dialog" aria-expanded={expanded}>
        <img src={experiment.poster} alt={experiment.description} loading="lazy" />
        {experiment.featured && <span className="experiment-feature-copy" aria-hidden="true"><span>A little curiosity goes a long way</span><strong>Small keys.<br />A whole world.</strong><span>Type. Transform. Take it for a spin.</span></span>}
        <span className="experiment-poster__cue">{experiment.video ? "Play the film" : "Step inside"} <span aria-hidden="true">↗</span></span>
      </button>}
    </div>
    <button type="button" className="experiment-card__caption" onClick={onOpen} aria-label={`Explore ${experiment.name}`} aria-haspopup="dialog" aria-expanded={expanded}>
      <div><div className="experiment-card__title"><h2>{experiment.name}</h2>{experiment.inline && <span className="experiment-live"><i />Live</span>}</div><p>{experiment.description}</p><span className="experiment-medium">{experiment.medium}</span></div>
      <span className="experiment-card__cta">{experiment.inline ? "Expand" : experiment.video ? "Watch" : "Try it"} <span aria-hidden="true">↗</span></span>
    </button>
  </article>;
}

export default function WorkShowcase({ children }: { children: ReactNode }) {
  const [tab, setTab] = useState<"ml" | "web">("ml");
  const [selected, setSelected] = useState<Experiment | null>(null);
  const tabButtons = useRef<(HTMLButtonElement | null)[]>([]);
  const closePreview = useCallback(() => setSelected(null), []);

  useEffect(() => {
    const update = () => setTab(window.location.hash === "#web" ? "web" : "ml");
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

  return <div className="work-showcase">
    <div className="showcase-tabs" role="tablist" aria-label="Work categories">
      {([{ id: "ml", label: "ML & systems", count: "03" }, { id: "web", label: "Web & interaction", count: "06" }] as const).map((item, index) => <button key={item.id} ref={(element) => { tabButtons.current[index] = element; }} type="button" role="tab" id={`work-tab-${item.id}`} aria-selected={tab === item.id} aria-controls={`work-panel-${item.id}`} tabIndex={tab === item.id ? 0 : -1} onClick={() => choose(item.id)} onKeyDown={(event) => navigateTabs(event, index)}>{item.label}<span>{item.count}</span></button>)}
      <span className="showcase-tab-note" aria-hidden="true">Selected work / 2026</span>
    </div>
    <section role="tabpanel" id="work-panel-ml" aria-labelledby="work-tab-ml" tabIndex={0} hidden={tab !== "ml"} className="showcase-panel showcase-panel--ml">{children}</section>
    <section role="tabpanel" id="work-panel-web" aria-labelledby="work-tab-web" tabIndex={0} hidden={tab !== "web"} className="showcase-panel">
      {tab === "web" && <>
        <div className="showcase-section-note"><p>Small worlds, made for a little curiosity.</p><span><i />Two you can play with right here</span></div>
        <div className="experiment-grid">{experiments.map((experiment) => <ExperimentCard key={experiment.slug} experiment={experiment} onOpen={() => setSelected(experiment)} expanded={selected?.slug === experiment.slug} />)}</div>
        <p className="showcase-endnote">A collection of interactions, illustrations, and little things that make the web feel alive.</p>
      </>}
    </section>
    {selected && <ExperimentDialog experiment={selected} onClose={closePreview} />}
  </div>;
}
