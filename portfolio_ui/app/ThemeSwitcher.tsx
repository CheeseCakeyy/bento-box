"use client";

import { useEffect, useRef, useState } from "react";

type Theme = "dark" | "light" | "system";

const options: Array<{ value: Theme; label: string; icon?: string; symbol?: string }> = [
  { value: "dark", icon: "/icons/theme-dark.png", label: "Use dark theme" },
  { value: "light", icon: "/icons/theme-light.png", label: "Use light theme" },
  { value: "system", symbol: "✦", label: "Play color cycle" },
];

export default function ThemeSwitcher() {
  const [theme, setTheme] = useState<Theme>("dark");
  const [cycling, setCycling] = useState(false);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  const stopCycle = () => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
    delete document.documentElement.dataset.colorCycle;
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
    delete document.documentElement.dataset.colorCycle;
  }, []);

  useEffect(() => {
    const savedTheme = window.localStorage.getItem("portfolio-theme") as Theme | null;
    if (savedTheme && options.some((option) => option.value === savedTheme)) {
      setTheme(savedTheme);
    }
  }, []);

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
    </div>
  );
}
