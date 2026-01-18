import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Star } from "lucide-react";
import { 
  type SymptomKey, 
  type PhaseKey, 
  phases, 
  symptomCards 
} from "./shared";

interface DailyLogFormProps {
  ratings: Record<SymptomKey, number>;
  phase: PhaseKey;
  notes: string;
  saved: boolean;
  activeLogId: string | null;
  onRatingChange: (key: SymptomKey, value: number) => void;
  onPhaseChange: (key: PhaseKey) => void;
  onNotesChange: (val: string) => void;
  onSave: () => void;
  onClearRating: (key: SymptomKey) => void;
}

export function DailyLogForm({
  ratings,
  phase,
  notes,
  saved,
  activeLogId,
  onRatingChange,
  onPhaseChange,
  onNotesChange,
  onSave,
  onClearRating,
}: DailyLogFormProps) {
  return (
    <>
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
                              onClick={() => onRatingChange(card.key, value === starValue ? 0 : starValue)}
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
                        onClick={() => onClearRating(card.key)}
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
                    onClick={() => onPhaseChange(p.key)}
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
              onChange={(e) => onNotesChange(e.target.value)}
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
    </>
  );
}
