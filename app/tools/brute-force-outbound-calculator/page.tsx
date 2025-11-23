import type { Metadata } from "next";
import BruteForceCalculator from "./BruteForceCalculator";

export const metadata: Metadata = {
  title: "Brute-Force Outbound Calculator | Ryan Dharma",
  description:
    "Estimate outbound volume needed to hit your reply and call targets with a simple interactive calculator.",
};

export default function BruteForceOutboundCalculatorPage() {
  return (
    <main className="bg-gradient-to-r from-amber-400 via-fuchsia-500 to-indigo-500 text-white">
      <div className="mx-auto flex max-w-6xl flex-col gap-12 px-6 py-16 lg:px-8 lg:py-20">
        <div className="grid gap-12 md:grid-cols-2 md:items-center">
          <div className="space-y-6">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-white/80">
              Tools
            </p>
            <h1 className="text-3xl font-semibold leading-tight sm:text-4xl lg:text-5xl">
              Brute-Force Outbound Calculator
            </h1>
            <p className="text-lg text-white/80 sm:text-xl">
              Model the outbound volume you need to hit your reply and call goals.
              Adjust conversion assumptions and timelines to plan your next sprint.
            </p>
            <div className="inline-flex items-center gap-3 rounded-full bg-white/10 px-4 py-2 text-sm text-white/80 backdrop-blur">
              <span className="h-2 w-2 rounded-full bg-emerald-300" aria-hidden />
              <span>Interactive and ready to use</span>
            </div>
          </div>

          <div className="relative">
            <div className="absolute inset-0 -z-10 translate-x-6 translate-y-6 rounded-3xl bg-white/10 blur-2xl" aria-hidden />
            <BruteForceCalculator />
          </div>
        </div>
      </div>
    </main>
  );
}
