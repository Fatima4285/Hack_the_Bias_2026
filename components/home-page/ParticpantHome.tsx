import { useEffect, useMemo, useState } from "react";
import { type User } from "firebase/auth";
import { 
  type DailyLog, 
  type PhaseKey, 
  type SymptomKey, 
  DEFAULT_RATINGS 
} from "./participant/shared";
import { DailyLogForm } from "./participant/daily-log-form";
import { PreviousLogs } from "./participant/previous-logs";

const STORAGE_KEY = "neurolens.dailyLogs";
const TODAY_DRAFT_KEY = "neurolens.todayDraft";

function makeId() {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
}

function getLocalDateKey(d = new Date()) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export default function ParticipantDashboard({ user }: { user: User | null }) {
  const userName = user?.displayName ?? "Maya";
  const todayDateKey = useMemo(() => getLocalDateKey(new Date()), []);

  const todayLabel = useMemo(() => {
    return new Date().toLocaleDateString(undefined, {
      weekday: "long",
      month: "short",
      day: "numeric",
    });
  }, []);

  const [ratings, setRatings] = useState<Record<SymptomKey, number>>(DEFAULT_RATINGS);
  const [phase, setPhase] = useState<PhaseKey>("na");
  const [notes, setNotes] = useState("");
  const [saved, setSaved] = useState(false);

  const [logs, setLogs] = useState<DailyLog[]>([]);
  const [activeLogId, setActiveLogId] = useState<string | null>(null);

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

  function handleSetRating(key: SymptomKey, value: number) {
    setRatings((prev) => ({ ...prev, [key]: value }));
    setSaved(false);
    setActiveLogId(null);
  }

  function handleSetPhase(key: PhaseKey) {
      setPhase(key);
      setSaved(false);
      setActiveLogId(null);
  }

  function handleSetNotes(val: string) {
      setNotes(val);
      setSaved(false);
      setActiveLogId(null);
  }

  function handleClearRating(key: SymptomKey) {
      setRatings((prev) => ({ ...prev, [key]: 0 }));
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

      <PreviousLogs 
        logs={logs} 
        activeLogId={activeLogId} 
        onLoadLog={loadLog} 
      />

      <DailyLogForm
        ratings={ratings}
        phase={phase}
        notes={notes}
        saved={saved}
        activeLogId={activeLogId}
        onRatingChange={handleSetRating}
        onPhaseChange={handleSetPhase}
        onNotesChange={handleSetNotes}
        onSave={onSave}
        onClearRating={handleClearRating}
      />
    </div>
  );
}
