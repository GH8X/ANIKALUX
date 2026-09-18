import { useRef, useState } from "react";
import { ImagePlus, RotateCcw, Save, ShieldAlert, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { ProductMultiSelect } from "@/components/admin/ProductMultiSelect";
import { TranslationsField } from "@/components/admin/TranslationsField";
import { Logo, LOGO_SIZES } from "@/components/brand/Logo";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input, Label } from "@/components/ui/field";
import { Card, Separator } from "@/components/ui/surface";
import { useI18n } from "@/lib/i18n";
import { IMAGE_ACCEPT, readImageFile } from "@/lib/image";
import { useStore } from "@/lib/store";
import type { SiteSettings } from "@/lib/types";
import { cn } from "@/lib/utils";

/** Renders the logo as it exists in the editor's draft, before publishing. */
function DraftLogo({ src, size }: { src: string | null; size: "sm" | "md" | "lg" }) {
  const { settings } = useStore();
  if (!src) return <Logo size={size} />;
  return (
    <img
      src={src}
      alt={`${settings.brand.name} logo`}
      className={cn("object-contain", LOGO_SIZES[size])}
      draggable={false}
    />
  );
}

function SectionCard({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <Card className="p-5 sm:p-6">
      <h2 className="font-display text-xl font-semibold">{title}</h2>
      {description && <p className="mt-1.5 text-sm text-muted-foreground">{description}</p>}
      <Separator className="my-5" />
      {children}
    </Card>
  );
}

