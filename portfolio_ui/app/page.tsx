"use client";

import { useCallback, useEffect, useRef, useState, type CSSProperties } from "react";
import Link from "next/link";
import ThemeSwitcher from "./ThemeSwitcher";
import CameraRoll from "./CameraRoll";
import LatentSpace from "./LatentSpace";
import MoireDesigner from "./MoireDesigner";
import PipelineBuilder from "./PipelineBuilder";
import FeaturedWork from "./FeaturedWork";

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

const disciplines = [
  { label: "Train models", href: "/work#geohab" },
  { label: "Analyze results", href: "/work#f1-pit-stops" },
  { label: "Experiments", href: "/work#web" },
  { label: "Competitive ML", href: "/work#competitions" },
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
  const [localTime, setLocalTime] = useState("--:-- --");
  const [dayProgress, setDayProgress] = useState(0);
  const [selectedSong, setSelectedSong] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const audioRef = useRef<HTMLAudioElement>(null);
  const rollRef = useRef<HTMLIFrameElement>(null);
  const activeSong = songs[selectedSong];

  const startSong = useCallback((index: number) => {
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
  }, []);

  const togglePlayback = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (audio.paused) {
      void audio.play().catch(() => setIsPlaying(false));
    } else {
      audio.pause();
    }
  };

  const skip = (direction: number) => startSong((selectedSong + direction + songs.length) % songs.length);

  // The paper roll is the track picker: tapping a printed cover selects that song.
  useEffect(() => {
    const receive = (event: MessageEvent) => {
      if (event.origin !== window.location.origin || event.source !== rollRef.current?.contentWindow) return;
      if (event.data?.type === "songs:select") {
        const index = Number(event.data.index);
        if (Number.isInteger(index) && index >= 0 && index < songs.length) startSong(index);
      }
      if (event.data?.type === "songs:ready") {
        rollRef.current?.contentWindow?.postMessage({ type: "songs:active", index: selectedSong, playing: isPlaying }, window.location.origin);
      }
    };
    window.addEventListener("message", receive);
    return () => window.removeEventListener("message", receive);
  }, [startSong, selectedSong, isPlaying]);

  useEffect(() => {
    rollRef.current?.contentWindow?.postMessage({ type: "songs:active", index: selectedSong, playing: isPlaying }, window.location.origin);
  }, [selectedSong, isPlaying]);

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

      setLocalTime(time);

      const [hours, minutes] = new Intl.DateTimeFormat("en-GB", {
        timeZone: "Asia/Kolkata",
        hour: "2-digit",
        minute: "2-digit",
        hourCycle: "h23",
      })
        .format(new Date())
        .split(":")
        .map(Number);
      setDayProgress((hours * 60 + minutes) / 1440);
    };

    updateLocalTime();
    const timer = window.setInterval(updateLocalTime, 30_000);
    return () => window.clearInterval(timer);
  }, []);

  return (
    <div className="site-shell entrance-home">
      <header className="site-header">
        <a className="identity" href="#about" aria-label="Go to the About page">
          <span className="identity-mark" aria-hidden="true" />
          <span>Adwait Tagalpallewar</span>
        </a>

        <ThemeSwitcher />
      </header>

      <main id="about" className="about-page">
        <section className="intro" aria-label="Introductory heading and disciplines">
          <h1 className="hero-heading">Engineer crafting intelligent systems and experiments.</h1>
          <div className="discipline-row" aria-label="Discipline links">
            <span className="discipline-label">What I do</span>
            {disciplines.map((discipline) => (
              <Link key={discipline.label} href={discipline.href}>{discipline.label}</Link>
            ))}
          </div>
        </section>

        <FeaturedWork />

        <section className="about-group" aria-labelledby="group-identity">
          <h2 className="about-group__label" id="group-identity"><span>01</span>Identity</h2>
          <div className="portfolio-grid portfolio-grid--identity">
            <article className="panel panel--bio" aria-label="Profile and biography section">
              <div className="bio-media" aria-label="Profile image">
                <img
                  className="bio-media__image"
                  src="/about/profile.jpg"
                  alt="Portrait of Adwait Tagalpallewar"
                />
                <span className="bio-media__index">About / 01</span>
                <div className="bio-monogram" aria-hidden="true">
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
                    <a href="https://github.com/CheeseCakeyy" target="_blank" rel="noreferrer" aria-label="GitHub profile" title="GitHub">
                      <i className="fab fa-github" aria-hidden="true" />
                    </a>
                    <a href="https://in.linkedin.com/in/adwait-tagalpallewar" target="_blank" rel="noreferrer" aria-label="LinkedIn profile" title="LinkedIn">
                      <i className="fab fa-linkedin" aria-hidden="true" />
                    </a>
                    <a href="https://www.kaggle.com/adwaittagalpallewar" target="_blank" rel="noreferrer" aria-label="Kaggle profile" title="Kaggle">
                      <i className="fab fa-kaggle" aria-hidden="true" />
                    </a>
                    <a href="https://discord.com/users/1215365835393343590" target="_blank" rel="noreferrer" aria-label="Discord profile" title="Discord">
                      <i className="fa-brands fa-discord" aria-hidden="true" />
                    </a>
                  </div>
                </div>
                <Link className="bio-talk" href="/contact">
                  <span>Let&apos;s talk</span>
                  <span aria-hidden="true">→</span>
                </Link>
              </div>
            </article>

            <article className="panel panel--now" aria-labelledby="now-title">
              <header className="now-heading">
                <h2 id="now-title">Now</h2>
                <span className="now-live">Live</span>
              </header>

              <div className="now-clock">
                <strong>{localTime}</strong>
                <span>Local time · IST</span>
                <div className="now-day" style={{ "--day": dayProgress } as CSSProperties} aria-hidden="true">
                  <span className="now-day__track"><i /></span>
                  <span className="now-day__ticks"><b>00</b><b>06</b><b>12</b><b>18</b><b>24</b></span>
                </div>
              </div>

              <div className="now-project">
                <span className="now-label">Currently building</span>
                <div className="now-project__title">
                  <div className="side-project-mark" aria-hidden="true" />
                  <h3>EmbeddingVC</h3>
                </div>
                <p>A lifecycle manager for vector embeddings. Can&apos;t share more than that.</p>
              </div>

              <div className="now-availability">
                <span className="now-label">Availability</span>
                <div className="system-screen" role="status" aria-label="Open to interesting problems across AI, data and software.">
                  <div className="system-ticker" aria-hidden="true">
                    {[0, 1].map((copy) => (
                      <span key={copy}>OPEN TO INTERESTING PROBLEMS · AI / DATA / SOFTWARE ·</span>
                    ))}
                  </div>
                </div>
              </div>
            </article>
          </div>
        </section>

        <section className="about-group" aria-labelledby="group-work">
          <h2 className="about-group__label" id="group-work"><span>02</span>Work</h2>
          <div className="portfolio-grid portfolio-grid--work">
            <article className="panel panel--latent" aria-label="Interactive latent space section">
              <LatentSpace />
            </article>

            <PipelineBuilder />

            <article className="panel panel--work-invite collection-invite" aria-labelledby="work-invite-title">
              <div className="collection-invite__copy">
                <span id="work-invite-title">From ideas to working systems</span>
                <p>
                  A few projects, experiments, and competition entries from my work in AI,
                  data, and software. Here&apos;s what I&apos;ve been building.
                </p>
              </div>
              <Link className="collection-invite__link" href="/work">
                <span>Explore my projects</span>
                <span aria-hidden="true">↗</span>
              </Link>
            </article>
          </div>
        </section>

        <section className="about-group" aria-labelledby="group-personal">
          <h2 className="about-group__label" id="group-personal"><span>03</span>Personal</h2>
          <div className="portfolio-grid portfolio-grid--personal">
            <article className="panel panel--photos" aria-label="Camera roll section">
              <CameraRoll />
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
                  ref={rollRef}
                  src="/paper-roll/index.html"
                  title="Songs on Loop paper roll. Tap a printed cover to play that track."
                  loading="lazy"
                />

                <section className="songs-deck" aria-label="Songs on Loop player">
                  <div className="songs-deck-heading">
                    <span>Tap a cover on the roll</span>
                    <span>Track {String(selectedSong + 1).padStart(2, "0")} / {songs.length}</span>
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
                    <div className="song-current-copy" aria-live="polite">
                      <strong>{activeSong.title}</strong>
                      <span>{activeSong.artist}</span>
                    </div>
                    <div className="song-skip">
                      <button type="button" aria-label="Previous track" onClick={() => skip(-1)}>
                        <span aria-hidden="true">‹</span>
                      </button>
                      <button type="button" aria-label="Next track" onClick={() => skip(1)}>
                        <span aria-hidden="true">›</span>
                      </button>
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
              {/* eslint-disable-next-line jsx-a11y/media-has-caption -- This is the existing music-only player; lyric caption files are not supplied. Track title and artist are displayed above. */}
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

            <article className="panel panel--calendar" aria-label="No plan Society calendar">
              <iframe
                className="no-plan-calendar"
                src="/no-plan-calendar/index.html"
                title="No plan Society — interactive daily calendar"
              />
            </article>

            <article className="panel panel--sketch" aria-label="Interactive moiré spaceship design maker">
              <MoireDesigner />
            </article>
          </div>
        </section>
      </main>
    </div>
  );
}
