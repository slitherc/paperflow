"use client";

import { Plus, Upload } from "lucide-react";
import { useCallback } from "react";
import { type FileRejection, useDropzone } from "react-dropzone";
import { toast } from "sonner";
import { ACCEPTED_MIME_TYPES, MAX_FILE_SIZE_HARD, MAX_FILE_SIZE_SOFT } from "@/lib/constants";
import { formatBytes } from "@/lib/format";

interface PdfDropzoneProps {
  onFiles: (files: File[]) => void;
  multiple?: boolean;
  title?: string;
  subtitle?: string;
  disabled?: boolean;
}

export function PdfDropzone({
  onFiles,
  multiple = true,
  title = "Drop PDF files here",
  subtitle = `or click to browse — up to ${formatBytes(MAX_FILE_SIZE_HARD)} each`,
  disabled = false,
}: PdfDropzoneProps) {
  const handleDrop = useCallback(
    (accepted: File[], rejected: FileRejection[]) => {
      if (rejected.length > 0) {
        for (const r of rejected) {
          const reason = r.errors[0];
          if (reason?.code === "file-too-large") {
            toast.error(
              `${r.file.name} is ${formatBytes(r.file.size)} — max is ${formatBytes(MAX_FILE_SIZE_HARD)}`,
            );
          } else if (reason?.code === "file-invalid-type") {
            toast.error(`${r.file.name} is not a PDF`);
          } else {
            toast.error(`${r.file.name}: ${reason?.message ?? "rejected"}`);
          }
        }
      }

      if (accepted.length === 0) return;

      const oversize = accepted.filter((f) => f.size > MAX_FILE_SIZE_SOFT);
      if (oversize.length > 0) {
        toast.warning(
          oversize.length === 1
            ? `${oversize[0].name} is over ${formatBytes(MAX_FILE_SIZE_SOFT)} — processing may be slow`
            : `${oversize.length} files are over ${formatBytes(MAX_FILE_SIZE_SOFT)} — processing may be slow`,
        );
      }

      onFiles(accepted);
    },
    [onFiles],
  );

  const { getRootProps, getInputProps, isDragActive, open } = useDropzone({
    accept: ACCEPTED_MIME_TYPES,
    maxSize: MAX_FILE_SIZE_HARD,
    multiple,
    disabled,
    onDrop: handleDrop,
    noClick: false,
    noKeyboard: false,
  });

  return (
    <div {...getRootProps({ className: `dropzone ${isDragActive ? "drag-over" : ""}` })}>
      <input {...getInputProps()} />
      <div className="dropzone-icon">
        <Upload size={28} strokeWidth={1.8} />
      </div>
      <h3>{title}</h3>
      <p>{subtitle}</p>
      <button
        type="button"
        className="pf-btn pf-btn-primary pf-btn-lg"
        onClick={(e) => {
          e.stopPropagation();
          open();
        }}
        disabled={disabled}
      >
        <Plus size={16} /> Choose files
      </button>
    </div>
  );
}
