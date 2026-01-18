"use client";

import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type ResearcherProfile = {
  displayName: string;
  roleTitle: string;
  institution: string;
  department: string;
  email: string;
  bio: string;

  website: string;
  ethicsId: string; // optional placeholder for REB/ethics approval tracking
  focusAreas: string; // comma-separated for now
};

const STORAGE_KEY = "neurolens.research.profile.v1";

function safeLoad(): ResearcherProfile | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<ResearcherProfile>;
    if (!parsed) return null;

    return {
      displayName: parsed.displayName ?? "Researcher (DEV)",
      roleTitle: parsed.roleTitle ?? "Research Lead",
      institution: parsed.institution ?? "University / Organization",
      department: parsed.department ?? "Department",
      email: parsed.email ?? "researcher@dev.local",
      bio:
        parsed.bio ??
        "Write a short bio about your lab, your research focus, and what participants can expect.",
      website: parsed.website ?? "",
      ethicsId: parsed.ethicsId ?? "",
      focusAreas: parsed.focusAreas ?? "ADHD, autism, masking",
    };
  } catch {
    return null;
  }
}

function save(profile: ResearcherProfile) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
  } catch {
    // ignore
  }
}

export default function ResearcherProfilePage() {
  const [profile, setProfile] = useState<ResearcherProfile>(() => {
    return (
      safeLoad() ?? {
        displayName: "Researcher (DEV)",
        roleTitle: "Research Lead",
        institution: "University / Organization",
        department: "Department",
        email: "researcher@dev.local",
        bio:
          "Write a short bio about your lab, your research focus, and what participants can expect.",
        website: "",
        ethicsId: "",
        focusAreas: "ADHD, autism, masking",
      }
    );
  });

  const [saved, setSaved] = useState(false);

  const initials = useMemo(() => {
    const parts = profile.displayName.trim().split(/\s+/).filter(Boolean);
    const a = parts[0]?.[0] ?? "R";
    const b = parts[1]?.[0] ?? "";
    return (a + b).toUpperCase();
  }, [profile.displayName]);

  useEffect(() => {
    setSaved(false);
  }, [profile]);

  function update<K extends keyof ResearcherProfile>(key: K, value: ResearcherProfile[K]) {
    setProfile((p) => ({ ...p, [key]: value }));
  }

  function onSave() {
    save(profile);
    setSaved(true);
  }

  return (
    <div className="space-y-6">
      <header className="space-y-1">
        <p className="text-sm text-neutral-body">Research</p>
        <h1 className="text-2xl font-semibold tracking-tight text-ink">Profile</h1>
        <p className="text-sm text-neutral-body">
          Local demo data for now — later this will load from the database.
        </p>
      </header>

      <div className="grid gap-5 md:grid-cols-3">
        {/* LEFT: SUMMARY */}
        <div className="space-y-5 md:col-span-1">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Preview</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="grid h-12 w-12 place-items-center rounded-2xl bg-secondary text-sm font-semibold text-ink shadow-sm">
                  {initials}
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-ink">{profile.displayName}</p>
                  <p className="truncate text-sm text-neutral-body">
                    {profile.roleTitle} • {profile.institution}
                  </p>
                </div>
              </div>

              <div className="rounded-2xl border border-black/10 bg-white p-4 shadow-sm">
                <p className="text-sm font-semibold text-ink">Bio</p>
                <p className="mt-1 text-sm leading-6 text-neutral-body">{profile.bio}</p>
              </div>

              <div className="rounded-2xl border border-black/10 bg-white p-4 shadow-sm">
                <p className="text-sm font-semibold text-ink">Focus areas</p>
                <p className="mt-1 text-sm leading-6 text-neutral-body">{profile.focusAreas}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* RIGHT: EDIT FORM */}
        <div className="space-y-5 md:col-span-2">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>About you</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-ink">Display name</label>
                  <input
                    value={profile.displayName}
                    onChange={(e) => update("displayName", e.target.value)}
                    className="w-full rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm text-ink shadow-sm outline-none transition focus:ring-2 focus:ring-primary/60"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-ink">Role / title</label>
                  <input
                    value={profile.roleTitle}
                    onChange={(e) => update("roleTitle", e.target.value)}
                    className="w-full rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm text-ink shadow-sm outline-none transition focus:ring-2 focus:ring-primary/60"
                  />
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-ink">Institution</label>
                  <input
                    value={profile.institution}
                    onChange={(e) => update("institution", e.target.value)}
                    className="w-full rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm text-ink shadow-sm outline-none transition focus:ring-2 focus:ring-primary/60"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-ink">Department</label>
                  <input
                    value={profile.department}
                    onChange={(e) => update("department", e.target.value)}
                    className="w-full rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm text-ink shadow-sm outline-none transition focus:ring-2 focus:ring-primary/60"
                  />
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-ink">Email</label>
                  <input
                    value={profile.email}
                    onChange={(e) => update("email", e.target.value)}
                    className="w-full rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm text-ink shadow-sm outline-none transition focus:ring-2 focus:ring-primary/60"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-ink">Website (optional)</label>
                  <input
                    value={profile.website}
                    onChange={(e) => update("website", e.target.value)}
                    placeholder="https://"
                    className="w-full rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm text-ink shadow-sm outline-none transition placeholder:text-neutral-body focus:ring-2 focus:ring-primary/60"
                  />
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-ink">Ethics / REB ID (optional)</label>
                  <input
                    value={profile.ethicsId}
                    onChange={(e) => update("ethicsId", e.target.value)}
                    placeholder="e.g., REB-2026-123"
                    className="w-full rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm text-ink shadow-sm outline-none transition placeholder:text-neutral-body focus:ring-2 focus:ring-primary/60"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-ink">Focus areas</label>
                  <input
                    value={profile.focusAreas}
                    onChange={(e) => update("focusAreas", e.target.value)}
                    placeholder="Comma-separated"
                    className="w-full rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm text-ink shadow-sm outline-none transition placeholder:text-neutral-body focus:ring-2 focus:ring-primary/60"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-ink">Bio</label>
                <textarea
                  value={profile.bio}
                  onChange={(e) => update("bio", e.target.value)}
                  rows={5}
                  className="w-full resize-none rounded-2xl border border-black/10 bg-white p-4 text-sm leading-6 text-ink shadow-sm outline-none transition focus:ring-2 focus:ring-primary/60"
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="space-y-2 pt-4">
              <button
                type="button"
                onClick={onSave}
                className="w-full rounded-2xl bg-primary px-5 py-4 text-base font-semibold text-white shadow-sm transition hover:brightness-95 focus:outline-none focus:ring-2 focus:ring-primary/60"
              >
                Save profile
              </button>
              {saved ? (
                <p className="text-center text-xs font-medium text-accent">Saved locally.</p>
              ) : (
                <p className="text-center text-xs text-neutral-body">Not connected to a database yet.</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
