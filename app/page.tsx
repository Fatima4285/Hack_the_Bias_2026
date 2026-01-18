"use client";

import { useAuth } from "@/components/auth-provider";
import ResearcherDashboard from "@/components/home-page/ResearcherHome";
import ParticipantDashboard from "@/components/home-page/participant";

export default function DashboardPage() {
  const { user, role, loading } = useAuth();

  if (loading) {
    return <div className="p-8 text-center text-neutral-body">Loading...</div>;
  }

  // If role is researcher, show researcher view.
  // Otherwise default to participant view (handle 'participant' or null).
  if (role === "researcher") {
    return <ResearcherDashboard user={user} />;
  }

  return <ParticipantDashboard user={user} />;
}
