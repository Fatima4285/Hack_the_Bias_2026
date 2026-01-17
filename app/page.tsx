"use client";

import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type SymptomKey =
  | "executive-dysfunction"
  | "sensory-overload"
  | "high-masking"
  | "social-burnout"
  | "hyperfocus";

type PhaseKey =
  | "menstrual"
  | "follicular"
  | "ovulatory"
  | "luteal"
  | "na";

const phases: { key: PhaseKey; label: string }[] = [
  { key: "menstrual", label: "Menstrual" },
  { key: "follicular", label: "Follicular" },
  { key: "ovulatory", label: "Ovulatory" },
  { key: "luteal", label: "Luteal" },
  { key: "na", label: "N/A" },
];

export default function DailyTrackerPage() {
  const userName = "Maya";
  const todayLabel = useMemo(() => {
    return new Date().toLocaleDateString(undefined, {
      weekday: "long",
      month: "short",
      day: "numeric",
    });
  }, []);

  const [selectedSymptoms, setSelectedSymptoms] = useState<
    Record<SymptomKey, boolean>
  >({
    "executive-dysfunction": false,
    "sensory-overload": false,
    "high-masking": false,
    "social-burnout": false,
    hyperfocus: false,
  });

  const [phase, setPhase] = useState<PhaseKey>("na");
  const [notes, setNotes] = useState("");
  const [saved, setSaved] = useState(false);

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

  function toggleSymptom(key: SymptomKey) {
    setSelectedSymptoms((prev) => ({ ...prev, [key]: !prev[key] }));
    setSaved(false);
  }

  function onSave() {
    setSaved(true);
    try {
      localStorage.setItem(
        "neurolens.dailyLog",
        JSON.stringify({
          savedAt: new Date().toISOString(),
          phase,
          notes,
          symptoms: selectedSymptoms,
        })
      );
    } catch {
      // ignore
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

      <section className="space-y-3" aria-label="Symptom grid">
        <Card>
          <CardHeader className="flex items-end justify-between gap-3">
            <CardTitle>Symptoms</CardTitle>
            <p className="text-xs text-neutral-body">Tap to toggle</p>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-3">
              {symptomCards.map((card) => {
                const active = selectedSymptoms[card.key];
                return (
                  <button
                    key={card.key}
                    type="button"
                    aria-pressed={active}
                    onClick={() => toggleSymptom(card.key)}
                    className={
                      "w-full rounded-2xl border p-4 text-left shadow-sm transition focus:outline-none focus:ring-2 focus:ring-primary/60" +
                      (active
                        ? " border-primary bg-secondary"
                        : " border-black/10 bg-white hover:bg-secondary")
                    }
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold text-ink">
                          {card.title}
                        </p>
                        <p className="mt-1 text-sm leading-6 text-neutral-body">
                          {card.helper}
                        </p>
                      </div>
                      <span
                        className={
                          "shrink-0 rounded-full px-3 py-1 text-xs font-semibold" +
                          (active
                            ? " bg-primary text-white"
                            : " bg-secondary text-ink")
                        }
                      >
                        {active ? "On" : "Off"}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </section>

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
                    }}
                    className={
                      "whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium shadow-sm transition focus:outline-none focus:ring-2 focus:ring-primary/60" +
                      (active
                        ? " bg-primary text-white"
                        : " bg-white text-ink hover:bg-secondary")
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
              }}
              rows={4}
              placeholder="Anything you want future-you (or your clinician) to notice?"
              className="w-full resize-none rounded-2xl border border-black/10 bg-white p-4 text-sm leading-6 text-ink shadow-sm outline-none transition placeholder:text-neutral-body focus:ring-2 focus:ring-primary/60"
            />
          </CardContent>
        </Card>
      </section>

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
              Saved. You can adjust anytime.
            </p>
          ) : (
            <p className="text-center text-xs text-neutral-body">
              Your log stays local for now.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
