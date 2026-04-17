import type { Region, Scenario } from "@/lib/futurecrop-data";
import { ChevronRight, Droplets, Leaf, ShieldAlert, TrendingUp } from "lucide-react";
import { useMemo, useState } from "react";

export type Genotype = {
  id: string;
  name: string;
  yield: number; // t/ha
  risk: number; // 0-1
  water: number; // 0-1 resilience
  confidence: number; // 0-1
  trait: string;
};

function makeGenotypes(seed: string): Genotype[] {
  const base = seed.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
  const traits = ["Drought-tolerant", "Heat-resilient", "Salt-resistant", "Pest-resistant", "High-density"];
  return Array.from({ length: 5 }, (_, i) => {
    const r = ((base * (i + 1) * 9301 + 49297) % 233280) / 233280;
    return {
      id: `Z-${(7000 + ((base + i * 53) % 999)).toString().padStart(4, "0")}`,
      name: ["Maize", "Wheat", "Sorghum", "Soybean", "Rice"][i],
      yield: 6 + r * 5,
      risk: 0.05 + ((1 - r) * 0.5) ** 1.4,
      water: 0.4 + r * 0.55,
      confidence: 0.82 + r * 0.16,
      trait: traits[(i + base) % traits.length],
    };
  }).sort((a, b) => b.yield - a.yield);
}

function makeHeatmap(seed: string, severity: number) {
  const rows = 12, cols = 28;
  const base = seed.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
  return Array.from({ length: rows * cols }, (_, i) => {
    const x = i % cols, y = Math.floor(i / cols);
    const dx = x - cols / 2, dy = y - rows / 2;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const noise =
      Math.sin((x + base * 0.01) * 1.3) *
      Math.cos((y + base * 0.02) * 1.7) *
      Math.sin((x + y) * 0.4);
    const v = 0.75 - dist / 18 + noise * 0.22 - severity * 0.18;
    return Math.max(0, Math.min(1, v));
  });
}

