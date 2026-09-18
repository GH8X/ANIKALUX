import { useMemo, useRef, useState } from "react";
import { Copy, Film, ImagePlus, Plus, Save, Trash2, Upload } from "lucide-react";
import { toast } from "sonner";
import { FieldRow, MoveButtons, SectionCard, Switch } from "@/components/admin/PanelShell";
import { TranslationsField } from "@/components/admin/TranslationsField";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/field";
import { Card } from "@/components/ui/surface";
import { useI18n } from "@/lib/i18n";
import { IMAGE_ACCEPT, readImageFiles } from "@/lib/image";
import { newId, useStore } from "@/lib/store";
import type { FaqItem, MediaAsset, Testimonial } from "@/lib/types";

/* ------------------------------------------------------------- Testimonials */

export function TestimonialsPanel() {
  const { t } = useI18n();
  const { testimonials, saveTestimonial, deleteTestimonial, moveTestimonial } = useStore();
  const [draft, setDraft] = useState<Testimonial[]>(testimonials);

  const ordered = useMemo(
    () => [...draft].sort((a, b) => a.order - b.order),
    [draft],
  );

  const patch = (id: string, changes: Partial<Testimonial>) =>
    setDraft((current) => current.map((item) => (item.id === id ? { ...item, ...changes } : item)));

  const add = () => {
    const item: Testimonial = {
      id: newId("tst"),
      author: "",
      businessName: "",
      wilaya: "",
      quote: { primary: "" },
      rating: 5,
      active: true,
      order: draft.length + 1,
    };
    setDraft((current) => [...current, item]);
  };

  const persist = (item: Testimonial) => {
    saveTestimonial(item);
    toast.success(t.toast.saved);
  };

  const remove = (id: string) => {
    deleteTestimonial(id);
    setDraft((current) => current.filter((item) => item.id !== id));
    toast.success(t.toast.deleted);
  };

  return (
    <SectionCard
      title={t.admin.testimonials}
      description={t.admin.testimonialsHint}
      actions={
        <Button size="sm" onClick={add}>
          <Plus /> {t.admin.addTestimonial}
        </Button>
      }
    >
      {ordered.length === 0 ? (
        <p className="rounded-md border border-dashed border-border/70 bg-muted/40 p-6 text-center text-sm text-muted-foreground">
          {t.admin.noTestimonials} — {t.admin.noTestimonialsHint}
        </p>
      ) : (
        <ul className="space-y-4">
          {ordered.map((item, index) => (
            <li key={item.id}>
              <Card className="space-y-4 p-4">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-[0.7rem] font-medium uppercase tracking-[0.14em] text-muted-foreground">
                    #{index + 1}
                  </span>
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={item.active}
                      label={item.active ? t.admin.disable : t.admin.enable}
                      onChange={(next) => {
                        const updated = { ...item, active: next };
                        patch(item.id, { active: next });
                        persist(updated);
                      }}
                    />
                    <MoveButtons
                      upLabel={t.admin.moveUp}
                      downLabel={t.admin.moveDown}
                      canUp={index > 0}
                      canDown={index < ordered.length - 1}
                      onMove={(direction) => {
                        moveTestimonial(item.id, direction);
                        setDraft((current) => {
                          const list = [...current].sort((a, b) => a.order - b.order);
                          const at = list.findIndex((x) => x.id === item.id);
                          const to = direction === "up" ? at - 1 : at + 1;
                          if (at < 0 || to < 0 || to >= list.length) return current;
                          const [moved] = list.splice(at, 1);
                          list.splice(to, 0, moved);
                          return list.map((x, i) => ({ ...x, order: i + 1 }));
                        });
                      }}
                    />
                    <button
                      type="button"
                      aria-label={t.admin.deleteProduct}
                      onClick={() => remove(item.id)}
                      className="grid size-7 place-items-center rounded-sm border border-border/70 text-muted-foreground transition-colors hover:border-destructive/40 hover:text-destructive"
                    >
                      <Trash2 className="size-3.5" />
                    </button>
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-3">
                  <FieldRow label={t.admin.name}>
                    <Input
                      value={item.author}
                      onChange={(event) => patch(item.id, { author: event.target.value })}
                    />
                  </FieldRow>
                  <FieldRow label={t.admin.business}>
                    <Input
                      value={item.businessName}
                      onChange={(event) => patch(item.id, { businessName: event.target.value })}
                    />
                  </FieldRow>
                  <FieldRow label={t.admin.wilaya}>
                    <Input
                      value={item.wilaya}
                      onChange={(event) => patch(item.id, { wilaya: event.target.value })}
                    />
                  </FieldRow>
                </div>

                <TranslationsField
                  id={`tst-${item.id}-quote`}
                  label={t.admin.testimonialQuote}
                  multiline
                  value={item.quote}
                  onChange={(value) => patch(item.id, { quote: value })}
                />

                <div className="flex flex-wrap items-end justify-between gap-3">
                  <FieldRow label={t.admin.testimonialRating} className="w-32">
                    <Input
                      type="number"
                      min={1}
                      max={5}
                      value={item.rating}
                      onChange={(event) =>
                        patch(item.id, {
                          rating: Math.min(5, Math.max(1, Number(event.target.value) || 5)),
                        })
                      }
                    />
                  </FieldRow>
                  <Button size="sm" onClick={() => persist(item)}>
                    <Save /> {t.admin.save}
                  </Button>
                </div>
              </Card>
            </li>
          ))}
        </ul>
      )}
    </SectionCard>
  );
}

