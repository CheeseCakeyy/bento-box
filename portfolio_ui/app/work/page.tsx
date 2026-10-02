import type { Metadata } from "next";
import Link from "next/link";
import ThemeSwitcher from "../ThemeSwitcher";
import HallOfFame from "./HallOfFame";
import MLProjects from "./MLProjects";
import WorkShowcase from "./WorkShowcase";
import WebTeaser from "./WebTeaser";
import PageEntrance from "../PageEntrance";
import "./showcase.css";

export const metadata: Metadata = {
  title: "Projects — Adwait Tagalpallewar",
  description: "Machine learning systems, playful web experiments, and projects by Adwait Tagalpallewar.",
};

export default function WorkPage() {
  return (
    <PageEntrance className="site-shell work-shell entrance-work showcase-shell">
      <header className="site-header">
        <Link className="identity" href="/#about" aria-label="Return to Adwait Tagalpallewar’s portfolio">
          <span className="identity-mark" aria-hidden="true" />
          <span>Adwait Tagalpallewar</span>
        </Link>
        <ThemeSwitcher />
      </header>
      <main className="work-page showcase-page">
        <header className="showcase-heading">
          <div><span className="showcase-eyebrow">A collection of things I’ve made</span><h1>Projects<span>.</span></h1><p>Intelligent systems. A little room for play.</p></div>
          <span className="showcase-margin-note" aria-hidden="true">Build<br />Learn<br />Iterate</span>
        </header>
        <WorkShowcase>
          <MLProjects />
          <WebTeaser />
          <details id="competitions" className="showcase-archive">
            <summary><span><span aria-hidden="true">↳</span> Competition results &amp; notebooks</span><span className="archive-summary-note">The experiments behind the work</span><span className="archive-toggle" aria-hidden="true" /></summary>
            <HallOfFame />
          </details>
          <aside className="work-next"><span>Currently building</span><div><h2>EmbeddingVC</h2><p>A lifecycle manager for vector embeddings. In progress.</p></div><Link href="/contact">Talk about a project ↗</Link></aside>
        </WorkShowcase>
      </main>
    </PageEntrance>
  );
}
