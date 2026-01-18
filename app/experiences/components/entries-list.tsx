"use client";

import { useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { format } from "date-fns";

type Entry = {
  id: string;
  title: string;
  date: Date;
  summary: string;
};

export function EntriesList() {
  // TODO: Fetch from Firebase
  const entries: Entry[] = useMemo(
    () => [
      {
        id: "1",
        title: "Initial Diagnosis Journey",
        date: new Date(2025, 10, 15),
        summary: "Reflecting on the long wait times and dismissal by GP.",
      },
      {
        id: "2",
        title: "Sensory Overload at Work",
        date: new Date(2025, 11, 2),
        summary: "Open plan offices are a nightmare for focus.",
      },
    ],
    []
  );

  if (entries.length === 0) {
    return (
      <div className="text-center py-10">
        <p className="text-neutral-body text-sm">No entries yet. Start by adding one!</p>
      </div>
    );
  }

  return (
    <section className="space-y-3" aria-label="Your entries">
      {entries.map((entry) => (
        <Card key={entry.id} className="hover:bg-secondary/20 transition-colors cursor-pointer">
          <CardContent className="pt-4">
            <div className="flex justify-between items-start">
              <div>
                <p className="font-semibold text-ink">{entry.title}</p>
                <p className="text-xs text-neutral-body mt-1">
                  {format(entry.date, "MMM d, yyyy")}
                </p>
              </div>
            </div>
            <p className="text-sm leading-6 text-neutral-body mt-2 line-clamp-2">
              {entry.summary}
            </p>
          </CardContent>
        </Card>
      ))}
    </section>
  );
}
