"use client";

import { useMemo, useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ChevronDown, ChevronUp } from "lucide-react";

type Study = {
  id: string;
  org: string;
  title: string;
  hook: string;
  purpose: string[];
  involves: string[];
  ethicsNote?: string;
};

const STUDIES: Study[] = [
  {
    id: "uoft-womens-health-fatigue",
    org: "University of Toronto",
    title: "Women’s Health Study",
    hook: "Looking for people with long-term fatigue and dismissal experiences.",
    purpose: [
      "Understand how long-term fatigue affects daily life and care experiences.",
      "Identify patterns in dismissal or delayed support to inform better clinical pathways.",
    ],
    involves: [
      "A short eligibility screener (2–3 minutes).",
      "One survey (10–15 minutes).",
      "Optional interview (30–45 minutes) conducted online.",
    ],
    ethicsNote:
      "This study is conducted under institutional ethics review. You’ll see the research team’s details and consent form before sharing any information.",
  },
];

type RecView = "feed" | "details" | "apply";
type RecTabKey = "recommended" | "applied";

export function RecommendationsTab() {
  const [tab, setTab] = useState<RecTabKey>("recommended");
  const [skippedIds, setSkippedIds] = useState<Record<string, boolean>>({});
  const [appliedIds, setAppliedIds] = useState<Record<string, boolean>>({});
  const [selectedStudyId, setSelectedStudyId] = useState<string | null>(null);
  const [view, setView] = useState<RecView>("feed");
  const [policyOpen, setPolicyOpen] = useState(true);

  const selectedStudy = useMemo(() => {
    return STUDIES.find((s) => s.id === selectedStudyId) ?? null;
  }, [selectedStudyId]);

  const recommendedStudies = useMemo(() => {
    return STUDIES.filter((s) => !skippedIds[s.id] && !appliedIds[s.id]);
  }, [skippedIds, appliedIds]);

  const appliedStudies = useMemo(() => {
    return STUDIES.filter((s) => !!appliedIds[s.id]);
  }, [appliedIds]);

  function onLearnMore(studyId: string) {
    setSelectedStudyId(studyId);
    setView("details");
  }

  function onSkip(studyId: string) {
    setSkippedIds((prev) => ({ ...prev, [studyId]: true }));
  }

  function onInterested() {
    setView("apply");
    setPolicyOpen(true);
  }

  function onAgreeAndShare() {
    if (!selectedStudyId) return;
    setAppliedIds((prev) => ({ ...prev, [selectedStudyId]: true }));
    setView("feed");
    setSelectedStudyId(null);
    setTab("applied");
  }

  const feedStudies = tab === "recommended" ? recommendedStudies : appliedStudies;

  return (
    <div className="space-y-4">
       <Card className="bg-secondary/50 border-none">
          <CardContent className="pt-4 flex gap-3 text-sm text-neutral-body">
            <span className="shrink-0 bg-primary/10 p-1 rounded-full text-primary">ℹ️</span>
            <p>
              Match with active research studies looking for participants like you. 
              You’ll only be connected if you explicitly agree to share your contact info.
            </p>
          </CardContent>
       </Card>

      {/* TABS */}
      {view === "feed" && (
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between gap-3">
              <CardTitle className="text-base">{tab === "recommended" ? "Recommended studies" : "Applied research"}</CardTitle>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setTab("recommended")}
                  className={
                    "rounded-full px-4 py-2 text-xs font-semibold shadow-sm transition focus:outline-none focus:ring-2 focus:ring-primary/60 " +
                    (tab === "recommended" ? "bg-primary text-white" : "bg-white text-ink hover:bg-secondary")
                  }
                  aria-pressed={tab === "recommended"}
                >
                  Recommended
                </button>
                <button
                  type="button"
                  onClick={() => setTab("applied")}
                  className={
                    "rounded-full px-4 py-2 text-xs font-semibold shadow-sm transition focus:outline-none focus:ring-2 focus:ring-primary/60 " +
                    (tab === "applied" ? "bg-primary text-white" : "bg-white text-ink hover:bg-secondary")
                  }
                  aria-pressed={tab === "applied"}
                >
                  Applied ({appliedStudies.length})
                </button>
              </div>
            </div>
          </CardHeader>

          <CardContent>
            {feedStudies.length === 0 ? (
              <p className="text-sm leading-6 text-neutral-body py-4">
                {tab === "recommended"
                  ? "No recommendations right now. Check back later."
                  : "You haven’t applied to any studies yet."}
              </p>
            ) : (
              <div className="space-y-3">
                {feedStudies.map((s) => {
                  const isApplied = !!appliedIds[s.id];
                  return (
                    <div
                      key={s.id}
                      className="rounded-2xl border border-black/10 bg-white p-4 shadow-sm transition hover:bg-secondary"
                    >
                      <div className="space-y-1">
                        <p className="text-xs font-semibold text-neutral-body">{s.org}</p>
                        <p className="text-sm font-semibold text-ink">{s.title}</p>
                        <p className="text-sm leading-6 text-neutral-body">“{s.hook}”</p>

                        {isApplied && (
                          <p className="mt-2 inline-flex w-fit rounded-full bg-secondary px-3 py-1 text-xs font-semibold text-ink">
                            Applied
                          </p>
                        )}
                      </div>

                      <div className="mt-3 flex gap-2">
                        <button
                          type="button"
                          onClick={() => onLearnMore(s.id)}
                          className={
                            "flex-1 rounded-2xl px-4 py-3 text-sm font-semibold shadow-sm transition focus:outline-none focus:ring-2 focus:ring-primary/60 " +
                            (tab === "recommended"
                              ? "bg-primary text-white hover:brightness-95"
                              : "bg-white text-ink hover:bg-secondary")
                          }
                        >
                          {tab === "recommended" ? "Learn More" : "View Details"}
                        </button>

                        {tab === "recommended" && (
                          <button
                            type="button"
                            onClick={() => onSkip(s.id)}
                            className="rounded-2xl bg-white px-4 py-3 text-sm font-semibold text-ink shadow-sm transition hover:bg-secondary focus:outline-none focus:ring-2 focus:ring-primary/60"
                          >
                            Skip
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* DETAILS */}
      {view === "details" && selectedStudy && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>
              {selectedStudy.org} — {selectedStudy.title}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-2xl border border-black/10 bg-white p-4">
              <p className="text-xs font-semibold text-neutral-body">Study summary</p>
              <p className="mt-1 text-sm leading-6 text-ink">“{selectedStudy.hook}”</p>
            </div>

            <div className="rounded-2xl border border-black/10 bg-white p-4">
              <p className="text-xs font-semibold text-neutral-body">Purpose of the study</p>
              <ul className="mt-2 list-disc space-y-1 pl-5 text-sm leading-6 text-ink">
                {selectedStudy.purpose.map((p, i) => (
                  <li key={i}>{p}</li>
                ))}
              </ul>
            </div>

            <div className="rounded-2xl border border-black/10 bg-white p-4">
              <p className="text-xs font-semibold text-neutral-body">What participation involves</p>
              <ul className="mt-2 list-disc space-y-1 pl-5 text-sm leading-6 text-ink">
                {selectedStudy.involves.map((p, i) => (
                  <li key={i}>{p}</li>
                ))}
              </ul>
            </div>

            {selectedStudy.ethicsNote && (
              <p className="text-sm leading-6 text-neutral-body">{selectedStudy.ethicsNote}</p>
            )}

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => {
                  setView("feed");
                  setSelectedStudyId(null);
                }}
                className="rounded-2xl bg-white px-4 py-3 text-sm font-semibold text-ink shadow-sm transition hover:bg-secondary focus:outline-none focus:ring-2 focus:ring-primary/60"
              >
                Back
              </button>

              {tab === "recommended" && !appliedIds[selectedStudy.id] ? (
                <button
                  type="button"
                  onClick={onInterested}
                  className="flex-1 rounded-2xl bg-primary px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:brightness-95 focus:outline-none focus:ring-2 focus:ring-primary/60"
                >
                  I’m Interested
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setTab("applied");
                    setView("feed");
                    setSelectedStudyId(null);
                  }}
                  className="flex-1 rounded-2xl bg-white px-4 py-3 text-sm font-semibold text-ink shadow-sm transition hover:bg-secondary focus:outline-none focus:ring-2 focus:ring-primary/60"
                >
                  Back to Applied
                </button>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* APPLY / CONSENT */}
      {view === "apply" && selectedStudy && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Apply — {selectedStudy.org}</CardTitle>
          </CardHeader>

          <CardContent className="space-y-4">
            <div className="rounded-2xl border border-black/10 bg-white p-4">
              <p className="text-sm font-semibold text-ink">
                By continuing, you agree to share your contact information with this research team so they can reach out
                to you about participating in their study.
              </p>

              <button
                type="button"
                onClick={() => setPolicyOpen((v) => !v)}
                className="mt-3 inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 text-xs font-semibold text-ink shadow-sm transition hover:bg-secondary focus:outline-none focus:ring-2 focus:ring-primary/60"
                aria-expanded={policyOpen}
                aria-controls="policy-panel"
              >
                {policyOpen ? "Collapse details" : "Expand details"}
                {policyOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </button>

              {policyOpen && (
                <div id="policy-panel" className="mt-3 space-y-3">
                  <p className="text-sm leading-6 text-neutral-body">
                    If you participate, your experience and any data you provide will be shared with the research team for
                    the purpose of this study only, in the way described on the previous screen (for example, surveys,
                    interviews, or clinical research). Your information will be handled according to their ethics approval
                    and privacy policies.
                  </p>
                  <p className="text-sm leading-6 text-neutral-body">
                    Participation is completely voluntary. You can decline now or withdraw later without any penalty.
                    Your decision will not affect your ability to use this app.
                  </p>
                </div>
              )}
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setView("details")}
                className="rounded-2xl bg-white px-4 py-3 text-sm font-semibold text-ink shadow-sm transition hover:bg-secondary focus:outline-none focus:ring-2 focus:ring-primary/60"
              >
                Back
              </button>

              <button
                type="button"
                onClick={onAgreeAndShare}
                className="flex-1 rounded-2xl bg-primary px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:brightness-95 focus:outline-none focus:ring-2 focus:ring-primary/60"
              >
                Agree & Share
              </button>
            </div>

            <button
              type="button"
              onClick={() => {
                setView("feed");
                setSelectedStudyId(null);
              }}
              className="w-full rounded-2xl bg-white px-4 py-3 text-sm font-semibold text-ink shadow-sm transition hover:bg-secondary focus:outline-none focus:ring-2 focus:ring-primary/60"
            >
              Decline
            </button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
