"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import {
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithEmailAndPassword,
  signInWithPopup,
  signInWithRedirect,
  updateProfile,
} from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase/client";
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
    case "auth/email-already-in-use":
      return "That email already has an account. Try signing in instead.";
    case "auth/weak-password":
      return "Try a stronger password (at least 6 characters).";
    case "auth/invalid-email":
      return "Please enter a valid email address.";
    default:
      return err instanceof Error ? err.message : "Something went wrong. Please try again.";
  }
}

export default function SignupPage() {
  const router = useRouter();
  const { user, loading } = useAuth();

  const [name, setName] = useState("");
  const [role, setRole] = useState<"participant" | "researcher" | null>(null);
  const [email, setEmail] = useState("");
  const [institutionEmail, setInstitutionEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canSubmit = useMemo(() => {
    const isResearcher = role === "researcher";
    const isRoleValid = role !== null;
    const isNameValid = name.trim().length > 0;
    const isEmailValid = isValidEmail(email.trim());
    const isInstitutionEmailValid = !isResearcher || isValidEmail(institutionEmail.trim());
    const isPasswordValid = password.length >= 6;
    
    return isRoleValid && isNameValid && isEmailValid && isInstitutionEmailValid && isPasswordValid && !submitting;
  }, [role, name, email, institutionEmail, password, submitting]);

  useEffect(() => {
    if (!loading && user) router.replace("/");
  }, [loading, user, router]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const displayName = name.trim();
    if (!displayName) {
      setError("Please enter your name.");
      return;
    }

    const normalizedEmail = email.trim();
    if (!isValidEmail(normalizedEmail)) {
      setError("Please enter a valid email address.");
      return;
    }
    if (role === "researcher" && !isValidEmail(institutionEmail.trim())) {
      setError("Please enter a valid institution email.");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setSubmitting(true);
    try {
      const credential = await createUserWithEmailAndPassword(
        auth,
        normalizedEmail,
        password
      );

      if (displayName) {
        await updateProfile(credential.user, { displayName });
        console.log("User ID: ", credential.user.uid);
      }

      // Create user document with role
      await setDoc(doc(db, "users", credential.user.uid), {
        uid: credential.user.uid,
        email: normalizedEmail,
        displayName,
        role,
        ...(role === "researcher" ? { institutionEmail: institutionEmail.trim() } : {}),
        createdAt: new Date(),
      });

      router.push("/");
    } catch (err: unknown) {
      setError(friendlyAuthError(err));
    } finally {
      setSubmitting(false);
    }
  }

  async function onGoogleSignup() {
    setError(null);
    
    if (!role) {
      setError("Please select whether you are a Participant or Researcher.");
      return;
    }

    setSubmitting(true);
    try {
      const result = await signInWithPopup(auth, new GoogleAuthProvider());
      
      // Check if user doc exists, if not create it with selected role
      const userRef = doc(db, "users", result.user.uid);
      const userDoc = await getDoc(userRef);
      
      if (!userDoc.exists()) {
        await setDoc(userRef, {
            uid: result.user.uid,
            email: result.user.email,
            displayName: result.user.displayName,
            role: role,
            createdAt: new Date(),
        });
      }

      router.push("/");
    } catch (err: unknown) {
      const code = (err as { code?: string } | null)?.code;
      if (code === "auth/popup-blocked" || code === "auth/popup-closed-by-user") {
        try {
          // Note: Redirect flow is harder to intercept for role creation mid-flight 
          // without a custom intermediate page, but we'll try basic auth.
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

  return (
    <div className="space-y-6">
      <header className="space-y-1">
        <p className="text-xs font-semibold text-neutral-body">NeuroLens</p>
        <h1 className="text-2xl font-semibold tracking-tight text-ink">
          Create your account
        </h1>
        <p className="text-sm text-neutral-body">
          Keep logs local-first, with optional sync later.
        </p>
      </header>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle>Sign up</CardTitle>
          <CardDescription>Use Google or your email.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
              <div className="space-y-1">
                <span className="text-xs font-semibold text-neutral-body">
                  I am a...
                </span>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setRole("participant")}
                    className={`rounded-2xl border px-4 py-3 text-sm font-semibold transition ${
                      role === "participant"
                        ? "bg-primary text-white border-primary"
                        : "bg-white text-ink border-black/10 hover:bg-secondary"
                    }`}
                  >
                    Participant
                  </button>
                  <button
                    type="button"
                    onClick={() => setRole("researcher")}
                    className={`rounded-2xl border px-4 py-3 text-sm font-semibold transition ${
                      role === "researcher"
                        ? "bg-primary text-white border-primary"
                        : "bg-white text-ink border-black/10 hover:bg-secondary"
                    }`}
                  >
                    Researcher
                  </button>
                </div>
              </div>

            <button
              type="button"
              onClick={onGoogleSignup}
              disabled={submitting}
              className={`flex w-full items-center justify-center gap-2 rounded-2xl border px-5 py-4 text-base font-semibold shadow-sm transition disabled:cursor-not-allowed disabled:opacity-60 ${
                !role 
                ? "bg-neutral-100 text-neutral-400 border-transparent cursor-not-allowed" 
                : "bg-white text-ink border-black/10 hover:bg-secondary"
              }`}
              title={!role ? "Please select a role first" : "Sign up with Google"}
            >
              <GoogleMark className={`h-5 w-5 ${!role ? "opacity-50" : ""}`} />
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
                  Name
                </span>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  type="text"
                  autoComplete="name"
                  placeholder="Maya"
                  disabled={submitting}
                  className="w-full rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm text-ink shadow-sm outline-none transition placeholder:text-neutral-body focus:ring-2 focus:ring-primary/60"
                />
              </label>

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

              {role === "researcher" && (
                <label className="block space-y-1 animate-in fade-in slide-in-from-top-2 duration-300">
                  <span className="text-xs font-semibold text-neutral-body">
                    Institution Email
                  </span>
                  <input
                    value={institutionEmail}
                    onChange={(e) => setInstitutionEmail(e.target.value)}
                    type="email"
                    autoComplete="email"
                    inputMode="email"
                    placeholder="name@university.edu"
                    disabled={submitting}
                    className="w-full rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm text-ink shadow-sm outline-none transition placeholder:text-neutral-body focus:ring-2 focus:ring-primary/60"
                  />
                </label>
              )}

              <label className="block space-y-1">
                <span className="text-xs font-semibold text-neutral-body">
                  Password
                </span>
                <div className="relative">
                  <input
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    type={showPassword ? "text" : "password"}
                    autoComplete="new-password"
                    placeholder="At least 6 characters"
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
                <p className="text-xs text-neutral-body">
                  Minimum 6 characters. You can change this later.
                </p>
              </label>

              {error ? (
                <p className="rounded-2xl border border-black/10 bg-secondary px-3 py-2 text-sm text-ink">
                  {error}
                </p>
              ) : null}

              <button
                type="submit"
                disabled={!canSubmit}
                className="w-full rounded-2xl bg-primary px-5 py-4 text-base font-semibold text-white shadow-sm transition hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {submitting ? "Creating…" : "Create account"}
              </button>
            </form>
          </div>
        </CardContent>
        <CardFooter className="flex items-center justify-between">
          <p className="text-xs text-neutral-body">
            Already have an account?{" "}
            <Link href="/auth/login" className="font-semibold text-ink underline">
              Sign in
            </Link>
          </p>
        </CardFooter>
      </Card>

      <p className="text-xs text-neutral-body">
        By creating an account, you agree to keep things kind and respectful.
      </p>
    </div>
  );
}
