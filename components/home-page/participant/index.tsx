import { useEffect, useMemo, useState } from "react";
import { type User } from "firebase/auth";
import {
  collection,
  query,
  where,
  orderBy,
  getDocs,
  doc,
  setDoc,
} from "firebase/firestore";
import { db } from "@/lib/firebase/client";
import { 
  type DailyLog, 
  type PhaseKey, 
  type SymptomKey, 
  DEFAULT_RATINGS 
} from "./shared";
import { DailyLogForm } from "./daily-log-form";
import { PreviousLogs } from "./previous-logs";
import { Calendar, PenLine } from "lucide-react"; 

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
  
  // NEW: View state
  const [view, setView] = useState<"new" | "history">("new");

  // Load logs from Firestore + today's draft from localStorage
  useEffect(() => {
    if (!user) return;

    let mounted = true;

    async function fetchData() {
      // 1. Fetch logs from Firestore
      try {
        const q = query(
          collection(db, "journals"),
          where("userId", "==", user!.uid),
          orderBy("savedAt", "desc")
        );
        
        const snapshot = await getDocs(q);
        const fetchedLogs = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as DailyLog[];

        if (mounted) {
          setLogs(fetchedLogs);
        }
      } catch (err) {
        console.error("Failed to load journals:", err);
      }

      // 2. Load today's draft (client-side only behavior)
      try {
        const rawDraft = localStorage.getItem(TODAY_DRAFT_KEY);
        if (rawDraft) {
          const parsed = JSON.parse(rawDraft) as {
            dateKey: string;
            ratings: Record<SymptomKey, number>;
            phase: PhaseKey;
            notes: string;
          };

          if (mounted && parsed?.dateKey === todayDateKey) {
            setRatings(parsed.ratings ?? DEFAULT_RATINGS);
            setPhase(parsed.phase ?? "na");
            setNotes(parsed.notes ?? "");
          }
        }
      } catch {
        // ignore
      }
    }

    fetchData();

    return () => {
      mounted = false;
    };
  }, [user, todayDateKey]);

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
    setView("new"); // Switch to editor view when loading a log
  }

  // Allow clearing function to start fresh
  function startNewLog() {
    setRatings(DEFAULT_RATINGS);
    setPhase("na");
    setNotes("");
    setActiveLogId(null);
    setSaved(false);
    setView("new");
  }

  async function onSave() {
    if (!user) return;
    const nowIso = new Date().toISOString();
    const dateKey = todayDateKey;

    // Check if we already have a log for THIS date in our loaded logs
    const existingIndex = logs.findIndex((l) => l.dateKey === dateKey);

    let updatedId: string;
    if (existingIndex >= 0) {
      updatedId = logs[existingIndex].id;
    } else {
      updatedId = makeId();
    }

    const newLogEntry: DailyLog = {
      id: updatedId,
      dateKey,
      savedAt: nowIso,
      phase,
      notes,
      ratings,
    };

    // Optimistically update local state
    setLogs((prev) => {
      let next: DailyLog[];
      if (existingIndex >= 0) {
        // Replace existing
        next = [...prev];
        next[existingIndex] = newLogEntry;
      } else {
        // Add new at top
        next = [newLogEntry, ...prev];
      }
      return next;
    });

    setSaved(true);
    setActiveLogId(updatedId);

    // Save to Firestore
    try {
      await setDoc(doc(db, "journals", updatedId), {
        ...newLogEntry,
        userId: user.uid,
      });
    } catch (err) {
      console.error("Failed to save log to Firestore:", err);
      setSaved(false);
    }
  }

  return (
    <div className="space-y-5">
      <header className="space-y-1">
        <p className="text-sm text-neutral-body">{todayLabel}</p>
        <h1 className="text-2xl font-semibold tracking-tight text-ink">
          Hi {userName} — quick check-in.
        </h1>
      </header>

      {/* Tabs / Navigation */}
      <div className="flex items-center gap-2 rounded-xl bg-white p-1 border border-black/5 w-fit">
        <button
           onClick={() => setView("new")}
          className={
            "flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition " +
            (view === "new"
              ? "bg-primary text-white shadow-sm"
              : "text-neutral-body hover:bg-secondary hover:text-ink")
          }
        >
          <PenLine className="h-4 w-4" />
          Check-in
        </button>
        <button
          onClick={() => setView("history")}
          className={
            "flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition " +
            (view === "history"
              ? "bg-primary text-white shadow-sm"
              : "text-neutral-body hover:bg-secondary hover:text-ink")
          }
        >
          <Calendar className="h-4 w-4" />
          History
        </button>
      </div>

      <div>
        {view === "new" ? (
           <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
             {activeLogId && (
                <div className="mb-4 flex items-center justify-between rounded-xl bg-secondary px-4 py-3 text-sm text-ink">
                    <span>Editing entry from existing log.</span>
                    <button onClick={startNewLog} className="font-semibold hover:underline">Start New</button>
                </div>
             )}
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
        ) : (
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
            <PreviousLogs 
                logs={logs} 
                activeLogId={activeLogId} 
                onLoadLog={loadLog} 
            />
          </div>
        )}
      </div>
    </div>
  );
}
