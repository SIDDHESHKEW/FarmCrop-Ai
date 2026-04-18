import { useEffect, useRef, useState } from "react";
import { Cpu, Database, Atom, Brain, Check } from "lucide-react";
import { apiUrl } from "@/lib/api";

type PredictionItem = {
  id: string;
  yield_estimate: number;
  confidence: number;
};

const PHASES = [
  { icon: Database, label: "Loading regional climate tensors", ms: 700 },
  { icon: Atom, label: "Resolving soil hydrology PDEs", ms: 900 },
  { icon: Cpu, label: "Forward-passing 12.7M genotypes", ms: 1100 },
  { icon: Brain, label: "Computing SHAP attributions", ms: 700 },
];

const TOTAL_MS = PHASES.reduce((sum, phase) => sum + phase.ms, 0);
const MIN_SIMULATION_MS = 1800;

const CROP_BREED_LIBRARY: Record<string, string[]> = {
  wheat: ["HD 2967", "PBW 343", "WH 1105", "DBW 187"],
  rice: ["IR64", "Swarna", "Pusa Basmati 1121", "MTU 7029"],
  maize: ["DHM 117", "HQPM 1", "Vivek QPM 9", "Bioseed 9544"],
  cotton: ["Bunny Bt", "RCH 2 Bt", "JKCH 1947", "Suraj"],
  bajra: ["HHB 67", "ICTP 8203", "Raj 171", "ICMH 356"],
  sugarcane: ["Co 0238", "Co 86032", "Co 98014", "CoJ 64"],
};

function getCropBreeds(cropName: string): string[] {
  const key = cropName.trim().toLowerCase();
  const mapped = CROP_BREED_LIBRARY[key];
  if (mapped && mapped.length >= 4) {
    return mapped.slice(0, 4);
  }

  const normalized = cropName.trim() || "Crop";
  return [
    `${normalized} Breed A`,
    `${normalized} Breed B`,
    `${normalized} Breed C`,
    `${normalized} Breed D`,
  ];
}

