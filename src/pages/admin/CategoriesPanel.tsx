import { useEffect, useState } from "react";
import { ArrowDown, ArrowUp, Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { TranslationsField } from "@/components/admin/TranslationsField";
import { EmptyState } from "@/components/States";
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
import { Label, Select } from "@/components/ui/field";
import { Badge, Card } from "@/components/ui/surface";
import { useI18n } from "@/lib/i18n";
import { newId, useStore } from "@/lib/store";
import type { Category } from "@/lib/types";
import { slugify } from "@/lib/utils";

function emptyCategory(order: number): Category {
  return {
    id: newId("cat"),
    slug: "",
    name: { primary: "", en: "", fr: "", ar: "" },
    group: "pajamas",
    description: { primary: "", en: "", fr: "", ar: "" },
    image: null,
    order,
  };
}

export function CategoriesPanel() {
  const { t, tx } = useI18n();
  const { categories, products, saveCategory, deleteCategory, moveCategory } = useStore();
  const [editing, setEditing] = useState<Category | null>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) setEditing(null);
  }, [open]);

  const startCreate = () => {
    setEditing(emptyCategory(categories.length + 1));
    setOpen(true);
  };

  const startEdit = (category: Category) => {
    setEditing({ ...category });
    setOpen(true);
  };

  const handleSave = () => {
    if (!editing || !editing.name.primary.trim()) {
      toast.error(t.toast.formError);
      return;
    }
    saveCategory({
      ...editing,
      slug: editing.slug || slugify(editing.name.primary),
      name: { ...editing.name, en: editing.name.en || editing.name.primary },
    });
    setOpen(false);
    toast.success(t.toast.saved);
  };

  return (
    <div className="space-y-5">
      <div className="flex justify-end">
        <Button onClick={startCreate}>
          <Plus /> {t.admin.addCategory}
        </Button>
      </div>

      {categories.length === 0 ? (
        <EmptyState title={t.admin.noCategories} />
      ) : (
        <ul className="space-y-3">
          {categories.map((category, index) => {
            const count = products.filter((p) => p.categoryId === category.id).length;
            return (
              <li key={category.id}>
                <Card className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center">
                  <div className="flex shrink-0 flex-col gap-1">
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      aria-label={t.admin.moveUp}
                      disabled={index === 0}
                      onClick={() => moveCategory(category.id, "up")}
                    >
                      <ArrowUp />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      aria-label={t.admin.moveDown}
                      disabled={index === categories.length - 1}
                      onClick={() => moveCategory(category.id, "down")}
                    >
                      <ArrowDown />
                    </Button>
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-display text-lg font-semibold">{tx(category.name)}</h3>
                      <Badge variant={category.group === "pajamas" ? "cream" : "wine"}>
                        {category.group === "pajamas" ? t.admin.groupPajamas : t.admin.groupClothing}
                      </Badge>
                      <Badge variant="muted">
                        {count} {t.admin.products}
                      </Badge>
                    </div>
                    <p className="mt-1 font-mono text-[0.7rem] text-muted-foreground">
                      /{category.slug}
                    </p>
                  </div>

                  <div className="flex shrink-0 items-center gap-1.5">
                    <Button variant="outline" size="sm" onClick={() => startEdit(category)}>
                      <Pencil /> {t.admin.editCategory}
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label={t.admin.confirm}
                      onClick={() => {
                        deleteCategory(category.id);
                        toast.success(t.toast.deleted);
                      }}
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

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>{t.admin.editCategory}</DialogTitle>
            <DialogDescription>{t.admin.subtitle}</DialogDescription>
          </DialogHeader>
          {editing && (
            <DialogBody className="space-y-4">
              <TranslationsField
                id="category-name"
                label={t.admin.categoryName}
                value={editing.name}
                onChange={(name) => setEditing({ ...editing, name })}
              />
              <TranslationsField
                id="category-description"
                label={t.admin.description}
                value={editing.description ?? { primary: "" }}
                onChange={(description) => setEditing({ ...editing, description })}
                multiline
              />
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label htmlFor="category-group">{t.admin.group}</Label>
                  <div className="mt-2">
                    <Select
                      id="category-group"
                      value={editing.group}
                      onChange={(event) =>
                        setEditing({ ...editing, group: event.target.value as Category["group"] })
                      }
                    >
                      <option value="pajamas">{t.admin.groupPajamas}</option>
                      <option value="clothing">{t.admin.groupClothing}</option>
                    </Select>
                  </div>
                </div>
                <div>
                  <Label htmlFor="category-slug">{t.admin.order}</Label>
                  <input
                    id="category-order"
                    type="number"
                    min={1}
                    value={editing.order}
                    onChange={(event) =>
                      setEditing({ ...editing, order: Number(event.target.value) || 1 })
                    }
                    className="mt-2 h-11 w-full rounded-md border border-input bg-card px-3.5 text-sm"
                  />
                </div>
              </div>
            </DialogBody>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              {t.admin.cancel}
            </Button>
            <Button onClick={handleSave}>{t.admin.save}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
