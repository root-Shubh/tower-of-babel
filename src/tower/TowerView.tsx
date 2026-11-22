import type { Floor } from "../content/schema";
import { Facade } from "./Facade";

interface Props {
  /** Floors in Tower order, lowest first. */
  floors: Floor[];
  visited: ReadonlySet<string>;
  onEnterFloor: (floorId: string) => void;
}

/**
 * The Tower exterior (spec section 4). Drawn top-down so the spire is at the top of the
 * page and the ground floor at the bottom; the shell opens it scrolled to the ground, and
 * the explorer climbs by scrolling up. Higher storeys are narrower, so the building tapers.
 * No floor is locked.
 */
export function TowerView({ floors, visited, onEnterFloor }: Props) {
  const top = floors.length;
  const descending = [...floors].reverse();

  return (
    <section className="tower" aria-labelledby="tower-title">
      <header className="tower__sky">
        <h1 id="tower-title" className="tower__title">
          The Tower of Babel
        </h1>
        <p className="tower__lede">
          {top} floors of human knowledge. Climb from the ground, or tap any floor to enter.
        </p>
        <div className="tower__spire" aria-hidden="true" />
      </header>

      <ol className="tower__floors" aria-label="Floors, highest first">
        {descending.map((floor) => {
          const isVisited = visited.has(floor.id);
          // Taper from 100% at the base to about 64% at the top.
          const width = 100 - ((floor.number - 1) / Math.max(1, top - 1)) * 36;
          return (
            <li key={floor.id} className="tower__storey" style={{ width: `${width}%` }}>
              <button
                type="button"
                className="storey"
                data-visited={isVisited}
                aria-label={`Floor ${floor.number}: ${floor.title}${isVisited ? ", visited" : ""}`}
                onClick={() => onEnterFloor(floor.id)}
              >
                <Facade architecture={floor.architecture} />
                <span className="storey__plaque">
                  <span className="storey__number">{String(floor.number).padStart(2, "0")}</span>
                  <span className="storey__text">
                    <span className="storey__title">{floor.title}</span>
                    <span className="storey__era">{floor.era}</span>
                  </span>
                  {isVisited ? <span className="storey__visited">Visited</span> : null}
                </span>
              </button>
            </li>
          );
        })}
      </ol>
      <div className="tower__ground" aria-hidden="true" />
    </section>
  );
}