export function StepSimulate({
  onDone,
  region,
  scenario,
  crop,
  soil,
}: {
  onDone: (predictions: PredictionItem[]) => void;
  region: string;
  scenario: string;
  crop: string;
  soil?: string;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [phase, setPhase] = useState(0);
  const [progress, setProgress] = useState(0);
  const hasAutoStarted = useRef(false);

  const handleRun = async () => {
    const genotypes = getCropBreeds(crop);

    console.log("REGION:", region);
    console.log("SCENARIO:", scenario);
    console.log("CROP:", crop);
    console.log("SOIL:", soil);

    if (!region || !scenario || !crop || genotypes.length === 0) {
      alert("Please select region, scenario and crop first");
      return;
    }

    setLoading(true);
    setError(null);
    setPhase(0);
    setProgress(0);

    const start = Date.now();
    const minDurationPromise = new Promise<void>((resolve) => {
      window.setTimeout(resolve, MIN_SIMULATION_MS);
    });
    const timerId = window.setInterval(() => {
      const elapsed = Date.now() - start;
      const ratio = Math.min(elapsed / TOTAL_MS, 0.95);
      setProgress(ratio);

      let spent = 0;
      let currentPhase = 0;
      for (let i = 0; i < PHASES.length; i++) {
        spent += PHASES[i].ms;
        if (elapsed < spent) {
          currentPhase = i;
          break;
        }
        currentPhase = PHASES.length;
      }
      setPhase(Math.min(currentPhase, PHASES.length));
    }, 120);

    try {
      const requestBody = {
        region,
        scenario,
        soil,
        crop,
        genotypes,
      };

      console.log("PREDICT REQUEST BODY:", requestBody);

      const res = await fetch(apiUrl("/predict"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      if (!res.ok) {
        throw new Error(`Prediction request failed with status ${res.status}`);
      }

      const data = await res.json();
      await minDurationPromise;
      const nextPredictions = Array.isArray(data?.predictions) ? data.predictions : [];

      console.log("PREDICT RESPONSE:", data);
      setProgress(1);
      setPhase(PHASES.length);
      onDone(nextPredictions);
    } catch (err) {
      console.error("ERROR:", err);
      setError("Simulation failed");
      alert("Simulation failed");
    } finally {
      window.clearInterval(timerId);
      setLoading(false);
    }
  };

  useEffect(() => {
    if (hasAutoStarted.current) return;
    hasAutoStarted.current = true;
    void handleRun();
  }, []);

  return (
    <div className="mx-auto max-w-3xl">
      <div className="glass-strong relative overflow-hidden rounded-3xl p-10 animate-fade-in">
        <div
          className="pointer-events-none absolute inset-0 grid-bg opacity-30"
          style={{ animation: "grid-flow 8s linear infinite" }}
        />
        <div className="relative">
          <div className="text-xs uppercase tracking-wider text-muted-foreground">
            Step 04 · Run Simulation
          </div>
          <h2 className="mt-1 text-2xl font-semibold tracking-tight">
            Running CropOracle simulation
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            We are evaluating your selected conditions for a climate-resilient recommendation.
          </p>

          {loading && (
            <p className="mt-2 text-sm text-primary">Running climate simulation...</p>
          )}

          <div className="my-10 flex items-center justify-center">
            <div className="relative h-44 w-44">
              <div
                className="absolute inset-0 rounded-full border-2 border-primary/30 animate-glow-pulse"
                style={{ boxShadow: "0 0 60px oklch(0.88 0.27 145 / 0.4)" }}
              />
              <div
                className="absolute inset-3 rounded-full border border-accent/40"
                style={{ animation: "spin 6s linear infinite" }}
              />
              <div
                className="absolute inset-6 rounded-full border border-violet/40"
                style={{ animation: "spin 4s linear infinite reverse" }}
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className="font-mono text-3xl neon-text">
                    {Math.round(progress * 100)}%
                  </div>
                  <div className="mt-1 text-[10px] uppercase tracking-wider text-muted-foreground">
                    inference
                  </div>
                </div>
              </div>
            </div>
          </div>

          <ul className="space-y-2">
            {PHASES.map((p, i) => {
              const done = i < phase;
              const active = i === phase && loading;
              return (
                <li
                  key={p.label}
                  className={`flex items-center gap-3 rounded-xl border px-4 py-2.5 text-sm transition-all ${
                    active
                      ? "border-primary/40 bg-primary/5"
                      : done
                        ? "border-hairline bg-panel/40"
                        : "border-hairline bg-panel/20 opacity-50"
                  }`}
                >
                  <span
                    className={`flex h-7 w-7 items-center justify-center rounded-lg ${
                      active ? "bg-primary/20 text-primary" : done ? "bg-primary/15 text-primary" : "bg-panel-2 text-muted-foreground"
                    }`}
                  >
                    {done ? <Check className="h-3.5 w-3.5" /> : <p.icon className="h-3.5 w-3.5" />}
                  </span>
                  <span className={done || active ? "text-foreground" : "text-muted-foreground"}>
                    {p.label}
                  </span>
                  {active && (
                    <span className="ml-auto font-mono text-[10px] text-primary">running...</span>
                  )}
                  {done && <span className="ml-auto font-mono text-[10px] text-muted-foreground">ok</span>}
                </li>
              );
            })}
          </ul>

          <div className="mt-6 h-1 overflow-hidden rounded-full bg-panel-2">
            <div
              className="h-full transition-[width] duration-100"
              style={{ width: `${progress * 100}%`, background: "var(--gradient-neon)" }}
            />
          </div>

          <div className="mt-6 flex items-center gap-3">
            {!error && (
              <p className="text-sm text-muted-foreground">
                Simulation started automatically...
              </p>
            )}
            {error && (
              <button
                onClick={handleRun}
                disabled={loading}
                className="rounded-xl bg-primary px-5 py-2 text-sm font-medium text-primary-foreground neon-glow transition-transform hover:scale-[1.02] hover:shadow-[0_0_24px_var(--primary)] disabled:opacity-60"
              >
                {loading ? "Running..." : "Retry Simulation"}
              </button>
            )}
            {error && <p className="text-sm text-destructive">{error}</p>}
          </div>
        </div>
      </div>
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
