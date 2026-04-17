import type { Region, Scenario } from "@/lib/futurecrop-data";
import type { Genotype } from "./StepResults";
import { Check, Download, FileText, ShieldCheck } from "lucide-react";
import { useState } from "react";

export function StepConfirm({
  region, scenario, genotype, onBack, onRestart,
}: {
  region: Region;
  scenario: Scenario;
  genotype: Genotype;
  onBack: () => void;
  onRestart: () => void;
}) {
  const [signed, setSigned] = useState(false);
  const txid = `0x${(region.id + scenario.ssp + genotype.id)
    .split("")
    .reduce((a, c) => a + c.charCodeAt(0), 0)
    .toString(16)
    .padStart(8, "0")}…${genotype.id.slice(-3).toLowerCase()}`;

  return (
    <div className="mx-auto max-w-xl animate-fade-in">
      <div className="glass-strong relative overflow-hidden rounded-3xl">
        <div
          className="pointer-events-none absolute inset-x-0 top-0 h-px"
          style={{ background: "var(--gradient-neon)" }}
        />
        <div className="border-b border-hairline px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="text-xs uppercase tracking-wider text-muted-foreground">
              Step 06 · Confirm
            </div>
            <span className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
              <ShieldCheck className="h-3.5 w-3.5 text-primary" />
              Signed by CropOracle Engine v2.4
            </span>
          </div>
          <h2 className="mt-1 text-xl font-semibold tracking-tight">
            {signed ? "Blueprint generated" : "Confirm breeding blueprint"}
          </h2>
        </div>

        <div className="space-y-5 px-6 py-6">
          {!signed ? (
            <>
              {/* Pseudo "transaction" */}
              <div className="rounded-2xl border border-hairline bg-panel/40 p-5">
                <div className="text-xs uppercase tracking-wider text-muted-foreground">From</div>
                <div className="mt-1 flex items-center justify-between">
                  <div className="text-sm">CropOracle Engine</div>
                  <span className="font-mono text-[11px] text-muted-foreground">v2.4 · mainnet</span>
                </div>
                <div className="my-3 h-px bg-hairline" />
                <div className="text-xs uppercase tracking-wider text-muted-foreground">To</div>
                <div className="mt-1 flex items-center justify-between">
                  <div className="text-sm">{region.name}</div>
                  <span className="font-mono text-[11px] text-muted-foreground">{region.country}</span>
                </div>
              </div>

              <div className="rounded-2xl border border-hairline bg-panel/40 p-5">
                <Row k="Scenario" v={`${scenario.ssp} · ${scenario.year}`} />
                <Row k="Forcing" v={`+${scenario.warming.toFixed(1)} °C · ${scenario.co2} ppm`} />
                <Row k="Recommended genotype" v={genotype.id} mono />
                <Row k="Trait" v={genotype.trait} />
                <Row k="Expected yield" v={`${genotype.yield.toFixed(2)} t/ha`} accent="primary" />
                <Row k="Confidence" v={`${(genotype.confidence * 100).toFixed(1)}%`} />
                <Row k="Audit hash" v={txid} mono last />
              </div>

              <div className="flex items-start gap-3 rounded-2xl border border-hairline bg-panel/20 p-4 text-xs text-muted-foreground">
                <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                <p>
                  This blueprint will be cryptographically signed, recorded in the
                  audit ledger, and delivered as a regulator-ready PDF.
                </p>
              </div>

              <div className="flex gap-3 pt-1">
                <button
                  onClick={onBack}
                  className="flex-1 rounded-xl glass py-2.5 text-sm font-medium hover:bg-panel-2"
                >
                  Reject
                </button>
                <button
                  onClick={() => setSigned(true)}
                  className="flex-1 rounded-xl bg-primary py-2.5 text-sm font-medium text-primary-foreground neon-glow transition-transform hover:scale-[1.01]"
                >
                  Confirm & sign
                </button>
              </div>
            </>
          ) : (
            <div className="text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/15 neon-glow">
                <Check className="h-8 w-8 text-primary" />
              </div>
              <div className="mt-4 text-lg font-semibold">Blueprint signed</div>
              <div className="mt-1 text-xs text-muted-foreground">
                Audit hash <span className="font-mono text-foreground">{txid}</span>
              </div>

              <div className="mt-6 rounded-2xl border border-hairline bg-panel/40 p-4 text-left">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-panel-2">
                    <FileText className="h-5 w-5 text-accent" />
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-medium">
                      blueprint_{region.id}_{scenario.year}.pdf
                    </div>
                    <div className="font-mono text-[11px] text-muted-foreground">
                      4.2 MB · 28 pages · SHAP-included
                    </div>
                  </div>
                  <button className="inline-flex items-center gap-1.5 rounded-lg bg-primary/15 px-3 py-1.5 text-xs font-medium text-primary hover:bg-primary/20">
                    <Download className="h-3.5 w-3.5" /> Download
                  </button>
                </div>
              </div>

              <div className="mt-6 flex gap-3">
                <button
                  onClick={onRestart}
                  className="flex-1 rounded-xl glass py-2.5 text-sm font-medium hover:bg-panel-2"
                >
                  Run new simulation
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Row({
  k, v, mono, accent, last,
}: { k: string; v: string; mono?: boolean; accent?: "primary"; last?: boolean }) {
  return (
    <div className={`flex items-center justify-between py-2 ${last ? "" : "border-b border-hairline"}`}>
      <span className="text-xs text-muted-foreground">{k}</span>
      <span className={`text-sm ${mono ? "font-mono" : ""} ${accent === "primary" ? "text-primary" : ""}`}>
        {v}
      </span>
    </div>
  );
}
