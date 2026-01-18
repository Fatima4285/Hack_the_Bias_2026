"use client";

import { useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";

type CommunityStory = {
  id: string;
  text: string;
  tags: string[];
};

export function CommunityFeed() {
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

  return (
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
  );
}
