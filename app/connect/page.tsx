"use client";

import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type Study = {
  id: string;
  title: string;
  institution: string;
  reward: string;
  focus: string;
};

export default function ConnectPage() {
  const [allowResearch, setAllowResearch] = useState(false);
  const [appliedStudyId, setAppliedStudyId] = useState<string | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("neurolens.allowResearch");
      if (raw != null) setAllowResearch(raw === "true");
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem("neurolens.allowResearch", String(allowResearch));
    } catch {
      // ignore
    }
  }, [allowResearch]);

  const studies: Study[] = useMemo(
    () => [
      {
        id: "st1",
        title: "Cycle Phase & Attention Regulation Study",
        institution: "Riverstone University",
        reward: "$20 Gift Card",
        focus: "Hormonal impacts + executive function",
      },
      {
        id: "st2",
        title: "Workplace Masking and Burnout Survey",
        institution: "Northbridge Institute",
        reward: "$15 Gift Card",
        focus: "High masking + social burnout",
      },
      {
        id: "st3",
        title: "Sensory Environment Diary Project",
        institution: "Brighton Health Lab",
        reward: "Raffle (1 in 20)",
        focus: "Sensory overload patterns",
      },
    ],
    []
  );

  return (
    <div className="space-y-5">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight text-ink">
          Research Bridge
        </h1>
        <p className="text-sm text-neutral-body">
          Connect with studies — on your terms.
        </p>
      </header>

      <Card aria-label="Research data sharing">
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between gap-4">
            <div>
              <CardTitle>Allow anonymized data for research</CardTitle>
              <p className="mt-1 text-sm leading-6 text-neutral-body">
                Share symptom patterns without identity details. You can turn this
                off anytime.
              </p>
            </div>

            <button
              type="button"
              role="switch"
              aria-checked={allowResearch}
              onClick={() => setAllowResearch((v) => !v)}
              className={
                "relative h-8 w-14 shrink-0 rounded-full p-1 transition focus:outline-none focus:ring-2 focus:ring-primary/60" +
                (allowResearch ? " bg-primary" : " bg-secondary")
              }
            >
              <span
                className={
                  "block h-6 w-6 rounded-full bg-white shadow-sm transition-transform" +
                  (allowResearch ? " translate-x-6" : " translate-x-0")
                }
              />
            </button>
          </div>
        </CardHeader>
      </Card>

      <section className="space-y-3" aria-label="Active studies">
        <div className="flex items-end justify-between">
          <h2 className="text-sm font-semibold text-ink">Active Studies</h2>
          <p className="text-xs text-neutral-body">Mock directory</p>
        </div>

        {studies.map((study) => {
          const applied = appliedStudyId === study.id;
          return (
            <Card key={study.id}>
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <CardTitle className="text-sm">{study.title}</CardTitle>
                    <p className="mt-1 text-sm text-neutral-body">
                      {study.institution}
                    </p>
                  </div>
                  <span className="shrink-0 rounded-full bg-accent/15 px-3 py-1 text-xs font-semibold text-ink">
                    {study.reward}
                  </span>
                </div>
              </CardHeader>

              <CardContent>
                <p className="text-sm leading-6 text-neutral-body">
                  <span className="font-medium text-ink">Focus:</span> {study.focus}
                </p>

                <div className="mt-4 flex items-center justify-between gap-3">
                  <p className="text-xs text-neutral-body">
                    Consent-first, neuro-inclusive participation
                  </p>
                  <button
                    type="button"
                    onClick={() => setAppliedStudyId(study.id)}
                    className={
                      "rounded-full px-4 py-2 text-sm font-semibold shadow-sm transition focus:outline-none focus:ring-2 focus:ring-primary/60" +
                      (applied
                        ? " bg-secondary text-ink"
                        : " bg-primary text-white hover:brightness-95")
                    }
                  >
                    {applied ? "Applied" : "Apply"}
                  </button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </section>
    </div>
  );
}
