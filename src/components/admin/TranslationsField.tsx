import { useState } from "react";
import { ChevronDown, Languages } from "lucide-react";
import { Input, Label, Textarea } from "@/components/ui/field";
import { useI18n } from "@/lib/i18n";
import type { I18nText } from "@/lib/types";
import { cn } from "@/lib/utils";

interface TranslationsFieldProps {
  label: string;
  value: I18nText;
  onChange: (value: I18nText) => void;
  multiline?: boolean;
  placeholder?: string;
  id?: string;
}

/**
 * One primary value plus optional per-language overrides. Empty overrides fall
 * back to the primary text, so nothing is ever left untranslated by accident.
 */
export function TranslationsField({
  label,
  value,
  onChange,
  multiline = false,
  placeholder,
  id,
}: TranslationsFieldProps) {
  const { t } = useI18n();
  const [open, setOpen] = useState(false);

  const Control = multiline ? Textarea : Input;
  const controlProps = multiline ? { rows: 4 } : {};

  return (
    <div>
      <Label htmlFor={id}>{label}</Label>
      <Control
        id={id}
        className="mt-2"
        value={value.primary}
        placeholder={placeholder}
        onChange={(event) => onChange({ ...value, primary: event.target.value })}
        {...controlProps}
      />

      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="mt-2 inline-flex items-center gap-1.5 text-[0.72rem] font-medium text-muted-foreground transition-colors hover:text-primary"
      >
        <Languages className="size-3.5" aria-hidden="true" />
        {t.admin.translations}
        <ChevronDown className={cn("size-3.5 transition-transform", open && "rotate-180")} aria-hidden="true" />
      </button>

      {open && (
        <div className="mt-3 space-y-3 rounded-md border border-border/70 bg-muted/40 p-3.5">
          <p className="text-[0.68rem] leading-relaxed text-muted-foreground">
            {t.admin.translationsHint}
          </p>
          {(["en", "fr", "ar"] as const).map((code) => {
            const fieldLabel =
              code === "en" ? t.admin.textEn : code === "fr" ? t.admin.textFr : t.admin.textAr;
            return (
              <div key={code}>
                <label
                  htmlFor={`${id ?? label}-${code}`}
                  className="text-[0.66rem] font-medium uppercase tracking-[0.14em] text-muted-foreground"
                >
                  {fieldLabel}
                </label>
                <Control
                  id={`${id ?? label}-${code}`}
                  className="mt-1.5 bg-card"
                  dir={code === "ar" ? "rtl" : undefined}
                  value={value[code] ?? ""}
                  placeholder={value.primary}
                  onChange={(event) => onChange({ ...value, [code]: event.target.value })}
                  {...(multiline ? { rows: 3 } : {})}
                />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
