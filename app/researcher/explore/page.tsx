// app/researcher/explore/page.tsx
"use client";

import { useMemo } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type PieSlice = {
  label: string;
  value: number;
  className: string; // tailwind text token (SVG uses currentColor)
};

type PhaseKey = "menstrual" | "follicular" | "ovulatory" | "luteal";

type PeriodMoodPoint = {
  day: string; // label (Mon/Tue/etc.)
  mood: number; // 1..5
  phase: PhaseKey;
};

function clamp01(n: number) {
  if (n < 0) return 0;
  if (n > 1) return 1;
  return n;
}

function normalizeSlices(slices: PieSlice[]) {
  const sum = slices.reduce((a, s) => a + (Number.isFinite(s.value) ? s.value : 0), 0);
  if (sum <= 0) return slices.map((s) => ({ ...s, value: 0 }));
  return slices.map((s) => ({ ...s, value: s.value / sum }));
}

function polarToCartesian(cx: number, cy: number, r: number, angleRad: number) {
  return { x: cx + r * Math.cos(angleRad), y: cy + r * Math.sin(angleRad) };
}

function arcPath(cx: number, cy: number, r: number, startRad: number, endRad: number) {
  const start = polarToCartesian(cx, cy, r, startRad);
  const end = polarToCartesian(cx, cy, r, endRad);
  const largeArc = endRad - startRad > Math.PI ? 1 : 0;
  return `M ${cx} ${cy} L ${start.x} ${start.y} A ${r} ${r} 0 ${largeArc} 1 ${end.x} ${end.y} Z`;
}

function PieChart({
  title,
  slices,
  subtitle,
}: {
  title: string;
  slices: PieSlice[];
  subtitle?: string;
}) {
  const size = 280; // slightly bigger now that cards are wider
  const cx = size / 2;
  const cy = size / 2;
  const r = 120;

  const normalized = useMemo(() => normalizeSlices(slices), [slices]);

  const paths = useMemo(() => {
    let a = -Math.PI / 2;
    return normalized.map((s) => {
      const start = a;
      const end = a + s.value * 2 * Math.PI;
      a = end;
      return { ...s, start, end };
    });
  }, [normalized]);

  const topLine = useMemo(() => {
    return normalized.map((s) => `${s.label}: ${Math.round(s.value * 100)}%`).join(" • ");
  }, [normalized]);

  return (
    <div className="space-y-4">
      <div>
        <p className="text-sm font-semibold text-ink">{title}</p>
        {subtitle ? <p className="mt-1 text-xs text-neutral-body">{subtitle}</p> : null}
        <p className="mt-2 text-xs text-neutral-body">{topLine}</p>
      </div>

      <div className="flex items-center justify-center">
        <div className="w-full rounded-2xl border border-black/10 bg-white p-4 shadow-sm">
          <div className="flex flex-col items-center gap-4 lg:flex-row lg:items-start">
            <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="block shrink-0">
              <circle cx={cx} cy={cy} r={r} fill="rgba(0,0,0,0.06)" />
              {paths.map((p) => (
                <path
                  key={p.label}
                  d={arcPath(cx, cy, r, p.start, p.end)}
                  className={p.className}
                  fill="currentColor"
                  opacity={0.95}
                />
              ))}
              <circle cx={cx} cy={cy} r={70} fill="white" />
              <circle cx={cx} cy={cy} r={70} stroke="rgba(0,0,0,0.08)" strokeWidth={1} fill="none" />
            </svg>


          </div>
        </div>
      </div>
    </div>
  );
}

