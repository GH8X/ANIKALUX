import { useRef, useState } from "react";
import { Check, ExternalLink, ImagePlus, Save } from "lucide-react";
import { toast } from "sonner";
import { FieldRow, SectionCard, Switch } from "@/components/admin/PanelShell";
import { TranslationsField } from "@/components/admin/TranslationsField";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/field";
import { useI18n } from "@/lib/i18n";
import { IMAGE_ACCEPT, readImageFile } from "@/lib/image";
import { useStore } from "@/lib/store";
import { SOCIAL_KEYS, type SiteSettings, type SocialKey } from "@/lib/types";

/* -------------------------------------------------------------------- Social */

/** Which settings field backs each network, so the panel stays declarative. */
const SOCIAL_TARGET: Record<SocialKey, { bucket: "contact" | "social"; field: string }> = {
  whatsapp: { bucket: "contact", field: "whatsapp" },
  instagram: { bucket: "contact", field: "instagram" },
  facebook: { bucket: "contact", field: "facebook" },
  tiktok: { bucket: "contact", field: "tiktok" },
  youtube: { bucket: "social", field: "youtube" },
  telegram: { bucket: "social", field: "telegram" },
};

export function SocialPanel() {
  const { t } = useI18n();
  const { settings, saveSettings } = useStore();
  const [draft, setDraft] = useState<SiteSettings>(settings);

  const read = (key: SocialKey) => {
    const target = SOCIAL_TARGET[key];
    if (target.bucket === "social") {
      return (draft.social as unknown as Record<string, string>)[target.field] ?? "";
    }
    return (draft.contact as unknown as Record<string, string>)[target.field] ?? "";
  };

  const write = (key: SocialKey, value: string) => {
    const target = SOCIAL_TARGET[key];
    setDraft((current) => {
      if (target.bucket === "social") {
        return {
          ...current,
          social: { ...current.social, [target.field]: value } as SiteSettings["social"],
        };
      }
      return {
        ...current,
        contact: { ...current.contact, [target.field]: value } as SiteSettings["contact"],
      };
    });
  };

  const toggle = (key: SocialKey, enabled: boolean) =>
    setDraft((current) => ({
      ...current,
      social: {
        ...current.social,
        hidden: enabled
          ? current.social.hidden.filter((item) => item !== key)
          : [...new Set([...current.social.hidden, key])],
      },
    }));

  const label = (key: SocialKey) => {
    if (key === "youtube") return t.admin.youtube;
    if (key === "telegram") return t.admin.telegram;
    if (key === "whatsapp") return t.contact.whatsapp;
    if (key === "instagram") return t.contact.instagram;
    if (key === "facebook") return t.contact.facebook;
    return t.contact.tiktok;
  };

  return (
    <SectionCard
      title={t.admin.networks}
      description={t.admin.socialHint}
      actions={
        <Button
          size="sm"
          onClick={() => {
            saveSettings(draft);
            toast.success(t.toast.saved);
          }}
        >
          <Save /> {t.admin.save}
        </Button>
      }
    >
      <ul className="space-y-3">
        {SOCIAL_KEYS.map((key) => {
          const enabled = !draft.social.hidden.includes(key);
          const value = read(key);
          return (
            <li
              key={key}
              className="flex flex-wrap items-end gap-3 rounded-md border border-border/70 bg-card px-4 py-3"
            >
              <div className="min-w-0 flex-1">
                <FieldRow label={label(key)}>
                  <Input
                    value={value}
                    dir="ltr"
                    placeholder={key === "whatsapp" ? "+213…" : "https://…"}
                    onChange={(event) => write(key, event.target.value)}
                  />
                </FieldRow>
              </div>
              <div className="flex items-center gap-3 pb-1">
                <span className="text-[0.7rem] text-muted-foreground">
                  {enabled ? t.admin.enable : t.admin.disable}
                </span>
                <Switch
                  checked={enabled}
                  label={enabled ? t.admin.disable : t.admin.enable}
                  onChange={(next) => toggle(key, next)}
                />
                {value && (
                  <a
                    href={value.startsWith("http") ? value : `https://wa.me/${value}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="grid size-8 place-items-center rounded-sm border border-border/70 text-muted-foreground transition-colors hover:border-primary/40 hover:text-primary"
                    title={label(key)}
                  >
                    <ExternalLink className="size-3.5" />
                  </a>
                )}
              </div>
            </li>
          );
        })}
      </ul>
    </SectionCard>
  );
}

/* ------------------------------------------------------------------ Location */

export function LocationPanel() {
  const { t } = useI18n();
  const { settings, saveSettings } = useStore();
  const [draft, setDraft] = useState<SiteSettings>(settings);

  const patchLocation = (changes: Partial<SiteSettings["location"]>) =>
    setDraft((current) => ({ ...current, location: { ...current.location, ...changes } }));

  const patchContact = (changes: Partial<SiteSettings["contact"]>) =>
    setDraft((current) => ({ ...current, contact: { ...current.contact, ...changes } }));

  const mapsPreview =
    draft.location.mapsUrl ||
    (draft.location.lat && draft.location.lng
      ? `https://www.google.com/maps?q=${draft.location.lat},${draft.location.lng}`
      : "");

  return (
    <SectionCard
      title={t.admin.locationTitle}
      description={t.admin.locationHint}
      actions={
        <Button
          size="sm"
          onClick={() => {
            saveSettings(draft);
            toast.success(t.toast.saved);
          }}
        >
          <Save /> {t.admin.save}
        </Button>
      }
    >
      <div className="space-y-5">
        <TranslationsField
          id="location-address"
          label={t.contact.address}
          value={draft.contact.address}
          onChange={(value) => patchContact({ address: value })}
        />

        <FieldRow label={t.admin.mapsUrl} hint={t.admin.mapsUrlHint}>
          <Input
            value={draft.location.mapsUrl}
            dir="ltr"
            placeholder="https://maps.app.goo.gl/…"
            onChange={(event) => patchLocation({ mapsUrl: event.target.value })}
          />
        </FieldRow>

        <div className="grid gap-4 sm:grid-cols-2">
          <FieldRow label={t.admin.latitude}>
            <Input
              value={draft.location.lat}
              dir="ltr"
              inputMode="decimal"
              placeholder="36.7538"
              onChange={(event) => patchLocation({ lat: event.target.value })}
            />
          </FieldRow>
          <FieldRow label={t.admin.longitude}>
            <Input
              value={draft.location.lng}
              dir="ltr"
              inputMode="decimal"
              placeholder="3.0588"
              onChange={(event) => patchLocation({ lng: event.target.value })}
            />
          </FieldRow>
        </div>

        <TranslationsField
          id="location-hours"
          label={t.admin.openingHours}
          value={draft.location.hours}
          onChange={(value) => patchLocation({ hours: value })}
        />

        <div className="grid gap-4 sm:grid-cols-2">
          <FieldRow label={t.contact.phone}>
            <Input
              value={draft.contact.phone}
              dir="ltr"
              placeholder="+213…"
              onChange={(event) => patchContact({ phone: event.target.value })}
            />
          </FieldRow>
          <FieldRow label={t.contact.whatsapp}>
            <Input
              value={draft.contact.whatsapp}
              dir="ltr"
              placeholder="+213…"
              onChange={(event) => patchContact({ whatsapp: event.target.value })}
            />
          </FieldRow>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {mapsPreview ? (
            <Button variant="outline" size="sm" asChild>
              <a href={mapsPreview} target="_blank" rel="noopener noreferrer">
                <ExternalLink /> {t.admin.mapPreview}
              </a>
            </Button>
          ) : (
            <Button variant="outline" size="sm" disabled>
              <ExternalLink /> {t.admin.mapPreview}
            </Button>
          )}
          {draft.location.lat && draft.location.lng && (
            <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
              <Check className="size-3.5" /> {draft.location.lat}, {draft.location.lng}
            </span>
          )}
        </div>
      </div>
    </SectionCard>
  );
}

/* ----------------------------------------------------------------------- SEO */

export function SeoPanel() {
  const { t } = useI18n();
  const { settings, saveSettings } = useStore();
  const [draft, setDraft] = useState<SiteSettings>(settings);
  const ogInput = useRef<HTMLInputElement>(null);

  const patchSeo = (changes: Partial<SiteSettings["seo"]>) =>
    setDraft((current) => ({ ...current, seo: { ...current.seo, ...changes } }));

  const uploadOg = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    try {
      const result = await readImageFile(files[0]);
      patchSeo({ ogImageUrl: result.url });
      toast.success(t.toast.created);
    } catch {
      toast.error(t.toast.error);
    } finally {
      if (ogInput.current) ogInput.current.value = "";
    }
  };

  return (
    <SectionCard
      title={t.admin.seoTitle}
      description={t.admin.seoHint}
      actions={
        <Button
          size="sm"
          onClick={() => {
            saveSettings(draft);
            toast.success(t.toast.saved);
          }}
        >
          <Save /> {t.admin.save}
        </Button>
      }
    >
      <div className="space-y-5">
        <FieldRow label={t.admin.seoTitleField}>
          <Input
            value={draft.seo.title}
            onChange={(event) => patchSeo({ title: event.target.value })}
          />
        </FieldRow>

        <TranslationsField
          id="seo-description"
          label={t.admin.seoDescription}
          multiline
          value={draft.seo.description}
          onChange={(value) => patchSeo({ description: value })}
        />

        <FieldRow label={t.admin.seoKeywords} hint={t.admin.seoHint}>
          <Input
            value={draft.seo.keywords}
            placeholder="wholesale clothing, pajamas, Algeria"
            onChange={(event) => patchSeo({ keywords: event.target.value })}
          />
        </FieldRow>

        <div className="flex flex-wrap items-end gap-4">
          <div className="grid h-24 w-40 place-items-center overflow-hidden rounded-md border border-border bg-muted">
            {draft.seo.ogImageUrl ? (
              // eslint-disable-next-line jsx-a11y/img-redundant-alt
              <img
                src={draft.seo.ogImageUrl}
                alt={t.admin.ogImage}
                className="size-full object-cover"
              />
            ) : (
              <ImagePlus className="size-6 text-muted-foreground" aria-hidden="true" />
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            <input
              ref={ogInput}
              type="file"
              accept={IMAGE_ACCEPT}
              className="hidden"
              onChange={(event) => void uploadOg(event.target.files)}
            />
            <Button variant="outline" size="sm" onClick={() => ogInput.current?.click()}>
              <ImagePlus /> {t.admin.ogImage}
            </Button>
            {draft.seo.ogImageUrl && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => patchSeo({ ogImageUrl: null })}
              >
                {t.admin.removeImage}
              </Button>
            )}
          </div>
        </div>
      </div>
    </SectionCard>
  );
}
