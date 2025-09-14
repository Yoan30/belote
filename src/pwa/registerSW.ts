/**
 * Minimal SW register helper (no PWA magic, juste enregistre /sw.js si présent).
 */
export function registerSW() {
  if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => {
      navigator.serviceWorker
        .register("/sw.js")
        .catch((err) => console.warn("[SW] register failed:", err));
    });
  }
}

export function unregisterSW() {
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.getRegistrations().then((regs) => {
      regs.forEach((r) => r.unregister());
    });
  }
}
