import { useEffect, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { ImageUploader } from "@/components/admin/ImageUploader";
import { TranslationsField } from "@/components/admin/TranslationsField";
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
import { newId, useStore } from "@/lib/store";
import type { Product, ProductColor, ProductImage } from "@/lib/types";
import { slugify } from "@/lib/utils";

interface ProductFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Product being edited, or null to create a new one. */
  product: Product | null;
}

function emptyProduct(categoryId: string): Product {
  return {
    id: newId("prd"),
    slug: "",
    code: "",
    name: { primary: "", en: "", fr: "", ar: "" },
    categoryId,
    description: { primary: "", en: "", fr: "", ar: "" },
    price: null,
    minOrderQty: 12,
    sizes: ["S", "M", "L", "XL"],
    colors: [],
    images: [],
    mainImageId: null,
    isNew: true,
    isBestSeller: false,
    isFeatured: false,
    active: true,
    createdAt: new Date().toISOString(),
  };
}

const PRESET_COLORS: [string, string][] = [
  ["Bordeaux", "#6E1529"],
  ["Wine", "#7A1B2E"],
  ["Ivory", "#F4E3C1"],
  ["Champagne", "#E0C68F"],
  ["Blush", "#D9A7AE"],
  ["Noir", "#2A0610"],
  ["Stone", "#CFC5B8"],
  ["Camel", "#B98F5F"],
];

