import Link from "next/link";

// Private-leaderboard ROC AUC per saved experiment, from the F1 Pit Stops project.
const f1Progression = [0.93265, 0.93609, 0.93609, 0.94878, 0.95068, 0.95256, 0.95315, 0.95369];

function F1Sparkline() {
  const min = 0.93;
  const max = 0.956;
  const points = f1Progression.map((score, index) => [
    8 + (index / (f1Progression.length - 1)) * 184,
    92 - ((score - min) / (max - min)) * 80,
  ]);
  const path = points.map(([x, y], index) => `${index ? "L" : "M"}${x.toFixed(1)} ${y.toFixed(1)}`).join(" ");
  const [lastX, lastY] = points[points.length - 1];

  return (
    <svg className="featured-card__chart" viewBox="0 0 200 100" preserveAspectRatio="none" aria-hidden="true">
      {[24, 48, 72].map((y) => <line key={y} x1="0" x2="200" y1={y} y2={y} />)}
      <path className="featured-card__area" d={`${path} L${lastX} 100 L8 100 Z`} />
      <path className="featured-card__line" d={path} />
      {points.map(([x, y], index) => <circle key={index} cx={x} cy={y} r={index === points.length - 1 ? 3.4 : 1.8} />)}
      <circle className="featured-card__pulse" cx={lastX} cy={lastY} r="7" />
    </svg>
  );
}

const folioProfiles = [[22, 26], [30, 58], [18, 80], [44, 40]];
const folioRoles = [[156, 24], [172, 52], [150, 76], [182, 84]];

function FolioMatch() {
  return (
    <svg className="featured-card__match" viewBox="0 0 200 100" aria-hidden="true">
      {folioProfiles.map(([px, py], profile) => folioRoles.map(([rx, ry], role) => (
        <line key={`${profile}-${role}`} className={profile === 1 && role === 0 ? "is-match" : ""} x1={px} y1={py} x2={rx} y2={ry} />
      )))}
      {folioProfiles.map(([x, y], index) => <rect key={`p${index}`} className={index === 1 ? "is-match" : ""} x={x - 4} y={y - 4} width="8" height="8" rx="2" />)}
      {folioRoles.map(([x, y], index) => <circle key={`r${index}`} className={index === 0 ? "is-match" : ""} cx={x} cy={y} r="4.5" />)}
    </svg>
  );
}

const projects = [
  {
    id: "geohab",
    index: "01",
    focus: "Geospatial ML",
    name: "GeoHab",
    summary: "Predicting five seafloor habitat classes from bathymetry and backscatter.",
    metric: "0.859",
    metricLabel: "Private weighted F1",
    note: "1st public · 13th private",
    visual: <img className="featured-card__map" src="/work/geohab/training-map-color.webp" alt="" loading="lazy" />,
  },
  {
    id: "f1-pit-stops",
    index: "02",
    focus: "Predictive ML",
    name: "F1 Pit Stops",
    summary: "Lap-level model that turns tyre, timing and race context into a pit-stop probability.",
    metric: "0.954",
    metricLabel: "Private ROC AUC",
    note: "+0.018 over baseline",
    visual: <F1Sparkline />,
  },
  {
    id: "folio",
    index: "03",
    focus: "Embeddings · RecSys",
    name: "Folio",
    summary: "Embedding-based matchmaking between design students and job roles.",
    metric: "Live",
    metricLabel: "Deployed demo",
    note: "Internship project",
    visual: <FolioMatch />,
  },
];

export default function FeaturedWork() {
  return (
    <section className="featured-work" aria-labelledby="featured-work-title">
      <header className="featured-work__header">
        <h2 className="about-group__label" id="featured-work-title"><span>00</span>Selected work</h2>
        <Link href="/work" className="featured-work__all">All projects <span aria-hidden="true">↗</span></Link>
      </header>
      <div className="featured-work__list">
        {projects.map((project) => (
          <Link key={project.id} href={`/work#${project.id}`} className={`featured-card featured-card--${project.id}`}>
            <span className="featured-card__visual">{project.visual}</span>
            <span className="featured-card__meta">
              <span>{project.index} / {project.focus}</span>
              <span aria-hidden="true">↗</span>
            </span>
            <strong className="featured-card__name">{project.name}</strong>
            <span className="featured-card__summary">{project.summary}</span>
            <span className="featured-card__result">
              <b>{project.metric}</b>
              <span>{project.metricLabel}<small>{project.note}</small></span>
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
