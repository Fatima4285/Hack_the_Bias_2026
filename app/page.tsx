"use client";

import { useEffect, useMemo, useState } from "react";
import { type User } from "firebase/auth";
import { useAuth } from "@/components/auth-provider";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Star, ChevronDown, ChevronUp } from "lucide-react";

type SymptomKey =
  | "executive-dysfunction"
  | "sensory-overload"
  | "high-masking"
  | "social-burnout"
  | "hyperfocus";

type PhaseKey = "menstrual" | "follicular" | "ovulatory" | "luteal" | "na";

const phases: { key: PhaseKey; label: string }[] = [
  { key: "menstrual", label: "Menstrual" },
  { key: "follicular", label: "Follicular" },
  { key: "ovulatory", label: "Ovulatory" },
  { key: "luteal", label: "Luteal" },
  { key: "na", label: "N/A" },
];

type DailyLog = {
  id: string;
  dateKey: string; // one log per local date
  savedAt: string;
  phase: PhaseKey;
  notes: string;
  ratings: Record<SymptomKey, number>;
};

const STORAGE_KEY = "neurolens.dailyLogs";
const TODAY_DRAFT_KEY = "neurolens.todayDraft";

function makeId() {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
}

function formatLogDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getLocalDateKey(d = new Date()) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

const DEFAULT_RATINGS: Record<SymptomKey, number> = {
  "executive-dysfunction": 0,
  "sensory-overload": 0,
  "high-masking": 0,
  "social-burnout": 0,
  hyperfocus: 0,
};

