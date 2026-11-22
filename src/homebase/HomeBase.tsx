interface Props {
  onEnterTower: () => void;
}

/** The explorer's study. Sections are filled in by Phase 4 tickets (SVTOB-30 to SVTOB-40). */
export function HomeBase({ onEnterTower }: Props) {
  return (
    <section className="home" aria-labelledby="home-title">
      <h1 id="home-title" className="home__title">
        Home Base
      </h1>
      <p className="home__lede">
        Your study. Notes, bookmarks, expeditions and collections from your journey through the
        Tower will gather here.
      </p>
      <button type="button" className="primary-action" onClick={onEnterTower}>
        Enter the Tower
      </button>
    </section>
  );
}
