"use client";

import { useCallback, useEffect, useRef, useState, type CSSProperties } from "react";
import MLProjects from "./MLProjects";
import { experiments, ExperimentDialog, type Experiment } from "./WorkPreviews";
import "./project-board.css";

type Project = {
  id: string;
  name: string;
  description: string;
  category: "ml" | "web";
  skills: string[];
  image?: string;
  experiment?: Experiment;
  ml?: "geohab" | "f1" | "folio";
};

const projects: Project[] = [
  { id: "geohab", name: "GeoHab", description: "Reading the world beneath the water.", category: "ml", skills: ["Geospatial ML", "LightGBM", "Spatial features", "Ensembling"], image: "/work/geohab/training-map-color.webp", ml: "geohab" },
  { id: "f1", name: "Predicting F1 Pit Stops", description: "Finding the right moment to pit.", category: "ml", skills: ["Feature engineering", "LightGBM", "RealMLP", "FastAPI"], ml: "f1" },
  ...experiments.slice(0, 2).map(toProject),
  { id: "folio", name: "Folio", description: "Connecting creative people to possibility.", category: "ml", skills: ["Embeddings", "Semantic matching", "Recommendation systems"], ml: "folio" },
  ...experiments.slice(2).map(toProject),
];

function toProject(experiment: Experiment): Project {
  return { id: experiment.slug, name: experiment.name, description: experiment.description, category: "web", image: experiment.poster, experiment, skills: experiment.medium.split(" · ") };
}

function ProjectVisual({ project }: { project: Project }) {
  if (project.image) return <img src={project.image} alt={`${project.name} project preview`} loading="lazy" />;
  if (project.id === "f1") return <div className="cabinet-art cabinet-art--f1"><span>RACE STRATEGY / MODEL STUDY</span><svg viewBox="0 0 320 180" aria-label="Private ROC AUC improves from 0.93609 to 0.95369" role="img"><path d="M20 145H300M20 100H300M20 55H300" stroke="currentColor" opacity=".16" /><path d="M22 145L72 145L122 85L172 68L222 38L292 22" fill="none" stroke="currentColor" strokeWidth="3" /><circle cx="292" cy="22" r="5" fill="currentColor" /></svg><strong>0.95369</strong><small>Private ROC AUC · best saved blend</small></div>;
  if (project.id === "folio") return <div className="cabinet-art cabinet-art--folio"><span>FOLIO / SEMANTIC MATCHING</span><div aria-hidden="true">◎<i>········</i>◎</div><strong>A closer match.</strong><small>People × possibilities</small></div>;
  return <div className="cabinet-art cabinet-art--calendar"><span>THE NO PLAN CALENDAR</span><strong>Take<br />your time.</strong><small>A little company, every day.</small></div>;
}

function ProjectDetails({ project, onClose }: { project: Project; onClose: () => void }) {
  const ref = useRef<HTMLDialogElement>(null);
  const [preview, setPreview] = useState(false);
  const closePreview = useCallback(() => setPreview(false), []);
  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    const previousFocus = document.activeElement as HTMLElement | null;
    const overflow = document.body.style.overflow;
    dialog.showModal();
    document.body.style.overflow = "hidden";
    const backdrop = (event: MouseEvent) => { if (event.target === dialog) onClose(); };
    dialog.addEventListener("click", backdrop);
    return () => {
      dialog.removeEventListener("click", backdrop);
      dialog.close();
      document.body.style.overflow = overflow;
      previousFocus?.focus({ preventScroll: true });
    };
  }, [onClose]);

  return <>
    <dialog ref={ref} className="cabinet-dialog" aria-labelledby="cabinet-project-title" onCancel={(event) => { event.preventDefault(); onClose(); }}>
      <div className="cabinet-dossier">
        <header className="cabinet-dossier__header"><span>PROJECT FILE / {project.category === "ml" ? "ML & SYSTEMS" : "WEB & INTERACTION"}</span><button type="button" onClick={onClose} aria-label="Close project details">×</button></header>
        <div className="cabinet-dossier__intro"><span className="cabinet-label">A closer look</span><h2 id="cabinet-project-title">{project.name}</h2><p>{project.description}</p><ul aria-label="Skills involved">{project.skills.map((skill) => <li key={skill}>{skill}</li>)}</ul></div>
        {project.ml ? <MLProjects project={project.ml} /> : <div className="cabinet-web-detail">
          <button className="cabinet-detail-image" type="button" onClick={() => setPreview(true)} aria-label={`Expand ${project.name} preview`} aria-haspopup="dialog"><ProjectVisual project={project} /><span>Open interactive preview ↗</span></button>
          <div className="cabinet-web-copy"><h3>A small world to step into.</h3><p>{project.experiment?.hint}</p><div><button type="button" onClick={() => setPreview(true)}>Open preview ↗</button><a href={project.experiment?.video ? "/experiments/rain-mouse/rain-mouse.mp4" : `/experiments/${project.id}/index.html`} target="_blank" rel="noreferrer">Open separately ↗</a></div></div>
        </div>}
        <footer className="cabinet-dossier__footer">Selected work by Adwait Tagalpallewar<span>ESC to close</span></footer>
      </div>
    </dialog>
    {preview && project.experiment && <ExperimentDialog experiment={project.experiment} onClose={closePreview} />}
  </>;
}

