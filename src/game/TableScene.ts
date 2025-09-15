import { Application, Container, Graphics, Text } from "pixi.js";
import { computeLayout, Layout } from "./layout";
import { tweenPositionRot, delayFrames, easeOutCubic } from "./tween";
import { COLORS, CARD } from "./theme";

export class TableScene {
  private app: Application;
  private layoutData!: Layout;

  private table = new Graphics();
  private title = new Text({
    text: "Belote — Table",
    style: {
      fill: 0xffffff,
      fontSize: 22,
      fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, sans-serif",
      fontWeight: "700",
      align: "center",
    },
  });

  private startBg = new Graphics();
  private startBtn = new Text({
    text: "START",
    style: {
      fill: COLORS.bg,
      fontSize: 18,
      fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, sans-serif",
      fontWeight: "800",
      letterSpacing: 1.2,
    },
  });

  private handCount = [0, 0, 0, 0];

  constructor(app: Application) {
    this.app = app;
    this.app.stage.sortableChildren = true;

    this.title.anchor.set(0.5);
    this.startBtn.anchor.set(0.5);
    this.startBtn.eventMode = "static";
    this.startBtn.cursor = "pointer";

    app.stage.addChild(this.table, this.title, this.startBg, this.startBtn);

    this.layout();
    window.addEventListener("resize", () => this.layout());

    this.startBtn.on("pointertap", () => this.onStart());
  }

  private layout() {
    const w = this.app.renderer.width;
    const h = this.app.renderer.height;

    this.layoutData = computeLayout(w, h);
    const { table, card } = this.layoutData;

    // TABLE avec bord plus élégant
    this.table.clear();
    // Ombre extérieure légère (faux relief)
    this.table
      .roundRect(table.x, table.y, table.w, table.h, table.radius)
      .fill(COLORS.table)
      .stroke({ color: COLORS.tableEdge, width: 8, alpha: 0.7 });
    // liseré intérieur
    this.table
      .roundRect(table.x + 6, table.y + 6, table.w - 12, table.h - 12, table.radius)
      .stroke({ color: COLORS.tableHighlight, width: 2, alpha: 0.25 });

    this.title.position.set(w / 2, table.y + 28);

    const btnW = Math.max(120, card.w * 2.2);
    const btnH = Math.max(48, card.h * 0.8);
    const bx = w / 2 - btnW / 2;
    const by = table.y + table.h / 2 - btnH / 2;

    this.startBg.clear();
    this.startBg
      .roundRect(bx, by, btnW, btnH, 12)
      .fill(COLORS.accent)
      .stroke({ color: 0x806f06, width: 2, alpha: 0.4 });

    this.startBtn.position.set(w / 2, by + btnH / 2);
  }

  private async onStart() {
    this.startBg.visible = false;
    this.startBtn.visible = false;
    this.title.text = "Dealing cards…";

    await this.dealThreeTwoThree();

    this.title.text = "Round 1";
  }

  /** Carte avec ombre douce, centrée sur (0,0) pour rotations propres */
  private createCard(): Container {
    const { card } = this.layoutData;
    const c = new Container();

    const shadow = new Graphics();
    shadow
      .roundRect(
        -card.w / 2 + CARD.shadowOffsetX,
        -card.h / 2 + CARD.shadowOffsetY,
        card.w,
        card.h,
        Math.min(card.w, card.h) * CARD.radiusFactor
      )
      .fill({ color: COLORS.cardShadow, alpha: CARD.shadowAlpha });
    shadow.zIndex = 0;

    const face = new Graphics();
    face
      .roundRect(-card.w / 2, -card.h / 2, card.w, card.h, Math.min(card.w, card.h) * CARD.radiusFactor)
      .fill(COLORS.cardFace)
      .stroke({ color: COLORS.cardBorder, width: CARD.borderWidth, alpha: 0.9 });
    face.zIndex = 1;

    c.addChild(shadow, face);
    c.zIndex = 10; // au-dessus de la table
    return c;
  }

  /**
   * Calcule position + rotation cible pour une main donnée et index.
   * Eventail léger : ~4° par carte, clampé à ±14°.
   */
  private handTarget(player: number, indexInHand: number): { x: number; y: number; rot: number } {
    const { hands, card } = this.layoutData;
    const anchor = hands[player];

    const spread = (anchor.dir === "h" ? card.w : card.h) * 0.36;
    const centeredIndex = indexInHand - 3.5; // 8 cartes : centre entre 3 et 4

    const angleStep = (4 * Math.PI) / 180; // 4°
    const maxAngle = (14 * Math.PI) / 180; // clamp ±14°
    const fan = Math.max(-maxAngle, Math.min(maxAngle, centeredIndex * angleStep));

    let base = 0;
    if (player === 1) base = -Math.PI / 2; // gauche
    if (player === 3) base = Math.PI / 2; // droite
    // top (2) et bottom (0) -> base = 0

    if (anchor.dir === "h") {
      return { x: Math.round(anchor.x + centeredIndex * spread), y: anchor.y, rot: base + fan };
    } else {
      return { x: anchor.x, y: Math.round(anchor.y + centeredIndex * spread), rot: base + fan };
    }
  }

  private async dealThreeTwoThree() {
    const counts = [3, 2, 3];
    const deck = this.layoutData.deck;

    this.handCount = [0, 0, 0, 0];

    for (const c of counts) {
      for (let player = 0; player < 4; player++) {
        for (let i = 0; i < c; i++) {
          const card = this.createCard();
          card.position.set(deck.x, deck.y);
          card.rotation = 0;
          this.app.stage.addChild(card);

          const idx = this.handCount[player];
          const target = this.handTarget(player, idx);
          this.handCount[player] = idx + 1;

          const dur = 260 + Math.round(Math.random() * 60); // léger jitter
          await tweenPositionRot(this.app, card, target.x, target.y, target.rot, dur, easeOutCubic);
          await delayFrames(this.app, 2);
        }
        await delayFrames(this.app, 4);
      }
    }
  }
}
