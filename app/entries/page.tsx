"use client";

import { useMemo } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type Entry = {
  id: string;
  title: string;
};

export default function EntriesPage() {

  const entries: Entry[] = useMemo(
    () => [
      {
        id: "1",
        title: "title",
      },
    ],
    []
  );

  return (
    <div className="space-y-5">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight text-ink">
          Your Entries
        </h1>
        <p className="text-sm text-neutral-body">
          Find your entries here
        </p>
      </header>

      <section className="space-y-3" aria-label="Community stories">
          {entries.map((entry) => (
            <Card key={entry.id}>
              <CardContent className="pt-4">
                <p className="text-sm leading-6 text-ink">{`Entry ${entry.id}: ${entry.title}`}</p>
              </CardContent>
            </Card>
          ))}
        </section>
    </div>
  );
}
