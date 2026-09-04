import type { Metadata } from "next";
import Link from "next/link";
import F1ScoreGraph from "../F1ScoreGraph";
import ThemeSwitcher from "../ThemeSwitcher";

export const metadata: Metadata = {
  title: "Work — Adwait Tagalpallewar",
  description: "Selected systems, experiments, projects, and competition work by Adwait Tagalpallewar.",
};

const timelineSlots = [
  { year: "Year", title: "GeoHab", type: "Geospatial ML", status: "Case file", filled: true },
  { year: "Year", title: "Predicting F1 Pit Stops", type: "Sports analytics", status: "Case file", filled: true },
  { year: "Year", title: "Folio", type: "Internship project", status: "Case file", filled: true },
  { year: "2026", title: "EmbeddingVC", type: "AI system", status: "In progress", filled: true },
  { year: "Year", title: "Competition entry", type: "Competition", status: "Result / rank" },
];

export default function WorkPage() {
  return (
    <div className="site-shell work-shell">
      <header className="site-header">
        <Link className="identity" href="/#about" aria-label="Return to Adwait Tagalpallewar’s portfolio">
          <span className="identity-mark" aria-hidden="true" />
          <span>Adwait Tagalpallewar</span>
        </Link>
        <ThemeSwitcher />
      </header>

      <main className="work-page">
        <section className="work-section" aria-labelledby="selected-work-title">
          <header className="work-section__heading">
            <h1 id="selected-work-title">Selected work</h1>
            <span>Layout draft / 03 case files</span>
          </header>

          <div className="work-case-layout">
            <article className="work-case work-case--lead">
              <header className="work-case__header">
                <span>Case file / 01</span>
                <span className="work-status"><i aria-hidden="true" /> Lead project</span>
              </header>

              <div className="work-case__intro">
                <div>
                  <span className="work-case__number">01</span>
                  <h2>GeoHab</h2>
                </div>
                <p>A two-stage geospatial machine-learning pipeline that predicts benthic habitat classes from bathymetry, backscatter and labelled training data.</p>
              </div>

              <div className="work-visual work-visual--geohab">
                <span className="work-visual__label">Refuge Cove / survey map</span>
                <figure className="geohab-map-stage">
                  <img
                    className="geohab-map-stage__neutral"
                    src="/work/geohab/training-map-neutral.webp"
                    alt="Backscatter map of Refuge Cove with 6,256 ground-truth training locations and bathymetric contour lines"
                  />
                  <img
                    className="geohab-map-stage__color"
                    src="/work/geohab/training-map-color.webp"
                    alt=""
                    aria-hidden="true"
                  />
                  <span className="geohab-map-stage__north" aria-hidden="true">N ↑</span>
                </figure>

                <aside className="geohab-map-readout" aria-label="GeoHab dataset summary">
                  <header>
                    <span>Actual competition data</span>
                    <strong>Refuge Cove</strong>
                  </header>
                  <dl>
                    <div><dt>Grid</dt><dd>25 cm</dd></div>
                    <div><dt>Depth</dt><dd>0–22 m</dd></div>
                    <div><dt>Training</dt><dd>6,256</dd></div>
                    <div><dt>Classes</dt><dd>05</dd></div>
                  </dl>
                  <div className="geohab-map-legend" aria-label="Habitat class legend">
                    <span><i className="class-alg" /><b>ALG</b>Macroalgae reef</span>
                    <span><i className="class-fmat" /><b>FMAT</b>Filamentous mat</span>
                    <span><i className="class-nvb" /><b>NVB</b>No visible biota</span>
                    <span><i className="class-sgam" /><b>SGAM</b>Amphibolis seagrass</span>
                    <span><i className="class-sgz" /><b>SGZ</b>Zostera seagrass</span>
                  </div>
                  <p>
                    Hover to reveal habitat labels.<br />
                    Data: Deakin Marine Mapping Group · <a href="https://creativecommons.org/licenses/by/4.0/" target="_blank" rel="noreferrer">CC BY 4.0</a>
                  </p>
                </aside>
              </div>

              <footer className="work-case__footer">
                <div><span>Focus</span><strong>Geospatial ML</strong></div>
                <div><span>Domain</span><strong>Habitat mapping</strong></div>
                <a
                  className="work-case__link"
                  href="https://geohab-habitat-prediction-dashboard.vercel.app/"
                  target="_blank"
                  rel="noreferrer"
                  aria-label="Open the GeoHab habitat prediction dashboard in a new tab"
                >
                  Open case file →
                </a>
              </footer>
            </article>

            <div className="work-case-stack">
              <article className="work-case work-case--support">
                <header className="work-case__header">
                  <span>Case file / 02</span>
                  <span className="work-status"><i aria-hidden="true" /> Selected project</span>
                </header>
                <div className="work-case__intro work-case__intro--compact">
                  <div><span className="work-case__number">02</span><h2>Predicting F1 Pit Stops</h2></div>
                  <p>A lap-level machine-learning system that turns tyre, timing, position and race context into an actionable pit-stop probability.</p>
                </div>
                <div className="work-visual work-visual--f1-score">
                  <F1ScoreGraph />
                </div>
                <footer className="work-case__footer work-case__footer--compact">
                  <div><span>Focus</span><strong>Sports analytics · Predictive ML</strong></div>
                  <a
                    className="work-case__link"
                    href="https://predicting-f1-pit-stops.vercel.app/"
                    target="_blank"
                    rel="noreferrer"
                    aria-label="Open the Predicting F1 Pit Stops dashboard in a new tab"
                  >
                    Open case file →
                  </a>
                </footer>
              </article>

              <article className="work-case work-case--support">
                <header className="work-case__header">
                  <span>Case file / 03</span>
                  <span className="work-status"><i aria-hidden="true" /> Internship project</span>
                </header>
                <div className="work-case__intro work-case__intro--compact">
                  <div><span className="work-case__number">03</span><h2>Folio</h2></div>
                  <p>An internship project where I worked on an embedding-based matchmaking system for a job portal built for design students.</p>
                </div>
                <div className="work-visual work-visual--matching" aria-label="Embedding-based matchmaking between anonymous student profiles and job roles">
                  <span className="work-visual__label">Embedding match / live ranking</span>
                  <div className="folio-match" aria-hidden="true">
                    <div className="folio-match__column">
                      <span>Profiles</span>
                      {["P–01", "P–02", "P–03", "P–04"].map((profile) => (
                        <i className={profile === "P–02" ? "is-selected" : ""} key={profile}>{profile}</i>
                      ))}
                    </div>

                    <div className="folio-match__field">
                      <span className="folio-match__connection connection--01" />
                      <span className="folio-match__connection connection--02" />
                      <span className="folio-match__connection connection--03" />
                      <span className="folio-match__connection connection--04" />
                      <span className="folio-match__connection connection--active" />
                      {[
                        [18, 22], [39, 15], [70, 27], [26, 52], [52, 46],
                        [81, 55], [34, 78], [61, 73], [88, 84],
                      ].map(([left, top], index) => (
                        <i
                          className={index === 4 ? "is-active" : ""}
                          key={`${left}-${top}`}
                          style={{ "--match-x": `${left}%`, "--match-y": `${top}%` } as React.CSSProperties}
                        />
                      ))}
                    </div>

                    <div className="folio-match__column folio-match__column--roles">
                      <span>Roles</span>
                      {["R–01", "R–02", "R–03", "R–04"].map((role) => (
                        <i className={role === "R–01" ? "is-selected" : ""} key={role}>{role}</i>
                      ))}
                    </div>

                    <div className="folio-match__ranking">
                      <span>Top match / 01</span>
                      <div><i /><i /><i /></div>
                      <strong>P–02 → R–01</strong>
                    </div>
                  </div>
                </div>
                <footer className="work-case__footer work-case__footer--compact">
                  <div><span>Focus</span><strong>Embeddings · Recommendation systems</strong></div>
                  <a
                    className="work-case__link"
                    href="https://folio-aipoweredrecruitment.onrender.com/"
                    target="_blank"
                    rel="noreferrer"
                    aria-label="Open the Folio AI-powered recruitment dashboard in a new tab"
                  >
                    Open case file →
                  </a>
                </footer>
              </article>
            </div>
          </div>
        </section>

        <section className="work-section work-log" aria-labelledby="work-log-title">
          <header className="work-section__heading">
            <h2 id="work-log-title">Projects + competitions</h2>
            <span>Reverse chronological archive</span>
          </header>

          <div className="work-log__labels" aria-hidden="true">
            <span>Year</span><span>Entry</span><span>Type</span><span>Status / result</span>
          </div>
          <ol className="work-timeline">
            {timelineSlots.map((item, index) => (
              <li className={item.filled ? "is-filled" : ""} key={`${item.title}-${index}`}>
                <span className="work-timeline__year">{item.year}</span>
                <strong>{item.title}</strong>
                <span>{item.type}</span>
                <span className="work-timeline__status"><i aria-hidden="true" />{item.status}</span>
              </li>
            ))}
          </ol>

          <p className="work-log__note">
            This table becomes the complete record; selected entries above expand into case files.
          </p>
        </section>
      </main>

      <div className="floating-nav-wrap">
        <nav className="floating-nav" aria-label="Primary navigation">
          <Link className="is-current" href="/work" aria-current="page">Work</Link>
          <Link href="/tool-kit">Tool kit</Link>
          <Link href="/#about">About</Link>
          <Link href="/collection">Collection</Link>
          <Link href="/contact">Contact</Link>
        </nav>
      </div>
    </div>
  );
}
