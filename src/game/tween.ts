import { Application, Container } from "pixi.js";

const FRAME_MS = 1000 / 60;

export type Easing = (t: number) => number;
export const easeOutCubic: Easing = (t) => 1 - Math.pow(1 - t, 3);
export const easeInOutQuad: Easing = (t) =>
  t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;

/** Tween XY + rotation (linéaire) – utile pour fallback */
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
      elapsed += ticker.deltaTime;
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

/** Quadratic-bezier XY + rotation + scale (joli mouvement courbe) */
export function tweenCurvePositionRot(
  app: Application,
  obj: Container,
  fromX: number,
  fromY: number,
  ctrlX: number,
  ctrlY: number,
  toX: number,
  toY: number,
  toRot: number,
  durationMs: number,
  easing: Easing = easeOutCubic,
  scaleFrom = 1,
  scaleTo = 1
): Promise<void> {
  const fromR = obj.rotation;
  const totalFrames = Math.max(1, Math.round(durationMs / FRAME_MS));
  let elapsed = 0;

  return new Promise((resolve) => {
    const step = (ticker: any) => {
      elapsed += ticker.deltaTime;
      const lp = Math.min(1, elapsed / totalFrames);
      const t = easing(lp);

      // Quadratic Bezier interpolation
      const inv = 1 - t;
      const bx = inv * inv * fromX + 2 * inv * t * ctrlX + t * t * toX;
      const by = inv * inv * fromY + 2 * inv * t * ctrlY + t * t * toY;

      obj.position.set(bx, by);
      obj.rotation = fromR + (toRot - fromR) * t;

      const s = scaleFrom + (scaleTo - scaleFrom) * t;
      (obj as any).scale.set?.(s, s);

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
