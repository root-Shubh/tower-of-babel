import { useCallback, useEffect, useLayoutEffect, useReducer, useRef } from "react";
import { App as NativeApp } from "@capacitor/app";
import { HomeBase } from "../homebase/HomeBase";
import { TowerView } from "../tower/TowerView";
import { EnvironmentSwitch } from "./EnvironmentSwitch";
import {
  currentEntry,
  initialNavigation,
  navigationReducer,
  type NavigationAction,
} from "./navigation";

/** Application shell. Home Base is the landing environment (spec section 10). */
export function App() {
  const [state, dispatch] = useReducer(navigationReducer, undefined, initialNavigation);
  const mainRef = useRef<HTMLElement>(null);
  const entry = currentEntry(state);

  // Record where the user was before leaving a screen, so back restores it exactly.
  const navigate = useCallback((action: NavigationAction) => {
    dispatch({ type: "saveScroll", scrollTop: mainRef.current?.scrollTop ?? 0 });
    dispatch(action);
  }, []);

  useLayoutEffect(() => {
    if (mainRef.current) mainRef.current.scrollTop = entry.scrollTop;
  }, [entry]);

  // Android hardware back button walks the history instead of closing the app.
  useEffect(() => {
    const listener = NativeApp.addListener("backButton", () => navigate({ type: "back" }));
    return () => {
      void listener.then((handle) => handle.remove());
    };
  }, [navigate]);

  useEffect(() => {
    if (!state.exitRequested) return;
    dispatch({ type: "exitHandled" });
    NativeApp.exitApp().catch(() => {
      // Not available on the web build; staying on the Home Base is the right outcome.
    });
  }, [state.exitRequested]);

  return (
    <div className="app" data-environment={state.active}>
      <main className="app__main" ref={mainRef}>
        {entry.location.screen === "home" ? (
          <HomeBase onEnterTower={() => navigate({ type: "switch", environment: "tower" })} />
        ) : (
          <TowerView />
        )}
      </main>
      <EnvironmentSwitch
        current={state.active}
        onChange={(environment) => navigate({ type: "switch", environment })}
      />
    </div>
  );
}
