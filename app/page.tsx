import Image from "next/image";
import Link from "next/link";

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
        className="border-b border-slate-200 bg-gradient-to-br from-[#E3F2FD] via-[#F7FAFF] to-white"
        id="home"
      >
        <div className="mx-auto max-w-5xl px-6 py-24 sm:py-32">
          <div className="flex flex-col items-center gap-12 text-center lg:flex-row lg:items-center lg:justify-between lg:text-left">
            <div className="max-w-2xl">
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-slate-500">
                Hi, I'm Ryan.
              </p>
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
            <div className="flex justify-center lg:justify-end">
              <Image
                src="/ryan-dharma-headshot.jpg"
                alt="Ryan Dharma"
                width={180}
                height={180}
                className="rounded-full shadow-md"
                priority
              />
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
              Ex-finance guy who went from PE into start-up land. Love messing around with big datasets, making numbers look really clean and building defendable, robust models.
            </p>
          </div>
        </div>
      </section>

      <section className="border-b border-slate-200 bg-white" id="experience">
        <div className="mx-auto max-w-3xl px-6 py-20">
          <h2 className="text-sm font-semibold uppercase tracking-[0.3em] text-slate-500">
            Experience
          </h2>
          <div className="mt-10 space-y-10 text-slate-700">
            <div>
              <p className="text-xs uppercase tracking-[0.25em] text-slate-400">2025 – Present</p>
              <h3 className="mt-2 text-xl font-semibold text-slate-900">Revenue Operations @ Omni</h3>
              <p className="mt-2 text-base">
                Learning about building GTM systems and revenue strategy for a Series B analytics start-up.
              </p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.25em] text-slate-400">2024 – 2025</p>
              <h3 className="mt-2 text-xl font-semibold text-slate-900">Private Equity @ I Squared Capital</h3>
              <p className="mt-2 text-base">
                First junior hire in the Sydney office of a $50B private equity fund, making and managing investments in core-plus & value-add infrastructure.
              </p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.25em] text-slate-400">2023 – 2024</p>
              <h3 className="mt-2 text-xl font-semibold text-slate-900">Investment Banking @ Bank of America</h3>
              <p className="mt-2 text-base">
                Made fancy slide decks and pretty Excels for publicly listed TMT clients :)
              </p>
            </div>
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
            Always open to a chat!
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <Link
              href="mailto:ryandharma04@gmail.com"
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
          November 2025
        </div>
      </footer>
    </main>
  );
}
