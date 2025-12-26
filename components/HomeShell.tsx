import Link from "next/link";

const headerCopy = {
  name: "RYAN DHARMA",
  title: "Revenue Operations at Omni",
  subtitle:
    "Making people confident in their decision making by interpreting and wrangling big datasets. Previous investing and investment banking experience across infrastructure and TMT.",
  linkedIn: "https://www.linkedin.com/in/ryandharma/",
  email: "mailto:ryandharma04@gmail.com",
};

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
                time="2025 – Present"
                role="Revenue Operations @ Omni"
                description="Building and managing GTM systems and revenue strategy for a Series B analytics start-up."
              />
              <ExperienceCard
                time="2025 – 2026"
                role="Finance Domain Expert @ Mercor"
                description="Part of the global effort to provide robust financial models to leading AI labs to automate out junior investment banking work."
              />
              <ExperienceCard
                time="2024 – 2025"
                role="Private Equity @ I Squared Capital"
                description="First junior hire in the Sydney office of a $50B private equity fund, making and managing investments in core-plus & value-add infrastructure."
              />
              <ExperienceCard
                time="2023 – 2024"
                role="Investment Banking @ Bank of America"
                description="Made fancy slide decks and pretty Excels for publicly listed TMT clients :)"
              />
              <ExperienceCard
                time="2019 – 2022"
                role="Statistics & Finance @ University of Sydney"
                description="Did an exchange at Wharton, met some cool people."
              />
            </div>
          </div>
        </section>

        <section id="projects" className="rounded-3xl border border-zinc-200 bg-white p-8">
          <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-2xl font-semibold text-zinc-950">Projects</h2>
              <p className="text-base text-zinc-600">Documenting passion projects and what I've been up to lately.</p>
            </div>
          </div>
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <ProjectCard
              title="Brute-force sales funnel methodology for getting employed"
              description="How I sent out ~6,400 emails over the course of 3 months to brute force my way into the US."
              href="/case-studies/brute-forcing-move"
            />
            <ProjectCard
              title="An ex-financier’s view on why tech ships faster than finance"
              description="Intuitively and quantitatively explaining why things work so much more quickly in tech."
              href="/case-studies/output-comparison"
            />
            <ProjectCard
              title="Contract Returns Calculator"
              description="A lightweight contract-level unit economics & returns model."
              href="/case-studies/contract-returns-calculator"
            />
            <DownloadCard
              title="Simplified Fundraising & Runway Model"  
              description="Simplified illustrative model for projecting burn, runway, and dilution across fundraising scenarios."
              href="/Fundraising%20%26%20Runway%20Model.xlsx"
            />
            <DownloadCard
              title="Detailed Annual Planning & Fundraising Model"  
              description="A detailed strategic finance case study I developed including NTM monthly projections, multi-stage fundraising & valuation and build-out of SaaS metrics."
              href="/Project%20Oracle%20-%20Illustrative%20Annual%20Planning%20and%20Fundraising%20Model.xlsx"
            />
          </div>
        </section>

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

function ProjectCard({
  title,
  description,
  href,
}: {
  title: string;
  description: string;
  href: string;
}) {
  return (
    <Link
      href={href}
      className="block h-full rounded-3xl border border-zinc-200 bg-white p-6 hover:border-blue-500"
    >
      <div className="flex items-start justify-between gap-3">
        <h3 className="text-lg font-semibold text-zinc-950">{title}</h3>
        <span className="text-sm text-zinc-500" aria-hidden>
          →
        </span>
      </div>
      <p className="mt-3 text-sm text-zinc-700">{description}</p>
      <div className="mt-4 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-zinc-600">
        <span className="h-2 w-2 rounded-full bg-zinc-900" aria-hidden />
        <span>View</span>
      </div>
    </Link>
  );
}

function DownloadCard({
  title,
  description,
  href,
}: {
  title: string;
  description: string;
  href: string;
}) {
  return (
    <Link
      href={href}
      className="block h-full rounded-3xl border border-zinc-200 bg-white p-6 hover:border-blue-500"
    >
      <div className="flex items-start justify-between gap-3">
        <h3 className="text-lg font-semibold text-zinc-950">{title}</h3>
        <span className="text-sm text-zinc-500" aria-hidden>
          →
        </span>
      </div>
      <p className="mt-3 text-sm text-zinc-700">{description}</p>
      <div className="mt-4 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-zinc-600">
        <span className="h-2 w-2 rounded-full bg-zinc-900" aria-hidden />
        <span>Download</span>
      </div>
    </Link>
  );
}
