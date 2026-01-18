import { useEffect, useMemo, useState } from "react";
import { type User } from "firebase/auth";
import { useAuth } from "@/components/auth-provider";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Star, ChevronDown, ChevronUp } from "lucide-react";

export default function ResearcherDashboard({ user }: { user: User | null }) {
  return (
    <div className="space-y-6">
      <header className="space-y-1">
        <p className="text-sm text-neutral-body">Researcher Dashboard</p>
        <h1 className="text-2xl font-semibold tracking-tight text-ink">
          Welcome back, {user?.displayName || "Researcher"}.
        </h1>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Participants</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">12</p>
            <p className="text-xs text-neutral-body">Active in study</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>New Logs</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">48</p>
            <p className="text-xs text-neutral-body">In the last 24h</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Data Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-neutral-body">
            Data visualization and export controls will appear here.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
