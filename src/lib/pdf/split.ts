import type { OperationResult, SplitOptions } from "@/types/pdf";

/**
 * Splits a PDF into multiple PDFs based on the given options.
 *
 * @param buffer Input PDF as ArrayBuffer.
 * @param options {@link SplitOptions} describing how to split (pages, ranges, every N).
 * @returns An array of {@link Uint8Array} on success — one per output document.
 */
export async function splitPdf(
  buffer: ArrayBuffer,
  options: SplitOptions,
): Promise<OperationResult<Uint8Array[]>> {
  void buffer;
  void options;
  // TODO: implement with pdf-lib
  //   - PDFDocument.load(buffer)
  //   - for each output: create new doc, copyPages, save
  return { ok: false, error: "not_implemented" };
}
