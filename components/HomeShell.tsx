"use client";

import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { useMemo, useState } from "react";

const tabs = [
  { id: "home", label: "Home" },
  { id: "about", label: "About" },
  { id: "projects", label: "Projects" },
  { id: "contact", label: "Contact" },
] as const;

type TabId = (typeof tabs)[number]["id"];

function TabButton({
  id,
  label,
  active,
  onSelect,
}: {
  id: TabId;
  label: string;
  active: boolean;
  onSelect: (id: TabId) => void;
}) {
  return (
    <button
      type="button"
      role="tab"
      id={`${id}-tab`}
      aria-selected={active}
      aria-controls={`${id}-panel`}
      tabIndex={active ? 0 : -1}
      onClick={() => onSelect(id)}
      className={`rounded-full px-4 py-2 text-sm font-semibold transition backdrop-blur focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-earth-olive ${
        active
          ? "bg-earth-olive text-warm-beige shadow-sm"
          : "text-charcoal/80 hover:bg-warm-beige/70"
      }`}
    >
      {label}
    </button>
  );
}

function TabPanel({ id, active, children }: { id: TabId; active: boolean; children: ReactNode }) {
  return (
    <div
      role="tabpanel"
      id={`${id}-panel`}
      aria-labelledby={`${id}-tab`}
      aria-hidden={!active}
      className={`absolute inset-0 transition-all duration-300 ease-out ${
        active
          ? "pointer-events-auto opacity-100 translate-y-0"
          : "pointer-events-none opacity-0 translate-y-2"
      }`}
    >
      {children}
    </div>
  );
}

