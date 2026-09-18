import { useState } from "react";
import { Save } from "lucide-react";
import { toast } from "sonner";
import { FieldRow, SectionCard } from "@/components/admin/PanelShell";
import { TranslationsField } from "@/components/admin/TranslationsField";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/field";
import { useI18n } from "@/lib/i18n";
import { useStore } from "@/lib/store";
import type { SiteSettings } from "@/lib/types";

/**
 * Central business settings. Everything here already lives in `settings`,
 * so this panel is a single overview form rather than a second source of
 * truth — saving merges into the same record the rest of the app reads.
 */
export function SettingsPanel() {
  const { t } = useI18n();
  const { settings, saveSettings } = useStore();
  const [draft, setDraft] = useState<SiteSettings>(settings);

  const patchBrand = (changes: Partial<SiteSettings["brand"]>) =>
    setDraft((current) => ({ ...current, brand: { ...current.brand, ...changes } }));

  const patchContact = (changes: Partial<SiteSettings["contact"]>) =>
    setDraft((current) => ({ ...current, contact: { ...current.contact, ...changes } }));

  const patchLocation = (changes: Partial<SiteSettings["location"]>) =>
    setDraft((current) => ({ ...current, location: { ...current.location, ...changes } }));

  return (
    <div className="space-y-5">
      <SectionCard title={t.admin.tabSettings} description={t.admin.contactDetails}>
        <div className="space-y-5">
          <FieldRow label={t.admin.name}>
            <Input
              value={draft.brand.name}
              onChange={(event) => patchBrand({ name: event.target.value })}
            />
          </FieldRow>
          <TranslationsField
            id="settings-tagline"
            label={t.admin.heroSubtitle}
            value={draft.brand.tagline}
            onChange={(value) => patchBrand({ tagline: value })}
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
            <FieldRow label={t.contact.email}>
              <Input
                value={draft.contact.email}
                dir="ltr"
                type="email"
                placeholder="sales@example.com"
                onChange={(event) => patchContact({ email: event.target.value })}
              />
            </FieldRow>
            <FieldRow label={t.admin.openingHours}>
              <Input
                value={draft.location.hours.primary}
                onChange={(event) =>
                  patchLocation({ hours: { ...draft.location.hours, primary: event.target.value } })
                }
              />
            </FieldRow>
          </div>
          <TranslationsField
            id="settings-address"
            label={t.contact.address}
            value={draft.contact.address}
            onChange={(value) => patchContact({ address: value })}
          />
        </div>
      </SectionCard>

      <div className="flex justify-end">
        <Button
          onClick={() => {
            saveSettings(draft);
            toast.success(t.toast.saved);
          }}
        >
          <Save /> {t.admin.save}
        </Button>
      </div>
    </div>
  );
}
