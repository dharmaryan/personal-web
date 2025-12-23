"use client";

import { useMemo, useState } from "react";
import {
  BillingFrequency,
  CalculatorInputs,
  CostItem,
  CostMode,
  EscalationPeriodicity,
  RevenueLine,
  runContractCalculator,
} from "@/lib/contractCalculator";

type UpdateField<T> = <K extends keyof T>(key: K, value: T[K]) => void;

const currency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

const percent = (value: number | null) =>
  value === null ? "n/a" : `${(value * 100).toFixed(1)}%`;

const defaultRevenueLine = (): RevenueLine => ({
  id: crypto.randomUUID(),
  name: "",
  price: 0,
  volume: 1,
  margin: 70,
});

const defaultCostItem = (): CostItem => ({
  id: crypto.randomUUID(),
  name: "",
  monthlyCost: 0,
});

const initialInputs: CalculatorInputs = {
  cac: 10000,
  termMonths: 12,
  renewals: 1,
  billingFrequency: "monthly",
  paymentLagMonths: 0,
  escalationPercent: 0,
  escalationPeriodicity: "annual",
  renewalPriceUplift: 0,
  renewalVolumeChange: 0,
  revenueLines: [defaultRevenueLine()],
  costMode: "margin",
  costItems: [defaultCostItem()],
};

const exampleInputs = (): CalculatorInputs => ({
  cac: 25000,
  termMonths: 12,
  renewals: 2,
  billingFrequency: "monthly",
  paymentLagMonths: 1,
  escalationPercent: 3,
  escalationPeriodicity: "annual",
  renewalPriceUplift: 5,
  renewalVolumeChange: 10,
  revenueLines: [
    { id: crypto.randomUUID(), name: "Platform", price: 2000, volume: 1, margin: 80 },
    { id: crypto.randomUUID(), name: "Seats", price: 50, volume: 50, margin: 70 },
  ],
  costMode: "margin",
  costItems: [],
});

function Section({ title, description, children }: { title: string; description?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-4 rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
      <div className="space-y-1">
        <h3 className="text-lg font-semibold text-zinc-950">{title}</h3>
        {description && <p className="text-sm text-zinc-600">{description}</p>}
      </div>
      {children}
    </div>
  );
}

function NumberField({
  label,
  value,
  onChange,
  min,
  step = 1,
  suffix,
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  step?: number;
  suffix?: string;
}) {
  return (
    <label className="flex flex-col gap-1 text-sm text-zinc-700">
      <span className="font-medium text-zinc-900">{label}</span>
      <div className="flex items-center gap-2 rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2">
        <input
          type="number"
          className="w-full bg-transparent text-base text-zinc-900 outline-none"
          value={Number.isFinite(value) ? value : ""}
          min={min}
          step={step}
          onChange={(e) => onChange(Number(e.target.value))}
        />
        {suffix && <span className="text-xs text-zinc-500">{suffix}</span>}
      </div>
    </label>
  );
}

