import { PDFDocument } from "pdf-lib";
import { PDFJS_WORKER_SRC } from "@/lib/constants";
import type { CompressOptions, OperationResult } from "@/types/pdf";

const MAX_CANVAS_DIMENSION = 8192;

/**
 * Compresses a PDF by rasterizing every page at the requested DPI and re-encoding
 * as a JPEG at the requested quality, then rebuilding a PDF that renders each
 * JPEG at the page's original dimensions.
 *
 * Trade-off: text becomes non-selectable (rasterized). For image-heavy or scanned
 * PDFs this is a large win; for purely-text PDFs the output may actually be
 * larger than the input — the caller is responsible for surfacing that honestly.
 *
 * Runs on the main thread (uses HTMLCanvasElement). To move this off the main
 * thread, swap to OffscreenCanvas and call it from a Web Worker.
 *
 * @param buffer Input PDF as ArrayBuffer.
 * @param options {@link CompressOptions} with target DPI (e.g. 72/120/200) and
 *   image quality (0–1).
 * @returns A {@link Uint8Array} of the compressed PDF on success.
 */
export async function compressPdf(
  buffer: ArrayBuffer,
  options: CompressOptions,
): Promise<OperationResult> {
  if (typeof document === "undefined") {
    return { ok: false, error: "browser_only" };
  }

  const imageQuality = clamp(options.imageQuality, 0.05, 1);
  const targetDpi = clamp(options.targetDpi, 36, 300);

  try {
    const pdfjs = await import("pdfjs-dist");
    pdfjs.GlobalWorkerOptions.workerSrc = PDFJS_WORKER_SRC;

    const srcDoc = await pdfjs.getDocument({ data: buffer }).promise;
    if (srcDoc.numPages === 0) {
      return { ok: false, error: "empty_document" };
    }

    const outDoc = await PDFDocument.create();
    const baseScale = targetDpi / 72;

    for (let i = 1; i <= srcDoc.numPages; i++) {
      const page = await srcDoc.getPage(i);
      const baseViewport = page.getViewport({ scale: 1 });

      const maxRasterScale = Math.min(
        MAX_CANVAS_DIMENSION / baseViewport.width,
        MAX_CANVAS_DIMENSION / baseViewport.height,
      );
      const scale = Math.min(baseScale, maxRasterScale);
      const viewport = page.getViewport({ scale });

      const canvas = document.createElement("canvas");
      canvas.width = Math.ceil(viewport.width);
      canvas.height = Math.ceil(viewport.height);
      const ctx = canvas.getContext("2d");
      if (!ctx) return { ok: false, error: "canvas_unavailable" };

      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      await page.render({ canvasContext: ctx, viewport, canvas }).promise;

      const jpegBytes = await canvasToJpegBytes(canvas, imageQuality);
      canvas.width = 0;
      canvas.height = 0;
      page.cleanup();

      if (!jpegBytes) return { ok: false, error: "jpeg_encode_failed" };

      const jpeg = await outDoc.embedJpg(jpegBytes);
      const newPage = outDoc.addPage([baseViewport.width, baseViewport.height]);
      newPage.drawImage(jpeg, {
        x: 0,
        y: 0,
        width: baseViewport.width,
        height: baseViewport.height,
      });
    }

    await srcDoc.destroy();

    outDoc.setProducer("Paperflow");
    outDoc.setCreator("Paperflow");
    outDoc.setCreationDate(new Date());
    outDoc.setModificationDate(new Date());

    const data = await outDoc.save({ useObjectStreams: true });
    return {
      ok: true,
      data,
      meta: {
        pageCount: outDoc.getPageCount(),
        inputBytes: buffer.byteLength,
        outputBytes: data.byteLength,
      },
    };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "compress_failed" };
  }
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

async function canvasToJpegBytes(
  canvas: HTMLCanvasElement,
  quality: number,
): Promise<Uint8Array | null> {
  const blob = await new Promise<Blob | null>((resolve) => {
    canvas.toBlob(resolve, "image/jpeg", quality);
  });
  if (!blob) return null;
  const arr = await blob.arrayBuffer();
  return new Uint8Array(arr);
}
