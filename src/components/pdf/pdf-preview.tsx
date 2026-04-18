"use client";

import { useEffect, useState } from "react";
import { PDFJS_WORKER_SRC } from "@/lib/constants";
import { PageThumbnail } from "@/components/pdf/page-thumbnail";

interface PdfPreviewProps {
  file: File;
  maxPages?: number;
}

/**
 * Thumbnail grid of a PDF's pages. Resolves the page count lazily via pdfjs,
 * then delegates each page to {@link PageThumbnail}.
 */
export function PdfPreview({ file, maxPages = 12 }: PdfPreviewProps) {
  const [pageCount, setPageCount] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const pdfjs = await import("pdfjs-dist");
        pdfjs.GlobalWorkerOptions.workerSrc = PDFJS_WORKER_SRC;

        const buffer = await file.arrayBuffer();
        if (cancelled) return;

        const doc = await pdfjs.getDocument({ data: buffer }).promise;
        if (cancelled) return;

        setPageCount(doc.numPages);
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : "preview_failed");
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [file]);

  if (error) return <div className="empty">Preview failed: {error}</div>;
  if (pageCount === null) return <div className="empty">Loading preview…</div>;

  const pages = Array.from({ length: Math.min(pageCount, maxPages) }, (_, i) => i + 1);

  return (
    <div className="page-list">
      {pages.map((n) => (
        <div key={n} className="page-card">
          <div className="page-thumb">
            <PageThumbnail file={file} pageNumber={n} />
          </div>
          <div className="page-meta">
            <span>Page {n}</span>
          </div>
        </div>
      ))}
      {pageCount > maxPages && (
        <div className="empty" style={{ gridColumn: "1 / -1", padding: 16 }}>
          + {pageCount - maxPages} more pages
        </div>
      )}
    </div>
  );
}
