import type { Application } from "pixi.js";

export interface Scene {
  /** Attache la scène (création des nodes, listeners, etc.) */
  mount(app: Application): void;
  /** Nettoie (listeners, timers, nodes) */
  dispose(): void;
}
