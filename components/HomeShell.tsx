import Link from "next/link";
import ProjectsSection, { type ProjectItem } from "./ProjectsSection";

const headerCopy = {
  name: "RYAN DHARMA",
  title: "Revenue Operations at Omni",
  subtitle:
    "Building revenue systems and infrastructure for high-growth companies. Former private equity investor and investment banker.",
  linkedIn: "https://www.linkedin.com/in/ryandharma/",
  email: "mailto:ryandharma04@gmail.com",
};

const projects: ProjectItem[] = [
  {
    title: "Brute-force sales funnel methodology for getting employed",
    description: "How I manufactured momentum out of nothing and sent out ~6,400 emails over the course of 3 months to brute force my way into the US.",
    href: "/case-studies/brute-forcing-move",
  },
  {
    title: "Shipping under a non-negotiable deadline with broken inputs",
    description: "Stabilizing a critical model so a live transaction process could continue.",
    href: "/case-studies/shipping-fast",
  },
  {
    title: "An ex-financier’s view on why tech ships faster than finance",
    description: "Intuitively and quantitatively explaining why things work so much more quickly in tech.",
    href: "/case-studies/output-comparison",
  },
  {
    title: "Contract-level returns calculator",
    description: "A decision tool to replace brittle spreadsheet-based contract modelling.",
    href: "/case-studies/contract-returns-calculator",
  },
  {
    title: "Simplified fundraising & runway model",
    description: "Simplified illustrative model for projecting burn, runway, and dilution across fundraising scenarios.",
    href: "/Fundraising%20%26%20Runway%20Model.xlsx",
    variant: "download",
  },
  {
    title: "Detailed annual planning & fundraising model",
    description:
      "A detailed strategic finance case study I developed including NTM monthly projections, multi-stage fundraising & valuation and build-out of SaaS metrics.",
    href: "/Project%20Oracle%20-%20Illustrative%20Annual%20Planning%20and%20Fundraising%20Model.xlsx",
    variant: "download",
  },
];

export default function HomeShell() {
  return (
    <main className="flex min-h-screen items-stretch bg-zinc-50 text-zinc-900">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-12 px-6 py-12 lg:px-10 lg:py-16">
        {/* Tighten hero padding and vertical rhythm to match the compact layout. */}
        <section
          id="home"
          className="flex flex-col gap-6 rounded-3xl border border-zinc-200 bg-white p-8 lg:p-9"
        >
          <div className="space-y-3"> {/* Reduce label/headline/subheading spacing for a tighter hero stack. */}
            <p className="text-sm font-semibold uppercase tracking-[0.28em] text-zinc-600">{headerCopy.name}</p>
            {/* Reduce hero headline size/leading to match the compact reference. */}
            <h1 className="text-4xl font-semibold leading-snug text-zinc-950 lg:text-5xl">{headerCopy.title}</h1>
            <p className="text-lg leading-relaxed text-zinc-700 lg:text-xl">{headerCopy.subtitle}</p>
          </div>
          {/* Tighten button row spacing to reduce hero height. */}
          <div className="flex flex-wrap items-center gap-2 text-sm font-semibold text-zinc-900">
            {/* Slightly smaller button padding keeps CTAs balanced in the compact hero. */}
            <Link
              href={headerCopy.email}
              className="inline-flex items-center rounded-md border border-zinc-300 bg-white px-4 py-2.5 hover:border-blue-500 hover:text-blue-600"
            >
              Email me
            </Link>
            <Link
              href={headerCopy.linkedIn}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center rounded-md border border-zinc-900 bg-zinc-900 px-4 py-2.5 text-white hover:border-blue-600 hover:bg-blue-600"
            >
              LinkedIn
            </Link>
          </div>
        </section>

        <section id="about" className="rounded-3xl border border-zinc-200 bg-white p-8">
          <div className="mx-auto max-w-3xl space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-semibold text-zinc-950">Experience</h2>
            </div>
            <div className="space-y-4">
              <ExperienceCard
                time="2025 – Present | San Francisco"
                role="Revenue Operations @ Omni"
                description="Building and managing GTM systems and revenue strategy for a Series B analytics start-up."
              />
              <ExperienceCard
                time="2025 – 2026 | Remote (Concurrent, Project-Based)"
                role="Finance Domain Expert @ Mercor"
                description="Part of the global effort to provide robust financial models to leading AI labs to automate out junior investment banking work."
              />
              <ExperienceCard
                time="2024 – 2025 | Sydney"
                role="Private Equity @ I Squared Capital"
                description="First junior hire in the Sydney office of a $50B private equity fund, making and managing investments in core-plus & value-add infrastructure."
              />
              <ExperienceCard
                time="2023 – 2024 | Sydney"
                role="Investment Banking @ Bank of America"
                description="Made fancy slide decks and pretty Excels for publicly listed tech, media and telecom clients :)"
              />
              <ExperienceCard
                time="2019 – 2022 | Sydney"
                role="Statistics & Finance @ University of Sydney"
                description="Did an exchange at Wharton, met some cool people."
              />
            </div>
          </div>
        </section>

        <ProjectsSection items={projects} />

        <div id="contact" className="h-4" aria-hidden />
      </div>
    </main>
  );
}

function ExperienceCard({
  time,
  role,
  description,
}: {
  time: string;
  role: string;
  description: string;
}) {
  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-5">
      <p className="text-xs uppercase tracking-[0.22em] text-zinc-500">{time}</p>
      <h4 className="mt-2 text-lg font-semibold text-zinc-950">{role}</h4>
      <p className="mt-2 text-sm text-zinc-700">{description}</p>
    </div>
  );
}
