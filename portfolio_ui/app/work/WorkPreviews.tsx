"use client";

import { useEffect, useRef, useState, type RefObject } from "react";



export type Experiment = {
  slug: string;
  name: string;
  description: string;
  medium: string;
  hint: string;
  poster: string;
  inline?: boolean;
  featured?: boolean;
  video?: boolean;
  videoSrc?: string;
  interaction?: string;
};

export const experiments: Experiment[] = [
  { slug: "koi-pond", name: "Koi Pond", description: "Leave a ripple. Stay a while.", medium: "Watercolor · Interactive simulation", hint: "Touch the water, feed the koi, or try another drawing medium.", interaction: "Tap the water", poster: "/experiments/koi-pond/art/poster.webp", inline: true },
  { slug: "keyspace", name: "Keyspace", description: "Small keys. A whole world.", medium: "Creative coding · Keyboard interaction", hint: "Scroll to transform. Type, drag, and make it your own.", interaction: "Drag or play the keys", poster: "/experiments/keyspace/globe.webp" },
  { slug: "cherry-blossom", name: "Cherry Blossom", description: "A quiet pool. A moment of spring.", medium: "WebGL · Water & light", hint: "Touch the water or drop a stone to send ripples through the petals.", interaction: "Touch to ripple", poster: "/experiments/cherry-blossom/assets/blossom-scene.webp" },
  { slug: "little-fizz", name: "Little Fizz", description: "Small friend. Big feelings.", medium: "WebGL · Playful physics", hint: "Move your pointer to lead the ice puppy. Tap for a little happy.", interaction: "Move, drag, or boop", poster: "/experiments/little-fizz/poster.webp" },
  { slug: "chill", name: "CHILL", description: "A little cherry. A little chill.", medium: "Blender · Animation", hint: "The original CHILL glass, ice, and pouring animation. Pause or replay to take your time.", interaction: "Glass, ice & a little fizz", poster: "/experiments/chill/poster.png", video: true, videoSrc: "/experiments/chill/chill-intro-hq.mp4" },
  { slug: "no-plan-calendar", name: "No Plan Calendar", description: "A little company, every day.", medium: "Illustration · Everyday interaction", hint: "Pick a day, skip ahead, or find your way back to today.", interaction: "Pick a day", poster: "", inline: true },
  { slug: "rain-mouse", name: "Rain Mouse", description: "A little shelter from the rain.", medium: "Illustration · Motion study", hint: "A quiet six-second loop. Play, pause, or watch the rain a little longer.", interaction: "A little shelter", poster: "/experiments/rain-mouse/poster.webp", video: true, videoSrc: "/experiments/rain-mouse/rain-mouse.mp4" },
];

function demoUrl(experiment: Experiment, compact = false) {
  return `/experiments/${experiment.slug}/index.html${compact ? "?embed=card" : ""}`;
}

export function PreviewFrame({ experiment, compact = false, frameRef }: { experiment: Experiment; compact?: boolean; frameRef?: RefObject<HTMLIFrameElement | null> }) {
  const [loaded, setLoaded] = useState(false);
  const [slow, setSlow] = useState(false);
  useEffect(() => {
    const timer = setTimeout(() => setSlow(true), 12000);
    return () => clearTimeout(timer);
  }, []);

  return <div className={`experiment-frame ${loaded ? "is-loaded" : ""}`}>
    {!loaded && <div className="experiment-loading" role="status"><span />{slow ? "Taking a little longer…" : "Opening a small world…"}{slow && <a href={demoUrl(experiment)} target="_blank" rel="noreferrer">Open separately ↗</a>}</div>}
    <iframe ref={frameRef} src={`${demoUrl(experiment, compact)}${!compact && experiment.inline ? "?embed=expanded" : ""}`} title={`${experiment.name} ${compact ? "inline" : "expanded"} interactive preview`} loading="eager" onLoad={() => setLoaded(true)} />
  </div>;
}

export function ExperimentDialog({ experiment, onClose }: { experiment: Experiment; onClose: () => void }) {
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

  return <dialog ref={dialog} className={`experiment-dialog ${experiment.video ? "experiment-dialog--film" : ""} experiment-dialog--${experiment.slug}`} aria-labelledby="experiment-title" aria-describedby="experiment-hint" onCancel={(event) => { event.preventDefault(); onClose(); }}>
    <div className="experiment-dialog__card">
      <header className="experiment-dialog__header">
        <div><span className="showcase-eyebrow">{experiment.medium}</span><h2 id="experiment-title">{experiment.name}</h2></div>
        <div className="experiment-dialog__actions"><a href={experiment.video ? experiment.videoSrc : demoUrl(experiment)} target="_blank" rel="noreferrer" aria-label={`Open ${experiment.name} in a new tab`}>Open separately ↗</a><button ref={closeButton} type="button" onClick={onClose} aria-label="Close preview"><span aria-hidden="true">×</span></button></div>
      </header>
      <div className="experiment-dialog__stage">
        {experiment.video ? <video ref={video} src={experiment.videoSrc} poster={experiment.poster} controls loop muted playsInline aria-label={`${experiment.name} animation`} /> : <PreviewFrame experiment={experiment} frameRef={frame} />}
      </div>
      <footer className="experiment-dialog__footer"><p id="experiment-hint">{experiment.hint}</p><span>ESC to close</span></footer>
    </div>
  </dialog>;
}
