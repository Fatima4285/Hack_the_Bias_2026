import { useState, useMemo, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChevronDown, ChevronUp } from "lucide-react";
import { 
  type DailyLog, 
  phases, 
  symptomCards, 
  formatLogDate 
} from "./shared";

interface PreviousLogsProps {
  logs: DailyLog[];
  activeLogId: string | null;
  onLoadLog: (log: DailyLog) => void;
}

export function PreviousLogs({ logs, activeLogId, onLoadLog }: PreviousLogsProps) {
  const [logsOpen, setLogsOpen] = useState(false);
  const [expandedIds, setExpandedIds] = useState<Record<string, boolean>>({});
  const [visibleCount, setVisibleCount] = useState(3);

  const visibleLogs = useMemo(() => logs.slice(0, visibleCount), [logs, visibleCount]);
  const canShowMore = visibleCount < logs.length;

  // When logs change (new save), reset visible count
  useEffect(() => {
     // If we wanted to reset expanded logic when logs change, we could do it here
  }, [logs.length]);

  function toggleExpanded(id: string) {
    setExpandedIds((prev) => ({ ...prev, [id]: !prev[id] }));
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between gap-3">
          <CardTitle>Previous Logs</CardTitle>

          <button
            type="button"
            onClick={() => setLogsOpen((v) => !v)}
            className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 text-xs font-semibold text-ink shadow-sm transition hover:bg-secondary focus:outline-none focus:ring-2 focus:ring-primary/60"
            aria-expanded={logsOpen}
            aria-controls="previous-logs-panel"
          >
            {logsOpen ? "Collapse" : `Expand (${logs.length})`}
            {logsOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </button>
        </div>
      </CardHeader>

      {logsOpen ? (
        <CardContent id="previous-logs-panel">
          {logs.length === 0 ? (
            <p className="text-sm leading-6 text-neutral-body">
              No saved logs yet. Your saved logs will appear here.
            </p>
          ) : (
            <div className="space-y-2">
              {visibleLogs.map((log) => {
                const isSelected = log.id === activeLogId;
                const isExpanded = !!expandedIds[log.id];
                const totalStars = Object.values(log.ratings).reduce((a, b) => a + b, 0);

                return (
                  <div
                    key={log.id}
                    className={
                      "w-full rounded-2xl border p-3 text-left shadow-sm transition focus-within:ring-2 focus-within:ring-primary/60" +
                      (isSelected
                        ? " border-primary bg-secondary"
                        : " border-black/10 bg-white hover:bg-secondary")
                    }
                  >
                    <div className="flex items-start justify-between gap-3">
                      <button
                        type="button"
                        onClick={() => onLoadLog(log)}
                        className="flex-1 text-left focus:outline-none"
                      >
                        <p className="text-sm font-semibold text-ink">{formatLogDate(log.savedAt)}</p>
                        <p className="mt-1 text-sm leading-6 text-neutral-body">
                          Phase: {phases.find((p) => p.key === log.phase)?.label}
                          {" · "}Total stars: {totalStars}
                        </p>

                        {!isExpanded && (
                          <>
                            {log.notes?.trim() ? (
                              <p className="mt-1 text-sm leading-6 text-ink">
                                {log.notes.length > 70 ? log.notes.slice(0, 70) + "…" : log.notes}
                              </p>
                            ) : (
                              <p className="mt-1 text-sm leading-6 text-neutral-body">No notes</p>
                            )}
                          </>
                        )}
                      </button>

                      <button
                        type="button"
                        onClick={() => toggleExpanded(log.id)}
                        className="shrink-0 rounded-full bg-white px-3 py-1 text-xs font-semibold text-ink shadow-sm transition hover:bg-secondary focus:outline-none focus:ring-2 focus:ring-primary/60"
                        aria-expanded={isExpanded}
                      >
                        {isExpanded ? "Hide" : "Details"}
                      </button>
                    </div>

                    {isExpanded && (
                      <div className="mt-3 space-y-2">
                        <div className="rounded-2xl border border-black/10 bg-white p-3">
                          <p className="text-xs font-semibold text-ink">Symptom breakdown</p>
                          <div className="mt-2 space-y-1">
                            {symptomCards.map((s) => (
                              <div key={s.key} className="flex items-center justify-between gap-3">
                                <p className="text-sm text-neutral-body">{s.title}</p>
                                <p className="text-sm font-semibold text-ink">{log.ratings[s.key]}/5</p>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="rounded-2xl border border-black/10 bg-white p-3">
                          <p className="text-xs font-semibold text-ink">Notes</p>
                          <p className="mt-1 text-sm leading-6 text-ink">
                            {log.notes?.trim() ? log.notes : "No notes"}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}

              {/* Footer controls: never disappear if there are more than 3 logs */}
              {logs.length > 3 && (
                <div className="pt-2 space-y-2">
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setVisibleCount((c) => Math.min(c + 10, logs.length))}
                      disabled={!canShowMore}
                      className={
                        "flex-1 rounded-2xl bg-white px-4 py-3 text-sm font-semibold text-ink shadow-sm transition focus:outline-none focus:ring-2 focus:ring-primary/60 " +
                        (canShowMore ? "hover:bg-secondary" : "opacity-50 cursor-not-allowed")
                      }
                    >
                      {canShowMore ? "Show more (+10)" : "All logs shown"}
                    </button>

                    <button
                      type="button"
                      onClick={() => setVisibleCount(3)}
                      disabled={visibleCount <= 3}
                      className={
                        "rounded-2xl bg-white px-4 py-3 text-sm font-semibold text-ink shadow-sm transition focus:outline-none focus:ring-2 focus:ring-primary/60 " +
                        (visibleCount > 3 ? "hover:bg-secondary" : "opacity-50 cursor-not-allowed")
                      }
                    >
                      Show less
                    </button>
                  </div>

                  <p className="text-center text-xs text-neutral-body">
                    Showing {Math.min(visibleCount, logs.length)} of {logs.length}
                  </p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      ) : (
        <CardContent id="previous-logs-panel">
          <p className="text-sm leading-6 text-neutral-body">Hidden. Expand to view your saved logs.</p>
        </CardContent>
      )}
    </Card>
  );
}
