"use client";

import Image from "next/image";
import { useId, useRef, useState } from "react";
import { MAX_UPLOAD_BYTES, formatBytes, safeFileName } from "@/lib/storage";
import { createClient } from "@/lib/supabase/client";
import { getSupabaseEnv } from "@/lib/supabase/env";

/**
 * PUTs one file to Supabase Storage with XHR, because fetch and the
 * supabase-js client can't report upload progress. Same endpoint and auth
 * the client library uses: the admin's access token + the anon key.
 * Resolves with an error message, or null on success.
 */
function putWithProgress(
  bucket: string,
  path: string,
  file: File,
  accessToken: string,
  onProgress: (fraction: number) => void,
): Promise<string | null> {
  const { url, key } = getSupabaseEnv();
  const endpoint = `${url}/storage/v1/object/${bucket}/${path.split("/").map(encodeURIComponent).join("/")}`;

  return new Promise((resolve) => {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", endpoint);
    xhr.setRequestHeader("Authorization", `Bearer ${accessToken}`);
    xhr.setRequestHeader("apikey", key);
    xhr.setRequestHeader("x-upsert", "false");
    xhr.setRequestHeader("Content-Type", file.type || "application/octet-stream");

    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) onProgress(e.loaded / e.total);
    };
    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) return resolve(null);
      let message = `Upload failed (HTTP ${xhr.status}).`;
      try {
        const body = JSON.parse(xhr.responseText) as { message?: string; error?: string };
        message = body.message ?? body.error ?? message;
      } catch {
        // non-JSON body; keep the status message
      }
      resolve(xhr.status === 413 ? "too-large" : message);
    };
    xhr.onerror = () => resolve("Network error — check the connection and try again.");
    xhr.send(file);
  });
}

/**
 * Uploads straight from the browser to Supabase Storage using the admin's
 * session, then hands the resulting URL (public bucket) or object path
 * (private bucket) back to the form. Files never pass through the Worker,
 * so its request-size limit doesn't apply — the ceiling is the bucket's
 * (MAX_UPLOAD_BYTES), which is checked here before any bytes move.
 *
 * Object keys are `<folder>/<uuid>-<safeFileName>`: a name like
 * "Goyenda Case #001 – Load-Shedding.pdf" becomes
 * "cases/<uuid>-goyenda-case-001-load-shedding.pdf".
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
  const [errors, setErrors] = useState<string[]>([]);
  /** Current file's name, its position in the batch, and 0..1 progress. */
  const [progress, setProgress] = useState<{ name: string; index: number; total: number; fraction: number } | null>(null);

  const maxBytes = MAX_UPLOAD_BYTES[bucket];
  const tooBig = (file: File) =>
    `${file.name} is ${formatBytes(file.size)}. The limit is ${formatBytes(maxBytes)} per file` +
    (bucket === "case-files"
      ? " (Supabase free plan). Compress the PDF — downsampling photos to 150–200 dpi usually cuts it several-fold — then upload again."
      : ". Resize or compress the image, then upload again.");

  async function upload(files: FileList | null) {
    if (!files?.length) return;
    const list = Array.from(files);
    const failures: string[] = [];

    // Reject oversize files before touching the network.
    const sendable = list.filter((file) => {
      if (maxBytes && file.size > maxBytes) {
        failures.push(tooBig(file));
        return false;
      }
      return true;
    });

    setErrors(failures);
    if (!sendable.length) {
      if (inputRef.current) inputRef.current.value = "";
      return;
    }

    setBusy(true);
    const supabase = createClient();
    const { data } = await supabase.auth.getSession();
    const token = data.session?.access_token;
    if (!token) {
      setErrors([...failures, "Your admin session expired — sign in again, then upload."]);
      setBusy(false);
      return;
    }

    const added: string[] = [];
    for (const [i, file] of sendable.entries()) {
      const path = `${folder}/${crypto.randomUUID()}-${safeFileName(file.name)}`;
      setProgress({ name: file.name, index: i + 1, total: sendable.length, fraction: 0 });

      const failed = await putWithProgress(bucket, path, file, token, (fraction) =>
        setProgress({ name: file.name, index: i + 1, total: sendable.length, fraction }),
      );
      if (failed) {
        failures.push(failed === "too-large" ? tooBig(file) : `${file.name}: ${failed}`);
        continue;
      }
      added.push(
        isPublic ? supabase.storage.from(bucket).getPublicUrl(path).data.publicUrl : path,
      );
    }

    if (added.length) onChange(multiple ? [...value, ...added] : added.slice(0, 1));
    setErrors(failures);
    setProgress(null);
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
      {maxBytes && (
        <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.14em] text-ash/80">
          Max {formatBytes(maxBytes)} per file
        </p>
      )}

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
        {busy && !progress && (
          <span className="shrink-0 font-mono text-[10px] uppercase tracking-[0.14em] text-brass">
            Starting…
          </span>
        )}
      </div>

      {progress && (
        <div className="mt-3" role="status" aria-live="polite">
          <div className="flex justify-between gap-4 font-mono text-[10px] uppercase tracking-[0.14em] text-ash">
            <span className="truncate">
              {progress.total > 1 ? `${progress.index}/${progress.total} · ` : ""}
              {progress.name}
            </span>
            <span className="shrink-0 text-brass">{Math.round(progress.fraction * 100)}%</span>
          </div>
          <div className="mt-1.5 h-1 w-full bg-noir-line">
            <div
              className="h-1 bg-brass transition-[width] duration-200"
              style={{ width: `${Math.round(progress.fraction * 100)}%` }}
            />
          </div>
        </div>
      )}

      {errors.map((message) => (
        <p
          key={message}
          role="alert"
          className="mt-2 border-l-2 border-blood pl-3 font-mono text-[11px] leading-relaxed text-cream"
        >
          {message}
        </p>
      ))}
    </div>
  );
}
