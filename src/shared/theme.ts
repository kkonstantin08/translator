import { getSetting, setSettings } from "./storage";

export type Theme = "light" | "dark" | "system";

export function applyTheme(theme: Theme) {
  const root = document.documentElement;
  const isDark =
    theme === "dark" ||
    (theme === "system" &&
      window.matchMedia("(prefers-color-scheme: dark)").matches);

  if (isDark) {
    root.classList.add("lp-dark");
  } else {
    root.classList.remove("lp-dark");
  }
}

export async function initTheme() {
  const theme = await getSetting("theme");
  applyTheme(theme);

  // Listen for system theme changes
  window
    .matchMedia("(prefers-color-scheme: dark)")
    .addEventListener("change", () => {
      getSetting("theme").then((t) => applyTheme(t));
    });
}

export async function toggleTheme(): Promise<Theme> {
  const current = await getSetting("theme");
  const next: Theme =
    current === "light" ? "dark" : current === "dark" ? "system" : "light";
  await setSettings({ theme: next });
  applyTheme(next);
  return next;
}
