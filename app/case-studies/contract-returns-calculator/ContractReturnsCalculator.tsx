'use client'

import { useMemo, useRef, useState } from 'react'

type BillingFrequency = 'monthly' | 'quarterly' | 'annual'
type EscalationPeriod = 'monthly' | 'quarterly' | 'annual'
type CostMode = 'margin' | 'line-item'

interface RevenueLine {
  id: string
  name: string
  monthlyPrice: number
  volume: number
  margin: number
}

interface CostLine {
  id: string
  name: string
  monthlyCost: number
}

interface CalculatedResults {
  recognizedEarnings: number[]
  cashCollected: number[]
  totalRecognized: number
  totalCashCollected: number
  monthOneEarnings: number
  averageMonthlyEarnings: number
  paybackMonth: number | null
  cocMultiple: number | null
  cumulativeCashCreated: number
  irrAnnualized: number | null
}

const currencyFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 0,
})

const compactFormatter = new Intl.NumberFormat('en-US', {
  maximumFractionDigits: 2,
})

const percentFormatter = new Intl.NumberFormat('en-US', {
  style: 'percent',
  maximumFractionDigits: 1,
})

const toNumber = (value: string) => {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : 0
}

const escalationSteps = (monthInTerm: number, cadence: EscalationPeriod) => {
  if (cadence === 'monthly') return monthInTerm - 1
  if (cadence === 'quarterly') return Math.floor((monthInTerm - 1) / 3)
  return Math.floor((monthInTerm - 1) / 12)
}

const buildRecognizedEarnings = (
  termMonths: number,
  renewals: number,
  escalationPercent: number,
  escalationPeriod: EscalationPeriod,
  renewalUpliftPercent: number,
  renewalVolumeChangePercent: number,
  revenueLines: RevenueLine[],
  costMode: CostMode,
  costLines: CostLine[],
) => {
  const normalizedTerm = Math.max(0, Math.floor(termMonths))
  const normalizedRenewals = Math.max(0, Math.floor(renewals))
  const totalTermMonths = normalizedTerm * (1 + normalizedRenewals)

  if (!normalizedTerm || revenueLines.length === 0) {
    return []
  }

  const earnings: number[] = []
  const baseCosts = costLines.reduce((sum, item) => sum + item.monthlyCost, 0)
  const escalationRate = escalationPercent / 100
  const upliftRate = renewalUpliftPercent / 100
  const volumeRate = renewalVolumeChangePercent / 100

  for (let month = 1; month <= totalTermMonths; month += 1) {
    const termIndex = Math.floor((month - 1) / normalizedTerm)
    const monthInTerm = ((month - 1) % normalizedTerm) + 1
    const escalationFactor = Math.pow(1 + escalationRate, escalationSteps(monthInTerm, escalationPeriod))
    const renewalPriceFactor = Math.pow(1 + upliftRate, termIndex)
    const renewalVolumeFactor = Math.pow(1 + volumeRate, termIndex)

    const totalRevenue = revenueLines.reduce((sum, line) => {
      const price = line.monthlyPrice * renewalPriceFactor * escalationFactor
      const volume = line.volume * renewalVolumeFactor
      return sum + price * volume
    }, 0)

    if (costMode === 'margin') {
      const marginEarnings = revenueLines.reduce((sum, line) => {
        const price = line.monthlyPrice * renewalPriceFactor * escalationFactor
        const volume = line.volume * renewalVolumeFactor
        return sum + price * volume * (line.margin / 100)
      }, 0)
      earnings.push(marginEarnings)
    } else {
      earnings.push(totalRevenue - baseCosts)
    }
  }

  return earnings
}