export function ProductFormDialog({ open, onOpenChange, product }: ProductFormDialogProps) {
  const { t } = useI18n();
  const { categories, saveProduct } = useStore();
  const [draft, setDraft] = useState<Product>(() => emptyProduct(categories[0]?.id ?? ""));
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    setDraft(product ? { ...product } : emptyProduct(categories[0]?.id ?? ""));
  }, [open, product, categories]);

  const patch = (changes: Partial<Product>) => setDraft((current) => ({ ...current, ...changes }));

  const addColor = (name = "", hex = "#6E1529") =>
    patch({ colors: [...draft.colors, { id: newId("col"), name, hex } as ProductColor] });

  const updateColor = (id: string, changes: Partial<ProductColor>) =>
    patch({ colors: draft.colors.map((c) => (c.id === id ? { ...c, ...changes } : c)) });

  const removeColor = (id: string) => patch({ colors: draft.colors.filter((c) => c.id !== id) });

  const handleSave = () => {
    if (!draft.name.primary.trim() || !draft.code.trim() || !draft.categoryId) {
      toast.error(t.toast.formError);
      return;
    }
    setSaving(true);

    const code = draft.code.trim().toUpperCase();
    const slug =
      draft.slug && product
        ? draft.slug
        : `${slugify(code)}-${slugify(draft.name.primary)}`.replace(/^-+|-+$/g, "");

    window.setTimeout(() => {
      saveProduct({
        ...draft,
        code,
        slug,
        name: { ...draft.name, en: draft.name.en || draft.name.primary },
      });
      setSaving(false);
      onOpenChange(false);
      toast.success(product ? t.toast.updated : t.toast.created);
    }, 300);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>{product ? t.admin.editProduct : t.admin.newProduct}</DialogTitle>
          <DialogDescription>{t.admin.subtitle}</DialogDescription>
        </DialogHeader>

        <DialogBody className="space-y-7">
          <section className="space-y-4">
            <TranslationsField
              id="product-name"
              label={t.admin.name}
              value={draft.name}
              onChange={(name) => patch({ name })}
              placeholder="Rose Satin Pyjama Set"
            />

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="product-code">{t.admin.code}</Label>
                <Input
                  id="product-code"
                  className="mt-2 font-mono uppercase"
                  value={draft.code}
                  onChange={(event) => patch({ code: event.target.value })}
                  placeholder="ALX-PJ-101"
                />
              </div>
              <div>
                <Label htmlFor="product-category">{t.admin.categoryField}</Label>
                <div className="mt-2">
                  <Select
                    id="product-category"
                    value={draft.categoryId}
                    onChange={(event) => patch({ categoryId: event.target.value })}
                  >
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name.primary}
                      </option>
                    ))}
                  </Select>
                </div>
              </div>
            </div>

            <TranslationsField
              id="product-description"
              label={t.admin.description}
              value={draft.description}
              onChange={(description) => patch({ description })}
              multiline
              placeholder="Fabric, finishing and packing notes…"
            />
          </section>

          <section className="space-y-4">
            <h4 className="text-[0.72rem] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
              {t.product.specifications}
            </h4>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="product-price">{t.admin.price}</Label>
                <Input
                  id="product-price"
                  className="mt-2"
                  type="number"
                  min={0}
                  inputMode="numeric"
                  value={draft.price ?? ""}
                  onChange={(event) =>
                    patch({ price: event.target.value === "" ? null : Number(event.target.value) })
                  }
                  placeholder="4200"
                />
                <p className="mt-1.5 text-xs text-muted-foreground">{t.admin.priceHint}</p>
              </div>
              <div>
                <Label htmlFor="product-moq">{t.admin.minOrderQty}</Label>
                <Input
                  id="product-moq"
                  className="mt-2"
                  type="number"
                  min={1}
                  inputMode="numeric"
                  value={draft.minOrderQty}
                  onChange={(event) => patch({ minOrderQty: Number(event.target.value) || 1 })}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="product-sizes">{t.admin.sizes}</Label>
              <Input
                id="product-sizes"
                className="mt-2"
                value={draft.sizes.join(", ")}
                onChange={(event) =>
                  patch({
                    sizes: event.target.value
                      .split(",")
                      .map((size) => size.trim())
                      .filter(Boolean),
                  })
                }
                placeholder="S, M, L, XL"
              />
            </div>

            <div className="space-y-3">
              <Label>{t.admin.colors}</Label>
              <ul className="space-y-2">
                {draft.colors.map((color) => (
                  <li key={color.id} className="flex items-center gap-2">
                    <input
                      type="color"
                      value={color.hex}
                      aria-label={t.admin.colorName}
                      onChange={(event) => updateColor(color.id, { hex: event.target.value })}
                      className="size-11 shrink-0 cursor-pointer rounded-md border border-input bg-card p-1"
                    />
                    <Input
                      value={color.name}
                      onChange={(event) => updateColor(color.id, { name: event.target.value })}
                      placeholder={t.admin.colorName}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      aria-label={t.admin.removeImage}
                      onClick={() => removeColor(color.id)}
                    >
                      <Trash2 />
                    </Button>
                  </li>
                ))}
              </ul>

              <div className="flex flex-wrap items-center gap-2">
                <Button type="button" variant="outline" size="sm" onClick={() => addColor()}>
                  <Plus /> {t.admin.addColor}
                </Button>
                <span className="text-xs text-muted-foreground">{t.admin.colors} :</span>
                {PRESET_COLORS.map(([name, hex]) => (
                  <button
                    key={hex}
                    type="button"
                    title={name}
                    aria-label={name}
                    onClick={() => addColor(name, hex)}
                    className="size-6 rounded-full ring-1 ring-inset ring-black/15 transition-transform hover:scale-110"
                    style={{ backgroundColor: hex }}
                  />
                ))}
              </div>
            </div>
          </section>

          <section className="space-y-4">
            <ImageUploader
              images={draft.images}
              mainImageId={draft.mainImageId}
              onChange={(images: ProductImage[], mainImageId: string | null) =>
                patch({ images, mainImageId })
              }
            />
          </section>

          <section className="space-y-3">
            <h4 className="text-[0.72rem] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
              {t.admin.overview}
            </h4>
            <div className="grid gap-2 sm:grid-cols-2">
              {[
                { key: "isNew" as const, label: t.admin.markNew },
                { key: "isBestSeller" as const, label: t.admin.markBest },
                { key: "isFeatured" as const, label: t.admin.markFeatured },
                { key: "active" as const, label: t.admin.active },
              ].map((toggle) => (
                <label
                  key={toggle.key}
                  className="flex cursor-pointer items-center gap-3 rounded-md border border-border/70 bg-card px-3.5 py-3 text-sm transition-colors hover:border-primary/35"
                >
                  <input
                    type="checkbox"
                    checked={draft[toggle.key]}
                    onChange={(event) => patch({ [toggle.key]: event.target.checked } as Partial<Product>)}
                    className="size-4 accent-[hsl(var(--primary))]"
                  />
                  {toggle.label}
                </label>
              ))}
            </div>
          </section>

          <section className="space-y-2">
            <Label htmlFor="product-slug">{t.product.code}</Label>
            <Textarea
              id="product-slug"
              rows={1}
              className="font-mono text-xs"
              value={draft.slug}
              onChange={(event) => patch({ slug: event.target.value })}
              placeholder="alx-pj-101-rose-satin-pyjama-set"
            />
          </section>
        </DialogBody>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {t.admin.cancel}
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? t.admin.saving : t.admin.save}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
