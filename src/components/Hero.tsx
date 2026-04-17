import { Link } from "@tanstack/react-router";
import { ArrowUpRight, PlayCircle, ShieldCheck } from "lucide-react";
import { NeuralGrid } from "./NeuralGrid";

export function Hero() {
  return (
    <section className="relative isolate overflow-hidden pt-16 pb-32">
      <NeuralGrid />

      <div className="relative mx-auto max-w-7xl px-6">
        {/* Trust pill */}
        <div className="mx-auto mb-8 flex w-fit items-center gap-2 rounded-full glass px-3 py-1.5 text-xs animate-fade-in">
          <ShieldCheck className="h-3.5 w-3.5 text-primary" />
          <span className="text-muted-foreground">Trusted by</span>
          <span className="font-medium">CGIAR · FAO · MIT Media Lab</span>
          <span className="mx-2 h-3 w-px bg-hairline" />
          <span className="text-primary">SOC 2 · ISO 27001</span>
        </div>

        <h1
          className="mx-auto max-w-5xl text-center text-5xl font-semibold tracking-tight md:text-7xl animate-slide-up"
          style={{ letterSpacing: "-0.04em", lineHeight: 1.02 }}
        >
          Predict the future of farming{" "}
          <span className="neon-text">before it happens</span>
        </h1>

        <p
          className="mx-auto mt-6 max-w-2xl text-center text-lg text-muted-foreground animate-slide-up"
          style={{ animationDelay: "0.1s", animationFillMode: "backwards" }}
        >
          AI + atmospheric physics + crop genomics simulating yield, risk, and breeding
          strategy across <span className="text-foreground">192 countries</span> — all the way
          to <span className="text-foreground">2050</span>.
        </p>

        <div
          className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row animate-slide-up"
          style={{ animationDelay: "0.2s", animationFillMode: "backwards" }}
        >
          <Link
            to="/app"
            className="group inline-flex h-11 items-center gap-2 rounded-xl bg-primary px-5 text-sm font-medium text-primary-foreground transition-all hover:scale-[1.02] neon-glow"
          >
            Launch App
            <ArrowUpRight className="h-4 w-4 transition-transform group-hover:rotate-45" />
          </Link>
          <a
            href="#demo"
            className="inline-flex h-11 items-center gap-2 rounded-xl glass px-5 text-sm font-medium hover:bg-panel-2 transition-colors"
          >
            <PlayCircle className="h-4 w-4 text-accent" />
            View Live Demo
          </a>
        </div>

        {/* Stats strip */}
        <div
          className="mx-auto mt-20 grid max-w-4xl grid-cols-2 gap-px overflow-hidden rounded-2xl glass md:grid-cols-4 animate-fade-in"
          style={{ animationDelay: "0.4s", animationFillMode: "backwards" }}
        >
          {[
            { v: "98.4%", l: "Yield accuracy" },
            { v: "12.7M", l: "Genotypes simulated" },
            { v: "192", l: "Countries covered" },
            { v: "<400ms", l: "Inference latency" },
          ].map((s) => (
            <div key={s.l} className="bg-panel/40 px-6 py-5">
              <div className="font-mono text-2xl tracking-tight neon-text">{s.v}</div>
              <div className="mt-1 text-xs text-muted-foreground">{s.l}</div>
            </div>
          ))}
        </div>

        {/* Product preview card */}
        <div
          className="relative mx-auto mt-20 max-w-6xl animate-slide-up"
          style={{ animationDelay: "0.5s", animationFillMode: "backwards" }}
        >
          <div className="absolute -inset-px rounded-3xl opacity-50 blur-2xl"
               style={{ background: "var(--gradient-neon)" }} />
          <div className="relative overflow-hidden rounded-3xl glass-strong">
            <div className="flex items-center gap-2 border-b border-hairline bg-panel/60 px-4 py-3">
              <div className="flex gap-1.5">
                <span className="h-3 w-3 rounded-full bg-destructive/70" />
                <span className="h-3 w-3 rounded-full bg-warning/70" />
                <span className="h-3 w-3 rounded-full bg-primary/70" />
              </div>
              <div className="ml-3 font-mono text-xs text-muted-foreground">
                croporacle.ai / simulation / NA-midwest-2050
              </div>
            </div>
            <PreviewDashboard />
          </div>
        </div>
      </div>
    </section>
  );
}

function PreviewDashboard() {
  return (
    <div className="grid gap-px bg-hairline p-px lg:grid-cols-[1fr_320px]">
      <div className="bg-panel p-6">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <div className="text-xs text-muted-foreground">Region · Iowa, USA</div>
            <div className="mt-1 text-lg font-semibold">Yield prediction · 2050</div>
          </div>
          <span className="rounded-full bg-primary/15 px-2.5 py-1 text-[11px] font-medium text-primary">
            ● Live model
          </span>
        </div>
        <Heatmap />
      </div>
      <div className="bg-panel p-6">
        <div className="text-xs text-muted-foreground">Top recommendation</div>
        <div className="mt-1 text-lg font-semibold">Z-7421 · Drought-tolerant maize</div>
        <div className="mt-4 space-y-3">
          {[
            { l: "Predicted yield", v: "9.4 t/ha", c: "text-primary" },
            { l: "Risk index", v: "Low (0.12)", c: "text-accent" },
            { l: "Water stress", v: "Resilient", c: "text-foreground" },
            { l: "Confidence", v: "94.7%", c: "text-foreground" },
          ].map((r) => (
            <div key={r.l} className="flex items-center justify-between border-b border-hairline pb-2 text-sm">
              <span className="text-muted-foreground">{r.l}</span>
              <span className={`font-mono ${r.c}`}>{r.v}</span>
            </div>
          ))}
        </div>
        <button className="mt-6 w-full rounded-lg bg-primary py-2.5 text-sm font-medium text-primary-foreground neon-glow">
          Generate Breeding Blueprint
        </button>
      </div>
    </div>
  );
}

function Heatmap() {
  // 16x8 deterministic heatmap
  const rows = 8, cols = 20;
  const cells = Array.from({ length: rows * cols }, (_, i) => {
    const x = i % cols, y = Math.floor(i / cols);
    const dx = x - cols / 2, dy = y - rows / 2;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const noise = Math.sin(x * 1.7) * Math.cos(y * 1.3);
    return Math.max(0, Math.min(1, 0.7 - dist / 12 + noise * 0.18));
  });
  return (
    <div
      className="grid gap-1 rounded-xl bg-background/40 p-3"
      style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}
    >
      {cells.map((v, i) => {
        const hue = v > 0.55 ? "145" : v > 0.35 ? "70" : "25";
        const chroma = v > 0.55 ? 0.27 : v > 0.35 ? 0.18 : 0.24;
        const light = 0.3 + v * 0.55;
        return (
          <div
            key={i}
            className="aspect-square rounded-[3px] transition-transform hover:scale-110"
            style={{
              background: `oklch(${light} ${chroma} ${hue})`,
              boxShadow: v > 0.6 ? `0 0 8px oklch(${light} ${chroma} ${hue} / 0.6)` : "none",
            }}
          />
        );
      })}
    </div>
  );
}
