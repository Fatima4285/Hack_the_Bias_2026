"use client";

import { useMemo, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type TabKey = "community" | "research";

type CommunityStory = {
  id: string;
  text: string;
  tags: string[];
};

type ResearchCard = {
  id: string;
  title: string;
  summary: string;
  match: string;
};

export default function InsightsPage() {
  const [tab, setTab] = useState<TabKey>("community");

  const communityStories: CommunityStory[] = useMemo(
    () => [
      {
        id: "s1",
        text: "I was diagnosed at 32. Hormonal shifts made my ADHD symptoms feel louder, not quieter — especially around luteal phase.",
        tags: ["#ADHD", "#LateDiagnosis", "#Hormones"],
      },
      {
        id: "s2",
        text: "Masking at work was my default setting. I didn’t realize how much energy it cost until I started tracking social burnout.",
        tags: ["#Masking", "#Workplace", "#Burnout"],
      },
      {
        id: "s3",
        text: "Sensory overload isn’t always noise. For me it’s bright lights + decision fatigue — then shutdown.",
        tags: ["#Sensory", "#Shutdown", "#ExecutiveDysfunction"],
      },
    ],
    []
  );

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
    <div className="space-y-5">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight text-ink">
          Insights Hub
        </h1>
        <p className="text-sm text-neutral-body">
          Calm, relevant reading — grounded in lived experience.
        </p>
      </header>

      <div className="flex rounded-2xl bg-secondary p-1">
        <button
          type="button"
          onClick={() => setTab("community")}
          className={
            "flex-1 rounded-2xl px-3 py-2 text-sm font-medium transition focus:outline-none focus:ring-2 focus:ring-primary/60" +
            (tab === "community"
              ? " bg-white text-ink shadow-sm"
              : " text-neutral-body hover:bg-white/70")
          }
          aria-pressed={tab === "community"}
        >
          Community Stories
        </button>
        <button
          type="button"
          onClick={() => setTab("research")}
          className={
            "flex-1 rounded-2xl px-3 py-2 text-sm font-medium transition focus:outline-none focus:ring-2 focus:ring-primary/60" +
            (tab === "research"
              ? " bg-white text-ink shadow-sm"
              : " text-neutral-body hover:bg-white/70")
          }
          aria-pressed={tab === "research"}
        >
          Expert Research
        </button>
      </div>

      {tab === "community" ? (
        <section className="space-y-3" aria-label="Community stories">
          {communityStories.map((story) => (
            <Card key={story.id}>
              <CardContent className="pt-4">
                <p className="text-sm leading-6 text-ink">{story.text}</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {story.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full bg-secondary px-3 py-1 text-xs font-medium text-ink"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </section>
      ) : (
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
      )}
    </div>
  );
}
