/// <reference lib="webworker" />
import { compressPdf } from "@/lib/pdf/compress";
import { mergePdfs } from "@/lib/pdf/merge";
import { rotatePdf } from "@/lib/pdf/rotate";
import { splitPdf } from "@/lib/pdf/split";
import type { WorkerRequest, WorkerResponse } from "@/types/pdf";

declare const self: DedicatedWorkerGlobalScope;

self.onmessage = async (event: MessageEvent<WorkerRequest>) => {
  const msg = event.data;
  try {
    switch (msg.op) {
      case "merge": {
        const result = await mergePdfs(msg.files);
        post(
          result.ok
            ? { id: msg.id, ok: true, result: result.data }
            : { id: msg.id, ok: false, error: result.error },
        );
        return;
      }
      case "split": {
        const result = await splitPdf(msg.file, msg.options);
        post(
          result.ok
            ? { id: msg.id, ok: true, result: result.data }
            : { id: msg.id, ok: false, error: result.error },
        );
        return;
      }
      case "rotate": {
        const result = await rotatePdf(msg.file, msg.options);
        post(
          result.ok
            ? { id: msg.id, ok: true, result: result.data }
            : { id: msg.id, ok: false, error: result.error },
        );
        return;
      }
      case "compress": {
        const result = await compressPdf(msg.file, msg.options);
        post(
          result.ok
            ? { id: msg.id, ok: true, result: result.data }
            : { id: msg.id, ok: false, error: result.error },
        );
        return;
      }
    }
  } catch (err) {
    post({
      id: msg.id,
      ok: false,
      error: err instanceof Error ? err.message : "unknown_error",
    });
  }
};

function post(message: WorkerResponse) {
  self.postMessage(message);
}
