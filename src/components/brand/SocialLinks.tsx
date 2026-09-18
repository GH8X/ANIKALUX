import { Facebook, Instagram, Mail, MessageCircle, Music2, Phone, Send, Youtube } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { useStore } from "@/lib/store";
import { cn, mailLink, telLink, whatsappLink } from "@/lib/utils";

export interface SocialProfile {
  key: string;
  label: string;
  href: string;
  icon: LucideIcon;
}

/**
 * Builds the contact/social list from admin settings. Empty fields are
 * omitted entirely — the site never invents contact information.
 */
export function useSocialProfiles(): SocialProfile[] {
  const { settings } = useStore();
  const { t } = useI18n();
  const c = settings.contact;
  const hidden = settings.social.hidden ?? [];
  const isHidden = (key: string) => hidden.includes(key as never);

  const profiles: (SocialProfile | null)[] = [
    c.whatsapp
      ? {
          key: "whatsapp",
          label: t.contact.whatsapp,
          href: whatsappLink(c.whatsapp, t.request.whatsappPrefill),
          icon: MessageCircle,
        }
      : null,
    c.phone ? { key: "phone", label: t.contact.phone, href: telLink(c.phone), icon: Phone } : null,
    c.email ? { key: "email", label: t.contact.email, href: mailLink(c.email), icon: Mail } : null,
    c.instagram
      ? { key: "instagram", label: t.contact.instagram, href: c.instagram, icon: Instagram }
      : null,
    c.facebook
      ? { key: "facebook", label: t.contact.facebook, href: c.facebook, icon: Facebook }
      : null,
    c.tiktok ? { key: "tiktok", label: t.contact.tiktok, href: c.tiktok, icon: Music2 } : null,
    settings.social.youtube
      ? { key: "youtube", label: t.admin.youtube, href: settings.social.youtube, icon: Youtube }
      : null,
    settings.social.telegram
      ? { key: "telegram", label: t.admin.telegram, href: settings.social.telegram, icon: Send }
      : null,
  ];

  // The owner can switch any network off without losing the saved link.
  return profiles.filter((p): p is SocialProfile => p !== null && !isHidden(p.key));
}

interface SocialLinksProps {
  variant?: "light" | "dark";
  className?: string;
  showLabels?: boolean;
}

export function SocialLinks({ variant = "light", className, showLabels = false }: SocialLinksProps) {
  const profiles = useSocialProfiles();

  if (profiles.length === 0) return null;

  return (
    <ul className={cn("flex flex-wrap items-center gap-2.5", className)}>
      {profiles.map((profile) => (
        <li key={profile.key}>
          <a
            href={profile.href}
            target={profile.key === "phone" || profile.key === "email" ? undefined : "_blank"}
            rel="noopener noreferrer"
            aria-label={profile.label}
            className={cn(
              "inline-flex h-10 items-center gap-2 rounded-full border px-3 text-[0.78rem] font-medium transition-all duration-300 ease-luxe hover:-translate-y-0.5",
              variant === "dark"
                ? "border-cream-200/25 text-cream-100/85 hover:border-gold-400/70 hover:text-cream-100"
                : "border-border text-foreground/75 hover:border-gold-400/70 hover:text-primary",
            )}
          >
            <profile.icon className="size-4" aria-hidden="true" />
            {showLabels && <span>{profile.label}</span>}
          </a>
        </li>
      ))}
    </ul>
  );
}
