import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Collection — Adwait Tagalpallewar",
  description: "Books, poems, quotes, one-liners, and unresolved questions collected by Adwait Tagalpallewar.",
};

const shelves = [
  {
    number: "01",
    title: "Books",
    description: "Books I return to, passages I underline, and ideas that follow me out of the final chapter.",
  },
  {
    number: "02",
    title: "Poems",
    description: "Things I write when an idea refuses to fit neatly into prose.",
  },
  {
    number: "03",
    title: "Fragments",
    description: "Stray quotes, one-liners, and questions that end one thought by starting another.",
  },
];

export default function CollectionPage() {
  return (
    <div className="site-shell collection-shell">
      <header className="site-header">
        <Link className="identity" href="/#about" aria-label="Return to Adwait Tagalpallewar’s portfolio">
          <span className="identity-mark" aria-hidden="true" />
          <span>Adwait Tagalpallewar</span>
        </Link>
        <span className="collection-header-label">A growing personal archive</span>
      </header>

      <main className="collection-page">
        <div className="collection-kicker">
          <span>Collection / 01</span>
          <span>Books · poems · fragments</span>
        </div>

        <section className="collection-hero" aria-labelledby="collection-title">
          <h1 id="collection-title">Things I kept.</h1>
          <div className="collection-hero__copy">
            <p>
              A shelf for words that stayed around—some borrowed, some written,
              and some still waiting for an answer.
            </p>
            <span>Collected without a ranking or a sensible system.</span>
          </div>
        </section>

        <section className="collection-index" aria-labelledby="collection-index-title">
          <header className="collection-index__header">
            <h2 id="collection-index-title">The shelves</h2>
            <span>{String(shelves.length).padStart(2, "0")} sections</span>
          </header>

          <div className="collection-shelves">
            {shelves.map((shelf) => (
              <article className="collection-shelf" key={shelf.title}>
                <span className="collection-shelf__number">{shelf.number}</span>
                <h3>{shelf.title}</h3>
                <p>{shelf.description}</p>
                <span className="collection-shelf__status">Being arranged</span>
              </article>
            ))}
          </div>
        </section>

        <aside className="collection-footnote" aria-label="A note about the collection">
          <span>Note to self / 01</span>
          <p>Nothing here is ranked. Some things just refused to be forgotten.</p>
        </aside>
      </main>

      <div className="floating-nav-wrap">
        <nav className="floating-nav" aria-label="Primary navigation">
          <Link href="/#work">Work</Link>
          <Link href="/#about">About</Link>
          <Link className="is-current" href="/collection" aria-current="page">Collection</Link>
          <Link href="/contact">Contact</Link>
        </nav>
      </div>
    </div>
  );
}
