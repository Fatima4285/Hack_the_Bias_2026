export type SymptomKey =
  | "executive-dysfunction"
  | "sensory-overload"
  | "high-masking"
  | "social-burnout"
  | "hyperfocus";

export type PhaseKey = "menstrual" | "follicular" | "ovulatory" | "luteal" | "na";

export const phases: { key: PhaseKey; label: string }[] = [
  { key: "menstrual", label: "Menstrual" },
  { key: "follicular", label: "Follicular" },
  { key: "ovulatory", label: "Ovulatory" },
  { key: "luteal", label: "Luteal" },
  { key: "na", label: "N/A" },
];

export type DailyLog = {
  id: string;
  dateKey: string; // one log per local date
  savedAt: string;
  phase: PhaseKey;
  notes: string;
  ratings: Record<SymptomKey, number>;
};

export const symptomCards = [
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
];

export const DEFAULT_RATINGS: Record<SymptomKey, number> = {
  "executive-dysfunction": 0,
  "sensory-overload": 0,
  "high-masking": 0,
  "social-burnout": 0,
  hyperfocus: 0,
};

export function formatLogDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}
