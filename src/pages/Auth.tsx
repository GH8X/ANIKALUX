import { useEffect, useState, type FormEvent } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Lock } from "lucide-react";
import { toast } from "sonner";
import { Seo } from "@/components/Seo";
import { Logo } from "@/components/brand/Logo";
import { Button } from "@/components/ui/button";
import { FieldError, Input, Label } from "@/components/ui/field";
import { Card } from "@/components/ui/surface";
import { useI18n } from "@/lib/i18n";
import { useStore } from "@/lib/store";

/** Where an administrator lands after signing in. */
export const ADMIN_DESTINATION = "/admin";

export function Auth() {
  const { t } = useI18n();
  const { settings, isAdmin, signIn } = useStore();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const returnTo = params.get("returnTo") || ADMIN_DESTINATION;

  useEffect(() => {
    if (isAdmin) navigate(returnTo, { replace: true });
  }, [isAdmin, navigate, returnTo]);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);
    setError(null);
    window.setTimeout(() => {
      const ok = signIn(password);
      setSubmitting(false);
      if (ok) {
        navigate(returnTo, { replace: true });
      } else {
        setError(t.admin.wrongPassword);
        toast.error(t.admin.wrongPassword);
      }
    }, 350);
  };

  return (
    <>
      <Seo
        title={`${t.admin.signInTitle} | ${settings.brand.name}`}
        description={t.admin.signInSubtitle}
        noindex
      />

      <div className="container flex min-h-[78svh] items-center justify-center py-14">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          className="w-full max-w-md"
        >
          <Card className="overflow-hidden shadow-card">
            <div className="relative bg-gradient-to-br from-wine-700 via-wine-800 to-wine-950 px-6 py-8 text-center text-cream-100">
              <div
                aria-hidden="true"
                className="absolute inset-0 opacity-[0.08]"
                style={{
                  backgroundImage:
                    "repeating-linear-gradient(115deg, #F4E3C1 0 1px, transparent 1px 20px)",
                }}
              />
              <Logo size="lg" className="relative mx-auto rounded-md bg-cream-100/5 p-1" />
              <h1 className="relative mt-4 font-display text-2xl font-semibold">
                {t.admin.signInTitle}
              </h1>
              <p className="relative mt-2 text-sm text-cream-100/70">{t.admin.signInSubtitle}</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5 p-6">
              <div>
                <Label htmlFor="admin-password">
                  <Lock className="size-3.5" aria-hidden="true" />
                  {t.admin.password}
                </Label>
                <Input
                  id="admin-password"
                  type="password"
                  name="password"
                  autoComplete="current-password"
                  autoFocus
                  className="mt-2"
                  value={password}
                  onChange={(event) => {
                    setPassword(event.target.value);
                    setError(null);
                  }}
                  aria-invalid={Boolean(error)}
                  placeholder="••••••••"
                />
                <FieldError>{error ?? undefined}</FieldError>
              </div>

              <Button type="submit" size="lg" className="w-full" disabled={submitting}>
                {submitting ? t.states.loading : t.admin.signIn}
              </Button>

              <Button asChild variant="ghost" size="sm" className="w-full">
                <Link to="/">
                  <ArrowLeft className="rtl:rotate-180" /> {t.admin.backToSite}
                </Link>
              </Button>
            </form>
          </Card>

          <p className="mt-5 text-center text-xs text-muted-foreground">{t.contact.adminHint}</p>
        </motion.div>
      </div>
    </>
  );
}
