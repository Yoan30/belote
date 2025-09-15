import { Application, Graphics, Text } from "pixi.js";

/** Mount point: prefer #game, fallback to #app. */
const mount = document.getElementById("game") ?? document.getElementById("app");
if (!mount) throw new Error("Container #game or #app not found in index.html");

(async () => {
  const app = new Application();
  await app.init({
    background: "#0b132b",
    antialias: true,
    autoDensity: true,
    resolution: window.devicePixelRatio || 1,
    resizeTo: mount, // auto-resize to container
  });

  // Mount canvas
  mount.innerHTML = "";
  mount.appendChild(app.canvas);

  // --- Scene ---------------------------------------------------------------
  const table = new Graphics();
  app.stage.addChild(table);

  const title = new Text({
    text: "Belote — Table",
    style: {
      fill: 0xffffff,
      fontSize: 22,
      fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, sans-serif",
      fontWeight: "700",
      align: "center",
    },
  });
  title.anchor.set(0.5);
  app.stage.addChild(title);

  const startBtn = new Text({
    text: "START",
    style: {
      fill: 0x0b132b,
      fontSize: 18,
      fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, sans-serif",
      fontWeight: "800",
      letterSpacing: 1.2,
    },
  });
  startBtn.anchor.set(0.5);
  startBtn.eventMode = "static";
  startBtn.cursor = "pointer";

  const startBg = new Graphics();
  app.stage.addChild(startBg, startBtn);

  function layout() {
    const w = app.renderer.width;
    const h = app.renderer.height;

    const margin = Math.min(w, h) * 0.06;
    const tw = Math.min(w - margin * 2, h * 0.8);
    const th = Math.min(h - margin * 2, w * 0.55);
    const tx = (w - tw) / 2;
    const ty = (h - th) / 2;

    table.clear();
    table.roundRect(tx, ty, tw, th, Math.min(tw, th) * 0.05).fill(0x216e3a); // green
    table.stroke({ color: 0xf2cb0a, width: 2, alpha: 0.3 });

    title.position.set(w / 2, ty + 28);

    const btnPaddingX = 28, btnPaddingY = 12;
    const btnW = 80 + btnPaddingX * 2, btnH = 32 + btnPaddingY * 2;
    const bx = w / 2 - btnW / 2, by = ty + th / 2 - btnH / 2;

    startBg.clear();
    startBg.roundRect(bx, by, btnW, btnH, 12)
      .fill(0xf2cb0a)
      .stroke({ color: 0x806f06, width: 2, alpha: 0.4 });

    startBtn.position.set(w / 2, by + btnH / 2);
  }

  window.addEventListener("resize", layout);
  layout();

  // Interaction: use ticker.deltaTime (Pixi v8)
  startBtn.on("pointertap", () => {
    startBtn.visible = false;
    startBg.visible = false;
    title.text = "Dealing cards…";

    let t = 0;
    app.ticker.add(function flash(ticker) {
      t += ticker.deltaTime; // ✅ v8
      const pulse = 0.5 + 0.5 * Math.sin(t * 0.2);
      table.alpha = 0.9 + 0.1 * pulse;

      if (t > 120) { // ~2s @60fps
        table.alpha = 1;
        app.ticker.remove(flash);
        title.text = "Round 1";
      }
    });
  });

  app.ticker.add((_ticker) => {
    // game loop placeholder
  });
})();
