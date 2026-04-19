"use client";

import { ArrowLeft, Download, Zap } from "lucide-react";
import { type CSSProperties, useState } from "react";
import { toast } from "sonner";
import { Crumb } from "@/components/pdf/crumb";
import { PdfDropzone } from "@/components/pdf/pdf-dropzone";
import { ProgressRing } from "@/components/pdf/progress-ring";
import { Segmented } from "@/components/pdf/segmented";
import { Steps } from "@/components/pdf/steps";
import { downloadBlob } from "@/lib/download";
import { formatBytes } from "@/lib/format";
import { compressPdf } from "@/lib/pdf/compress";

type Stage = "upload" | "settings" | "processing" | "done";
type Level = "strong" | "balanced" | "light";

const STEPS = ["Upload", "Settings", "Compress", "Download"] as const;

const LEVELS: ReadonlyArray<{
  value: Level;
  title: string;
  desc: string;
  ratio: string;
  dpi: number;
}> = [
  {
    value: "strong",
    title: "Strong",
    desc: "Smallest file size. Best for email and web.",
    ratio: "~75% smaller",
    dpi: 72,
  },
  {
    value: "balanced",
    title: "Balanced",
    desc: "Good quality with solid savings. Recommended.",
    ratio: "~55% smaller",
    dpi: 120,
  },
  {
    value: "light",
    title: "Light",
    desc: "Preserves image sharpness. Best for printing.",
    ratio: "~30% smaller",
    dpi: 200,
  },
];

const RATIOS: Record<Level, number> = { strong: 0.25, balanced: 0.45, light: 0.7 };

