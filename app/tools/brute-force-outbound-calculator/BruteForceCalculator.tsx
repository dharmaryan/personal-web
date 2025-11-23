"use client";

import { useEffect, useMemo, useState } from "react";

const inputClassName =
  "w-full rounded-2xl border border-white/20 bg-white/60 px-4 py-3 text-slate-900 shadow-sm backdrop-blur transition focus:border-indigo-400 focus:bg-white focus:shadow-md focus:outline-none";

export default function BruteForceCalculator() {
  const [targetReplyRate, setTargetReplyRate] = useState<number>(10);
  const [targetCalls, setTargetCalls] = useState<number>(10);
  const [timelineWeeks, setTimelineWeeks] = useState<number>(12);
  const [repliesToCallsConversion, setRepliesToCallsConversion] = useState<number>(60);
  const [highlightTotal, setHighlightTotal] = useState(false);

  const { totalMessages, messagesPerWeek, messagesPerDay } = useMemo(() => {
    const replyRate = Math.max(targetReplyRate, 0) / 100;
    const conversionRate = Math.max(repliesToCallsConversion, 0) / 100;

    if (replyRate === 0 || conversionRate === 0) {
      return { totalMessages: 0, messagesPerWeek: 0, messagesPerDay: 0 };
    }

    const total = Math.ceil(targetCalls / (replyRate * conversionRate));
    const perWeek = timelineWeeks > 0 ? Math.ceil(total / timelineWeeks) : total;
    const perDay = Math.ceil(perWeek / 5);

    return { totalMessages: total, messagesPerWeek: perWeek, messagesPerDay: perDay };
  }, [repliesToCallsConversion, targetCalls, targetReplyRate, timelineWeeks]);

  useEffect(() => {
    setHighlightTotal(true);
    const timeout = setTimeout(() => setHighlightTotal(false), 250);
    return () => clearTimeout(timeout);
  }, [totalMessages]);

  const badgeLabel = useMemo(() => {
    if (totalMessages < 500) return "Chill";
    if (totalMessages <= 2000) return "Reasonable grind";
    return "Full psycho mode";
  }, [totalMessages]);

  const bars = useMemo(() => {
    const weeks = Math.max(1, Math.min(20, Math.ceil(timelineWeeks)));
    return Array.from({ length: weeks }, (_, index) => ({
      label: `Week ${index + 1}`,
      value: messagesPerWeek,
    }));
  }, [messagesPerWeek, timelineWeeks]);

  const maxBarValue = Math.max(...bars.map((bar) => bar.value), 1);

  return (
    <div className="relative overflow-hidden rounded-3xl border border-white/20 bg-white/70 p-6 shadow-xl backdrop-blur-lg sm:p-8">
      <div className="absolute inset-0 -z-10 bg-gradient-to-br from-white via-white/70 to-transparent" aria-hidden />
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Outbound Planner</p>
          <h2 className="text-xl font-semibold text-slate-900">Scenario Calculator</h2>
        </div>
        <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-medium text-indigo-600">Live</span>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <label className="space-y-2 text-sm font-medium text-slate-700">
          <span>Target reply rate (%)</span>
          <input
            type="number"
            min={0}
            className={inputClassName}
            value={targetReplyRate}
            onChange={(event) => setTargetReplyRate(Number(event.target.value) || 0)}
          />
        </label>
        <label className="space-y-2 text-sm font-medium text-slate-700">
          <span>Target calls</span>
          <input
            type="number"
            min={0}
            className={inputClassName}
            value={targetCalls}
            onChange={(event) => setTargetCalls(Number(event.target.value) || 0)}
          />
        </label>
        <label className="space-y-2 text-sm font-medium text-slate-700">
          <span>Timeline (weeks)</span>
          <input
            type="number"
            min={1}
            className={inputClassName}
            value={timelineWeeks}
            onChange={(event) => setTimelineWeeks(Number(event.target.value) || 0)}
          />
        </label>
        <label className="space-y-2 text-sm font-medium text-slate-700">
          <span>Replies-to-calls conversion (%)</span>
          <input
            type="number"
            min={0}
            className={inputClassName}
            value={repliesToCallsConversion}
            onChange={(event) => setRepliesToCallsConversion(Number(event.target.value) || 0)}
          />
        </label>
      </div>

      <div className="mt-8 rounded-2xl border border-slate-200 bg-white/90 p-6 shadow-inner">
        <p className="text-sm font-medium text-slate-600">Total messages required</p>
        <div
          className={`mt-2 text-4xl font-bold text-slate-900 transition duration-300 ease-out sm:text-5xl ${
            highlightTotal ? "scale-[1.02] opacity-100" : "opacity-95"
          }`}
        >
          {totalMessages.toLocaleString()}
        </div>
        <div className="mt-2 inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-slate-600">
          <span className="h-2 w-2 rounded-full bg-gradient-to-r from-amber-500 via-fuchsia-500 to-indigo-500" aria-hidden />
          <span>{badgeLabel}</span>
        </div>

        <dl className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="rounded-xl bg-slate-50 p-4">
            <dt className="text-xs uppercase tracking-wide text-slate-500">Messages / week</dt>
            <dd className="mt-1 text-lg font-semibold text-slate-900">
              {messagesPerWeek.toLocaleString()}
            </dd>
          </div>
          <div className="rounded-xl bg-slate-50 p-4">
            <dt className="text-xs uppercase tracking-wide text-slate-500">Messages / day</dt>
            <dd className="mt-1 text-lg font-semibold text-slate-900">
              {messagesPerDay.toLocaleString()}
            </dd>
          </div>
          <div className="rounded-xl bg-slate-50 p-4">
            <dt className="text-xs uppercase tracking-wide text-slate-500">Timeline</dt>
            <dd className="mt-1 text-lg font-semibold text-slate-900">{timelineWeeks} weeks</dd>
          </div>
        </dl>

        <div className="mt-6">
          <div className="mb-2 flex items-center justify-between text-xs font-medium text-slate-600">
            <span>Messages per week</span>
            <span>{messagesPerWeek.toLocaleString()} avg</span>
          </div>
          <div className="flex items-end gap-1.5 rounded-xl bg-slate-50 p-3">
            {bars.map((bar) => (
              <div key={bar.label} className="flex flex-1 flex-col items-center gap-2">
                <div
                  className="w-full rounded-full bg-gradient-to-t from-indigo-500 via-fuchsia-500 to-amber-400 shadow-sm transition"
                  style={{
                    height: `${Math.max(10, (bar.value / maxBarValue) * 100)}%`,
                  }}
                />
                <span className="text-[10px] uppercase tracking-wide text-slate-500">
                  {bar.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
