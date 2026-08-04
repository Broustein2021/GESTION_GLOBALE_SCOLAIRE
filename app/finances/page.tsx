import { Download } from 'lucide-react'

import { PageHeader } from '@/components/page-header'
import { Button } from '@/components/ui/button'
import { FinancesPanel } from '@/components/finances/finances-panel'
import { etablissement } from '@/lib/data'

export const metadata = { title: 'Frais & Paiements — GESTION-SCOLAIRE' }

export default function FinancesPage() {
  return (
    <>
      <PageHeader
        title="Frais & Paiements"
        description={`Encaissements, soldes et reçus — ${etablissement.anneeScolaire}, ${etablissement.periodeCourante}`}
      >
        <Button variant="outline">
          <Download className="size-4" data-icon="inline-start" />
          Exporter
        </Button>
      </PageHeader>
      <FinancesPanel />
    </>
  )
}
