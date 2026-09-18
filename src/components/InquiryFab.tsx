import { useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { CheckCircle2, ClipboardList, MessageCircle, Send, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input, Label, Select, Textarea } from "@/components/ui/field";
import { useI18n } from "@/lib/i18n";
import { buildInquiryMessage, inquiryKey, useInquiry } from "@/lib/inquiry";
import { useStore } from "@/lib/store";
import { whatsappLink } from "@/lib/utils";

/**
 * Floating entry point for the wholesale inquiry list.
 *
 * Mirrors the WhatsApp button so the two floating actions read as one system,
 * and only appears once the customer has added something.
 */
export function InquiryFab() {
  const { t } = useI18n();
  const { settings, productById, createRequest } = useStore();
  const { items, count, totalPieces, setQuantity, updateVariant, remove, clear } = useInquiry();
  const reduce = useReducedMotion();
  const [open, setOpen] = useState(false);
  const [sent, setSent] = useState(false);
  const [form, setForm] = useState({ name: "", business: "", phone: "", note: "" });

  const whatsappNumber = settings.contact.whatsapp;

  const message = buildInquiryMessage(items, {
    heading: t.inquiry.title,
    nameLabel: t.request.fullName,
    businessLabel: t.request.businessName,
    phoneLabel: t.request.phone,
    noteLabel: t.request.message,
    totalLabel: t.inquiry.totalPieces,
    piecesLabel: t.card.pieces,
    colorLabel: t.inquiry.color,
    sizeLabel: t.inquiry.size,
    quantityLabel: t.inquiry.quantity,
    name: form.name,
    business: form.business,
    phone: form.phone,
    note: form.note,
  });

  const submit = () => {
    if (items.length === 0) return;
    createRequest({
      fullName: form.name.trim(),
      businessName: form.business.trim(),
      phone: form.phone.trim(),
      wilaya: "",
      products: items.map((item) => `${item.name} (${item.code}) × ${item.quantity}`).join("\n"),
      quantity: `${totalPieces} ${t.card.pieces}`,
      message: form.note.trim(),
      items,
    });
    clear();
    setSent(true);
    toast.success(t.toast.requestSent);
  };

  return (
    <>
      <AnimatePresence>
        {count > 0 && !open && (
          <motion.div
            initial={reduce ? undefined : { opacity: 0, y: 24, scale: 0.9 }}
            animate={reduce ? undefined : { opacity: 1, y: 0, scale: 1 }}
            exit={reduce ? undefined : { opacity: 0, y: 24, scale: 0.9 }}
            transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
            className="fixed bottom-24 end-4 z-40 sm:bottom-28 sm:end-6"
          >
            <button
              type="button"
              onClick={() => setOpen(true)}
              className="group inline-flex items-center gap-2 rounded-full border border-gold-400/40 bg-card px-4 py-3 text-sm font-medium shadow-luxe transition-all duration-300 ease-luxe hover:-translate-y-0.5 hover:border-gold-400"
            >
              <ClipboardList className="size-4 text-primary" aria-hidden="true" />
              {t.inquiry.open}
              <span className="grid min-w-5 place-items-center rounded-full bg-primary px-1.5 text-[0.68rem] text-primary-foreground">
                {count}
              </span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <Dialog
        open={open}
        onOpenChange={(next) => {
          setOpen(next);
          if (!next) setSent(false);
        }}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{t.inquiry.title}</DialogTitle>
            <DialogDescription>{t.inquiry.subtitle}</DialogDescription>
          </DialogHeader>

          <DialogBody className="space-y-6">
            {sent ? (
              <div className="flex flex-col items-center gap-4 rounded-lg border border-gold-500/30 bg-secondary/50 px-6 py-10 text-center">
                <CheckCircle2 className="size-9 text-primary" aria-hidden="true" />
                <h3 className="font-display text-xl font-semibold">{t.request.successTitle}</h3>
                <p className="max-w-md text-sm text-muted-foreground">{t.request.successText}</p>
                {whatsappNumber && (
                  <Button asChild variant="gold">
                    <a
                      href={whatsappLink(whatsappNumber, message)}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <MessageCircle />
                      {t.inquiry.whatsappSend}
                    </a>
                  </Button>
                )}
              </div>
            ) : items.length === 0 ? (
              <p className="rounded-lg border border-border/70 bg-card px-5 py-8 text-center text-sm text-muted-foreground">
                {t.inquiry.empty}
              </p>
            ) : (
              <>
                <ul className="divide-y divide-border/70 overflow-hidden rounded-lg border border-border/70">
                  {items.map((item) => {
                    const key = inquiryKey(item);
                    const product = productById(item.productId);
                    return (
                      <li key={key} className="grid gap-3 p-4 sm:grid-cols-[1fr_auto] sm:items-end">
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium">{item.name}</p>
                          <p className="font-mono text-[0.66rem] uppercase tracking-[0.12em] text-muted-foreground">
                            {item.code}
                          </p>
                          <div className="mt-3 grid grid-cols-2 gap-2">
                            <label className="block">
                              <span className="text-[0.62rem] uppercase tracking-[0.12em] text-muted-foreground">
                                {t.inquiry.color}
                              </span>
                              <Select
                                className="mt-1 h-9 text-[0.78rem]"
                                value={item.color}
                                disabled={!product || product.colors.length === 0}
                                onChange={(event) =>
                                  updateVariant(key, { color: event.target.value, size: item.size })
                                }
                              >
                                <option value="">—</option>
                                {product?.colors.map((color) => (
                                  <option key={color.id} value={color.name}>
                                    {color.name}
                                  </option>
                                ))}
                              </Select>
                            </label>
                            <label className="block">
                              <span className="text-[0.62rem] uppercase tracking-[0.12em] text-muted-foreground">
                                {t.inquiry.size}
                              </span>
                              <Select
                                className="mt-1 h-9 text-[0.78rem]"
                                value={item.size}
                                disabled={!product || product.sizes.length === 0}
                                onChange={(event) =>
                                  updateVariant(key, { color: item.color, size: event.target.value })
                                }
                              >
                                <option value="">—</option>
                                {product?.sizes.map((size) => (
                                  <option key={size} value={size}>
                                    {size}
                                  </option>
                                ))}
                              </Select>
                            </label>
                          </div>
                        </div>
                        <div className="flex items-end gap-2">
                          <label className="block">
                            <span className="text-[0.62rem] uppercase tracking-[0.12em] text-muted-foreground">
                              {t.inquiry.quantity}
                            </span>
                            <Input
                              type="number"
                              min={1}
                              inputMode="numeric"
                              className="mt-1 h-9 w-24"
                              value={item.quantity}
                              onChange={(event) =>
                                setQuantity(key, Number(event.target.value) || 1)
                              }
                            />
                          </label>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            aria-label={t.inquiry.remove}
                            onClick={() => remove(key)}
                          >
                            <Trash2 />
                          </Button>
                        </div>
                      </li>
                    );
                  })}
                </ul>

                <p className="text-sm text-muted-foreground">
                  {t.inquiry.totalPieces}:{" "}
                  <span className="font-medium text-foreground">
                    {totalPieces} {t.card.pieces}
                  </span>
                </p>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <Label htmlFor="inquiry-name">{t.request.fullName}</Label>
                    <Input
                      id="inquiry-name"
                      className="mt-2"
                      value={form.name}
                      onChange={(event) => setForm({ ...form, name: event.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="inquiry-business">{t.request.businessName}</Label>
                    <Input
                      id="inquiry-business"
                      className="mt-2"
                      value={form.business}
                      onChange={(event) => setForm({ ...form, business: event.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="inquiry-phone">{t.request.phone}</Label>
                    <Input
                      id="inquiry-phone"
                      className="mt-2"
                      inputMode="tel"
                      value={form.phone}
                      onChange={(event) => setForm({ ...form, phone: event.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="inquiry-note">
                      {t.request.message}{" "}
                      <span className="text-muted-foreground">({t.request.optional})</span>
                    </Label>
                    <Textarea
                      id="inquiry-note"
                      rows={2}
                      className="mt-2"
                      value={form.note}
                      onChange={(event) => setForm({ ...form, note: event.target.value })}
                    />
                  </div>
                </div>

                <p className="text-xs text-muted-foreground">{t.request.privacy}</p>
              </>
            )}
          </DialogBody>

          <DialogFooter className="flex-col gap-2 sm:flex-row sm:justify-between">
            {sent ? (
              <Button variant="outline" className="w-full sm:w-auto" onClick={() => setOpen(false)}>
                {t.admin.cancel}
              </Button>
            ) : (
              <>
                <Button
                  type="button"
                  variant="ghost"
                  disabled={items.length === 0}
                  onClick={() => {
                    clear();
                    toast.success(t.toast.deleted);
                    setOpen(false);
                  }}
                >
                  <Trash2 /> {t.inquiry.clear}
                </Button>
                <div className="flex flex-col gap-2 sm:flex-row">
                  {whatsappNumber && (
                    <Button asChild variant="outline">
                      <a
                        href={whatsappLink(whatsappNumber, message)}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <MessageCircle />
                        {t.inquiry.whatsappSend}
                      </a>
                    </Button>
                  )}
                  <Button onClick={submit} disabled={items.length === 0}>
                    <Send />
                    {t.inquiry.submit}
                  </Button>
                </div>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
