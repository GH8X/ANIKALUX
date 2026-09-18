import { useRef, useState } from "react";
import { ImagePlus, Link2, Star, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/field";
import { useI18n } from "@/lib/i18n";
import { IMAGE_ACCEPT, readImageFiles } from "@/lib/image";
import { useStore } from "@/lib/store";
import type { ProductImage } from "@/lib/types";
import { cn } from "@/lib/utils";

interface ImageUploaderProps {
  images: ProductImage[];
  mainImageId: string | null;
  onChange: (images: ProductImage[], mainImageId: string | null) => void;
}

export function ImageUploader({ images, mainImageId, onChange }: ImageUploaderProps) {
  const { t } = useI18n();
  const { settings } = useStore();
  const inputRef = useRef<HTMLInputElement>(null);
  const [url, setUrl] = useState("");
  const [busy, setBusy] = useState(false);

  const addFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setBusy(true);
    try {
      const results = await readImageFiles(files);
      if (results.length === 0) {
        toast.error(t.toast.error);
        return;
      }
      const next: ProductImage[] = results.map((result) => ({
        id: `img-${Math.random().toString(36).slice(2, 10)}`,
        url: result.url,
      }));
      const merged = [...images, ...next];
      onChange(merged, mainImageId ?? merged[0].id);
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  const addUrl = () => {
    const trimmed = url.trim();
    if (!trimmed) return;
    const next: ProductImage[] = [
      ...images,
      { id: `img-${Math.random().toString(36).slice(2, 10)}`, url: trimmed },
    ];
    onChange(next, mainImageId ?? next[0].id);
    setUrl("");
  };

  const remove = (id: string) => {
    const next = images.filter((image) => image.id !== id);
    onChange(next, mainImageId === id ? (next[0]?.id ?? null) : mainImageId);
  };

  return (
    <div className="space-y-3">
      <Label>{t.admin.images}</Label>

      {images.length > 0 && (
        <ul className="grid grid-cols-3 gap-2.5 sm:grid-cols-4">
          {images.map((image) => {
            const isMain = image.id === mainImageId;
            return (
              <li
                key={image.id}
                className={cn(
                  "group relative aspect-square overflow-hidden rounded-md border bg-muted",
                  isMain ? "border-primary ring-2 ring-primary/25" : "border-border",
                )}
              >
                <img
                  src={image.url}
                  alt=""
                  loading="lazy"
                  className="h-full w-full object-cover"
                />
                <div className="absolute inset-x-0 bottom-0 flex justify-between gap-1 bg-wine-950/70 p-1.5 opacity-0 backdrop-blur-sm transition-opacity group-hover:opacity-100">
                  <button
                    type="button"
                    onClick={() => onChange(images, image.id)}
                    aria-label={t.admin.setMainImage}
                    title={t.admin.setMainImage}
                    className="grid size-7 place-items-center rounded text-cream-100 transition-colors hover:bg-white/15"
                  >
                    <Star className={cn("size-3.5", isMain && "fill-gold-400 text-gold-400")} />
                  </button>
                  <button
                    type="button"
                    onClick={() => remove(image.id)}
                    aria-label={t.admin.removeImage}
                    title={t.admin.removeImage}
                    className="grid size-7 place-items-center rounded text-cream-100 transition-colors hover:bg-white/15"
                  >
                    <Trash2 className="size-3.5" />
                  </button>
                </div>
                {isMain && (
                  <span className="absolute start-1.5 top-1.5 rounded-full bg-primary px-1.5 py-0.5 text-[0.55rem] font-medium uppercase tracking-[0.1em] text-primary-foreground">
                    {t.admin.mainImage}
                  </span>
                )}
              </li>
            );
          })}
        </ul>
      )}

      <div className="flex flex-wrap gap-2">
        <input
          ref={inputRef}
          type="file"
          accept={IMAGE_ACCEPT}
          multiple
          className="sr-only"
          onChange={(event) => void addFiles(event.target.files)}
        />
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={busy}
          onClick={() => inputRef.current?.click()}
        >
          <ImagePlus /> {busy ? t.states.loading : t.admin.uploadImages}
        </Button>
      </div>

      <div className="flex gap-2">
        <Input
          value={url}
          onChange={(event) => setUrl(event.target.value)}
          placeholder={`${settings.brand.name} — https://…`}
          type="url"
          dir="ltr"
          className="h-9 text-[0.8rem]"
        />
        <Button type="button" variant="ghost" size="sm" onClick={addUrl} disabled={!url.trim()}>
          <Link2 /> {t.admin.save}
        </Button>
      </div>
    </div>
  );
}
