"use client";

import { useEffect, useRef, useState } from "react";
import { clickSoundEnabled, playClickSound, setClickSoundEnabled } from "./clickSound";

type Theme = "dark" | "light" | "system";
type Accent = "red" | "green" | "blue";

const options: Array<{ value: Theme; label: string; icon?: string; symbol?: string }> = [
  { value: "dark", icon: "/icons/theme-dark.png", label: "Use dark theme" },
  { value: "light", icon: "/icons/theme-light.png", label: "Use light theme" },
  { value: "system", symbol: "✦", label: "Play color cycle" },
];
const accents: Array<Accent | null> = [null, "red", "green", "blue"];
const accentName = (accent: Accent | null) => accent ?? "grayscale";

export default function ThemeSwitcher() {
  const [theme, setTheme] = useState<Theme>("dark");
  const [accent, setAccent] = useState<Accent | null>(null);
  const [cycling, setCycling] = useState(false);
  const [sound, setSound] = useState(true);
  const nextAccent = accents[(accents.indexOf(accent) + 1) % accents.length];
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const accentRestored = useRef(false);

  const stopCycle = () => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
    document.documentElement.removeAttribute("data-color-cycle");
    setCycling(false);
  };

  const playCycle = () => {
    if (timers.current.length) return;
    setCycling(true);
    const colors = window.matchMedia("(prefers-reduced-motion: reduce)").matches
      ? ["green"] : ["red", "orange", "gold", "green", "cyan", "blue", "violet", "pink"];
    colors.forEach((color, index) => {
      timers.current.push(setTimeout(() => {
        document.documentElement.dataset.colorCycle = color;
      }, index * 900));
    });
    timers.current.push(setTimeout(stopCycle, colors.length * 900));
  };

  useEffect(() => () => {
    timers.current.forEach(clearTimeout);
    document.documentElement.removeAttribute("data-color-cycle");
  }, []);

  useEffect(() => {
    const savedTheme = window.localStorage.getItem("portfolio-theme") as Theme | null;
    if (savedTheme && options.some((option) => option.value === savedTheme)) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- Restore browser-only preferences after hydration while keeping the server and first client render identical.
      setTheme(savedTheme);
    }
    const savedAccent = window.localStorage.getItem("portfolio-accent") as Accent | null;
    if (savedAccent && accents.includes(savedAccent)) {
      setAccent(savedAccent);
    }
    setSound(clickSoundEnabled());
  }, []);

  useEffect(() => {
    // Leave the saved accent in place until it has been restored, so navigation never flashes grayscale.
    if (!accentRestored.current) {
      accentRestored.current = true;
      return;
    }
    if (accent) {
      document.documentElement.dataset.colorTheme = accent;
      window.localStorage.setItem("portfolio-accent", accent);
    } else {
      delete document.documentElement.dataset.colorTheme;
      window.localStorage.removeItem("portfolio-accent");
    }
  }, [accent]);

  useEffect(() => {
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const applyTheme = () => {
      document.documentElement.dataset.theme = theme === "system"
        ? media.matches ? "dark" : "light"
        : theme;
    };

    applyTheme();
    window.localStorage.setItem("portfolio-theme", theme);
    media.addEventListener("change", applyTheme);
    return () => media.removeEventListener("change", applyTheme);
  }, [theme]);

  return (
    <div className="theme-switcher" aria-label="Theme controls">
      <span className={`theme-indicator theme-indicator--${cycling ? "system" : theme === "system" ? "dark" : theme}`} aria-hidden="true" />
      {options.map((option) => (
        <button
          key={option.value}
          className={(option.value === "system" ? cycling : theme === option.value) ? "is-active" : ""}
          type="button"
          aria-label={option.label}
          title={option.label}
          aria-pressed={option.value === "system" ? cycling : theme === option.value}
          onClick={() => {
            if (option.value === "system") playCycle();
            else { stopCycle(); setTheme(option.value); }
          }}
        >
          {option.icon ? (
            <span className={`theme-option-icon theme-option-icon--${option.value}`} aria-hidden="true" />
          ) : (
            <span className="theme-option-symbol" aria-hidden="true">{option.symbol}</span>
          )}
        </button>
      ))}
      <button
        className={`theme-accent ${accent ? `is-active theme-accent--${accent}` : ""}`}
        type="button"
        aria-label={`Accent color: ${accentName(accent)}. Switch to ${accentName(nextAccent)}`}
        title={`Accent: ${accentName(accent)} → ${accentName(nextAccent)}`}
        onClick={() => setAccent(nextAccent)}
      >
        <span className="theme-accent__dot" aria-hidden="true" />
      </button>
      <button
        className={`theme-sound ${sound ? "is-active" : ""}`}
        type="button"
        aria-label={sound ? "Mute click sounds" : "Turn on click sounds"}
        aria-pressed={sound}
        title={sound ? "Click sounds on" : "Click sounds off"}
        onClick={() => {
          setClickSoundEnabled(!sound);
          if (!sound) playClickSound(true);
          setSound(!sound);
        }}
      >
        <svg viewBox="0 0 20 20" width="17" height="17" aria-hidden="true">
          <path d="M3.5 7.5h3l4-3.5v12l-4-3.5h-3z" fill="currentColor" />
          {sound
            ? <><path d="M13.2 7.2a4 4 0 0 1 0 5.6" /><path d="M15.4 5a7 7 0 0 1 0 10" /></>
            : <path d="M13.5 7.5l5 5m0-5l-5 5" />}
        </svg>
      </button>
    </div>
  );
}