function SelectField<T extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: T;
  options: { label: string; value: T }[];
  onChange: (value: T) => void;
}) {
  return (
    <label className="flex flex-col gap-1 text-sm text-zinc-700">
      <span className="font-medium text-zinc-900">{label}</span>
      <select
        className="rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 text-base text-zinc-900 outline-none"
        value={value}
        onChange={(e) => onChange(e.target.value as T)}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}

function RevenueLines({
  revenueLines,
  costMode,
  onChange,
}: {
  revenueLines: RevenueLine[];
  costMode: CostMode;
  onChange: (lines: RevenueLine[]) => void;
}) {
  const updateLine = (id: string, patch: Partial<RevenueLine>) => {
    onChange(revenueLines.map((line) => (line.id === id ? { ...line, ...patch } : line)));
  };

  const addLine = () => onChange([...revenueLines, defaultRevenueLine()]);
  const removeLine = (id: string) => onChange(revenueLines.filter((line) => line.id !== id));

  return (
    <div className="space-y-4">
      {revenueLines.map((line) => (
        <div key={line.id} className="space-y-3 rounded-xl border border-zinc-200 bg-white px-4 py-3 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <input
              className="w-full rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm text-zinc-900 outline-none"
              placeholder="Line item name"
              value={line.name}
              onChange={(e) => updateLine(line.id, { name: e.target.value })}
            />
            {revenueLines.length > 1 && (
              <button
                className="text-xs font-semibold text-red-500 hover:text-red-600"
                onClick={() => removeLine(line.id)}
                type="button"
              >
                Remove
              </button>
            )}
          </div>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            <NumberField label="Monthly price" value={line.price} onChange={(val) => updateLine(line.id, { price: val })} />
            <NumberField label="Volume" value={line.volume} onChange={(val) => updateLine(line.id, { volume: val })} />
            {costMode === "margin" && (
              <NumberField
                label="Margin %"
                value={line.margin}
                onChange={(val) => updateLine(line.id, { margin: val })}
                suffix="%"
              />
            )}
          </div>
        </div>
      ))}
      <button
        className="w-full rounded-lg border border-dashed border-zinc-300 px-4 py-2 text-sm font-semibold text-zinc-700 hover:border-zinc-400"
        type="button"
        onClick={addLine}
      >
        + Add revenue line
      </button>
    </div>
  );
}

function CostItems({ costItems, onChange }: { costItems: CostItem[]; onChange: (items: CostItem[]) => void }) {
  const updateItem = (id: string, patch: Partial<CostItem>) => {
    onChange(costItems.map((item) => (item.id === id ? { ...item, ...patch } : item)));
  };
  const addItem = () => onChange([...costItems, defaultCostItem()]);
  const removeItem = (id: string) => onChange(costItems.filter((item) => item.id !== id));

  return (
    <div className="space-y-4">
      {costItems.map((item) => (
        <div key={item.id} className="flex flex-col gap-3 rounded-xl border border-zinc-200 bg-white px-4 py-3 shadow-sm md:flex-row md:items-center">
          <input
            className="w-full rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm text-zinc-900 outline-none"
            placeholder="Cost name"
            value={item.name}
            onChange={(e) => updateItem(item.id, { name: e.target.value })}
          />
          <NumberField label="Monthly cost" value={item.monthlyCost} onChange={(val) => updateItem(item.id, { monthlyCost: val })} />
          {costItems.length > 1 && (
            <button className="text-xs font-semibold text-red-500 hover:text-red-600" type="button" onClick={() => removeItem(item.id)}>
              Remove
            </button>
          )}
        </div>
      ))}
      <button
        className="w-full rounded-lg border border-dashed border-zinc-300 px-4 py-2 text-sm font-semibold text-zinc-700 hover:border-zinc-400"
        type="button"
        onClick={addItem}
      >
        + Add cost item
      </button>
    </div>
  );
}

function Stat({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="flex flex-col gap-1 rounded-xl border border-zinc-200 bg-white p-4 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-[0.12em] text-zinc-500">{label}</p>
      <p className="text-2xl font-semibold text-zinc-950">{value}</p>
      {hint && <p className="text-xs text-zinc-500">{hint}</p>}
    </div>
  );
}

function CashflowTable({ cashflow, start }: { cashflow: number[]; start: number }) {
  const rows = cashflow.slice(start, start + 24);
  return (
    <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-zinc-200 px-4 py-3">
        <h4 className="text-sm font-semibold text-zinc-900">Cashflow by month</h4>
        <span className="text-xs text-zinc-500">
          Showing months {start} - {start + rows.length - 1}
        </span>
      </div>
      <div className="max-h-[440px] overflow-y-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-zinc-50 text-zinc-600">
            <tr>
              <th className="px-4 py-2 text-left font-medium">Month</th>
              <th className="px-4 py-2 text-right font-medium">Cashflow</th>
              <th className="px-4 py-2 text-right font-medium">Cumulative</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100">
            {rows.map((value, idx) => {
              const monthIndex = start + idx;
              const cumulative = cashflow.slice(0, monthIndex + 1).reduce((sum, v) => sum + v, 0);
              return (
                <tr key={monthIndex} className="hover:bg-zinc-50">
                  <td className="px-4 py-2 font-medium text-zinc-900">{monthIndex}</td>
                  <td className="px-4 py-2 text-right text-zinc-800">{currency.format(value)}</td>
                  <td className="px-4 py-2 text-right text-zinc-800">{currency.format(cumulative)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function HowItWorks() {
  return (
    <div className="space-y-3 rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
      <h3 className="text-lg font-semibold text-zinc-950">How it works</h3>
      <ol className="space-y-3 text-sm text-zinc-700">
        <li className="flex gap-3">
          <span className="mt-0.5 h-6 w-6 rounded-full bg-zinc-900 text-center text-xs font-semibold text-white">1</span>
          <div>
            <p className="font-semibold text-zinc-900">Set the commercial terms.</p>
            <p>Term length, renewals, billing cadence, and collection lag shape when cash lands.</p>
          </div>
        </li>
        <li className="flex gap-3">
          <span className="mt-0.5 h-6 w-6 rounded-full bg-zinc-900 text-center text-xs font-semibold text-white">2</span>
          <div>
            <p className="font-semibold text-zinc-900">Model revenue & escalation.</p>
            <p>Monthly prices/volumes escalate inside a term; uplifts and volume changes apply at renewals.</p>
          </div>
        </li>
        <li className="flex gap-3">
          <span className="mt-0.5 h-6 w-6 rounded-full bg-zinc-900 text-center text-xs font-semibold text-white">3</span>
          <div>
            <p className="font-semibold text-zinc-900">Choose cost treatment.</p>
            <p>Use margin-based earnings or explicit monthly costs for a more granular view.</p>
          </div>
        </li>
        <li className="flex gap-3">
          <span className="mt-0.5 h-6 w-6 rounded-full bg-zinc-900 text-center text-xs font-semibold text-white">4</span>
          <div>
            <p className="font-semibold text-zinc-900">Track cash & returns.</p>
            <p>CAC is paid at month 0. Invoicing follows billing frequency and payment terms, then IRR and payback are derived.</p>
          </div>
        </li>
      </ol>
    </div>
  );
}

export default function ContractReturnsCalculatorPage() {
  const [inputs, setInputs] = useState<CalculatorInputs>(initialInputs);
  const [tableStart, setTableStart] = useState(0);

  const updateField: UpdateField<CalculatorInputs> = (key, value) => {
    setInputs((prev) => ({ ...prev, [key]: value }));
  };

  const results = useMemo(() => runContractCalculator(inputs), [inputs]);

  const paybackLabel = results.paybackMonth === null ? "Never" : `Month ${results.paybackMonth}`;

  return (
    <main className="min-h-screen bg-gradient-to-b from-zinc-50 to-white px-4 py-10 text-zinc-900 md:px-8 lg:px-12">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8">
        <header className="flex flex-col gap-3">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-zinc-600">Case study tool</p>
          <h1 className="text-4xl font-semibold text-zinc-950 md:text-5xl">Contract Returns Calculator</h1>
          <p className="text-lg text-zinc-700 md:max-w-3xl">
            A lightweight contract-level unit economics &amp; returns model. Model cash collection timing, escalation, renewals, and margin to see payback, IRR, and cash-on-cash in seconds.
          </p>
          <div className="flex flex-wrap gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500">
            <span className="rounded-full bg-zinc-900 px-3 py-1 text-white">Deterministic</span>
            <span className="rounded-full border border-zinc-300 px-3 py-1">Client-side only</span>
          </div>
        </header>

        <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-6">
            <Section title="Deal & timing" description="Commercial terms that govern price growth, renewals, and cash collection.">
              <div className="grid gap-4 md:grid-cols-2">
                <NumberField label="CAC (paid month 0)" value={inputs.cac} onChange={(val) => updateField("cac", val)} />
                <NumberField label="Term (months)" value={inputs.termMonths} min={1} onChange={(val) => updateField("termMonths", val)} />
                <NumberField label="Number of renewals" value={inputs.renewals} min={0} step={1} onChange={(val) => updateField("renewals", val)} />
                <SelectField<BillingFrequency>
                  label="Billing frequency"
                  value={inputs.billingFrequency}
                  onChange={(val) => updateField("billingFrequency", val)}
                  options={[
                    { value: "monthly", label: "Monthly" },
                    { value: "quarterly", label: "Quarterly" },
                    { value: "annual", label: "Annual upfront" },
                  ]}
                />
                <SelectField<number>
                  label="Payment terms (collection lag)"
                  value={inputs.paymentLagMonths}
                  onChange={(val) => updateField("paymentLagMonths", Number(val))}
                  options={[
                    { value: 0, label: "Due on receipt (0d)" },
                    { value: 1, label: "Net 30 (~1 month)" },
                    { value: 2, label: "Net 60 (~2 months)" },
                    { value: 3, label: "Net 90 (~3 months)" },
                  ]}
                />
                <NumberField label="Escalation %" value={inputs.escalationPercent} onChange={(val) => updateField("escalationPercent", val)} suffix="%" />
                <SelectField<EscalationPeriodicity>
                  label="Escalation cadence"
                  value={inputs.escalationPeriodicity}
                  onChange={(val) => updateField("escalationPeriodicity", val)}
                  options={[
                    { value: "monthly", label: "Monthly" },
                    { value: "quarterly", label: "Quarterly" },
                    { value: "annual", label: "Annual" },
                  ]}
                />
              </div>
            </Section>

            <Section title="Renewal adjustments" description="Apply uplift and volume changes at the start of each renewal term.">
              <div className="grid gap-4 md:grid-cols-2">
                <NumberField label="% price uplift on renewal" value={inputs.renewalPriceUplift} suffix="%" onChange={(val) => updateField("renewalPriceUplift", val)} />
                <NumberField label="% volume change at renewal" value={inputs.renewalVolumeChange} suffix="%" onChange={(val) => updateField("renewalVolumeChange", val)} />
              </div>
            </Section>

            <Section title="Revenue lines" description="Monthly price/volume per line with optional margin if using margin-driven earnings.">
              <RevenueLines
                revenueLines={inputs.revenueLines}
                costMode={inputs.costMode}
                onChange={(lines) => updateField("revenueLines", lines)}
              />
            </Section>

            <Section title="Cost treatment" description="Toggle between margin-driven earnings or explicit monthly costs.">
              <div className="flex flex-wrap gap-3">
                {(["margin", "line-item"] as CostMode[]).map((mode) => (
                  <button
                    key={mode}
                    type="button"
                    className={`rounded-full px-4 py-2 text-sm font-semibold ${
                      inputs.costMode === mode ? "bg-zinc-900 text-white" : "border border-zinc-300 text-zinc-800 hover:border-zinc-400"
                    }`}
                    onClick={() => updateField("costMode", mode)}
                  >
                    {mode === "margin" ? "Margin-driven" : "Line-item-driven"}
                  </button>
                ))}
              </div>
              {inputs.costMode === "line-item" && (
                <div className="pt-2">
                  <CostItems costItems={inputs.costItems} onChange={(items) => updateField("costItems", items)} />
                </div>
              )}
            </Section>

            <Section title="Presets & helpers">
              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-semibold text-white hover:bg-zinc-800"
                  onClick={() => {
                    setInputs(exampleInputs());
                    setTableStart(0);
                  }}
                >
                  Load example
                </button>
                <button
                  type="button"
                  className="rounded-lg border border-zinc-300 px-4 py-2 text-sm font-semibold text-zinc-800 hover:border-zinc-400"
                  onClick={() => {
                    setInputs({ ...initialInputs, revenueLines: [defaultRevenueLine()], costItems: [defaultCostItem()] });
                    setTableStart(0);
                  }}
                >
                  Reset
                </button>
              </div>
            </Section>

            <HowItWorks />
          </div>

          <div className="space-y-6 lg:sticky lg:top-10">
            <div className="space-y-4 rounded-3xl border border-zinc-200 bg-white p-6 shadow-md">
              <h3 className="text-lg font-semibold text-zinc-950">Outputs</h3>
              <div className="grid gap-3 md:grid-cols-2">
                <Stat label="Month 1 earnings" value={currency.format(results.monthOneEarnings)} />
                <Stat label="Avg. monthly earnings" value={currency.format(results.averageMonthlyEarnings)} />
                <Stat label="Total incremental earnings" value={currency.format(results.totalIncrementalEarnings)} />
                <Stat label="Cumulative cash created" value={currency.format(results.cumulativeCashCreated)} />
                <Stat label="Payback month" value={paybackLabel} hint="Primary payback based on cumulative cashflow" />
                <Stat label="Simple CAC / avg. earnings" value={results.simplePaybackRatio ? `${results.simplePaybackRatio.toFixed(1)} months` : "n/a"} />
                <Stat label="Cash-on-cash multiple" value={results.cashOnCashMultiple ? results.cashOnCashMultiple.toFixed(2) + "x" : "n/a"} />
                <Stat label="IRR (annualized)" value={percent(results.irrAnnual)} hint="Computed from monthly cashflows" />
              </div>
            </div>

            <CashflowTable cashflow={results.cashflow} start={tableStart} />
            <div className="flex items-center justify-between rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-700 shadow-sm">
              <div className="flex items-center gap-2">
                <button
                  className="rounded-lg border border-zinc-300 px-3 py-1 font-semibold hover:border-zinc-400"
                  onClick={() => setTableStart((prev) => Math.max(0, prev - 24))}
                >
                  ← Previous
                </button>
                <button
                  className="rounded-lg border border-zinc-300 px-3 py-1 font-semibold hover:border-zinc-400"
                  onClick={() => setTableStart((prev) => prev + 24)}
                >
                  Next →
                </button>
              </div>
              <span className="text-xs text-zinc-500">Month 0 includes CAC outflow</span>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
