import { render, screen } from "@testing-library/react";
import App from "./App";
beforeEach(() => {
  localStorage.clear();
  window.history.replaceState({}, "", "/dashboard");
});
test("redirects a signed-out visitor to the sign-in screen", () => {
  render(<App />);
  expect(
    screen.getByRole("heading", { name: "Welcome back" }),
  ).toBeInTheDocument();
  expect(window.location.pathname).toBe("/login");
});
test("handles a malformed saved session without crashing", () => {
  localStorage.setItem("user", "{broken");
  render(<App />);
  expect(screen.getByRole("button", { name: "Sign in" })).toBeInTheDocument();
});
