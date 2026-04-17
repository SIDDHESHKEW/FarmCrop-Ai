export function SiteFooter() {
  return (
    <footer className="border-t border-hairline">
      <div className="mx-auto grid max-w-7xl gap-10 px-6 py-14 md:grid-cols-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 rounded-md" style={{ background: "var(--gradient-neon)" }} />
            <span className="text-sm font-semibold">FutureCrop AI</span>
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            Decision intelligence for global agriculture. © {new Date().getFullYear()} CropOracle Labs.
          </p>
        </div>
        {[
          { h: "Product", links: ["Platform", "Models", "API", "Pricing"] },
          { h: "Science", links: ["Publications", "Datasets", "Benchmarks"] },
          { h: "Company", links: ["About", "Careers", "Security", "Press"] },
        ].map((c) => (
          <div key={c.h}>
            <div className="text-xs uppercase tracking-wider text-muted-foreground">{c.h}</div>
            <ul className="mt-3 space-y-2 text-sm">
              {c.links.map((l) => (
                <li key={l}>
                  <a className="text-foreground/80 hover:text-foreground" href="#">{l}</a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </footer>
  );
}
