import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ExternalLink, Pencil, Plus, Search, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { ProductFormDialog } from "@/pages/admin/ProductFormDialog";
import { EmptyState } from "@/components/States";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/field";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge, Card } from "@/components/ui/surface";
import { useI18n } from "@/lib/i18n";
import { useStore } from "@/lib/store";
import type { Product } from "@/lib/types";
import { formatPrice } from "@/lib/utils";

export function ProductsPanel() {
  const { t, tx } = useI18n();
  const { products, categoryById, deleteProduct } = useStore();
  const [query, setQuery] = useState("");
  const [editing, setEditing] = useState<Product | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<Product | null>(null);

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return products;
    return products.filter(
      (product) =>
        product.name.primary.toLowerCase().includes(needle) ||
        product.code.toLowerCase().includes(needle),
    );
  }, [products, query]);

  const openCreate = () => {
    setEditing(null);
    setFormOpen(true);
  };

  const openEdit = (product: Product) => {
    setEditing(product);
    setFormOpen(true);
  };

  const confirmDelete = () => {
    if (!pendingDelete) return;
    deleteProduct(pendingDelete.id);
    setPendingDelete(null);
    toast.success(t.toast.deleted);
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative sm:max-w-xs sm:flex-1">
          <Search
            className="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden="true"
          />
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={t.admin.searchProducts}
            className="ps-9"
            type="search"
            aria-label={t.admin.searchProducts}
          />
        </div>
        <Button onClick={openCreate}>
          <Plus /> {t.admin.addProduct}
        </Button>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          title={t.admin.noProducts}
          hint={t.admin.noProductsHint}
          action={
            <Button onClick={openCreate}>
              <Plus /> {t.admin.addProduct}
            </Button>
          }
        />
      ) : (
        <ul className="space-y-3">
          {filtered.map((product) => {
            const category = categoryById(product.categoryId);
            return (
              <li key={product.id}>
                <Card className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center">
                  <div className="size-20 shrink-0 overflow-hidden rounded-md border border-border bg-muted">
                    {product.images.length > 0 ? (
                      <img
                        src={
                          product.images.find((img) => img.id === product.mainImageId)?.url ??
                          product.images[0].url
                        }
                        alt=""
                        loading="lazy"
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="grid h-full w-full place-items-center bg-gradient-to-br from-wine-800 to-wine-950 text-[0.5rem] uppercase tracking-[0.14em] text-cream-200">
                        {product.code}
                      </div>
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-display text-lg font-semibold">{product.name.primary}</h3>
                      {!product.active && <Badge variant="muted">{t.admin.active}</Badge>}
                      {product.isNew && <Badge variant="gold">{t.home.newBadge}</Badge>}
                      {product.isBestSeller && <Badge variant="primary">{t.home.bestBadge}</Badge>}
                    </div>
                    <p className="mt-1 text-[0.7rem] uppercase tracking-[0.12em] text-muted-foreground">
                      {product.code}
                      {category ? ` · ${tx(category.name)}` : ""} · {product.minOrderQty}{" "}
                      {t.card.pieces} · {product.sizes.join("/")}
                    </p>
                    <p className="mt-1.5 font-display text-base font-semibold">
                      {product.price === null
                        ? t.card.contactForPrice
                        : formatPrice(product.price, "DZD", t.card.contactForPrice)}
                    </p>
                  </div>

                  <div className="flex shrink-0 items-center gap-1.5">
                    <Button asChild variant="ghost" size="icon" aria-label={t.card.quickView}>
                      <Link to={`/product/${product.slug}`} target="_blank" rel="noopener noreferrer">
                        <ExternalLink />
                      </Link>
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openEdit(product)}
                      aria-label={t.admin.editProduct}
                    >
                      <Pencil /> {t.admin.editProduct}
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label={t.admin.deleteProduct}
                      onClick={() => setPendingDelete(product)}
                    >
                      <Trash2 className="text-destructive" />
                    </Button>
                  </div>
                </Card>
              </li>
            );
          })}
        </ul>
      )}

      <ProductFormDialog open={formOpen} onOpenChange={setFormOpen} product={editing} />

      <Dialog open={Boolean(pendingDelete)} onOpenChange={(open) => !open && setPendingDelete(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{t.admin.deleteConfirmTitle}</DialogTitle>
            <DialogDescription>{t.admin.deleteConfirmText}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPendingDelete(null)}>
              {t.admin.cancel}
            </Button>
            <Button variant="destructive" onClick={confirmDelete}>
              {t.admin.confirm}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
