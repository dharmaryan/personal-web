import type { Metadata } from 'next'
import PostLayout from '@/components/PostLayout'
import ContractReturnsCalculator from './ContractReturnsCalculator'

export const metadata: Metadata = {
  title: 'Contract Returns Calculator – Ryan Dharma',
  description: 'A lightweight contract-level unit economics & returns model.',
}

export default function ContractReturnsCalculatorPage() {
  return (
    <PostLayout
      label="CASE STUDY"
      title="Contract Returns Calculator"
      summary="A lightweight contract-level unit economics & returns model."
      author="Ryan Dharma"
      date="Mar 10, 2025"
      backHref="/"
      backLabel="← Back to main site"
    >
      <p>
        This lightweight calculator makes it easy to model contract-level incremental earnings,
        cash collection timing, and returns for recurring revenue deals.
      </p>
      <div className="mt-10">
        <ContractReturnsCalculator />
      </div>
    </PostLayout>
  )
}
