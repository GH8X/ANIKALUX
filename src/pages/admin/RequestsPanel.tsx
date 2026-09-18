import { useMemo, useState } from "react";
import {
  Archive,
  ArchiveRestore,
  MessageCircle,
  Phone,
  Save,
  Search,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import { EmptyState } from "@/components/States";
import { Button } from "@/components/ui/button";
import { Input, Label, Select, Textarea } from "@/components/ui/field";
import { Badge, Card } from "@/components/ui/surface";
import { useI18n } from "@/lib/i18n";
import { useStore } from "@/lib/store";
import { REQUEST_STATUSES, type RequestStatus, type WholesaleRequest } from "@/lib/types";
import { cn, formatDate, whatsappLink } from "@/lib/utils";

const STATUS_VARIANT: Record<RequestStatus, "info" | "warning" | "success" | "muted" | "primary"> = {
  new: "info",
  contacted: "warning",
  confirmed: "success",
  completed: "primary",
  cancelled: "muted",
};

export function RequestsPanel() {
  const { t } = useI18n();
  const { requests, setRequestStatus, updateRequest, deleteRequest } = useStore();
  const [statusFilter, setStatusFilter] = useState<RequestStatus | "all">("all");
  const [query, setQuery] = useState("");
  const [showArchived, setShowArchived] = useState(false);

  const statusLabel = (status: RequestStatus) =>
    ({
      new: t.admin.statusNew,
      contacted: t.admin.statusContacted,
      confirmed: t.admin.statusConfirmed,
      completed: t.admin.statusCompleted,
      cancelled: t.admin.statusCancelled,
    })[status];

  const archivedCount = requests.filter((r) => r.archived).length;

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return requests
      .filter((r) => (showArchived ? true : !r.archived))
      .filter((r) => statusFilter === "all" || r.status === statusFilter)
      .filter((r) => {
        if (!needle) return true;
        const haystack = [
          r.fullName,
          r.businessName,
          r.phone,
          r.wilaya,
          r.products,
          r.message,
          r.notes,
          ...(r.items ?? []).map((item) => `${item.name} ${item.code}`),
        ]
          .join(" ")
          .toLowerCase();
        return haystack.includes(needle);
      });
  }, [requests, statusFilter, query, showArchived]);

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div className="grid flex-1 gap-3 sm:grid-cols-2 lg:max-w-2xl">
          <div>
            <Label htmlFor="request-search">{t.admin.searchRequests}</Label>
            <div className="relative mt-2">
              <Search
                className="pointer-events-none absolute inset-y-0 start-3 my-auto size-4 text-muted-foreground"
                aria-hidden="true"
              />
              <Input
                id="request-search"
                value={query}
                className="ps-9"
                onChange={(event) => setQuery(event.target.value)}
              />
            </div>
          </div>
          <div>
            <Label htmlFor="request-status-filter">{t.admin.filterByStatus}</Label>
            <div className="mt-2">
              <Select
                id="request-status-filter"
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value as RequestStatus | "all")}
              >
                <option value="all">{t.admin.allStatuses}</option>
                {REQUEST_STATUSES.map((status) => (
                  <option key={status} value={status}>
                    {statusLabel(status)}
                  </option>
                ))}
              </Select>
            </div>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Button
            variant={showArchived ? "primary" : "outline"}
            size="sm"
            onClick={() => setShowArchived((value) => !value)}
          >
            <Archive /> {showArchived ? t.admin.hideArchived : t.admin.showArchived}
            {archivedCount > 0 && (
              <Badge variant="muted" className="px-1.5 py-0 text-[0.6rem]">
                {archivedCount}
              </Badge>
            )}
          </Button>
          <p className="text-sm text-muted-foreground">
            {filtered.length} / {requests.length}
          </p>
        </div>
      </div>

      {filtered.length === 0 ? (
        <EmptyState title={t.admin.noRequests} hint={t.admin.noRequestsHint} />
      ) : (
        <ul className="space-y-4">
          {filtered.map((request) => (
            <li key={request.id}>
              <RequestCard
                request={request}
                statusLabel={statusLabel}
                onStatus={(status) => {
                  setRequestStatus(request.id, status);
                  toast.success(t.toast.statusUpdated);
                }}
                onNotes={(notes) => {
                  updateRequest(request.id, { notes });
                  toast.success(t.toast.saved);
                }}
                onArchive={(archived) => {
                  updateRequest(request.id, { archived });
                  toast.success(t.toast.updated);
                }}
                onDelete={() => {
                  deleteRequest(request.id);
                  toast.success(t.toast.deleted);
                }}
              />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function RequestCard({
  request,
  statusLabel,
  onStatus,
  onNotes,
  onArchive,
  onDelete,
}: {
  request: WholesaleRequest;
  statusLabel: (status: RequestStatus) => string;
  onStatus: (status: RequestStatus) => void;
  onNotes: (notes: string) => void;
  onArchive: (archived: boolean) => void;
  onDelete: () => void;
}) {
  const { t, locale } = useI18n();
  const [notes, setNotes] = useState(request.notes ?? "");

  return (
    <Card className={cn("p-5", request.archived && "opacity-75")}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-display text-lg font-semibold">{request.fullName}</h3>
            <Badge variant={STATUS_VARIANT[request.status]}>{statusLabel(request.status)}</Badge>
            {request.archived && <Badge variant="muted">{t.admin.archived}</Badge>}
          </div>
          <p className="mt-1 text-sm text-muted-foreground">{request.businessName}</p>
        </div>
        <div className="flex flex-wrap items-center gap-1.5">
          <Button asChild variant="outline" size="sm">
            <a href={`tel:${request.phone.replace(/[^\d+]/g, "")}`}>
              <Phone /> {request.phone}
            </a>
          </Button>
          <Button asChild variant="outline" size="sm">
            <a
              href={whatsappLink(
                request.phone,
                `${t.request.whatsappPrefill} (${request.businessName})`,
              )}
              target="_blank"
              rel="noopener noreferrer"
            >
              <MessageCircle /> {t.contact.whatsapp}
            </a>
          </Button>
          <Button
            variant="ghost"
            size="icon"
            aria-label={request.archived ? t.admin.unarchive : t.admin.archive}
            title={request.archived ? t.admin.unarchive : t.admin.archive}
            onClick={() => onArchive(!request.archived)}
          >
            {request.archived ? <ArchiveRestore /> : <Archive />}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            aria-label={t.admin.deleteProduct}
            onClick={onDelete}
          >
            <Trash2 className="text-destructive" />
          </Button>
        </div>
      </div>

      {request.items && request.items.length > 0 && (
        <ul className="mt-4 divide-y divide-border/60 overflow-hidden rounded-md border border-border/60">
          {request.items.map((item, index) => (
            <li
              key={`${item.productId}-${index}`}
              className="flex flex-wrap items-center justify-between gap-2 px-3.5 py-2.5 text-sm"
            >
              <span className="font-medium">{item.name}</span>
              <span className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                <span dir="ltr">{item.code}</span>
                {item.color && <span>{item.color}</span>}
                {item.size && <span>{item.size}</span>}
                <span className="font-semibold text-foreground">×{item.quantity}</span>
              </span>
            </li>
          ))}
        </ul>
      )}

      <dl className="mt-4 grid gap-x-6 gap-y-3 border-t border-border/60 pt-4 text-sm sm:grid-cols-2">
        {[
          { label: t.admin.wilaya, value: request.wilaya },
          { label: t.admin.received, value: formatDate(request.createdAt, locale) },
          { label: t.admin.productsRequested, value: request.products },
          { label: t.admin.quantity, value: request.quantity },
          ...(request.message ? [{ label: t.admin.message, value: request.message }] : []),
        ]
          .filter((row) => row.value)
          .map((row) => (
            <div key={row.label} className="flex flex-col gap-0.5">
              <dt className="text-[0.66rem] font-medium uppercase tracking-[0.14em] text-muted-foreground">
                {row.label}
              </dt>
              <dd className="text-foreground/85">{row.value}</dd>
            </div>
          ))}
      </dl>

      <div className="mt-4 border-t border-border/60 pt-4">
        <Label htmlFor={`notes-${request.id}`}>{t.admin.notes}</Label>
        <Textarea
          id={`notes-${request.id}`}
          rows={2}
          className="mt-2"
          value={notes}
          placeholder={t.admin.notesPlaceholder}
          onChange={(event) => setNotes(event.target.value)}
        />
        <div className="mt-2 flex justify-end">
          <Button variant="outline" size="sm" onClick={() => onNotes(notes)}>
            <Save /> {t.admin.saveNotes}
          </Button>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-border/60 pt-4">
        <span className="text-[0.7rem] font-medium uppercase tracking-[0.14em] text-muted-foreground">
          {t.admin.requestStatus}
        </span>
        {REQUEST_STATUSES.map((status) => (
          <button
            key={status}
            type="button"
            onClick={() => onStatus(status)}
            aria-pressed={request.status === status}
            className={
              request.status === status
                ? "rounded-full border border-primary bg-primary px-3 py-1 text-[0.72rem] text-primary-foreground"
                : "rounded-full border border-border px-3 py-1 text-[0.72rem] text-muted-foreground transition-colors hover:border-primary/40 hover:text-primary"
            }
          >
            {statusLabel(status)}
          </button>
        ))}
      </div>
    </Card>
  );
}
