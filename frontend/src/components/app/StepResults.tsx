import type { Region, Scenario } from "@/lib/futurecrop-data";
import { ChevronRight, Leaf, TrendingUp } from "lucide-react";
import { useMemo } from "react";

export type Genotype = {
  id: string;
  name: string;
  yield: number; // t/ha
  risk: number; // 0-1
  water: number; // 0-1 resilience
  confidence: number; // 0-1
  trait: string;
};

type PredictionItem = {
  id: string;
  yield_estimate: number;
  confidence: number;
};

export function StepResults({
  predictions = [],
  region,
  scenario,
  onPickGenotype,
  onConfirm,
  onBack,
}: {
  predictions?: PredictionItem[];
  region: Region;
  scenario: Scenario;
  onPickGenotype: (g: Genotype) => void;
  onConfirm: () => void;
  onBack: () => void;
}) {
  const realData = useMemo<PredictionItem[]>(() => predictions, [predictions]);

  const genotypes = useMemo<Genotype[]>(
    () => realData.map((g, i) => ({
      id: g.id,
      name: `Genotype ${i + 1}`,
      trait: "Backend prediction",
      yield: g.yield_estimate,
      risk: Math.max(0, Math.min(1, 1 - g.confidence)),
      water: Math.max(0, Math.min(1, g.confidence)),
      confidence: g.confidence,
    })),
    [realData],
  );

  const bestPrediction = useMemo<PredictionItem | null>(() => {
    if (realData.length === 0) return null;
    return realData.reduce((a, b) =>
      a.yield_estimate > b.yield_estimate ? a : b,
    );
  }, [realData]);

  const bestGenotype = useMemo(() => (bestPrediction ? bestPrediction.id : "-"), [bestPrediction]);

  const meanYield = useMemo(() => {
    if (realData.length === 0) return "0.00";
    const avg = realData.reduce((sum, g) => sum + g.yield_estimate, 0) / realData.length;
    return avg.toFixed(2);
  }, [realData]);

  const top = useMemo(() => {
    if (!bestPrediction) return null;
    return genotypes.find((g) => g.id === bestPrediction.id) ?? null;
  }, [bestPrediction, genotypes]);

  if (realData.length === 0) {
    return (
      <div className="grid gap-6 lg:grid-cols-[1fr_360px] animate-fade-in">
        <div className="glass-strong rounded-3xl p-6">
          <div className="flex items-start justify-between">
            <div>
              <div className="text-xs uppercase tracking-wider text-muted-foreground">
                Step 05 · Results
              </div>
              <h2 className="mt-1 text-2xl font-semibold tracking-tight">
                {region.name} · {scenario.year}
              </h2>
              <p className="text-sm text-muted-foreground">
                {scenario.name} · +{scenario.temperatureDelta.toFixed(1)} °C · {scenario.rainfallChange.toFixed(0)}% rain · {scenario.co2} ppm
              </p>
            </div>
          </div>

          <div className="mt-6 rounded-2xl border border-hairline bg-panel/40 p-5 text-sm text-muted-foreground">
            No data available
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
      </div>
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_360px] animate-fade-in">
      <div className="glass-strong rounded-3xl p-6">
        <div className="flex items-start justify-between">
          <div>
            <div className="text-xs uppercase tracking-wider text-muted-foreground">
              Step 05 · Results
            </div>
            <h2 className="mt-1 text-2xl font-semibold tracking-tight">
              {region.name} · {scenario.year}
            </h2>
            <p className="text-sm text-muted-foreground">
              {scenario.name} · +{scenario.temperatureDelta.toFixed(1)} °C · {scenario.rainfallChange.toFixed(0)}% rain · {scenario.co2} ppm
            </p>
          </div>
          <span className="rounded-full bg-primary/15 px-3 py-1 text-xs font-medium text-primary">
            ● Inference complete
          </span>
        </div>

        {/* KPIs */}
        <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Kpi icon={TrendingUp} label="Mean yield" value={`${meanYield} t/ha`} tone="primary" />
          <Kpi icon={Leaf} label="Best genotype" value={bestGenotype} tone="violet" />
          <Kpi icon={TrendingUp} label="Predictions" value={`${realData.length}`} tone="accent" />
          <Kpi icon={TrendingUp} label="Top confidence" value={`${(Math.max(...realData.map((g) => g.confidence)) * 100).toFixed(1)}%`} tone="warning" />
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
                  <th className="px-4 py-2.5 text-right">Yield</th>
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
                    <td className="px-4 py-3 text-right font-mono">{g.yield.toFixed(2)} t/ha</td>
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
      {top && (
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

          <Bar label="Predicted yield" v={Math.min(top.yield / 12, 1)} display={`${top.yield.toFixed(2)} t/ha`} tone="primary" />
          <Bar label="Model confidence" v={top.confidence} display={`${(top.confidence * 100).toFixed(1)}%`} tone="violet" />

          <button
            onClick={() => onPickGenotype(top)}
            className="mt-6 w-full rounded-xl glass py-2.5 text-sm font-medium hover:bg-panel-2"
          >
            Open deep analysis
          </button>
        </div>
      )}
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
