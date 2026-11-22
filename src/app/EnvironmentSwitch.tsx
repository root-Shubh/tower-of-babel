import type { Environment } from "./navigation";

interface Props {
  current: Environment;
  onChange: (environment: Environment) => void;
}

/** Always-visible control to move between the Tower and the Home Base. */
export function EnvironmentSwitch({ current, onChange }: Props) {
  return (
    <nav className="env-switch" aria-label="Environment">
      <button
        type="button"
        className="env-switch__button"
        aria-pressed={current === "home"}
        onClick={() => onChange("home")}
      >
        Home Base
      </button>
      <button
        type="button"
        className="env-switch__button"
        aria-pressed={current === "tower"}
        onClick={() => onChange("tower")}
      >
        The Tower
      </button>
    </nav>
  );
}