export function ParticipantDashboard({ user }: { user: User | null }) {
  const userName = user?.displayName ?? "Maya";
  const todayDateKey = useMemo(() => getLocalDateKey(new Date()), []);

  const todayLabel = useMemo(() => {
    return new Date().toLocaleDateString(undefined, {
      weekday: "long",
      month: "short",
      day: "numeric",
    });
  }, []);

  const symptomCards = useMemo(
    () =>
      [
        {
          key: "executive-dysfunction" as const,
          title: "Executive Dysfunction",
          helper: "Task initiation, prioritizing, switching",
        },
        {
          key: "sensory-overload" as const,
          title: "Sensory Overload",
          helper: "Noise, lights, textures, crowded spaces",
        },
        {
          key: "high-masking" as const,
          title: "High Masking",
          helper: "Performing ‘fine’ while feeling depleted",
        },
        {
          key: "social-burnout" as const,
          title: "Social Burnout",
          helper: "Post-social fatigue, shutdown, avoidance",
        },
        {
          key: "hyperfocus" as const,
          title: "Hyperfocus",
          helper: "Deep immersion; time blindness",
        },
      ],
    []
  );

  const [ratings, setRatings] = useState<Record<SymptomKey, number>>(DEFAULT_RATINGS);
  const [phase, setPhase] = useState<PhaseKey>("na");
  const [notes, setNotes] = useState("");
  const [saved, setSaved] = useState(false);

  const [logs, setLogs] = useState<DailyLog[]>([]);
  const [activeLogId, setActiveLogId] = useState<string | null>(null);

  // collapsed by default on refresh
  const [logsOpen, setLogsOpen] = useState(false);

  // expanded per-log details
  const [expandedIds, setExpandedIds] = useState<Record<string, boolean>>({});

  // show only latest 3, then +10 each time
  const [visibleCount, setVisibleCount] = useState(3);

  const visibleLogs = useMemo(() => logs.slice(0, visibleCount), [logs, visibleCount]);
  const canShowMore = visibleCount < logs.length;

  // Load logs + today's draft (so refresh doesn't clear stars)
  useEffect(() => {
    // Load logs
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as DailyLog[];
        if (Array.isArray(parsed)) setLogs(parsed);
      }
    } catch {
      // ignore
    }

    // Load today's draft
    try {
      const rawDraft = localStorage.getItem(TODAY_DRAFT_KEY);
      if (!rawDraft) return;

      const parsed = JSON.parse(rawDraft) as {
        dateKey: string;
        ratings: Record<SymptomKey, number>;
        phase: PhaseKey;
        notes: string;
      };

      if (parsed?.dateKey === todayDateKey) {
        setRatings(parsed.ratings ?? DEFAULT_RATINGS);
        setPhase(parsed.phase ?? "na");
        setNotes(parsed.notes ?? "");
      }
    } catch {
      // ignore
    }
  }, [todayDateKey]);

  // Auto-persist today's inputs as a draft on every change
  useEffect(() => {
    const draft = { dateKey: todayDateKey, ratings, phase, notes };
    try {
      localStorage.setItem(TODAY_DRAFT_KEY, JSON.stringify(draft));
    } catch {
      // ignore
    }
  }, [todayDateKey, ratings, phase, notes]);

  // When logs change (save/update), default back to showing latest 3
  useEffect(() => {
    setVisibleCount(3);
  }, [logs.length]);

  function setRating(key: SymptomKey, value: number) {
    setRatings((prev) => ({ ...prev, [key]: value }));
    setSaved(false);
    setActiveLogId(null);
  }

  function loadLog(log: DailyLog) {
    setRatings(log.ratings);
    setPhase(log.phase);
    setNotes(log.notes);
    setActiveLogId(log.id);
    setSaved(true);
  }

  function toggleExpanded(id: string) {
    setExpandedIds((prev) => ({ ...prev, [id]: !prev[id] }));
  }

  function onSave() {
    const nowIso = new Date().toISOString();
    const dateKey = todayDateKey;

    setLogs((prev) => {
      const existingIndex = prev.findIndex((l) => l.dateKey === dateKey);

      let next: DailyLog[];
      let updatedId: string;

      if (existingIndex >= 0) {
        const existing = prev[existingIndex];
        updatedId = existing.id;

        const updated: DailyLog = {
          ...existing,
          savedAt: nowIso,
          phase,
          notes,
          ratings,
        };

        next = [updated, ...prev.filter((l) => l.id !== existing.id)].slice(0, 50);
      } else {
        const newLog: DailyLog = {
          id: makeId(),
          dateKey,
          savedAt: nowIso,
          phase,
          notes,
          ratings,
        };
        updatedId = newLog.id;
        next = [newLog, ...prev].slice(0, 50);
      }

      setSaved(true);
      setActiveLogId(updatedId);

      // keep Previous Logs collapsed after save
      setLogsOpen(false);

      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch {
        // ignore
      }

      return next;
    });
  }

  return (
    <div className="space-y-5">
      <header className="space-y-1">
        <p className="text-sm text-neutral-body">{todayLabel}</p>
        <h1 className="text-2xl font-semibold tracking-tight text-ink">
          Hi {userName} — quick check-in.
        </h1>
      </header>

      {/* PREVIOUS LOGS */}
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
                          onClick={() => loadLog(log)}
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

      {/* SYMPTOMS */}
      <section className="space-y-3" aria-label="Symptom grid">
        <Card>
          <CardHeader className="flex items-end justify-between gap-3">
            <CardTitle>Symptoms</CardTitle>
            <p className="text-xs text-neutral-body">Rate 0–5 stars</p>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-3">
              {symptomCards.map((card) => {
                const value = ratings[card.key];
                const isActive = value > 0;

                return (
                  <div
                    key={card.key}
                    className={
                      "w-full rounded-2xl border p-4 text-left shadow-sm transition focus-within:ring-2 focus-within:ring-primary/60" +
                      (isActive
                        ? " border-primary bg-secondary"
                        : " border-black/10 bg-white hover:bg-secondary")
                    }
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold text-ink">{card.title}</p>
                        <p className="mt-1 text-sm leading-6 text-neutral-body">{card.helper}</p>
                      </div>

                      <span
                        className={
                          "shrink-0 rounded-full px-3 py-1 text-xs font-semibold" +
                          (isActive ? " bg-primary text-white" : " bg-secondary text-ink")
                        }
                      >
                        {value}/5
                      </span>
                    </div>

                    <div className="mt-3 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-1">
                        {Array.from({ length: 5 }).map((_, i) => {
                          const starValue = i + 1;
                          const filled = starValue <= value;

                          return (
                            <button
                              key={starValue}
                              type="button"
                              onClick={() => setRating(card.key, value === starValue ? 0 : starValue)}
                              aria-label={`${card.title}: set ${starValue} star`}
                              className="rounded-md p-1 transition focus:outline-none focus:ring-2 focus:ring-primary/60"
                            >
                              <Star
                                className={
                                  "h-5 w-5 transition" +
                                  (filled ? " fill-primary text-primary" : " text-black/20")
                                }
                              />
                            </button>
                          );
                        })}
                      </div>

                      <button
                        type="button"
                        onClick={() => setRating(card.key, 0)}
                        className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-ink shadow-sm transition hover:bg-secondary focus:outline-none focus:ring-2 focus:ring-primary/60"
                      >
                        Clear
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </section>

      {/* HORMONAL OVERLAY */}
      <section className="space-y-3" aria-label="Hormonal overlay">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Hormonal overlay</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2 overflow-x-auto pb-1">
              {phases.map((p) => {
                const active = phase === p.key;
                return (
                  <button
                    key={p.key}
                    type="button"
                    onClick={() => {
                      setPhase(p.key);
                      setSaved(false);
                      setActiveLogId(null);
                    }}
                    className={
                      "whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium shadow-sm transition focus:outline-none focus:ring-2 focus:ring-primary/60" +
                      (active ? " bg-primary text-white" : " bg-white text-ink hover:bg-secondary")
                    }
                    aria-pressed={active}
                  >
                    {p.label}
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </section>

      {/* NOTES */}
      <section className="space-y-2" aria-label="Notes">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Notes</CardTitle>
          </CardHeader>
          <CardContent>
            <textarea
              value={notes}
              onChange={(e) => {
                setNotes(e.target.value);
                setSaved(false);
                setActiveLogId(null);
              }}
              rows={4}
              placeholder="Anything you want future-you (or your clinician) to notice?"
              className="w-full resize-none rounded-2xl border border-black/10 bg-white p-4 text-sm leading-6 text-ink shadow-sm outline-none transition placeholder:text-neutral-body focus:ring-2 focus:ring-primary/60"
            />
          </CardContent>
        </Card>
      </section>

      {/* SAVE */}
      <Card>
        <CardContent className="space-y-2 pt-4">
          <button
            type="button"
            onClick={onSave}
            className="w-full rounded-2xl bg-primary px-5 py-4 text-base font-semibold text-white shadow-sm transition hover:brightness-95 focus:outline-none focus:ring-2 focus:ring-primary/60"
          >
            Save Log
          </button>

          {saved ? (
            <p className="text-center text-xs font-medium text-accent">
              Saved{activeLogId ? " to Previous Logs." : "."} You can adjust anytime.
            </p>
          ) : (
            <p className="text-center text-xs text-neutral-body">Your log stays local for now.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function ResearcherDashboard({ user }: { user: User | null }) {
  return (
    <div className="space-y-6">
       <header className="space-y-1">
        <p className="text-sm text-neutral-body">Researcher Dashboard</p>
        <h1 className="text-2xl font-semibold tracking-tight text-ink">
          Welcome back, {user?.displayName || "Researcher"}.
        </h1>
      </header>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Participants</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">12</p>
            <p className="text-xs text-neutral-body">Active in study</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>New Logs</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">48</p>
            <p className="text-xs text-neutral-body">In the last 24h</p>
          </CardContent>
        </Card>
      </div>

       <Card>
        <CardHeader>
          <CardTitle>Data Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-neutral-body">
            Data visualization and export controls will appear here.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

export default function DashboardPage() {
  const { user, role, loading } = useAuth();

  if (loading) {
    return <div className="p-8 text-center text-neutral-body">Loading...</div>;
  }

  // If role is researcher, show researcher view.
  // Otherwise default to participant view (handle 'participant' or null).
  if (role === "researcher") {
    return <ResearcherDashboard user={user} />;
  }

  return <ParticipantDashboard user={user} />;
}
