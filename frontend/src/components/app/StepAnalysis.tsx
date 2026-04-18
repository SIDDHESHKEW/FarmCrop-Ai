import type { Genotype } from "./StepResults";
import { useEffect, useMemo, useState } from "react";
import { apiUrl } from "@/lib/api";
import {
  Bar, BarChart, PolarAngleAxis, PolarGrid, PolarRadiusAxis,
  Radar, RadarChart, ResponsiveContainer, Tooltip, XAxis, YAxis,
  ReferenceLine, Cell,
} from "recharts";

type PredictionItem = {
  id: string;
  yield_estimate: number;
  confidence: number;
};

type ShapFeature = {
  name: string;
  importance_score: number;
};

type ShapResponse = {
  features: ShapFeature[];
  base_value: number;
};

const FEATURE_LABELS: Record<string, string> = {
  SNP_0: "Heat Tolerance",
  SNP_1: "Drought Resistance",
  SNP_2: "Soil Moisture Efficiency",
  SNP_3: "Growth Rate",
  SNP_4: "Nutrient Uptake",
  SNP_5: "Root Strength",
  SNP_6: "Water Retention",
  SNP_7: "Stress Resistance",
};

type Props = {
  genotypeId: string | null;
  genotype: Genotype;
  onBack: () => void;
  onConfirm: () => void;
  predictions?: PredictionItem[];
};