export function BrandPanel() {
  const { t } = useI18n();
  const { settings, saveSettings, resetDatabase } = useStore();
  const [draft, setDraft] = useState<SiteSettings>(settings);
  const [resetOpen, setResetOpen] = useState(false);
  const logoInput = useRef<HTMLInputElement>(null);

  const patch = (changes: Partial<SiteSettings>) =>
    setDraft((current) => ({ ...current, ...changes }));

  const patchBrand = (changes: Partial<SiteSettings["brand"]>) =>
    patch({ brand: { ...draft.brand, ...changes } });

  const patchHero = (changes: Partial<SiteSettings["hero"]>) =>
    patch({ hero: { ...draft.hero, ...changes } });

  const patchContact = (changes: Partial<SiteSettings["contact"]>) =>
    patch({ contact: { ...draft.contact, ...changes } });

  const uploadLogo = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    try {
      const result = await readImageFile(files[0]);
      patchBrand({ logoUrl: result.url });
      toast.success(t.toast.logoUpdated);
    } catch {
      toast.error(t.toast.error);
    } finally {
      if (logoInput.current) logoInput.current.value = "";
    }
  };

  const handleSave = () => {
    const published = settings.brand.logoUrl;
    const next = draft.brand.logoUrl;
    // Keep the previously published logo so a replacement is reversible.
    const brand =
      next !== published && published
        ? {
            ...draft.brand,
            logoHistory: [
              published,
              ...draft.brand.logoHistory.filter((url) => url !== published),
            ].slice(0, 4),
          }
        : draft.brand;
    saveSettings({ ...draft, brand });
    setDraft((current) => ({ ...current, brand }));
    toast.success(t.toast.saved);
  };

  return (
    <div className="space-y-5">
      <SectionCard title={t.admin.brandLogo} description={t.admin.brandLogoHint}>
        <div className="space-y-6">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
            {/* Shows the draft, not the published logo, so replacing is a
                preview-then-publish step. */}
            <div className="grid size-28 shrink-0 place-items-center overflow-hidden rounded-lg border border-border bg-wine-900">
              <DraftLogo src={draft.brand.logoUrl} size="lg" />
            </div>
            <div className="space-y-3">
              <input
                ref={logoInput}
                type="file"
                accept={IMAGE_ACCEPT}
                className="sr-only"
                onChange={(event) => void uploadLogo(event.target.files)}
              />
              <div className="flex flex-wrap gap-2">
                <Button variant="outline" onClick={() => logoInput.current?.click()}>
                  <ImagePlus /> {t.admin.uploadLogo}
                </Button>
                {draft.brand.logoUrl && (
                  <Button variant="ghost" onClick={() => patchBrand({ logoUrl: null })}>
                    <Trash2 /> {t.admin.removeLogo}
                  </Button>
                )}
              </div>
              <p className="text-xs text-muted-foreground">{t.admin.logoRules}</p>
            </div>
          </div>

          <div className="rounded-md border border-border/70 bg-muted/40 p-4">
            <p className="text-[0.72rem] font-medium uppercase tracking-[0.14em] text-muted-foreground">
              {t.admin.logoPreview}
            </p>
            <p className="mt-1 text-[0.7rem] text-muted-foreground">{t.admin.logoPlacements}</p>
            <div className="mt-4 flex flex-wrap items-end gap-6">
              {(["lg", "md", "sm"] as const).map((size) => (
                <div key={size} className="flex flex-col items-center gap-2">
                  <div className="grid place-items-center rounded-md border border-border/70 bg-background p-1.5">
                    <DraftLogo src={draft.brand.logoUrl} size={size} />
                  </div>
                  <span className="font-mono text-[0.6rem] text-muted-foreground">
                    {LOGO_SIZES[size].match(/h-(\S+)/)?.[1]}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div>
            <p className="text-[0.72rem] font-medium uppercase tracking-[0.14em] text-muted-foreground">
              {t.admin.logoHistory}
            </p>
            {draft.brand.logoHistory.length === 0 ? (
              <p className="mt-2 text-[0.72rem] text-muted-foreground">{t.admin.logoNone}</p>
            ) : (
              <ul className="mt-3 flex flex-wrap gap-3">
                {draft.brand.logoHistory.map((url) => (
                  <li key={url} className="flex flex-col items-center gap-2">
                    <div className="grid size-16 place-items-center overflow-hidden rounded-md border border-border/70 bg-wine-900 p-1">
                      <img src={url} alt="" className="size-full object-contain" />
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        patchBrand({ logoUrl: url });
                        toast.success(t.toast.updated);
                      }}
                    >
                      {t.admin.logoRestore}
                    </Button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </SectionCard>

      <SectionCard title={t.admin.heroHeadline}>
        <div className="space-y-5">
          <TranslationsField
            id="hero-headline"
            label={t.admin.heroHeadline}
            value={draft.hero.headline}
            onChange={(headline) => patchHero({ headline })}
          />
          <TranslationsField
            id="hero-subtitle"
            label={t.admin.heroSubtitle}
            value={draft.hero.subtitle}
            onChange={(subtitle) => patchHero({ subtitle })}
            multiline
          />
          <div className="grid gap-4 sm:grid-cols-[1fr_auto]">
            <div>
              <Label htmlFor="hero-media">{t.admin.heroMedia}</Label>
              <Input
                id="hero-media"
                className="mt-2"
                dir="ltr"
                value={draft.hero.mediaUrl ?? ""}
                onChange={(event) => patchHero({ mediaUrl: event.target.value || null })}
                placeholder="https://…"
              />
            </div>
            <div>
              <Label htmlFor="hero-media-type">{t.admin.group}</Label>
              <select
                id="hero-media-type"
                value={draft.hero.mediaType}
                onChange={(event) =>
                  patchHero({ mediaType: event.target.value as "image" | "video" })
                }
                className="mt-2 h-11 rounded-md border border-input bg-card px-3.5 text-sm"
              >
                <option value="image">Image</option>
                <option value="video">Video</option>
              </select>
            </div>
          </div>
          <p className="text-xs text-muted-foreground">{t.admin.heroMediaHint}</p>
        </div>
      </SectionCard>

      <SectionCard title={t.admin.aboutText}>
        <TranslationsField
          id="brand-about"
          label={t.admin.aboutText}
          value={draft.brand.about}
          onChange={(about) => patchBrand({ about })}
          multiline
        />
      </SectionCard>

      <SectionCard title={t.admin.contactDetails} description={t.contact.adminHint}>
        <div className="grid gap-4 sm:grid-cols-2">
          {(
            [
              ["phone", t.contact.phone, "0X XX XX XX XX"],
              ["whatsapp", t.contact.whatsapp, "213XXXXXXXXX"],
              ["email", t.contact.email, "hello@example.com"],
              ["instagram", t.contact.instagram, "https://instagram.com/…"],
              ["facebook", t.contact.facebook, "https://facebook.com/…"],
              ["tiktok", t.contact.tiktok, "https://tiktok.com/@…"],
            ] as const
          ).map(([key, label, placeholder]) => (
            <div key={key}>
              <Label htmlFor={`contact-${key}`}>{label}</Label>
              <Input
                id={`contact-${key}`}
                className="mt-2"
                dir="ltr"
                value={draft.contact[key]}
                onChange={(event) => patchContact({ [key]: event.target.value })}
                placeholder={placeholder}
              />
            </div>
          ))}
        </div>
        <div className="mt-4">
          <TranslationsField
            id="contact-address"
            label={t.contact.address}
            value={draft.contact.address}
            onChange={(address) => patchContact({ address })}
            multiline
          />
        </div>
      </SectionCard>

      <SectionCard title={t.admin.featured} description={t.admin.featuredHint}>
        <ProductMultiSelect
          ids={draft.featuredProductIds}
          onChange={(featuredProductIds) => patch({ featuredProductIds })}
        />
      </SectionCard>

      <SectionCard title={t.admin.newArrivalsManager} description={t.admin.newArrivalsHint}>
        <ProductMultiSelect
          ids={draft.newArrivalIds}
          onChange={(newArrivalIds) => patch({ newArrivalIds })}
        />
      </SectionCard>

      <SectionCard title={t.admin.bestSellersManager} description={t.admin.bestSellersHint}>
        <ProductMultiSelect
          ids={draft.bestSellerIds}
          onChange={(bestSellerIds) => patch({ bestSellerIds })}
        />
      </SectionCard>

      <SectionCard title={t.admin.passwordChange} description={t.admin.passwordChangeHint}>
        <div className="max-w-sm">
          <Label htmlFor="admin-password-field">{t.admin.password}</Label>
          <Input
            id="admin-password-field"
            className="mt-2"
            type="text"
            dir="ltr"
            value={draft.adminPassword}
            onChange={(event) => patch({ adminPassword: event.target.value })}
          />
        </div>
      </SectionCard>

      <SectionCard title={t.admin.dangerZone}>
        <div className="flex flex-wrap items-center gap-3">
          <Button variant="outline" onClick={() => setResetOpen(true)}>
            <RotateCcw /> {t.admin.resetData}
          </Button>
          <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
            <ShieldAlert className="size-3.5" aria-hidden="true" />
            {t.admin.resetConfirmText}
          </span>
        </div>
      </SectionCard>

      <div className="sticky bottom-4 z-10 flex justify-end">
        <Button size="lg" onClick={handleSave} className="shadow-luxe">
          <Save /> {t.admin.save}
        </Button>
      </div>

      <Dialog open={resetOpen} onOpenChange={setResetOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{t.admin.resetConfirmTitle}</DialogTitle>
            <DialogDescription>{t.admin.resetConfirmText}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setResetOpen(false)}>
              {t.admin.cancel}
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                resetDatabase();
                setResetOpen(false);
                toast.success(t.toast.updated);
              }}
            >
              {t.admin.confirm}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
