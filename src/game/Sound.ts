export type SoundName = "deal"|"flip"|"play"|"win"|"shuffle"|"click";

export class Sound {
  private static ctx: AudioContext | null = null;
  private static gain: GainNode | null = null;
  private static buffers: Map<SoundName, AudioBuffer> = new Map();
  private static _muted = false;
  private static _volume = 0.9;

  static get muted() { return this._muted; }
  static get volume() { return this._volume; }

  private static resolve(path: string): string {
    const base = (import.meta as any).env?.BASE_URL ?? "/";
    return base.replace(/\/+$/, "/") + path.replace(/^\/+/, "");
  }

  static async init(sources?: Partial<Record<SoundName,string>>) {
    if (!this.ctx) {
      // @ts-ignore
      const AC = window.AudioContext || (window as any).webkitAudioContext;
      this.ctx = new AC();
      this.gain = this.ctx.createGain();
      this.gain.gain.value = this._muted ? 0 : this._volume;
      this.gain.connect(this.ctx.destination);
    }
    const defaults: Record<SoundName,string> = {
      deal:     "sounds/deal.mp3",
      flip:     "sounds/flip.mp3",
      play:     "sounds/play.mp3",
      win:      "sounds/win.mp3",
      shuffle:  "sounds/shuffle.mp3",
      click:    "sounds/click.mp3",
    };
    const srcs = { ...defaults, ...(sources ?? {}) };

    await Promise.all(
      (Object.keys(srcs) as SoundName[]).map(async (key) => {
        const url = this.resolve(srcs[key]);
        try {
          const res = await fetch(url);
          if (!res.ok) return;
          const buf = await res.arrayBuffer();
          const audio = await this.ctx!.decodeAudioData(buf);
          this.buffers.set(key, audio);
        } catch {
          // silencieux si un fichier manque
        }
      })
    );
  }

  static async play(name: SoundName, opts?: { rate?: number; volume?: number }) {
    if (!this.ctx || !this.gain) return;
    if (this._muted) return;
    const buf = this.buffers.get(name);
    if (!buf) return;
    if (this.ctx.state === "suspended") { try { await this.ctx.resume(); } catch {} }

    const src = this.ctx.createBufferSource();
    src.buffer = buf;
    src.playbackRate.value = opts?.rate ?? 1.0;

    const g = this.ctx.createGain();
    g.gain.value = (opts?.volume ?? 1.0) * this._volume;

    src.connect(g);
    g.connect(this.gain);
    src.start(0);
  }

  static setMuted(m: boolean) {
    this._muted = m;
    if (this.gain) this.gain.gain.value = m ? 0 : this._volume;
  }
  static toggleMute() { this.setMuted(!this._muted); }

  static setVolume(v: number) {
    this._volume = Math.max(0, Math.min(1, v));
    if (this.gain && !this._muted) this.gain.gain.value = this._volume;
  }
}
