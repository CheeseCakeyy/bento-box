"use client";

import { useState } from "react";
import "./hall-of-fame.css";

const competitions = [
  { title: "AI Agent Security – Multi-Step Tool Attacks", category: "Featured · Code competition", rank: 457, teams: 4186 },
  { title: "Predicting Stellar Class", category: "Playground Series · S6E6", rank: 600, teams: 2816 },
  { title: "Predicting Heart Disease", category: "Playground Series · S6E2", rank: 604, teams: 4370 },
  { title: "Predicting F1 Pit Stops", category: "Playground Series · S6E5", rank: 615, teams: 3022 },
  { title: "Predict Customer Churn", category: "Playground Series · S6E3", rank: 742, teams: 4142 },
  { title: "Cyber-Physical Anomaly Detection for DER Systems", category: "Community · DER security", rank: 11, teams: 61 },
  { title: "GeoHab 2026 MLWG Competition", category: "Community · Benthic habitat classification", rank: 13, teams: 52 },
];

// Set preview/source only after placing the corresponding files in public/notebooks.
const notebooks: { slug: string; title: string; votes: number; bronze: boolean; preview?: string; source?: string }[] = [
  { slug: "irrigation-needs", title: "Irrigation Needs | Detailed EDA", votes: 18, bronze: true },
  { slug: "seed-averaging", title: "Seed Averaging Explained | XGBoosts", votes: 16, bronze: true },
  { slug: "exploring-cosmos", title: "ExploringCosmos: Classifying Stars, Galaxies, QSO", votes: 15, bronze: true },
  { slug: "f1-pit-stops", title: "lap-by-lap | s6e5 | Detailed EDA | Baseline LGBM", votes: 15, bronze: true },
  { slug: "churn-prediction", title: "Churn Prediction | Optuna | Digit_Decomposition", votes: 10, bronze: true },
  { slug: "convnets-mnist", title: "Learning_ConvNets_with_MNIST", votes: 9, bronze: true },
  { slug: "cyber-physical-anomaly", title: "Cyber-Physical anomaly detection | Baseline | XGB", votes: 9, bronze: false },
  { slug: "heart-disease", title: "predicting_heart_disease_with_xgboost", votes: 8, bronze: false },
  { slug: "housing-prices", title: "Housing Prices Competition–Deep Learning approach", votes: 8, bronze: false },
];

export default function HallOfFame() {
  const [selected, setSelected] = useState(0);
  const notebook = notebooks[selected];
  return (
    <section className="hall" id="hall-of-fame" aria-labelledby="hall-title">
      <header className="hall-heading">
        <div><span className="hall-eyebrow">Kaggle / the competition archive</span><h2 id="hall-title">Hall of fame<span aria-hidden="true">.</span></h2></div>
        <p>Experiments put to the test.<br />Notebooks shared along the way.</p>
      </header>
      <div className="hall-stats" aria-label="Kaggle highlights">
        <div><strong>07</strong><span>Competitions entered</span></div>
        <div><strong>06</strong><span>Bronze medal notebooks</span></div>
        <div><strong>Top 11%</strong><span>AI Agent Security · 457 / 4,186</span></div>
      </div>
      <div className="hall-subheading"><h3>Competition results</h3><span>Best results captured on Kaggle</span></div>
      <ol className="hall-results">
        {competitions.map((competition, index) => (
          <li key={competition.title}>
            <span className="hall-index">{String(index + 1).padStart(2, "0")}</span>
            <div className="hall-competition"><h4>{competition.title}</h4><p>{competition.category}</p></div>
            <div className="hall-rank"><strong>{competition.rank}</strong><span> / {competition.teams.toLocaleString("en-US")}</span><small>Rank / teams</small></div>
            <span className="hall-percent">Top {Math.ceil(competition.rank / competition.teams * 100)}%</span>
          </li>
        ))}
      </ol>
      <div className="hall-subheading"><h3>Notebook shelf</h3><span>Community recognition</span></div>
      <div className="hall-notebooks">
        <div className="hall-shelf" role="group" aria-label="Choose a notebook">
          {notebooks.map((item, index) => (
            <button key={item.slug} type="button" aria-pressed={selected === index} aria-controls="notebook-preview" onClick={() => setSelected(index)}>
              <span className="hall-notebook-title">{item.title}</span>
              <span className="hall-notebook-meta">{item.bronze ? <span className="hall-bronze">● Bronze</span> : <span>Notebook</span>}<span>↑ {item.votes} votes</span></span>
            </button>
          ))}
        </div>
        <div className="hall-reader" id="notebook-preview" role="region" aria-label="Notebook preview">
          <header><span className="hall-eyebrow">Notebook / {String(selected + 1).padStart(2, "0")}</span><h4>{notebook.title}</h4><div className="hall-reader-links">{notebook.source && <a href={notebook.source} download>Download .ipynb ↓</a>}<a href="https://www.kaggle.com/adwaittagalpallewar/code" target="_blank" rel="noreferrer">Kaggle notebook profile ↗</a></div></header>
          {notebook.preview ? <iframe key={notebook.slug} title={notebook.title} src={notebook.preview} sandbox="" loading="lazy" /> : <div className="hall-reader-empty" aria-live="polite"><span aria-hidden="true">[ ]</span><h5>Preview coming soon</h5><p>This notebook’s inline edition hasn’t been added yet. Explore the notebook collection on Kaggle in the meantime.</p></div>}
        </div>
      </div>
      <p className="hall-footnote">Ranks, medals and votes reflect the supplied Kaggle snapshots; they are not live statistics. Top percentages are rounded up.</p>
    </section>
  );
}
