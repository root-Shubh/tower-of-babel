import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
} from "react";
import { App as NativeApp } from "@capacitor/app";
import { floorsInOrder, loadCorePack } from "../content/library";
import { HomeBase } from "../homebase/HomeBase";
import { loadVisitedFloors, saveVisitedFloors } from "../progress/visitedFloors";
import { FloorView } from "../tower/FloorView";
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
  const floors = useMemo(() => floorsInOrder(loadCorePack()), []);
  const [state, dispatch] = useReducer(navigationReducer, undefined, initialNavigation);
  const [visited, setVisited] = useState(loadVisitedFloors);
  const mainRef = useRef<HTMLElement>(null);
  const entry = currentEntry(state);

  // Record where the user was before leaving a screen, so back restores it exactly.
  const navigate = useCallback((action: NavigationAction) => {
    dispatch({ type: "saveScroll", scrollTop: mainRef.current?.scrollTop ?? 0 });
    dispatch(action);
  }, []);

  const enterFloor = useCallback(
    (floorId: string) => {
      navigate({ type: "push", location: { screen: "floor", floorId } });
      setVisited((prev) => {
        if (prev.has(floorId)) return prev;
        const next = new Set(prev).add(floorId);
        saveVisitedFloors(next);
        return next;
      });
    },
    [navigate],
  );

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

  const location = entry.location;
  let screen: React.ReactNode;
  if (location.screen === "home") {
    screen = <HomeBase onEnterTower={() => navigate({ type: "switch", environment: "tower" })} />;
  } else if (location.screen === "floor") {
    const floor = floors.find((f) => f.id === location.floorId);
    screen = floor ? (
      <FloorView
        floor={floor}
        totalFloors={floors.length}
        onBack={() => navigate({ type: "back" })}
      />
    ) : (
      <TowerView floors={floors} visited={visited} onEnterFloor={enterFloor} />
    );
  } else {
    screen = <TowerView floors={floors} visited={visited} onEnterFloor={enterFloor} />;
  }

  return (
    <div className="app" data-environment={state.active}>
      <main className="app__main" ref={mainRef}>
        {screen}
      </main>
      <EnvironmentSwitch
        current={state.active}
        onChange={(environment) => navigate({ type: "switch", environment })}
      />
    </div>
  );
}
