export function NeuralGrid() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {/* Hero radial wash */}
      <div
        className="absolute inset-0"
        style={{ background: "var(--gradient-hero)" }}
      />
      {/* Animated grid */}
      <div className="absolute inset-0 grid-bg animate-grid-flow opacity-60" />
      {/* Scanline fade */}
      <div
        className="absolute inset-x-0 bottom-0 h-1/2"
        style={{
          background:
            "linear-gradient(to bottom, transparent, var(--background) 90%)",
        }}
      />
      {/* Floating orbs */}
      <div
        className="absolute left-[10%] top-[20%] h-64 w-64 rounded-full blur-3xl animate-float"
        style={{ background: "oklch(0.88 0.27 145 / 0.18)" }}
      />
      <div
        className="absolute right-[12%] top-[35%] h-72 w-72 rounded-full blur-3xl animate-float"
        style={{
          background: "oklch(0.72 0.22 295 / 0.18)",
          animationDelay: "1.5s",
        }}
      />
      <div
        className="absolute left-[40%] top-[60%] h-56 w-56 rounded-full blur-3xl animate-float"
        style={{
          background: "oklch(0.85 0.16 200 / 0.15)",
          animationDelay: "3s",
        }}
      />
      <div className="absolute inset-0 noise opacity-50" />
    </div>
  );
}
