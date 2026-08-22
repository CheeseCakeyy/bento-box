"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import CameraRoll from "./CameraRoll";
import LatentSpace from "./LatentSpace";
import MoireDesigner from "./MoireDesigner";
import PipelineBuilder from "./PipelineBuilder";

type Theme = "dark" | "light" | "system";
type ColorTheme = "red" | "green" | "blue";
type WorkspacePhase = "average" | "good";

const themeOptions: Array<{
  value: Theme;
  label: string;
  icon?: string;
  symbol?: string;
}> = [
  { value: "dark", icon: "/icons/theme-dark.png", label: "Use dark theme" },
  { value: "light", icon: "/icons/theme-light.png", label: "Use light theme" },
  { value: "system", symbol: "▣", label: "Use system theme" },
];

const colorThemes: Array<{ value: ColorTheme; label: string }> = [
  { value: "red", label: "R" },
  { value: "green", label: "G" },
  { value: "blue", label: "B" },
];

const songs = [
  {
    title: "Attention",
    artist: "Charlie Puth",
    poster: "/songs-on-loop/posters/01-attention-charlie-puth.webp",
    audio: "/songs-on-loop/tracks/01-attention-charlie-puth.mp3",
  },
  {
    title: "Mirrors",
    artist: "Justin Timberlake",
    poster: "/songs-on-loop/posters/02-mirrors-justin-timberlake.png",
    audio: "/songs-on-loop/tracks/02-mirrors-justin-timberlake.mp3",
  },
  {
    title: "Love Me Not",
    artist: "Ravyn Lenae",
    poster: "/songs-on-loop/posters/03-love-me-not-ravyn-lenae.png",
    audio: "/songs-on-loop/tracks/03-love-me-not-ravyn-lenae.mp3",
  },
  {
    title: "Best Friend",
    artist: "Rex Orange County",
    poster: "/songs-on-loop/posters/04-best-friend-rex-orange-county.png",
    audio: "/songs-on-loop/tracks/04-best-friend-rex-orange-county.mp3",
  },
  {
    title: "High on You",
    artist: "Jind Universe",
    poster: "/songs-on-loop/posters/05-high-on-you-jind-universe.jpg",
    audio: "/songs-on-loop/tracks/05-high-on-you-jind-universe.mp3",
  },
  {
    title: "Long Way 2 Go",
    artist: "Cassie",
    poster: "/songs-on-loop/posters/06-long-way-to-go-cassie.jpg",
    audio: "/songs-on-loop/tracks/06-long-way-to-go-cassie.mp3",
  },
  {
    title: "505",
    artist: "Arctic Monkeys",
    poster: "/songs-on-loop/posters/07-505-arctic-monkeys.png",
    audio: "/songs-on-loop/tracks/07-505-arctic-monkeys.mp3",
  },
  {
    title: "Can’t Take My Eyes off You",
    artist: "Frankie Valli",
    poster: "/songs-on-loop/posters/08-cant-take-my-eyes-off-you-frankie-valli.jpg",
    audio: "/songs-on-loop/tracks/08-cant-take-my-eyes-off-you-frankie-valli.mp3",
  },
  {
    title: "The Less I Know the Better",
    artist: "Tame Impala",
    poster: "/songs-on-loop/posters/09-the-less-i-know-the-better-tame-impala.jpg",
    audio: "/songs-on-loop/tracks/09-the-less-i-know-the-better-tame-impala.mp3",
  },
  {
    title: "I Love You So",
    artist: "The Walters",
    poster: "/songs-on-loop/posters/10-i-love-you-so-the-walters.jpg",
    audio: "/songs-on-loop/tracks/10-i-love-you-so-the-walters.mp3",
  },
];

function formatTime(value: number) {
  if (!Number.isFinite(value)) return "0:00";

  const minutes = Math.floor(value / 60);
  const seconds = Math.floor(value % 60)
    .toString()
    .padStart(2, "0");

  return `${minutes}:${seconds}`;
}

