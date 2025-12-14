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
    <main className="flex min-h-screen items-stretch bg-white text-zinc-900">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-12 px-6 py-12 lg:px-10 lg:py-16">
        <section
          id="home"
          className="flex flex-col gap-8 rounded-3xl border border-zinc-200 bg-white p-10"
        >
          <div className="space-y-4">
            <p className="text-sm font-semibold uppercase tracking-[0.28em] text-zinc-600">{headerCopy.name}</p>
            <h1 className="text-5xl font-semibold leading-tight text-zinc-950 lg:text-6xl">{headerCopy.title}</h1>
            <p className="text-lg leading-relaxed text-zinc-700 lg:text-xl">{headerCopy.subtitle}</p>
          </div>
          <div className="flex flex-wrap items-center gap-3 text-sm font-semibold text-zinc-900">
            <Link
              href={headerCopy.email}
              className="inline-flex items-center rounded-md border border-zinc-300 bg-white px-5 py-3"
            >
              Email me
            </Link>
            <Link
              href={headerCopy.linkedIn}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center rounded-md border border-zinc-900 bg-zinc-900 px-5 py-3 text-white"
            >
              LinkedIn
            </Link>
          </div>
        </section>

        <section id="about" className="rounded-3xl border border-zinc-200 bg-white p-8">
          <div className="mx-auto max-w-3xl space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-semibold text-zinc-950">About</h2>
              <span className="text-sm text-zinc-500">Experience</span>
            </div>
            <div className="space-y-4">
              <ExperienceCard
                time="2025 – Present"
                role="Revenue Operations @ Omni"
                description="Building and managing GTM systems and revenue strategy for a Series B analytics start-up."
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
              <p className="text-base text-zinc-600">Case studies and tools I use to model messy go-to-market problems.</p>
            </div>
          </div>
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <ProjectCard
              title="Brute-force sales funnel methodology for getting employed"
              description="Sending out ~6,400 emails over the course of 4 months to brute force my way into the US."
              href="/case-studies/brute-forcing-move"
            />
            <ProjectCard
              title="Brute-Force Outbound Calculator"
              description="Turns the 14-week job hunt funnel into an interactive calculator for planning outbound volume."
              href="/tools/brute-force-outbound-calculator"
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
      className="block h-full rounded-3xl border border-zinc-200 bg-white p-6"
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
