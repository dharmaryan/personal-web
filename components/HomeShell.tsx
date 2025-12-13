import Image from "next/image";
import Link from "next/link";

const navItems = [
  { id: "home", label: "Home" },
  { id: "about", label: "About" },
  { id: "projects", label: "Projects" },
  { id: "contact", label: "Contact" },
] as const;

const headerCopy = {
  title: "RevOps @ Omni",
  subtitle:
    "Now learning about GTM, analytics and setting up financial systems in high-growth tech. Previously energy, transport & digital infrastructure investing and investment banking.",
  location: "Based in San Francisco, originally from Sydney.",
  linkedIn: "https://www.linkedin.com/in/ryandharma/",
  email: "mailto:ryandharma04@gmail.com",
};

export default function HomeShell() {
  return (
    <main className="flex min-h-screen items-stretch text-ink">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-12 px-6 py-12 lg:px-10 lg:py-16">
        <section id="home" className="relative flex flex-col gap-6 overflow-hidden rounded-3xl border border-white/50 bg-warm-beige p-6 shadow-sm">
          <div className="relative flex flex-wrap items-center justify-between gap-4">
            <div className="text-base font-semibold tracking-tight text-ink">RYAN DHARMA</div>
            <nav aria-label="Primary" className="rounded-full border border-white/50 bg-warm-beige px-2 py-1 shadow-sm">
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

          <div className="relative grid gap-8 lg:grid-cols-[1.25fr_1fr] lg:items-center">
            <div className="space-y-6">
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-earth-olive/80">Hi, I'm Ryan.</p>
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-2 text-sm font-medium uppercase tracking-[0.24em] text-earth-olive/70">
                    <span className="inline-flex items-center gap-2 rounded-full bg-earth-olive/10 px-3 py-1 text-earth-olive">
                      <span className="h-2 w-2 rounded-full bg-earth-olive" aria-hidden />
                      {headerCopy.location}
                    </span>
                    <span>•</span>
                    <span>Open to interesting problems</span>
                  </div>
                  <h1 className="text-3xl font-bold leading-tight text-ink lg:text-4xl">{headerCopy.title}</h1>
                  <p className="text-base leading-relaxed text-charcoal/90">{headerCopy.subtitle}</p>
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
                    className="inline-flex items-center rounded-full border border-earth-olive/20 bg-warm-beige px-5 py-3 text-sm font-semibold text-earth-olive focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-earth-olive"
                  >
                    Email
                  </Link>
                </div>

                <div className="grid gap-3 md:grid-cols-2">
                  <div className="rounded-2xl border border-white/60 bg-warm-beige p-4 shadow-sm">
                    <p className="text-xs uppercase tracking-[0.25em] text-earth-olive/70">Currently</p>
                    <p className="mt-2 text-sm text-charcoal/80">RevOps @ Omni</p>
                  </div>
                  <div className="rounded-2xl border border-white/60 bg-warm-beige p-4 shadow-sm">
                    <p className="text-xs uppercase tracking-[0.25em] text-earth-olive/70">Building</p>
                    <p className="mt-2 text-sm text-charcoal/80">Outbound funnels, GTM analytics, and scalable revenue ops.</p>
                  </div>
                </div>
                <div className="rounded-2xl border border-white/60 bg-warm-beige p-4 shadow-sm">
                  <p className="text-xs uppercase tracking-[0.25em] text-earth-olive/70">Previously</p>
                  <p className="mt-2 text-sm text-charcoal/80">I Squared Capital • Bank of America • University of Sydney</p>
                </div>
              </div>
            </div>

            <div className="relative flex justify-center lg:justify-end">
              <div className="relative w-full max-w-xs rounded-[28px] border border-white/60 bg-warm-beige p-4 shadow-sm">
                <div className="relative overflow-hidden rounded-2xl bg-warm-beige">
                  <Image
                    src="/ryan-headshot.png"
                    alt="Ryan Dharma headshot"
                    width={640}
                    height={640}
                    className="h-auto w-full rounded-2xl object-cover"
                    priority
                  />
                  <div
                    className="pointer-events-none absolute inset-0 bg-gradient-to-t from-earth-olive/10 to-transparent"
                    aria-hidden
                  />
                </div>
                <div className="mt-4 space-y-2 text-center">
                  <p className="text-sm font-semibold text-ink">Ryan Dharma</p>
                  <p className="text-xs uppercase tracking-[0.3em] text-earth-olive/70">RevOps @ Omni</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="about" className="relative overflow-hidden rounded-3xl border border-white/50 bg-warm-beige p-6 shadow-sm">
          <div className="relative grid gap-8 md:grid-cols-2 md:items-start">
            <div className="space-y-4">
              <h2 className="text-2xl font-semibold text-ink">About</h2>
              <p className="text-base leading-relaxed text-charcoal/85">
                Ex-finance guy who went from PE into the world of start-ups. Love analysing, cleaning up and drawing insights from large datasets and building robust financial models.
              </p>
              <div className="rounded-2xl border border-white/60 bg-warm-beige p-4 shadow-sm">
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

        <section id="projects" className="relative overflow-hidden rounded-3xl border border-white/50 bg-warm-beige p-6 shadow-sm">
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

        <section id="contact" className="relative overflow-hidden rounded-3xl border border-white/50 bg-warm-beige p-6 text-center shadow-sm">
          <div className="flex flex-col items-center gap-6">
            <div className="space-y-3">
              <h2 className="text-2xl font-semibold text-ink">Contact</h2>
              <p className="text-base text-charcoal/80">Always open to a chat!</p>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <Link
                href={headerCopy.email}
                className="inline-flex items-center rounded-full bg-brand-blue px-6 py-3 text-sm font-semibold text-warm-beige shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-earth-olive"
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
    <div className="rounded-2xl border border-white/60 bg-warm-beige p-4 shadow-sm">
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
      className="block h-full rounded-3xl border border-white/60 bg-warm-beige p-6 shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-earth-olive"
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