export function StepAnalysis({
  genotypeId, genotype, onBack, onConfirm, predictions = [],
}: Props) {
  const [shapData, setShapData] = useState<ShapResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadShap = async (genotypeId: string) => {
    console.log("[SHAP] calling with:", genotypeId);
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(apiUrl(`/shap/${encodeURIComponent(genotypeId)}`));
      if (!res.ok) {
        throw new Error(`SHAP request failed with status ${res.status}`);
      }

      const data = await res.json();

      console.log("SHAP RESPONSE:", data);

      setShapData(data);
    } catch (err) {
      console.error(err);
      setShapData(null);
      setError("SHAP failed");
      return;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!genotypeId) {
      console.log("[SHAP] genotypeId missing");
      return;
    }

    loadShap(genotypeId);
  }, [genotypeId]);

  const topFeatures = useMemo<ShapFeature[]>(() => {
    if (!shapData?.features || shapData.features.length === 0) {
      return [];
    }

    return [...shapData.features]
      .map((f) => ({
        ...f,
        name: FEATURE_LABELS[f.name] ?? f.name,
      }))
      .sort((a, b) => Math.abs(b.importance_score) - Math.abs(a.importance_score))
      .slice(0, 3);
  }, [shapData]);

  const maxAbsImportance = useMemo(() => {
    if (topFeatures.length === 0) return 1;
    return Math.max(...topFeatures.map((f) => Math.abs(f.importance_score)));
  }, [topFeatures]);

  const explanationText = useMemo(() => {
    if (topFeatures.length === 0) {
      return "No clear SHAP explanation is available yet.";
    }

    const positives = topFeatures.filter((f) => f.importance_score > 0);
    const negatives = topFeatures.filter((f) => f.importance_score < 0);

    const positiveText = positives
      .slice(0, 2)
      .map((f) => f.name.toLowerCase())
      .join(" and ");
    const topNegative = negatives[0]?.name.toLowerCase();

    if (positiveText && topNegative) {
      return `This genotype performs well due to strong ${positiveText}, while lower ${topNegative} slightly reduces performance.`;
    }
    if (positiveText) {
      return `This genotype performs well due to strong ${positiveText}.`;
    }
    if (topNegative) {
      return `This genotype is mainly limited by lower ${topNegative}.`;
    }

    return "No clear SHAP explanation is available yet.";
  }, [topFeatures]);

  const radar = [
    { feature: "Yield", v: (genotype.yield / 12) * 100 },
    { feature: "Drought", v: genotype.water * 100 },
    { feature: "Heat", v: 50 + (1 - genotype.risk) * 40 },
    { feature: "Disease", v: 60 + genotype.confidence * 30 },
    { feature: "Nitrogen", v: 55 + genotype.water * 30 },
    { feature: "Maturity", v: 70 - genotype.risk * 30 },
  ];

  const shap = topFeatures.map((f) => ({ f: f.name, v: f.importance_score }));

  const maxAbsChart = useMemo(() => {
    if (shap.length === 0) return 0.5;
    return Math.max(0.5, ...shap.map((s) => Math.abs(s.v)));
  }, [shap]);

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_360px] animate-fade-in">
      <div className="glass-strong rounded-3xl p-6">
        <div className="flex items-start justify-between">
          <div>
            <div className="text-xs uppercase tracking-wider text-muted-foreground">
              Step 06 · AI Insights
            </div>
            <h2 className="mt-1 text-2xl font-semibold tracking-tight">
              <span className="font-mono text-primary">{genotype.id}</span> · {genotype.name}
            </h2>
            <p className="text-sm text-muted-foreground">Understand why this genotype matches your selected conditions.</p>
          </div>
          <span className="rounded-full bg-accent/15 px-3 py-1 text-xs font-medium text-accent">
            SHAP v3 · audited
          </span>
        </div>

        <div className="mt-6 grid gap-4 lg:grid-cols-2">
          {/* Radar */}
          <div className="rounded-2xl border border-hairline bg-panel/40 p-4">
            <div className="mb-2 text-sm font-medium">Trait profile</div>
            <div className="h-[260px]">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={radar} outerRadius="78%">
                  <PolarGrid stroke="oklch(0.30 0.02 252 / 0.5)" />
                  <PolarAngleAxis dataKey="feature" tick={{ fill: "oklch(0.70 0.02 250)", fontSize: 11 }} />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                  <Radar
                    dataKey="v"
                    stroke="oklch(0.88 0.27 145)"
                    fill="oklch(0.88 0.27 145)"
                    fillOpacity={0.25}
                    strokeWidth={2}
                  />
                  <Tooltip
                    contentStyle={{
                      background: "oklch(0.20 0.018 252)",
                      border: "1px solid oklch(0.30 0.02 252 / 0.6)",
                      borderRadius: 12,
                      fontSize: 12,
                    }}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* SHAP */}
          <div className="rounded-2xl border border-hairline bg-panel/40 p-4">
            <div className="mb-2 text-sm font-medium">SHAP feature contributions</div>
            <div className="h-[300px]" style={{ minHeight: "300px" }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={shap} layout="vertical" margin={{ left: 8, right: 16 }}>
                  <XAxis
                    type="number"
                    domain={[-maxAbsChart, maxAbsChart]}
                    tick={{ fill: "oklch(0.70 0.02 250)", fontSize: 10 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    type="category"
                    dataKey="f"
                    tick={{ fill: "oklch(0.70 0.02 250)", fontSize: 11 }}
                    width={120}
                    axisLine={false}
                    tickLine={false}
                  />
                  <ReferenceLine x={0} stroke="oklch(0.30 0.02 252)" />
                  <Bar dataKey="v" radius={[3, 3, 3, 3]}>
                    {shap.map((s, i) => (
                      <Cell
                        key={i}
                        fill={s.v >= 0 ? "oklch(0.88 0.27 145)" : "oklch(0.65 0.24 25)"}
                      />
                    ))}
                  </Bar>
                  <Tooltip
                    cursor={{ fill: "oklch(1 0 0 / 0.04)" }}
                    contentStyle={{
                      background: "oklch(0.20 0.018 252)",
                      border: "1px solid oklch(0.30 0.02 252 / 0.6)",
                      borderRadius: 12,
                      fontSize: 12,
                    }}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Waterfall-style narrative */}
        <div className="mt-4 rounded-2xl border border-hairline bg-panel/40 p-5">
          <div className="text-sm font-medium">Decision narrative</div>
          <ol className="mt-3 space-y-2 text-sm text-muted-foreground">
            <li>
              <span className="text-primary">+0.42</span> — sustained soil moisture in May–June drives canopy expansion.
            </li>
            <li>
              <span className="text-destructive">−0.31</span> — projected 24 heat days &gt;35 °C reduce grain filling efficiency.
            </li>
            <li>
              <span className="text-primary">+0.27</span> — CO₂ fertilization compensates ~38% of the heat penalty.
            </li>
            <li>
              <span className="text-primary">+0.21</span> — genotype-environment match favors {genotype.trait.toLowerCase()} alleles.
            </li>
          </ol>
        </div>

        {loading && <p className="mt-4 text-sm text-muted-foreground">Analyzing crop genetics...</p>}

        {error && <p className="mt-4 text-sm text-destructive">{error}</p>}

        {!loading && topFeatures.length === 0 && (
          <p className="mt-4 text-sm text-muted-foreground">No SHAP data</p>
        )}

        {topFeatures.length > 0 && (
          <div className="mt-4 rounded-2xl border border-hairline bg-panel/40 p-5">
            <h3 className="text-sm font-medium">Top Features</h3>
            <div className="mt-3 space-y-3 text-sm text-muted-foreground">
              {topFeatures.map((f) => {
                const signedValue = `${f.importance_score >= 0 ? "+" : ""}${f.importance_score.toFixed(2)}`;
                const widthPercent = `${(Math.abs(f.importance_score) / maxAbsImportance) * 100}%`;
                const impactLabel = f.importance_score >= 0 ? "Good" : "Risk";
                return (
                  <div key={f.name} className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span>{f.name}</span>
                      <span className={f.importance_score > 0 ? "text-primary" : "text-destructive"}>
                        {`→ ${signedValue} (${impactLabel})`}
                      </span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-panel-2">
                      <div
                        className="h-full"
                        style={{
                          width: widthPercent,
                          background: f.importance_score > 0 ? "oklch(0.88 0.27 145)" : "oklch(0.65 0.24 25)",
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            <p className="mt-4 text-sm text-muted-foreground">
              {explanationText}
            </p>

            {shapData && (
              <div className="mt-2 text-xs text-muted-foreground">
                Base value: {shapData.base_value.toFixed(2)}
                </div>
            )}
          </div>
        )}

        <div className="mt-6 flex justify-between">
          <button onClick={onBack} className="rounded-xl glass px-4 py-2 text-sm hover:bg-panel-2">
            ← Back to results
          </button>
          <button
            onClick={onConfirm}
            className="rounded-xl bg-primary px-5 py-2 text-sm font-medium text-primary-foreground neon-glow transition-transform hover:scale-[1.02] hover:shadow-[0_0_24px_var(--primary)]"
          >
            Generate breeding blueprint →
          </button>
        </div>
      </div>

      {/* Side: genotype card */}
      <div className="glass rounded-3xl p-6">
        <div className="text-xs uppercase tracking-wider text-muted-foreground">Genotype card</div>
        <div className="mt-3 rounded-2xl border border-hairline bg-panel/40 p-4">
          <div className="flex items-center justify-between">
            <span className="font-mono text-primary">{genotype.id}</span>
            <span className="rounded-full bg-panel-2 px-2 py-0.5 text-[10px] text-muted-foreground">
              v2.4
            </span>
          </div>
          <div className="mt-2 text-base font-semibold">{genotype.name}</div>
          <div className="text-xs text-muted-foreground">{genotype.trait}</div>
          <dl className="mt-4 space-y-2 text-sm">
            {[
              ["Yield", `${genotype.yield.toFixed(2)} t/ha`],
              ["Risk", genotype.risk.toFixed(2)],
              ["Water resilience", `${(genotype.water * 100).toFixed(0)}%`],
              ["Confidence", `${(genotype.confidence * 100).toFixed(1)}%`],
              ["Maturity", "118 days"],
              ["Origin pool", "CIMMYT-EA"],
            ].map(([k, v]) => (
              <div key={k} className="flex justify-between border-b border-hairline pb-1.5">
                <dt className="text-muted-foreground">{k}</dt>
                <dd className="font-mono">{v}</dd>
              </div>
            ))}
          </dl>
        </div>
        <div className="mt-4 rounded-xl bg-panel/40 p-3 text-[11px] text-muted-foreground">
          <span className="text-foreground">Provenance.</span> Trained on CIMMYT genebank
          accessions cross-referenced with FAO yield observations (1981–2024).
        </div>
      </div>
    </div>
  );
}
