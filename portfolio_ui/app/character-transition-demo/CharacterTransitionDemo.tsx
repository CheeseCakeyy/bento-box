"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState, type CSSProperties } from "react";
import gsap from "gsap";
import styles from "./character-transition-demo.module.css";

type Pose = "idle" | "walk" | "launch" | "jump" | "land";

type AtlasPage = {
  id: string;
  label: string;
  code: string;
  category: string;
  title: string;
  description: string;
  destination: string;
  accent: string;
  track: number;
  markerTop: string;
};

const pages: AtlasPage[] = [
  {
    id: "about",
    label: "About",
    code: "01",
    category: "AI · DATA · SOFTWARE",
    title: "A curious systems builder",
    description: "A small world of intelligent systems, experiments, and the questions behind them.",
    destination: "The person behind the work",
    accent: "#7f8e88",
    track: 0.12,
    markerTop: "32%",
  },
  {
    id: "work",
    label: "Work",
    code: "02",
    category: "ML · RESEARCH · BUILDS",
    title: "Ideas made tangible",
    description: "Case files and experiments placed along the path instead of stacked into a grid.",
    destination: "Selected work",
    accent: "#b78d54",
    track: 0.39,
    markerTop: "49%",
  },
  {
    id: "collection",
    label: "Collection",
    code: "03",
    category: "BOOKS · NOTES · OBJECTS",
    title: "Things worth keeping",
    description: "Books, images, music, and fragments that quietly influence the work around them.",
    destination: "A living collection",
    accent: "#78918b",
    track: 0.66,
    markerTop: "25%",
  },
  {
    id: "contact",
    label: "Contact",
    code: "04",
    category: "OPEN TO INTERESTING PROBLEMS",
    title: "Let’s make something move",
    description: "A soft landing for starting a conversation about a problem worth exploring.",
    destination: "Start a conversation",
    accent: "#a8757e",
    track: 0.88,
    markerTop: "42%",
  },
];

function Character({ pose }: { pose: Pose }) {
  const poseClass = {
    idle: styles.poseIdle,
    walk: styles.poseWalk,
    launch: styles.poseLaunch,
    jump: styles.poseJump,
    land: styles.poseLand,
  }[pose];

  return (
    <svg
      className={styles.characterSvg}
      viewBox="0 0 160 150"
      role="img"
      aria-label="A small person travelling with an umbrella"
    >
      <g className={`${styles.person} ${poseClass}`} fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
        <path className={styles.umbrella} d="M13 33 Q80 -2 147 33 Q80 22 13 33Z" strokeWidth="2.4" />
        <path d="M80 32v13" strokeWidth="2.1" />
        <path d="M80 45c-7 4-6 11 1 12 6 1 8 5 6 10" strokeWidth="2.1" />

        <circle cx="80" cy="57" r="9" strokeWidth="2.3" />
        <path className={styles.face} d="M77 56h1M83 56h1" strokeWidth="1.7" />
        <path className={styles.body} d="M73 67c-4 11-7 25-3 38 8 4 17 4 25 0 3-14 0-26-6-38" strokeWidth="2.5" />
        <path className={styles.armBack} d="M73 73c-8 8-12 17-14 28" strokeWidth="2.2" />
        <path className={styles.armFront} d="M89 74c8 6 12 14 14 23" strokeWidth="2.2" />

        <path className={styles.legBack} d="M71 103c-2 13-8 23-17 30" strokeWidth="2.5" />
        <path className={styles.legFront} d="M89 103c4 12 10 20 20 25" strokeWidth="2.5" />
        <path d="M51 133l9 1M108 128l9 1" strokeWidth="2.2" />
      </g>
      <path className={styles.characterSpark} d="M130 47l3 6 6 2-6 2-3 7-3-7-6-2 6-2z" />
    </svg>
  );
}

