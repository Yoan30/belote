import { Application, Text, TextStyle } from "pixi.js";
import { registerSW } from "./pwa/registerSW";

registerSW();

const app = new Application({
  resizeTo: window,
  background: "#0b132b",
  antialias: true,
});

const mount = document.getElementById("app");
if (!mount) throw new Error("Div #app introuvable dans index.html");
mount.appendChild(app.view as HTMLCanvasElement);

<<<<<<< HEAD
const label = new Text("Belote", new TextStyle({ fill: 0xffffff, fontSize: 28 }));
=======
const label = new Text("Belote — v2 déployé ✅", new TextStyle({ fill: 0xffffff, fontSize: 28 }));
>>>>>>> origin/main
label.anchor.set(0.5);
app.stage.addChild(label);

function center() {
  label.position.set(app.renderer.width / 2, app.renderer.height / 2);
}
center();
window.addEventListener("resize", center);
