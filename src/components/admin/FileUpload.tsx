"use client";

import Image from "next/image";
import { useId, useRef, useState } from "react";
import { safeFileName } from "@/lib/storage";
import { createClient } from "@/lib/supabase/client";

/**
 * Uploads straight from the browser to Supabase Storage using the admin's
 * session, then hands the resulting URL (public bucket) or object path
 * (private bucket) back to the form. Files never pass through the Worker,
 * which sidesteps request-size limits and keeps PDFs off the edge.
 */
export function FileUpload({
  label,
  hint,
  bucket,
  folder,
  accept,
  multiple = false,
  isPublic,
  value,
  onChange,
  preview = "none",
}: {
  label: string;
  hint?: string;
  bucket: string;
  /** Object key prefix, e.g. "thumbnails". */
  folder: string;
  accept: string;
  multiple?: boolean;
  /** Public bucket → store the public URL. Private → store the object path. */
  isPublic: boolean;
  value: string[];
  onChange: (next: string[]) => void;
  /** "image" renders thumbnails of the values. */
  preview?: "none" | "image";
}) {
  const id = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function upload(files: FileList | null) {
    if (!files?.length) return;
    setBusy(true);
    setError(null);

    const supabase = createClient();
    const added: string[] = [];

    for (const file of Array.from(files)) {
      const path = `${folder}/${crypto.randomUUID()}-${safeFileName(file.name)}`;
      const { error: upErr } = await supabase.storage
        .from(bucket)
        .upload(path, file, { upsert: false, contentType: file.type });

      if (upErr) {
        setError(`${file.name}: ${upErr.message}`);
        continue;
      }
      added.push(
        isPublic ? supabase.storage.from(bucket).getPublicUrl(path).data.publicUrl : path,
      );
    }

    if (added.length) onChange(multiple ? [...value, ...added] : added.slice(0, 1));
    setBusy(false);
    if (inputRef.current) inputRef.current.value = "";
  }

  function remove(item: string) {
    // Only detaches from the form. The object stays in storage until the
    // case is deleted, so cancelling the form can't destroy anything.
    onChange(value.filter((v) => v !== item));
  }

  return (
    <div>
      <label htmlFor={id} className="block font-mono text-[10px] uppercase tracking-[0.18em] text-ash">
        {label}
      </label>
      {hint && <p className="mt-1 text-xs text-ash/80">{hint}</p>}

      {value.length > 0 && (
        <ul className={`mt-3 flex flex-wrap gap-3 ${preview === "image" ? "" : "flex-col"}`}>
          {value.map((item) => (
            <li key={item} className="group relative">
              {preview === "image" ? (
                <div className="relative h-24 w-32 overflow-hidden border border-noir-line bg-noir">
                  <Image src={item} alt="" fill sizes="128px" className="object-cover" />
                </div>
              ) : (
                <span className="inline-block max-w-full truncate border border-noir-line bg-noir-raised px-3 py-1.5 font-mono text-[11px] text-cream">
                  {item.split("/").pop()}
                </span>
              )}
              <button
                type="button"
                onClick={() => remove(item)}
                aria-label="Remove"
                className={`bg-blood px-1.5 font-mono text-[10px] text-cream hover:bg-blood-hot ${
                  preview === "image" ? "absolute -top-1 -right-1" : "ml-2"
                }`}
              >
                ×
              </button>
            </li>
          ))}
        </ul>
      )}

      <div className="mt-3 flex items-center gap-3">
        <input
          ref={inputRef}
          id={id}
          type="file"
          accept={accept}
          multiple={multiple}
          disabled={busy}
          onChange={(e) => upload(e.target.files)}
          className="block w-full text-xs text-ash file:mr-3 file:border file:border-noir-line file:bg-noir-raised file:px-3 file:py-1.5 file:font-mono file:text-[10px] file:uppercase file:tracking-[0.14em] file:text-cream hover:file:border-brass disabled:opacity-50"
        />
        {busy && (
          <span className="shrink-0 font-mono text-[10px] uppercase tracking-[0.14em] text-brass">
            Uploading…
          </span>
        )}
      </div>

      {error && (
        <p role="alert" className="mt-2 border-l-2 border-blood pl-3 font-mono text-[11px] text-cream">
          {error}
        </p>
      )}
    </div>
  );
}
