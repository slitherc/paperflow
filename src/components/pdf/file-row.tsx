"use client";

import { FileText, GripVertical, X } from "lucide-react";
import type { DragEvent } from "react";
import { formatBytes } from "@/lib/format";

interface FileRowProps {
  index: number;
  name: string;
  size: number;
  pageCount?: number;
  dragging?: boolean;
  dragTarget?: boolean;
  onRemove?: () => void;
  onDragStart?: (e: DragEvent<HTMLDivElement>) => void;
  onDragOver?: (e: DragEvent<HTMLDivElement>) => void;
  onDragEnd?: (e: DragEvent<HTMLDivElement>) => void;
  onDrop?: (e: DragEvent<HTMLDivElement>) => void;
}

export function FileRow({
  index,
  name,
  size,
  pageCount,
  dragging,
  dragTarget,
  onRemove,
  onDragStart,
  onDragOver,
  onDragEnd,
  onDrop,
}: FileRowProps) {
  const classes = ["file-row", dragging && "dragging", dragTarget && "drag-target"]
    .filter(Boolean)
    .join(" ");

  return (
    <div
      className={classes}
      draggable
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDragEnd={onDragEnd}
      onDrop={onDrop}
    >
      <span className="grip" aria-hidden="true">
        <GripVertical size={14} />
      </span>
      <span className="order-badge">{index + 1}</span>
      <span className="file-icon">
        <FileText size={18} strokeWidth={1.8} />
      </span>
      <div className="file-info">
        <h4>{name}</h4>
        <div className="meta">
          {pageCount !== undefined ? `${pageCount} pages · ` : ""}
          {formatBytes(size)}
        </div>
      </div>
      {onRemove && (
        <button
          type="button"
          className="remove-btn"
          onClick={onRemove}
          aria-label={`Remove ${name}`}
        >
          <X size={16} />
        </button>
      )}
    </div>
  );
}
