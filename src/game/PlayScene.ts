import { Application, Container, Graphics } from "pixi.js";
import type { Scene } from "./Scene";
import { computeLayout, Layout } from "./layout";
import { COLORS } from "./theme";
import { tweenCurvePositionRot, delayFrames, easeOutCubic } from "./tween";
import { createCardView, showCardFace, CardView } from "./renderCard";
import { HUD } from "./HUD";
import { Sound } from "./Sound";

// Domaine
import { Card as DomainCard } from "../domain/models/Card";
import { Suit } from "../domain/models/Types";

// ----- Helpers règles -----
const TRUMP_ORDER = ["jack","9","ace","10","king","queen","8","7"] as const;
const PLAIN_ORDER = ["ace","10","king","queen","jack","9","8","7"] as const;

function power(card: DomainCard, leadSuit: Suit, trump: Suit): number {
  if (card.suit === trump) return 200 + (7 - TRUMP_ORDER.indexOf(card.rank as any));
  if (card.suit === leadSuit) return 100 + (7 - PLAIN_ORDER.indexOf(card.rank as any));
  return 0;
}
function highestTrumpOnTable(trick: DomainCard[], trump: Suit): DomainCard | null {
  const trumps = trick.filter(c => c.suit === trump);
  if (trumps.length === 0) return null;
  return trumps.reduce((hi, c) =>
    TRUMP_ORDER.indexOf(c.rank as any) < TRUMP_ORDER.indexOf(hi.rank as any) ? c : hi
  );
}
function validCards(hand: DomainCard[], trick: DomainCard[], trump: Suit): DomainCard[] {
  if (trick.length === 0) return hand.slice();
  const leadSuit = trick[0].suit;
  const canFollow = hand.some(c => c.suit === leadSuit);
  if (canFollow) return hand.filter(c => c.suit === leadSuit);
  const haveTrump = hand.some(c => c.suit === trump);
  if (!haveTrump) return hand.slice();
  const highestTrump = highestTrumpOnTable(trick, trump);
  if (!highestTrump) return hand.filter(c => c.suit === trump);
  const over = hand.filter(c => c.suit === trump &&
    TRUMP_ORDER.indexOf(c.rank as any) < TRUMP_ORDER.indexOf(highestTrump.rank as any)
  );
  return over.length ? over : hand.filter(c => c.suit === trump);
}
function findTrickWinner(trick: DomainCard[], starter: number, trump: Suit): number {
  const leadSuit = trick[0].suit;
  let bestIdx = 0, best = trick[0], bestPow = power(best, leadSuit, trump);
  for (let i = 1; i < trick.length; i++) {
    const p = power(trick[i], leadSuit, trump);
    if (p > bestPow) { bestPow = p; bestIdx = i; best = trick[i]; }
  }
  return (starter + bestIdx) % 4;
}

// ----- PlayScene -----
type PlayInit = { hands: DomainCard[][]; trump: Suit; starter: number; };

export class PlayScene implements Scene {
  private app!: Application;
  private root = new Container();
  private layoutData!: Layout;

  private table = new Graphics();
  private hud = new HUD();

  private trickNodes: (CardView | null)[] = [null,null,null,null];
  private trickCards: (DomainCard | null)[] = [null,null,null,null];

  private currentPlayer = 0;
  private trickStarter = 0;
  private trickNumber = 1;

  private scoreNS = 0; // Nord/Sud (0 & 2)
  private scoreWE = 0; // Ouest/Est  (1 & 3)

  private handNodes: CardView[][] = [[],[],[],[]];

  constructor(private init: PlayInit) {}

  mount(app: Application): void {
    this.app = app;
    this.app.stage.addChild(this.root);
    this.root.sortableChildren = true;

    this.table.zIndex = 1;
    this.hud.zIndex = 10;

    this.root.addChild(this.table, this.hud);

    this.currentPlayer = this.init.starter;
    this.trickStarter = this.init.starter;

    this.layout();
    window.addEventListener("resize", this.onResize);

    // HUD init
    this.hud.onToggleMute = () => { Sound.toggleMute(); this.hud.setMuted(Sound.muted); };
    this.hud.setAtoutSymbol(this.trumpSymbol(this.init.trump));
    this.hud.setTrickNumber(this.trickNumber);
    this.hud.setScore(this.scoreNS, this.scoreWE);
    this.updateTurnHUD();

    this.renderHands();

    if (this.currentPlayer !== 0) this.botPlayTurn();
  }

  dispose(): void {
    window.removeEventListener("resize", this.onResize);
    this.root.removeFromParent();
    this.root.destroy({ children: true });
  }

  private trumpSymbol(s: Suit): string {
    return s === Suit.HEARTS ? "♥" : s === Suit.DIAMONDS ? "♦" : s === Suit.SPADES ? "♠" : "♣";
  }

