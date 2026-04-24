import type { PageRange } from "@/types/pdf";

export interface ParsedRanges {
  ok: true;
  ranges: PageRange[];
  pages: number[];
}

export interface ParseError {
  ok: false;
  error: string;
}

export type ParseResult = ParsedRanges | ParseError;

export function parseRangeInput(input: string, pageCount: number): ParseResult {
  const trimmed = input.trim();
  if (!trimmed) return { ok: false, error: "Enter at least one page or range" };

  const tokens = trimmed
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);

  if (tokens.length === 0) return { ok: false, error: "Enter at least one page or range" };

  const ranges: PageRange[] = [];
  const pages: number[] = [];

  for (const token of tokens) {
    if (token.includes("-")) {
      const parts = token.split("-").map((p) => p.trim());
      if (parts.length !== 2) return { ok: false, error: `Invalid range: "${token}"` };
      const from = Number(parts[0]);
      const to = Number(parts[1]);
      if (!Number.isInteger(from) || !Number.isInteger(to)) {
        return { ok: false, error: `Invalid range: "${token}"` };
      }
      if (from < 1 || to < 1) return { ok: false, error: `Pages start at 1, not 0` };
      if (from > pageCount || to > pageCount) {
        return { ok: false, error: `PDF only has ${pageCount} page${pageCount === 1 ? "" : "s"}` };
      }
      if (from > to) return { ok: false, error: `Range "${token}" goes backwards` };
      ranges.push({ from, to });
      for (let p = from; p <= to; p++) pages.push(p);
    } else {
      const n = Number(token);
      if (!Number.isInteger(n)) return { ok: false, error: `Invalid page: "${token}"` };
      if (n < 1) return { ok: false, error: `Pages start at 1, not 0` };
      if (n > pageCount) {
        return { ok: false, error: `PDF only has ${pageCount} page${pageCount === 1 ? "" : "s"}` };
      }
      ranges.push({ from: n, to: n });
      pages.push(n);
    }
  }

  return { ok: true, ranges, pages };
}

export function chunkEvery(pageCount: number, size: number): PageRange[] {
  if (size < 1 || pageCount < 1) return [];
  const out: PageRange[] = [];
  for (let start = 1; start <= pageCount; start += size) {
    const end = Math.min(start + size - 1, pageCount);
    out.push({ from: start, to: end });
  }
  return out;
}

export function formatRange(r: PageRange): string {
  return r.from === r.to ? `${r.from}` : `${r.from}-${r.to}`;
}