export default function ProjectBoard() {
  const [filter, setFilter] = useState<"all" | "ml" | "web">("all");
  const [opened, setOpened] = useState<Set<string>>(() => new Set());
  const [selected, setSelected] = useState<Project | null>(null);
  const section = useRef<HTMLElement>(null);
  const viewport = useRef<HTMLDivElement>(null);
  const progress = useRef<HTMLDivElement>(null);
  const closeDetails = useCallback(() => setSelected(null), []);
  const visibleProjects = projects.filter((project) => filter === "all" || project.category === filter);

  useEffect(() => {
    const update = () => {
      const hash = window.location.hash;
      setFilter(hash === "#ml" ? "ml" : hash === "#web" ? "web" : "all");
    };
    update();
    window.addEventListener("hashchange", update);
    return () => window.removeEventListener("hashchange", update);
  }, []);

  useEffect(() => {
    const region = section.current;
    const view = viewport.current;
    if (!region || !view) return;
    const media = window.matchMedia("(min-width: 801px) and (min-height: 650px) and (prefers-reduced-motion: no-preference)");
    let frame = 0;
    const sync = () => {
      frame = 0;
      const rect = region.getBoundingClientRect();
      if (media.matches) {
        const distance = Math.max(1, region.offsetHeight - window.innerHeight);
        const fraction = Math.min(1, Math.max(0, -rect.top / distance));
        view.scrollLeft = fraction * (view.scrollWidth - view.clientWidth);
      }
    };
    const schedule = () => { if (!frame) frame = requestAnimationFrame(sync); };
    const track = () => {
      const max = view.scrollWidth - view.clientWidth;
      progress.current?.style.setProperty("--progress", String(max > 0 ? view.scrollLeft / max : 1));
    };
    const observer = new ResizeObserver(() => { schedule(); track(); });
    observer.observe(view);
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    view.addEventListener("scroll", track, { passive: true });
    media.addEventListener("change", schedule);
    sync();
    track();
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      view.removeEventListener("scroll", track);
      media.removeEventListener("change", schedule);
    };
  }, [filter]);

  function choose(value: typeof filter) {
    setFilter(value);
    window.history.replaceState(null, "", `${window.location.pathname}${window.location.search}${value === "all" ? "" : `#${value}`}`);
  }

  function move(direction: number) {
    const view = viewport.current;
    const region = section.current;
    if (!view || !region) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const next = Math.max(0, Math.min(view.scrollWidth - view.clientWidth, view.scrollLeft + direction * view.clientWidth * .65));
    if (window.matchMedia("(min-width: 801px) and (min-height: 650px) and (prefers-reduced-motion: no-preference)").matches) {
      const fraction = next / Math.max(1, view.scrollWidth - view.clientWidth);
      window.scrollTo({ top: window.scrollY + region.getBoundingClientRect().top + fraction * (region.offsetHeight - window.innerHeight), behavior: "smooth" });
    } else view.scrollTo({ left: next, behavior: reduced ? "instant" : "smooth" });
  }

  return <>
    <section className={`cabinet-section ${filter === "ml" ? "cabinet-section--compact" : ""}`} ref={section} aria-label="Project cabinet">
      <div className="cabinet-sticky">
        <div className="cabinet-toolbar"><div className="cabinet-filters" role="group" aria-label="Filter projects">{([{ id: "all", label: "All work", count: "09" }, { id: "ml", label: "ML & systems", count: "03" }, { id: "web", label: "Web & interaction", count: "06" }] as const).map((item) => <button type="button" key={item.id} aria-pressed={filter === item.id} onClick={() => choose(item.id)}>{item.label}<sup>{item.count}</sup></button>)}</div><span className="cabinet-edition">THE WORK CABINET / 2026</span></div>
        <div className="cabinet-room">
          <div className="cabinet-room__note"><span>Objects of curiosity.</span><p>Every door opens a different world.</p></div>
          <div ref={viewport} className="cabinet-viewport" role="region" aria-label="Project doors. Scroll or use arrow controls to explore.">
            <div className="cabinet-space" style={{ "--columns": Math.ceil((visibleProjects.length + 1) / 2) } as CSSProperties}>
              <div className="cabinet-board">
                {visibleProjects.map((project) => {
                  const isOpen = opened.has(project.id);
                  return <article key={project.id} className={`cabinet-cell ${isOpen ? "is-open" : ""}`}>
                    <div className="cabinet-recess" id={`reveal-${project.id}`} inert={!isOpen} aria-hidden={!isOpen}>
                      <button type="button" onClick={() => setSelected(project)} aria-label={`View ${project.name} project details`} aria-haspopup="dialog"><ProjectVisual project={project} /><span>Explore project ↗</span></button>
                    </div>
                    <span className="cabinet-cast-shadow" aria-hidden="true" />
                    <button type="button" className="cabinet-door" aria-expanded={isOpen} aria-controls={`reveal-${project.id}`} aria-label={`${isOpen ? "Close" : "Open"} ${project.name} door`} onClick={() => setOpened((previous) => { const next = new Set(previous); if (next.has(project.id)) next.delete(project.id); else next.add(project.id); return next; })}>
                      <span className="cabinet-door__front"><span className="cabinet-number">{String(projects.indexOf(project) + 1).padStart(2, "0")} / {project.category === "ml" ? "SYSTEMS" : "PLAY"}</span><span className="cabinet-door__copy"><strong>{project.name}</strong><span>{project.description}</span></span><span className="cabinet-door__bottom">OPEN A LITTLE POSSIBILITY</span><i className="cabinet-hole" /></span>
                      <span className="cabinet-door__back" aria-hidden="true"><span>A little<br />curiosity<br />goes a<br />long way.</span><small>↶ CLOSE</small><i className="cabinet-hole" /></span>
                    </button>
                    {isOpen && <button type="button" className="cabinet-close-door" aria-label={`Shut ${project.name} door`} onClick={() => setOpened((previous) => { const next = new Set(previous); next.delete(project.id); return next; })}>↶</button>}
                  </article>;
                })}
                <div className="cabinet-colophon"><span>ALWAYS A WORK IN PROGRESS</span><p>Built with care.<br />Opened with curiosity.</p><span>ADWAIT TAGALPALLEWAR · 2026</span></div>
              </div>
            </div>
          </div>
          <div className="cabinet-bottom"><span className="cabinet-scroll-note"><span className="cabinet-desktop-hint">Scroll to wander</span><span className="cabinet-mobile-hint">Swipe to wander</span> <i>→</i><span>Click a door to look inside</span></span><div className="cabinet-controls"><button type="button" onClick={() => move(-1)} aria-label="Previous projects">←</button><button type="button" onClick={() => move(1)} aria-label="More projects">→</button></div></div>
          <div className="cabinet-progress" ref={progress}><span /></div>
        </div>
      </div>
    </section>
    {selected && <ProjectDetails project={selected} onClose={closeDetails} />}
  </>;
}
