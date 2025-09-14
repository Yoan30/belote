/**
 * Minimal SW register helper (compatible GitHub Pages).
 * Pas besoin des types Vite: on garde import.meta.env optionnel.
 */
export function registerSW() {
  if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => {
      // Pas de dépendance aux types Vite: on caste en any et on garde un fallback.
      const base =
        (import.meta as any)?.env?.BASE_URL ??
        "/belote/"; // <- garde /belote/ pour Pages

      const swUrl = new URL(`${base}sw.js`, window.location.href).toString();

      navigator.serviceWorker
        .register(swUrl)
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
