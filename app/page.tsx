import Image from "next/image";
import Link from "next/link";

const experiences = [
  {
    title: "Revenue Operations @ Omni",
    period: "2025 – Present",
    outcome: "Built RevOps foundations for an AI-native analytics company.",
  },
  {
    title: "Private Equity @ I Squared Capital",
    period: "2024 – 2025",
    outcome: "Evaluated infrastructure investments and developed financial models.",
  },
  {
    title: "Investment Banking @ Bank of America",
    period: "2023 – 2024",
    outcome: "Supported M&A and capital markets transactions across TMT.",
  },
];

const personalHighlights = [
  {
    heading: "How I work",
    body: "Systems-first, detail-oriented, and anchored by a clear operating cadence.",
  },
  {
    heading: "Outside of work",
    body: "Lifting, running, and exploring cities and coffee spots wherever I land.",
  },
  {
    heading: "What I'm exploring",
    body: "AI GTM tooling and the rise of operator-led startups.",
  },
];

export default function HomePage() {
  return (
    <main className="flex-1">
      <section
        className="border-b border-slate-200 bg-gradient-to-br from-[#FFE5EC] via-[#FFF0F5] to-white"
        id="home"
      >
        <div className="mx-auto max-w-5xl px-6 py-24 sm:py-32">
          <div className="flex flex-col items-center text-center lg:items-start lg:text-left">
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-slate-500">
              Hi, I'm Ryan.
            </p>
            <Image
              src="/ryan-dharma-headshot.jpg"
              alt="Ryan Dharma"
              width={160}
              height={160}
              className="rounded-full mx-auto mb-6"
              priority
            />
            <h1 className="mt-6 text-4xl font-semibold text-slate-900 sm:text-5xl">
              RevOps @ Omni
            </h1>
            <p className="mt-6 text-lg text-slate-600">
              Designing GTM, analytics and financial systems for high-growth software. Previously energy, transport &
              digital infrastructure investing and investment banking.
            </p>
            <p className="mt-4 text-base text-slate-600">
              Based in San Francisco, originally from Sydney.
            </p>
            <div className="mt-10 flex flex-wrap justify-center gap-4 lg:justify-start">
              <Link
                href="https://www.linkedin.com/in/ryandharma/"
                className="inline-flex items-center rounded-full bg-brand-blue px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-blue/90"
                target="_blank"
                rel="noopener noreferrer"
              >
                Connect on LinkedIn
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-slate-200 bg-slate-50" id="about">
        <div className="mx-auto max-w-3xl px-6 py-20">
          <h2 className="text-sm font-semibold uppercase tracking-[0.3em] text-slate-500">
            About
          </h2>
          <div className="mt-6 space-y-5 text-slate-700">
            <p>
              2023–2024 – Investment Banking @ Bank of America (TMT)
            </p>
            <p>
              2024–2025 – Private Equity @ I Squared Capital
            </p>
            <p>
              2025–Present – RevOps @ Omni
            </p>
            <p>
              I moved from finance into tech to be closer to building. My edge is translating complex financial and operational data into analytics systems that unlock growth for go-to-market teams.
            </p>
          </div>
        </div>
      </section>

      <section className="border-b border-slate-200 bg-white" id="experience">
        <div className="mx-auto max-w-3xl px-6 py-20">
          <h2 className="text-sm font-semibold uppercase tracking-[0.3em] text-slate-500">
            Experience
          </h2>
          <div className="mt-10 space-y-10">
            {experiences.map((experience, index) => (
              <article key={experience.title} className="relative pl-8">
                <span className="absolute left-0 top-2 flex h-full w-8 justify-center">
                  <span className="relative flex h-full w-px justify-center bg-slate-200">
                    <span className="absolute -left-[5px] h-2.5 w-2.5 rounded-full border border-white bg-brand-blue" />
                  </span>
                </span>
                <p className="text-xs uppercase tracking-[0.25em] text-slate-400">
                  {experience.period}
                </p>
                <h3 className="mt-2 text-xl font-semibold text-slate-900">
                  {experience.title}
                </h3>
                <p className="mt-2 text-base text-slate-600">{experience.outcome}</p>
                {index === experiences.length - 1 && (
                  <span className="absolute left-[15px] bottom-0 h-4 w-[1px] bg-white" aria-hidden />
                )}
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="border-b border-slate-200 bg-slate-50" id="personal">
        <div className="mx-auto max-w-4xl px-6 py-20">
          <h2 className="text-sm font-semibold uppercase tracking-[0.3em] text-slate-500">
            Personal
          </h2>
          <div className="mt-10 grid gap-10 md:grid-cols-3">
            {personalHighlights.map((item) => (
              <div key={item.heading} className="space-y-3">
                <h3 className="text-lg font-semibold text-slate-900">
                  {item.heading}
                </h3>
                <p className="text-base text-slate-600">{item.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white" id="contact">
        <div className="mx-auto max-w-3xl px-6 py-20">
          <h2 className="text-sm font-semibold uppercase tracking-[0.3em] text-slate-500">
            Contact
          </h2>
          <p className="mt-6 text-lg text-slate-600">
            I'm always excited to meet founders, GTM leaders, and AI teams building the next wave of software companies.
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <Link
              href="mailto:ryan@placeholder.com"
              className="inline-flex items-center rounded-full bg-brand-blue px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-blue/90"
            >
              Email me
            </Link>
            <Link
              href="https://www.linkedin.com/in/ryandharma"
              className="inline-flex items-center rounded-full border border-brand-blue px-6 py-3 text-sm font-semibold text-brand-blue transition hover:bg-brand-blue/10"
              target="_blank"
              rel="noopener noreferrer"
            >
              LinkedIn
            </Link>
          </div>
        </div>
      </section>

      <footer className="border-t border-slate-200 bg-slate-50">
        <div className="mx-auto max-w-4xl px-6 py-8 text-sm text-slate-500">
          © 2025 Ryan Dharma · Built with Next.js & Inter
        </div>
      </footer>
    </main>
  );
}
