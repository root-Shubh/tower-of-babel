import { useState } from "react";
import { HomeBase } from "../homebase/HomeBase";
import { TowerView } from "../tower/TowerView";
import { EnvironmentSwitch } from "./EnvironmentSwitch";

export type Environment = "home" | "tower";

/** Application shell. Home Base is the landing environment (spec section 10). */
export function App() {
  const [environment, setEnvironment] = useState<Environment>("home");

  return (
    <div className="app" data-environment={environment}>
      <main className="app__main">
        {environment === "home" ? (
          <HomeBase onEnterTower={() => setEnvironment("tower")} />
        ) : (
          <TowerView />
        )}
      </main>
      <EnvironmentSwitch current={environment} onChange={setEnvironment} />
    </div>
  );
}
