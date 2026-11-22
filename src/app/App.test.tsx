import { fireEvent, render, screen, within } from "@testing-library/react";
import { App } from "./App";

beforeEach(() => localStorage.clear());

describe("App shell", () => {
  it("launches into the Home Base", () => {
    render(<App />);
    expect(screen.getByRole("heading", { level: 1, name: "Home Base" })).toBeInTheDocument();
  });

  it("enters the Tower from the Home Base", () => {
    render(<App />);
    fireEvent.click(screen.getByRole("button", { name: "Enter the Tower" }));
    expect(
      screen.getByRole("heading", { level: 1, name: "The Tower of Babel" }),
    ).toBeInTheDocument();
  });

  it("switches back and forth with the environment control", () => {
    render(<App />);
    const nav = within(screen.getByRole("navigation", { name: "Environment" }));
    fireEvent.click(nav.getByRole("button", { name: "The Tower" }));
    expect(nav.getByRole("button", { name: "The Tower" })).toHaveAttribute("aria-pressed", "true");
    fireEvent.click(nav.getByRole("button", { name: "Home Base" }));
    expect(screen.getByRole("heading", { level: 1, name: "Home Base" })).toBeInTheDocument();
  });

  it("enters a floor, marks it visited and returns to the Tower", () => {
    render(<App />);
    fireEvent.click(screen.getByRole("button", { name: "Enter the Tower" }));
    fireEvent.click(screen.getByRole("button", { name: "Floor 1: Primitive Survival" }));
    expect(
      screen.getByRole("heading", { level: 1, name: "Primitive Survival" }),
    ).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "← Back" }));
    expect(
      screen.getByRole("button", { name: "Floor 1: Primitive Survival, visited" }),
    ).toBeInTheDocument();
    expect(localStorage.getItem("tob.visitedFloors.v1")).toBe('["floor_01"]');
  });

  it("remembers the open floor when switching to the Home Base and back", () => {
    render(<App />);
    fireEvent.click(screen.getByRole("button", { name: "Enter the Tower" }));
    fireEvent.click(screen.getByRole("button", { name: /^Floor 7:/ }));
    const nav = within(screen.getByRole("navigation", { name: "Environment" }));
    fireEvent.click(nav.getByRole("button", { name: "Home Base" }));
    fireEvent.click(nav.getByRole("button", { name: "The Tower" }));
    expect(
      screen.getByRole("heading", { level: 1, name: "Architecture and Civil Engineering" }),
    ).toBeInTheDocument();
  });
});
