"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase/client"; // make sure your Firebase client is set up
import { getAuth } from "firebase/auth";

type StudyType = "survey" | "interview" | "diary" | "focus-group" | "mixed" | "other";
type ParticipationMode = "remote" | "in-person" | "hybrid";

export type PostingDraft = {
  title: string;
  institution: string;
  studyType: StudyType;
  participationMode: ParticipationMode;
  location: string;
  description: string;
  lookingFor: string;
  incentives: string;
  anonymousAllowed: boolean;
  requiresConsent: boolean;
  tags: string; // comma-separated for now; later store as string[]
};

const studyTypes: { key: StudyType; label: string }[] = [
  { key: "survey", label: "Survey" },
  { key: "interview", label: "Interview" },
  { key: "diary", label: "Diary / journaling" },
  { key: "focus-group", label: "Focus group" },
  { key: "mixed", label: "Mixed methods" },
  { key: "other", label: "Other" },
];

const modes: { key: ParticipationMode; label: string }[] = [
  { key: "remote", label: "Remote" },
  { key: "in-person", label: "In-person" },
  { key: "hybrid", label: "Hybrid" },
];

function ToggleRow({
  label,
  helper,
  value,
  onToggle,
}: {
  label: string;
  helper: string;
  value: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      aria-pressed={value}
      onClick={onToggle}
      className={
        "flex w-full items-start justify-between gap-4 rounded-2xl border px-4 py-3 text-left shadow-sm transition focus:outline-none focus:ring-2 focus:ring-primary/60" +
        (value
          ? " border-primary bg-secondary"
          : " border-black/10 bg-white hover:bg-secondary")
      }
    >
      <div className="min-w-0">
        <p className="text-sm font-semibold text-ink">{label}</p>
        <p className="mt-1 text-sm leading-6 text-neutral-body">{helper}</p>
      </div>
      <span
        className={
          "shrink-0 rounded-full px-3 py-1 text-xs font-semibold" +
          (value ? " bg-primary text-white" : " bg-secondary text-ink")
        }
      >
        {value ? "On" : "Off"}
      </span>
    </button>
  );
}

