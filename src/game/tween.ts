import { Application, Container } from "pixi.js";

const FRAME_MS = 1000 / 60;

export type Easing = (t: number) => number;
export const easeOutCubic: Easing = (t) => 1 - Math.pow(1 - t, 3);
export const easeInOutQuad: Easing = (t) =>
  t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;

/** Tween XY + rotation (radians) avec easing (par défaut easeOutCubic) */
export function tweenPositionRot(
  app: Application,
  obj: Container,
  toX: number,
  toY: number,
  toRot: number,
  durationMs: number,
  easing: Easing = easeOutCubic
): Promise<void> {
  const fromX = obj.position.x;
  const fromY = obj.position.y;
  const fromR = obj.rotation;

  const totalFrames = Math.max(1, Math.round(durationMs / FRAME_MS));
  let elapsed = 0;

  return new Promise((resolve) => {
    const step = (ticker: any) => {
      elapsed += ticker.deltaTime; // v8: frames
      const lp = Math.min(1, elapsed / totalFrames);
      const p = easing(lp);

      obj.position.set(fromX + (toX - fromX) * p, fromY + (toY - fromY) * p);
      obj.rotation = fromR + (toRot - fromR) * p;

      if (lp >= 1) {
        app.ticker.remove(step);
        resolve();
      }
    };
    app.ticker.add(step);
  });
}

export async function delayFrames(app: Application, frames: number): Promise<void> {
  let elapsed = 0;
  return new Promise((resolve) => {
    const step = (ticker: any) => {
      elapsed += ticker.deltaTime;
      if (elapsed >= frames) {
        app.ticker.remove(step);
        resolve();
      }
    };
    app.ticker.add(step);
  });
}