function AxesFrame({
  width,
  height,
  padding,
  xLabel,
  yLabel,
  children,
  xTicks,
  yTicks,
}: {
  width: number;
  height: number;
  padding: number;
  xLabel: string;
  yLabel: string;
  xTicks: { x: number; label: string }[];
  yTicks: { y: number; label: string }[];
  children: React.ReactNode;
}) {
  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="h-[300px] w-full">
      {yTicks.map((t, i) => (
        <line key={"gy" + i} x1={padding} x2={width - padding} y1={t.y} y2={t.y} stroke="rgba(0,0,0,0.08)" />
      ))}
      {xTicks.map((t, i) => (
        <line key={"gx" + i} y1={padding} y2={height - padding} x1={t.x} x2={t.x} stroke="rgba(0,0,0,0.06)" />
      ))}

      <line x1={padding} x2={padding} y1={padding} y2={height - padding} stroke="rgba(0,0,0,0.22)" />
      <line x1={padding} x2={width - padding} y1={height - padding} y2={height - padding} stroke="rgba(0,0,0,0.22)" />

      {yTicks.map((t, i) => (
        <text key={"yl" + i} x={padding - 8} y={t.y + 4} textAnchor="end" fontSize="10" fill="rgba(0,0,0,0.55)">
          {t.label}
        </text>
      ))}
      {xTicks.map((t, i) => (
        <text key={"xl" + i} x={t.x} y={height - padding + 18} textAnchor="middle" fontSize="10" fill="rgba(0,0,0,0.55)">
          {t.label}
        </text>
      ))}

      <text x={width / 2} y={height - 6} textAnchor="middle" fontSize="11" fill="rgba(0,0,0,0.70)">
        {xLabel}
      </text>
      <text
        x={12}
        y={height / 2}
        textAnchor="middle"
        fontSize="11"
        fill="rgba(0,0,0,0.70)"
        transform={`rotate(-90 12 ${height / 2})`}
      >
        {yLabel}
      </text>

      {children}
    </svg>
  );
}

function SleepVsMoodScatter({
  points,
}: {
  points: { sleepHours: number; mood: number; day: string }[];
}) {
  const width = 760;
  const height = 360;
  const padding = 52;

  const xMin = 4;
  const xMax = 10;
  const yMin = 1;
  const yMax = 5;

  function x(v: number) {
    const t = (v - xMin) / (xMax - xMin);
    return padding + clamp01(t) * (width - padding * 2);
  }
  function y(v: number) {
    const t = (v - yMin) / (yMax - yMin);
    return padding + (1 - clamp01(t)) * (height - padding * 2);
  }

  const xTicks = useMemo(() => [4, 5, 6, 7, 8, 9, 10].map((v) => ({ x: x(v), label: String(v) })), []);
  const yTicks = useMemo(() => [1, 2, 3, 4, 5].map((v) => ({ y: y(v), label: String(v) })), []);

  const trend = useMemo(() => {
    const n = points.length;
    if (n < 2) return null;
    const xs = points.map((p) => p.sleepHours);
    const ys = points.map((p) => p.mood);
    const meanX = xs.reduce((a, b) => a + b, 0) / n;
    const meanY = ys.reduce((a, b) => a + b, 0) / n;
    let num = 0;
    let den = 0;
    for (let i = 0; i < n; i++) {
      num += (xs[i] - meanX) * (ys[i] - meanY);
      den += (xs[i] - meanX) * (xs[i] - meanX);
    }
    const m = den === 0 ? 0 : num / den;
    const b = meanY - m * meanX;
    return { m, b };
  }, [points]);

  const linePts = useMemo(() => {
    if (!trend) return null;
    const x1v = xMin;
    const x2v = xMax;
    const y1v = trend.m * x1v + trend.b;
    const y2v = trend.m * x2v + trend.b;
    return { x1: x(x1v), y1: y(y1v), x2: x(x2v), y2: y(y2v) };
  }, [trend]);

  return (
    <div className="w-full overflow-hidden rounded-2xl border border-black/10 bg-white shadow-sm">
      <AxesFrame width={width} height={height} padding={padding} xLabel="Sleep (hours)" yLabel="Mood (1–5)" xTicks={xTicks} yTicks={yTicks}>
        {linePts ? (
          <line
            x1={linePts.x1}
            y1={linePts.y1}
            x2={linePts.x2}
            y2={linePts.y2}
            className="text-primary"
            stroke="currentColor"
            strokeWidth={3}
            strokeLinecap="round"
            opacity={0.65}
          />
        ) : null}

        {points.map((p) => (
          <g key={p.day}>
            <circle cx={x(p.sleepHours)} cy={y(p.mood)} r={6} className="text-primary" fill="currentColor" opacity={0.9} />
            <circle cx={x(p.sleepHours)} cy={y(p.mood)} r={7} stroke="rgba(0,0,0,0.12)" strokeWidth={1} fill="none" />
            <text x={x(p.sleepHours)} y={y(p.mood) - 12} textAnchor="middle" fontSize="10" fill="rgba(0,0,0,0.55)">
              {p.day}
            </text>
          </g>
        ))}
      </AxesFrame>
    </div>
  );
}