export default function AddPostingPage() {
  const router = useRouter();

  const [draft, setDraft] = useState<PostingDraft>({
    title: "",
    institution: "",
    studyType: "survey",
    participationMode: "remote",
    location: "",
    description: "",
    lookingFor: "",
    incentives: "",
    anonymousAllowed: true,
    requiresConsent: true,
    tags: "",
  });

  const [status, setStatus] = useState<"idle" | "published">("idle");

  const canPublish = useMemo(() => {
    return draft.title.trim() && draft.institution.trim() && draft.description.trim();
  }, [draft]);

  function update<K extends keyof PostingDraft>(key: K, value: PostingDraft[K]) {
    setDraft((prev) => ({ ...prev, [key]: value }));
    setStatus("idle");
  }

 async function publishToFirebase() {
  if (!canPublish) return;

  const auth = getAuth();
  const currentUser = auth.currentUser;

  if (!currentUser) {
    alert("You must be logged in to publish a posting.");
    return;
  }

  try {
    await addDoc(collection(db, "postings"), {
      ...draft,
      userId: currentUser.uid, // <-- store the current user's ID
      tags: draft.tags.split(",").map(tag => tag.trim()).filter(Boolean),
      createdAt: serverTimestamp(),
    });
    setStatus("published");
    router.push("/researcher");
  } catch (error) {
    console.error("Error saving posting:", error);
    alert("Failed to save posting. Check console for details.");
  }
}

  return (
    <div className="space-y-6">
      <header className="space-y-1">
        <p className="text-sm text-neutral-body">Research</p>
        <h1 className="text-2xl font-semibold tracking-tight text-ink">Add a posting</h1>
      </header>

      <div className="grid gap-5 md:grid-cols-3">
        {/* LEFT: FORM */}
        <div className="space-y-5 md:col-span-2">
          {/* Study Details Card */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Study details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-ink">Title</label>
                  <input
                    value={draft.title}
                    onChange={(e) => update("title", e.target.value)}
                    placeholder="e.g., ADHD diagnostic pathways in women"
                    className="w-full rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm text-ink shadow-sm outline-none transition placeholder:text-neutral-body focus:ring-2 focus:ring-primary/60"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-ink">Institution</label>
                  <input
                    value={draft.institution}
                    onChange={(e) => update("institution", e.target.value)}
                    placeholder="e.g., University of Calgary"
                    className="w-full rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm text-ink shadow-sm outline-none transition placeholder:text-neutral-body focus:ring-2 focus:ring-primary/60"
                  />
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-ink">Study type</label>
                  <select
                    value={draft.studyType}
                    onChange={(e) => update("studyType", e.target.value as StudyType)}
                    className="w-full rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm text-ink shadow-sm outline-none transition focus:ring-2 focus:ring-primary/60"
                  >
                    {studyTypes.map((t) => (
                      <option key={t.key} value={t.key}>
                        {t.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-ink">Participation</label>
                  <select
                    value={draft.participationMode}
                    onChange={(e) =>
                      update("participationMode", e.target.value as ParticipationMode)
                    }
                    className="w-full rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm text-ink shadow-sm outline-none transition focus:ring-2 focus:ring-primary/60"
                  >
                    {modes.map((m) => (
                      <option key={m.key} value={m.key}>
                        {m.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {draft.participationMode !== "remote" && (
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-ink">Location</label>
                  <input
                    value={draft.location}
                    onChange={(e) => update("location", e.target.value)}
                    placeholder="e.g., Calgary"
                    className="w-full rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm text-ink shadow-sm outline-none transition placeholder:text-neutral-body focus:ring-2 focus:ring-primary/60"
                  />
                </div>
              )}

              <div className="space-y-2">
                <label className="text-sm font-semibold text-ink">Describe your research</label>
                <textarea
                  value={draft.description}
                  onChange={(e) => update("description", e.target.value)}
                  rows={6}
                  placeholder="What is the study about? What will participants do? Timeline? Eligibility?"
                  className="w-full resize-none rounded-2xl border border-black/10 bg-white p-4 text-sm leading-6 text-ink shadow-sm outline-none transition placeholder:text-neutral-body focus:ring-2 focus:ring-primary/60"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-ink">Tags (optional)</label>
                <input
                  value={draft.tags}
                  onChange={(e) => update("tags", e.target.value)}
                  placeholder="ADHD, autism, masking, burnout (comma-separated)"
                  className="w-full rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm text-ink shadow-sm outline-none transition placeholder:text-neutral-body focus:ring-2 focus:ring-primary/60"
                />
              </div>
            </CardContent>
          </Card>

          {/* Recruitment Card */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Recruitment</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-ink">Looking for…</label>
                <textarea
                  value={draft.lookingFor}
                  onChange={(e) => update("lookingFor", e.target.value)}
                  rows={3}
                  placeholder="Eligibility criteria and who you’re hoping to reach."
                  className="w-full resize-none rounded-2xl border border-black/10 bg-white p-4 text-sm leading-6 text-ink shadow-sm outline-none transition placeholder:text-neutral-body focus:ring-2 focus:ring-primary/60"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-ink">Incentives</label>
                <textarea
                  value={draft.incentives}
                  onChange={(e) => update("incentives", e.target.value)}
                  rows={3}
                  placeholder="Gift cards, compensation, course credit, etc."
                  className="w-full resize-none rounded-2xl border border-black/10 bg-white p-4 text-sm text-ink shadow-sm outline-none transition placeholder:text-neutral-body focus:ring-2 focus:ring-primary/60"
                />
              </div>

              <div className="grid gap-3">
                <ToggleRow
                  label="Allow anonymous responses"
                  helper="Participants can share without revealing their identity."
                  value={draft.anonymousAllowed}
                  onToggle={() => update("anonymousAllowed", !draft.anonymousAllowed)}
                />
                <ToggleRow
                  label="Requires participant consent"
                  helper="Show a consent checkbox before participants apply."
                  value={draft.requiresConsent}
                  onToggle={() => update("requiresConsent", !draft.requiresConsent)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Publish Button */}
          <button
            type="button"
            onClick={publishToFirebase}
            disabled={!canPublish}
            className={
              "w-full rounded-2xl px-5 py-4 text-base font-semibold text-white shadow-sm transition focus:outline-none focus:ring-2 focus:ring-primary/60" +
              (canPublish ? " bg-primary hover:brightness-95" : " bg-black/30 cursor-not-allowed")
            }
          >
            Publish
          </button>

          {status === "published" && (
            <p className="text-center text-xs font-medium text-accent">Published.</p>
          )}
        </div>

        {/* RIGHT: PROFILE + PREVIEW */}
        <div className="space-y-5">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Preview</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="rounded-2xl border border-black/10 bg-white p-4 shadow-sm">
                <p className="text-sm font-semibold text-ink">
                  {draft.title.trim() ? draft.title : "Name of Study — Institution"}
                </p>
                <p className="mt-1 text-sm text-neutral-body">
                  {draft.institution.trim() ? draft.institution : "Institution"}
                </p>
                <p className="mt-3 text-sm leading-6 text-neutral-body">
                  {draft.description.trim() ? draft.description : "Description… read more"}
                </p>
              </div>

              <button
                type="button"
                onClick={() => router.push("/researcher")}
                className="w-full rounded-2xl bg-secondary px-5 py-3 text-sm font-semibold text-ink shadow-sm transition hover:brightness-95 focus:outline-none focus:ring-2 focus:ring-primary/60"
              >
                Back
              </button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
