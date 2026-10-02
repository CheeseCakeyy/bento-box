"use client";

import { useState, type CSSProperties } from "react";

// GeoHab weighted F1 from the project write-up: public split = 31% of test data, private = 69%.
// privateLabelDy keeps the near-identical private scores (0.844 / 0.843) from overlapping.
const models = [
  { id: "cnn", name: "CNN + LGBM blend", status: "Not deployed", publicScore: 0.91568, privateScore: 0.84447, privateLabelDy: -7 },
  { id: "bayes", name: "Bayes ensemble", status: "Shipped", publicScore: 0.8495, privateScore: 0.84295, privateLabelDy: 13 },
  { id: "meta", name: "Meta-stack", status: "Best private", publicScore: 0.79777, privateScore: 0.85875, privateLabelDy: -7 },
];

const LEFT = 64;
const RIGHT = 256;
const y = (score: number) => 196 - ((score - 0.78) / (0.93 - 0.78)) * 176;

export default function ShakeUp() {
  const [revealed, setRevealed] = useState(false);
  const [focus, setFocus] = useState<string | null>(null);

  return (
    <article className={`panel panel--shakeup shake-up ${revealed ? "is-revealed" : ""}`} aria-labelledby="shake-up-title">
      <header className="shake-up__header">
        <div>
          <h3 id="shake-up-title">Leaderboard shake-up</h3>
          <p>GeoHab · weighted F1</p>
        </div>
        <div className="shake-up__rank" aria-live="polite">
          <strong>{revealed ? "#13" : "#1"}</strong>
          <span>{revealed ? "Private board" : "Public board"}</span>
        </div>
      </header>

      <svg className="shake-up__chart" viewBox="0 0 320 214" role="img" aria-label={revealed
        ? "Slope chart: the CNN blend falls from 0.916 public to 0.844 private, the Bayes ensemble holds at 0.849 to 0.843, and the meta-stack rises from 0.798 to 0.859."
        : "Public leaderboard scores: CNN blend 0.916, Bayes ensemble 0.849, meta-stack 0.798."}>
        {[0.8, 0.84, 0.88, 0.92].map((tick) => (
          <g key={tick} className="shake-up__tick">
            <line x1={LEFT} x2={RIGHT} y1={y(tick)} y2={y(tick)} />
            <text x={LEFT - 10} y={y(tick) + 3}>{tick.toFixed(2)}</text>
          </g>
        ))}
        <line className="shake-up__axis" x1={LEFT} x2={LEFT} y1={14} y2={202} />
        <line className="shake-up__axis shake-up__axis--private" x1={RIGHT} x2={RIGHT} y1={14} y2={202} />
        <text className="shake-up__axis-label" x={LEFT} y={212}>Public · 31%</text>
        <text className="shake-up__axis-label shake-up__axis-label--private" x={RIGHT} y={212}>Private · 69%</text>
        {models.map((model, index) => (
          <g
            key={model.id}
            className={`shake-up__model shake-up__model--${model.id} ${focus && focus !== model.id ? "is-dimmed" : ""}`}
            style={{ "--delay": `${index * 140}ms` } as CSSProperties}
          >
            <path d={`M${LEFT} ${y(model.publicScore)} L${RIGHT} ${y(model.privateScore)}`} pathLength={1} />
            <circle cx={LEFT} cy={y(model.publicScore)} r={4.5} />
            <circle className="shake-up__end" cx={RIGHT} cy={y(model.privateScore)} r={4.5} />
            <text className="shake-up__score shake-up__score--public" x={LEFT + 9} y={y(model.publicScore) - 7}>{model.publicScore.toFixed(3)}</text>
            <text className="shake-up__score shake-up__score--private" x={RIGHT + 9} y={y(model.privateScore) + model.privateLabelDy}>{model.privateScore.toFixed(3)}</text>
          </g>
        ))}
      </svg>

      <ul className="shake-up__legend">
        {models.map((model) => {
          const delta = model.privateScore - model.publicScore;
          return (
            <li key={model.id}>
              <button
                type="button"
                className={`shake-up__model-key shake-up__model-key--${model.id}`}
                onPointerEnter={() => setFocus(model.id)}
                onPointerLeave={() => setFocus(null)}
                onFocus={() => setFocus(model.id)}
                onBlur={() => setFocus(null)}
              >
                <i aria-hidden="true" />
                <span>{model.name}<small>{model.status}</small></span>
                <b>{revealed ? `${delta > 0 ? "+" : "−"}${Math.abs(delta).toFixed(3)}` : model.publicScore.toFixed(3)}</b>
              </button>
            </li>
          );
        })}
      </ul>

      <footer className="shake-up__footer">
        <p>{revealed
          ? "The public leader dropped 0.071 on the hidden 69%. The app ships the ensemble that held steady."
          : "1st on the public leaderboard. Now reveal the scores that were hidden until the end."}</p>
        <button type="button" onClick={() => setRevealed((value) => !value)}>
          {revealed ? "Back to public ↺" : "Reveal private ↗"}
        </button>
      </footer>
    </article>
  );
}
