import type { OperationResult, RotateOptions } from "@/types/pdf";

/**
 * Rotates specified pages of a PDF by 90, 180, or 270 degrees.
 *
 * @param buffer Input PDF as ArrayBuffer.
 * @param options {@link RotateOptions} mapping page numbers (1-indexed) to rotations.
 * @returns A {@link Uint8Array} of the rotated PDF on success.
 */
export async function rotatePdf(
  buffer: ArrayBuffer,
  options: RotateOptions,
): Promise<OperationResult> {
  void buffer;
  void options;
  // TODO: implement with pdf-lib
  //   - PDFDocument.load(buffer)
  //   - page.setRotation(degrees(angle)) for each targeted page
  //   - return doc.save()
  return { ok: false, error: "not_implemented" };
}
