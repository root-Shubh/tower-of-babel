import { fireEvent, render, screen, within } from "@testing-library/react";
import { floorsInOrder, loadCorePack } from "../content/library";
import { FloorView } from "./FloorView";
import { TowerView } from "./TowerView";

const floors = floorsInOrder(loadCorePack());

describe("TowerView", () => {
  it("shows every floor, highest first, so the ground floor is at the bottom", () => {
    render(<TowerView floors={floors} visited={new Set()} onEnterFloor={() => {}} />);
    const list = screen.getByRole("list", { name: "Floors, highest first" });
    const buttons = within(list).getAllByRole("button");
    expect(buttons).toHaveLength(18);
    expect(buttons[0]).toHaveAccessibleName("Floor 18: Modern Science and Space Exploration");
    expect(buttons[17]).toHaveAccessibleName("Floor 1: Primitive Survival");
  });

  it("tapers: higher floors are narrower", () => {
    render(<TowerView floors={floors} visited={new Set()} onEnterFloor={() => {}} />);
    const items = screen.getAllByRole("listitem");
    const widths = items.map((li) => parseFloat(li.style.width));
    expect(widths[0]).toBeLessThan(widths[17]!);
    expect(widths[17]).toBe(100);
  });

  it("marks visited floors and leaves the rest unvisited", () => {
    render(<TowerView floors={floors} visited={new Set(["floor_03"])} onEnterFloor={() => {}} />);
    const visited = screen.getByRole("button", { name: /Floor 3: .*, visited/ });
    expect(visited).toHaveAttribute("data-visited", "true");
    expect(
      screen.getByRole("button", { name: "Floor 4: Settlements and Early Communities" }),
    ).toHaveAttribute("data-visited", "false");
  });

  it("enters any floor; none are locked", () => {
    const entered: string[] = [];
    render(
      <TowerView floors={floors} visited={new Set()} onEnterFloor={(id) => entered.push(id)} />,
    );
    fireEvent.click(screen.getByRole("button", { name: /^Floor 18:/ }));
    fireEvent.click(screen.getByRole("button", { name: /^Floor 1:/ }));
    expect(entered).toEqual(["floor_18", "floor_01"]);
  });

  it("draws each storey locally as SVG", () => {
    const { container } = render(
      <TowerView floors={floors} visited={new Set()} onEnterFloor={() => {}} />,
    );
    expect(container.querySelectorAll("svg.facade")).toHaveLength(18);
    expect(container.querySelectorAll("img")).toHaveLength(0);
  });
});

describe("FloorView", () => {
  it("shows the floor's number, title, era and context", () => {
    const floor = floors[4]!;
    render(<FloorView floor={floor} totalFloors={18} onBack={() => {}} />);
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(floor.title);
    expect(screen.getByText(`Floor 05 of 18 · ${floor.era}`)).toBeInTheDocument();
    expect(screen.getByText(floor.context)).toBeInTheDocument();
  });

  it("goes back", () => {
    let backs = 0;
    render(<FloorView floor={floors[0]!} totalFloors={18} onBack={() => backs++} />);
    fireEvent.click(screen.getByRole("button", { name: "← Back" }));
    expect(backs).toBe(1);
  });
});
