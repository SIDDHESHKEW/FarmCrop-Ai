import { useMemo, useState } from "react";
import { apiUrl } from "@/lib/api";

const CROP_OPTIONS = ["Wheat", "Rice", "Maize", "Cotton", "Bajra"];

const CROP_ALIAS_MAP: Record<string, string> = {
  wheat: "Wheat",
  rice: "Rice",
  maize: "Maize",
  corn: "Maize",
  cotton: "Cotton",
  bajra: "Bajra",
  millet: "Bajra",
  ganna: "Sugarcane",
  gana: "Sugarcane",
  sugarcane: "Sugarcane",
};

const IGNORE_TOKENS = new Set([
  "img", "image", "photo", "pic", "crop", "leaf", "plant", "final", "new", "camera",
  "file", "upload", "sample", "test", "edited", "copy", "scan", "shot", "field", "farm",
]);

export function StepCrop({
  crop,
  onNext,
}: {
  crop: string;
  onNext: (crop: string) => void;
}) {
  const [selectedCrop, setSelectedCrop] = useState(crop || "Wheat");
  const [customCrop, setCustomCrop] = useState("");
  const [detecting, setDetecting] = useState(false);
  const [detectError, setDetectError] = useState<string | null>(null);
  const [detectedCrop, setDetectedCrop] = useState<string | null>(null);

  const resolvedCrop = useMemo(() => {
    const custom = customCrop.trim();
    return custom || selectedCrop;
  }, [customCrop, selectedCrop]);

  const inferCropFromFilename = (filename: string): string | null => {
    const stem = filename.toLowerCase().split(".")[0];
    const tokens = stem.split(/[^a-z]+/).filter(Boolean);
    if (tokens.length === 0) return null;

    for (const token of tokens) {
      if (CROP_ALIAS_MAP[token]) {
        return CROP_ALIAS_MAP[token];
      }
    }

    for (const token of tokens) {
      for (const alias of Object.keys(CROP_ALIAS_MAP)) {
        if (token.includes(alias)) {
          return CROP_ALIAS_MAP[alias];
        }
      }
    }

    const meaningful = tokens.filter((t) => !IGNORE_TOKENS.has(t) && t.length > 2);
    const best = meaningful.sort((a, b) => b.length - a.length)[0] ?? tokens[0];
    return best.charAt(0).toUpperCase() + best.slice(1);
  };

  const applyDetectedCrop = (nextCrop: string) => {
    setDetectedCrop(nextCrop);
    if (CROP_OPTIONS.includes(nextCrop)) {
      setSelectedCrop(nextCrop);
      setCustomCrop("");
    } else {
      setCustomCrop(nextCrop);
    }
  };

  const handleImageDetect = async (file: File | null) => {
    if (!file) return;

    setDetecting(true);
    setDetectError(null);

    // Local heuristic first for instant UX and backend-fallback safety.
    const localGuess = inferCropFromFilename(file.name);
    if (localGuess) {
      applyDetectedCrop(localGuess);
    }

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch(apiUrl("/detect-crop"), {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        throw new Error(`Detect crop failed with status ${res.status}`);
      }

      const data = await res.json();
      const nextCrop = typeof data?.crop === "string" ? data.crop : null;

      if (!nextCrop) {
        throw new Error("Invalid detect-crop response");
      }

      applyDetectedCrop(nextCrop);
    } catch (err) {
      console.error(err);
      if (!localGuess) {
        setDetectError("Could not detect crop from image.");
      }
    } finally {
      setDetecting(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl animate-fade-in">
      <div className="glass-strong rounded-3xl p-6">
        <div className="text-xs uppercase tracking-wider text-muted-foreground">
          Step 03 · Crop Selection
        </div>
        <h2 className="mt-1 text-2xl font-semibold tracking-tight">
          Select crop type
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Choose your crop to refine a climate-resilient recommendation.
        </p>

        <div className="mt-6 space-y-4">
          <div>
            <label className="mb-1 block text-sm text-muted-foreground">Upload crop image</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => handleImageDetect(e.target.files?.[0] ?? null)}
              className="w-full rounded-xl border border-hairline bg-panel/40 px-3 py-2 text-sm outline-none file:mr-3 file:rounded-lg file:border-0 file:bg-primary/15 file:px-3 file:py-1 file:text-primary"
            />
            {detecting && <p className="mt-2 text-xs text-muted-foreground">Detecting crop from image...</p>}
            {detectedCrop && !detecting && (
              <p className="mt-2 text-xs text-primary">Detected crop: {detectedCrop}</p>
            )}
            {detectError && <p className="mt-2 text-xs text-destructive">{detectError}</p>}
          </div>

          <div>
            <label className="mb-1 block text-sm text-muted-foreground">Crop options</label>
            <select
              value={selectedCrop}
              onChange={(e) => setSelectedCrop(e.target.value)}
              className="w-full rounded-xl border border-hairline bg-panel/40 px-3 py-2 text-sm outline-none focus:border-primary/50"
            >
              {CROP_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1 block text-sm text-muted-foreground">Or enter custom crop</label>
            <input
              value={customCrop}
              onChange={(e) => setCustomCrop(e.target.value)}
              placeholder="Or enter custom crop"
              className="w-full rounded-xl border border-hairline bg-panel/40 px-3 py-2 text-sm outline-none placeholder:text-muted-foreground focus:border-primary/50"
            />
          </div>
        </div>

        <div className="mt-6">
          <button
            onClick={() => onNext(resolvedCrop)}
            disabled={detecting}
            className="rounded-xl bg-primary px-5 py-2 text-sm font-medium text-primary-foreground neon-glow transition-transform hover:scale-[1.02] hover:shadow-[0_0_24px_var(--primary)] disabled:opacity-60"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
