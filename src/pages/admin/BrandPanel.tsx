import { useRef, useState } from "react";
import { ImagePlus, RotateCcw, Save, ShieldAlert, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { ProductMultiSelect } from "@/components/admin/ProductMultiSelect";
import { TranslationsField } from "@/components/admin/TranslationsField";
import { Logo } from "@/components/brand/Logo";
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
    saveSettings(draft);
    toast.success(t.toast.saved);
  };

  return (
    <div className="space-y-5">
      <SectionCard title={t.admin.brandLogo} description={t.admin.brandLogoHint}>
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
          <div className="grid size-28 shrink-0 place-items-center overflow-hidden rounded-lg border border-border bg-wine-900">
            <Logo size="lg" />
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
