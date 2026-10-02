"use client";

import { useEffect, useState } from "react";

const lookingFor = [
  { title: "ML & data problems", detail: "Messy real-world data, modelling and evaluation." },
  { title: "AI-powered products", detail: "The systems around the model, from pipeline to app." },
  { title: "Research & competitions", detail: "Experiments, Kaggle challenges and write-ups." },
];

// Availability, live local time on the dot-matrix ticker, and the kind of work worth talking about.
export default function ContactStatus() {
  const [time, setTime] = useState("--:-- --");

  useEffect(() => {
    const update = () => setTime(new Intl.DateTimeFormat("en-IN", {
      timeZone: "Asia/Kolkata",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    }).format(new Date()).toUpperCase());
    update();
    const timer = window.setInterval(update, 30_000);
    return () => window.clearInterval(timer);
  }, []);

  return (
    <section className="contact-status" aria-label="Availability and the kind of work I'm looking for">
      <article className="contact-card contact-card--availability">
        <span className="contact-card__label"><i aria-hidden="true" />Availability</span>
        <strong>Open to interesting problems</strong>
        <p>Currently building <b>EmbeddingVC</b>, a lifecycle manager for vector embeddings.</p>
      </article>

      <article className="contact-card contact-card--time">
        <span className="contact-card__label">Local time</span>
        <div className="system-screen" role="timer" aria-label={`Local time in India: ${time} IST`}>
          <div className="system-ticker" aria-hidden="true">
            {[0, 1].map((copy) => (
              <span key={copy}>{time} IST · INDIA STANDARD TIME · UTC+05:30 ·</span>
            ))}
          </div>
        </div>
        <p>Worth a glance before you suggest a time for a call.</p>
      </article>

      <article className="contact-card contact-card--looking">
        <span className="contact-card__label">Looking for</span>
        <ul>
          {lookingFor.map((item) => (
            <li key={item.title}><strong>{item.title}</strong><span>{item.detail}</span></li>
          ))}
        </ul>
      </article>
    </section>
  );
}