const buildCashCollections = (
  recognizedEarnings: number[],
  termMonths: number,
  billingFrequency: BillingFrequency,
  lagMonths: number,
) => {
  const totalMonths = recognizedEarnings.length
  if (!totalMonths) {
    return []
  }

  const invoices = Array.from({ length: totalMonths }).fill(0) as number[]

  if (billingFrequency === 'monthly') {
    for (let i = 0; i < totalMonths; i += 1) {
      invoices[i] = recognizedEarnings[i]
    }
  } else if (billingFrequency === 'quarterly') {
    for (let start = 0; start < totalMonths; start += 3) {
      const slice = recognizedEarnings.slice(start, start + 3)
      invoices[start] = slice.reduce((sum, value) => sum + value, 0)
    }
  } else {
    for (let start = 0; start < totalMonths; start += termMonths) {
      const slice = recognizedEarnings.slice(start, start + termMonths)
      invoices[start] = slice.reduce((sum, value) => sum + value, 0)
    }
  }

  const cashCollected = Array.from({ length: totalMonths + lagMonths }).fill(0) as number[]

  // Billing + collections engine: invoice on cadence, then shift by payment terms lag.
  invoices.forEach((amount, index) => {
    if (amount === 0) return
    const cashIndex = index + lagMonths
    cashCollected[cashIndex] += amount
  })

  return cashCollected
}

const npv = (rate: number, cashflows: number[]) => {
  if (rate <= -0.9999) return Number.POSITIVE_INFINITY
  return cashflows.reduce((sum, cash, index) => sum + cash / Math.pow(1 + rate, index), 0)
}

const irr = (cashflows: number[]) => {
  const hasPositive = cashflows.some((value) => value > 0)
  const hasNegative = cashflows.some((value) => value < 0)
  if (!hasPositive || !hasNegative) return null

  let rate = 0.1
  for (let i = 0; i < 40; i += 1) {
    const denominator = 1 + rate
    if (denominator <= 0) break
    const value = cashflows.reduce((sum, cash, index) => sum + cash / Math.pow(denominator, index), 0)
    const derivative = cashflows.reduce(
      (sum, cash, index) => (index === 0 ? sum : sum - (index * cash) / Math.pow(denominator, index + 1)),
      0,
    )
    if (Math.abs(derivative) < 1e-9) break
    const nextRate = rate - value / derivative
    if (!Number.isFinite(nextRate)) break
    if (Math.abs(nextRate - rate) < 1e-7) return nextRate
    rate = nextRate
  }

  let low = -0.9
  let high = 1
  let lowValue = npv(low, cashflows)
  let highValue = npv(high, cashflows)

  while (lowValue * highValue > 0 && high < 10) {
    high *= 2
    highValue = npv(high, cashflows)
  }

  if (lowValue * highValue > 0) return null

  // IRR solver fallback: bisection when Newton-Raphson fails to converge.
  for (let i = 0; i < 80; i += 1) {
    const mid = (low + high) / 2
    const value = npv(mid, cashflows)
    if (Math.abs(value) < 1e-7) return mid
    if (value * lowValue < 0) {
      high = mid
      highValue = value
    } else {
      low = mid
      lowValue = value
    }
  }

  return (low + high) / 2
}

const formatCurrency = (value: number) => currencyFormatter.format(value)
const formatCompact = (value: number) => compactFormatter.format(value)
const formatPercent = (value: number) => percentFormatter.format(value)

const DEFAULT_STATE = {
  cac: 0,
  termMonths: 12,
  renewals: 0,
  billingFrequency: 'monthly' as BillingFrequency,
  lagMonths: 0,
  escalationPercent: 0,
  escalationPeriod: 'annual' as EscalationPeriod,
  renewalUpliftPercent: 0,
  renewalVolumeChangePercent: 0,
  revenueLines: [{ name: 'Subscription', monthlyPrice: 0, volume: 1, margin: 80 }],
  costMode: 'margin' as CostMode,
  costLines: [] as { name: string; monthlyCost: number }[],
}

const EXAMPLE_STATE = {
  cac: 25000,
  termMonths: 12,
  renewals: 2,
  billingFrequency: 'monthly' as BillingFrequency,
  lagMonths: 1,
  escalationPercent: 3,
  escalationPeriod: 'annual' as EscalationPeriod,
  renewalUpliftPercent: 5,
  renewalVolumeChangePercent: 10,
  revenueLines: [
    { name: 'Platform', monthlyPrice: 2000, volume: 1, margin: 80 },
    { name: 'Seats', monthlyPrice: 50, volume: 50, margin: 70 },
  ],
  costMode: 'margin' as CostMode,
  costLines: [] as { name: string; monthlyCost: number }[],
}

