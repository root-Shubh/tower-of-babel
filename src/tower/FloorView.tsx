import type { Floor } from "../content/schema";
import { Facade } from "./Facade";

interface Props {
  floor: Floor;
  totalFloors: number;
  onBack: () => void;
}

/**
 * Entering a floor. Shows the floor's identity and context; subjects, books, topic counts,
 * progress and recent discoveries are added by SVTOB-20 and SVTOB-21 as content arrives.
 */
export function FloorView({ floor, totalFloors, onBack }: Props) {
  return (
    <article className="floor" aria-labelledby="floor-title">
      <div className="floor__banner">
        <Facade architecture={floor.architecture} />
      </div>
      <div className="floor__body">
        <button type="button" className="text-action" onClick={onBack}>
          ← Back
        </button>
        <p className="floor__kicker">
          Floor {String(floor.number).padStart(2, "0")} of {totalFloors} · {floor.era}
        </p>
        <h1 id="floor-title" className="floor__title">
          {floor.title}
        </h1>
        <p className="floor__context">{floor.context}</p>
        <h2 className="floor__heading">On this floor</h2>
        <p>{floor.description}</p>
        <p className="floor__note">
          Subjects and books for this floor are being written. The library shows what it holds and
          never claims more.
        </p>
      </div>
    </article>
  );
}