export default function CharacterTransitionDemo() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [pendingIndex, setPendingIndex] = useState<number | null>(null);
  const [pose, setPose] = useState<Pose>("idle");
  const [isTraveling, setIsTraveling] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  const worldRef = useRef<HTMLDivElement>(null);
  const characterRef = useRef<HTMLDivElement>(null);
  const shadowRef = useRef<HTMLDivElement>(null);
  const rippleRef = useRef<HTMLDivElement>(null);
  const rippleRingOneRef = useRef<HTMLSpanElement>(null);
  const rippleRingTwoRef = useRef<HTMLSpanElement>(null);
  const rippleRingThreeRef = useRef<HTMLSpanElement>(null);
  const burstRef = useRef<HTMLDivElement>(null);
  const washRef = useRef<HTMLDivElement>(null);
  const pageCopyRef = useRef<HTMLDivElement>(null);
  const timelineRef = useRef<gsap.core.Timeline | null>(null);
  const activeIndexRef = useRef(0);
  const travelingRef = useRef(false);
  const reducedMotionRef = useRef(false);

  const activePage = pages[activeIndex];
  const pendingPage = pendingIndex === null ? null : pages[pendingIndex];

  useEffect(() => {
    activeIndexRef.current = activeIndex;
  }, [activeIndex]);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const updatePreference = () => {
      reducedMotionRef.current = mediaQuery.matches;
      setPrefersReducedMotion(mediaQuery.matches);
    };

    updatePreference();
    mediaQuery.addEventListener("change", updatePreference);
    return () => mediaQuery.removeEventListener("change", updatePreference);
  }, []);

  const getStopX = useCallback((index: number) => {
    const worldWidth = worldRef.current?.getBoundingClientRect().width ?? 1000;
    const characterWidth = 154;
    const sidePadding = Math.min(94, Math.max(52, worldWidth * 0.08));
    const usableWidth = Math.max(0, worldWidth - sidePadding * 2 - characterWidth);
    return sidePadding + (usableWidth * pages[index].track) / 0.88;
  }, []);

  const triggerLanding = useCallback((targetX: number) => {
    if (
      !rippleRef.current ||
      !burstRef.current ||
      !rippleRingOneRef.current ||
      !rippleRingTwoRef.current ||
      !rippleRingThreeRef.current
    ) return;

    const rings = [rippleRingOneRef.current, rippleRingTwoRef.current, rippleRingThreeRef.current];

    gsap.set(rippleRef.current, { x: targetX, opacity: 1 });
    gsap.set(rings, { scale: 0.25, opacity: 0.72 });
    gsap.set(burstRef.current, { x: targetX, scale: 0.35, opacity: 0.72 });

    const rippleTimeline = gsap.timeline();
    rippleTimeline
      .to(rippleRef.current, { opacity: 1, duration: 0.03 })
      .to(rings[0], { scale: 1, opacity: 0, duration: 0.58, ease: "power2.out" }, 0)
      .to(rings[1], { scale: 1, opacity: 0, duration: 0.58, ease: "power2.out" }, 0.1)
      .to(rings[2], { scale: 1, opacity: 0, duration: 0.58, ease: "power2.out" }, 0.2)
      .to(burstRef.current, { scale: 1, opacity: 0, duration: 0.42, ease: "power2.out" }, 0)
      .to(rippleRef.current, { opacity: 0, duration: 0.18, ease: "power1.out" }, 0.55);
  }, []);

  useLayoutEffect(() => {
    const placeCharacter = () => {
      if (!characterRef.current) return;
      gsap.set(characterRef.current, {
        x: getStopX(activeIndexRef.current),
        y: 0,
        rotation: 0,
        scaleX: 1,
        scaleY: 1,
      });
    };

    placeCharacter();
    window.addEventListener("resize", placeCharacter);
    return () => window.removeEventListener("resize", placeCharacter);
  }, [getStopX]);

  useEffect(() => {
    return () => timelineRef.current?.kill();
  }, []);

  const playTransition = useCallback(
    (nextIndex: number) => {
      if (travelingRef.current || nextIndex === activeIndexRef.current || !characterRef.current) return;

      const direction = nextIndex > activeIndexRef.current ? 1 : -1;
      const startX = getStopX(activeIndexRef.current);
      const targetX = getStopX(nextIndex);
      const character = characterRef.current;
      const shadow = shadowRef.current;
      const ripple = rippleRef.current;
      const burst = burstRef.current;
      const wash = washRef.current;
      const copy = pageCopyRef.current;

      if (!shadow || !ripple || !burst || !wash || !copy) return;

      travelingRef.current = true;
      setIsTraveling(true);
      setPendingIndex(nextIndex);
      setPose("walk");

      if (reducedMotionRef.current) {
        gsap.set(character, { x: targetX, y: 0, rotation: 0, scaleX: direction, scaleY: 1 });
        gsap.set([ripple, burst], { opacity: 0 });
        activeIndexRef.current = nextIndex;
        setActiveIndex(nextIndex);
        setPendingIndex(null);
        setPose("idle");
        setIsTraveling(false);
        travelingRef.current = false;
        return;
      }

      const timeline = gsap.timeline({
        onComplete: () => {
          setPendingIndex(null);
          setPose("idle");
          setIsTraveling(false);
          travelingRef.current = false;
        },
      });

      timelineRef.current = timeline;

      timeline
        .set(character, { scaleX: direction, transformOrigin: "50% 100%" })
        .to(copy, { opacity: 0, y: -8, duration: 0.16, ease: "power2.in" }, 0.02)
        .to(wash, { opacity: 0.2, duration: 0.16, ease: "power1.out" }, 0.08)
        .to(character, { x: startX + direction * 46, y: 2, duration: 0.2, ease: "power1.inOut" }, 0.1)
        .call(() => setPose("launch"), [], 0.22)
        .to(shadow, { scaleX: 0.36, opacity: 0.2, duration: 0.3, ease: "power2.out" }, 0.24)
        .to(character, { x: targetX, y: -176, rotation: direction * 7, duration: 0.58, ease: "power2.out" }, 0.26)
        .call(() => setPose("jump"), [], 0.38)
        .call(() => {
          activeIndexRef.current = nextIndex;
          setActiveIndex(nextIndex);
        }, [], 0.62)
        .to(character, { x: targetX, y: 0, rotation: 0, duration: 0.38, ease: "power2.in" }, 0.84)
        .call(() => setPose("land"), [], 1.02)
        .set(ripple, { x: targetX, opacity: 0 }, 1.02)
        .set(burst, { x: targetX, opacity: 0 }, 1.02)
        .to(character, { y: 7, scaleY: 0.78, duration: 0.09, ease: "power2.out" }, 1.03)
        .to(character, { y: 0, scaleY: 1, duration: 0.3, ease: "elastic.out(1, 0.42)" }, 1.12)
        .call(() => triggerLanding(targetX), [], 1.03)
        .fromTo(copy, { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: 0.4, ease: "power3.out" }, 1.1)
        .to(wash, { opacity: 0, duration: 0.32, ease: "power2.inOut" }, 1.12)
        .to(shadow, { scaleX: 1, opacity: 0.42, duration: 0.32, ease: "power2.out" }, 1.12);
    },
    [getStopX, triggerLanding],
  );

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "ArrowRight" || event.key === "d" || event.key === "D") {
        event.preventDefault();
        playTransition(Math.min(pages.length - 1, activeIndexRef.current + 1));
      }
      if (event.key === "ArrowLeft" || event.key === "a" || event.key === "A") {
        event.preventDefault();
        playTransition(Math.max(0, activeIndexRef.current - 1));
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [playTransition]);

  const statusMessage = isTraveling && pendingPage
    ? `travelling to ${pendingPage.label.toLowerCase()}`
    : `standing at ${activePage.label.toLowerCase()}`;

  return (
    <main className={styles.page}>
      <div className={styles.frame}>
        <header className={styles.topbar}>
          <div className={styles.brandBlock}>
            <span className={styles.brandMark} aria-hidden="true">a</span>
            <span className={styles.brandName}>ADWAIT / WALKABLE PORTFOLIO</span>
          </div>
          <div className={styles.actLabel}>
            <span>ACT I</span>
            <span className={styles.actTrail} aria-hidden="true">· · · · · ·</span>
            <span>THE SMALL ATLAS</span>
          </div>
          <span className={styles.soundMark} aria-hidden="true">♪</span>
        </header>

        <section
          className={styles.world}
          ref={worldRef}
          style={{ "--page-accent": activePage.accent } as CSSProperties}
          aria-label="Character page transition demo"
        >
          <div className={styles.skyDots} aria-hidden="true" />
          <div className={styles.farHill} aria-hidden="true" />
          <div className={styles.nearHill} aria-hidden="true" />

          <div className={styles.worldHeader} aria-hidden="true">
            <span>WALK WITH A / D</span>
            <span>{activePage.code} / {String(pages.length).padStart(2, "0")}</span>
          </div>

          <div className={styles.pageCopy} ref={pageCopyRef}>
            <span className={styles.pageKicker}>{activePage.category}</span>
            <h1>{activePage.title}</h1>
            <p>{activePage.description}</p>
            <span className={styles.pageDestination}>{activePage.destination} <b aria-hidden="true">↗</b></span>
          </div>

          <div className={styles.markerLayer} aria-hidden="true">
            {pages.map((page, index) => (
              <div
                className={`${styles.marker} ${index === activeIndex ? styles.markerActive : ""}`}
                key={page.id}
                style={{ "--track": page.track, "--marker-top": page.markerTop } as CSSProperties}
              >
                <span className={styles.markerLine} />
                <span className={styles.markerCode}>{page.code}</span>
                <span className={styles.markerLabel}>{page.label}</span>
              </div>
            ))}
          </div>

          <div className={styles.ground} aria-hidden="true" />
          <div className={styles.groundNote} aria-hidden="true">a little further right →</div>

          <div className={styles.ripple} ref={rippleRef} aria-hidden="true">
            <span className={styles.rippleRing} ref={rippleRingOneRef} />
            <span className={`${styles.rippleRing} ${styles.rippleRingTwo}`} ref={rippleRingTwoRef} />
            <span className={`${styles.rippleRing} ${styles.rippleRingThree}`} ref={rippleRingThreeRef} />
          </div>

          <div className={styles.burst} ref={burstRef} aria-hidden="true">
            <span />
            <span />
            <span />
            <span />
          </div>

          <div className={styles.character} ref={characterRef}>
            <div className={styles.characterShadow} ref={shadowRef} />
            <Character pose={pose} />
          </div>

          <div className={styles.wash} ref={washRef} aria-hidden="true" />
        </section>

        <footer className={styles.controls}>
          <nav className={styles.pageNav} aria-label="Demo pages">
            {pages.map((page, index) => (
              <button
                className={index === activeIndex ? styles.navButtonActive : styles.navButton}
                key={page.id}
                type="button"
                aria-current={index === activeIndex ? "page" : undefined}
                disabled={isTraveling}
                onClick={() => playTransition(index)}
              >
                <span>{page.code}</span> {page.label}
              </button>
            ))}
          </nav>

          <div className={styles.directionControls}>
            <button
              className={styles.directionButton}
              type="button"
              aria-label="Go to previous page"
              disabled={isTraveling || activeIndex === 0}
              onClick={() => playTransition(Math.max(0, activeIndex - 1))}
            >
              ← <span>back</span>
            </button>
            <span className={styles.keyHint}>A <b>/</b> D</span>
            <button
              className={styles.directionButton}
              type="button"
              aria-label="Go to next page"
              disabled={isTraveling || activeIndex === pages.length - 1}
              onClick={() => playTransition(Math.min(pages.length - 1, activeIndex + 1))}
            >
              <span>forward</span> →
            </button>
          </div>

          <p className={styles.status} role="status" aria-live="polite">
            <span className={styles.statusDot} aria-hidden="true" />
            {statusMessage}{prefersReducedMotion ? " · reduced motion" : ""}
          </p>
        </footer>
      </div>
    </main>
  );
}