/** Period vs Mood chart with phase bands + line */
function PeriodVsMoodChart({ points }: { points: PeriodMoodPoint[] }) {
  const width = 760;
  const height = 360;
  const padding = 52;

  const yMin = 1;
  const yMax = 5;

  function x(i: number) {
    const t = points.length <= 1 ? 0 : i / (points.length - 1);
    return padding + clamp01(t) * (width - padding * 2);
  }

  function y(v: number) {
    const t = (v - yMin) / (yMax - yMin);
    return padding + (1 - clamp01(t)) * (height - padding * 2);
  }

  const yTicks = useMemo(() => [1, 2, 3, 4, 5].map((v) => ({ y: y(v), label: String(v) })), []);
  const xTicks = useMemo(() => points.map((p, i) => ({ x: x(i), label: p.day })), [points]);

  const phaseFill: Record<PhaseKey, string> = {
    menstrual: "rgba(236, 72, 153, 0.10)",
    follicular: "rgba(59, 130, 246, 0.08)",
    ovulatory: "rgba(16, 185, 129, 0.08)",
    luteal: "rgba(245, 158, 11, 0.10)",
  };

  const bands = useMemo(() => {
    if (!points.length) return [];
    const out: { startIdx: number; endIdx: number; phase: PhaseKey }[] = [];
    let start = 0;
    for (let i = 1; i <= points.length; i++) {
      const prev = points[i - 1]?.phase;
      const next = points[i]?.phase;
      if (i === points.length || next !== prev) {
        out.push({ startIdx: start, endIdx: i - 1, phase: prev });
        start = i;
      }
    }
    return out;
  }, [points]);

  const linePath = useMemo(() => {
    if (points.length === 0) return "";
    return points.map((p, i) => `${i === 0 ? "M" : "L"} ${x(i)} ${y(p.mood)}`).join(" ");
  }, [points]);

  return (
    <div className="space-y-3">
      <div className="w-full overflow-hidden rounded-2xl border border-black/10 bg-white shadow-sm">
        <AxesFrame width={width} height={height} padding={padding} xLabel="Day" yLabel="Mood (1–5)" xTicks={xTicks} yTicks={yTicks}>
          {bands.map((b, idx) => {
            const x1 = x(b.startIdx);
            const x2 = x(b.endIdx);
            const left = idx === 0 ? padding : x1 - 10;
            const right = idx === bands.length - 1 ? width - padding : x2 + 10;
            const top = padding;
            const h = height - padding * 2;
            return (
              <rect key={`${b.phase}-${idx}`} x={left} y={top} width={Math.max(0, right - left)} height={h} fill={phaseFill[b.phase]} />
            );
          })}

          <path d={linePath} className="text-primary" stroke="currentColor" strokeWidth={3} fill="none" opacity={0.78} />

          {points.map((p, i) => (
            <g key={p.day}>
              <circle cx={x(i)} cy={y(p.mood)} r={6} className="text-primary" fill="currentColor" opacity={0.9} />
              <circle cx={x(i)} cy={y(p.mood)} r={7} stroke="rgba(0,0,0,0.12)" strokeWidth={1} fill="none" />
            </g>
          ))}
        </AxesFrame>
      </div>

      <div className="grid gap-2 sm:grid-cols-2">
        <div className="rounded-2xl border border-black/10 bg-white p-3 text-sm shadow-sm">
          <p className="font-semibold text-ink">Phase bands</p>
          <p className="text-xs text-neutral-body">Background shading helps contextualize mood shifts across phases.</p>
        </div>
        <div className="rounded-2xl border border-black/10 bg-white p-3 text-sm shadow-sm">
          <p className="font-semibold text-ink">Mood trajectory</p>
          <p className="text-xs text-neutral-body">Line + points show the day-to-day relationship clearly.</p>
        </div>
      </div>
    </div>
  );
}

