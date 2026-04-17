import { useEffect, useRef, useState } from "react";
import { Bot, Send, Sparkles, X } from "lucide-react";

type Msg = { role: "user" | "ai"; text: string };

const SUGGESTIONS = [
  "Why is Z-7421 ranked first?",
  "Compare drought vs heat risk",
  "Show SHAP for soil moisture",
  "What if I shift to SSP1-1.9?",
];

const RESPONSES: Record<string, string> = {
  default:
    "I cross-referenced your scenario with 12.7M genotype trajectories. Z-7421 wins on a 3-way tradeoff: high yield (9.4 t/ha), low risk (0.12), and 78% water resilience under +2.7°C warming.",
  "Why is Z-7421 ranked first?":
    "Z-7421 maximizes the joint posterior over yield and resilience. Its allele profile favors deep-rooting traits, which buffers against the 24 projected heat days >35°C in your region.",
  "Compare drought vs heat risk":
    "Drought stress contributes 0.21 to risk; heat stress 0.18. Drought dominates because soil moisture variance grows non-linearly past +2°C.",
  "Show SHAP for soil moisture":
    "Soil moisture is the largest positive driver at +0.42. It primarily acts during the May–June canopy expansion window.",
  "What if I shift to SSP1-1.9?":
    "Switching to SSP1-1.9 reduces warming to +1.4°C, raising mean yield by ~17% and lowering risk index from 0.34 to 0.19. Want me to re-run?",
};

export function AIAssistant() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([
    { role: "ai", text: "I'm CropOracle AI. Ask me anything about your simulation — I'll explain predictions, surface tradeoffs, and propose alternatives." },
  ]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: 9e9, behavior: "smooth" });
  }, [messages, typing]);

  function send(text: string) {
    if (!text.trim()) return;
    const userMsg: Msg = { role: "user", text };
    setMessages((m) => [...m, userMsg]);
    setInput("");
    setTyping(true);
    setTimeout(() => {
      const reply = RESPONSES[text] ?? RESPONSES.default;
      setTyping(false);
      // Stream effect
      let i = 0;
      setMessages((m) => [...m, { role: "ai", text: "" }]);
      const id = setInterval(() => {
        i += 2;
        setMessages((m) => {
          const next = [...m];
          next[next.length - 1] = { role: "ai", text: reply.slice(0, i) };
          return next;
        });
        if (i >= reply.length) clearInterval(id);
      }, 18);
    }, 700);
  }

  return (
    <>
      {/* FAB */}
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 z-40 flex h-12 items-center gap-2 rounded-full bg-primary px-4 text-sm font-medium text-primary-foreground neon-glow transition-transform hover:scale-105"
      >
        <Sparkles className="h-4 w-4" />
        Ask AI
      </button>

      {/* Side panel */}
      <div
        className={`fixed inset-0 z-50 transition-opacity ${open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}
      >
        <div
          onClick={() => setOpen(false)}
          className={`absolute inset-0 bg-background/60 backdrop-blur-sm transition-opacity ${open ? "opacity-100" : "opacity-0"}`}
        />
        <aside
          className={`absolute right-0 top-0 flex h-full w-full max-w-md flex-col border-l border-hairline bg-panel transition-transform duration-300 ${
            open ? "translate-x-0" : "translate-x-full"
          }`}
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-hairline px-5 py-4">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl" style={{ background: "var(--gradient-violet)" }}>
                <Bot className="h-4 w-4 text-background" />
              </div>
              <div>
                <div className="text-sm font-semibold">CropOracle AI</div>
                <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                  <span className="h-1.5 w-1.5 rounded-full bg-primary animate-glow-pulse" />
                  Context-aware · v2.4
                </div>
              </div>
            </div>
            <button onClick={() => setOpen(false)} className="rounded-lg p-2 hover:bg-panel-2">
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Messages */}
          <div ref={scrollRef} className="flex-1 space-y-4 overflow-y-auto scrollbar-thin px-5 py-5">
            {messages.map((m, i) => (
              <div
                key={i}
                className={`flex ${m.role === "user" ? "justify-end" : "justify-start"} animate-fade-in`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm ${
                    m.role === "user"
                      ? "bg-primary/15 text-foreground"
                      : "glass text-foreground"
                  }`}
                >
                  {m.text || <span className="opacity-50">…</span>}
                </div>
              </div>
            ))}
            {typing && (
              <div className="flex justify-start">
                <div className="glass flex gap-1 rounded-2xl px-4 py-3">
                  <span className="h-1.5 w-1.5 rounded-full bg-primary animate-glow-pulse" />
                  <span className="h-1.5 w-1.5 rounded-full bg-primary animate-glow-pulse" style={{ animationDelay: "0.2s" }} />
                  <span className="h-1.5 w-1.5 rounded-full bg-primary animate-glow-pulse" style={{ animationDelay: "0.4s" }} />
                </div>
              </div>
            )}
          </div>

          {/* Suggestions */}
          <div className="flex flex-wrap gap-2 px-5 pb-3">
            {SUGGESTIONS.map((s) => (
              <button
                key={s}
                onClick={() => send(s)}
                className="rounded-full border border-hairline bg-panel/40 px-3 py-1 text-[11px] text-muted-foreground hover:bg-panel-2 hover:text-foreground"
              >
                {s}
              </button>
            ))}
          </div>

          {/* Input */}
          <form
            onSubmit={(e) => { e.preventDefault(); send(input); }}
            className="flex items-center gap-2 border-t border-hairline p-4"
          >
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about predictions, risks, alternatives…"
              className="flex-1 rounded-xl bg-panel-2 px-4 py-2.5 text-sm outline-none placeholder:text-muted-foreground focus:ring-1 focus:ring-primary/60"
            />
            <button
              type="submit"
              className="rounded-xl bg-primary p-2.5 text-primary-foreground neon-glow"
            >
              <Send className="h-4 w-4" />
            </button>
          </form>
        </aside>
      </div>
    </>
  );
}
