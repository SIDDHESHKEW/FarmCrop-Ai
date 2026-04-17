import type { Scenario } from "@/lib/futurecrop-data";
import { Thermometer, Wind, Calendar } from "lucide-react";
import { useMemo, useState } from "react";

const PRESET_SCENARIOS: Array<{
  name: Extract<Scenario["name"], "Extreme Heat Future" | "Moderate Climate Change" | "Sustainable Future">;
  desc: string;
  temperatureDelta: number;
  rainfallChange: number;
  co2: number;
}> = [
  {
    name: "Extreme Heat Future",
    desc: "Higher heat stress and rainfall volatility",
    temperatureDelta: 4.5,
    rainfallChange: -25,
    co2: 680,
  },
  {
    name: "Moderate Climate Change",
    desc: "Balanced warming with moderate emissions",
    temperatureDelta: 2.5,
    rainfallChange: -10,
    co2: 520,
  },
  {
    name: "Sustainable Future",
    desc: "Lower warming and improved stability",
    temperatureDelta: 1.2,
    rainfallChange: 5,
    co2: 410,
  },
];

export function StepScenario({
  scenario,
  onChange,
  onNext,
  onBack,
}: {
  scenario: Scenario;
  onChange: (s: Scenario) => void;
  onNext: (s: Scenario) => void;
  onBack: () => void;
}) {
  const [useCustomScenario, setUseCustomScenario] = useState(false);

  const applyPreset = (name: Extract<Scenario["name"], "Extreme Heat Future" | "Moderate Climate Change" | "Sustainable Future">) => {
    const preset = PRESET_SCENARIOS.find((o) => o.name === name);
    if (!preset) return;
    onChange({
      ...scenario,
      name: preset.name,
      temperatureDelta: preset.temperatureDelta,
      rainfallChange: preset.rainfallChange,
      co2: preset.co2,
    });
  };

  const activeScenario = useMemo<Scenario>(() => {
    if (!useCustomScenario) {
      return scenario;
    }
    return { ...scenario, name: "Custom Scenario" };
  }, [scenario, useCustomScenario]);

  const updateScenario = (patch: Partial<Scenario>) => {
    onChange({ ...scenario, ...patch });
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
      <div className="glass-strong rounded-3xl p-6 animate-fade-in">
        <div className="text-xs uppercase tracking-wider text-muted-foreground">
          Step 02 · Climate scenario
        </div>
        <h2 className="mt-1 text-2xl font-semibold tracking-tight">
          Configure climate trajectory
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Build a scenario with predefined templates or custom forcing controls.
        </p>

        <label className="mt-4 inline-flex items-center gap-2 text-sm text-muted-foreground">
          <input
            type="checkbox"
            checked={useCustomScenario}
            onChange={(e) => setUseCustomScenario(e.target.checked)}
            className="h-4 w-4 accent-[oklch(0.88_0.27_145)]"
          />
          Use Custom Scenario
        </label>

        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          {PRESET_SCENARIOS.map((o) => {
            const active = !useCustomScenario && scenario.name === o.name;
            return (
              <button
                key={o.name}
                onClick={() => applyPreset(o.name)}
                disabled={useCustomScenario}
                className={`rounded-2xl border p-4 text-left transition-all ${
                  active
                    ? "border-primary/50 bg-primary/5 neon-glow"
                    : "border-hairline bg-panel/40 hover:bg-panel-2"
                } disabled:opacity-40`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs text-muted-foreground">Preset</span>
                  <span
                    className={`h-2 w-2 rounded-full ${
                      active ? "bg-primary shadow-[0_0_10px_var(--primary)]" : "bg-panel-2"
                    }`}
                  />
                </div>
                <div className="mt-2 text-base font-semibold">{o.name}</div>
                <div className="text-xs text-muted-foreground">{o.desc}</div>
                <div className="mt-3 flex items-center gap-3 text-[11px] font-mono">
                  <span className="text-warning">+{o.temperatureDelta.toFixed(1)}°C</span>
                  <span className="text-muted-foreground">{o.rainfallChange}% rain</span>
                  <span className="text-muted-foreground">{o.co2} ppm</span>
                </div>
              </button>
            );
          })}
        </div>

        <div className="mt-6 rounded-2xl border border-hairline bg-panel/40 p-5">
          <div className="mb-4 grid gap-4 sm:grid-cols-2">
            <div>
              <div className="flex items-center justify-between text-sm">
                <span>Temperature Increase (°C)</span>
                <span className="font-mono text-warning">+{activeScenario.temperatureDelta.toFixed(1)}</span>
              </div>
              <input
                type="range"
                min={0}
                max={5}
                step={0.1}
                value={scenario.temperatureDelta}
                onChange={(e) => updateScenario({ temperatureDelta: Number(e.target.value) })}
                className="mt-2 w-full accent-[oklch(0.88_0.27_145)]"
              />
            </div>

            <div>
              <div className="flex items-center justify-between text-sm">
                <span>Rainfall Change (%)</span>
                <span className="font-mono text-accent">{activeScenario.rainfallChange.toFixed(0)}%</span>
              </div>
              <input
                type="range"
                min={-50}
                max={50}
                step={1}
                value={scenario.rainfallChange}
                onChange={(e) => updateScenario({ rainfallChange: Number(e.target.value) })}
                className="mt-2 w-full accent-[oklch(0.88_0.27_145)]"
              />
            </div>
          </div>

          <div className="mb-4">
            <div className="flex items-center justify-between text-sm">
              <span>CO₂ Level (ppm)</span>
              <span className="font-mono">{activeScenario.co2}</span>
            </div>
            <input
              type="range"
              min={350}
              max={700}
              step={1}
              value={scenario.co2}
              onChange={(e) => updateScenario({ co2: Number(e.target.value) })}
              className="mt-2 w-full accent-[oklch(0.88_0.27_145)]"
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="h-4 w-4 text-accent" />
              <span>Projection year</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-lg neon-text">{activeScenario.year}</span>
              <input
                type="number"
                min={2025}
                max={2100}
                value={scenario.year}
                onChange={(e) => {
                  const value = Number(e.target.value);
                  if (Number.isNaN(value)) return;
                  updateScenario({ year: Math.max(2025, Math.min(2100, value)) });
                }}
                className="w-24 rounded-lg border border-hairline bg-panel/40 px-2 py-1 text-right text-xs outline-none"
              />
            </div>
          </div>
          <input
            type="range"
            min={2025}
            max={2100}
            step={1}
            value={scenario.year}
            onChange={(e) => updateScenario({ year: Number(e.target.value) })}
            className="mt-4 w-full accent-[oklch(0.88_0.27_145)]"
            style={{ height: 4 }}
          />
          <div className="mt-1 flex justify-between font-mono text-[10px] text-muted-foreground">
            <span>2025</span><span>2050</span><span>2075</span><span>2100</span>
          </div>
        </div>

        <div className="mt-3 flex justify-between">
          <button
            onClick={onBack}
            className="rounded-xl glass px-4 py-2 text-sm hover:bg-panel-2"
          >
            ← Back
          </button>
          <button
            onClick={() => onNext(activeScenario)}
            className="rounded-xl bg-primary px-5 py-2 text-sm font-medium text-primary-foreground neon-glow"
          >
            Choose crop →
          </button>
        </div>
      </div>

      <div className="glass rounded-3xl p-6 animate-fade-in">
        <div className="text-xs uppercase tracking-wider text-muted-foreground">Forcing summary</div>
        <div className="mt-2 text-sm font-medium">{activeScenario.name}</div>
        <div className="mt-4 space-y-4">
          <Stat icon={Thermometer} label="Temperature increase" value={`+${activeScenario.temperatureDelta.toFixed(1)} °C`} accent="text-warning" />
          <Stat icon={Wind} label="Rainfall change" value={`${activeScenario.rainfallChange.toFixed(0)}%`} accent="text-accent" />
          <Stat icon={Wind} label="Atmospheric CO₂" value={`${activeScenario.co2} ppm`} accent="text-accent" />
          <Stat icon={Calendar} label="Horizon" value={`${activeScenario.year}`} accent="text-foreground" />
        </div>
        <div className="mt-6 rounded-xl bg-panel/40 p-4 text-xs text-muted-foreground">
          <span className="text-foreground">Note.</span> Forcing values derived from CMIP6
          ensemble means and downscaled with our 4-km regional model.
        </div>
      </div>
    </div>
  );
}

function Stat({
  icon: Icon, label, value, accent,
}: { icon: React.ComponentType<{ className?: string }>; label: string; value: string; accent: string }) {
  return (
    <div className="flex items-center justify-between border-b border-hairline pb-3">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Icon className="h-4 w-4" />
        <span>{label}</span>
      </div>
      <span className={`font-mono ${accent}`}>{value}</span>
    </div>
  );
}
