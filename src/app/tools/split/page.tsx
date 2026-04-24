"use client";

import { ArrowLeft, ArrowRight, Download, Scissors } from "lucide-react";
import JSZip from "jszip";
import Link from "next/link";
import { PDFDocument } from "pdf-lib";
import { type CSSProperties, useMemo, useState } from "react";
import { toast } from "sonner";
import { PdfDropzone } from "@/components/pdf/pdf-dropzone";
import { ProgressRing } from "@/components/pdf/progress-ring";
import { Segmented } from "@/components/pdf/segmented";
import { Steps } from "@/components/pdf/steps";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { downloadBlob } from "@/lib/download";
import { formatBytes } from "@/lib/format";
import { chunkEvery, formatRange, parseRangeInput } from "@/lib/pdf/parse-ranges";
import { splitPdf } from "@/lib/pdf/split";
import type { PageRange, SplitOptions } from "@/types/pdf";

type Stage = "upload" | "configure" | "processing" | "done";
type TopMode = "range" | "pages";
type RangeSub = "custom" | "fixed";
type PagesSub = "all" | "select";

const STEPS = ["Upload", "Settings", "Split", "Download"] as const;

function sanitizeBase(raw: string): string {
  const stripped = raw.trim().replace(/\.pdf$/i, "");
  const cleaned = stripped.replace(/[/\\:*?"<>|]/g, "-");
  return cleaned.length > 0 ? cleaned : "document";
}

function buildPlan(
  topMode: TopMode,
  rangeSub: RangeSub,
  pagesSub: PagesSub,
  rangesInput: string,
  fixedSize: number,
  selectInput: string,
  pageCount: number,
): { ok: true; ranges: PageRange[]; pages: number[] } | { ok: false; error: string } {
  if (topMode === "range") {
    if (rangeSub === "custom") {
      const parsed = parseRangeInput(rangesInput, pageCount);
      if (!parsed.ok) return parsed;
      return { ok: true, ranges: parsed.ranges, pages: parsed.pages };
    }
    const size = Math.max(1, Math.floor(fixedSize));
    if (!Number.isFinite(size) || size < 1) {
      return { ok: false, error: "Enter a positive number" };
    }
    const ranges = chunkEvery(pageCount, size);
    const pages: number[] = [];
    for (const r of ranges) for (let p = r.from; p <= r.to; p++) pages.push(p);
    return { ok: true, ranges, pages };
  }
  if (pagesSub === "all") {
    const ranges: PageRange[] = Array.from({ length: pageCount }, (_, i) => ({
      from: i + 1,
      to: i + 1,
    }));
    const pages = Array.from({ length: pageCount }, (_, i) => i + 1);
    return { ok: true, ranges, pages };
  }
  const parsed = parseRangeInput(selectInput, pageCount);
  if (!parsed.ok) return parsed;
  const ranges: PageRange[] = parsed.pages.map((p) => ({ from: p, to: p }));
  return { ok: true, ranges, pages: parsed.pages };
}

export default function SplitPage() {
  const [file, setFile] = useState<File | null>(null);
  const [pageCount, setPageCount] = useState(0);
  const [stage, setStage] = useState<Stage>("upload");
  const [progress, setProgress] = useState(0);

  const [topMode, setTopMode] = useState<TopMode>("range");
  const [rangeSub, setRangeSub] = useState<RangeSub>("custom");
  const [pagesSub, setPagesSub] = useState<PagesSub>("all");
  const [rangesInput, setRangesInput] = useState("");
  const [fixedSize, setFixedSize] = useState(2);
  const [selectInput, setSelectInput] = useState("");
  const [mergeAll, setMergeAll] = useState(false);

  const [outputs, setOutputs] = useState<Uint8Array[] | null>(null);

  const addFile = async (files: File[]) => {
    const f = files[0];
    if (!f) return;
    try {
      const buffer = await f.arrayBuffer();
      const doc = await PDFDocument.load(buffer, { ignoreEncryption: true });
      const count = doc.getPageCount();
      if (count === 0) {
        toast.error("This PDF has no pages.");
        return;
      }
      setFile(f);
      setPageCount(count);
      setRangesInput(count === 1 ? "1" : `1-${Math.min(Math.ceil(count / 2), count)}`);
      setSelectInput("1");
      setStage("configure");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not read PDF");
    }
  };

  const plan = useMemo(() => {
    if (!file || pageCount === 0) return null;
    return buildPlan(
      topMode,
      rangeSub,
      pagesSub,
      rangesInput,
      fixedSize,
      selectInput,
      pageCount,
    );
  }, [file, pageCount, topMode, rangeSub, pagesSub, rangesInput, fixedSize, selectInput]);

  const effectiveOutputCount = useMemo(() => {
    if (!plan || !plan.ok) return 0;
    if (mergeAll) return 1;
    return plan.ranges.length;
  }, [plan, mergeAll]);

  const start = async () => {
    if (!file || !plan || !plan.ok) return;
    setStage("processing");
    setProgress(0);
    setOutputs(null);

    const tick = setInterval(() => {
      setProgress((p) => (p >= 92 ? p : p + 2 + Math.random() * 4));
    }, 90);

    try {
      const buffer = await file.arrayBuffer();
      const options: SplitOptions =
        topMode === "range" && rangeSub === "fixed"
          ? { mode: "every", everyN: Math.max(1, fixedSize), mergeAll }
          : topMode === "pages" && pagesSub === "select"
            ? { mode: "pages", pages: plan.pages, mergeAll }
            : topMode === "pages" && pagesSub === "all"
              ? { mode: "pages", pages: plan.pages, mergeAll }
              : { mode: "ranges", ranges: plan.ranges, mergeAll };

      const result = await splitPdf(buffer, options);
      clearInterval(tick);
      setProgress(100);

      if (!result.ok) {
        toast.error(`Split failed: ${result.error}`);
        setOutputs(null);
      } else {
        setOutputs(result.data);
      }
      setTimeout(() => setStage("done"), 250);
    } catch (err) {
      clearInterval(tick);
      toast.error(err instanceof Error ? err.message : "Split failed");
      setStage("configure");
    }
  };

  const reset = () => {
    setFile(null);
    setPageCount(0);
    setStage("upload");
    setProgress(0);
    setOutputs(null);
    setRangesInput("");
    setSelectInput("");
    setMergeAll(false);
  };

  const outputFilenames = useMemo(() => {
    if (!file || !plan || !plan.ok) return [];
    const base = sanitizeBase(file.name);
    if (mergeAll) return [`${base}-split.pdf`];
    if (topMode === "pages" && pagesSub === "select") {
      return plan.pages.map((p) => `${base}-page-${p}.pdf`);
    }
    return plan.ranges.map((r) => `${base}-${formatRange(r)}.pdf`);
  }, [file, plan, mergeAll, topMode, pagesSub]);

  const handleDownload = async () => {
    if (!outputs || outputs.length === 0 || !file) return;

    if (outputs.length === 1) {
      const name = outputFilenames[0] ?? `${sanitizeBase(file.name)}-split.pdf`;
      downloadBlob(outputs[0], name);
      return;
    }

    const zip = new JSZip();
    outputs.forEach((bytes, i) => {
      const name = outputFilenames[i] ?? `part-${i + 1}.pdf`;
      zip.file(name, bytes);
    });
    const blob = await zip.generateAsync({ type: "blob" });
    downloadBlob(blob, `${sanitizeBase(file.name)}-split.zip`, "application/zip");
  };

  const totalOutputBytes = useMemo(
    () => (outputs ? outputs.reduce((sum, o) => sum + o.byteLength, 0) : 0),
    [outputs],
  );

  const stageIndex = STEPS.findIndex(
    (s) =>
      s.toLowerCase() === stage ||
      (s === "Settings" && stage === "configure") ||
      (s === "Split" && stage === "processing") ||
      (s === "Download" && stage === "done"),
  );

  const canSplit = plan?.ok === true && effectiveOutputCount > 0;

  return (
    <>
      <Breadcrumb className="mb-1.5">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href="/" className="inline-flex items-center gap-1.5">
                <ArrowLeft className="size-3.5" />
                Tools
              </Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Split PDF</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="flow-header">
        <h2>Split PDF</h2>
        {file && (
          <span className="count">
            {pageCount} page{pageCount !== 1 ? "s" : ""}
          </span>
        )}
      </div>

      <Steps steps={STEPS} current={stageIndex < 0 ? 0 : stageIndex} />

      {stage === "upload" && (
        <PdfDropzone
          onFiles={addFile}
          multiple={false}
          title="Drop a PDF to split"
          subtitle="Extract pages or break a PDF into multiple documents"
        />
      )}

      {stage === "configure" && file && (
        <div className="flow">
          <div className="glass flow-main">
            <div className="mb-4">
              <h3 style={{ margin: 0, fontSize: 16, fontWeight: 600 }}>Split mode</h3>
              <p style={{ margin: "4px 0 0", fontSize: 13, color: "var(--pf-fg-muted)" }}>
                Choose how to divide the PDF. Each mode has its own options below.
              </p>
            </div>

            <Segmented<TopMode>
              options={[
                { value: "range", label: "By range" },
                { value: "pages", label: "Extract pages" },
              ]}
              value={topMode}
              onChange={setTopMode}
              ariaLabel="Split mode"
            />

            {topMode === "range" && (
              <div
                style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 18 }}
              >
                <ModeCard
                  title="Custom ranges"
                  desc="One PDF per range you define — great for chapters or sections."
                  selected={rangeSub === "custom"}
                  onSelect={() => setRangeSub("custom")}
                >
                  <div className="slider-block" style={{ marginTop: 12 }}>
                    <label htmlFor="split-custom-ranges">
                      <span>Pages to extract</span>
                      <span className="v">
                        {pageCount} page{pageCount !== 1 ? "s" : ""} total
                      </span>
                    </label>
                    <Input
                      id="split-custom-ranges"
                      type="text"
                      value={rangesInput}
                      placeholder="e.g. 1-3, 5, 7-9"
                      onChange={(e) => setRangesInput(e.target.value)}
                      autoComplete="off"
                      spellCheck={false}
                    />
                    {plan && !plan.ok && rangeSub === "custom" && (
                      <div
                        style={{
                          fontSize: 12,
                          color: "var(--destructive)",
                          marginTop: 6,
                        }}
                      >
                        {plan.error}
                      </div>
                    )}
                  </div>
                </ModeCard>

                <ModeCard
                  title="Fixed size"
                  desc="Auto-chunk into equal-sized batches of N pages each."
                  selected={rangeSub === "fixed"}
                  onSelect={() => setRangeSub("fixed")}
                >
                  <div className="slider-block" style={{ marginTop: 12 }}>
                    <label htmlFor="split-fixed-size">
                      <span>Pages per split</span>
                      <span className="v">
                        {Math.ceil(pageCount / Math.max(1, fixedSize))} PDFs
                      </span>
                    </label>
                    <input
                      id="split-fixed-size"
                      type="range"
                      className="pf-range"
                      min={1}
                      max={Math.max(1, pageCount)}
                      step={1}
                      value={Math.min(fixedSize, Math.max(1, pageCount))}
                      onChange={(e) => setFixedSize(Number(e.target.value))}
                      style={
                        {
                          "--pct": `${
                            pageCount > 1
                              ? ((Math.min(fixedSize, pageCount) - 1) / (pageCount - 1)) * 100
                              : 100
                          }%`,
                        } as CSSProperties
                      }
                    />
                    <div
                      style={{
                        fontSize: 12,
                        color: "var(--pf-fg-subtle)",
                        marginTop: 6,
                      }}
                    >
                      {fixedSize} page{fixedSize !== 1 ? "s" : ""} per PDF
                    </div>
                  </div>
                </ModeCard>
              </div>
            )}

            {topMode === "pages" && (
              <div
                style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 18 }}
              >
                <ModeCard
                  title="Extract all pages"
                  desc="Produce one PDF per page in the document."
                  selected={pagesSub === "all"}
                  onSelect={() => setPagesSub("all")}
                />

                <ModeCard
                  title="Select pages"
                  desc="Pull specific pages — comma-separate or use ranges."
                  selected={pagesSub === "select"}
                  onSelect={() => setPagesSub("select")}
                >
                  <div className="slider-block" style={{ marginTop: 12 }}>
                    <label htmlFor="split-select-pages">
                      <span>Pages to extract</span>
                      <span className="v">
                        {pageCount} page{pageCount !== 1 ? "s" : ""} total
                      </span>
                    </label>
                    <Input
                      id="split-select-pages"
                      type="text"
                      value={selectInput}
                      placeholder="e.g. 1, 5, 7-9"
                      onChange={(e) => setSelectInput(e.target.value)}
                      autoComplete="off"
                      spellCheck={false}
                    />
                    {plan && !plan.ok && pagesSub === "select" && (
                      <div
                        style={{
                          fontSize: 12,
                          color: "var(--destructive)",
                          marginTop: 6,
                        }}
                      >
                        {plan.error}
                      </div>
                    )}
                  </div>
                </ModeCard>
              </div>
            )}
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
                  title={file.name}
                >
                  {file.name}
                </span>
              </div>
              <div className="side-row">
                <span className="label">Pages</span>
                <span className="value">{pageCount}</span>
              </div>
              <div className="side-row">
                <span className="label">Size</span>
                <span className="value">{formatBytes(file.size)}</span>
              </div>
            </div>

            <div className="side-title">Output</div>
            <div className="side-summary">
              <div className="side-row">
                <span className="label">Files</span>
                <span className="value accent">
                  {effectiveOutputCount} PDF{effectiveOutputCount !== 1 ? "s" : ""}
                </span>
              </div>
              <div className="side-row">
                <span className="label">Pages</span>
                <span className="value accent">{plan?.ok ? plan.pages.length : 0}</span>
              </div>
            </div>

            <div className="pf-form-row">
              <span>Merge into single PDF</span>
              <Segmented
                options={[
                  { value: "yes", label: "On" },
                  { value: "no", label: "Off" },
                ]}
                value={mergeAll ? "yes" : "no"}
                onChange={(v) => setMergeAll(v === "yes")}
                ariaLabel="Merge all outputs"
              />
            </div>

            <Button
              size="lg"
              className="mt-2 h-11 w-full px-6 text-sm"
              disabled={!canSplit}
              onClick={start}
            >
              {mergeAll
                ? `Extract ${plan?.ok ? plan.pages.length : 0} pages`
                : `Split into ${effectiveOutputCount} PDF${effectiveOutputCount !== 1 ? "s" : ""}`}
              <ArrowRight />
            </Button>
          </div>
        </div>
      )}

      {stage === "processing" && file && (
        <div className="glass" style={{ marginTop: 24 }}>
          <ProgressRing value={progress} label={`Splitting ${file.name}…`} />
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
                {progress < 50 ? "Copying pages…" : progress < 90 ? "Writing PDFs…" : "Finalizing…"}
              </span>
              <span>{formatBytes(file.size)}</span>
            </div>
          </div>
        </div>
      )}

      {stage === "done" && file && (
        <div className="glass result-card" style={{ marginTop: 24 }}>
          <div className="result-icon">
            <Scissors size={32} strokeWidth={2.2} />
          </div>
          <h3>{outputs ? "Split complete" : "Split pipeline ran"}</h3>
          <p>
            {outputs
              ? outputs.length === 1
                ? `Extracted ${plan?.ok ? plan.pages.length : 0} page${
                    plan?.ok && plan.pages.length !== 1 ? "s" : ""
                  } into a single PDF.`
                : `Created ${outputs.length} PDFs — they'll download as a zip.`
              : "The UI flow works end-to-end."}
          </p>
          <div className="result-stats">
            <div className="stat-chip">
              <div className="l">Files</div>
              <div className="v">{outputs?.length ?? 0}</div>
            </div>
            <div className="stat-chip">
              <div className="l">Pages</div>
              <div className="v">{plan?.ok ? plan.pages.length : 0}</div>
            </div>
            <div className="stat-chip">
              <div className="l">Size</div>
              <div className="v">{formatBytes(totalOutputBytes)}</div>
            </div>
          </div>
          <div className="flex flex-wrap justify-center gap-2.5">
            <Button
              size="lg"
              className="h-11 px-6 text-sm"
              onClick={handleDownload}
              disabled={!outputs}
            >
              <Download />
              {outputs && outputs.length > 1 ? "Download zip" : "Download PDF"}
            </Button>
            <Button variant="outline" size="lg" className="h-11 px-6 text-sm" onClick={reset}>
              Split another
            </Button>
          </div>
        </div>
      )}
    </>
  );
}

