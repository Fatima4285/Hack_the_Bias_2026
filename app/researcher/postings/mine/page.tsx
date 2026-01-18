"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// Firebase imports
import { 
  collection, 
  query, 
  where, 
  orderBy, 
  onSnapshot, 
  deleteDoc, 
  doc, 
  addDoc,
  serverTimestamp
} from "firebase/firestore";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { db } from "@/lib/firebase/client";

type StudyType = "survey" | "interview" | "diary" | "focus-group" | "mixed" | "other";
type ParticipationMode = "remote" | "in-person" | "hybrid";

type Posting = {
  id: string;
  createdAt: string; // we'll convert Timestamp to string for display
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

  tags: string[]; 
  userId: string;
};

// Helper to format timestamps from Firestore or "now" strings
function formatDate(isoOrTimestamp: any) {
  if (!isoOrTimestamp) return "—";
  
  // If it's a Firestore Timestamp (has toDate method)
  if (typeof isoOrTimestamp.toDate === "function") {
    return isoOrTimestamp.toDate().toLocaleDateString(undefined, { month: "short", day: "numeric" });
  }

  // If already string/date
  try {
    return new Date(isoOrTimestamp).toLocaleDateString(undefined, { month: "short", day: "numeric" });
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
  const [filteredPostings, setFilteredPostings] = useState<Posting[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // 1. Listen for Auth State
  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      if (!user) {
        setLoading(false);
        setPostings([]);
      }
    });
    return () => unsubscribe();
  }, []);

  // 2. Fetch Postings when User is present
  useEffect(() => {
    if (!currentUser) return;

    // Listen to "postings" collection where userId == currentUser.uid
    const q = query(
      collection(db, "postings"),
      where("userId", "==", currentUser.uid),
      orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          // Normalize dates for local use if needed, but keeping raw is fine for `formatDate` helper
        } as Posting;
      });
      setPostings(docs);
      setLoading(false);
    }, (error) => {
        console.error("Error fetching postings:", error);
        setLoading(false);
    });

    return () => unsubscribe();
  }, [currentUser]);

  // 3. Filter Logic
  useEffect(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) {
      setFilteredPostings(postings);
      return;
    }
    const filtered = postings.filter((p) => {
      return (
        p.title?.toLowerCase().includes(q) ||
        p.institution?.toLowerCase().includes(q) ||
        p.tags?.join(",").toLowerCase().includes(q)
      );
    });
    setFilteredPostings(filtered);
  }, [postings, searchQuery]);


  async function removePosting(id: string) {
    if (!confirm("Are you sure you want to delete this posting?")) return;
    try {
      await deleteDoc(doc(db, "postings", id));
    } catch (err) {
      console.error("Failed to delete posting:", err);
      alert("Could not delete posting.");
    }
  }

  async function duplicatePosting(id: string) {
    const original = postings.find((p) => p.id === id);
    if (!original || !currentUser) return;

    try {
        // Strip ID and create new
        const { id: _, createdAt, updatedAt, ...rest } = original;
        
        await addDoc(collection(db, "postings"), {
            ...rest,
            title: original.title + " (copy)",
            status: "draft",
            userId: currentUser.uid,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
        });
    } catch(err) {
        console.error("Failed to duplicate:", err);
        alert("Could not duplicate posting.");
    }
  }

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <p className="text-sm text-neutral-body">Research</p>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div className="space-y-1">
            <h1 className="text-2xl font-semibold tracking-tight text-ink">Your postings</h1>
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => router.push("/researcher/postings/new")}
              onClick={() => router.push("/researcher/postings/new")}
              className="rounded-2xl bg-primary px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:brightness-95 focus:outline-none focus:ring-2 focus:ring-primary/60"
            >
              Add a posting
            </button>
          </div>
        </div>
      </header>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Search</CardTitle>
        </CardHeader>
        <CardContent>
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by title, institution, or tags…"
            className="w-full rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm text-ink shadow-sm outline-none transition placeholder:text-neutral-body focus:ring-2 focus:ring-primary/60"
          />
        </CardContent>
      </Card>

      {loading ? (
        <div className="py-8 text-center text-neutral-body">Loading your postings...</div>
      ) : filteredPostings.length === 0 ? (
        <Card>
          <CardContent className="space-y-3 pt-6 text-center">
            <p className="text-sm text-neutral-body">
              {searchQuery ? "No matches found." : "No postings yet. Create one to get started."}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredPostings.map((p) => (
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
                      Created {formatDate(p.createdAt)}
                    </p>
                  </div>
                  <StatusPill status={p.status} />
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                <p className="text-sm leading-6 text-neutral-body">
                  {p.description.length > 220 ? p.description.slice(0, 220) + "…" : p.description}
                </p>

                {p.tags && p.tags.length > 0 && (
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
                )}

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
                    className="w-full rounded-2xl bg-secondary px-4 py-3 text-sm font-semibold text-ink shadow-sm transition hover:brightness-95 focus:outline-none focus:ring-2 focus:ring-primary/60 text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    Delete
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
