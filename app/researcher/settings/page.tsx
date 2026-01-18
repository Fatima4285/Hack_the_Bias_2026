"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type SettingsState = {
  emailNotifications: boolean;
  weeklyDigest: boolean;
  shareAnonymizedMetrics: boolean; // later: analytics opt-in, privacy-safe
  showDevTools: boolean; // lets you hide dev-only UI easily
};

const STORAGE_KEY = "neurolens.research.settings.v1";

function loadSettings(): SettingsState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return {
        emailNotifications: true,
        weeklyDigest: true,
        shareAnonymizedMetrics: true,
        showDevTools: true,
      };
    }
    const parsed = JSON.parse(raw) as Partial<SettingsState>;
    return {
      emailNotifications: parsed.emailNotifications ?? true,
      weeklyDigest: parsed.weeklyDigest ?? true,
      shareAnonymizedMetrics: parsed.shareAnonymizedMetrics ?? true,
      showDevTools: parsed.showDevTools ?? true,
    };
  } catch {
    return {
      emailNotifications: true,
      weeklyDigest: true,
      shareAnonymizedMetrics: true,
      showDevTools: true,
    };
  }
}

function saveSettings(next: SettingsState) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    // ignore
  }
}

function Toggle({
  label,
  helper,
  value,
  onChange,
}: {
  label: string;
  helper: string;
  value: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <button
      type="button"
      aria-pressed={value}
      onClick={() => onChange(!value)}
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

export default function ResearcherSettingsPage() {
  const [settings, setSettings] = useState<SettingsState>(() => loadSettings());
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setSaved(false);
  }, [settings]);

  function update<K extends keyof SettingsState>(key: K, value: SettingsState[K]) {
    setSettings((s) => ({ ...s, [key]: value }));
  }

  function onSave() {
    saveSettings(settings);
    setSaved(true);
  }

  return (
    <div className="space-y-6">
      <header className="space-y-1">
        <p className="text-sm text-neutral-body">Research</p>
        <h1 className="text-2xl font-semibold tracking-tight text-ink">Settings</h1>
        <p className="text-sm text-neutral-body">
          Local demo settings for now — later this will sync to the backend.
        </p>
      </header>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle>Notifications</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Toggle
            label="Email notifications"
            helper="Get email updates for new participant interest and messages."
            value={settings.emailNotifications}
            onChange={(v) => update("emailNotifications", v)}
          />
          <Toggle
            label="Weekly digest"
            helper="A weekly summary of posting performance and activity."
            value={settings.weeklyDigest}
            onChange={(v) => update("weeklyDigest", v)}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle>Privacy & analytics</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Toggle
            label="Share anonymized usage metrics"
            helper="Helps improve the product without collecting personal data."
            value={settings.shareAnonymizedMetrics}
            onChange={(v) => update("shareAnonymizedMetrics", v)}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle>Developer</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Toggle
            label="Show development tools"
            helper="Show temporary buttons and dev-only UI while auth is incomplete."
            value={settings.showDevTools}
            onChange={(v) => update("showDevTools", v)}
          />
        </CardContent>
      </Card>

      <Card>
        <CardContent className="space-y-2 pt-4">
          <button
            type="button"
            onClick={onSave}
            className="w-full rounded-2xl bg-primary px-5 py-4 text-base font-semibold text-white shadow-sm transition hover:brightness-95 focus:outline-none focus:ring-2 focus:ring-primary/60"
          >
            Save settings
          </button>
          {saved ? (
            <p className="text-center text-xs font-medium text-accent">Saved locally.</p>
          ) : (
            <p className="text-center text-xs text-neutral-body">Not connected to a database yet.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