interface ModeCardProps {
  title: string;
  desc: string;
  selected: boolean;
  onSelect: () => void;
  children?: React.ReactNode;
}

function ModeCard({ title, desc, selected, onSelect, children }: ModeCardProps) {
  return (
    <label
      className="file-row"
      style={{
        cursor: "pointer",
        alignItems: "flex-start",
        borderColor: selected ? "var(--pf-accent)" : "var(--pf-border)",
        boxShadow: selected ? "0 0 0 2px var(--pf-accent-ring)" : "none",
        background: selected ? "var(--pf-accent-soft)" : "var(--pf-surface-hover)",
        flexDirection: "column",
        gap: 0,
      }}
    >
      <div style={{ display: "flex", alignItems: "flex-start", gap: 12, width: "100%" }}>
        <input
          type="radio"
          name="split-sub-mode"
          checked={selected}
          onChange={onSelect}
          style={{ accentColor: "var(--pf-accent)", marginTop: 2 }}
        />
        <div className="file-info" style={{ flex: 1 }}>
          <h4>{title}</h4>
          <div
            className="meta"
            style={{ fontFamily: "inherit", color: "var(--pf-fg-muted)" }}
          >
            {desc}
          </div>
        </div>
      </div>
      {selected && children && <div style={{ width: "100%" }}>{children}</div>}
    </label>
  );
}
