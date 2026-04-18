export function downloadBlob(
  data: Uint8Array | ArrayBuffer | Blob | string,
  filename: string,
  mime = "application/pdf",
): void {
  const part = (data instanceof Uint8Array ? data.buffer.slice(0) : data) as BlobPart;
  const blob = new Blob([part], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
