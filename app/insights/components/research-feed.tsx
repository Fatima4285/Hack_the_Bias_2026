"use client";

import { useMemo } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type ResearchCard = {
  id: string;
  title: string;
  summary: string;
  match: string;
};

export function ResearchFeed() {
  const researchCards: ResearchCard[] = useMemo(
    () => [
      {
        id: "r1",
        title: "Masking and Mental Load in Late-Diagnosed Women",
        summary:
          "A review of how social camouflaging strategies correlate with fatigue, anxiety, and delayed clinical recognition.",
        match: "Matches: High Masking",
      },
      {
        id: "r2",
        title: "Menstrual Cycle Phase and Executive Function Variability",
        summary:
          "Findings suggest certain cognitive domains fluctuate across phases, with notable changes for attention regulation.",
        match: "Matches: Executive Dysfunction",
      },
      {
        id: "r3",
        title: "Sensory Processing, Work Environments, and Burnout Risk",
        summary:
          "An overview of sensory stressors in open-plan offices and practical accommodations that reduce overload.",
        match: "Matches: Sensory Overload",
      },
    ],
    []
  );

  return (
    <section className="space-y-4" aria-label="Expert research">
      <Card className="bg-secondary">
        <CardHeader>
          <CardTitle>Tailored for You</CardTitle>
          <CardDescription>
            Based on what you track — you can refine this later.
          </CardDescription>
        </CardHeader>
      </Card>

      <div className="space-y-3">
        {researchCards.map((card) => (
          <Card key={card.id}>
            <CardHeader className="pb-2">
              <div className="flex items-start justify-between gap-3">
                <CardTitle className="text-sm">{card.title}</CardTitle>
                <span className="shrink-0 rounded-full bg-accent/15 px-3 py-1 text-xs font-semibold text-ink">
                  Match
                </span>
              </div>
            </CardHeader>

            <CardContent>
              <p className="line-clamp-2 text-sm leading-6 text-neutral-body">
                {card.summary}
              </p>
              <p className="mt-3 text-xs font-medium text-primary">
                {card.match}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}
