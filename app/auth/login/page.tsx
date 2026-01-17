"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import {
  GoogleAuthProvider,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signInWithPopup,
  signInWithRedirect,
} from "firebase/auth";
import { auth } from "@/lib/firebase/client";
import { useAuth } from "@/components/auth-provider";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { GoogleMark } from "@/components/icons/google-mark";

function isValidEmail(value: string) {
  return /.+@.+\..+/.test(value);
}

function friendlyAuthError(err: unknown) {
  const code = (err as { code?: string } | null)?.code;
  switch (code) {
    case "auth/invalid-credential":
    case "auth/wrong-password":
    case "auth/user-not-found":
      return "That email/password combo didn’t work. Try again.";
    case "auth/too-many-requests":
      return "Too many attempts. Please wait a bit and try again.";
    case "auth/popup-blocked":
      return "Your browser blocked the popup. We’ll try a redirect.";
    default:
      return err instanceof Error ? err.message : "Something went wrong. Please try again.";
  }
}

export default function LoginPage() {
  const router = useRouter();
  const { user, loading } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const canSubmit = useMemo(() => {
    return isValidEmail(email.trim()) && password.length >= 6 && !submitting;
  }, [email, password, submitting]);

  useEffect(() => {
    if (!loading && user) router.replace("/");
  }, [loading, user, router]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setNotice(null);

    const normalizedEmail = email.trim();
    if (!isValidEmail(normalizedEmail)) {
      setError("Please enter a valid email address.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setSubmitting(true);
    try {
      await signInWithEmailAndPassword(auth, normalizedEmail, password);
      router.push("/");
    } catch (err: unknown) {
      setError(friendlyAuthError(err));
    } finally {
      setSubmitting(false);
    }
  }

  async function onGoogleSignIn() {
    setError(null);
    setNotice(null);
    setSubmitting(true);
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      router.push("/");
    } catch (err: unknown) {
      const code = (err as { code?: string } | null)?.code;

      // Fallback for browsers blocking popups.
      if (code === "auth/popup-blocked" || code === "auth/popup-closed-by-user") {
        try {
          await signInWithRedirect(auth, new GoogleAuthProvider());
          return;
        } catch (redirectErr: unknown) {
          setError(friendlyAuthError(redirectErr));
          return;
        }
      }

      setError(friendlyAuthError(err));
    } finally {
      setSubmitting(false);
    }
  }

  async function onResetPassword() {
    setError(null);
    setNotice(null);

    const normalizedEmail = email.trim();
    if (!isValidEmail(normalizedEmail)) {
      setError("Enter your email above first, then tap ‘Reset password’. ");
      return;
    }

    setSubmitting(true);
    try {
      await sendPasswordResetEmail(auth, normalizedEmail);
      setNotice("Password reset email sent (check your inbox). ");
    } catch (err: unknown) {
      setError(friendlyAuthError(err));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-6">
      <header className="space-y-1">
        <p className="text-xs font-semibold text-neutral-body">NeuroLens</p>
        <h1 className="text-2xl font-semibold tracking-tight text-ink">
          Welcome back
        </h1>
        <p className="text-sm text-neutral-body">
          Sign in to continue your calm, private check-ins.
        </p>
      </header>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle>Log in</CardTitle>
          <CardDescription>Use Google or your email.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <button
              type="button"
              onClick={onGoogleSignIn}
              disabled={submitting}
              className="flex w-full items-center justify-center gap-2 rounded-2xl border border-black/10 bg-white px-5 py-4 text-base font-semibold text-ink shadow-sm transition hover:bg-secondary disabled:cursor-not-allowed disabled:opacity-60"
            >
              <GoogleMark className="h-5 w-5" />
              Continue with Google
            </button>

            <div className="flex items-center gap-3">
              <div className="h-px flex-1 bg-black/10" />
              <span className="text-xs font-semibold text-neutral-body">or</span>
              <div className="h-px flex-1 bg-black/10" />
            </div>

            <form onSubmit={onSubmit} className="space-y-3">
              <label className="block space-y-1">
                <span className="text-xs font-semibold text-neutral-body">
                  Email
                </span>
                <input
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  type="email"
                  autoComplete="email"
                  inputMode="email"
                  placeholder="you@example.com"
                  autoFocus
                  disabled={submitting}
                  className="w-full rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm text-ink shadow-sm outline-none transition placeholder:text-neutral-body focus:ring-2 focus:ring-primary/60"
                />
              </label>

              <label className="block space-y-1">
                <span className="text-xs font-semibold text-neutral-body">
                  Password
                </span>
                <div className="relative">
                  <input
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    placeholder="Your password"
                    disabled={submitting}
                    className="w-full rounded-2xl border border-black/10 bg-white px-4 py-3 pr-16 text-sm text-ink shadow-sm outline-none transition placeholder:text-neutral-body focus:ring-2 focus:ring-primary/60"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full px-3 py-1 text-xs font-semibold text-neutral-body hover:bg-secondary"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? "Hide" : "Show"}
                  </button>
                </div>
              </label>

              <div className="flex items-center justify-between gap-3">
                <p className="text-xs text-neutral-body">
                  Forgot it?{" "}
                  <button
                    type="button"
                    onClick={onResetPassword}
                    disabled={submitting}
                    className="font-semibold text-ink underline disabled:opacity-60"
                  >
                    Reset password
                  </button>
                </p>
              </div>

              {error ? (
                <p className="rounded-2xl border border-black/10 bg-secondary px-3 py-2 text-sm text-ink">
                  {error}
                </p>
              ) : null}

              {notice ? (
                <p className="rounded-2xl border border-black/10 bg-canvas px-3 py-2 text-sm text-ink">
                  {notice}
                </p>
              ) : null}

              <button
                type="submit"
                disabled={!canSubmit}
                className="w-full rounded-2xl bg-primary px-5 py-4 text-base font-semibold text-white shadow-sm transition hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {submitting ? "Signing in…" : "Sign in"}
              </button>
            </form>
          </div>
        </CardContent>
        <CardFooter className="flex items-center justify-between">
          <p className="text-xs text-neutral-body">
            New here?{" "}
            <Link href="/auth/signup" className="font-semibold text-ink underline">
              Create an account
            </Link>
          </p>
        </CardFooter>
      </Card>

      <p className="text-xs text-neutral-body">
        We only use your account to personalize your experience.
      </p>
    </div>
  );
}