  // ---------- Layout ----------
  private onResize = () => this.layout();

  private layout() {
    const w = this.app.renderer.width, h = this.app.renderer.height;
    this.layoutData = computeLayout(w, h);
    const { table } = this.layoutData;

    this.table.clear();
    this.table
      .roundRect(table.x, table.y, table.w, table.h, table.radius)
      .fill(COLORS.table)
      .stroke({ color: COLORS.tableEdge, width: 8, alpha: 0.45 });

    this.hud.position.set(0, Math.max(0, table.y - 48));
    this.hud.layout(w);
  }

  private renderHands() {
    for (const arr of this.handNodes) arr.forEach(n => n.destroy({ children: true }));
    this.handNodes = [[],[],[],[]];

    const { hands } = this.init;

    for (let p = 0; p < 4; p++) {
      const list = hands[p];
      for (let i = 0; i < list.length; i++) {
        const dCard = list[i];
        const node = this.createCardNode(dCard);
        const pos = this.handTarget(p, i);

        node.position.set(pos.x, pos.y);
        node.rotation = pos.rot;

        showCardFace(node, p === 0);
        node.zIndex = 10 + i;

        if (p === 0) {
          node.eventMode = "static";
          node.cursor = "pointer";
          node.on("pointerover", () => { if (this.isPlayable(dCard)) node.scale.set(1.06); });
          node.on("pointerout",  () => node.scale.set(1.0));
          node.on("pointertap",  () => this.onPlayerClick(dCard, node));
        }

        this.root.addChild(node);
        this.handNodes[p].push(node);
      }
    }
    if (this.currentPlayer === 0) this.refreshPlayableHighlights();
  }

  private handTarget(player: number, indexInHand: number): { x: number; y: number; rot: number } {
    const { hands, card } = this.layoutData;
    const anchor = hands[player];
    const spread = (anchor.dir === "h" ? card.w : card.h) * 0.40;
    const centeredIndex = indexInHand - 3.5;

    const angleStep = (4 * Math.PI) / 180;
    const maxAngle = (14 * Math.PI) / 180;
    const fan = Math.max(-maxAngle, Math.min(maxAngle, centeredIndex * angleStep));

    let base = 0; if (player === 1) base = -Math.PI/2; if (player === 3) base = Math.PI/2;
    if (anchor.dir === "h") return { x: Math.round(anchor.x + centeredIndex*spread), y: anchor.y, rot: base + fan };
    return { x: anchor.x, y: Math.round(anchor.y + centeredIndex*spread), rot: base + fan };
  }

  private centerSlotFor(player: number): { x: number; y: number } {
    const { deck, card } = this.layoutData;
    const off = Math.max(card.w, card.h) * 0.9;
    switch (player) {
      case 0: return { x: deck.x, y: deck.y + off };
      case 1: return { x: deck.x - off, y: deck.y };
      case 2: return { x: deck.x, y: deck.y - off };
      case 3: return { x: deck.x + off, y: deck.y };
      default: return deck;
    }
  }

  private createCardNode(card: DomainCard): CardView {
    const { card: cardSize } = this.layoutData;
    const rankMap: Record<string,string> = { "7":"7","8":"8","9":"9","10":"10","jack":"J","queen":"Q","king":"K","ace":"A" };
    return createCardView(card.suit as Suit, rankMap[card.rank], cardSize.w, cardSize.h);
  }

  // ---------- Jouabilité ----------
  private isPlayable(card: DomainCard): boolean {
    const hand = this.init.hands[0];
    const trick = this.trickCards.filter(Boolean) as DomainCard[];
    return validCards(hand, trick, this.init.trump).some(c => c === card);
  }

  private refreshPlayableHighlights() {
    const hand = this.init.hands[0];
    const playable = new Set(validCards(hand, this.trickCards.filter(Boolean) as DomainCard[], this.init.trump));
    for (let i = 0; i < hand.length; i++) {
      const node = this.handNodes[0][i];
      const ok = playable.has(hand[i]);
      node.alpha = ok ? 1 : 0.35;
      node.eventMode = ok ? "static" as const : "none" as any;
    }
  }

  private async onPlayerClick(card: DomainCard, node: CardView) {
    if (this.currentPlayer !== 0) return;
    if (!this.isPlayable(card)) return;
    await this.playCardFor(0, card, node);
    await this.advanceTurn();
  }

