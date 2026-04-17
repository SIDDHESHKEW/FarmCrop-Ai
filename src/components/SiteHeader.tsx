import { Link } from "@tanstack/react-router";
import { Sparkles } from "lucide-react";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 w-full">
      <div className="mx-auto max-w-7xl px-6 pt-4">
        <div className="glass flex h-14 items-center justify-between rounded-2xl px-4">
          <Link to="/" className="flex items-center gap-2">
            <div
              className="flex h-7 w-7 items-center justify-center rounded-lg"
              style={{ background: "var(--gradient-neon)" }}
            >
              <Sparkles className="h-4 w-4 text-background" strokeWidth={2.5} />
            </div>
            <div className="flex flex-col leading-none">
              <span className="text-sm font-semibold tracking-tight">FutureCrop AI</span>
              <span className="text-[10px] text-muted-foreground">CropOracle Platform</span>
            </div>
          </Link>

          <nav className="hidden items-center gap-7 text-sm text-muted-foreground md:flex">
            <a href="#product" className="hover:text-foreground transition-colors">Product</a>
            <a href="#science" className="hover:text-foreground transition-colors">Science</a>
            <a href="#enterprise" className="hover:text-foreground transition-colors">Enterprise</a>
            <a href="#docs" className="hover:text-foreground transition-colors">Docs</a>
          </nav>

          <div className="flex items-center gap-2">
            <span className="hidden h-2 w-2 rounded-full bg-primary shadow-[0_0_10px_var(--primary)] sm:block animate-glow-pulse" />
            <span className="hidden text-xs text-muted-foreground sm:block">Mainnet · v2.4</span>
            <Link
              to="/app"
              className="inline-flex h-9 items-center rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground transition-transform hover:scale-[1.02] neon-glow"
            >
              Launch App
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
