"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { WorkerRequest, WorkerResponse } from "@/types/pdf";

type FinalResponse = Extract<WorkerResponse, { ok: boolean }>;

type Pending = {
  resolve: (res: FinalResponse) => void;
  reject: (err: unknown) => void;
};

export function usePdfProcessor() {
  const workerRef = useRef<Worker | null>(null);
  const pendingRef = useRef<Map<string, Pending>>(new Map());
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const worker = new Worker(new URL("../workers/pdf.worker.ts", import.meta.url), {
      type: "module",
    });
    worker.onmessage = (event: MessageEvent<WorkerResponse>) => {
      const res = event.data;
      const pending = pendingRef.current.get(res.id);
      if (!pending) return;
      if ("progress" in res) return;
      pendingRef.current.delete(res.id);
      pending.resolve(res);
    };
    workerRef.current = worker;
    const pending = pendingRef.current;
    return () => {
      worker.terminate();
      workerRef.current = null;
      pending.clear();
    };
  }, []);

  const run = useCallback(<R extends Uint8Array | Uint8Array[]>(req: WorkerRequest): Promise<R> => {
    const worker = workerRef.current;
    if (!worker) return Promise.reject(new Error("worker_not_ready"));
    setBusy(true);
    return new Promise<R>((resolve, reject) => {
      pendingRef.current.set(req.id, {
        resolve: (res) => {
          setBusy(false);
          if (res.ok && "result" in res) resolve(res.result as R);
          else reject(new Error(res.ok ? "malformed_response" : res.error));
        },
        reject: (err) => {
          setBusy(false);
          reject(err);
        },
      });
      worker.postMessage(req);
    });
  }, []);

  return { run, busy };
}
