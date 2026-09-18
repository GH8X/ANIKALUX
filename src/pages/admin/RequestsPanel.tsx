import { useMemo, useState } from "react";
import { MessageCircle, Phone, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { EmptyState } from "@/components/States";
import { Button } from "@/components/ui/button";
import { Label, Select } from "@/components/ui/field";
import { Badge, Card } from "@/components/ui/surface";
import { useI18n } from "@/lib/i18n";
import { useStore } from "@/lib/store";
import { REQUEST_STATUSES, type RequestStatus } from "@/lib/types";
import { formatDate, whatsappLink } from "@/lib/utils";

const STATUS_VARIANT: Record<RequestStatus, "info" | "warning" | "success" | "muted" | "primary"> = {
  new: "info",
  contacted: "warning",
  confirmed: "success",
  completed: "primary",
  cancelled: "muted",
};

export function RequestsPanel() {
  const { t, locale } = useI18n();
  const { requests, setRequestStatus, deleteRequest } = useStore();
  const [statusFilter, setStatusFilter] = useState<RequestStatus | "all">("all");

  const statusLabel = (status: RequestStatus) =>
    ({
      new: t.admin.statusNew,
      contacted: t.admin.statusContacted,
      confirmed: t.admin.statusConfirmed,
      completed: t.admin.statusCompleted,
      cancelled: t.admin.statusCancelled,
    })[status];

  const filtered = useMemo(
    () => (statusFilter === "all" ? requests : requests.filter((r) => r.status === statusFilter)),
    [requests, statusFilter],
  );

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="sm:max-w-xs sm:flex-1">
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
        <p className="text-sm text-muted-foreground">
          {filtered.length} / {requests.length}
        </p>
      </div>

      {filtered.length === 0 ? (
        <EmptyState title={t.admin.noRequests} hint={t.admin.noRequestsHint} />
      ) : (
        <ul className="space-y-4">
          {filtered.map((request) => (
            <li key={request.id}>
              <Card className="p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-display text-lg font-semibold">{request.fullName}</h3>
                      <Badge variant={STATUS_VARIANT[request.status]}>
                        {statusLabel(request.status)}
                      </Badge>
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">{request.businessName}</p>
                  </div>
                  <div className="flex items-center gap-1.5">
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
                      aria-label={t.admin.confirm}
                      onClick={() => {
                        deleteRequest(request.id);
                        toast.success(t.toast.deleted);
                      }}
                    >
                      <Trash2 className="text-destructive" />
                    </Button>
                  </div>
                </div>

                <dl className="mt-4 grid gap-x-6 gap-y-3 border-t border-border/60 pt-4 text-sm sm:grid-cols-2">
                  {[
                    { label: t.admin.wilaya, value: request.wilaya },
                    { label: t.admin.received, value: formatDate(request.createdAt, locale) },
                    { label: t.admin.productsRequested, value: request.products },
                    { label: t.admin.quantity, value: request.quantity },
                    ...(request.message
                      ? [{ label: t.admin.message, value: request.message }]
                      : []),
                  ].map((row) => (
                    <div key={row.label} className="flex flex-col gap-0.5">
                      <dt className="text-[0.66rem] font-medium uppercase tracking-[0.14em] text-muted-foreground">
                        {row.label}
                      </dt>
                      <dd className="text-foreground/85">{row.value}</dd>
                    </div>
                  ))}
                </dl>

                <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-border/60 pt-4">
                  <span className="text-[0.7rem] font-medium uppercase tracking-[0.14em] text-muted-foreground">
                    {t.admin.requestStatus}
                  </span>
                  {REQUEST_STATUSES.map((status) => (
                    <button
                      key={status}
                      type="button"
                      onClick={() => {
                        setRequestStatus(request.id, status);
                        toast.success(t.toast.statusUpdated);
                      }}
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
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
