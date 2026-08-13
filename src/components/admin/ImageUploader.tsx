"use client";

import { useRef, useState } from "react";

interface Props {
  images: string[];
  onChange: (images: string[]) => void;
}

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/avif"];
const MAX_SIZE_MB = 10;

async function uploadOne(file: File): Promise<string> {
  const res = await fetch("/api/upload", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ fileName: file.name, contentType: file.type }),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error ?? "Failed to get upload URL");
  }
  const { uploadUrl, publicUrl } = await res.json();

  const put = await fetch(uploadUrl, {
    method: "PUT",
    headers: { "Content-Type": file.type },
    body: file,
  });
  if (!put.ok) throw new Error(`Upload failed for ${file.name}`);

  return publicUrl;
}

export function ImageUploader({ images, onChange }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragIndex, setDragIndex] = useState<number | null>(null);

  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    setError(null);

    const valid: File[] = [];
    for (const file of Array.from(files)) {
      if (!ALLOWED_TYPES.includes(file.type)) {
        setError(`${file.name}: unsupported type (use JPEG, PNG, WebP, or AVIF)`);
        continue;
      }
      if (file.size > MAX_SIZE_MB * 1024 * 1024) {
        setError(`${file.name}: exceeds ${MAX_SIZE_MB}MB`);
        continue;
      }
      valid.push(file);
    }
    if (valid.length === 0) return;

    setUploading(true);
    try {
      const uploaded = await Promise.all(valid.map(uploadOne));
      onChange([...images, ...uploaded]);
    } catch (err: any) {
      setError(err.message ?? "Upload failed");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  function removeAt(index: number) {
    onChange(images.filter((_, i) => i !== index));
  }

  function moveTo(from: number, to: number) {
    if (from === to) return;
    const next = [...images];
    const [item] = next.splice(from, 1);
    next.splice(to, 0, item);
    onChange(next);
  }

  return (
    <div>
      <div
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          handleFiles(e.dataTransfer.files);
        }}
        onClick={() => inputRef.current?.click()}
        className="border-2 border-dashed border-[--color-border] rounded-lg p-6 text-center cursor-pointer hover:border-[--color-ink] transition-colors"
      >
        <input
          ref={inputRef}
          type="file"
          accept={ALLOWED_TYPES.join(",")}
          multiple
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />
        <p className="text-sm text-[--color-muted]">
          {uploading ? "Uploading…" : "Click or drag images here"}
        </p>
        <p className="text-xs text-[--color-muted] mt-1">JPEG, PNG, WebP, or AVIF · up to {MAX_SIZE_MB}MB each</p>
      </div>

      {error && <p className="text-red-600 text-xs mt-2">{error}</p>}

      {images.length > 0 && (
        <div className="grid grid-cols-4 gap-3 mt-4">
          {images.map((url, i) => (
            <div
              key={url}
              draggable
              onDragStart={() => setDragIndex(i)}
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => {
                if (dragIndex !== null) moveTo(dragIndex, i);
                setDragIndex(null);
              }}
              className="relative aspect-square rounded-lg overflow-hidden border border-[--color-border] group cursor-move"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={url} alt="" className="w-full h-full object-cover" />
              {i === 0 && (
                <span className="absolute top-1 left-1 bg-black text-white text-[9px] uppercase tracking-wide px-1.5 py-0.5 rounded">
                  Primary
                </span>
              )}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  removeAt(i);
                }}
                className="absolute top-1 right-1 bg-white/90 hover:bg-white text-black rounded-full w-5 h-5 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                aria-label="Remove image"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
