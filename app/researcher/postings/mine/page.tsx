"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type StudyType = "survey" | "interview" | "diary" | "focus-group" | "mixed" | "other";
type ParticipationMode = "remote" | "in-person" | "hybrid";

type Posting = {
  id: string;
  createdAt: string;
  updatedAt: string;

  status: "draft" | "published";

  title: string;
  institution: string;

  studyType: StudyType;
  participationMode: ParticipationMode;
  location?: string;

  description: string;
  lookingFor?: string;
  incentives?: string;

  anonymousAllowed: boolean;
  requiresConsent: boolean;

  tags: string[]; // stored as array here
};

const STORAGE_KEY = "neurolens.research.postings.v1";

function safeParsePostings(raw: string | null): Posting[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    // light validation
    return parsed.filter((p) => p && typeof p.id === "string" && typeof p.title === "string");
  } catch {
    return [];
  }
}

function savePostings(postings: Posting[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(postings));
  } catch {
    // ignore
  }
}

function formatDate(iso: string) {
  try {
    return new Date(iso).toLocaleDateString(undefined, { month: "short", day: "numeric" });
  } catch {
    return "—";
  }
}

function StatusPill({ status }: { status: Posting["status"] }) {
  const active = status === "published";
  return (
    <span
      className={
        "inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold" +
        (active ? " bg-primary text-white" : " bg-secondary text-ink")
      }
    >
      {active ? "Published" : "Draft"}
    </span>
  );
}

export default function ResearcherPostingsPage() {
  const router = useRouter();
  const [postings, setPostings] = useState<Posting[]>([]);
  const [query, setQuery] = useState("");

  useEffect(() => {
    const loaded = safeParsePostings(localStorage.getItem(STORAGE_KEY));
    setPostings(loaded);
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return postings;
    return postings.filter((p) => {
      return (
        p.title.toLowerCase().includes(q) ||
        p.institution.toLowerCase().includes(q) ||
        p.tags.join(",").toLowerCase().includes(q)
      );
    });
  }, [postings, query]);

  function removePosting(id: string) {
    const next = postings.filter((p) => p.id !== id);
    setPostings(next);
    savePostings(next);
  }

  function duplicatePosting(id: string) {
    const original = postings.find((p) => p.id === id);
    if (!original) return;

    const now = new Date().toISOString();
    const copy: Posting = {
      ...original,
      id: crypto.randomUUID(),
      status: "draft",
      title: original.title + " (copy)",
      createdAt: now,
      updatedAt: now,
    };

    const next = [copy, ...postings];
    setPostings(next);
    savePostings(next);
  }

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <p className="text-sm text-neutral-body">Research</p>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div className="space-y-1">
            <h1 className="text-2xl font-semibold tracking-tight text-ink">Your postings</h1>
            <p className="text-sm text-neutral-body">
              Local demo data for now. Later this will load from the database.
            </p>
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => router.push("/researcher/postings/new")}
              className="rounded-2xl bg-primary px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:brightness-95 focus:outline-none focus:ring-2 focus:ring-primary/60"
            >
              Add a posting
            </button>
            <Link
              href="/researcher"
              className="rounded-2xl bg-secondary px-4 py-2 text-sm font-semibold text-ink shadow-sm transition hover:brightness-95 focus:outline-none focus:ring-2 focus:ring-primary/60"
            >
              Back
            </Link>
          </div>
        </div>
      </header>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Search</CardTitle>
        </CardHeader>
        <CardContent>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by title, institution, or tags…"
            className="w-full rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm text-ink shadow-sm outline-none transition placeholder:text-neutral-body focus:ring-2 focus:ring-primary/60"
          />
        </CardContent>
      </Card>

      {filtered.length === 0 ? (
        <Card>
          <CardContent className="space-y-3 pt-6">
            <p className="text-sm text-neutral-body">
              No postings yet. Create one to see it appear here.
            </p>

          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filtered.map((p) => (
            <Card key={p.id} className="overflow-hidden">
              <CardHeader className="space-y-2">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0">
                    <p className="truncate text-lg font-semibold text-ink">{p.title}</p>
                    <p className="text-sm text-neutral-body">
                      {p.institution} • {p.studyType} • {p.participationMode}
                      {p.participationMode !== "remote" && p.location ? ` • ${p.location}` : ""}
                    </p>
                    <p className="mt-1 text-xs text-neutral-body">
                      Updated {formatDate(p.updatedAt)}
                    </p>
                  </div>
                  <StatusPill status={p.status} />
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                <p className="text-sm leading-6 text-neutral-body">
                  {p.description.length > 220 ? p.description.slice(0, 220) + "…" : p.description}
                </p>

                {p.tags.length ? (
                  <div className="flex flex-wrap gap-2">
                    {p.tags.slice(0, 8).map((t) => (
                      <span
                        key={t}
                        className="rounded-full bg-secondary px-3 py-1 text-xs font-semibold text-ink"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                ) : null}

                <div className="flex flex-col gap-3 sm:flex-row">
                  <button
                    type="button"
                    onClick={() => duplicatePosting(p.id)}
                    className="w-full rounded-2xl bg-white px-4 py-3 text-sm font-semibold text-ink shadow-sm transition hover:bg-secondary focus:outline-none focus:ring-2 focus:ring-primary/60"
                  >
                    Duplicate
                  </button>
                  <button
                    type="button"
                    onClick={() => removePosting(p.id)}
                    className="w-full rounded-2xl bg-secondary px-4 py-3 text-sm font-semibold text-ink shadow-sm transition hover:brightness-95 focus:outline-none focus:ring-2 focus:ring-primary/60"
                  >
                    Delete (local)
                  </button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
