import { useRef, useState } from "react";
import { ImagePlus, RotateCcw, Save, Video } from "lucide-react";
import { toast } from "sonner";
import { FieldRow, MoveButtons, SectionCard, Switch } from "@/components/admin/PanelShell";
import { TranslationsField } from "@/components/admin/TranslationsField";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/field";
import { Card } from "@/components/ui/surface";
import { useI18n } from "@/lib/i18n";
import { IMAGE_ACCEPT, readImageFile } from "@/lib/image";
import { useStore } from "@/lib/store";
import type { SiteSettings } from "@/lib/types";
import { cn } from "@/lib/utils";

/**
 * Homepage editor. Content here already drove the public site through
 * `settings`; this panel exposes it plus the section order and visibility
 * that `Home` renders from `settings.homeSections`.
 */
export function HomepagePanel() {
  const { t } = useI18n();
  const { settings, saveSettings, toggleHomeSection, moveHomeSection, resetHomeSections } =
    useStore();
  const [draft, setDraft] = useState<SiteSettings>(settings);
  const fileInput = useRef<HTMLInputElement>(null);

  const patch = (changes: Partial<SiteSettings>) =>
    setDraft((current) => ({ ...current, ...changes }));

  const uploadHero = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    try {
      const result = await readImageFile(files[0]);
      patch({ hero: { ...draft.hero, mediaUrl: result.url, mediaType: "image" } });
      toast.success(t.toast.created);
    } catch {
      toast.error(t.toast.error);
    } finally {
      if (fileInput.current) fileInput.current.value = "";
    }
  };

  const handleSave = () => {
    saveSettings(draft);
    toast.success(t.toast.saved);
  };

  return (
    <div className="space-y-5">
      <SectionCard
        title={t.admin.sectionsTitle}
        description={t.admin.sectionsHint}
        actions={
          <Button variant="outline" size="sm" onClick={resetHomeSections}>
            <RotateCcw /> {t.admin.resetSections}
          </Button>
        }
      >
        <ul className="space-y-2">
          {draft.homeSections.map((section, index) => (
            <li
              key={section.key}
              className={cn(
                "flex items-center gap-3 rounded-md border px-3.5 py-3 transition-colors",
                section.visible
                  ? "border-border/70 bg-card"
                  : "border-dashed border-border/70 bg-muted/40",
              )}
            >
              <span className="grid size-7 shrink-0 place-items-center rounded-sm bg-wine-700 text-[0.7rem] font-semibold text-cream-100">
                {index + 1}
              </span>
              <div className="min-w-0 flex-1">
                <p
                  className={cn(
                    "truncate text-sm font-medium",
                    !section.visible && "text-muted-foreground line-through",
                  )}
                >
                  {t.admin.sectionLabels[section.key]}
                </p>
                <p className="text-[0.68rem] text-muted-foreground">
                  {section.visible ? t.admin.visible : t.admin.hidden}
                </p>
              </div>
              <MoveButtons
                upLabel={t.admin.moveUp}
                downLabel={t.admin.moveDown}
                canUp={index > 0}
                canDown={index < draft.homeSections.length - 1}
                onMove={(direction) => {
                  moveHomeSection(section.key, direction);
                  // Keep the local draft in step with the store-side reorder.
                  setDraft((current) => {
                    const list = [...current.homeSections];
                    const at = list.findIndex((item) => item.key === section.key);
                    const to = direction === "up" ? at - 1 : at + 1;
                    if (at < 0 || to < 0 || to >= list.length) return current;
                    const [moved] = list.splice(at, 1);
                    list.splice(to, 0, moved);
                    return { ...current, homeSections: list };
                  });
                }}
              />
              <Switch
                checked={section.visible}
                label={section.visible ? t.admin.disable : t.admin.enable}
                onChange={() => {
                  toggleHomeSection(section.key);
                  setDraft((current) => ({
                    ...current,
                    homeSections: current.homeSections.map((item) =>
                      item.key === section.key ? { ...item, visible: !item.visible } : item,
                    ),
                  }));
                }}
              />
            </li>
          ))}
        </ul>
      </SectionCard>

      <SectionCard title={t.admin.heroHeadline} description={t.admin.heroMediaHint}>
        <div className="space-y-5">
          <TranslationsField
            id="home-hero-headline"
            label={t.admin.heroHeadline}
            value={draft.hero.headline}
            onChange={(value) => patch({ hero: { ...draft.hero, headline: value } })}
          />
          <TranslationsField
            id="home-hero-subtitle"
            label={t.admin.heroSubtitle}
            multiline
            value={draft.hero.subtitle}
            onChange={(value) => patch({ hero: { ...draft.hero, subtitle: value } })}
          />

          <div className="grid gap-4 sm:grid-cols-[auto_1fr] sm:items-center">
            <div className="grid size-24 place-items-center overflow-hidden rounded-md border border-border bg-muted">
              {draft.hero.mediaUrl ? (
                draft.hero.mediaType === "video" ? (
                  <Video className="size-6 text-muted-foreground" aria-hidden="true" />
                ) : (
                  // eslint-disable-next-line jsx-a11y/img-redundant-alt
                  <img
                    src={draft.hero.mediaUrl}
                    alt={t.admin.heroMedia}
                    className="size-full object-cover"
                  />
                )
              ) : (
                <ImagePlus className="size-6 text-muted-foreground" aria-hidden="true" />
              )}
            </div>
            <div className="space-y-3">
              <input
                ref={fileInput}
                type="file"
                accept={IMAGE_ACCEPT}
                className="hidden"
                onChange={(event) => void uploadHero(event.target.files)}
              />
              <div className="flex flex-wrap gap-2">
                <Button variant="outline" size="sm" onClick={() => fileInput.current?.click()}>
                  <ImagePlus /> {t.admin.uploadImages}
                </Button>
                {draft.hero.mediaUrl && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => patch({ hero: { ...draft.hero, mediaUrl: null } })}
                  >
                    {t.admin.removeImage}
                  </Button>
                )}
              </div>
              <FieldRow label={t.admin.video}>
                <Input
                  value={draft.hero.mediaType === "video" ? (draft.hero.mediaUrl ?? "") : ""}
                  placeholder="https://…/video.mp4"
                  onChange={(event) =>
                    patch({
                      hero: {
                        ...draft.hero,
                        mediaUrl: event.target.value || null,
                        mediaType: "video",
                      },
                    })
                  }
                />
              </FieldRow>
            </div>
          </div>
        </div>
      </SectionCard>

      <SectionCard title={t.admin.promotionTitle}>
        <div className="space-y-5">
          <label className="flex items-center justify-between gap-4 rounded-md border border-border/70 bg-muted/40 px-4 py-3">
            <span className="text-sm font-medium">{t.admin.announcementEnable}</span>
            <Switch
              checked={draft.promotion.enabled}
              label={t.admin.announcementEnable}
              onChange={(next) =>
                patch({ promotion: { ...draft.promotion, enabled: next } })
              }
            />
          </label>

          <TranslationsField
            id="promo-badge"
            label={t.admin.promotionBadge}
            value={draft.promotion.badge}
            onChange={(value) => patch({ promotion: { ...draft.promotion, badge: value } })}
          />
          <TranslationsField
            id="promo-title"
            label={t.admin.promotionHeading}
            value={draft.promotion.title}
            onChange={(value) => patch({ promotion: { ...draft.promotion, title: value } })}
          />
          <TranslationsField
            id="promo-text"
            label={t.admin.promotionText}
            multiline
            value={draft.promotion.text}
            onChange={(value) => patch({ promotion: { ...draft.promotion, text: value } })}
          />
          <TranslationsField
            id="promo-cta"
            label={t.admin.promotionCta}
            value={draft.promotion.ctaLabel}
            onChange={(value) => patch({ promotion: { ...draft.promotion, ctaLabel: value } })}
          />
          <FieldRow label={t.admin.promotionLink}>
            <Input
              value={draft.promotion.ctaHref}
              placeholder="/wholesale"
              onChange={(event) =>
                patch({ promotion: { ...draft.promotion, ctaHref: event.target.value } })
              }
            />
          </FieldRow>
          <FieldRow label={t.admin.promotionMedia} hint={t.admin.mediaUrlPlaceholder}>
            <Input
              value={draft.promotion.mediaUrl ?? ""}
              placeholder="https://…/banner.jpg"
              onChange={(event) =>
                patch({ promotion: { ...draft.promotion, mediaUrl: event.target.value || null } })
              }
            />
          </FieldRow>
        </div>
      </SectionCard>

      <SectionCard title={t.admin.announcementTitle} description={t.admin.announcementText}>
        <div className="space-y-5">
          <label className="flex items-center justify-between gap-4 rounded-md border border-border/70 bg-muted/40 px-4 py-3">
            <span className="text-sm font-medium">{t.admin.announcementEnable}</span>
            <Switch
              checked={draft.announcement.enabled}
              label={t.admin.announcementEnable}
              onChange={(next) => patch({ announcement: { ...draft.announcement, enabled: next } })}
            />
          </label>
          <TranslationsField
            id="announcement-text"
            label={t.admin.announcementText}
            value={draft.announcement.text}
            onChange={(value) => patch({ announcement: { ...draft.announcement, text: value } })}
          />
          <FieldRow label={t.admin.announcementLink}>
            <Input
              value={draft.announcement.href}
              placeholder="/wholesale"
              onChange={(event) =>
                patch({ announcement: { ...draft.announcement, href: event.target.value } })
              }
            />
          </FieldRow>
        </div>
      </SectionCard>

      <Card className="sticky bottom-4 flex flex-wrap items-center justify-between gap-3 p-4">
        <p className="text-xs text-muted-foreground">{t.admin.sectionsHint}</p>
        <Button onClick={handleSave}>
          <Save /> {t.admin.save}
        </Button>
      </Card>
    </div>
  );
}
