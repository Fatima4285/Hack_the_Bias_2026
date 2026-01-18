"use client";

import { useState } from "react";
import { Plus, List } from "lucide-react";
import { EntriesList } from "./components/entries-list";
import { ExperienceForm } from "./components/experience-form";

type View = "list" | "new";

export default function EntriesPage() {
  const [view, setView] = useState<View>("list");

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight text-ink">
            {view === "list" ? "Your Experiences" : "New Entry"}
          </h1>
          <p className="text-sm text-neutral-body">
            {view === "list"
              ? "Track your experiences over time."
              : "Share your experience anonymously."}
          </p>
        </div>

        {view === "list" ? (
          <button
            onClick={() => setView("new")}
            className="inline-flex items-center gap-2 rounded-2xl bg-primary px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:brightness-95 focus:outline-none focus:ring-2 focus:ring-primary/60"
          >
            <Plus className="h-4 w-4" />
            New Entry
          </button>
        ) : (
          <button
            onClick={() => setView("list")}
            className="inline-flex items-center gap-2 rounded-2xl bg-secondary px-4 py-2 text-sm font-semibold text-ink shadow-sm transition hover:bg-secondary/70 focus:outline-none focus:ring-2 focus:ring-primary/60"
          >
            <List className="h-4 w-4" />
            View Entries
          </button>
        )}
      </header>

      {view === "list" ? (
        <EntriesList />
      ) : (
        <ExperienceForm onSuccess={() => setView("list")} />
      )}
    </div>
  );
}
