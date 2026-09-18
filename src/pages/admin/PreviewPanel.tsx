import { useState } from "react";
import { Monitor, RefreshCw, Smartphone, Tablet } from "lucide-react";
import { SectionCard } from "@/components/admin/PanelShell";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/lib/i18n";
import { cn } from "@/lib/utils";

type DeviceKey = "desktop" | "tablet" | "mobile";

/** Rendered widths, matching the breakpoints the public layout actually uses. */
const DEVICES: Record<DeviceKey, { width: number; height: number }> = {
  desktop: { width: 1280, height: 900 },
  tablet: { width: 834, height: 900 },
  mobile: { width: 390, height: 780 },
};

export function PreviewPanel() {
  const { t } = useI18n();
  const [device, setDevice] = useState<DeviceKey>("desktop");
  const [nonce, setNonce] = useState(0);

  const size = DEVICES[device];

  const options: { key: DeviceKey; label: string; icon: typeof Monitor }[] = [
    { key: "desktop", label: t.admin.desktop, icon: Monitor },
    { key: "tablet", label: t.admin.tablet, icon: Tablet },
    { key: "mobile", label: t.admin.mobile, icon: Smartphone },
  ];

  return (
    <SectionCard
      title={t.admin.previewTitle}
      description={t.admin.previewHint}
      actions={
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex rounded-sm border border-border/70 p-0.5">
            {options.map((option) => (
              <button
                key={option.key}
                type="button"
                onClick={() => setDevice(option.key)}
                aria-pressed={device === option.key}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-sm px-3 py-1.5 text-xs font-medium transition-colors",
                  device === option.key
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                <option.icon className="size-3.5" aria-hidden="true" />
                {option.label}
              </button>
            ))}
          </div>
          <Button variant="outline" size="sm" onClick={() => setNonce((value) => value + 1)}>
            <RefreshCw /> {t.admin.refreshPreview}
          </Button>
        </div>
      }
    >
      <div className="flex justify-center overflow-hidden rounded-md border border-border/70 bg-muted/40 p-4">
        <div
          className="relative shrink-0 overflow-hidden rounded-md border border-border bg-background shadow-card"
          style={{
            width: "100%",
            maxWidth: size.width,
            aspectRatio: `${size.width} / ${size.height}`,
          }}
        >
          <iframe
            key={`${device}-${nonce}`}
            src="/"
            title={t.admin.previewTitle}
            className="size-full"
          />
        </div>
      </div>
    </SectionCard>
  );
}
