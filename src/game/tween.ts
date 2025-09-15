import { Application, Container } from "pixi.js";

const FRAME_MS = 1000 / 60;

/**
 * Tween linéaire de position pour n'importe quel display (Container, Graphics, Text, Sprite, etc.)
 */
export function tweenPosition(
  app: Application,
  obj: Container,
  toX: number,
  toY: number,
  durationMs: number
): Promise<void> {
  const fromX = obj.position.x;
  const fromY = obj.position.y;
  const totalFrames = Math.max(1, Math.round(durationMs / FRAME_MS));
  let elapsed = 0;

  return new Promise((resolve) => {
    const step = (ticker: any) => {
      elapsed += ticker.deltaTime; // Pixi v8 → deltaTime = frames
      const p = Math.min(1, elapsed / totalFrames);
      const nx = fromX + (toX - fromX) * p;
      const ny = fromY + (toY - fromY) * p;
      obj.position.set(nx, ny);
      if (p >= 1) {
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
