export type BillingFrequency = 'monthly' | 'quarterly' | 'annual'

export type EscalationPeriodicity = 'monthly' | 'quarterly' | 'annual'

export type CostMode = 'margin' | 'line-item'

export interface RevenueLine {
  id: string
  name: string
  price: number
  volume: number
  margin: number
}

export interface CostItem {
  id: string
  name: string
  monthlyCost: number
}

export interface CalculatorInputs {
  cac: number
  termMonths: number
  renewals: number
  billingFrequency: BillingFrequency
  paymentLagMonths: number
  escalationPercent: number
  escalationPeriodicity: EscalationPeriodicity
  renewalPriceUplift: number
  renewalVolumeChange: number
  revenueLines: RevenueLine[]
  costMode: CostMode
  costItems: CostItem[]
}

export interface CalculatorResult {
  totalMonths: number
  recognizedRevenue: number[]
  incrementalEarnings: number[]
  cashCollected: number[]
  cashflow: number[]
  monthOneEarnings: number
  totalIncrementalEarnings: number
  averageMonthlyEarnings: number
  cumulativeCashCreated: number
  paybackMonth: number | null
  breakevenMonth: number | null
  cashOnCashMultiple: number | null
  irrMonthly: number | null
  irrAnnual: number | null
  simplePaybackRatio: number | null
}

function escalationSteps(month: number, periodicity: EscalationPeriodicity): number {
  const zeroIndexed = month - 1
  if (zeroIndexed <= 0) return 0

  if (periodicity === 'monthly') {
    return zeroIndexed
  }

  if (periodicity === 'quarterly') {
    return Math.floor(zeroIndexed / 3)
  }

  return Math.floor(zeroIndexed / 12)
}

function revenueForLine(
  line: RevenueLine,
  month: number,
  inputs: Pick<CalculatorInputs, 'termMonths' | 'renewals' | 'escalationPercent' | 'escalationPeriodicity' | 'renewalPriceUplift' | 'renewalVolumeChange'>,
): number {
  const renewalCount = Math.floor((month - 1) / inputs.termMonths)
  const clampedRenewals = Math.min(inputs.renewals, renewalCount)
  const renewalPriceFactor = Math.pow(1 + inputs.renewalPriceUplift / 100, clampedRenewals)
  const renewalVolumeFactor = Math.pow(1 + inputs.renewalVolumeChange / 100, clampedRenewals)

  const priceEscalationFactor = Math.pow(1 + inputs.escalationPercent / 100, escalationSteps(month, inputs.escalationPeriodicity))

  const price = line.price * renewalPriceFactor * priceEscalationFactor
  const volume = line.volume * renewalVolumeFactor

  return price * volume
}

function recognizedEarningsForMonth(
  month: number,
  inputs: CalculatorInputs,
  recognizedRevenue: number,
): number {
  if (inputs.costMode === 'margin') {
    const marginWeighted = inputs.revenueLines.reduce((total, line) => {
      const revenue = revenueForLine(line, month, inputs)
      return total + revenue * (line.margin / 100)
    }, 0)
    return marginWeighted
  }

  const monthlyCosts = inputs.costItems.reduce((sum, item) => sum + (Number.isFinite(item.monthlyCost) ? item.monthlyCost : 0), 0)
  return recognizedRevenue - monthlyCosts
}

function buildCashCollections(
  incrementalEarnings: number[],
  billingFrequency: BillingFrequency,
  paymentLagMonths: number,
  termMonths: number,
): number[] {
  const collections: number[] = []

  const pushAt = (index: number, value: number) => {
    if (!Number.isFinite(value) || value === 0) return
    while (collections.length <= index) {
      collections.push(0)
    }
    collections[index] += value
  }

  if (billingFrequency === 'monthly') {
    incrementalEarnings.forEach((value, idx) => {
      pushAt(idx + paymentLagMonths, value)
    })
    return collections
  }

  if (billingFrequency === 'quarterly') {
    for (let start = 0; start < incrementalEarnings.length; start += 3) {
      const invoice = incrementalEarnings.slice(start, start + 3).reduce((sum, val) => sum + val, 0)
      pushAt(start + paymentLagMonths, invoice)
    }
    return collections
  }

  for (let start = 0; start < incrementalEarnings.length; start += termMonths) {
    const invoice = incrementalEarnings.slice(start, start + termMonths).reduce((sum, val) => sum + val, 0)
    pushAt(start + paymentLagMonths, invoice)
  }

  return collections
}