export default function ContractReturnsCalculator() {
  const idRef = useRef(0)
  const costIdRef = useRef(0)

  const [cac, setCac] = useState(DEFAULT_STATE.cac)
  const [termMonths, setTermMonths] = useState(DEFAULT_STATE.termMonths)
  const [renewals, setRenewals] = useState(DEFAULT_STATE.renewals)
  const [billingFrequency, setBillingFrequency] = useState<BillingFrequency>(DEFAULT_STATE.billingFrequency)
  const [lagMonths, setLagMonths] = useState(DEFAULT_STATE.lagMonths)
  const [escalationPercent, setEscalationPercent] = useState(DEFAULT_STATE.escalationPercent)
  const [escalationPeriod, setEscalationPeriod] = useState<EscalationPeriod>(DEFAULT_STATE.escalationPeriod)
  const [renewalUpliftPercent, setRenewalUpliftPercent] = useState(DEFAULT_STATE.renewalUpliftPercent)
  const [renewalVolumeChangePercent, setRenewalVolumeChangePercent] =
    useState(DEFAULT_STATE.renewalVolumeChangePercent)
  const [revenueLines, setRevenueLines] = useState<RevenueLine[]>(() =>
    DEFAULT_STATE.revenueLines.map((line) => ({
      id: `line-${idRef.current++}`,
      ...line,
    })),
  )
  const [costMode, setCostMode] = useState<CostMode>(DEFAULT_STATE.costMode)
  const [costLines, setCostLines] = useState<CostLine[]>([])
  const [showAllMonths, setShowAllMonths] = useState(false)

  const createRevenueLine = () => ({
    id: `line-${idRef.current++}`,
    name: 'New line',
    monthlyPrice: 0,
    volume: 1,
    margin: 60,
  })

  const createCostLine = () => ({
    id: `cost-${costIdRef.current++}`,
    name: 'New cost',
    monthlyCost: 0,
  })

  const applyPreset = (preset: typeof DEFAULT_STATE) => {
    setCac(preset.cac)
    setTermMonths(preset.termMonths)
    setRenewals(preset.renewals)
    setBillingFrequency(preset.billingFrequency)
    setLagMonths(preset.lagMonths)
    setEscalationPercent(preset.escalationPercent)
    setEscalationPeriod(preset.escalationPeriod)
    setRenewalUpliftPercent(preset.renewalUpliftPercent)
    setRenewalVolumeChangePercent(preset.renewalVolumeChangePercent)
    setRevenueLines(
      preset.revenueLines.map((line) => ({
        id: `line-${idRef.current++}`,
        ...line,
      })),
    )
    setCostMode(preset.costMode)
    setCostLines(
      preset.costLines.map((line) => ({
        id: `cost-${costIdRef.current++}`,
        ...line,
      })),
    )
    setShowAllMonths(false)
  }

  const resetAll = () => applyPreset(DEFAULT_STATE)
  const loadExample = () => applyPreset(EXAMPLE_STATE)

  const results = useMemo<CalculatedResults>(() => {
    const recognizedEarnings = buildRecognizedEarnings(
      termMonths,
      renewals,
      escalationPercent,
      escalationPeriod,
      renewalUpliftPercent,
      renewalVolumeChangePercent,
      revenueLines,
      costMode,
      costLines,
    )
    const cashCollected = buildCashCollections(
      recognizedEarnings,
      termMonths,
      billingFrequency,
      lagMonths,
    )

    const totalRecognized = recognizedEarnings.reduce((sum, value) => sum + value, 0)
    const totalCashCollected = cashCollected.reduce((sum, value) => sum + value, 0)
    const monthOneEarnings = recognizedEarnings[0] ?? 0
    const averageMonthlyEarnings = recognizedEarnings.length
      ? totalRecognized / recognizedEarnings.length
      : 0

    let paybackMonth: number | null = null
    if (cac <= 0) {
      paybackMonth = 0
    } else {
      let cumulative = 0
      for (let index = 0; index < cashCollected.length; index += 1) {
        cumulative += cashCollected[index]
        if (cumulative - cac >= 0) {
          paybackMonth = index + 1
          break
        }
      }
    }

    const cocMultiple = cac > 0 ? totalRecognized / cac : null
    const cumulativeCashCreated = totalCashCollected - cac

    const irrMonthly = irr([-cac, ...cashCollected])
    const irrAnnualized = irrMonthly === null ? null : Math.pow(1 + irrMonthly, 12) - 1

    return {
      recognizedEarnings,
      cashCollected,
      totalRecognized,
      totalCashCollected,
      monthOneEarnings,
      averageMonthlyEarnings,
      paybackMonth,
      cocMultiple,
      cumulativeCashCreated,
      irrAnnualized,
    }
  }, [
    termMonths,
    renewals,
    escalationPercent,
    escalationPeriod,
    renewalUpliftPercent,
    renewalVolumeChangePercent,
    revenueLines,
    costMode,
    costLines,
    billingFrequency,
    lagMonths,
    cac,
  ])

  const tableMonths = showAllMonths ? results.cashCollected.length : Math.min(24, results.cashCollected.length)

  return (
    <div className="space-y-10">
      <div className="rounded-3xl border border-zinc-200 bg-white p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">Calculator</p>
            <p className="mt-2 text-2xl font-semibold text-zinc-950">Contract Returns Calculator</p>
            <p className="mt-2 text-sm text-zinc-600">
              Build contract-level unit economics and simulate cash collection timing.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={loadExample}
              className="rounded-full border border-zinc-200 px-4 py-2 text-sm font-semibold text-zinc-700 hover:border-blue-500"
            >
              Load example
            </button>
            <button
              type="button"
              onClick={resetAll}
              className="rounded-full border border-zinc-200 px-4 py-2 text-sm font-semibold text-zinc-700 hover:border-blue-500"
            >
              Reset
            </button>
          </div>
        </div>
      </div>

      <div className="grid gap-8 md:grid-cols-[minmax(0,1fr)_minmax(0,0.85fr)]">
        <div className="space-y-6">
          <div className="rounded-3xl border border-zinc-200 bg-white p-6">
            <p className="text-lg font-semibold text-zinc-950">Deal &amp; timing</p>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <label className="text-sm font-medium text-zinc-700">
                CAC ($)
                <input
                  type="number"
                  value={cac}
                  onChange={(event) => setCac(toNumber(event.target.value))}
                  className="mt-2 w-full rounded-xl border border-zinc-200 px-3 py-2 text-sm text-zinc-900"
                />
              </label>
              <label className="text-sm font-medium text-zinc-700">
                Term (months)
                <input
                  type="number"
                  value={termMonths}
                  onChange={(event) => setTermMonths(toNumber(event.target.value))}
                  className="mt-2 w-full rounded-xl border border-zinc-200 px-3 py-2 text-sm text-zinc-900"
                />
              </label>
              <label className="text-sm font-medium text-zinc-700">
                Renewals (#)
                <input
                  type="number"
                  value={renewals}
                  onChange={(event) => setRenewals(toNumber(event.target.value))}
                  className="mt-2 w-full rounded-xl border border-zinc-200 px-3 py-2 text-sm text-zinc-900"
                />
              </label>
              <label className="text-sm font-medium text-zinc-700">
                Billing frequency
                <select
                  value={billingFrequency}
                  onChange={(event) => setBillingFrequency(event.target.value as BillingFrequency)}
                  className="mt-2 w-full rounded-xl border border-zinc-200 px-3 py-2 text-sm text-zinc-900"
                >
                  <option value="monthly">Monthly</option>
                  <option value="quarterly">Quarterly</option>
                  <option value="annual">Annual upfront</option>
                </select>
              </label>
              <label className="text-sm font-medium text-zinc-700">
                Payment terms
                <select
                  value={lagMonths}
                  onChange={(event) => setLagMonths(toNumber(event.target.value))}
                  className="mt-2 w-full rounded-xl border border-zinc-200 px-3 py-2 text-sm text-zinc-900"
                >
                  <option value={0}>Due on receipt (0)</option>
                  <option value={1}>Net 30 (1)</option>
                  <option value={2}>Net 60 (2)</option>
                  <option value={3}>Net 90 (3)</option>
                </select>
              </label>
              <label className="text-sm font-medium text-zinc-700">
                Escalation (%)
                <input
                  type="number"
                  value={escalationPercent}
                  onChange={(event) => setEscalationPercent(toNumber(event.target.value))}
                  className="mt-2 w-full rounded-xl border border-zinc-200 px-3 py-2 text-sm text-zinc-900"
                />
              </label>
              <label className="text-sm font-medium text-zinc-700">
                Escalation cadence
                <select
                  value={escalationPeriod}
                  onChange={(event) => setEscalationPeriod(event.target.value as EscalationPeriod)}
                  className="mt-2 w-full rounded-xl border border-zinc-200 px-3 py-2 text-sm text-zinc-900"
                >
                  <option value="monthly">Monthly</option>
                  <option value="quarterly">Quarterly</option>
                  <option value="annual">Annual</option>
                </select>
              </label>
            </div>
          </div>

          <div className="rounded-3xl border border-zinc-200 bg-white p-6">
            <p className="text-lg font-semibold text-zinc-950">Renewal adjustments</p>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <label className="text-sm font-medium text-zinc-700">
                Renewal uplift (%)
                <input
                  type="number"
                  value={renewalUpliftPercent}
                  onChange={(event) => setRenewalUpliftPercent(toNumber(event.target.value))}
                  className="mt-2 w-full rounded-xl border border-zinc-200 px-3 py-2 text-sm text-zinc-900"
                />
              </label>
              <label className="text-sm font-medium text-zinc-700">
                Renewal volume change (%)
                <input
                  type="number"
                  value={renewalVolumeChangePercent}
                  onChange={(event) => setRenewalVolumeChangePercent(toNumber(event.target.value))}
                  className="mt-2 w-full rounded-xl border border-zinc-200 px-3 py-2 text-sm text-zinc-900"
                />
              </label>
            </div>
          </div>

          <div className="rounded-3xl border border-zinc-200 bg-white p-6">
            <div className="flex items-center justify-between">
              <p className="text-lg font-semibold text-zinc-950">Revenue lines</p>
              <button
                type="button"
                onClick={() => setRevenueLines((lines) => [...lines, createRevenueLine()])}
                className="text-sm font-semibold text-blue-600"
              >
                + Add line
              </button>
            </div>
            <div className="mt-4 space-y-4">
              {revenueLines.map((line) => (
                <div key={line.id} className="rounded-2xl border border-zinc-200 bg-white p-4">
                  <div className="flex items-center justify-between gap-3">
                    <input
                      type="text"
                      value={line.name}
                      onChange={(event) =>
                        setRevenueLines((lines) =>
                          lines.map((item) => (item.id === line.id ? { ...item, name: event.target.value } : item)),
                        )
                      }
                      className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm text-zinc-900"
                    />
                    <button
                      type="button"
                      onClick={() => setRevenueLines((lines) => lines.filter((item) => item.id !== line.id))}
                      className="text-xs font-semibold uppercase tracking-wide text-zinc-400 hover:text-zinc-600"
                    >
                      Remove
                    </button>
                  </div>
                  <div className="mt-3 grid gap-3 sm:grid-cols-2">
                    <label className="text-xs font-medium uppercase tracking-wide text-zinc-500">
                      Monthly price ($)
                      <input
                        type="number"
                        value={line.monthlyPrice}
                        onChange={(event) =>
                          setRevenueLines((lines) =>
                            lines.map((item) =>
                              item.id === line.id ? { ...item, monthlyPrice: toNumber(event.target.value) } : item,
                            ),
                          )
                        }
                        className="mt-2 w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm text-zinc-900"
                      />
                    </label>
                    <label className="text-xs font-medium uppercase tracking-wide text-zinc-500">
                      Volume
                      <input
                        type="number"
                        value={line.volume}
                        onChange={(event) =>
                          setRevenueLines((lines) =>
                            lines.map((item) =>
                              item.id === line.id ? { ...item, volume: toNumber(event.target.value) } : item,
                            ),
                          )
                        }
                        className="mt-2 w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm text-zinc-900"
                      />
                    </label>
                    {costMode === 'margin' && (
                      <label className="text-xs font-medium uppercase tracking-wide text-zinc-500">
                        Margin (%)
                        <input
                          type="number"
                          value={line.margin}
                          onChange={(event) =>
                            setRevenueLines((lines) =>
                              lines.map((item) =>
                                item.id === line.id ? { ...item, margin: toNumber(event.target.value) } : item,
                              ),
                            )
                          }
                          className="mt-2 w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm text-zinc-900"
                        />
                      </label>
                    )}
                  </div>
                </div>
              ))}
              {revenueLines.length === 0 && (
                <p className="text-sm text-zinc-500">Add at least one revenue line to compute returns.</p>
              )}
            </div>
          </div>

          <div className="rounded-3xl border border-zinc-200 bg-white p-6">
            <p className="text-lg font-semibold text-zinc-950">Cost mode</p>
            <div className="mt-4 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => setCostMode('margin')}
                className={`rounded-full border px-4 py-2 text-sm font-semibold ${
                  costMode === 'margin'
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-zinc-200 text-zinc-700'
                }`}
              >
                Margin-driven
              </button>
              <button
                type="button"
                onClick={() => setCostMode('line-item')}
                className={`rounded-full border px-4 py-2 text-sm font-semibold ${
                  costMode === 'line-item'
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-zinc-200 text-zinc-700'
                }`}
              >
                Line-item-driven
              </button>
            </div>
            {costMode === 'line-item' && (
              <div className="mt-6 space-y-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold uppercase tracking-[0.2em] text-zinc-500">Costs</p>
                  <button
                    type="button"
                    onClick={() => setCostLines((lines) => [...lines, createCostLine()])}
                    className="text-sm font-semibold text-blue-600"
                  >
                    + Add cost
                  </button>
                </div>
                {costLines.map((line) => (
                  <div key={line.id} className="rounded-2xl border border-zinc-200 bg-white p-4">
                    <div className="flex items-center justify-between gap-3">
                      <input
                        type="text"
                        value={line.name}
                        onChange={(event) =>
                          setCostLines((lines) =>
                            lines.map((item) => (item.id === line.id ? { ...item, name: event.target.value } : item)),
                          )
                        }
                        className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm text-zinc-900"
                      />
                      <button
                        type="button"
                        onClick={() => setCostLines((lines) => lines.filter((item) => item.id !== line.id))}
                        className="text-xs font-semibold uppercase tracking-wide text-zinc-400 hover:text-zinc-600"
                      >
                        Remove
                      </button>
                    </div>
                    <label className="mt-3 block text-xs font-medium uppercase tracking-wide text-zinc-500">
                      Monthly cost ($)
                      <input
                        type="number"
                        value={line.monthlyCost}
                        onChange={(event) =>
                          setCostLines((lines) =>
                            lines.map((item) =>
                              item.id === line.id ? { ...item, monthlyCost: toNumber(event.target.value) } : item,
                            ),
                          )
                        }
                        className="mt-2 w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm text-zinc-900"
                      />
                    </label>
                  </div>
                ))}
                {costLines.length === 0 && (
                  <p className="text-sm text-zinc-500">Add costs if you want earnings to be revenue minus costs.</p>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6 md:sticky md:top-24 md:self-start">
          <div className="rounded-3xl border border-zinc-200 bg-white p-6">
            <p className="text-lg font-semibold text-zinc-950">Outputs</p>
            <dl className="mt-4 space-y-4">
              <div className="flex items-center justify-between text-sm">
                <dt className="text-zinc-500">Month 1 earnings</dt>
                <dd className="font-semibold text-zinc-950">{formatCurrency(results.monthOneEarnings)}</dd>
              </div>
              <div className="flex items-center justify-between text-sm">
                <dt className="text-zinc-500">Avg monthly earnings</dt>
                <dd className="font-semibold text-zinc-950">{formatCurrency(results.averageMonthlyEarnings)}</dd>
              </div>
              <div className="flex items-center justify-between text-sm">
                <dt className="text-zinc-500">Total earnings</dt>
                <dd className="font-semibold text-zinc-950">{formatCurrency(results.totalRecognized)}</dd>
              </div>
              <div className="flex items-center justify-between text-sm">
                <dt className="text-zinc-500">Payback period</dt>
                <dd className="font-semibold text-zinc-950">
                  {results.paybackMonth === null ? 'Never' : `Month ${results.paybackMonth}`}
                </dd>
              </div>
              <div className="flex items-center justify-between text-sm">
                <dt className="text-zinc-500">CoC multiple</dt>
                <dd className="font-semibold text-zinc-950">
                  {results.cocMultiple === null ? 'n/a' : `${formatCompact(results.cocMultiple)}x`}
                </dd>
              </div>
              <div className="flex items-center justify-between text-sm">
                <dt className="text-zinc-500">Cumulative cash created</dt>
                <dd className="font-semibold text-zinc-950">{formatCurrency(results.cumulativeCashCreated)}</dd>
              </div>
              <div className="flex items-center justify-between text-sm">
                <dt className="text-zinc-500">IRR (annualized)</dt>
                <dd className="font-semibold text-zinc-950">
                  {results.irrAnnualized === null ? 'n/a' : formatPercent(results.irrAnnualized)}
                </dd>
              </div>
            </dl>
          </div>

          <div className="rounded-3xl border border-zinc-200 bg-white p-6">
            <div className="flex items-center justify-between">
              <p className="text-lg font-semibold text-zinc-950">Cashflow</p>
              {results.cashCollected.length > 24 && (
                <button
                  type="button"
                  onClick={() => setShowAllMonths((value) => !value)}
                  className="text-sm font-semibold text-blue-600"
                >
                  {showAllMonths ? 'Show fewer' : 'Show all'}
                </button>
              )}
            </div>
            <div className="mt-4 overflow-hidden rounded-2xl border border-zinc-200">
              <table className="w-full text-left text-sm">
                <thead className="bg-zinc-50 text-xs uppercase tracking-wide text-zinc-500">
                  <tr>
                    <th className="px-4 py-3">Month</th>
                    <th className="px-4 py-3">Recognized</th>
                    <th className="px-4 py-3">Cash collected</th>
                    <th className="px-4 py-3">Cumulative cash</th>
                  </tr>
                </thead>
                <tbody>
                  {Array.from({ length: tableMonths }).map((_, index) => {
                    const recognized = results.recognizedEarnings[index] ?? 0
                    const cash = results.cashCollected[index] ?? 0
                    const cumulative = results.cashCollected
                      .slice(0, index + 1)
                      .reduce((sum, value) => sum + value, 0)
                    return (
                      <tr key={`month-${index}`} className="border-t border-zinc-200">
                        <td className="px-4 py-3 font-semibold text-zinc-900">{index + 1}</td>
                        <td className="px-4 py-3 text-zinc-600">{formatCurrency(recognized)}</td>
                        <td className="px-4 py-3 text-zinc-600">{formatCurrency(cash)}</td>
                        <td className="px-4 py-3 text-zinc-900">{formatCurrency(cumulative)}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
            {results.cashCollected.length > 24 && !showAllMonths && (
              <p className="mt-3 text-xs text-zinc-500">Showing first 24 months.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
