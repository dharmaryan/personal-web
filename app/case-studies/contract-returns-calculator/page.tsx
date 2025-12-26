import type { Metadata } from 'next'
import ContractReturnsCalculator from './ContractReturnsCalculator'

export const metadata: Metadata = {
  title: 'Contract Returns Calculator – Ryan Dharma',
  description: 'A lightweight contract-level unit economics & returns model.',
}

export default function ContractReturnsCalculatorPage() {
  return (
    <main className="bg-white text-zinc-700">
      <ContractReturnsCalculator />
    </main>
  )
}
