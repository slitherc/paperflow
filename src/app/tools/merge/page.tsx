"use client";

import { ArrowLeft, ArrowRight, Download, Plus } from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { Crumb } from "@/components/pdf/crumb";
import { FileRow } from "@/components/pdf/file-row";
import { PdfDropzone } from "@/components/pdf/pdf-dropzone";
import { ProgressRing } from "@/components/pdf/progress-ring";
// import { Segmented } from "@/components/pdf/segmented"; // re-enable when bookmarks feature is wired
import { Steps } from "@/components/pdf/steps";
import { Input } from "@/components/ui/input";
import { ACCEPTED_MIME_TYPES } from "@/lib/constants";
import { downloadBlob } from "@/lib/download";
import { formatBytes } from "@/lib/format";
import { mergePdfs } from "@/lib/pdf/merge";

type Stage = "upload" | "arrange" | "processing" | "done";

interface MergeFile {
  id: string;
  file: File;
}

const STEPS = ["Upload", "Arrange", "Merge", "Download"] as const;

const DEFAULT_OUTPUT_NAME = "merged";

function sanitizeFilename(raw: string): string {
  const trimmed = raw.trim().replace(/\.pdf$/i, "");
  const cleaned = trimmed.replace(/[/\\:*?"<>|]/g, "-");
  return cleaned.length > 0 ? cleaned : DEFAULT_OUTPUT_NAME;
}

export default function MergePage() {
  const [files, setFiles] = useState<MergeFile[]>([]);
  const [stage, setStage] = useState<Stage>("upload");
  const [progress, setProgress] = useState(0);
  const [output, setOutput] = useState<Uint8Array | null>(null);
  const [dragIdx, setDragIdx] = useState<number | null>(null);
  const [overIdx, setOverIdx] = useState<number | null>(null);
  const [outputName, setOutputName] = useState(DEFAULT_OUTPUT_NAME);
  const addMoreInputRef = useRef<HTMLInputElement>(null);

  const addFiles = (incoming: File[]) => {
    const mapped = incoming.map((file) => ({
      id: `${file.name}-${file.size}-${crypto.randomUUID()}`,
      file,
    }));
    setFiles((prev) => [...prev, ...mapped]);
    setStage("arrange");
  };

  const removeFile = (id: string) => {
    setFiles((prev) => {
      const next = prev.filter((f) => f.id !== id);
      if (next.length === 0) setStage("upload");
      return next;
    });
  };

  const reorder = (from: number, to: number) => {
    if (from === to) return;
    setFiles((prev) => {
      const next = [...prev];
      const [moved] = next.splice(from, 1);
      next.splice(to, 0, moved);
      return next;
    });
  };

  const startMerge = async () => {
    if (files.length < 2) return;
    setStage("processing");
    setProgress(0);
    setOutput(null);

    const tick = setInterval(() => {
      setProgress((p) => (p >= 92 ? p : p + 2 + Math.random() * 4));
    }, 80);

    try {
      const buffers = await Promise.all(files.map((f) => f.file.arrayBuffer()));
      const result = await mergePdfs(buffers);
      clearInterval(tick);
      setProgress(100);

      if (!result.ok) {
        if (result.error === "not_implemented") {
          toast.info("Merge logic is a stub — implement lib/pdf/merge.ts to enable real output.");
        } else {
          toast.error(`Merge failed: ${result.error}`);
        }
        setOutput(null);
      } else {
        setOutput(result.data);
      }
      setTimeout(() => setStage("done"), 250);
    } catch (err) {
      clearInterval(tick);
      toast.error(err instanceof Error ? err.message : "Merge failed");
      setStage("arrange");
    }
  };

  const reset = () => {
    setFiles([]);
    setStage("upload");
    setProgress(0);
    setOutput(null);
  };

  const finalFilename = `${sanitizeFilename(outputName)}.pdf`;

  const handleDownload = () => {
    if (!output) {
      toast.info("No output yet — merge logic is still a stub.");
      return;
    }
    downloadBlob(output, finalFilename);
  };

  const totalSize = files.reduce((s, f) => s + f.file.size, 0);
  const stageIndex = STEPS.findIndex(
    (s) =>
      s.toLowerCase() === stage ||
      (s === "Merge" && stage === "processing") ||
      (s === "Download" && stage === "done"),
  );

  return (
    <>
      <Crumb
        items={[
          { label: "Tools", onClick: () => history.back(), icon: <ArrowLeft size={14} /> },
          { label: "Merge PDFs" },
        ]}
      />

      <div className="flow-header">
        <h2>Merge PDFs</h2>
        {files.length > 0 && (
          <span className="count">
            {files.length} file{files.length !== 1 ? "s" : ""}
          </span>
        )}
      </div>

      <Steps steps={STEPS} current={stageIndex < 0 ? 0 : stageIndex} />

      {stage === "upload" && (
        <PdfDropzone
          onFiles={addFiles}
          title="Drop PDFs to merge"
          subtitle="Add two or more PDFs — they'll be combined in the order you arrange"
        />
      )}

      {stage === "arrange" && (
        <div className="flow">
          <div className="glass flow-main">
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                gap: 16,
              }}
            >
              <div>
                <h3 style={{ margin: 0, fontSize: 16, fontWeight: 600 }}>Arrange files</h3>
                <p style={{ margin: "4px 0 0", fontSize: 13, color: "var(--pf-fg-muted)" }}>
                  Drag the handle to reorder. Top of the list becomes the first page.
                </p>
              </div>
              <button
                type="button"
                className="pf-btn"
                onClick={() => addMoreInputRef.current?.click()}
              >
                <Plus size={14} /> Add more
              </button>
              <input
                ref={addMoreInputRef}
                type="file"
                multiple
                accept={Object.values(ACCEPTED_MIME_TYPES).flat().join(",")}
                style={{ display: "none" }}
                onChange={(e) => {
                  const picked = Array.from(e.target.files ?? []);
                  if (picked.length) addFiles(picked);
                  e.target.value = "";
                }}
              />
            </div>

            <div className="file-list">
              {files.map((f, i) => (
                <FileRow
                  key={f.id}
                  index={i}
                  name={f.file.name}
                  size={f.file.size}
                  dragging={dragIdx === i}
                  dragTarget={overIdx === i && dragIdx !== i}
                  onRemove={() => removeFile(f.id)}
                  onDragStart={() => setDragIdx(i)}
                  onDragOver={(e) => {
                    e.preventDefault();
                    if (dragIdx !== null && dragIdx !== i) setOverIdx(i);
                  }}
                  onDragEnd={() => {
                    setDragIdx(null);
                    setOverIdx(null);
                  }}
                  onDrop={() => {
                    if (dragIdx !== null) reorder(dragIdx, i);
                    setDragIdx(null);
                    setOverIdx(null);
                  }}
                />
              ))}
            </div>
          </div>

          <div className="glass flow-side">
            <div className="side-title">Summary</div>
            <div className="side-summary">
              <div className="side-row">
                <span className="label">Files</span>
                <span className="value">{files.length}</span>
              </div>
              <div className="side-row">
                <span className="label">Total size</span>
                <span className="value">{formatBytes(totalSize)}</span>
              </div>
            </div>

            <div className="side-title">Options</div>
            <div className="slider-block">
              <label htmlFor="merge-output-name">
                <span>Output filename</span>
              </label>
              <div className="pf-input-group">
                <Input
                  id="merge-output-name"
                  type="text"
                  value={outputName}
                  placeholder={DEFAULT_OUTPUT_NAME}
                  onChange={(e) => setOutputName(e.target.value)}
                  autoComplete="off"
                  spellCheck={false}
                  className="pf-input-group__input"
                />
                <span className="pf-input-group__suffix">.pdf</span>
              </div>
            </div>
            {/*
              Bookmarks toggle removed until the PDF outline builder is wired.
              When implementing, re-add the Segmented import and thread the
              selected value into `mergePdfs(...)` as a new option.
            */}

            <button
              type="button"
              className="pf-btn pf-btn-primary pf-btn-lg"
              style={{ width: "100%", justifyContent: "center", marginTop: 8 }}
              disabled={files.length < 2}
              onClick={startMerge}
            >
              Merge {files.length} files <ArrowRight size={14} />
            </button>
            {files.length < 2 && (
              <div
                style={{
                  fontSize: 12,
                  color: "var(--pf-fg-subtle)",
                  textAlign: "center",
                  marginTop: 10,
                }}
              >
                Add at least 2 files to merge
              </div>
            )}
          </div>
        </div>
      )}

      {stage === "processing" && (
        <div className="glass" style={{ marginTop: 24 }}>
          <ProgressRing value={progress} label={`Merging ${files.length} files…`} />
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
              <span>Processing in browser</span>
              <span>{formatBytes(totalSize)}</span>
            </div>
          </div>
        </div>
      )}

      {stage === "done" && (
        <div className="glass result-card" style={{ marginTop: 24 }}>
          <div className="result-icon">
            <Download size={32} strokeWidth={2.4} />
          </div>
          <h3>{output ? "Ready to download" : "Merge pipeline ran"}</h3>
          <p>
            {output
              ? `Merged ${files.length} files into a single PDF.`
              : "The UI flow works end-to-end. Wire up lib/pdf/merge.ts to produce a real PDF."}
          </p>
          <div className="result-stats">
            <div className="stat-chip">
              <div className="l">Files</div>
              <div className="v">{files.length}</div>
            </div>
            <div className="stat-chip">
              <div className="l">Size</div>
              <div className="v">
                {output ? formatBytes(output.byteLength) : formatBytes(totalSize)}
              </div>
            </div>
            <div className="stat-chip">
              <div className="l">Output</div>
              <div
                className="v"
                style={{
                  fontSize: 14,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                  maxWidth: 140,
                }}
                title={finalFilename}
              >
                {finalFilename}
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
              Start over
            </button>
          </div>
        </div>
      )}
    </>
  );
}
