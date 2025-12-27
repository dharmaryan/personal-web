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
  maximumFractionDigits: 0,
})

const compactFormatter = new Intl.NumberFormat('en-US', {
  maximumFractionDigits: 2,
})

const percentFormatter = new Intl.NumberFormat('en-US', {
  style: 'percent',
  maximumFractionDigits: 1,
})

const INPUT_BOUNDS = {
  renewals: { min: 0, max: 5 },
  renewalVolumeChangePercent: { min: -50, max: 100 },
  renewalUpliftPercent: { min: 0, max: 20 },
  escalationPercent: { min: 0, max: 10 },
  termMonths: { min: 1, max: 60 },
} as const

const toNumber = (value: string) => {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : 0
}

const clampNumber = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max)
const clampInteger = (value: number, min: number, max: number) =>
  clampNumber(Math.floor(value), min, max)

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
  const normalizedTerm = clampInteger(termMonths, INPUT_BOUNDS.termMonths.min, INPUT_BOUNDS.termMonths.max)
  const normalizedRenewals = clampInteger(renewals, INPUT_BOUNDS.renewals.min, INPUT_BOUNDS.renewals.max)
  const totalTermMonths = normalizedTerm * (1 + normalizedRenewals)

  if (!normalizedTerm || revenueLines.length === 0) {
    return []
  }

  const earnings: number[] = []
  const baseCosts = costLines.reduce((sum, item) => sum + item.monthlyCost, 0)
  const escalationRate =
    clampNumber(escalationPercent, INPUT_BOUNDS.escalationPercent.min, INPUT_BOUNDS.escalationPercent.max) / 100
  const upliftRate =
    clampNumber(
      renewalUpliftPercent,
      INPUT_BOUNDS.renewalUpliftPercent.min,
      INPUT_BOUNDS.renewalUpliftPercent.max,
    ) / 100
  const volumeRate =
    clampNumber(
      renewalVolumeChangePercent,
      INPUT_BOUNDS.renewalVolumeChangePercent.min,
      INPUT_BOUNDS.renewalVolumeChangePercent.max,
    ) / 100

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

const formatCurrency = (value: number) => {
  if (!Number.isFinite(value)) return '-'
  const rounded = Math.round(value)
  if (rounded === 0) return '-'
  const formatted = currencyFormatter.format(Math.abs(rounded))
  return rounded < 0 ? `($${formatted})` : `$${formatted}`
}
const formatCompact = (value: number) => compactFormatter.format(value)
const formatPercent = (value: number) => percentFormatter.format(value)

const DEFAULT_STATE = {
  cac: 0,
  termMonths: 12,
  renewals: 1,
  billingFrequency: 'monthly' as BillingFrequency,
  lagMonths: 0,
  escalationPercent: 3,
  escalationPeriod: 'annual' as EscalationPeriod,
  renewalUpliftPercent: 5,
  renewalVolumeChangePercent: 5,
  revenueLines: [{ name: 'Subscription', monthlyPrice: 0, volume: 1, margin: 80 }],
  costMode: 'margin' as CostMode,
  costLines: [] as { name: string; monthlyCost: number }[],
}

