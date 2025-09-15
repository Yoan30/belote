import { Application } from "pixi.js";
import { SceneManager } from "./game/SceneManager";
import { TableScene } from "./game/TableScene";

const mount = document.getElementById("game") ?? document.getElementById("app");
if (!mount) throw new Error("Container #game or #app not found in index.html");

(async () => {
  const app = new Application();
  await app.init({
    background: "#0b132b",
    antialias: true,
    autoDensity: true,
    resolution: window.devicePixelRatio || 1,
    resizeTo: mount,
  });

  mount.innerHTML = "";
  mount.appendChild(app.canvas);

  const manager = new SceneManager(app);
  manager.change(new TableScene()); // on charge la table
})();