export default function ResearcherExplorePatternsPage() {
  const sleepMood = [
    { day: "Mon", sleepHours: 6.2, mood: 2.8 },
    { day: "Tue", sleepHours: 7.4, mood: 3.2 },
    { day: "Wed", sleepHours: 5.6, mood: 2.5 },
    { day: "Thu", sleepHours: 8.1, mood: 3.8 },
    { day: "Fri", sleepHours: 7.0, mood: 3.4 },
    { day: "Sat", sleepHours: 8.6, mood: 4.1 },
    { day: "Sun", sleepHours: 7.9, mood: 3.9 },
  ];

  const periodMood: PeriodMoodPoint[] = [
    { day: "Mon", mood: 2.6, phase: "menstrual" },
    { day: "Tue", mood: 2.9, phase: "menstrual" },
    { day: "Wed", mood: 3.1, phase: "follicular" },
    { day: "Thu", mood: 3.4, phase: "follicular" },
    { day: "Fri", mood: 3.8, phase: "ovulatory" },
    { day: "Sat", mood: 3.5, phase: "luteal" },
    { day: "Sun", mood: 3.0, phase: "luteal" },
  ];

  const socialBurnoutMaskingSlices: PieSlice[] = [
    { label: "Both", value: 41, className: "text-primary" },
    { label: "Masking only", value: 18, className: "text-accent" },
    { label: "Burnout only", value: 16, className: "text-neutral-body" },
    { label: "Neither", value: 25, className: "text-ink" },
  ];

  const diagnosisSlices: PieSlice[] = [
    { label: "Diagnosed", value: 32, className: "text-primary" },
    { label: "Self-diagnosed", value: 45, className: "text-accent" },
    { label: "Undiagnosed", value: 23, className: "text-neutral-body" },
  ];

  return (
    <div className="space-y-6">
      <header className="flex items-end justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight text-ink">Explore Patterns</h1>
          <p className="text-sm text-neutral-body">
            Visual analytics built from aggregated logging and experience signals.
          </p>
        </div>
        <Link
          href="/researcher"
          className="rounded-2xl bg-secondary px-4 py-2 text-sm font-semibold text-ink shadow-sm transition hover:brightness-95 focus:outline-none focus:ring-2 focus:ring-primary/60"
        >
          Back
        </Link>
      </header>

      <div className="grid gap-6 md:grid-cols-12">
        {/* TOP ROW: now 2 wide cards */}
        <Card className="md:col-span-6">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Percentage</CardTitle>
          </CardHeader>
          <CardContent>
            <PieChart
              title="Users with Social Burnout + Masking"
              subtitle="Breakdown of overlap and non-overlap."
              slices={socialBurnoutMaskingSlices}
            />
          </CardContent>
        </Card>

        <Card className="md:col-span-6">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Sleep vs Mood</CardTitle>
          </CardHeader>
          <CardContent>
            <SleepVsMoodScatter points={sleepMood} />
          </CardContent>
        </Card>

        {/* BOTTOM ROW */}
        <Card className="md:col-span-7">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Period vs Mood</CardTitle>
          </CardHeader>
          <CardContent>
            <PeriodVsMoodChart points={periodMood} />
          </CardContent>
        </Card>

        <Card className="md:col-span-5">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Diagnosis breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <PieChart
              title="Women diagnosed / self-diagnosed / undiagnosed"
              subtitle="Distribution across diagnosis status."
              slices={diagnosisSlices}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
