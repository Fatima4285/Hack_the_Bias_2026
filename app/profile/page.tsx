"use client";

import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { useAuth } from "@/components/auth-provider";
import { auth } from "@/lib/firebase/client";
import { signOut } from "firebase/auth";
import Link from "next/link";

export default function ProfilePage() {
  const { user, loading } = useAuth();

  return (
    <div className="space-y-4">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight text-ink">Profile</h1>
        <p className="text-sm text-neutral-body">
          Mock profile settings — wire to auth later.
        </p>
      </header>

      <Card>
        <CardContent className="pt-4">
          <p className="text-sm text-ink">
            Signed in as:{" "}
            <span className="font-semibold">
              {loading ? "…" : user?.email ?? "Not signed in"}
            </span>
          </p>
          <p className="mt-2 text-sm text-neutral-body">
            Preferences, accessibility options, and notifications will live here.
          </p>
        </CardContent>
        <CardFooter className="flex flex-wrap items-center justify-between gap-2">
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
