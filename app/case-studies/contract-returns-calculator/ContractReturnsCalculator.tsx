'use client'

import Link from 'next/link'
import { useMemo, useRef, useState, type MouseEvent } from 'react'

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

interface ChartPoint {
  month: number
  monthlyCash: number
  cumulativeCash: number
  paybackAchieved: boolean
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

const buildLinePath = (points: { x: number; y: number }[]) => {
  if (points.length === 0) return ''
  return points.map((point, index) => `${index === 0 ? 'M' : 'L'}${point.x} ${point.y}`).join(' ')
}

function CashflowChart({
  data,
  paybackMonth,
}: {
  data: ChartPoint[]
  paybackMonth: number | null
}) {
  const [hoverIndex, setHoverIndex] = useState<number | null>(null)

  const width = 640
  const height = 260
  const padding = { top: 18, right: 24, bottom: 32, left: 52 }
  const innerWidth = width - padding.left - padding.right
  const innerHeight = height - padding.top - padding.bottom

  const values = data.flatMap((point) => [point.monthlyCash, point.cumulativeCash, 0])
  const minValue = Math.min(...values)
  const maxValue = Math.max(...values)
  const range = maxValue - minValue === 0 ? 1 : maxValue - minValue

  const xForIndex = (index: number) =>
    padding.left + (data.length === 1 ? 0 : (index / (data.length - 1)) * innerWidth)
  const yForValue = (value: number) => padding.top + ((maxValue - value) / range) * innerHeight

  const monthlyPoints = data.map((point, index) => ({
    x: xForIndex(index),
    y: yForValue(point.monthlyCash),
  }))

  const cumulativePoints = data.map((point, index) => ({
    x: xForIndex(index),
    y: yForValue(point.cumulativeCash),
  }))

  const baselineY = yForValue(0)
  const paybackIndex = paybackMonth ? data.findIndex((point) => point.month === paybackMonth) : -1

  const handleMove = (event: MouseEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect()
    const x = event.clientX - rect.left
    const ratio = (x - padding.left) / innerWidth
    const index = Math.round(ratio * (data.length - 1))
    const clampedIndex = Math.min(Math.max(index, 0), data.length - 1)
    setHoverIndex(clampedIndex)
  }

  const hoverPoint = hoverIndex === null ? null : data[hoverIndex]
  const hoverX = hoverIndex === null ? 0 : xForIndex(hoverIndex)

  return (
    <div className="relative">
      <div
        className="relative overflow-hidden rounded-2xl border border-zinc-200 bg-white"
        onMouseMove={handleMove}
        onMouseLeave={() => setHoverIndex(null)}
      >
        <svg viewBox={`0 0 ${width} ${height}`} className="h-64 w-full">
          <line
            x1={padding.left}
            x2={width - padding.right}
            y1={baselineY}
            y2={baselineY}
            className="stroke-zinc-200"
            strokeWidth={1}
          />
          <line
            x1={xForIndex(0)}
            x2={xForIndex(0)}
            y1={padding.top}
            y2={height - padding.bottom}
            className="stroke-zinc-300"
            strokeWidth={1}
          />
          {paybackIndex >= 0 && (
            <line
              x1={xForIndex(paybackIndex)}
              x2={xForIndex(paybackIndex)}
              y1={padding.top}
              y2={height - padding.bottom}
              className="stroke-blue-400"
              strokeDasharray="6 6"
              strokeWidth={1.5}
            />
          )}
          <path
            d={buildLinePath(monthlyPoints)}
            className="fill-none stroke-zinc-400"
            strokeWidth={1.5}
          />
          <path
            d={buildLinePath(cumulativePoints)}
            className="fill-none stroke-blue-600"
            strokeWidth={2.5}
          />
          {hoverIndex !== null && (
            <>
              <line
                x1={hoverX}
                x2={hoverX}
                y1={padding.top}
                y2={height - padding.bottom}
                className="stroke-zinc-300"
                strokeDasharray="4 4"
                strokeWidth={1}
              />
              <circle
                cx={hoverX}
                cy={yForValue(hoverPoint?.cumulativeCash ?? 0)}
                r={4}
                className="fill-blue-600"
              />
              <circle
                cx={hoverX}
                cy={yForValue(hoverPoint?.monthlyCash ?? 0)}
                r={3}
                className="fill-zinc-400"
              />
            </>
          )}
          <text x={padding.left + 4} y={padding.top + 12} className="fill-zinc-400 text-[10px]">
            CAC
          </text>
          <text
            x={width - padding.right - 40}
            y={baselineY - 6}
            className="fill-zinc-400 text-[10px]"
          >
            $0
          </text>
          <text
            x={width - padding.right - 70}
            y={height - 10}
            className="fill-zinc-400 text-[10px]"
          >
            Months →
          </text>
        </svg>
      </div>

      {hoverPoint && (
        <div
          className="pointer-events-none absolute top-4 rounded-xl border border-zinc-200 bg-white/95 px-3 py-2 text-xs text-zinc-700 shadow-sm"
          style={{ left: `${hoverX}px`, transform: 'translateX(-50%)' }}
        >
          <div className="font-semibold text-zinc-900">Month {hoverPoint.month}</div>
          <div className="mt-1 space-y-0.5">
            <div>Monthly cash flow: {formatCurrency(hoverPoint.monthlyCash)}</div>
            <div>Cumulative cash flow: {formatCurrency(hoverPoint.cumulativeCash)}</div>
            <div>Payback achieved: {hoverPoint.paybackAchieved ? 'True' : 'False'}</div>
          </div>
        </div>
      )}
    </div>
  )
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
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [showDetails, setShowDetails] = useState(false)
  const [expandedLines, setExpandedLines] = useState<string[]>([])

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
    setShowAdvanced(false)
    setShowDetails(false)
    setExpandedLines([])
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

  const chartData = useMemo<ChartPoint[]>(() => {
    const data: ChartPoint[] = []
    let cumulative = -cac
    data.push({
      month: 0,
      monthlyCash: -cac,
      cumulativeCash: cumulative,
      paybackAchieved: cumulative >= 0,
    })

    results.cashCollected.forEach((cash, index) => {
      cumulative += cash
      data.push({
        month: index + 1,
        monthlyCash: cash,
        cumulativeCash: cumulative,
        paybackAchieved: cumulative >= 0,
      })
    })

    return data
  }, [cac, results.cashCollected])

  const paybackLabel =
    results.paybackMonth === null
      ? 'No payback'
      : results.paybackMonth === 0
        ? 'Month 0'
        : `Month ${results.paybackMonth}`

  const verdictLine =
    results.paybackMonth === null
      ? 'No payback within the modeled term.'
      : `Payback in month ${results.paybackMonth}.`

  const cocLine =
    results.cocMultiple === null
      ? 'Returns pending.'
      : `$${formatCompact(results.cocMultiple)} returned for every $1 invested.`

  const handleAddLine = () => {
    const newLine = createRevenueLine()
    setRevenueLines((lines) => [...lines, newLine])
    setExpandedLines((lines) => [...lines, newLine.id])
  }

  const toggleExpandedLine = (id: string) => {
    setExpandedLines((lines) =>
      lines.includes(id) ? lines.filter((lineId) => lineId !== id) : [...lines, id],
    )
  }

  return (
    <div className="flex min-h-screen flex-col bg-white text-zinc-700">
      <header className="border-b border-zinc-200">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:px-6">
          <Link href="/" className="text-sm font-semibold text-zinc-700 hover:text-blue-600">
            ← Back to main site
          </Link>
          <div className="flex flex-wrap items-center gap-3 text-sm font-semibold text-zinc-700">
            <button
              type="button"
              onClick={loadExample}
              className="rounded-full border border-zinc-200 px-3 py-1.5 hover:border-blue-500"
            >
              Load example
            </button>
            <button
              type="button"
              onClick={resetAll}
              className="rounded-full border border-zinc-200 px-3 py-1.5 hover:border-blue-500"
            >
              Reset
            </button>
            <a href="mailto:ryandharma04@gmail.com" className="px-2 py-1 hover:text-blue-600">
              Email
            </a>
            <a
              href="https://www.linkedin.com/in/ryandharma/"
              target="_blank"
              rel="noopener noreferrer"
              className="px-2 py-1 hover:text-blue-600"
            >
              LinkedIn
            </a>
          </div>
        </div>
      </header>

      <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col px-4 py-6 sm:px-6 lg:py-8">
        <div className="grid flex-1 gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
          <section className="flex flex-col gap-6 rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">Calculator</p>
              <p className="mt-2 text-sm text-zinc-600">
                Model contract returns and cash collection without scrolling.
              </p>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-zinc-900">Core deal inputs</p>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                  CAC ($)
                  <input
                    type="number"
                    value={cac}
                    onChange={(event) => setCac(toNumber(event.target.value))}
                    className="mt-2 w-full rounded-xl border border-zinc-200 px-3 py-2 text-sm text-zinc-900"
                  />
                </label>
                <label className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                  Term (months)
                  <input
                    type="number"
                    value={termMonths}
                    onChange={(event) => setTermMonths(toNumber(event.target.value))}
                    className="mt-2 w-full rounded-xl border border-zinc-200 px-3 py-2 text-sm text-zinc-900"
                  />
                </label>
                <label className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
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
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-zinc-900">Revenue lines</p>
                <button type="button" onClick={handleAddLine} className="text-sm font-semibold text-blue-600">
                  + Add line
                </button>
              </div>
              <div className="space-y-3">
                {revenueLines.map((line) => {
                  const isExpanded = expandedLines.includes(line.id)
                  const summary = `${line.name} · ${formatCurrency(line.monthlyPrice)}/mo × ${line.volume} · ${line.margin}% margin`
                  return (
                    <div key={line.id} className="rounded-2xl border border-zinc-200 bg-white">
                      <div className="flex items-center justify-between gap-3 px-4 py-3">
                        <button
                          type="button"
                          onClick={() => toggleExpandedLine(line.id)}
                          className="flex flex-1 flex-col text-left"
                        >
                          <span className="text-sm font-semibold text-zinc-900">{line.name}</span>
                          <span className="text-xs text-zinc-500">{summary}</span>
                        </button>
                        <div className="flex items-center gap-3">
                          <button
                            type="button"
                            onClick={() => toggleExpandedLine(line.id)}
                            className="text-xs font-semibold uppercase tracking-wide text-blue-600"
                          >
                            {isExpanded ? 'Collapse' : 'Edit'}
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setRevenueLines((lines) => lines.filter((item) => item.id !== line.id))
                              setExpandedLines((lines) => lines.filter((lineId) => lineId !== line.id))
                            }}
                            className="text-xs font-semibold uppercase tracking-wide text-zinc-400 hover:text-zinc-600"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                      {isExpanded && (
                        <div className="grid gap-3 border-t border-zinc-200 px-4 py-3 sm:grid-cols-2">
                          <label className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                            Name
                            <input
                              type="text"
                              value={line.name}
                              onChange={(event) =>
                                setRevenueLines((lines) =>
                                  lines.map((item) =>
                                    item.id === line.id ? { ...item, name: event.target.value } : item,
                                  ),
                                )
                              }
                              className="mt-2 w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm text-zinc-900"
                            />
                          </label>
                          <label className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                            Monthly price ($)
                            <input
                              type="number"
                              value={line.monthlyPrice}
                              onChange={(event) =>
                                setRevenueLines((lines) =>
                                  lines.map((item) =>
                                    item.id === line.id
                                      ? { ...item, monthlyPrice: toNumber(event.target.value) }
                                      : item,
                                  ),
                                )
                              }
                              className="mt-2 w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm text-zinc-900"
                            />
                          </label>
                          <label className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
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
                            <label className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                              Margin (%)
                              <input
                                type="number"
                                value={line.margin}
                                onChange={(event) =>
                                  setRevenueLines((lines) =>
                                    lines.map((item) =>
                                      item.id === line.id
                                        ? { ...item, margin: toNumber(event.target.value) }
                                        : item,
                                    ),
                                  )
                                }
                                className="mt-2 w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm text-zinc-900"
                              />
                            </label>
                          )}
                        </div>
                      )}
                    </div>
                  )
                })}
                {revenueLines.length === 0 && (
                  <p className="text-sm text-zinc-500">Add at least one revenue line to compute returns.</p>
                )}
              </div>
            </div>

            <div className="space-y-3">
              <button
                type="button"
                onClick={() => setShowAdvanced((value) => !value)}
                className="flex w-full items-center justify-between text-sm font-semibold text-zinc-900"
              >
                Advanced assumptions
                <span className="text-xs font-semibold uppercase tracking-wide text-blue-600">
                  {showAdvanced ? 'Hide' : 'Show'}
                </span>
              </button>
              {showAdvanced && (
                <div className="space-y-4 rounded-2xl border border-zinc-200 bg-zinc-50/70 p-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <label className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
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
                    <label className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                      Escalation (%)
                      <input
                        type="number"
                        value={escalationPercent}
                        onChange={(event) => setEscalationPercent(toNumber(event.target.value))}
                        className="mt-2 w-full rounded-xl border border-zinc-200 px-3 py-2 text-sm text-zinc-900"
                      />
                    </label>
                    <label className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
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
                    <label className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                      Renewals (#)
                      <input
                        type="number"
                        value={renewals}
                        onChange={(event) => setRenewals(toNumber(event.target.value))}
                        className="mt-2 w-full rounded-xl border border-zinc-200 px-3 py-2 text-sm text-zinc-900"
                      />
                    </label>
                    <label className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                      Renewal uplift (%)
                      <input
                        type="number"
                        value={renewalUpliftPercent}
                        onChange={(event) => setRenewalUpliftPercent(toNumber(event.target.value))}
                        className="mt-2 w-full rounded-xl border border-zinc-200 px-3 py-2 text-sm text-zinc-900"
                      />
                    </label>
                    <label className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                      Renewal volume change (%)
                      <input
                        type="number"
                        value={renewalVolumeChangePercent}
                        onChange={(event) => setRenewalVolumeChangePercent(toNumber(event.target.value))}
                        className="mt-2 w-full rounded-xl border border-zinc-200 px-3 py-2 text-sm text-zinc-900"
                      />
                    </label>
                  </div>

                  <div className="space-y-3">
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">Cost mode</p>
                    <div className="flex flex-wrap gap-3">
                      <button
                        type="button"
                        onClick={() => setCostMode('margin')}
                        className={`rounded-full border px-4 py-1.5 text-xs font-semibold uppercase tracking-wide ${
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
                        className={`rounded-full border px-4 py-1.5 text-xs font-semibold uppercase tracking-wide ${
                          costMode === 'line-item'
                            ? 'border-blue-500 bg-blue-50 text-blue-700'
                            : 'border-zinc-200 text-zinc-700'
                        }`}
                      >
                        Line-item-driven
                      </button>
                    </div>
                  </div>

                  {costMode === 'line-item' && (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">Costs</p>
                        <button
                          type="button"
                          onClick={() => setCostLines((lines) => [...lines, createCostLine()])}
                          className="text-xs font-semibold text-blue-600"
                        >
                          + Add cost
                        </button>
                      </div>
                      <div className="space-y-3">
                        {costLines.map((line) => (
                          <div key={line.id} className="rounded-2xl border border-zinc-200 bg-white p-3">
                            <div className="flex items-center justify-between gap-3">
                              <input
                                type="text"
                                value={line.name}
                                onChange={(event) =>
                                  setCostLines((lines) =>
                                    lines.map((item) =>
                                      item.id === line.id ? { ...item, name: event.target.value } : item,
                                    ),
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
                            <label className="mt-3 block text-xs font-semibold uppercase tracking-wide text-zinc-500">
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
                          <p className="text-xs text-zinc-500">
                            Add costs if you want earnings to be revenue minus costs.
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </section>

          <section className="flex flex-col gap-6 rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm">
            <div className="space-y-2">
              <p className="text-sm font-semibold text-zinc-900">Decision summary</p>
              <p className="text-sm text-zinc-600">
                {verdictLine} {cocLine}
              </p>
            </div>

            <dl className="grid gap-4 sm:grid-cols-3">
              <div className="rounded-2xl border border-zinc-200 p-4">
                <dt className="text-xs font-semibold uppercase tracking-wide text-zinc-500">Payback period</dt>
                <dd className="mt-2 text-lg font-semibold text-zinc-950">{paybackLabel}</dd>
              </div>
              <div className="rounded-2xl border border-zinc-200 p-4">
                <dt className="text-xs font-semibold uppercase tracking-wide text-zinc-500">CoC multiple</dt>
                <dd className="mt-2 text-lg font-semibold text-zinc-950">
                  {results.cocMultiple === null ? 'n/a' : `${formatCompact(results.cocMultiple)}x`}
                </dd>
              </div>
              <div className="rounded-2xl border border-zinc-200 p-4">
                <dt className="text-xs font-semibold uppercase tracking-wide text-zinc-500">Total earnings</dt>
                <dd className="mt-2 text-lg font-semibold text-zinc-950">
                  {formatCurrency(results.totalRecognized)}
                </dd>
              </div>
            </dl>

            <div className="space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-sm font-semibold text-zinc-900">Cash flow over time</p>
                <div className="flex flex-wrap gap-4 text-xs font-semibold uppercase tracking-wide text-zinc-500">
                  <span className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-zinc-400" /> Monthly cash flow
                  </span>
                  <span className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-blue-600" /> Cumulative cash flow
                  </span>
                </div>
              </div>
              <CashflowChart data={chartData} paybackMonth={results.paybackMonth} />
              <div className="flex items-center justify-between text-xs text-zinc-500">
                <span>CAC anchor at month 0 · Payback marker is dashed.</span>
                <span>Hover to inspect monthly values.</span>
              </div>
            </div>

            <div className="space-y-3">
              <button
                type="button"
                onClick={() => setShowDetails((value) => !value)}
                className="flex w-full items-center justify-between text-sm font-semibold text-zinc-900"
              >
                Details
                <span className="text-xs font-semibold uppercase tracking-wide text-blue-600">
                  {showDetails ? 'Hide' : 'Show'}
                </span>
              </button>
              {showDetails && (
                <dl className="space-y-3 rounded-2xl border border-zinc-200 bg-zinc-50/70 p-4 text-sm">
                  <div className="flex items-center justify-between">
                    <dt className="text-zinc-500">Month 1 earnings</dt>
                    <dd className="font-semibold text-zinc-900">
                      {formatCurrency(results.monthOneEarnings)}
                    </dd>
                  </div>
                  <div className="flex items-center justify-between">
                    <dt className="text-zinc-500">Avg monthly earnings</dt>
                    <dd className="font-semibold text-zinc-900">
                      {formatCurrency(results.averageMonthlyEarnings)}
                    </dd>
                  </div>
                  <div className="flex items-center justify-between">
                    <dt className="text-zinc-500">Cumulative cash created</dt>
                    <dd className="font-semibold text-zinc-900">
                      {formatCurrency(results.cumulativeCashCreated)}
                    </dd>
                  </div>
                  <div className="flex items-center justify-between">
                    <dt className="text-zinc-500">
                      IRR (annualized)
                      <span className="ml-2 text-[11px] text-zinc-400" title="IRR is an optional, secondary view of return over time.">
                        (optional)
                      </span>
                    </dt>
                    <dd className="font-semibold text-zinc-900">
                      {results.irrAnnualized === null ? 'n/a' : formatPercent(results.irrAnnualized)}
                    </dd>
                  </div>
                </dl>
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}
