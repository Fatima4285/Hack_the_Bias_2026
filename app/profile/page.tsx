"use client";

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/components/auth-provider";
import { auth, db } from "@/lib/firebase/client";
import { signOut } from "firebase/auth";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function ProfilePage() {
  const { user, role, loading } = useAuth();
  const [institutionEmail, setInstitutionEmail] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    if (user && role === "researcher") {
      // Fetch existing institution email
      getDoc(doc(db, "users", user.uid)).then((snap) => {
        if (snap.exists()) {
          const data = snap.data();
          if (data.institutionEmail) {
            setInstitutionEmail(data.institutionEmail);
          }
        }
      });
    }
  }, [user, role]);

  async function onSave() {
    if (!user) return;
    setSaving(true);
    setMessage(null);

    try {
      await updateDoc(doc(db, "users", user.uid), {
        institutionEmail: institutionEmail.trim(),
      });
      setMessage("Profile updated successfully.");
    } catch (e) {
      console.error(e);
      setMessage("Error updating profile.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight text-ink">Profile</h1>
        <p className="text-sm text-neutral-body">
          Manage your account settings and preferences.
        </p>
      </header>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle>Account</CardTitle>
          <CardDescription>Signed in as {user?.email}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 pt-4">
          {role === "researcher" && (
             <div className="space-y-2">
              <label className="block text-sm font-semibold text-neutral-body">
                Institution Email
              </label>
              <input
                value={institutionEmail}
                onChange={(e) => setInstitutionEmail(e.target.value)}
                type="email"
                placeholder="name@university.edu"
                className="w-full rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm text-ink shadow-sm outline-none transition placeholder:text-neutral-body focus:ring-2 focus:ring-primary/60"
              />
              <p className="text-xs text-neutral-body">Required for researcher verification.</p>
            </div>
          )}
          
          {message && (
            <p className={`text-sm ${message.includes("Error") ? "text-red-600" : "text-green-600"}`}>
              {message}
            </p>
          )}

          {role === "researcher" && (
            <button
              onClick={onSave}
              disabled={saving}
              className="rounded-2xl bg-primary px-4 py-2 text-sm font-semibold text-white shadow-sm hover:brightness-95 disabled:opacity-50"
            >
              {saving ? "Saving..." : "Save Changes"}
            </button>
          )}
        </CardContent>
        <CardFooter className="flex flex-wrap items-center justify-between gap-2 border-t pt-4">
          {user ? (
            <button
              type="button"
              onClick={() => signOut(auth)}
              className="rounded-2xl border border-black/10 bg-white px-4 py-2 text-sm font-semibold text-ink shadow-sm hover:bg-secondary"
            >
              Sign out
            </button>
          ) : (
            <Link
              href="/login"
              className="rounded-2xl bg-primary px-4 py-2 text-sm font-semibold text-white shadow-sm hover:brightness-95"
            >
              Sign in
            </Link>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}