/* ---------------------------------------------------------------------- FAQ */

export function FaqPanel() {
  const { t } = useI18n();
  const { faq, saveFaq, deleteFaq, moveFaq } = useStore();
  const [draft, setDraft] = useState<FaqItem[]>(faq);

  const ordered = useMemo(() => [...draft].sort((a, b) => a.order - b.order), [draft]);

  const patch = (id: string, changes: Partial<FaqItem>) =>
    setDraft((current) => current.map((item) => (item.id === id ? { ...item, ...changes } : item)));

  const add = () => {
    const item: FaqItem = {
      id: newId("faq"),
      question: { primary: "" },
      answer: { primary: "" },
      active: true,
      order: draft.length + 1,
    };
    setDraft((current) => [...current, item]);
  };

  const persist = (item: FaqItem) => {
    saveFaq(item);
    toast.success(t.toast.saved);
  };

  const remove = (id: string) => {
    deleteFaq(id);
    setDraft((current) => current.filter((item) => item.id !== id));
    toast.success(t.toast.deleted);
  };

  return (
    <SectionCard
      title={t.admin.faq}
      description={t.admin.faqHint}
      actions={
        <Button size="sm" onClick={add}>
          <Plus /> {t.admin.addFaq}
        </Button>
      }
    >
      {ordered.length === 0 ? (
        <p className="rounded-md border border-dashed border-border/70 bg-muted/40 p-6 text-center text-sm text-muted-foreground">
          {t.admin.noFaq} — {t.admin.noFaqHint}
        </p>
      ) : (
        <ul className="space-y-4">
          {ordered.map((item, index) => (
            <li key={item.id}>
              <Card className="space-y-4 p-4">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-[0.7rem] font-medium uppercase tracking-[0.14em] text-muted-foreground">
                    #{index + 1}
                  </span>
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={item.active}
                      label={item.active ? t.admin.disable : t.admin.enable}
                      onChange={(next) => {
                        patch(item.id, { active: next });
                        persist({ ...item, active: next });
                      }}
                    />
                    <MoveButtons
                      upLabel={t.admin.moveUp}
                      downLabel={t.admin.moveDown}
                      canUp={index > 0}
                      canDown={index < ordered.length - 1}
                      onMove={(direction) => {
                        moveFaq(item.id, direction);
                        setDraft((current) => {
                          const list = [...current].sort((a, b) => a.order - b.order);
                          const at = list.findIndex((x) => x.id === item.id);
                          const to = direction === "up" ? at - 1 : at + 1;
                          if (at < 0 || to < 0 || to >= list.length) return current;
                          const [moved] = list.splice(at, 1);
                          list.splice(to, 0, moved);
                          return list.map((x, i) => ({ ...x, order: i + 1 }));
                        });
                      }}
                    />
                    <button
                      type="button"
                      aria-label={t.admin.deleteProduct}
                      onClick={() => remove(item.id)}
                      className="grid size-7 place-items-center rounded-sm border border-border/70 text-muted-foreground transition-colors hover:border-destructive/40 hover:text-destructive"
                    >
                      <Trash2 className="size-3.5" />
                    </button>
                  </div>
                </div>

                <TranslationsField
                  id={`faq-${item.id}-q`}
                  label={t.admin.question}
                  value={item.question}
                  onChange={(value) => patch(item.id, { question: value })}
                />
                <TranslationsField
                  id={`faq-${item.id}-a`}
                  label={t.admin.answer}
                  multiline
                  value={item.answer}
                  onChange={(value) => patch(item.id, { answer: value })}
                />

                <div className="flex justify-end">
                  <Button size="sm" onClick={() => persist(item)}>
                    <Save /> {t.admin.save}
                  </Button>
                </div>
              </Card>
            </li>
          ))}
        </ul>
      )}
    </SectionCard>
  );
}

