import { Check } from "lucide-react";

export type StepKey =
  | "region"
  | "scenario"
  | "simulate"
  | "results"
  | "analysis"
  | "confirm";

export const STEPS: { key: StepKey; label: string; index: number }[] = [
  { key: "region", label: "Region", index: 1 },
  { key: "scenario", label: "Scenario", index: 2 },
  { key: "simulate", label: "Simulate", index: 3 },
  { key: "results", label: "Results", index: 4 },
  { key: "analysis", label: "Analysis", index: 5 },
  { key: "confirm", label: "Confirm", index: 6 },
];

export function Stepper({ current }: { current: StepKey }) {
  const currentIdx = STEPS.findIndex((s) => s.key === current);
  return (
    <div className="glass flex items-center gap-1 rounded-2xl p-1.5">
      {STEPS.map((s, i) => {
        const done = i < currentIdx;
        const active = i === currentIdx;
        return (
          <div key={s.key} className="flex items-center">
            <div
              className={`flex items-center gap-2 rounded-xl px-3 py-2 text-xs transition-all ${
                active
                  ? "bg-primary/15 text-primary"
                  : done
                    ? "text-foreground"
                    : "text-muted-foreground"
              }`}
            >
              <span
                className={`flex h-5 w-5 items-center justify-center rounded-full font-mono text-[10px] ${
                  active
                    ? "bg-primary text-primary-foreground neon-glow"
                    : done
                      ? "bg-primary/20 text-primary"
                      : "bg-panel-2 text-muted-foreground"
                }`}
              >
                {done ? <Check className="h-3 w-3" /> : s.index}
              </span>
              <span className="hidden sm:inline">{s.label}</span>
            </div>
            {i < STEPS.length - 1 && (
              <span className="mx-1 h-px w-4 bg-hairline sm:w-6" />
            )}
          </div>
        );
      })}
    </div>
  );
}
