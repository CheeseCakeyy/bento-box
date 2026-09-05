import type { Metadata } from "next";
import Link from "next/link";
import F1ScoreGraph from "../F1ScoreGraph";
import ThemeSwitcher from "../ThemeSwitcher";
import HallOfFame from "./HallOfFame";

export const metadata: Metadata = {
  title: "Work — Adwait Tagalpallewar",
  description: "Selected systems, experiments, projects, and competition work by Adwait Tagalpallewar.",
};

export default function WorkPage() {
  return (
    <div className="site-shell work-shell entrance-work">
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
            <span>03 projects / from exploration to deployment</span>
          </header>

          <div className="work-case-layout">
            <article className="work-case work-case--lead">
              <header className="work-case__header">
                <span>01 / GeoHab MLWG · 2026</span>
                <span className="work-status"><i aria-hidden="true" /> Geospatial machine learning</span>
              </header>

              <div className="work-case__intro">
                <div>
                  
                  <h2>GeoHab</h2>
                </div>
                <p>Mapping the seafloor at Refuge Cove. A geospatial ML project using bathymetry, backscatter and labelled training points to predict five benthic habitat classes.</p>
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
                    Habitat labels appear on hover or keyboard focus.<br />
                    Data: Deakin Marine Mapping Group · <a href="https://creativecommons.org/licenses/by/4.0/" target="_blank" rel="noreferrer">CC BY 4.0</a>
                  </p>
                </aside>
              </div>

              <div className="project-story">
                <div className="project-results" aria-label="GeoHab results">
                  <div><strong>0.85875</strong><span>Best private weighted F1 · meta-stack</span></div>
                  <div><strong>0.84295</strong><span>Default model · private weighted F1</span></div>
                  <div><strong>13th</strong><span>Private leaderboard · 1st public</span></div>
                </div>
                <div className="project-narrative">
                  <div><h3>The problem</h3><p>Predict the habitat at unseen coordinates from underwater multibeam data. The five classes are imbalanced, so evaluation uses support-weighted F1.</p></div>
                  <div><h3>My approach</h3><p>Extract raster values, engineer spatial grids and compare LightGBM experiments. The two-stage stack combines a rich first-stage meta-model with a seed-averaged second-stage classifier.</p></div>
                  <div><h3>What mattered</h3><p>Spatial scale and stable features mattered more than complexity. Terrain, texture and clustering features did not consistently generalize across the leaderboard splits.</p></div>
                </div>
                <details className="project-details">
                  <summary>Inside the project <span>Models, results &amp; deployment decisions</span></summary>
                  <div className="project-details__body">
                    <h3>Choosing what to ship</h3>
                    <p>The public leaderboard used 31% of the test data; the private leaderboard used 69%. I kept the public and private results separate when choosing models for the interactive app.</p>
                    <div className="project-table-wrap"><table className="project-table">
                      <caption>GeoHab model comparison · weighted F1</caption>
                      <thead><tr><th scope="col">Model / decision</th><th scope="col">Private</th><th scope="col">Public</th></tr></thead>
                      <tbody>
                        <tr><th scope="row">Buffered Bayes adjusted ensemble<small>Default · stable across splits, fast feature pipeline</small></th><td>0.84295</td><td>0.84950</td></tr>
                        <tr><th scope="row">Meta-stacked model<small>Alternative · best private score, heavier feature computation</small></th><td>0.85875</td><td>0.79777</td></tr>
                        <tr><th scope="row">CNN + LGBM blend<small>Not deployed · public/private gap suggested overfitting to the public split</small></th><td>0.84447</td><td>0.91568</td></tr>
                      </tbody>
                    </table></div>
                    <h3>The generalization lesson</h3>
                    <p>A first-place public result and a thirteenth-place private result tell different stories. Spatial distribution shifts exposed the limits of standard cross-validation. Spatial block validation and better handling of those shifts are the next steps.</p>
                    <p className="project-credit">The CNN experiments incorporate publicly shared out-of-fold predictions by Matteo. Marine mapping data: Deakin Marine Mapping Group, CC BY 4.0.</p>
                    <div className="project-links"><a href="https://github.com/CheeseCakeyy/GeoHab-2026-MLWG-Competition" target="_blank" rel="noreferrer">Source code ↗</a><a href="https://www.kaggle.com/code/adwaittagalpallewar/geohab-2026-grid-spatial-ml-pub1-pvt13" target="_blank" rel="noreferrer">Competition notebook ↗</a></div>
                  </div>
                </details>
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
                  Live demo ↗
                </a>
              </footer>
            </article>

            <div className="work-case-stack">
              <article className="work-case work-case--support">
                <header className="work-case__header">
                  <span>02 / Kaggle Playground · 2026</span>
                  <span className="work-status"><i aria-hidden="true" /> Selected project</span>
                </header>
                <div className="work-case__intro work-case__intro--compact">
                  <div><h2>Predicting F1 Pit Stops</h2></div>
                  <p>A lap-level machine-learning system that turns tyre, timing, position and race context into an actionable pit-stop probability.</p>
                </div>
                <div className="work-visual work-visual--f1-score">
                  <F1ScoreGraph />
                </div>
                <div className="project-story">
                  <div className="project-results project-results--pair">
                    <div><strong>0.95369</strong><span>Best saved blend · private ROC AUC</span></div>
                    <div><strong>+0.01760</strong><span>Private AUC over the LGBM baseline</span></div>
                  </div>
                  <p className="project-summary">From 439,140 lap-level examples to a next-lap pit probability. Feature engineering and an out-of-fold LightGBM + RealMLP blend improved the private score from 0.93609 to 0.95369.</p>
                  <details className="project-details">
                    <summary>Inside the project <span>Experiments &amp; prediction service</span></summary>
                    <div className="project-details__body">
                      <h3>Finding the strategy signal</h3>
                      <p>I explored tyre life, stint, lap timing and race context in a synthetic competition dataset with roughly an 80:20 non-pit/pit balance. Race-level variation and anomalous 2023 pit rates made validation an important part of the investigation.</p>
                      <h3>From baseline to blend</h3>
                      <p>The experiments cover LightGBM, XGBoost and RealMLP. The best saved blend combines 42.5% LightGBM and 57.5% RealMLP, with 0.953876 out-of-fold AUC and 0.95328 public AUC. The private split contains 80% of the test data; the public split contains 20%.</p>
                      <p>Validation changed between experiments: the baseline used a year holdout, one XGBoost run grouped by race, and later feature-engineered runs used stratified folds. Their local scores are not directly comparable under one fixed validation protocol.</p>
                      <h3>Taking the model into an app</h3>
                      <p>The live app serves a native LightGBM model through FastAPI, separately from the best competition blend. Startup checks verify the model, metadata checksum, feature contract and exported smoke test. The model loads once and inference uses one CPU thread.</p>
                      <p className="project-credit">Competition: Kaggle Playground Series S6E5. ROC AUC measures ranking quality; these synthetic-data results do not establish performance in live Formula 1 races.</p>
                    </div>
                  </details>
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
                    Live demo ↗
                  </a>
                </footer>
              </article>

              <article className="work-case work-case--support">
                <header className="work-case__header">
                  <span>03 / Product engineering</span>
                  <span className="work-status"><i aria-hidden="true" /> Internship project</span>
                </header>
                <div className="work-case__intro work-case__intro--compact">
                  <div><h2>Folio</h2></div>
                  <p>An internship project where I worked on an embedding-based matchmaking system for a job portal built for design students.</p>
                </div>
                <div className="work-visual work-visual--matching" aria-label="Embedding-based matchmaking between anonymous student profiles and job roles">
                  <span className="work-visual__label">Embedding match / system overview</span>
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
                    Live demo ↗
                  </a>
                </footer>
              </article>
            </div>
          </div>
        </section>

        <HallOfFame />
        <aside className="work-next"><span>Currently building</span><div><h2>EmbeddingVC</h2><p>A lifecycle manager for vector embeddings. In progress.</p></div><Link href="/contact">Talk about a project ↗</Link></aside>
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