export default function HomeShell() {
  const [activeTab, setActiveTab] = useState<TabId>("home");

  const headerCopy = useMemo(
    () => ({
      title: "RevOps @ Omni",
      subtitle:
        "Now learning about GTM, analytics and setting up financial systems in high-growth tech. Previously energy, transport & digital infrastructure investing and investment banking.",
      location: "Based in San Francisco, originally from Sydney.",
      linkedIn: "https://www.linkedin.com/in/ryandharma/",
      email: "mailto:ryandharma04@gmail.com",
    }),
    [],
  );

  return (
    <main className="relative flex min-h-screen items-stretch text-ink">
      <div
        className="pointer-events-none absolute inset-0 bg-gradient-to-br from-warm-beige/60 via-warm-lavender/50 to-white/50"
        aria-hidden
      />

      <div className="mx-auto flex w-full max-w-6xl flex-col gap-12 px-6 py-12 lg:px-10 lg:py-16">
        <header className="relative flex flex-col gap-6 overflow-hidden rounded-3xl border border-white/50 bg-warm-beige/80 p-6 shadow-[0_15px_55px_-35px_rgba(17,17,17,0.55)] backdrop-blur-lg">
          <div
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_25%_15%,rgba(218,215,241,0.45),transparent_32%),radial-gradient(circle_at_85%_40%,rgba(226,176,74,0.35),transparent_45%)]"
            aria-hidden
          />

            <div className="relative flex flex-wrap items-center justify-between gap-4">
              <div className="text-base font-semibold tracking-tight text-ink">RYAN DHARMA</div>
              <nav
                aria-label="Primary"
                className="rounded-full border border-white/50 bg-warm-beige/70 px-2 py-1 shadow-sm backdrop-blur"
              >
                <ul className="flex flex-wrap items-center gap-2" role="tablist">
                  {tabs.map((tab) => (
                    <li key={tab.id}>
                      <TabButton
                        id={tab.id}
                        label={tab.label}
                        active={activeTab === tab.id}
                        onSelect={setActiveTab}
                      />
                    </li>
                  ))}
                </ul>
              </nav>
            </div>

          <div className="relative grid gap-8 lg:grid-cols-[1.25fr_1fr] lg:items-center">
            <div className="space-y-6">
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-earth-olive/80">Hi, I'm Ryan.</p>
              <div className="space-y-4">
                <h1 className="text-4xl font-semibold leading-snug sm:text-5xl lg:text-6xl">{headerCopy.title}</h1>
                <p className="text-lg leading-relaxed text-charcoal/85">{headerCopy.subtitle}</p>
                <p className="text-base text-charcoal/75">{headerCopy.location}</p>
              </div>
              <div className="flex flex-wrap gap-3">
                <Link
                  href={headerCopy.linkedIn}
                  className="inline-flex items-center gap-2 rounded-full bg-brand-blue px-5 py-3 text-sm font-semibold text-warm-beige shadow-sm transition hover:-translate-y-[1px] hover:shadow-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-earth-olive"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Connect on LinkedIn
                </Link>
                <Link
                  href={headerCopy.email}
                  className="inline-flex items-center gap-2 rounded-full border border-earth-olive/20 bg-warm-beige/80 px-5 py-3 text-sm font-semibold text-earth-olive shadow-sm transition hover:-translate-y-[1px] hover:border-earth-olive/40 hover:text-earth-olive focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-earth-olive"
                >
                  Email me
                </Link>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl border border-white/60 bg-warm-beige/80 p-4 shadow-inner">
                  <p className="text-xs uppercase tracking-[0.25em] text-earth-olive/70">Current focus</p>
                  <p className="mt-2 text-sm text-charcoal/80">Revenue operations, GTM analytics, system design.</p>
                </div>
                <div className="rounded-2xl border border-white/60 bg-warm-beige/80 p-4 shadow-inner">
                  <p className="text-xs uppercase tracking-[0.25em] text-earth-olive/70">Previously</p>
                  <p className="mt-2 text-sm text-charcoal/80">I Squared Capital • Bank of America • University of Sydney</p>
                </div>
              </div>
            </div>

            <div className="relative flex justify-center lg:justify-end">
              <div
                className="absolute inset-y-4 -left-6 right-0 -z-10 rounded-[32px] bg-gradient-to-br from-warm-beige via-warm-lavender/80 to-white/70 shadow-[0_20px_60px_-35px_rgba(17,17,17,0.35)]"
                aria-hidden
              />
              <div className="relative w-full max-w-xs rounded-[28px] border border-white/60 bg-warm-beige/85 p-4 shadow-xl backdrop-blur">
                <div className="relative overflow-hidden rounded-2xl bg-warm-beige/60">
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
        </header>

        <section className="relative flex-1">
          <div className="relative overflow-hidden rounded-3xl border border-white/50 bg-warm-beige/85 p-6 shadow-[0_20px_65px_-45px_rgba(17,17,17,0.55)] backdrop-blur-md">
            <div
              className="absolute inset-0 pointer-events-none bg-gradient-to-b from-warm-beige/60 via-warm-lavender/40 to-transparent"
              aria-hidden
            />
            <div className="relative min-h-[520px]">
              <TabPanel id="home" active={activeTab === "home"}>
                <HomeTabSummary />
              </TabPanel>
              <TabPanel id="about" active={activeTab === "about"}>
                <AboutTabContent />
              </TabPanel>
              <TabPanel id="projects" active={activeTab === "projects"}>
                <ProjectsTabContent />
              </TabPanel>
              <TabPanel id="contact" active={activeTab === "contact"}>
                <ContactTabContent email={headerCopy.email} linkedIn={headerCopy.linkedIn} />
              </TabPanel>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

