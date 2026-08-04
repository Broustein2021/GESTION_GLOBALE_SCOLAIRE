import { UserPlus, Download } from 'lucide-react'

import { PageHeader } from '@/components/page-header'
import { LinkButton } from '@/components/link-button'
import { Button } from '@/components/ui/button'
import { ElevesTable } from '@/components/eleves/eleves-table'

export const metadata = { title: 'Élèves — GESTION-SCOLAIRE' }

export default function ElevesPage() {
  return (
    <>
      <PageHeader
        title="Élèves"
        description="Liste, recherche et gestion des dossiers élèves"
      >
        <Button variant="outline">
          <Download className="size-4" data-icon="inline-start" />
          Exporter
        </Button>
        <LinkButton href="/inscriptions">
          <UserPlus className="size-4" data-icon="inline-start" />
          Inscrire un élève
        </LinkButton>
      </PageHeader>
      <ElevesTable />
    </>
  )
}
