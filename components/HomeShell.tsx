import Link from "next/link";

const navItems = [
  { id: "home", label: "Home" },
  { id: "about", label: "About" },
  { id: "projects", label: "Projects" },
  { id: "contact", label: "Contact" },
] as const;

const headerCopy = {
  title: "Systems thinking for high-velocity GTM teams.",
  subtitle:
    "RevOps @ Omni. Previously investing and investment banking across infrastructure and TMT. Building clean reporting, durable processes, and honest operating rhythms.",
  location: "Based in San Francisco, originally from Sydney.",
  linkedIn: "https://www.linkedin.com/in/ryandharma/",
  email: "mailto:ryandharma04@gmail.com",
};

const featureList = [
  {
    title: "GTM clarity",
    description: "Structured reporting that surfaces where coverage, conversion, or velocity are breaking.",
  },
  {
    title: "Outbound discipline",
    description: "Cadences, enablement, and instrumentation that make prospecting measurable and coachable.",
  },
  {
    title: "Operator friendly",
    description: "Documentation, playbooks, and dashboards that sales leaders actually adopt.",
  },
  {
    title: "Finance DNA",
    description: "Comfortable in spreadsheets, SQL, and board packs to keep revenue plans honest.",
  },
];

export default function HomeShell() {
  return (
    <main className="flex min-h-screen items-stretch text-ink">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-12 px-6 py-12 lg:px-10 lg:py-16">
        <section
          id="home"
          className="relative flex flex-col gap-10 overflow-hidden rounded-3xl border border-earth-olive/10 bg-[#f3eee5] p-8"
        >
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="text-base font-semibold tracking-tight text-ink">RYAN DHARMA</div>
            <nav aria-label="Primary" className="rounded-full border border-earth-olive/15 bg-white px-3 py-2">
              <ul className="flex flex-wrap items-center gap-2">
                {navItems.map((item) => (
                  <li key={item.id}>
                    <Link
                      href={`#${item.id}`}
                      className="rounded-full px-4 py-2 text-sm font-semibold focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-earth-olive"
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          </div>

          <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-start">
            <div className="space-y-6">
              <p className="text-xs font-semibold uppercase tracking-[0.32em] text-earth-olive/70">RevOps & analytics</p>
              <div className="space-y-3">
                <div className="inline-flex items-center gap-2 rounded-full border border-earth-olive/15 bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.28em] text-earth-olive">
                  <span className="h-2 w-2 rounded-full bg-earth-olive" aria-hidden />
                  {headerCopy.location}
                </div>
                <h1 className="text-4xl font-bold leading-tight text-ink lg:text-5xl">{headerCopy.title}</h1>
                <p className="text-lg leading-relaxed text-charcoal/90">{headerCopy.subtitle}</p>
              </div>

              <div className="space-y-2 rounded-2xl border border-earth-olive/10 bg-white p-4">
                {featureList.map((feature, idx) => (
                  <div
                    key={feature.title}
                    className={idx === 0 ? "space-y-1" : "space-y-1 border-t border-earth-olive/10 pt-3"}
                  >
                    <div className="text-sm font-semibold text-ink">{feature.title}</div>
                    <p className="text-sm text-charcoal/80">{feature.description}</p>
                  </div>
                ))}
              </div>

              <div className="flex flex-wrap items-center gap-3 text-sm font-semibold text-earth-olive">
                <Link
                  href={headerCopy.linkedIn}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center rounded-full bg-brand-blue px-5 py-3 text-sm font-semibold text-warm-beige focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-earth-olive"
                >
                  LinkedIn
                </Link>
                <Link
                  href={headerCopy.email}
                  className="inline-flex items-center rounded-full border border-earth-olive/20 bg-white px-5 py-3 text-sm font-semibold text-earth-olive focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-earth-olive"
                >
                  Email
                </Link>
              </div>
            </div>

            <div className="relative w-full rounded-3xl border border-earth-olive/10 bg-white p-6">
              <div className="mb-4 flex items-center justify-between">
                <div className="text-xs font-semibold uppercase tracking-[0.3em] text-earth-olive/70">Command pad</div>
                <span className="rounded-full border border-earth-olive/10 bg-warm-beige px-3 py-1 text-xs font-semibold text-earth-olive">RevOps</span>
              </div>
              <div className="space-y-3">
                <PromptRow title="Coach reps" body="Generate talking points for stalled deals by stage and persona." />
                <PromptRow title="Audit pipeline" body="Check coverage, conversion, and velocity across segments." />
                <PromptRow title="Deploy cadences" body="Draft a prospecting plan with touch counts by channel." />
              </div>
              <div className="mt-6 rounded-2xl border border-earth-olive/10 bg-warm-beige p-4 text-sm text-charcoal/90">
                <p className="font-semibold text-ink">How I help</p>
                <p className="mt-2 leading-relaxed">
                  Pair structured analytics with practical enablement so sales leaders know where to focus each week.
                </p>
              </div>
              <Doodle className="pointer-events-none absolute -bottom-6 right-6 h-16 w-16 text-earth-olive/50" />
            </div>
          </div>
        </section>

        <section id="about" className="relative overflow-hidden rounded-3xl border border-earth-olive/10 bg-white p-8">
          <div className="relative grid gap-10 md:grid-cols-2 md:items-start">
            <div className="space-y-4">
              <h2 className="text-2xl font-semibold text-ink">About</h2>
              <p className="text-base leading-relaxed text-charcoal/85">
                Ex-finance guy who went from PE into the world of start-ups. Love analysing, cleaning up and drawing insights from large datasets and building robust financial models.
              </p>
              <div className="rounded-2xl border border-earth-olive/10 bg-warm-beige p-4">
                <p className="text-sm font-semibold text-ink">How I work</p>
                <p className="mt-2 text-sm text-charcoal/80">
                  Calm under pressure, obsessed with clarity, and happiest when partnering with sales leaders to debug bottlenecks and build transparent reporting.
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-2xl font-semibold text-ink">Experience</h3>
              <div className="space-y-4">
                <ExperienceCard
                  time="2025 – Present"
                  role="Revenue Operations @ Omni"
                  description="Learning about building GTM systems and revenue strategy for a Series B analytics start-up."
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
                  role="Finance & Statistics @ University of Sydney"
                  description="Did an exchange at Wharton, met some cool people."
                />
              </div>
            </div>
          </div>
        </section>

        <section id="projects" className="relative overflow-hidden rounded-3xl border border-earth-olive/10 bg-white p-8">
          <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-2xl font-semibold text-ink">Projects</h2>
              <p className="text-base text-charcoal/80">Case studies and tools I use to model messy go-to-market problems.</p>
            </div>
          </div>
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <ProjectCard
              title="Brute-force sales funnel methodology for getting employed"
              description="The arcane art of getting a job and also succeeding in various high-volume, low-probability processes."
              href="/case-studies/brute-forcing-move"
            />
            <ProjectCard
              title="Brute-Force Outbound Calculator"
              description="Turns the 14-week job hunt funnel into an interactive calculator for planning outbound volume."
              href="/tools/brute-force-outbound-calculator"
            />
          </div>
        </section>

        <section id="contact" className="relative overflow-hidden rounded-3xl border border-earth-olive/10 bg-white p-8 text-center">
          <div className="flex flex-col items-center gap-6">
            <div className="space-y-3">
              <h2 className="text-2xl font-semibold text-ink">Contact</h2>
              <p className="text-base text-charcoal/80">Always open to a chat!</p>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <Link
                href={headerCopy.email}
                className="inline-flex items-center rounded-full bg-brand-blue px-6 py-3 text-sm font-semibold text-warm-beige focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-earth-olive"
              >
                Email me
              </Link>
              <Link
                href={headerCopy.linkedIn}
                className="inline-flex items-center rounded-full border border-earth-olive/30 px-6 py-3 text-sm font-semibold text-earth-olive focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-earth-olive"
                target="_blank"
                rel="noopener noreferrer"
              >
                LinkedIn
              </Link>
            </div>
            <p className="text-xs uppercase tracking-[0.2em] text-earth-olive/60">San Francisco • Sydney</p>
          </div>
        </section>
      </div>
    </main>
  );
}

function PromptRow({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-2xl border border-earth-olive/10 bg-warm-beige px-4 py-3">
      <div className="flex items-start gap-3">
        <div className="mt-1 flex h-8 w-8 items-center justify-center rounded-xl border border-earth-olive/20 bg-white text-sm font-semibold text-earth-olive">
          →
        </div>
        <div className="space-y-1">
          <p className="text-sm font-semibold text-ink">{title}</p>
          <p className="text-sm text-charcoal/80">{body}</p>
        </div>
      </div>
    </div>
  );
}

function Doodle({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 120 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <path
        d="M12 90c18-6 28-22 36-38 8-16 16-30 32-28 16 2 18 18 10 28-8 10-26 12-40 8-14-4-24-14-26-26C22 20 46 8 66 12c20 4 36 22 38 42 2 20-8 40-28 48-20 8-46 4-58-8"
        stroke="currentColor"
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="86" cy="40" r="6" stroke="currentColor" strokeWidth="3" />
    </svg>
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
    <div className="rounded-2xl border border-earth-olive/10 bg-white p-4">
      <p className="text-xs uppercase tracking-[0.25em] text-earth-olive/60">{time}</p>
      <h4 className="mt-2 text-lg font-semibold text-ink">{role}</h4>
      <p className="mt-2 text-sm text-charcoal/80">{description}</p>
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
      className="block h-full rounded-3xl border border-earth-olive/10 bg-white p-6 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-earth-olive"
    >
      <div className="flex items-start justify-between gap-3">
        <h3 className="text-lg font-semibold text-ink">{title}</h3>
        <span className="text-sm text-charcoal/60" aria-hidden>
          →
        </span>
      </div>
      <p className="mt-3 text-sm text-charcoal/80">{description}</p>
      <div className="mt-4 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-earth-olive/70">
        <span className="h-2 w-2 rounded-full bg-earth-olive" aria-hidden />
        <span>View</span>
      </div>
    </Link>
  );
}
