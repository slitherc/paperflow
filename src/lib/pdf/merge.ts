import { PDFDocument } from "pdf-lib";
import type { OperationResult } from "@/types/pdf";

/**
 * Merges multiple PDF buffers into a single PDF, preserving the given order.
 *
 * Source documents are loaded with `ignoreEncryption: true` so unprotected
 * encrypted PDFs can still be merged. Password-protected files will fail with
 * an informative error instead of crashing.
 *
 * @param buffers ArrayBuffers of the input PDFs, in the desired output order.
 * @returns A {@link Uint8Array} of the merged PDF on success.
 */
export async function mergePdfs(buffers: ArrayBuffer[]): Promise<OperationResult> {
  if (buffers.length === 0) return { ok: false, error: "no_files" };
  if (buffers.length === 1) return { ok: false, error: "need_at_least_two" };

  try {
    const merged = await PDFDocument.create();

    for (let i = 0; i < buffers.length; i++) {
      const source = await PDFDocument.load(buffers[i], { ignoreEncryption: true });
      const pages = await merged.copyPages(source, source.getPageIndices());
      for (const page of pages) merged.addPage(page);
    }

    merged.setProducer("Paperflow");
    merged.setCreator("Paperflow");
    merged.setCreationDate(new Date());
    merged.setModificationDate(new Date());

    const data = await merged.save({ useObjectStreams: true });
    return { ok: true, data, meta: { pageCount: merged.getPageCount() } };
  } catch (err) {
    const msg = err instanceof Error ? err.message : "merge_failed";
    return { ok: false, error: msg };
  }
}
