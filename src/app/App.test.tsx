import { fireEvent, render, screen, within } from "@testing-library/react";
import { App } from "./App";

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
});
