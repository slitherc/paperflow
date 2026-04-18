import { copyFile, mkdir } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);

const workerSrc = require.resolve("pdfjs-dist/build/pdf.worker.min.mjs");
const workerDest = resolve(process.cwd(), "public", "pdf.worker.min.mjs");

await mkdir(dirname(workerDest), { recursive: true });
await copyFile(workerSrc, workerDest);

console.log(`[pdfjs] worker copied -> ${workerDest}`);
