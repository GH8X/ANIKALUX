const MAX_BYTES = 3 * 1024 * 1024; // 3 MB per image keeps local storage healthy

export interface ReadResult {
  url: string;
  name: string;
}

/**
 * Reads an uploaded image into a data URL. Swap this single function for an
 * upload call when the catalogue moves to object storage.
 */
export function readImageFile(file: File): Promise<ReadResult> {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith("image/")) {
      reject(new Error("not-an-image"));
      return;
    }
    if (file.size > MAX_BYTES) {
      reject(new Error("too-large"));
      return;
    }
    const reader = new FileReader();
    reader.onload = () => resolve({ url: String(reader.result), name: file.name });
    reader.onerror = () => reject(new Error("read-failed"));
    reader.readAsDataURL(file);
  });
}

export async function readImageFiles(files: FileList | File[]): Promise<ReadResult[]> {
  const list = Array.from(files);
  const results = await Promise.allSettled(list.map(readImageFile));
  return results
    .filter((r): r is PromiseFulfilledResult<ReadResult> => r.status === "fulfilled")
    .map((r) => r.value);
}

export const IMAGE_ACCEPT = "image/png,image/jpeg,image/webp,image/svg+xml,image/avif";