function paybackMonthFromCashflow(cashflow: number[]): number | null {
  let cumulative = 0
  for (let i = 0; i < cashflow.length; i++) {
    cumulative += cashflow[i]
    if (cumulative >= 0) {
      return i
    }
  }
  return null
}

function npv(rate: number, cashflows: number[]): number {
  return cashflows.reduce((total, cf, idx) => total + cf / Math.pow(1 + rate, idx), 0)
}

function npvDerivative(rate: number, cashflows: number[]): number {
  return cashflows.reduce((total, cf, idx) => {
    if (idx === 0) return total
    const factor = Math.pow(1 + rate, idx + 1)
    return total - (idx * cf) / factor
  }, 0)
}

function computeIRR(cashflows: number[]): number | null {
  if (cashflows.length < 2) return null

  const min = Math.min(...cashflows)
  const max = Math.max(...cashflows)
  if (min >= 0 || max <= 0) return null

  // Newton-Raphson search
  let guess = 0.1
  for (let i = 0; i < 50; i++) {
    const value = npv(guess, cashflows)
    const derivative = npvDerivative(guess, cashflows)
    if (Math.abs(value) < 1e-7) return guess
    if (derivative === 0 || Number.isNaN(derivative)) break
    const next = guess - value / derivative
    if (!Number.isFinite(next) || next <= -0.999999) break
    guess = next
  }

  // Bisection fallback
  let low = -0.9999
  let high = 1.5
  let attempts = 0
  while (npv(low, cashflows) * npv(high, cashflows) > 0 && attempts < 10) {
    high *= 2
    attempts += 1
  }

  const lowNPV = npv(low, cashflows)
  const highNPV = npv(high, cashflows)
  if (lowNPV * highNPV > 0) return null

  for (let i = 0; i < 80; i++) {
    const mid = (low + high) / 2
    const midNPV = npv(mid, cashflows)
    if (Math.abs(midNPV) < 1e-7 || high - low < 1e-7) {
      return mid
    }
    if (npv(low, cashflows) * midNPV < 0) {
      high = mid
    } else {
      low = mid
    }
  }

  return (low + high) / 2
}

export function runContractCalculator(inputs: CalculatorInputs): CalculatorResult {
  const totalMonths = Math.max(0, Math.floor(inputs.termMonths)) * (1 + Math.max(0, Math.floor(inputs.renewals)))

  const recognizedRevenue: number[] = []
  const incrementalEarnings: number[] = []

  for (let month = 1; month <= totalMonths; month++) {
    const monthlyRevenue = inputs.revenueLines.reduce((sum, line) => sum + revenueForLine(line, month, inputs), 0)
    recognizedRevenue.push(monthlyRevenue)
    incrementalEarnings.push(recognizedEarningsForMonth(month, inputs, monthlyRevenue))
  }

  const cashCollected = buildCashCollections(incrementalEarnings, inputs.billingFrequency, inputs.paymentLagMonths, inputs.termMonths)

  const cashflow: number[] = [-inputs.cac]
  cashCollected.forEach((value) => cashflow.push(value))

  const totalIncrementalEarnings = incrementalEarnings.reduce((sum, value) => sum + value, 0)
  const averageMonthlyEarnings = totalMonths > 0 ? totalIncrementalEarnings / totalMonths : 0
  const cumulativeCashCreated = totalIncrementalEarnings - inputs.cac

  const paybackMonth = paybackMonthFromCashflow(cashflow)
  const cashOnCashMultiple = inputs.cac > 0 ? totalIncrementalEarnings / inputs.cac : null
  const irrMonthly = computeIRR(cashflow)
  const irrAnnual = irrMonthly !== null ? Math.pow(1 + irrMonthly, 12) - 1 : null
  const simplePaybackRatio = averageMonthlyEarnings > 0 ? inputs.cac / averageMonthlyEarnings : null

  return {
    totalMonths,
    recognizedRevenue,
    incrementalEarnings,
    cashCollected,
    cashflow,
    monthOneEarnings: incrementalEarnings[0] ?? 0,
    totalIncrementalEarnings,
    averageMonthlyEarnings,
    cumulativeCashCreated,
    paybackMonth,
    breakevenMonth: paybackMonth,
    cashOnCashMultiple,
    irrMonthly,
    irrAnnual,
    simplePaybackRatio,
  }
}
