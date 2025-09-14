/**
 * Minimal SW register helper (prend en compte la base Vite pour GitHub Pages).
 */
export function registerSW() {
  if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => {
      const swUrl = new URL(`${import.meta.env.BASE_URL}sw.js`, window.location.href).toString();
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
