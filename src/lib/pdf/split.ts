import { PDFDocument } from "pdf-lib";
import type { OperationResult, PageRange, SplitOptions } from "@/types/pdf";

/**
 * Splits a PDF into one or more PDFs.
 *
 * Modes:
 *   - "ranges": one output per range (e.g. "1-3,5" → two PDFs unless mergeAll)
 *   - "every":  auto-chunk into fixed-size buckets (ignores `ranges`)
 *   - "pages":  one output per single page in `pages` (unless mergeAll)
 *
 * When `mergeAll` is true, all selected pages are consolidated into a single
 * PDF in the order they were requested. The result is always returned as an
 * array — callers decide whether to zip or emit a single file based on length.
 */
export async function splitPdf(
  buffer: ArrayBuffer,
  options: SplitOptions,
): Promise<OperationResult<Uint8Array[]>> {
  try {
    const source = await PDFDocument.load(buffer, { ignoreEncryption: true });
    const pageCount = source.getPageCount();
    if (pageCount === 0) return { ok: false, error: "empty_document" };

    const buckets = resolveBuckets(options, pageCount);
    if (buckets.length === 0) return { ok: false, error: "no_selection" };

    for (const bucket of buckets) {
      for (const p of bucket) {
        if (p < 1 || p > pageCount) return { ok: false, error: `page_out_of_range:${p}` };
      }
    }

    const effective = options.mergeAll ? [buckets.flat()] : buckets;
    const outputs: Uint8Array[] = [];

    for (const indices of effective) {
      if (indices.length === 0) continue;
      const doc = await PDFDocument.create();
      const copied = await doc.copyPages(
        source,
        indices.map((p) => p - 1),
      );
      for (const page of copied) doc.addPage(page);

      doc.setProducer("Paperflow");
      doc.setCreator("Paperflow");
      doc.setCreationDate(new Date());
      doc.setModificationDate(new Date());

      const bytes = await doc.save({ useObjectStreams: true });
      outputs.push(bytes);
    }

    if (outputs.length === 0) return { ok: false, error: "no_output" };

    return { ok: true, data: outputs, meta: { count: outputs.length, sourcePages: pageCount } };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "split_failed" };
  }
}

function resolveBuckets(options: SplitOptions, pageCount: number): number[][] {
  switch (options.mode) {
    case "ranges": {
      const ranges = options.ranges ?? [];
      return ranges.map((r) => expandRange(r));
    }
    case "every": {
      const size = Math.max(1, options.everyN ?? 1);
      const out: number[][] = [];
      for (let start = 1; start <= pageCount; start += size) {
        const end = Math.min(start + size - 1, pageCount);
        out.push(expandRange({ from: start, to: end }));
      }
      return out;
    }
    case "pages": {
      const pages = options.pages ?? [];
      return pages.map((p) => [p]);
    }
  }
}

function expandRange(r: PageRange): number[] {
  const out: number[] = [];
  for (let p = r.from; p <= r.to; p++) out.push(p);
  return out;
}