  private chooseBotCard(player: number): DomainCard {
    const hand = this.init.hands[player];
    const trick = this.trickCards.filter(Boolean) as DomainCard[];
    const valids = validCards(hand, trick, this.init.trump);
    const PLAIN_ORDER = ["ace","10","king","queen","jack","9","8","7"] as const;
    const TRUMP_ORDER = ["jack","9","ace","10","king","queen","8","7"] as const;
    const leadSuit = trick.length ? trick[0].suit : null;
    function sortPlain(a: DomainCard, b: DomainCard) { return PLAIN_ORDER.indexOf(a.rank as any) - PLAIN_ORDER.indexOf(b.rank as any); }
    function sortTrump(a: DomainCard, b: DomainCard) { return TRUMP_ORDER.indexOf(a.rank as any) - TRUMP_ORDER.indexOf(b.rank as any); }
    if (leadSuit && valids.every(c => c.suit === leadSuit)) return valids.sort(sortPlain)[0];
    if (valids.every(c => c.suit === this.init.trump)) return valids.sort(sortTrump)[0];
    return valids.sort(sortPlain)[0];
  }

  private async botPlayTurn() {
    while (this.currentPlayer !== 0) {
      const p = this.currentPlayer;
      const card = this.chooseBotCard(p);
      const idx = this.init.hands[p].indexOf(card);
      const node = this.handNodes[p][idx];
      await delayFrames(this.app, 12);
      await this.playCardFor(p, card, node);
      await this.advanceTurn();
    }
  }

  private async playCardFor(player: number, card: DomainCard, node: CardView) {
    // retire de la main
    const hand = this.init.hands[player];
    const idx = hand.indexOf(card);
    if (idx >= 0) { hand.splice(idx,1); this.handNodes[player].splice(idx,1); }

    // son
    Sound.play("play", { rate: 0.98 + Math.random()*0.04 });

    // anim vers centre
    const slot = this.centerSlotFor(player);
    await tweenCurvePositionRot(this.app, node, node.position.x, node.position.y,
      (node.position.x+slot.x)/2, (node.position.y+slot.y)/2 - 20,
      slot.x, slot.y, 0, 260, easeOutCubic, 1.0, 1.0);
    node.rotation = 0; node.zIndex = 100;

    const indexInTrick = (player - this.trickStarter + 4) % 4;
    this.trickNodes[indexInTrick] = node;
    this.trickCards[indexInTrick] = card;

    this.layoutHand(player);
    if (player === 0) this.refreshPlayableHighlights();
  }

  private layoutHand(player: number) {
    const list = this.init.hands[player];
    for (let i = 0; i < list.length; i++) {
      const node = this.handNodes[player][i];
      const pos = this.handTarget(player, i);
      node.position.set(pos.x, pos.y);
      node.rotation = pos.rot;
      node.zIndex = 10 + i;
    }
  }

  private updateTurnHUD() {
    const names = ["Vous","Ouest","Nord","Est"];
    this.hud.setTurnLabel(names[this.currentPlayer]);
    this.hud.setTrickNumber(this.trickNumber);
    this.hud.setScore(this.scoreNS, this.scoreWE);
    this.hud.setMuted(Sound.muted);
  }

  private async advanceTurn() {
    this.currentPlayer = (this.currentPlayer + 1) % 4;
    this.updateTurnHUD();

    const played = this.trickCards.filter(Boolean).length;
    if (played < 4) {
      if (this.currentPlayer !== 0) await this.botPlayTurn();
      else this.refreshPlayableHighlights();
      return;
    }

    // vainqueur du pli
    const trick = this.trickCards.filter(Boolean) as DomainCard[];
    const winner = findTrickWinner(trick, this.trickStarter, this.init.trump);

    // score simple: addition des points des cartes selon atout/non-atout (approx vA)
    const PLAIN_POINTS: Record<string,number> = { ace:11, "10":10, king:4, queen:3, jack:2, "9":0, "8":0, "7":0 };
    const TRUMP_POINTS: Record<string,number> = { jack:20, "9":14, ace:11, "10":10, king:4, queen:3, "8":0, "7":0 };
    const pts = trick.reduce((s,c)=> s + (c.suit===this.init.trump ? TRUMP_POINTS[c.rank] : PLAIN_POINTS[c.rank]), 0);

    if (winner % 2 === 0) this.scoreNS += pts; else this.scoreWE += pts;

    await delayFrames(this.app, 12);
    Sound.play("win");

    // anim collecte
    for (let i = 0; i < 4; i++) {
      const node = this.trickNodes[i]; if (!node) continue;
      const dst = this.centerSlotFor(winner);
      await tweenCurvePositionRot(this.app, node, node.position.x, node.position.y, dst.x, dst.y, dst.x, dst.y, 0, 220, easeOutCubic, 1.0, 0.96);
      node.alpha = 0.0;
    }

    // reset pli
    this.trickNodes = [null,null,null,null];
    this.trickCards = [null,null,null,null];

    // nouveau pli
    this.trickStarter = winner;
    this.currentPlayer = winner;
    this.trickNumber += 1;
    this.updateTurnHUD();

    await delayFrames(this.app, 30);
    if (this.currentPlayer !== 0) await this.botPlayTurn();
    else this.refreshPlayableHighlights();
  }
}