function HomeTabSummary() {
  return (
    <div className="grid h-full gap-6 md:grid-cols-[1.2fr_1fr] md:items-start">
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-ink">Ex-finance guy turned RevOps</h2>
        <p className="text-base text-charcoal/85">
          Ex-finance guy who went from PE into the world of start-ups. Love analysing, cleaning up and drawing insights from large datasets and building robust financial models.
        </p>
        <div className="grid gap-3 sm:grid-cols-2">
          <MiniCard title="Go-to-market" body="Building revenue systems for Omni" />
          <MiniCard title="Analytics" body="GTM reporting, pipeline hygiene, forecasting" />
          <MiniCard title="Finance" body="Former infra investor; IB before that" />
          <MiniCard title="Location" body="San Francisco • from Sydney" />
        </div>
      </div>
      <div className="space-y-4">
        <div className="rounded-2xl border border-white/60 bg-warm-beige/80 p-4 shadow-inner">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-earth-olive/70">Snapshot</p>
          <ul className="mt-3 space-y-2 text-sm text-charcoal/85">
            <li>• RevOps @ Omni</li>
            <li>• Previously PE @ I Squared Capital</li>
            <li>• Investment Banking @ Bank of America</li>
            <li>• Finance & Statistics @ University of Sydney</li>
          </ul>
        </div>
        <div className="rounded-2xl border border-white/60 bg-warm-beige/80 p-4 shadow-sm">
          <p className="text-sm font-semibold text-ink">Currently exploring</p>
          <p className="mt-2 text-sm text-charcoal/80">
            High-intensity outbound funnels, GTM instrumentation, and tightening feedback loops between finance, sales, and product.
          </p>
        </div>
      </div>
    </div>
  );
}

function MiniCard({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-2xl border border-white/60 bg-warm-beige/80 p-4 shadow-sm">
      <p className="text-xs uppercase tracking-[0.25em] text-earth-olive/70">{title}</p>
      <p className="mt-2 text-sm text-charcoal/85">{body}</p>
    </div>
  );
}

function AboutTabContent() {
  return (
    <div className="grid h-full gap-8 md:grid-cols-2 md:items-start">
      <div className="space-y-4">
        <h2 className="text-2xl font-semibold text-ink">About</h2>
        <p className="text-base leading-relaxed text-charcoal/85">
          Ex-finance guy who went from PE into the world of start-ups. Love analysing, cleaning up and drawing insights from large datasets and building robust financial models.
        </p>
        <div className="rounded-2xl border border-white/60 bg-warm-beige/80 p-4 shadow-sm">
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
    <div className="rounded-2xl border border-white/60 bg-warm-beige/80 p-4 shadow-sm">
      <p className="text-xs uppercase tracking-[0.25em] text-earth-olive/60">{time}</p>
      <h4 className="mt-2 text-lg font-semibold text-ink">{role}</h4>
      <p className="mt-2 text-sm text-charcoal/80">{description}</p>
    </div>
  );
}

function ProjectsTabContent() {
  return (
    <div className="flex h-full flex-col gap-6">
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-ink">Projects</h2>
          <p className="text-base text-charcoal/80">Case studies and tools I use to model messy go-to-market problems.</p>
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
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
      className="group block h-full rounded-3xl border border-white/60 bg-warm-beige/80 p-6 shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-earth-olive"
    >
      <div className="flex items-start justify-between gap-3">
        <h3 className="text-lg font-semibold text-ink group-hover:text-brand-blue">{title}</h3>
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

function ContactTabContent({ email, linkedIn }: { email: string; linkedIn: string }) {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-6 text-center">
      <div className="space-y-3">
        <h2 className="text-2xl font-semibold text-ink">Contact</h2>
        <p className="text-base text-charcoal/80">Always open to a chat!</p>
      </div>
      <div className="flex flex-wrap items-center justify-center gap-4">
        <Link
          href={email}
          className="inline-flex items-center rounded-full bg-brand-blue px-6 py-3 text-sm font-semibold text-warm-beige shadow-sm transition duration-200 hover:-translate-y-[1px] hover:shadow-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-earth-olive"
        >
          Email me
        </Link>
        <Link
          href={linkedIn}
          className="inline-flex items-center rounded-full border border-earth-olive/30 px-6 py-3 text-sm font-semibold text-earth-olive transition duration-200 hover:-translate-y-[1px] hover:bg-warm-beige/70 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-earth-olive"
          target="_blank"
          rel="noopener noreferrer"
        >
          LinkedIn
        </Link>
      </div>
      <p className="text-xs uppercase tracking-[0.2em] text-earth-olive/60">San Francisco • Sydney</p>
    </div>
  );
}
