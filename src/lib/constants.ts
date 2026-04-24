export const MAX_FILE_SIZE_SOFT = 100 * 1024 * 1024;
export const MAX_FILE_SIZE_HARD = 250 * 1024 * 1024;

export const ACCEPTED_MIME_TYPES = {
  "application/pdf": [".pdf"],
} as const;

export const PDFJS_WORKER_SRC = `${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}/pdf.worker.min.mjs`;

export type ToolStatus = "live" | "soon";

export interface ToolDef {
  slug: string;
  title: string;
  description: string;
  status: ToolStatus;
  meta: string;
}

export const TOOLS: ReadonlyArray<ToolDef> = [
  {
    slug: "merge",
    title: "Merge PDFs",
    description: "Combine multiple PDFs into a single file. Drag to reorder.",
    status: "live",
    meta: "Popular",
  },
  {
    slug: "compress",
    title: "Compress PDF",
    description: "Reduce file size while keeping quality. Great for email.",
    status: "live",
    meta: "Popular",
  },
  {
    slug: "split",
    title: "Split PDF",
    description: "Extract pages or split a PDF into multiple documents.",
    status: "live",
    meta: "Popular",
  },
  {
    slug: "reorder",
    title: "Reorder Pages",
    description: "Rearrange pages by dragging thumbnails into the right order.",
    status: "soon",
    meta: "Soon",
  },
  {
    slug: "rotate",
    title: "Rotate Pages",
    description: "Fix orientation for single pages or the whole document.",
    status: "soon",
    meta: "Soon",
  },
  {
    slug: "delete",
    title: "Delete Pages",
    description: "Remove unwanted pages from your PDF with one click.",
    status: "soon",
    meta: "Soon",
  },
];

export type ToolSlug = (typeof TOOLS)[number]["slug"];

export function getTool(slug: string): ToolDef | undefined {
  return TOOLS.find((t) => t.slug === slug);
}
