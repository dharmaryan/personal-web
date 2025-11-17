import Image from 'next/image'
import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'A brute force sales funnel methodology for getting employed',
  description:
    'A case study on building a job-search outbound engine using Apollo, Gmail, and ChatGPT to break into the US tech industry.',
}

export default function ApolloFunnelCaseStudy() {
  return (
    <main className='flex-1 bg-white text-slate-700'>
      <section className='bg-gradient-to-b from-slate-50 to-slate-100'>
        <div className='mx-auto max-w-3xl px-6 py-20'>
          <p className='text-sm font-semibold uppercase tracking-[0.3em] text-slate-500'>Case Study</p>
          <h1 className='mt-6 text-4xl font-semibold text-slate-900'>
            A brute force sales funnel methodology for getting employed
          </h1>
          <p className='mt-6 text-lg text-slate-600'>
            How I built an outbound job-search engine with Apollo, Gmail, and ChatGPT to create a repeatable pipeline of
            conversations, and eventually land a RevOps role in the US.
          </p>
          <Link
            href='/'
            className='mt-8 inline-flex items-center gap-2 text-sm font-semibold text-slate-600 underline-offset-4 transition hover:text-slate-900'
          >
            <span aria-hidden='true'>←</span>
            Back to main site
          </Link>
        </div>
      </section>

      <div className='border-t border-slate-200/60 my-12'></div>

      <section className='bg-white py-16 sm:py-24'>
        <div className='mx-auto max-w-3xl px-6'>
          <article>
            <section>
              <h2 className='mt-12 mb-4 text-3xl font-semibold text-slate-900 first:mt-0'>
                June: A Stalled Career Path Meets an Eight-Year Goal
              </h2>
              <p className='mt-4 text-base leading-7 text-slate-600'>I had wanted to move to the US for almost a decade, and I couldn’t stop thinking about it.</p>
              <p className='mt-4 text-base leading-7 text-slate-600'>
                A few failed private equity interview processes later, I was in limbo – didn’t know how to move to the US and my
                current employer wasn’t budging.
              </p>
              <p className='mt-4 text-base leading-7 text-slate-600'>
                At some point, it became clear that the only real option was to take control of the situation myself. Similarly, I
                wanted to try out an operating role in tech (investing had made me feel like I wasn’t really learning how to run
                companies).
              </p>
              <p className='mt-4 text-base leading-7 text-slate-600'>So I put in my 3 months’ notice and left.</p>
              <p className='mt-4 text-base leading-7 text-slate-600'>Three months to get employed.</p>
            </section>

            <section>
              <h3 className='mt-10 mb-3 text-2xl font-semibold text-slate-900'>The Breakthrough: Discovering Apollo + Gmail + ChatGPT</h3>
              <p className='mt-4 text-base leading-7 text-slate-600'>What began as an attempt to manually craft cold emails quickly became a system.</p>
              <p className='mt-4 text-base leading-7 text-slate-600'>Apollo handled volume and deliverability.</p>
              <p className='mt-4 text-base leading-7 text-slate-600'>ChatGPT generated the templates I needed.</p>
              <p className='mt-4 text-base leading-7 text-slate-600'>Five newly created emails (warmed across the way) became the backbone for my cold emails.</p>
              <p className='mt-4 text-base leading-7 text-slate-600'>
                Together, they became a scalable outbound engine, something close to having a small SDR team attached to my job
                search.
              </p>
              <figure className='my-8 space-y-4'>
                <Image
                  src='/figure1-email-template.png'
                  alt='Cold email template screenshot'
                  width={1200}
                  height={742}
                  className='rounded-2xl border border-slate-200 shadow-lg'
                />
                <figcaption className='text-sm text-slate-500'>Figure 1: A template I used – on placeholder names, of course.</figcaption>
              </figure>
            </section>

            <section>
              <h3 className='mt-10 mb-3 text-2xl font-semibold text-slate-900'>System Design</h3>
              <p className='mt-4 text-base leading-7 text-slate-600'>
                The intention here was to build a scalable system in the same way that an operator would: build fast, trust the
                numbers, and iterate when things don’t work. My IB / PE background made the process feel familiar – high volume,
                structured communication, clean data, and moving fast under pressure.
              </p>
              <h4 className='mt-10 text-xl font-semibold text-slate-900'>Target Criteria</h4>
              <ul className='mt-4 list-disc space-y-2 pl-5 text-base leading-7 text-slate-600'>
                <li>Series A – C startups</li>
                <li>Founded post-2020 / 2021 (hypergrowth signals)</li>
                <li>Backed by credible investors (Sequoia, a16z, ICONIQ, and big tech venture arms)</li>
                <li>Contacts who were decision-makers, not recruiters</li>
                <li>Role focus on strategy, operations, finance, and GTM / sales</li>
              </ul>
              <h4 className='mt-10 text-xl font-semibold text-slate-900'>Operating Cadence</h4>
              <ul className='mt-4 list-disc space-y-2 pl-5 text-base leading-7 text-slate-600'>
                <li>Peak volume of ~250 emails/day</li>
                <li>10–12 intro calls/week</li>
                <li>20 minutes prep per intro call</li>
                <li>Iterated sequences whenever reply rate &lt;10%</li>
                <li>Weekends reserved for recovery</li>
                <li>Gmail used to maintain organic deliverability</li>
              </ul>
              <h4 className='mt-10 text-xl font-semibold text-slate-900'>Conversion Rules</h4>
              <ul className='mt-4 list-disc space-y-2 pl-5 text-base leading-7 text-slate-600'>
                <li>If role open, ask immediately for a referral</li>
                <li>If no role open, build relationship and stay in touch</li>
                <li>Many “no role” conversations converted later</li>
              </ul>
              <figure className='my-8 space-y-4'>
                <Image
                  src='/figure2-sequences.png'
                  alt='Screenshot of outbound sequences'
                  width={1200}
                  height={742}
                  className='rounded-2xl border border-slate-200 shadow-lg'
                />
                <figcaption className='text-sm text-slate-500'>Figure 2: Some sequences I prepared.</figcaption>
              </figure>
            </section>

            <section>
              <h2 className='mt-12 mb-4 text-3xl font-semibold text-slate-900 first:mt-0'>July: Gaining Traction</h2>
              <p className='mt-4 text-base leading-7 text-slate-600'>
                After a few days of near-zero movement, I woke up one morning to three call acceptances. I began scheduling 6–8 a.m.
                calls before my 70-hour work week and slowly accumulated early interview processes. At the same time, my previous
                employer was working to move me to the US. This process stalled by a full month in between interview rounds. That was
                clarifying. I dropped out and doubled down on outbound.
              </p>
              <p className='mt-4 text-base leading-7 text-slate-600'>I generated five live interview processes by August.</p>
            </section>

            <section>
              <h2 className='mt-12 mb-4 text-3xl font-semibold text-slate-900 first:mt-0'>August – September: The Chaos Spike</h2>
              <p className='mt-4 text-base leading-7 text-slate-600'>
                I had a holiday booked in Japan and while I was in my hotel, a high growth AI hardware company asked me to fly to
                California on 24 hours notice for final round interviews. I completed a superday, received an offer, negotiated it,
                and accepted.
              </p>
              <p className='mt-4 text-base leading-7 text-slate-600'>I flew home with a job offer in hand – it felt surreal that I could finally move.</p>
              <p className='mt-4 text-base leading-7 text-slate-600'>Until it was rescinded for company specific reasons.</p>
              <p className='mt-4 text-base leading-7 text-slate-600'>
                It was jarring, but I rebuilt the funnel immediately and launched a second, much larger wave of outreach, this time
                generating 12 new active processes in a month.
              </p>
            </section>

            <section>
              <h2 className='mt-12 mb-4 text-3xl font-semibold text-slate-900 first:mt-0'>October: Bouncing Back and the Funnel at Full Scale</h2>
              <p className='mt-4 text-base leading-7 text-slate-600'>
                My notice period ended. I was now unemployed. I immediately booked a ticket to the US and left. At this time, I had
                progressed a number of these interviews to late stages and just needed to wrap up an offer so I could move overseas.
                I spent time flying between SF and NY and ended up maturing this funnel.
              </p>
              <p className='mt-4 text-base leading-7 text-slate-600'>
                Because I’m now in RevOps, here’s the funnel diagram for each stage and my conversions to next stage.
              </p>
              <figure className='my-8 space-y-4'>
                <Image
                  src='/figure3-funnel.png'
                  alt='Funnel metrics and time to offer'
                  width={1200}
                  height={742}
                  className='rounded-2xl border border-slate-200 shadow-lg'
                />
                <figcaption className='text-sm text-slate-500'>Figure 3: Funnel metrics and time to offer.</figcaption>
              </figure>
              <p className='mt-4 text-base leading-7 text-slate-600'>
                The companies spanned developer infrastructure, AI workflow automation, AI search, fintech, GTM tooling, and
                analytics. I ultimately chose a Series B analytics company in a RevOps role, because:
              </p>
              <ul className='mt-4 list-disc space-y-2 pl-5 text-base leading-7 text-slate-600'>
                <li>The interview process completed in three days (positive signal for execution rigor)</li>
                <li>Founders had a strong track record in scaling and exiting businesses</li>
                <li>Strong role fit – I was deep into learning about GTM and was looking for a high leverage operating role</li>
              </ul>
            </section>

            <section>
              <h2 className='mt-12 mb-4 text-3xl font-semibold text-slate-900 first:mt-0'>Key Learnings &amp; What Didn’t Work</h2>
              <p className='mt-4 text-base leading-7 text-slate-600'>Some lessons and mistakes to keep note of for next time:</p>
              <ul className='mt-4 list-disc space-y-2 pl-5 text-base leading-7 text-slate-600'>
                <li>Attaching my resume upfront lowered response rates: relational &gt; transactional always</li>
                <li>Accidentally emailed multiple people at the same company</li>
                <li>Learned that rejection is just funnel attrition, not feedback on competence</li>
                <li>Progress is not linear – I got no responses some days, generated three interviews overnight on others</li>
                <li>
                  This probably would not have worked without E-3 eligibility (
                  <a
                    href='https://americajosh.com/learn-more/immigration/e3-visa/?srsltid=AfmBOopDhSVI84gC1O61ALTKDOwsLrwNrPUBrzJOYdqf-cqgwCYkIYSt'
                    className='text-brand-blue underline'
                    target='_blank'
                    rel='noreferrer'
                  >
                    https://americajosh.com/learn-more/immigration/e3-visa
                  </a>
                  )
                </li>
              </ul>
              <p className='mt-4 text-base leading-7 text-slate-600'>Here are a few memorable responses (some paraphrased, some not) that reminded me that this was a numbers game:</p>
              <ul className='mt-4 list-disc space-y-2 pl-5 text-base leading-7 text-slate-600'>
                <li>“Unsubscribe” (this was not paraphrased)</li>
                <li>
                  “Why would you ever leave PE? Seems like an awful waste of effort – why don’t you wait for the big bucks to come in?”
                </li>
                <li>“[from the founder] Can you stop emailing us? [redacted] is no longer at this company”</li>
                <li>“You’re not trying to sell something, right?”</li>
              </ul>
            </section>

            <section>
              <h2 className='mt-12 mb-4 text-3xl font-semibold text-slate-900 first:mt-0'>Conclusion: A Job Search Is a Sales Funnel</h2>
              <p className='mt-4 text-base leading-7 text-slate-600'>
                The fact that this succeeded remains, to date, one of the achievements in my life that I’m most proud of. Trying to
                move countries with no job can feel like an arcane process, but it is effectively a sales funnel, characterised by
                high volume, low initial probability of success, and a requirement for the seller to put in a ton of grunt work.
              </p>
              <p className='mt-4 text-base leading-7 text-slate-600'>
                For the people that took the time out of their day to call me, thank you. For the people I unknowingly spammed, I
                apologise! And for people in my personal life trying to replicate this move, good luck!
              </p>
            </section>

            <div className='mt-10 border-t border-slate-200 pt-6 sm:flex sm:items-center sm:justify-between'>
              <p className='text-base font-semibold text-slate-900'>Enjoyed this case study?</p>
              <Link
                href='/'
                className='mt-4 inline-flex items-center rounded-full bg-brand-blue px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-blue/90 sm:mt-0'
              >
                View Ryan’s main site.
              </Link>
            </div>
          </article>
        </div>
      </section>
    </main>
  )
}
