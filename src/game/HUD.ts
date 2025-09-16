import { Container, Graphics, Text } from "pixi.js";
import { COLORS } from "./theme";

export class HUD extends Container {
  private bg = new Graphics();
  private txtAtout = new Text({ text: "", style: { fill: 0xffffff, fontSize: 18, fontWeight: "900" }});
  private txtTurn  = new Text({ text: "", style: { fill: 0xffffff, fontSize: 18, fontWeight: "800" }});
  private txtTrick = new Text({ text: "", style: { fill: 0xffffff, fontSize: 18, fontWeight: "800" }});
  private txtScore = new Text({ text: "", style: { fill: 0xffffff, fontSize: 18, fontWeight: "800" }});
  private btnMute  = new Text({ text: "🔊", style: { fill: 0xffffff, fontSize: 20, fontWeight: "900" }});

  widthPx = 0;
  heightPx = 44;

  onToggleMute?: () => void;

  constructor() {
    super();
    this.sortableChildren = true;
    this.addChild(this.bg, this.txtAtout, this.txtTurn, this.txtTrick, this.txtScore, this.btnMute);
    this.btnMute.eventMode = "static";
    this.btnMute.cursor = "pointer";
    this.btnMute.on("pointertap", () => this.onToggleMute?.());
  }

  setMuted(muted: boolean) { this.btnMute.text = muted ? "🔇" : "🔊"; }

  setAtoutSymbol(sym: string)       { this.txtAtout.text = `Atout ${sym}`; }
  setTurnLabel(label: string)       { this.txtTurn.text  = `• Tour : ${label}`; }
  setTrickNumber(n: number)         { this.txtTrick.text = `• Pli #${n}`; }
  setScore(ns: number, we: number)  { this.txtScore.text = `• Score N/S ${ns} — E/O ${we}`; }

  layout(w: number) {
    this.widthPx = w;
    this.bg.clear();
    this.bg.roundRect(0, 0, w, this.heightPx, 10).fill(0x0d243d).stroke({ color: 0xffffff, width: 1, alpha: 0.08 });

    // placement
    let x = 12;
    const pad = 16;

    const place = (t: Text) => { t.position.set(x, 12); x += t.width + pad; };
    place(this.txtAtout);
    place(this.txtTurn);
    place(this.txtTrick);
    place(this.txtScore);

    this.btnMute.position.set(w - 28, 10);
  }
}
