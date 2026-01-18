"use client";

import { useState } from "react";
import { CommunityFeed } from "./components/community-feed";
import { ResearchFeed } from "./components/research-feed";
import { RecommendationsTab } from "./components/recommendations-tab";

type TabKey = "community" | "research" | "recommendations";

export default function InsightsPage() {
  const [tab, setTab] = useState<TabKey>("community");

  const getTabClass = (isActive: boolean) =>
    "flex-1 rounded-2xl px-3 py-2 text-sm font-medium transition focus:outline-none focus:ring-2 focus:ring-primary/60 " +
    (isActive
      ? "bg-white text-ink shadow-sm"
      : "text-neutral-body hover:bg-white/70");

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
          className={getTabClass(tab === "community")}
          aria-pressed={tab === "community"}
        >
          Community Stories
        </button>
        <button
          type="button"
          onClick={() => setTab("research")}
          className={getTabClass(tab === "research")}
          aria-pressed={tab === "research"}
        >
          Expert Research
        </button>
        <button
          type="button"
          onClick={() => setTab("recommendations")}
          className={getTabClass(tab === "recommendations")}
          aria-pressed={tab === "recommendations"}
        >
          Study Recs
        </button>
      </div>

      {tab === "community" && <CommunityFeed />}
      {tab === "research" && <ResearchFeed />}
      {tab === "recommendations" && <RecommendationsTab />}
    </div>
  );
}
