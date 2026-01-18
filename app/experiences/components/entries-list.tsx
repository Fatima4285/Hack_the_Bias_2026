"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { format } from "date-fns";
import { auth, db } from "@/lib/firebase/client";
import { collection, query, where, getDocs, Timestamp } from "firebase/firestore";

type Entry = {
  id: string;
  title: string;
  about: string;
  age: string;
  symptoms: string[];
  emotionRegulation: string;
  misunderstood: string;
  notes: string;
  createdAt: Date;
};

export function EntriesList() {
  const [entries, setEntries] = useState<Entry[]>([]);
  const currentUser = auth.currentUser;

  useEffect(() => {
    if (!currentUser) return;

    async function fetchEntries() {
      try {
        const q = query(
          collection(db, "experiences"),
          where("userId", "==", currentUser!.uid)
        );
        const snapshot = await getDocs(q);

        const userEntries: Entry[] = snapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            title: data.title,
            about: data.about,
            age: data.age,
            symptoms: data.symptoms || [],
            emotionRegulation: data.emotionRegulation,
            misunderstood: data.misunderstood,
            notes: data.notes,
            createdAt: data.createdAt
              ? (data.createdAt as Timestamp).toDate()
              : new Date(),
          };
        });

        setEntries(userEntries);
      } catch (error) {
        console.error("Error fetching entries:", error);
      }
    }

    fetchEntries();
  }, [currentUser]);

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
        <Card
          key={entry.id}
          className="hover:bg-secondary/20 transition-colors cursor-pointer"
        >
          <CardContent className="pt-4">
            <div className="flex justify-between items-start">
              <div>
                <p className="font-semibold text-ink">{entry.title}</p>
                <p className="text-xs text-neutral-body mt-1">
                  {format(entry.createdAt, "MMM d, yyyy")}
                </p>
              </div>
            </div>
            <p className="text-sm leading-6 text-neutral-body mt-2 line-clamp-2">
              {entry.notes}
            </p>
          </CardContent>
        </Card>
      ))}
    </section>
  );
}
