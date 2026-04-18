"use client";

import { useEffect, useRef, useState } from "react";
import { PDFJS_WORKER_SRC } from "@/lib/constants";

interface PageThumbnailProps {
  file: File;
  pageNumber: number;
  width?: number;
  rotation?: 0 | 90 | 180 | 270;
}

/**
 * Renders a single PDF page into a canvas using pdfjs-dist.
 * Lazy-loads pdfjs so the worker is only pulled in when a thumbnail is actually rendered.
 */
export function PageThumbnail({ file, pageNumber, width = 170, rotation = 0 }: PageThumbnailProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
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

        const page = await doc.getPage(pageNumber);
        if (cancelled) return;

        const viewport = page.getViewport({ scale: 1, rotation });
        const scale = width / viewport.width;
        const scaled = page.getViewport({ scale, rotation });

        const canvas = canvasRef.current;
        if (!canvas) return;
        canvas.width = scaled.width;
        canvas.height = scaled.height;

        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        await page.render({ canvasContext: ctx, viewport: scaled, canvas }).promise;
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : "render_failed");
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [file, pageNumber, width, rotation]);

  if (error) return <div className="empty">Thumbnail failed</div>;
  return <canvas ref={canvasRef} aria-label={`Page ${pageNumber} preview`} />;
}