const EXAMPLE_STATE = {
  cac: 25000,
  termMonths: 12,
  renewals: 1,
  billingFrequency: 'monthly' as BillingFrequency,
  lagMonths: 1,
  escalationPercent: 3,
  escalationPeriod: 'annual' as EscalationPeriod,
  renewalUpliftPercent: 5,
  renewalVolumeChangePercent: 6,
  revenueLines: [
    { name: 'Platform fee', monthlyPrice: 3200, volume: 1, margin: 82 },
    { name: 'Seats (team)', monthlyPrice: 85, volume: 120, margin: 76 },
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
  isEmpty,
}: {
  data: ChartPoint[]
  paybackMonth: number | null
  isEmpty: boolean
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
  const maxMonth = data[data.length - 1]?.month ?? 0
  const xTickStep = 3
  const xTicks = Array.from({ length: Math.floor(maxMonth / xTickStep) + 1 }, (_, index) => index * xTickStep)
  if (xTicks[xTicks.length - 1] !== maxMonth) {
    xTicks.push(maxMonth)
  }
  const yTickCount = 4
  const yTicks = Array.from({ length: yTickCount + 1 }, (_, index) => minValue + (range / yTickCount) * index)

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
    if (isEmpty) return
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
        className="relative overflow-hidden rounded-2xl border border-zinc-300 bg-white shadow-sm"
        onMouseMove={handleMove}
        onMouseLeave={() => setHoverIndex(null)}
      >
        <svg viewBox={`0 0 ${width} ${height}`} className="h-64 w-full">
          {yTicks.map((tick) => (
            <line
              key={tick}
              x1={padding.left}
              x2={width - padding.right}
              y1={yForValue(tick)}
              y2={yForValue(tick)}
              className="stroke-zinc-200/80"
              strokeWidth={1}
            />
          ))}
          <line
            x1={padding.left}
            x2={width - padding.right}
            y1={height - padding.bottom}
            y2={height - padding.bottom}
            className="stroke-zinc-300"
            strokeWidth={1}
          />
          <line
            x1={padding.left}
            x2={width - padding.right}
            y1={baselineY}
            y2={baselineY}
            className="stroke-zinc-300"
            strokeWidth={1.5}
          />
          <line
            x1={xForIndex(0)}
            x2={xForIndex(0)}
            y1={padding.top}
            y2={height - padding.bottom}
            className="stroke-zinc-300"
            strokeWidth={1}
          />
          {yTicks.map((tick) => (
            <g key={`y-${tick}`}>
              <line
                x1={padding.left - 4}
                x2={padding.left}
                y1={yForValue(tick)}
                y2={yForValue(tick)}
                className="stroke-zinc-300"
                strokeWidth={1}
              />
              <text
                x={padding.left - 8}
                y={yForValue(tick) + 3}
                textAnchor="end"
                className="fill-zinc-500 text-[10px]"
              >
                {formatCurrency(tick)}
              </text>
            </g>
          ))}
          {xTicks.map((month) => (
            <g key={`x-${month}`}>
              <line
                x1={xForIndex(month)}
                x2={xForIndex(month)}
                y1={height - padding.bottom}
                y2={height - padding.bottom + 4}
                className="stroke-zinc-300"
                strokeWidth={1}
              />
              <text
                x={xForIndex(month)}
                y={height - padding.bottom + 16}
                textAnchor="middle"
                className="fill-zinc-500 text-[10px]"
              >
                {month}
              </text>
            </g>
          ))}
          {!isEmpty && paybackIndex >= 0 && (
            <>
              <line
                x1={xForIndex(paybackIndex)}
                x2={xForIndex(paybackIndex)}
                y1={padding.top}
                y2={height - padding.bottom}
                className="stroke-zinc-400"
                strokeDasharray="6 6"
                strokeWidth={1.5}
              />
              <text
                x={xForIndex(paybackIndex) + 6}
                y={padding.top + 12}
                className="fill-zinc-600 text-[10px]"
              >
                Payback
              </text>
            </>
          )}
          {!isEmpty && (
            <>
              <path
                d={buildLinePath(monthlyPoints)}
                className="fill-none stroke-zinc-500"
                strokeWidth={1.5}
              />
              <path
                d={buildLinePath(cumulativePoints)}
                className="fill-none stroke-blue-600"
                strokeWidth={2.5}
              />
            </>
          )}
          {hoverIndex !== null && !isEmpty && (
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
                className="fill-zinc-500"
              />
            </>
          )}
          <rect
            x={padding.left + 6}
            y={padding.top + 4}
            width={30}
            height={14}
            rx={7}
            className="fill-zinc-100"
          />
          <text x={padding.left + 14} y={padding.top + 14} className="fill-zinc-600 text-[10px]">
            CAC
          </text>
          <text
            x={padding.left}
            y={padding.top - 6}
            className="fill-zinc-500 text-[10px]"
          >
            Cash flow ($)
          </text>
          <text
            x={width / 2}
            y={height - 6}
            textAnchor="middle"
            className="fill-zinc-500 text-[10px]"
          >
            Month
          </text>
        </svg>
        {isEmpty && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-white/80 text-center">
            <p className="text-sm font-semibold text-zinc-900">Add revenue to see cash flow and payback</p>
            <p className="text-xs text-zinc-500">Hover points to inspect monthly values once computed.</p>
          </div>
        )}
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
  const [exampleLoaded, setExampleLoaded] = useState(false)

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
  const loadExample = () => {
    applyPreset(EXAMPLE_STATE)
    setExampleLoaded(true)
  }

  const sanitizedInputs = useMemo(
    () => ({
      termMonths: clampInteger(termMonths, INPUT_BOUNDS.termMonths.min, INPUT_BOUNDS.termMonths.max),
      renewals: clampInteger(renewals, INPUT_BOUNDS.renewals.min, INPUT_BOUNDS.renewals.max),
      escalationPercent: clampNumber(
        escalationPercent,
        INPUT_BOUNDS.escalationPercent.min,
        INPUT_BOUNDS.escalationPercent.max,
      ),
      renewalUpliftPercent: clampNumber(
        renewalUpliftPercent,
        INPUT_BOUNDS.renewalUpliftPercent.min,
        INPUT_BOUNDS.renewalUpliftPercent.max,
      ),
      renewalVolumeChangePercent: clampNumber(
        renewalVolumeChangePercent,
        INPUT_BOUNDS.renewalVolumeChangePercent.min,
        INPUT_BOUNDS.renewalVolumeChangePercent.max,
      ),
    }),
    [termMonths, renewals, escalationPercent, renewalUpliftPercent, renewalVolumeChangePercent],
  )

  const cacEnabled = cac > 0
  const cacForModel = cacEnabled ? cac : 0

  const aggressiveAssumptions =
    sanitizedInputs.renewals > 3 ||
    sanitizedInputs.renewalVolumeChangePercent > 50 ||
    sanitizedInputs.renewalUpliftPercent > 10 ||
    sanitizedInputs.escalationPercent > 5 ||
    sanitizedInputs.termMonths > 36

  const results = useMemo<CalculatedResults>(() => {
    const recognizedEarnings = buildRecognizedEarnings(
      sanitizedInputs.termMonths,
      sanitizedInputs.renewals,
      sanitizedInputs.escalationPercent,
      escalationPeriod,
      sanitizedInputs.renewalUpliftPercent,
      sanitizedInputs.renewalVolumeChangePercent,
      revenueLines,
      costMode,
      costLines,
    )
    const cashCollected = buildCashCollections(
      recognizedEarnings,
      sanitizedInputs.termMonths,
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
    if (cacEnabled) {
      let cumulative = 0
      for (let index = 0; index < cashCollected.length; index += 1) {
        cumulative += cashCollected[index]
        if (cumulative - cacForModel >= 0) {
          paybackMonth = index + 1
          break
        }
      }
    }

    const cocMultiple = cacEnabled ? totalRecognized / cacForModel : null
    const cumulativeCashCreated = totalCashCollected - cacForModel

    const irrMonthly = cacEnabled ? irr([-cacForModel, ...cashCollected]) : null
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
    cacEnabled,
    cacForModel,
    sanitizedInputs,
  ])

  const chartData = useMemo<ChartPoint[]>(() => {
    const data: ChartPoint[] = []
    let cumulative = -cacForModel
    data.push({
      month: 0,
      monthlyCash: -cacForModel,
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
  }, [cacForModel, results.cashCollected])

  const isEmptyState = results.totalRecognized === 0 && results.totalCashCollected === 0
  const showOutputsWarning =
    !isEmptyState &&
    ((results.cocMultiple !== null && results.cocMultiple > 100) ||
      (results.irrAnnualized !== null && results.irrAnnualized > 10) ||
      (results.paybackMonth !== null && results.paybackMonth < 1))

  const paybackLabel =
    isEmptyState || !cacEnabled
      ? '—'
      : results.paybackMonth === null
        ? 'No payback'
        : results.paybackMonth === 0
          ? 'Immediate'
          : `Month ${results.paybackMonth}`

  const verdictLine =
    isEmptyState
      ? 'Enter CAC and at least one revenue line to compute payback.'
      : !cacEnabled
        ? 'Payback is not defined when CAC ≤ 0.'
      : results.paybackMonth === null
        ? 'No payback within the modeled term.'
        : `Payback in month ${results.paybackMonth}.`

  const cocLine =
    isEmptyState || !cacEnabled
      ? ''
      : results.cocMultiple === null
        ? 'Returns pending.'
        : `${formatCurrency(results.cocMultiple)} returned for every $1 invested.`

  const summaryLine = cocLine ? `${verdictLine} ${cocLine}` : verdictLine

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
    <div className="flex min-h-screen flex-col bg-zinc-50 text-zinc-700">
      <header className="border-b border-zinc-200/80 bg-white/80">
        <div className="mx-auto flex min-h-14 max-w-6xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <Link
            href="/"
            className="rounded-full bg-zinc-100/70 px-3 py-1.5 text-sm font-semibold text-zinc-700 transition hover:bg-zinc-200/70 hover:text-zinc-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-400"
          >
            ← Back to main site
          </Link>
          <div className="flex flex-col items-end gap-1 text-sm font-semibold text-zinc-700">
            <div className="flex flex-wrap items-center justify-end gap-3">
              <button
                type="button"
                onClick={loadExample}
                className="rounded-full border border-zinc-300 bg-white px-3 py-1.5 hover:border-zinc-400"
              >
                Load example
              </button>
              <button
                type="button"
                onClick={() => {
                  resetAll()
                  setExampleLoaded(false)
                }}
                className="rounded-full border border-zinc-300 bg-white px-3 py-1.5 hover:border-zinc-400"
              >
                Reset
              </button>
            </div>
            {exampleLoaded && (
              <span className="text-xs font-normal text-zinc-500">
                Example: Mid-market SaaS deal (platform fee + seats), monthly billing.
              </span>
            )}
          </div>
        </div>
      </header>

      <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col px-4 py-6 sm:px-6 lg:py-8">
        <div className="grid flex-1 gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
          <section className="flex flex-col gap-6 rounded-3xl border border-zinc-300 bg-white p-6 shadow-sm">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-600">Calculator</p>
            </div>

            <div className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="text-xs font-semibold uppercase tracking-wide text-zinc-600">
                  CAC ($)
                  <input
                    type="number"
                    value={cac}
                    onChange={(event) => setCac(toNumber(event.target.value))}
                    className="mt-2 w-full rounded-xl border border-zinc-300 px-3 py-2 text-sm text-zinc-900"
                  />
                </label>
                <label className="text-xs font-semibold uppercase tracking-wide text-zinc-600">
                  Term (months)
                  <input
                    type="number"
                    value={termMonths}
                    min={INPUT_BOUNDS.termMonths.min}
                    max={INPUT_BOUNDS.termMonths.max}
                    step={1}
                    onChange={(event) =>
                      setTermMonths(
                        clampInteger(
                          toNumber(event.target.value),
                          INPUT_BOUNDS.termMonths.min,
                          INPUT_BOUNDS.termMonths.max,
                        ),
                      )
                    }
                    className="mt-2 w-full rounded-xl border border-zinc-300 px-3 py-2 text-sm text-zinc-900"
                  />
                </label>
                <label className="text-xs font-semibold uppercase tracking-wide text-zinc-600">
                  Billing frequency
                  <select
                    value={billingFrequency}
                    onChange={(event) => setBillingFrequency(event.target.value as BillingFrequency)}
                    className="mt-2 w-full rounded-xl border border-zinc-300 px-3 py-2 text-sm text-zinc-900"
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
                <button type="button" onClick={handleAddLine} className="text-sm font-semibold text-zinc-700">
                  + Add line
                </button>
              </div>
              <div className="space-y-3">
                {revenueLines.map((line) => {
                  const isExpanded = expandedLines.includes(line.id)
                  const summary = `${line.name} · ${formatCurrency(line.monthlyPrice)}/mo × ${line.volume} · ${line.margin}% margin`
                  return (
                    <div key={line.id} className="rounded-2xl border border-zinc-300 bg-white shadow-sm">
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
                            className="text-xs font-semibold uppercase tracking-wide text-zinc-600"
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
                          <label className="text-xs font-semibold uppercase tracking-wide text-zinc-600">
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
                              className="mt-2 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm text-zinc-900"
                            />
                          </label>
                          <label className="text-xs font-semibold uppercase tracking-wide text-zinc-600">
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
                              className="mt-2 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm text-zinc-900"
                            />
                          </label>
                          <label className="text-xs font-semibold uppercase tracking-wide text-zinc-600">
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
                              className="mt-2 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm text-zinc-900"
                            />
                          </label>
                          {costMode === 'margin' && (
                            <label className="text-xs font-semibold uppercase tracking-wide text-zinc-600">
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
                                className="mt-2 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm text-zinc-900"
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
                className="flex w-full items-center justify-between text-sm font-semibold text-zinc-800 hover:text-zinc-900"
              >
                <span>Advanced assumptions</span>
                <span className="text-sm text-zinc-500">{showAdvanced ? '▾' : '▸'}</span>
              </button>
              {showAdvanced && (
                <div className="space-y-4 rounded-2xl border border-zinc-200 bg-zinc-50 p-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <label className="text-xs font-semibold uppercase tracking-wide text-zinc-600">
                      Payment terms
                      <select
                        value={lagMonths}
                        onChange={(event) => setLagMonths(toNumber(event.target.value))}
                        className="mt-2 w-full rounded-xl border border-zinc-300 px-3 py-2 text-sm text-zinc-900"
                      >
                        <option value={0}>Due on receipt (0)</option>
                        <option value={1}>Net 30 (1)</option>
                        <option value={2}>Net 60 (2)</option>
                        <option value={3}>Net 90 (3)</option>
                      </select>
                    </label>
                    <label className="text-xs font-semibold uppercase tracking-wide text-zinc-600">
                      Escalation (%)
                      <input
                        type="number"
                        value={escalationPercent}
                        min={INPUT_BOUNDS.escalationPercent.min}
                        max={INPUT_BOUNDS.escalationPercent.max}
                        step={0.1}
                        onChange={(event) =>
                          setEscalationPercent(
                            clampNumber(
                              toNumber(event.target.value),
                              INPUT_BOUNDS.escalationPercent.min,
                              INPUT_BOUNDS.escalationPercent.max,
                            ),
                          )
                        }
                        className="mt-2 w-full rounded-xl border border-zinc-300 px-3 py-2 text-sm text-zinc-900"
                      />
                    </label>
                    <label className="text-xs font-semibold uppercase tracking-wide text-zinc-600">
                      Escalation cadence
                      <select
                        value={escalationPeriod}
                        onChange={(event) => setEscalationPeriod(event.target.value as EscalationPeriod)}
                        className="mt-2 w-full rounded-xl border border-zinc-300 px-3 py-2 text-sm text-zinc-900"
                      >
                        <option value="monthly">Monthly</option>
                        <option value="quarterly">Quarterly</option>
                        <option value="annual">Annual</option>
                      </select>
                    </label>
                    <label className="text-xs font-semibold uppercase tracking-wide text-zinc-600">
                      Renewals (#)
                      <input
                        type="number"
                        value={renewals}
                        min={INPUT_BOUNDS.renewals.min}
                        max={INPUT_BOUNDS.renewals.max}
                        step={1}
                        onChange={(event) =>
                          setRenewals(
                            clampInteger(
                              toNumber(event.target.value),
                              INPUT_BOUNDS.renewals.min,
                              INPUT_BOUNDS.renewals.max,
                            ),
                          )
                        }
                        className="mt-2 w-full rounded-xl border border-zinc-300 px-3 py-2 text-sm text-zinc-900"
                      />
                    </label>
                    <label className="text-xs font-semibold uppercase tracking-wide text-zinc-600">
                      Renewal uplift (%)
                      <input
                        type="number"
                        value={renewalUpliftPercent}
                        min={INPUT_BOUNDS.renewalUpliftPercent.min}
                        max={INPUT_BOUNDS.renewalUpliftPercent.max}
                        step={0.1}
                        onChange={(event) =>
                          setRenewalUpliftPercent(
                            clampNumber(
                              toNumber(event.target.value),
                              INPUT_BOUNDS.renewalUpliftPercent.min,
                              INPUT_BOUNDS.renewalUpliftPercent.max,
                            ),
                          )
                        }
                        className="mt-2 w-full rounded-xl border border-zinc-300 px-3 py-2 text-sm text-zinc-900"
                      />
                    </label>
                    <label className="text-xs font-semibold uppercase tracking-wide text-zinc-600">
                      Renewal volume change (%)
                      <input
                        type="number"
                        value={renewalVolumeChangePercent}
                        min={INPUT_BOUNDS.renewalVolumeChangePercent.min}
                        max={INPUT_BOUNDS.renewalVolumeChangePercent.max}
                        step={0.1}
                        onChange={(event) =>
                          setRenewalVolumeChangePercent(
                            clampNumber(
                              toNumber(event.target.value),
                              INPUT_BOUNDS.renewalVolumeChangePercent.min,
                              INPUT_BOUNDS.renewalVolumeChangePercent.max,
                            ),
                          )
                        }
                        className="mt-2 w-full rounded-xl border border-zinc-300 px-3 py-2 text-sm text-zinc-900"
                      />
                    </label>
                  </div>

                  <div className="space-y-3">
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-600">Cost mode</p>
                    <div className="flex flex-wrap gap-3">
                      <button
                        type="button"
                        onClick={() => setCostMode('margin')}
                        className={`rounded-full border px-4 py-1.5 text-xs font-semibold uppercase tracking-wide ${
                          costMode === 'margin'
                            ? 'border-blue-500 bg-blue-50 text-blue-700'
                            : 'border-zinc-300 text-zinc-700'
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
                            : 'border-zinc-300 text-zinc-700'
                        }`}
                      >
                        Line-item-driven
                      </button>
                    </div>
                  </div>

                  {costMode === 'line-item' && (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-600">Costs</p>
                        <button
                          type="button"
                          onClick={() => setCostLines((lines) => [...lines, createCostLine()])}
                          className="text-xs font-semibold text-zinc-700"
                        >
                          + Add cost
                        </button>
                      </div>
                      <div className="space-y-3">
                        {costLines.map((line) => (
                          <div key={line.id} className="rounded-2xl border border-zinc-300 bg-white p-3 shadow-sm">
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
                                className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm text-zinc-900"
                              />
                              <button
                                type="button"
                                onClick={() => setCostLines((lines) => lines.filter((item) => item.id !== line.id))}
                                className="text-xs font-semibold uppercase tracking-wide text-zinc-400 hover:text-zinc-600"
                              >
                                Remove
                              </button>
                            </div>
                            <label className="mt-3 block text-xs font-semibold uppercase tracking-wide text-zinc-600">
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
                                className="mt-2 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm text-zinc-900"
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

            {aggressiveAssumptions && (
              <div className="rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-xs text-zinc-500">
                Assumptions are aggressive for a typical SaaS contract. Results may overstate returns.
              </div>
            )}
          </section>

          <section className="flex flex-col gap-6 rounded-3xl border border-zinc-300 bg-white p-6 shadow-sm">
            {showOutputsWarning && (
              <div className="rounded-2xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-900">
                Results exceed realistic SaaS contract economics. Review renewal and expansion assumptions.
              </div>
            )}
            <div className="space-y-2">
              <p className="text-sm font-semibold text-zinc-900">Decision summary</p>
              <p className="text-sm text-zinc-600 break-words">{summaryLine}</p>
            </div>

            <dl className="grid gap-4 sm:grid-cols-3">
              <div className="rounded-2xl border border-zinc-300 p-4 shadow-sm">
                <dt className="text-xs font-semibold uppercase tracking-wide text-zinc-600">Payback period</dt>
                <dd className="mt-2 text-lg font-semibold text-zinc-950 break-words">{paybackLabel}</dd>
              </div>
              <div className="rounded-2xl border border-zinc-300 p-4 shadow-sm">
                <dt className="text-xs font-semibold uppercase tracking-wide text-zinc-600">CoC multiple</dt>
                <dd className="mt-2 text-lg font-semibold text-zinc-950 break-words">
                  {isEmptyState || !cacEnabled
                    ? '—'
                    : results.cocMultiple === null
                      ? '—'
                      : `${formatCompact(results.cocMultiple)}x`}
                </dd>
              </div>
              <div className="rounded-2xl border border-zinc-300 p-4 shadow-sm">
                <dt className="text-xs font-semibold uppercase tracking-wide text-zinc-600">Total earnings</dt>
                <dd className="mt-2 text-lg font-semibold text-zinc-950 break-words">
                  {isEmptyState ? '—' : formatCurrency(results.totalRecognized)}
                </dd>
              </div>
            </dl>
            {!cacEnabled && (
              <p className="text-xs text-zinc-500">Payback is not defined when CAC ≤ 0.</p>
            )}

            <div className="space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-sm font-semibold text-zinc-900">Cash flow over time</p>
                <div
                  className={`flex flex-wrap gap-4 text-xs font-semibold uppercase tracking-wide text-zinc-500 ${
                    isEmptyState ? 'opacity-40' : ''
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-zinc-500" /> Monthly cash flow
                  </span>
                  <span className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-blue-600" /> Cumulative cash flow
                  </span>
                </div>
              </div>
              <CashflowChart
                data={chartData}
                paybackMonth={isEmptyState ? null : results.paybackMonth}
                isEmpty={isEmptyState}
              />
              {!isEmptyState && (
                <div className="flex items-center justify-end text-xs text-zinc-500">
                  <span>Hover to inspect monthly values.</span>
                </div>
              )}
            </div>

            <div className="space-y-3">
              <button
                type="button"
                onClick={() => setShowDetails((value) => !value)}
                className="flex w-full items-center justify-between text-sm font-semibold text-zinc-800 hover:text-zinc-900"
              >
                <span>Details</span>
                <span className="text-sm text-zinc-500">{showDetails ? '▾' : '▸'}</span>
              </button>
              {showDetails && (
                <dl className="space-y-3 rounded-2xl border border-zinc-200 bg-zinc-50 p-4 text-sm">
                  <div className="flex items-center justify-between">
                    <dt className="text-zinc-600">Month 1 earnings</dt>
                    <dd className="font-semibold text-zinc-900 break-words">
                      {isEmptyState ? '—' : formatCurrency(results.monthOneEarnings)}
                    </dd>
                  </div>
                  <div className="flex items-center justify-between">
                    <dt className="text-zinc-600">Avg monthly earnings</dt>
                    <dd className="font-semibold text-zinc-900 break-words">
                      {isEmptyState ? '—' : formatCurrency(results.averageMonthlyEarnings)}
                    </dd>
                  </div>
                  <div className="flex items-center justify-between">
                    <dt className="text-zinc-600">Cumulative cash created</dt>
                    <dd className="font-semibold text-zinc-900 break-words">
                      {isEmptyState ? '—' : formatCurrency(results.cumulativeCashCreated)}
                    </dd>
                  </div>
                  <div className="flex items-center justify-between">
                    <dt className="text-zinc-600">
                      IRR (annualized)
                      <span className="ml-2 text-[11px] text-zinc-400" title="IRR is an optional, secondary view of return over time.">
                        (optional)
                      </span>
                    </dt>
                    <dd className="font-semibold text-zinc-900 break-words">
                      {isEmptyState || !cacEnabled || results.irrAnnualized === null
                        ? '—'
                        : formatPercent(results.irrAnnualized)}
                    </dd>
                  </div>
                </dl>
              )}
            </div>
          </section>
        </div>
      </div>

      {/* <footer className="border-t border-zinc-200/80 bg-white/80">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-end gap-4 px-4 text-sm font-semibold text-zinc-700 sm:px-6">
          <a href="mailto:ryandharma04@gmail.com" className="hover:text-zinc-900">
            Email
          </a>
          <a
            href="https://www.linkedin.com/in/ryandharma/"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-zinc-900"
          >
            LinkedIn
          </a>
        </div>
      </footer> */}
    </div>
  )
}