/* ----------------------------------------------------------- Media library */

export function MediaPanel() {
  const { t } = useI18n();
  const { media, addMedia, deleteMedia } = useStore();
  const fileInput = useRef<HTMLInputElement>(null);
  const [url, setUrl] = useState("");
  const [type, setType] = useState<MediaAsset["type"]>("image");

  const upload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    try {
      const results = await readImageFiles(files);
      if (results.length === 0) throw new Error("empty");
      results.forEach((result) => addMedia({ url: result.url, name: result.name, type: "image" }));
      toast.success(t.toast.created);
    } catch {
      toast.error(t.toast.error);
    } finally {
      if (fileInput.current) fileInput.current.value = "";
    }
  };

  const addFromUrl = () => {
    const value = url.trim();
    if (!value) return;
    addMedia({ url: value, name: value.split("/").pop() || value, type });
    setUrl("");
    toast.success(t.toast.created);
  };

  const copy = async (value: string) => {
    try {
      await navigator.clipboard.writeText(value);
      toast.success(t.toast.copied);
    } catch {
      toast.error(t.toast.error);
    }
  };

  return (
    <SectionCard title={t.admin.mediaTitle} description={t.admin.mediaHint}>
      <div className="space-y-5">
        <div className="flex flex-wrap items-end gap-3">
          <input
            ref={fileInput}
            type="file"
            accept={IMAGE_ACCEPT}
            multiple
            className="hidden"
            onChange={(event) => void upload(event.target.files)}
          />
          <Button variant="outline" onClick={() => fileInput.current?.click()}>
            <Upload /> {t.admin.uploadMedia}
          </Button>
          <FieldRow label={t.admin.addByUrl} className="min-w-56 flex-1">
            <Input
              value={url}
              placeholder={t.admin.mediaUrlPlaceholder}
              onChange={(event) => setUrl(event.target.value)}
            />
          </FieldRow>
          <FieldRow label={t.admin.video} className="w-36">
            <select
              value={type}
              onChange={(event) => setType(event.target.value as MediaAsset["type"])}
              className="h-11 w-full rounded-sm border border-input bg-card px-3 text-sm"
            >
              <option value="image">Image</option>
              <option value="video">Video</option>
            </select>
          </FieldRow>
          <Button onClick={addFromUrl} disabled={!url.trim()}>
            <Plus /> {t.admin.addByUrl}
          </Button>
        </div>

        {media.length === 0 ? (
          <p className="rounded-md border border-dashed border-border/70 bg-muted/40 p-6 text-center text-sm text-muted-foreground">
            {t.admin.noMedia} — {t.admin.noMediaHint}
          </p>
        ) : (
          <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {media.map((asset) => (
              <li key={asset.id}>
                <Card className="overflow-hidden">
                  <div className="grid h-32 place-items-center bg-muted">
                    {asset.type === "video" ? (
                      <Film className="size-7 text-muted-foreground" aria-hidden="true" />
                    ) : (
                      // eslint-disable-next-line jsx-a11y/img-redundant-alt
                      <img src={asset.url} alt={asset.name} className="size-full object-cover" />
                    )}
                  </div>
                  <div className="space-y-2 p-2.5">
                    <p className="truncate text-[0.7rem] text-muted-foreground" title={asset.name}>
                      {asset.name}
                    </p>
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => void copy(asset.url)}
                        title={t.admin.copyUrl}
                        className="flex flex-1 items-center justify-center gap-1.5 rounded-sm border border-border/70 py-1.5 text-[0.68rem] font-medium text-muted-foreground transition-colors hover:border-primary/40 hover:text-primary"
                      >
                        <Copy className="size-3" /> {t.admin.copyUrl}
                      </button>
                      <button
                        type="button"
                        aria-label={t.admin.deleteMedia}
                        title={t.admin.deleteMedia}
                        onClick={() => {
                          deleteMedia(asset.id);
                          toast.success(t.toast.deleted);
                        }}
                        className="grid size-7 place-items-center rounded-sm border border-border/70 text-muted-foreground transition-colors hover:border-destructive/40 hover:text-destructive"
                      >
                        <Trash2 className="size-3.5" />
                      </button>
                    </div>
                  </div>
                </Card>
              </li>
            ))}
          </ul>
        )}

        <p className="flex items-center gap-2 text-[0.7rem] text-muted-foreground">
          <ImagePlus className="size-3.5" aria-hidden="true" />
          {t.admin.mediaUrlPlaceholder}
        </p>
      </div>
    </SectionCard>
  );
}
