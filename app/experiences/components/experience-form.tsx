"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase/client";
import { getAuth } from "firebase/auth";



const symptomOptions = [
  "Executive dysfunction",
  "Pain",
  "Fatigue",
  "Sensory overload",
  "Intrusive thoughts",
  "Social burnout",
  "Emotional intensity",
  "Difficulty with routines",
  "Anxiety or constant worry",
];

const aboutOptions = [
  "Myself",
  "Daughter",
  "Grandmother",
  "Mother",
  "Relative",
  "Other",
  "Prefer not to say",
];

export function ExperienceForm({ onSuccess }: { onSuccess?: () => void }) {
  const [about, setAbout] = useState("");
  const [symptoms, setSymptoms] = useState<string[]>([]);
  const [emotionRegulation, setEmotionRegulation] = useState("");
  const [misunderstood, setMisunderstood] = useState("");
  const [notes, setNotes] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [title, setTitle] = useState("");
const [ageType, setAgeType] = useState(""); // "range" | "exact"
const [ageRange, setAgeRange] = useState("");
const [ageExact, setAgeExact] = useState("");
const auth = getAuth();
const currentUser = auth.currentUser;

  function toggleSymptom(symptom: string) {
    setSymptoms((prev) =>
      prev.includes(symptom)
        ? prev.filter((s) => s !== symptom)
        : [...prev, symptom],
    );
  }

  async function onSubmit() {
    if (!about || symptoms.length === 0) {
      alert("Please fill out at least who this is about and select symptoms.");
      return;
    }
    try {
      await addDoc(collection(db, "experiences"), {
        title,
        about,
        age:
          ageType === "exact"
            ? ageExact
            : ageType === "range"
              ? ageRange
              : "prefer-not-to-say",
        symptoms,
        emotionRegulation,
        misunderstood,
        notes,
        createdAt: serverTimestamp(),
        userId: currentUser ? currentUser.uid : null,
        });

      setSubmitted(true);

      // optional: clear form
      setTitle("");
      setAbout("");
      setAgeType("");
      setAgeRange("");
      setAgeExact("");
      setSymptoms([]);
      setEmotionRegulation("");
      setMisunderstood("");
      setNotes("");
      
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error("Error saving experience:", error);
    }
  }

  return (
    <div className="space-y-5">
      {/* Title */}
      <Card>
        <CardHeader>
          <CardTitle>Give this experience a title</CardTitle>
          <p className="text-xs text-neutral-body">
            Optional — a short phrase that captures the experience
          </p>
        </CardHeader>
        <CardContent>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Burnout that never went away"
            className="w-full rounded-2xl border border-black/10 bg-white p-3 text-sm text-ink shadow-sm focus:ring-2 focus:ring-primary/60"
          />
        </CardContent>
      </Card>

      {/* Who is this about */}
      <Card>
        <CardHeader>
          <CardTitle>Who is this about?</CardTitle>
        </CardHeader>
        <CardContent>
          <select
            value={about}
            onChange={(e) => setAbout(e.target.value)}
            className="w-full rounded-2xl border border-black/10 bg-white p-3 text-sm text-ink shadow-sm focus:ring-2 focus:ring-primary/60"
          >
            <option value="">Select one</option>
            {aboutOptions.map((option) => (
              <option key={option}>{option}</option>
            ))}
          </select>
        </CardContent>
      </Card>

      {/* Age */}
      <Card>
        <CardHeader>
          <CardTitle>Age</CardTitle>
          <p className="text-xs text-neutral-body">
            You can choose a range or enter an exact age
          </p>
        </CardHeader>
        <CardContent className="space-y-3">
          {/* Age type selector */}
          <select
            value={ageType}
            onChange={(e) => {
              setAgeType(e.target.value);
              setAgeRange("");
              setAgeExact("");
            }}
            className="w-full rounded-2xl border border-black/10 bg-white p-3 text-sm text-ink shadow-sm focus:ring-2 focus:ring-primary/60"
          >
            <option value="">Select one</option>
            <option value="range">Age range</option>
            <option value="exact">Exact age</option>
            <option value="prefer-not">Prefer not to say</option>
          </select>

          {/* Age range */}
          {ageType === "range" && (
            <select
              value={ageRange}
              onChange={(e) => setAgeRange(e.target.value)}
              className="w-full rounded-2xl border border-black/10 bg-white p-3 text-sm text-ink shadow-sm focus:ring-2 focus:ring-primary/60"
            >
              <option value="">Select age range</option>
              <option value="under-12">Under 12</option>
              <option value="13-17">13–17</option>
              <option value="18-24">18–24</option>
              <option value="25-34">25–34</option>
              <option value="35-44">35–44</option>
              <option value="45-54">45–54</option>
              <option value="55-64">55–64</option>
              <option value="65+">65+</option>
            </select>
          )}

          {/* Exact age */}
          {ageType === "exact" && (
            <input
              type="number"
              min={0}
              max={120}
              value={ageExact}
              onChange={(e) => setAgeExact(e.target.value)}
              placeholder="Enter age"
              className="w-full rounded-2xl border border-black/10 bg-white p-3 text-sm text-ink shadow-sm focus:ring-2 focus:ring-primary/60"
            />
          )}
        </CardContent>
      </Card>

      {/* Symptoms */}
      <Card>
        <CardHeader>
          <CardTitle>What symptoms are present?</CardTitle>
          <p className="text-xs text-neutral-body">Select all that apply</p>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {symptomOptions.map((symptom) => {
              const active = symptoms.includes(symptom);
              return (
                <button
                  key={symptom}
                  type="button"
                  onClick={() => toggleSymptom(symptom)}
                  className={
                    "rounded-full px-4 py-2 text-sm font-medium transition focus:outline-none focus:ring-2 focus:ring-primary/60" +
                    (active
                      ? " bg-primary text-white"
                      : " bg-secondary text-ink hover:bg-secondary/70")
                  }
                  aria-pressed={active}
                >
                  {symptom}
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Emotional regulation */}
      <Card>
        <CardHeader>
          <CardTitle>Do emotions feel hard to regulate?</CardTitle>
        </CardHeader>
        <CardContent>
          <select
            value={emotionRegulation}
            onChange={(e) => setEmotionRegulation(e.target.value)}
            className="w-full rounded-2xl border border-black/10 bg-white p-3 text-sm text-ink shadow-sm focus:ring-2 focus:ring-primary/60"
          >
            <option value="">Choose an option</option>
            <option value="often">Often</option>
            <option value="sometimes">Sometimes</option>
            <option value="rarely">Rarely</option>
            <option value="not-sure">Not sure</option>
          </select>
        </CardContent>
      </Card>

      {/* Misunderstanding */}
      <Card>
        <CardHeader>
          <CardTitle>
            Have these experiences been misunderstood or dismissed?
          </CardTitle>
        </CardHeader>
        <CardContent>
          <select
            value={misunderstood}
            onChange={(e) => setMisunderstood(e.target.value)}
            className="w-full rounded-2xl border border-black/10 bg-white p-3 text-sm text-ink shadow-sm focus:ring-2 focus:ring-primary/60"
          >
            <option value="">Choose an option</option>
            <option value="by-professionals">Yes, by professionals</option>
            <option value="by-family">Yes, by family or friends</option>
            <option value="both">Yes, by both</option>
            <option value="no">No</option>
          </select>
        </CardContent>
      </Card>

      {/* Notes */}
      <Card>
        <CardHeader>
          <CardTitle>Anything else you want to share?</CardTitle>
        </CardHeader>
        <CardContent>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={4}
            placeholder="Optional — share context, patterns, or delays in care"
            className="w-full resize-none rounded-2xl border border-black/10 bg-white p-4 text-sm leading-6 text-ink shadow-sm focus:ring-2 focus:ring-primary/60"
          />
        </CardContent>
      </Card>

      {/* Submit */}
      <Card>
        <CardContent className="pt-4 space-y-2">
          <button
            type="button"
            onClick={onSubmit}
            className="w-full rounded-2xl bg-primary px-5 py-4 text-base font-semibold text-white shadow-sm transition hover:brightness-95 focus:ring-2 focus:ring-primary/60"
          >
            Share Anonymously
          </button>

          {submitted && (
            <p className="text-center text-xs font-medium text-accent">
              Thank you. Your experience helps close research gaps.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
