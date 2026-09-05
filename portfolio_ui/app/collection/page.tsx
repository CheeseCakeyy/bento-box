import type { Metadata } from "next";
import Link from "next/link";
import ScrollToTop from "../ScrollToTop";
import BookStack from "../BookStack";
import FragmentReader from "../FragmentReader";
import PoemReader from "../PoemReader";
import ThemeSwitcher from "../ThemeSwitcher";

export const metadata: Metadata = {
  title: "Collection — Adwait Tagalpallewar",
  description: "Books, poems, quotes, one-liners, and unresolved questions collected by Adwait Tagalpallewar.",
};

export default function CollectionPage() {
  return (
    <div className="site-shell collection-shell entrance-collection">
      <header className="site-header">
        <Link className="identity" href="/#about" aria-label="Return to Adwait Tagalpallewar’s portfolio">
          <span className="identity-mark" aria-hidden="true" />
          <span>Adwait Tagalpallewar</span>
        </Link>
        <ThemeSwitcher />
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

        <section className="collection-bento" aria-labelledby="collection-bento-title">
          <header className="collection-bento__heading">
            <h2 id="collection-bento-title">The shelves</h2>
            <span>Editorial bento / mockup 01</span>
          </header>

          <div className="collection-bento__grid">
            <BookStack />

            <PoemReader />

            <FragmentReader />

            <article className="collection-card collection-card--index">
              <header className="collection-card__header">
                <span>Archive index</span>
                <span>03</span>
              </header>
              <div className="collection-counts">
                <span><strong>Books</strong><i>03</i></span>
                <span><strong>Poems</strong><i>04</i></span>
                <span><strong>Fragments</strong><i>17</i></span>
              </div>
              <p>Counts appear as the shelves fill.</p>
            </article>
          </div>
        </section>

        <aside className="collection-footnote" aria-label="A note about the collection">
          <span>Note to self / 01</span>
          <p>Nothing here is ranked. Some things just refused to be forgotten.</p>
        </aside>
      </main>

      <div className="floating-nav-wrap">
        <nav className="floating-nav" aria-label="Primary navigation">
          <Link href="/work">Work</Link>
          <Link href="/tool-kit">Tool kit</Link>
          <Link href="/#about">About</Link>
          <Link className="is-current" href="/collection" aria-current="page">Collection</Link>
          <Link href="/contact">Contact</Link>
        </nav>
        <ScrollToTop />
      </div>
    </div>
  );
}