export default function CompressPage() {
  const [file, setFile] = useState<File | null>(null);
  const [stage, setStage] = useState<Stage>("upload");
  const [progress, setProgress] = useState(0);
  const [level, setLevel] = useState<Level>("balanced");
  const [imageQuality, setImageQuality] = useState(72);
  const [output, setOutput] = useState<Uint8Array | null>(null);

  const addFile = (files: File[]) => {
    const f = files[0];
    if (!f) return;
    setFile(f);
    setStage("settings");
  };

  const estSize = file ? Math.floor(file.size * RATIOS[level]) : 0;
  const savings = file ? Math.round((1 - RATIOS[level]) * 100) : 0;

  const start = async () => {
    if (!file) return;
    setStage("processing");
    setProgress(0);
    setOutput(null);

    const tick = setInterval(() => {
      setProgress((p) => (p >= 92 ? p : p + 1.5 + Math.random() * 3));
    }, 100);

    try {
      const buffer = await file.arrayBuffer();
      const result = await compressPdf(buffer, {
        imageQuality: imageQuality / 100,
        targetDpi: LEVELS.find((l) => l.value === level)?.dpi ?? 120,
      });
      clearInterval(tick);
      setProgress(100);

      if (!result.ok) {
        if (result.error === "not_implemented") {
          toast.info(
            "Compression logic is a stub — implement lib/pdf/compress.ts to enable real output.",
          );
        } else {
          toast.error(`Compression failed: ${result.error}`);
        }
        setOutput(null);
      } else {
        setOutput(result.data);
      }
      setTimeout(() => setStage("done"), 250);
    } catch (err) {
      clearInterval(tick);
      toast.error(err instanceof Error ? err.message : "Compression failed");
      setStage("settings");
    }
  };

  const reset = () => {
    setFile(null);
    setStage("upload");
    setProgress(0);
    setOutput(null);
  };

  const handleDownload = () => {
    if (!output || !file) {
      toast.info("No output yet — compression logic is still a stub.");
      return;
    }
    const base = file.name.replace(/\.pdf$/i, "");
    downloadBlob(output, `${base}-compressed.pdf`);
  };

  const stageIndex = STEPS.findIndex(
    (s) =>
      s.toLowerCase() === stage ||
      (s === "Compress" && stage === "processing") ||
      (s === "Download" && stage === "done"),
  );

  return (
    <>
      <Crumb
        items={[
          { label: "Tools", onClick: () => history.back(), icon: <ArrowLeft size={14} /> },
          { label: "Compress PDF" },
        ]}
      />

      <div className="flow-header">
        <h2>Compress PDF</h2>
        {file && <span className="count">{formatBytes(file.size)}</span>}
      </div>

      <Steps steps={STEPS} current={stageIndex < 0 ? 0 : stageIndex} />

      {stage === "upload" && (
        <PdfDropzone
          onFiles={addFile}
          multiple={false}
          title="Drop a PDF to compress"
          subtitle="We'll rebuild images and strip hidden metadata to shrink it"
        />
      )}

      {stage === "settings" && file && (
        <div className="flow">
          <div className="glass flow-main">
            <h3 style={{ margin: "0 0 16px", fontSize: 16, fontWeight: 600 }}>Compression level</h3>

            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {LEVELS.map((opt) => {
                const selected = level === opt.value;
                return (
                  <label
                    key={opt.value}
                    className="file-row"
                    style={{
                      cursor: "pointer",
                      borderColor: selected ? "var(--pf-accent)" : "var(--pf-border)",
                      boxShadow: selected ? "0 0 0 2px var(--pf-accent-ring)" : "none",
                      background: selected ? "var(--pf-accent-soft)" : "var(--pf-surface-hover)",
                    }}
                  >
                    <input
                      type="radio"
                      name="level"
                      checked={selected}
                      onChange={() => setLevel(opt.value)}
                      style={{ accentColor: "var(--pf-accent)" }}
                    />
                    <div className="file-info">
                      <h4 style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        {opt.title}
                        <span
                          style={{
                            fontFamily: "var(--font-geist-mono), monospace",
                            fontSize: 10,
                            padding: "2px 6px",
                            borderRadius: 5,
                            background: "var(--pf-surface)",
                            color: "var(--pf-accent)",
                            fontWeight: 500,
                          }}
                        >
                          {opt.ratio}
                        </span>
                      </h4>
                      <div
                        className="meta"
                        style={{ fontFamily: "inherit", color: "var(--pf-fg-muted)" }}
                      >
                        {opt.desc}
                      </div>
                    </div>
                  </label>
                );
              })}
            </div>

            <h3 className="pf-advanced-head">Advanced</h3>

            <div className="slider-block">
              <label htmlFor="image-quality-range">
                <span>Image quality</span>
                <span className="v">{imageQuality}%</span>
              </label>
              <input
                id="image-quality-range"
                type="range"
                className="pf-range"
                min={20}
                max={100}
                step={1}
                value={imageQuality}
                onChange={(e) => setImageQuality(Number(e.target.value))}
                style={
                  {
                    "--pct": `${((imageQuality - 20) / (100 - 20)) * 100}%`,
                  } as CSSProperties
                }
              />
            </div>

            <div className="pf-form-row">
              <span>Strip metadata &amp; hidden layers</span>
              <Segmented
                options={[
                  { value: "yes", label: "On" },
                  { value: "no", label: "Off" },
                ]}
                value="yes"
                onChange={() => {
                  /* wired in v2 */
                }}
                ariaLabel="Strip metadata"
              />
            </div>
          </div>

          <div className="glass flow-side">
            <div className="side-title">Source</div>
            <div className="side-summary">
              <div className="side-row">
                <span className="label">File</span>
                <span
                  className="value"
                  style={{
                    fontSize: 12,
                    maxWidth: 180,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {file.name}
                </span>
              </div>
              <div className="side-row">
                <span className="label">Original</span>
                <span className="value">{formatBytes(file.size)}</span>
              </div>
            </div>

            <div className="side-title">Estimate</div>
            <div className="side-summary">
              <div className="side-row">
                <span className="label">Output</span>
                <span className="value accent">{formatBytes(estSize)}</span>
              </div>
              <div className="side-row">
                <span className="label">Savings</span>
                <span className="value accent">−{savings}%</span>
              </div>
            </div>

            <button
              type="button"
              className="pf-btn pf-btn-primary pf-btn-lg"
              style={{ width: "100%", justifyContent: "center", marginTop: 8 }}
              onClick={start}
            >
              <Zap size={14} /> Compress now
            </button>
          </div>
        </div>
      )}

      {stage === "processing" && file && (
        <div className="glass" style={{ marginTop: 24 }}>
          <ProgressRing value={progress} label={`Compressing ${file.name}…`} />
          <div style={{ padding: "0 32px 32px" }}>
            <div className="progress-bar">
              <div className="fill" style={{ width: `${progress}%` }} />
            </div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginTop: 10,
                fontSize: 12,
                color: "var(--pf-fg-subtle)",
                fontFamily: "var(--font-geist-mono), monospace",
              }}
            >
              <span>
                {progress < 30
                  ? "Parsing pages…"
                  : progress < 65
                    ? "Rebuilding images…"
                    : progress < 90
                      ? "Stripping metadata…"
                      : "Finalizing…"}
              </span>
              <span>{formatBytes(file.size)}</span>
            </div>
          </div>
        </div>
      )}

      {stage === "done" && file && (() => {
        const actualSavings = output
          ? Math.round((1 - output.byteLength / file.size) * 100)
          : savings;
        const hasSavings = output ? actualSavings > 0 : true;
        const title = !output
          ? "Compression pipeline ran"
          : hasSavings
            ? "Compression complete"
            : "No further compression possible";
        const message = !output
          ? "The UI flow works end-to-end. Wire up lib/pdf/compress.ts to produce real output."
          : hasSavings
            ? "Your PDF is ready to download."
            : "This PDF was already well-compressed — the rasterized output is larger than the input. Try a stronger preset, or keep your original file.";

        return (
        <div className="glass result-card" style={{ marginTop: 24 }}>
          <div className="result-icon">
            <Download size={32} strokeWidth={2.4} />
          </div>
          <h3>{title}</h3>
          <p>{message}</p>
          <div className="result-stats">
            <div className="stat-chip">
              <div className="l">Before</div>
              <div className="v">{formatBytes(file.size)}</div>
            </div>
            <div className="stat-chip">
              <div className="l">After</div>
              <div className="v">
                {output ? formatBytes(output.byteLength) : formatBytes(estSize)}
              </div>
            </div>
            <div className="stat-chip">
              <div className="l">{hasSavings ? "Saved" : "Change"}</div>
              <div className={hasSavings ? "v savings" : "v"}>
                {output
                  ? hasSavings
                    ? `−${actualSavings}%`
                    : `+${Math.abs(actualSavings)}%`
                  : `−${savings}%`}
              </div>
            </div>
          </div>
          <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap" }}>
            <button
              type="button"
              className="pf-btn pf-btn-primary pf-btn-lg"
              onClick={handleDownload}
              disabled={!output}
            >
              <Download size={16} /> Download PDF
            </button>
            <button type="button" className="pf-btn pf-btn-lg" onClick={reset}>
              Compress another
            </button>
          </div>
        </div>
        );
      })()}
    </>
  );
}
