import type { Genotype } from "./StepResults";
import {
  Bar, BarChart, PolarAngleAxis, PolarGrid, PolarRadiusAxis,
  Radar, RadarChart, ResponsiveContainer, Tooltip, XAxis, YAxis,
  ReferenceLine, Cell,
} from "recharts";

export function StepAnalysis({
  genotype, onBack, onConfirm,
}: { genotype: Genotype; onBack: () => void; onConfirm: () => void }) {
  const radar = [
    { feature: "Yield", v: (genotype.yield / 12) * 100 },
    { feature: "Drought", v: genotype.water * 100 },
    { feature: "Heat", v: 50 + (1 - genotype.risk) * 40 },
    { feature: "Disease", v: 60 + genotype.confidence * 30 },
    { feature: "Nitrogen", v: 55 + genotype.water * 30 },
    { feature: "Maturity", v: 70 - genotype.risk * 30 },
  ];

  const shap = [
    { f: "Soil moisture", v: 0.42 },
    { f: "Heat days >35°C", v: -0.31 },
    { f: "CO₂ fertilization", v: 0.27 },
    { f: "Genotype × env", v: 0.21 },
    { f: "Nitrogen flux", v: 0.16 },
    { f: "Pest pressure", v: -0.14 },
    { f: "Solar radiation", v: 0.11 },
    { f: "Salinity", v: -0.08 },
  ];

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_360px] animate-fade-in">
      <div className="glass-strong rounded-3xl p-6">
        <div className="flex items-start justify-between">
          <div>
            <div className="text-xs uppercase tracking-wider text-muted-foreground">
              Step 05 · Deep analysis
            </div>
            <h2 className="mt-1 text-2xl font-semibold tracking-tight">
              <span className="font-mono text-primary">{genotype.id}</span> · {genotype.name}
            </h2>
            <p className="text-sm text-muted-foreground">{genotype.trait} · explainability report</p>
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
            <div className="h-[260px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={shap} layout="vertical" margin={{ left: 8, right: 16 }}>
                  <XAxis
                    type="number"
                    domain={[-0.5, 0.5]}
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

        <div className="mt-6 flex justify-between">
          <button onClick={onBack} className="rounded-xl glass px-4 py-2 text-sm hover:bg-panel-2">
            ← Back to results
          </button>
          <button
            onClick={onConfirm}
            className="rounded-xl bg-primary px-5 py-2 text-sm font-medium text-primary-foreground neon-glow"
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
