/**
 * Minimal bootstrap that mounts on #game or #app and prints a sanity text.
 * Replace with your Pixi/Phaser/game init.
 */
const mount =
  document.getElementById("game") ?? document.getElementById("app");

if (!mount) {
  throw new Error("Container #game or #app not found in index.html");
}

const el = document.createElement("div");
el.style.color = "#fff";
el.style.font = "600 20px system-ui, sans-serif";
el.style.display = "grid";
el.style.placeItems = "center";
el.style.height = "100%";
el.textContent = "Belote — build OK ✅";
mount.appendChild(el);
