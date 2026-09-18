import { useMemo, useState } from "react";
import { Check, Search } from "lucide-react";
import { Input } from "@/components/ui/field";
import { useI18n } from "@/lib/i18n";
import { useStore } from "@/lib/store";
import { cn } from "@/lib/utils";

interface ProductMultiSelectProps {
  ids: string[];
  onChange: (ids: string[]) => void;
}

export function ProductMultiSelect({ ids, onChange }: ProductMultiSelectProps) {
  const { t } = useI18n();
  const { products, categoryById } = useStore();
  const [query, setQuery] = useState("");

  const list = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return products
      .filter((product) => {
        if (!needle) return true;
        return (
          product.name.primary.toLowerCase().includes(needle) ||
          product.code.toLowerCase().includes(needle)
        );
      })
      .slice(0, 40);
  }, [products, query]);

  const toggle = (id: string) => {
    onChange(ids.includes(id) ? ids.filter((x) => x !== id) : [...ids, id]);
  };

  return (
    <div className="space-y-3">
      <div className="relative">
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
        />
      </div>

      <div className="max-h-72 space-y-1.5 overflow-y-auto rounded-md border border-border/70 bg-muted/30 p-2">
        {list.length === 0 ? (
          <p className="p-4 text-center text-sm text-muted-foreground">{t.admin.noProducts}</p>
        ) : (
          list.map((product) => {
            const selected = ids.includes(product.id);
            const category = categoryById(product.categoryId);
            return (
              <button
                key={product.id}
                type="button"
                onClick={() => toggle(product.id)}
                aria-pressed={selected}
                className={cn(
                  "flex w-full items-center gap-3 rounded-md border px-3 py-2 text-start transition-colors",
                  selected
                    ? "border-primary/40 bg-secondary"
                    : "border-transparent hover:bg-card",
                )}
              >
                <span
                  className={cn(
                    "grid size-5 shrink-0 place-items-center rounded border transition-colors",
                    selected ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card",
                  )}
                >
                  {selected && <Check className="size-3" aria-hidden="true" />}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-medium">{product.name.primary}</span>
                  <span className="block truncate text-[0.68rem] uppercase tracking-[0.1em] text-muted-foreground">
                    {product.code}
                    {category ? ` · ${category.name.primary}` : ""}
                  </span>
                </span>
              </button>
            );
          })
        )}
      </div>

      <p className="text-xs text-muted-foreground">
        {ids.length > 0 ? `${ids.length} — ${t.admin.selectProducts}` : t.admin.noSelection}
      </p>
    </div>
  );
}
