import type { Metadata } from "next";
import BruteForceCalculator from "./BruteForceCalculator";

export const metadata: Metadata = {
  title: "Brute-Force Outbound Calculator | Ryan Dharma",
  description:
    "Estimate outbound volume needed to hit your reply and call targets with a simple interactive calculator.",
};

export default function BruteForceOutboundCalculatorPage() {
  return (
    <main className="bg-warm-beige text-ink">
      <div className="mx-auto flex max-w-6xl flex-col gap-12 px-6 py-16 lg:px-8 lg:py-20">
        <div className="grid gap-12 md:grid-cols-2 md:items-center">
          <div className="space-y-6">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-earth-olive/80">
              Tools
            </p>
            <h1 className="text-3xl font-semibold leading-tight sm:text-4xl lg:text-5xl">
              Brute-Force Outbound Calculator
            </h1>
            <p className="text-lg text-charcoal/85 sm:text-xl">
              Model the outbound volume you need to hit your reply and call goals.
              Adjust conversion assumptions and timelines to plan your next sprint.
            </p>
            <div className="inline-flex items-center gap-3 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm text-charcoal/80">
              <span className="h-2 w-2 rounded-full bg-emerald-500" aria-hidden />
              <span>Interactive and ready to use</span>
            </div>
          </div>

          <div className="relative">
            <BruteForceCalculator />
          </div>
        </div>
      </div>
    </main>
  );
}
