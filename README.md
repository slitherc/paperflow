# Paperflow

Private, in-browser PDF tools. Merge, split, compress and edit PDFs entirely on your device — no uploads, no accounts, no watermarks.

## Why

Most online PDF tools upload your file to a server you don't control. Paperflow processes everything in the browser using WebAssembly-backed libraries, so your documents never leave your machine.

## Features

- **Merge PDFs** — Combine multiple files into one, drag-and-drop to reorder.
- **Compress PDF** — Shrink file size via image downsampling and metadata stripping.
- **Split PDF** _(in progress)_ — Extract pages or split into multiple files.
- **Rotate Pages** _(in progress)_ — 90°/180°/270° per page or document.
- **Reorder Pages** _(in progress)_ — Drag thumbnails to rearrange.
- **Delete Pages** _(in progress)_ — Remove unwanted pages.

All operations run client-side. Large files (100 MB+) trigger a performance warning; the hard limit is 250 MB.

## Tech Stack

- **Framework:** Next.js 16 (App Router) + React 19, TypeScript strict
- **Styling:** Tailwind CSS v4, custom glass/aurora design system
- **UI Kit:** shadcn/ui (Radix + Nova preset), Lucide icons, Sonner toasts, next-themes
- **PDF Processing:** [`pdf-lib`](https://pdf-lib.js.org/) for manipulation, [`pdfjs-dist`](https://mozilla.github.io/pdf.js/) for rendering/preview
- **File Uploads:** [`react-dropzone`](https://react-dropzone.js.org/)
- **State:** React state (Zustand available for future cross-tool flows)
- **Package Manager:** pnpm

## Architecture

- **Privacy-first:** No server-side PDF processing. Files are read as `ArrayBuffer` in the browser and passed to `pdf-lib` / `pdfjs-dist` directly.
- **Web Worker ready:** `src/workers/pdf.worker.ts` + `src/hooks/use-pdf-processor.ts` provide a typed, promise-based worker channel. Tool pages currently invoke PDF logic on the main thread; flip the import from `@/lib/pdf/*` to `usePdfProcessor().run(...)` to move off the main thread for large files.
- **PDF worker:** `scripts/copy-pdfjs-worker.mjs` copies `pdfjs-dist`'s worker to `public/pdf.worker.min.mjs` on `postinstall`/`predev`/`prebuild` — no bundler hacks.

### Folder structure

```
src/
├── app/
│   ├── layout.tsx            # Header + Footer + aurora backdrop + providers
│   ├── page.tsx              # Landing
│   └── tools/
│       ├── merge/            # live
│       ├── compress/         # live
│       ├── split/            # soon
│       ├── reorder/          # soon
│       ├── rotate/           # soon
│       └── delete/           # soon
├── components/
│   ├── layout/               # Header, Footer, ThemeToggle
│   ├── pdf/                  # PdfDropzone, FileRow, ProgressRing, Segmented, Steps, Crumb, PageThumbnail, PdfPreview, ComingSoon
│   ├── theme-provider.tsx
│   └── ui/                   # shadcn components
├── hooks/
│   └── use-pdf-processor.ts  # typed Worker channel
├── lib/
│   ├── constants.ts          # MAX_FILE_SIZE_SOFT/HARD, TOOLS registry
│   ├── download.ts
│   ├── format.ts
│   ├── pdf/                  # merge, split, rotate, compress (stubs)
│   └── utils.ts              # shadcn cn()
├── types/
│   └── pdf.ts                # WorkerRequest/Response, OperationResult, etc.
└── workers/
    └── pdf.worker.ts
```

## Getting Started

Requires Node 18.17+ and pnpm 9+.

```bash
pnpm install
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

### Scripts

| Command                  | What it does                                           |
| ------------------------ | ------------------------------------------------------ |
| `pnpm dev`               | Dev server with Turbopack (copies pdfjs worker first). |
| `pnpm build`             | Production build.                                      |
| `pnpm start`             | Serve the production build.                            |
| `pnpm lint`              | ESLint with Next.js + Prettier configs.                |
| `pnpm format`            | Format everything with Prettier.                       |
| `pnpm format:check`      | Check formatting in CI.                                |
| `pnpm typecheck`         | `tsc --noEmit`.                                        |
| `pnpm copy-pdfjs-worker` | Manually refresh `public/pdf.worker.min.mjs`.          |

## Implementing the PDF logic

The tool pages render end-to-end flows, but the actual PDF operations in `src/lib/pdf/*.ts` return `{ ok: false, error: "not_implemented" }`. Each file has a TODO block pointing at the approach:

- **merge.ts** — `PDFDocument.create()`, copy pages from each input, save.
- **split.ts** — load, copy pages into N output documents per the `SplitOptions`.
- **rotate.ts** — load, `page.setRotation(degrees(angle))` for each targeted page.
- **compress.ts** — walk image XObjects, re-encode at target DPI/quality, re-embed.

When a function returns real `Uint8Array` output, the Download button in the corresponding tool page automatically enables — no UI changes needed.

## Deployment

### GitHub Pages (default)

Configured via `.github/workflows/deploy.yml`. First-time setup:

1. Push the repo to GitHub.
2. In **Settings → Pages → Build and deployment**, pick **GitHub Actions** as the source.
3. Every push to `main` builds a static export (`out/`) and deploys it to `https://<username>.github.io/paperflow/`.

The workflow sets `NEXT_PUBLIC_BASE_PATH=/paperflow` at build time so asset URLs and the pdfjs worker path are prefixed correctly. Change the base path in the workflow and in the deploy URL if the repo name changes.

### Other targets

`pnpm build` emits a static site — no server needed. Drop `out/` into any static host (Vercel, Netlify, Cloudflare Pages, S3, etc.). On a root-level host, unset `NEXT_PUBLIC_BASE_PATH` before building.

## Roadmap

- [x] Project scaffold (Next.js 16, Tailwind v4, shadcn/ui)
- [x] Glass/aurora design system ported
- [x] Merge PDFs — UI complete, logic stub
- [x] Compress PDF — UI complete, logic stub
- [ ] Implement `lib/pdf/merge.ts`
- [ ] Implement `lib/pdf/compress.ts`
- [ ] Split PDF (UI + logic)
- [ ] Reorder Pages (UI + logic)
- [ ] Rotate Pages (UI + logic)
- [ ] Delete Pages (UI + logic)
- [ ] Move heavy ops to the Web Worker by default
- [ ] ZIP download for split outputs
- [ ] PDF page drag-and-drop across tools (cross-tool state)
- [ ] Dark mode polish pass

## License

MIT.
