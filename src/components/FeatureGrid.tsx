import { Atom, Brain, Globe2, LineChart, Lock, Microscope } from "lucide-react";

const features = [
  {
    icon: Brain,
    title: "Neural climate engine",
    desc: "Transformer-based ensemble fuses CMIP6, ERA5 and 40 years of in-situ telemetry.",
  },
  {
    icon: Microscope,
    title: "Genotype simulation",
    desc: "Run 12.7M genotypes against future stress profiles in under a second.",
  },
  {
    icon: Atom,
    title: "Physics-informed",
    desc: "Soil hydrology and radiative transfer baked directly into model gradients.",
  },
  {
    icon: LineChart,
    title: "SHAP explainability",
    desc: "Every prediction ships with auditable feature attributions for regulators.",
  },
  {
    icon: Globe2,
    title: "Country-grade scale",
    desc: "Geo-replicated inference for ministries, co-ops and global breeders.",
  },
  {
    icon: Lock,
    title: "Sovereign by default",
    desc: "End-to-end encryption, on-prem deploys, SOC 2 Type II and ISO 27001.",
  },
];

export function FeatureGrid() {
  return (
    <section id="product" className="relative mx-auto max-w-7xl px-6 py-32">
      <div className="mb-16 max-w-2xl">
        <div className="mb-4 inline-flex items-center gap-2 rounded-full glass px-3 py-1 text-xs">
          <span className="h-1.5 w-1.5 rounded-full bg-accent" />
          <span className="text-muted-foreground">The platform</span>
        </div>
        <h2 className="text-4xl font-semibold tracking-tight md:text-5xl" style={{ letterSpacing: "-0.03em" }}>
          A decision engine for the <span className="neon-text">next century of food</span>
        </h2>
        <p className="mt-4 text-muted-foreground">
          Built for scientists, breeders, ministries and operators who need to act on signals years before they show up in the field.
        </p>
      </div>

      <div className="grid gap-px overflow-hidden rounded-3xl bg-hairline md:grid-cols-2 lg:grid-cols-3">
        {features.map((f) => (
          <div
            key={f.title}
            className="group relative bg-panel p-7 transition-colors hover:bg-panel-2"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl glass">
              <f.icon className="h-5 w-5 text-primary" />
            </div>
            <div className="mt-5 text-base font-semibold">{f.title}</div>
            <p className="mt-2 text-sm text-muted-foreground">{f.desc}</p>
            <div
              className="pointer-events-none absolute inset-x-7 bottom-0 h-px opacity-0 transition-opacity group-hover:opacity-100"
              style={{ background: "var(--gradient-neon)" }}
            />
          </div>
        ))}
      </div>
    </section>
  );
}
