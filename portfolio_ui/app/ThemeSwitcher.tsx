"use client";

import { useEffect, useState } from "react";

type Theme = "dark" | "light" | "system";

const options: Array<{ value: Theme; label: string; icon?: string; symbol?: string }> = [
  { value: "dark", icon: "/icons/theme-dark.png", label: "Use dark theme" },
  { value: "light", icon: "/icons/theme-light.png", label: "Use light theme" },
  { value: "system", symbol: "▣", label: "Use system theme" },
];

export default function ThemeSwitcher() {
  const [theme, setTheme] = useState<Theme>("dark");

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
      <span className={`theme-indicator theme-indicator--${theme}`} aria-hidden="true" />
      {options.map((option) => (
        <button
          key={option.value}
          className={theme === option.value ? "is-active" : ""}
          type="button"
          aria-label={option.label}
          aria-pressed={theme === option.value}
          onClick={() => setTheme(option.value)}
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
