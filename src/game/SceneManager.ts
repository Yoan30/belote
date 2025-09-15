import { Application } from "pixi.js";
import type { Scene } from "./Scene";

export class SceneManager {
  constructor(private app: Application) {}

  private current?: Scene;

  change(scene: Scene) {
    // Clean current
    this.current?.dispose();
    // Efface tout le stage
    this.app.stage.removeChildren();

    // Mount next
    scene.mount(this.app);
    this.current = scene;
  }
}
