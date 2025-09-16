import { Application, Container, Graphics, Text, Sprite } from "pixi.js";
import { computeLayout, Layout } from "./layout";
import { tweenCurvePositionRot, delayFrames, easeOutCubic } from "./tween";
import { COLORS } from "./theme";
import type { Scene } from "./Scene";
import { SceneManager } from "./SceneManager";

// Domaine
import { Deck } from "../domain/models/Deck";
import { Card as DomainCard } from "../domain/models/Card";
import { Suit } from "../domain/models/Types";
import { rngFromSeedString } from "./prng";

// UI
import { createCardView, showCardFace, CardView } from "./renderCard";
import { presentAtoutPicker } from "./AtoutPicker";
import { makeRadialGradientSprite } from "./graphics";
import { PlayScene } from "./PlayScene";
import { Sound } from "./Sound";

export class TableScene implements Scene {
  private app!: Application;
  private root = new Container();
  private layoutData!: Layout;

  private table = new Graphics();
  private vignette?: Sprite;

  private title = new Text({
    text: "Belote — Table",
    style: { fill: 0xffffff, fontSize: 22, fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, sans-serif", fontWeight: "700", align: "center" },
  });

  private startBg = new Graphics();
  private startBtn = new Text({
    text: "START",
    style: { fill: 0x0b132b, fontSize: 18, fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, sans-serif", fontWeight: "800", letterSpacing: 1.2 },
  });

  private trump: Suit | null = null;

  private deck!: Deck;
  private hands: DomainCard[][] = [[], [], [], []];
  private handNodes: CardView[][] = [[], [], [], []];
  private handCount = [0, 0, 0, 0];

  private onResize = () => this.layout();

  constructor(private manager: SceneManager) {}

  mount(app: Application): void {
    this.app = app;
    this.root.sortableChildren = true;
    this.app.stage.addChild(this.root);

    this.title.anchor.set(0.5);
    this.startBtn.anchor.set(0.5);
    this.startBtn.eventMode = "static";
    this.startBtn.cursor = "pointer";

    this.root.addChild(this.table, this.title, this.startBg, this.startBtn);

    this.layout();
    window.addEventListener("resize", this.onResize);

    this.startBtn.on("pointertap", () => this.onStart());
  }

  dispose(): void {
    window.removeEventListener("resize", this.onResize);
    this.root.removeFromParent();
    this.root.destroy({ children: true });
  }

  private layout() {
    const w = this.app.renderer.width, h = this.app.renderer.height;
    this.layoutData = computeLayout(w, h);
    const { table, card } = this.layoutData;

    this.table.clear();
    this.table.roundRect(table.x, table.y, table.w, table.h, table.radius).fill(0x20663a).stroke({ color: 0x15402a, width: 8, alpha: 0.72 });
    this.table.roundRect(table.x + 6, table.y + 6, table.w - 12, table.h - 12, table.radius).stroke({ color: 0x51a06a, width: 2, alpha: 0.25 });

    if (this.vignette) { this.vignette.destroy(); this.vignette = undefined; }
    this.vignette = makeRadialGradientSprite(table.w, table.h, "rgba(0,0,0,0)", "rgba(0,0,0,0.55)", 0.45);
    this.vignette.position.set(table.x, table.y);
    this.vignette.zIndex = 2; this.root.addChild(this.vignette);

    this.title.position.set(w / 2, table.y + 28);
    const btnW = Math.max(120, card.w * 2.2);
    const btnH = Math.max(48, card.h * 0.8);
    const bx = w / 2 - btnW / 2;
    const by = table.y + table.h / 2 - btnH / 2;

    this.startBg.clear();
    this.startBg.roundRect(bx, by, btnW, btnH, 12).fill(0xf2cb0a).stroke({ color: 0x806f06, width: 2, alpha: 0.4 });
    this.startBtn.position.set(w / 2, by + btnH / 2);
    this.startBg.zIndex = 4; this.startBtn.zIndex = 5;
  }

  private async onStart() {
    const rng = rngFromSeedString(new Date().toISOString().slice(0, 10));
    this.deck = new Deck(); this.deck.shuffle(rng);

    this.startBg.visible = false; this.startBtn.visible = false;
    this.title.text = "Distribution…";
    Sound.play("shuffle");

    await this.dealThreeTwoThree();

    this.title.text = "Choix de l'atout";
    this.trump = await presentAtoutPicker(this.app, this.root);
    Sound.play("click");
    this.title.text = `Atout : ${this.trumpSymbol(this.trump)}`;

    this.manager.change(new PlayScene({ hands: this.hands.map(a => a.slice()), trump: this.trump!, starter: 0 }));
  }

  private trumpSymbol(s: Suit): string { return s === Suit.HEARTS ? "♥" : s === Suit.DIAMONDS ? "♦" : s === Suit.SPADES ? "♠" : "♣"; }

  private createCardNode(card: DomainCard): CardView {
    const { card: cardSize } = this.layoutData;
    const rankMap: Record<string,string> = { "7":"7","8":"8","9":"9","10":"10","jack":"J","queen":"Q","king":"K","ace":"A" };
    return createCardView(card.suit as any, rankMap[card.rank], cardSize.w, cardSize.h);
  }

  private handTarget(player: number, indexInHand: number): { x: number; y: number; rot: number } {
    const { hands, card } = this.layoutData;
    const anchor = hands[player];
    const spread = (anchor.dir === "h" ? card.w : card.h) * 0.38;
    const centeredIndex = indexInHand - 3.5;

    const angleStep = (4 * Math.PI) / 180;
    const maxAngle = (14 * Math.PI) / 180;
    const fan = Math.max(-maxAngle, Math.min(maxAngle, centeredIndex * angleStep));
    let base = 0; if (player === 1) base = -Math.PI/2; if (player === 3) base = Math.PI/2;

    if (anchor.dir === "h") return { x: Math.round(anchor.x + centeredIndex*spread), y: anchor.y, rot: base + fan };
    return { x: anchor.x, y: Math.round(anchor.y + centeredIndex*spread), rot: base + fan };
  }

  private async dealThreeTwoThree() {
    const counts = [3, 2, 3];
    const deckPos = this.layoutData.deck;

    this.handCount = [0,0,0,0];
    this.hands = [[],[],[],[]];
    this.handNodes = [[],[],[],[]];

    for (const c of counts) {
      for (let player = 0; player < 4; player++) {
        for (let i = 0; i < c; i++) {
          const dealt = this.deck.deal(1)[0];
          this.hands[player].push(dealt);

          const node = this.createCardNode(dealt);
          node.position.set(deckPos.x, deckPos.y); node.rotation = 0; node.scale.set(1,1);
          node.zIndex = 10 + i; this.root.addChild(node); this.handNodes[player].push(node);

          const idx = this.handCount[player]; const target = this.handTarget(player, idx); this.handCount[player] = idx + 1;

          const midX = (deckPos.x + target.x) / 2;
          const midY = (deckPos.y + target.y) / 2;
          const dx = target.x - deckPos.x, dy = target.y - deckPos.y;
          const len = Math.max(1, Math.hypot(dx, dy));
          const nx = -dy / len, ny = dx / len;
          const offset = Math.min(120, len * 0.18) * (player === 0 || player === 1 ? 1 : -1);
          const ctrlX = midX + nx * offset, ctrlY = midY + ny * offset;

          showCardFace(node, player === 0);

          const dur = 240 + Math.round(Math.random() * 60);
          Sound.play("deal", { rate: 0.96 + Math.random()*0.06, volume: 0.9 });
          await tweenCurvePositionRot(this.app, node, deckPos.x, deckPos.y, ctrlX, ctrlY, target.x, target.y, target.rot, dur, easeOutCubic, 1.0, 0.98);
          await delayFrames(this.app, 2);
        }
        await delayFrames(this.app, 4);
      }
    }
  }
}