export function StepResults({
  region,
  scenario,
  onPickGenotype,
  onConfirm,
  onBack,
}: {
  region: Region;
  scenario: Scenario;
  onPickGenotype: (g: Genotype) => void;
  onConfirm: () => void;
  onBack: () => void;
}) {
  const seed = `${region.id}-${scenario.ssp}-${scenario.year}`;
  const severity = Math.min(1, scenario.warming / 5);
  const cells = useMemo(() => makeHeatmap(seed, severity), [seed, severity]);
  const genotypes = useMemo(() => makeGenotypes(seed), [seed]);
  const top = genotypes[0];
  const [hover, setHover] = useState<{ x: number; y: number; v: number } | null>(null);

  const cols = 28;
  const meanYield = cells.reduce((a, b) => a + b, 0) / cells.length;
  const stress = 1 - meanYield;

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_360px] animate-fade-in">
      <div className="glass-strong rounded-3xl p-6">
        <div className="flex items-start justify-between">
          <div>
            <div className="text-xs uppercase tracking-wider text-muted-foreground">
              Step 04 · Results
            </div>
            <h2 className="mt-1 text-2xl font-semibold tracking-tight">
              {region.name} · {scenario.year}
            </h2>
            <p className="text-sm text-muted-foreground">
              {scenario.ssp} · +{scenario.warming.toFixed(1)} °C · {scenario.co2} ppm
            </p>
          </div>
          <span className="rounded-full bg-primary/15 px-3 py-1 text-xs font-medium text-primary">
            ● Inference complete
          </span>
        </div>

        {/* KPIs */}
        <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Kpi icon={TrendingUp} label="Mean yield" value={`${(meanYield * 12).toFixed(1)} t/ha`} tone="primary" />
          <Kpi icon={ShieldAlert} label="Climate stress" value={`${(stress * 100).toFixed(0)}%`} tone="warning" />
          <Kpi icon={Droplets} label="Water deficit" value={`${(severity * 38).toFixed(0)} mm`} tone="accent" />
          <Kpi icon={Leaf} label="Best genotype" value={top.id} tone="violet" />
        </div>

        {/* Heatmap */}
        <div className="relative mt-6 rounded-2xl border border-hairline bg-background/40 p-4">
          <div className="mb-3 flex items-center justify-between">
            <div className="text-xs text-muted-foreground">Predicted yield surface</div>
            <div className="flex items-center gap-2 text-[10px] font-mono text-muted-foreground">
              <span className="h-2 w-4 rounded-sm" style={{ background: "oklch(0.65 0.24 25)" }} />
              low
              <span className="h-2 w-4 rounded-sm" style={{ background: "oklch(0.78 0.18 70)" }} />
              mid
              <span className="h-2 w-4 rounded-sm" style={{ background: "oklch(0.85 0.27 145)" }} />
              high
            </div>
          </div>
          <div
            className="grid gap-1"
            style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}
            onMouseLeave={() => setHover(null)}
          >
            {cells.map((v, i) => {
              const hue = v > 0.55 ? "145" : v > 0.35 ? "70" : "25";
              const chroma = v > 0.55 ? 0.27 : v > 0.35 ? 0.18 : 0.24;
              const light = 0.32 + v * 0.55;
              return (
                <div
                  key={i}
                  onMouseEnter={() =>
                    setHover({ x: i % cols, y: Math.floor(i / cols), v })
                  }
                  className="aspect-square rounded-[3px] transition-transform hover:scale-[1.4] hover:z-10"
                  style={{
                    background: `oklch(${light} ${chroma} ${hue})`,
                    boxShadow: v > 0.65 ? `0 0 6px oklch(${light} ${chroma} ${hue} / 0.7)` : "none",
                  }}
                />
              );
            })}
          </div>
          {hover && (
            <div className="mt-3 flex items-center justify-between rounded-lg bg-panel/60 px-3 py-2 font-mono text-[11px] text-muted-foreground">
              <span>cell ({hover.x}, {hover.y})</span>
              <span>yield index: <span className="text-primary">{hover.v.toFixed(3)}</span></span>
            </div>
          )}
        </div>

        {/* Genotype table */}
        <div className="mt-6">
          <div className="mb-2 flex items-center justify-between">
            <div className="text-sm font-medium">Top genotype recommendations</div>
            <span className="text-[11px] text-muted-foreground">Click for SHAP analysis</span>
          </div>
          <div className="overflow-hidden rounded-2xl border border-hairline">
            <table className="w-full text-sm">
              <thead className="bg-panel/60 text-left text-[11px] uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="px-4 py-2.5">Genotype</th>
                  <th className="px-4 py-2.5">Crop</th>
                  <th className="px-4 py-2.5">Trait</th>
                  <th className="px-4 py-2.5 text-right">Yield</th>
                  <th className="px-4 py-2.5 text-right">Risk</th>
                  <th className="px-4 py-2.5 text-right">Confidence</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {genotypes.map((g, i) => (
                  <tr
                    key={g.id}
                    onClick={() => onPickGenotype(g)}
                    className="group cursor-pointer border-t border-hairline transition-colors hover:bg-panel-2/60"
                  >
                    <td className="px-4 py-3 font-mono text-primary">{g.id}</td>
                    <td className="px-4 py-3">{g.name}</td>
                    <td className="px-4 py-3 text-muted-foreground">{g.trait}</td>
                    <td className="px-4 py-3 text-right font-mono">{g.yield.toFixed(2)} t/ha</td>
                    <td className="px-4 py-3 text-right">
                      <RiskPill v={g.risk} />
                    </td>
                    <td className="px-4 py-3 text-right font-mono text-muted-foreground">
                      {(g.confidence * 100).toFixed(1)}%
                    </td>
                    <td className="px-3 py-3 text-muted-foreground">
                      <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="mt-6 flex justify-between">
          <button onClick={onBack} className="rounded-xl glass px-4 py-2 text-sm hover:bg-panel-2">
            ← Re-configure
          </button>
          <button
            onClick={onConfirm}
            className="rounded-xl bg-primary px-5 py-2 text-sm font-medium text-primary-foreground neon-glow"
          >
            Generate breeding blueprint →
          </button>
        </div>
      </div>

      {/* Side: Top recommendation */}
      <div className="glass rounded-3xl p-6">
        <div className="text-xs uppercase tracking-wider text-muted-foreground">
          Recommended genotype
        </div>
        <div className="mt-2 flex items-center gap-2">
          <span className="font-mono text-primary text-lg">{top.id}</span>
          <span className="rounded-full bg-panel-2 px-2 py-0.5 text-[10px] text-muted-foreground">
            {top.trait}
          </span>
        </div>
        <div className="text-sm text-muted-foreground">{top.name}</div>

        <Bar label="Predicted yield" v={top.yield / 12} display={`${top.yield.toFixed(2)} t/ha`} tone="primary" />
        <Bar label="Climate resilience" v={top.water} display={`${(top.water * 100).toFixed(0)}%`} tone="accent" />
        <Bar label="Risk index" v={top.risk} display={top.risk.toFixed(2)} tone="warning" inverse />
        <Bar label="Model confidence" v={top.confidence} display={`${(top.confidence * 100).toFixed(1)}%`} tone="violet" />

        <button
          onClick={() => onPickGenotype(top)}
          className="mt-6 w-full rounded-xl glass py-2.5 text-sm font-medium hover:bg-panel-2"
        >
          Open deep analysis
        </button>
      </div>
    </div>
  );
}

function Kpi({
  icon: Icon, label, value, tone,
}: { icon: React.ComponentType<{ className?: string }>; label: string; value: string; tone: "primary" | "accent" | "warning" | "violet" }) {
  const color =
    tone === "primary" ? "text-primary"
    : tone === "accent" ? "text-accent"
    : tone === "warning" ? "text-warning"
    : "text-violet";
  return (
    <div className="rounded-2xl border border-hairline bg-panel/40 p-4">
      <div className="flex items-center gap-2 text-[11px] uppercase tracking-wider text-muted-foreground">
        <Icon className={`h-3.5 w-3.5 ${color}`} />
        {label}
      </div>
      <div className={`mt-2 font-mono text-xl ${color}`}>{value}</div>
    </div>
  );
}

function RiskPill({ v }: { v: number }) {
  const tone = v < 0.2 ? ["bg-primary/15", "text-primary", "Low"]
    : v < 0.4 ? ["bg-accent/15", "text-accent", "Moderate"]
    : ["bg-destructive/15", "text-destructive", "High"];
  return (
    <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${tone[0]} ${tone[1]}`}>
      {tone[2]} · {v.toFixed(2)}
    </span>
  );
}

function Bar({
  label, v, display, tone, inverse,
}: { label: string; v: number; display: string; tone: "primary" | "accent" | "warning" | "violet"; inverse?: boolean }) {
  const color =
    tone === "primary" ? "var(--primary)"
    : tone === "accent" ? "var(--accent)"
    : tone === "warning" ? "var(--warning)"
    : "var(--violet)";
  return (
    <div className="mt-4">
      <div className="mb-1.5 flex items-center justify-between text-xs">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-mono">{display}</span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-panel-2">
        <div
          className="h-full"
          style={{
            width: `${(inverse ? 1 - v : v) * 100}%`,
            background: `linear-gradient(90deg, ${color}, ${color} 80%, transparent)`,
            boxShadow: `0 0 10px ${color}`,
          }}
        />
      </div>
    </div>
  );
}
