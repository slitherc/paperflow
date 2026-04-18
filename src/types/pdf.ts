export interface PdfFile {
  id: string;
  file: File;
  name: string;
  size: number;
  pageCount?: number;
}

export interface PageInfo {
  pageNumber: number;
  width: number;
  height: number;
  rotation: 0 | 90 | 180 | 270;
}

export type Rotation = 0 | 90 | 180 | 270;

export interface PageRange {
  from: number;
  to: number;
}

export type OperationResult<T = Uint8Array> =
  | { ok: true; data: T; meta?: Record<string, unknown> }
  | { ok: false; error: string };

export type SplitMode = "pages" | "ranges" | "every";

export interface SplitOptions {
  mode: SplitMode;
  pages?: number[];
  ranges?: PageRange[];
  everyN?: number;
}

export interface RotateOptions {
  pages: Array<{ pageNumber: number; rotation: Rotation }>;
}

export interface CompressOptions {
  imageQuality: number;
  targetDpi: number;
}

export type WorkerRequest =
  | { id: string; op: "merge"; files: ArrayBuffer[] }
  | { id: string; op: "split"; file: ArrayBuffer; options: SplitOptions }
  | { id: string; op: "rotate"; file: ArrayBuffer; options: RotateOptions }
  | { id: string; op: "compress"; file: ArrayBuffer; options: CompressOptions };

export type WorkerResponse =
  | { id: string; ok: true; result: Uint8Array | Uint8Array[] }
  | { id: string; ok: false; error: string }
  | { id: string; progress: number };
