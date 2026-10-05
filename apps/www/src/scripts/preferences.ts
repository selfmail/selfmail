import { navigate } from "astro:transitions/client";
import { isLocale, setLocale } from "../paraglide/runtime.js";

const systemTheme = window.matchMedia("(prefers-color-scheme: dark)");

function applyTheme(mode: string, target = document) {
  const dark = mode === "dark" || (mode === "auto" && systemTheme.matches);
  target.documentElement.classList.toggle("dark", dark);
  target.documentElement.dataset.theme = mode;
  const select = target.querySelector<HTMLSelectElement>("#theme");
  if (select) {
    select.value = mode;
  }
}

document.addEventListener("astro:before-swap", (event) => {
  applyTheme(
    document.documentElement.dataset.theme ?? "auto",
    event.newDocument
  );
});
document.addEventListener("astro:page-load", () => {
  applyTheme(document.documentElement.dataset.theme ?? "auto");
});

document.addEventListener("change", async (event) => {
  const select = event.target;
  if (!(select instanceof HTMLSelectElement)) {
    return;
  }
  if (select.id === "locale" && isLocale(select.value)) {
    await setLocale(select.value, { reload: false });
    await navigate(window.location.href, { history: "replace" });
    return;
  }
  if (select.id !== "theme") {
    return;
  }
  applyTheme(select.value);
  try {
    localStorage.setItem("theme", select.value);
  } catch {
    // Keep the choice for this page when storage is unavailable.
  }
});

systemTheme.addEventListener("change", () => {
  if (document.documentElement.dataset.theme === "auto") {
    applyTheme("auto");
  }
});
window.addEventListener("storage", (event) => {
  if (event.key !== "theme" && event.key !== null) {
    return;
  }
  applyTheme(
    event.newValue === "light" || event.newValue === "dark"
      ? event.newValue
      : "auto"
  );
});