export default function AboutPage() {
  const [theme, setTheme] = useState<Theme>("dark");
  const [colorTheme, setColorTheme] = useState<ColorTheme | null>(null);
  const [workspacePhase, setWorkspacePhase] = useState<WorkspacePhase>("average");
  const [localTime, setLocalTime] = useState("--:-- IST");
  const [selectedSong, setSelectedSong] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [scrolled, setScrolled] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);
  const activeSong = songs[selectedSong];

  const startSong = (index: number) => {
    const audio = audioRef.current;
    if (!audio) return;

    const nextSong = songs[index];
    const nextSource = new URL(nextSong.audio, window.location.origin).href;

    if (audio.src !== nextSource) {
      audio.src = nextSource;
      audio.load();
      setCurrentTime(0);
      setDuration(0);
    }

    setSelectedSong(index);
    void audio.play().catch(() => setIsPlaying(false));
  };

  const togglePlayback = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (audio.paused) {
      void audio.play().catch(() => setIsPlaying(false));
    } else {
      audio.pause();
    }
  };

  useEffect(() => {
    const savedTheme = window.localStorage.getItem("portfolio-theme") as Theme | null;
    if (savedTheme && themeOptions.some((option) => option.value === savedTheme)) {
      setTheme(savedTheme);
    }
  }, []);

  useEffect(() => {
    const media = window.matchMedia("(prefers-color-scheme: dark)");

    const applyTheme = () => {
      const resolvedTheme = theme === "system" ? (media.matches ? "dark" : "light") : theme;
      document.documentElement.dataset.theme = resolvedTheme;
    };

    applyTheme();
    window.localStorage.setItem("portfolio-theme", theme);
    media.addEventListener("change", applyTheme);

    return () => media.removeEventListener("change", applyTheme);
  }, [theme]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 80);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (colorTheme) {
      document.documentElement.dataset.colorTheme = colorTheme;
    } else {
      delete document.documentElement.dataset.colorTheme;
    }
  }, [colorTheme]);

  useEffect(() => {
    const updateLocalTime = () => {
      const time = new Intl.DateTimeFormat("en-IN", {
        timeZone: "Asia/Kolkata",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      })
        .format(new Date())
        .toUpperCase();

      setLocalTime(`${time} IST`);
    };

    updateLocalTime();
    const timer = window.setInterval(updateLocalTime, 30_000);
    return () => window.clearInterval(timer);
  }, []);

  return (
    <div className="site-shell">
      <header className="site-header">
        <a className="identity" href="#about" aria-label="Go to the About page">
          <span className="identity-mark" aria-hidden="true" />
          <span>Adwait Tagalpallewar</span>
        </a>

        <div className="theme-switcher" aria-label="Theme controls">
          <span className={`theme-indicator theme-indicator--${theme}`} aria-hidden="true" />
          {themeOptions.map((option) => (
            <button
              key={option.value}
              className={theme === option.value ? "is-active" : ""}
              type="button"
              aria-label={option.label}
              aria-pressed={theme === option.value}
              onClick={() => setTheme(option.value)}
            >
              {option.icon ? (
                <span
                  className={`theme-option-icon theme-option-icon--${option.value}`}
                  aria-hidden="true"
                />
              ) : (
                <span className="theme-option-symbol" aria-hidden="true">
                  {option.symbol}
                </span>
              )}
            </button>
          ))}
        </div>
      </header>

      <main id="about" className="about-page">
        <section className="intro" aria-label="Introductory heading and disciplines">
          <h1 className="hero-heading">Engineer crafting intelligent systems and experiments.</h1>
          <div className="discipline-row" aria-label="Discipline links">
            <span className="discipline-label">What I do</span>
            <a href="#portfolio-grid">Train models</a>
            <a href="#portfolio-grid">Analyze results</a>
            <a href="#portfolio-grid">Experiments</a>
            <a href="#portfolio-grid">Competitive ML</a>
          </div>
        </section>

        <section id="portfolio-grid" className="portfolio-grid" aria-label="About page sections">
          <article className="panel panel--bio" aria-label="Profile and biography section">
            <div className="bio-media" aria-hidden="true">
              <span className="bio-media__index">About / 01</span>
              <div className="bio-monogram">
                <span>A</span>
                <span>T</span>
              </div>
              <span className="bio-media__caption">AI · Data · Software</span>
            </div>

            <p className="bio-copy">
              I&apos;m a <strong>Computer Science student</strong> working across <strong>AI, data,
              and software</strong>, with a particular interest in building intelligent systems
              from messy real-world problems. I&apos;ve spent my time experimenting with <strong>machine
              learning, research, competitions, and AI-powered products</strong>, which gradually
              pulled me from simply training models into designing and building the systems around
              them. When I&apos;m not working on a project, I&apos;m probably exploring another idea that
              sounded simple five minutes ago.
            </p>

            <div className="bio-actions">
              <div className="bio-socials">
                <span>See what I&apos;ve been doing on</span>
                <div className="bio-social-links" aria-label="Social profiles">
                  <a href="https://github.com/CheeseCakeyy" target="_blank" rel="noreferrer" aria-label="GitHub profile">
                    <i className="fab fa-github" aria-hidden="true" />
                  </a>
                  <a href="https://in.linkedin.com/in/adwait-tagalpallewar" target="_blank" rel="noreferrer" aria-label="LinkedIn profile">
                    <i className="fab fa-linkedin" aria-hidden="true" />
                  </a>
                  <a href="https://www.kaggle.com/adwaittagalpallewar" target="_blank" rel="noreferrer" aria-label="Kaggle profile">
                    <i className="fab fa-kaggle" aria-hidden="true" />
                  </a>
                </div>
              </div>
              <Link className="bio-talk" href="/contact">
                <span>Let&apos;s talk</span>
                <span aria-hidden="true">→</span>
              </Link>
            </div>
          </article>

          <article className="panel panel--side-project" aria-label="Latest side project section">
            <div className="side-project-heading">
              <span>Latest side-project</span>
            </div>
            <div className="side-project-content">
              <div className="side-project-mark" aria-hidden="true" />
              <div className="side-project-title">
                <h2>EmbeddingVC</h2>
                <span aria-hidden="true">↗</span>
              </div>
            </div>
            <p className="side-project-description">
              A lifecycle manager for vector embeddings. Can&apos;t share more than that.
            </p>
          </article>

          <article className="panel panel--workspace" aria-label="Workspace section">
            <div
              className="workspace-window"
              role="tabpanel"
              aria-label={workspacePhase === "average" ? "Workspace on an average day" : "Workspace on a good day"}
            >
              <img
                className={workspacePhase === "average" ? "is-active" : ""}
                src="/workspace-average-day.png"
                alt="A laptop and a black cat at the workspace on an average day"
                aria-hidden={workspacePhase !== "average"}
              />
              <img
                className={workspacePhase === "good" ? "is-active" : ""}
                src="/workspace-good-day.png"
                alt="A waffle held in front of the workspace on a good day"
                aria-hidden={workspacePhase !== "good"}
              />

              <div className="workspace-caption" aria-live="polite">
                <span>Workspace / {workspacePhase === "average" ? "01" : "02"}</span>
                <strong>{workspacePhase === "average" ? "On an average day" : "On a good day"}</strong>
              </div>

              <div className="workspace-phases" role="tablist" aria-label="Choose a workspace phase">
                <button
                  className={workspacePhase === "average" ? "is-active" : ""}
                  type="button"
                  role="tab"
                  aria-selected={workspacePhase === "average"}
                  onClick={() => setWorkspacePhase("average")}
                >
                  <span>01</span>
                  Average day
                </button>
                <button
                  className={workspacePhase === "good" ? "is-active" : ""}
                  type="button"
                  role="tab"
                  aria-selected={workspacePhase === "good"}
                  onClick={() => setWorkspacePhase("good")}
                >
                  <span>02</span>
                  Good day
                </button>
              </div>
            </div>
          </article>

          <article className="panel panel--system" aria-label="System monitor section">
            <div className="system-heading">
              <span>System monitor</span>
              <span className="system-live"><span aria-hidden="true">←→←→</span> Live</span>
            </div>
            <div
              className="system-screen"
              role="status"
              aria-label={`System online. Currently building EmbeddingVC. Local time ${localTime}. Open to interesting problems.`}
            >
              <div className="system-ticker" aria-hidden="true">
                {[0, 1].map((copy) => (
                  <span key={copy}>
                    SYS.ONLINE · BUILDING EMBEDDINGVC · AI / DATA / SOFTWARE · {localTime} · OPEN TO INTERESTING PROBLEMS ·
                  </span>
                ))}
              </div>
            </div>
          </article>

          <article className="panel panel--pantone panel--latent" aria-label="Interactive latent space section">
            <LatentSpace />
          </article>

          <article className="panel panel--color" aria-label="Interactive color section">
            <div className="color-theme-card">
              <div className="color-grid">
                <div className="color-picker" role="group" aria-label="Choose an accent color">
                  {colorThemes.map((option) => {
                    const isActive = colorTheme === option.value;

                    return (
                      <button
                        key={option.value}
                        className={`color-option ${isActive ? "is-active" : ""}`}
                        type="button"
                        aria-label={`Use ${option.value} color theme`}
                        aria-pressed={isActive}
                        onClick={() => setColorTheme(option.value)}
                      >
                        {isActive ? <span className="color-option-dot" /> : option.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="color-card-footer">
                <span className="color-card-label" aria-live="polite">
                  {colorTheme ? "Bring back grayscale" : "Pick a color"}
                </span>
                <button
                  className="color-reset"
                  type="button"
                  aria-label="Reset color theme"
                  disabled={!colorTheme}
                  onClick={() => setColorTheme(null)}
                >
                  <span aria-hidden="true">{colorTheme ? "↶" : "↑"}</span>
                </button>
              </div>
            </div>
          </article>

          <article className="panel panel--photos" aria-label="Camera roll section">
            <CameraRoll />
          </article>

          <PipelineBuilder />

          <article className="panel panel--sketch" aria-label="Interactive moiré spaceship design maker">
            <MoireDesigner />
          </article>

          <article className="panel panel--songs" aria-label="Songs on Loop section">
            <div className="songs-header">
              <h2 className="songs-title">Songs on Loop</h2>
              <span className="songs-index" aria-hidden="true">
                01—10
              </span>
            </div>
            <div className="songs-embed">
              <iframe
                src="/paper-roll/index.html"
                title="Interactive Songs on Loop paper roll"
                loading="lazy"
              />

              <section className="songs-deck" aria-label="Songs on Loop player">
                <div className="songs-deck-heading">
                  <span>Choose a track</span>
                  <span>Tracks / {songs.length}</span>
                </div>

                <div className="song-select-wrap">
                  <select
                    className="song-select"
                    aria-label="Choose a song"
                    value={selectedSong}
                    onChange={(event) => startSong(Number(event.target.value))}
                  >
                    {songs.map((song, index) => (
                      <option key={song.audio} value={index}>
                        {String(index + 1).padStart(2, "0")} · {song.title} — {song.artist}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="songs-now-playing">
                  <img className="song-poster" src={activeSong.poster} alt="" />
                  <button
                    className="song-playback"
                    type="button"
                    aria-label={isPlaying ? "Pause current song" : "Play current song"}
                    onClick={togglePlayback}
                  >
                    <span aria-hidden="true">{isPlaying ? "Ⅱ" : "▶"}</span>
                  </button>
                  <div className="song-current-copy">
                    <strong>{activeSong.title}</strong>
                    <span>{activeSong.artist}</span>
                  </div>
                  <span className="song-time">
                    {formatTime(currentTime)} / {formatTime(duration)}
                  </span>
                  <input
                    className="song-progress"
                    type="range"
                    min="0"
                    max={duration || 0}
                    step="0.1"
                    value={Math.min(currentTime, duration || 0)}
                    aria-label="Song progress"
                    onChange={(event) => {
                      const nextTime = Number(event.target.value);
                      if (audioRef.current) audioRef.current.currentTime = nextTime;
                      setCurrentTime(nextTime);
                    }}
                  />
                </div>
              </section>
            </div>
            <audio
              ref={audioRef}
              src={activeSong.audio}
              preload="metadata"
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
              onLoadedMetadata={(event) => setDuration(event.currentTarget.duration)}
              onTimeUpdate={(event) => setCurrentTime(event.currentTarget.currentTime)}
              onEnded={() => startSong((selectedSong + 1) % songs.length)}
            />
          </article>

          <article className="panel panel--notes collection-invite" aria-labelledby="collection-invite-title">
            <div className="collection-invite__copy">
              <span id="collection-invite-title">Collected along the way</span>
              <p>
                I read books and write poems sometimes. I also collect stray quotes, one-liners,
                and questions that leave you hanging. A few of them live here.
              </p>
            </div>
            <Link className="collection-invite__link" href="/collection">
              <span>Browse the collection</span>
              <span aria-hidden="true">↗</span>
            </Link>
          </article>
        </section>
      </main>

      <div className="floating-nav-wrap">
        <nav className="floating-nav" aria-label="Primary navigation">
          <a href="#work">Work</a>
          <a className="is-current" href="#about" aria-current="page">
            About
          </a>
          <Link href="/collection">Collection</Link>
          <Link href="/contact">Contact</Link>
        </nav>
        <button
          className={`scroll-top ${scrolled ? "is-visible" : ""}`}
          type="button"
          aria-label="Scroll to top"
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        >
          ↑
        </button>
      </div>
    </div>
  );
}
