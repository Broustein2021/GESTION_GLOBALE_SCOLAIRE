import { UserPlus, Download, Users, GraduationCap, AlertTriangle } from 'lucide-react'

import { PageHeader } from '@/components/page-header'
import { LinkButton } from '@/components/link-button'
import { StatCard } from '@/components/stat-card'
import { Button } from '@/components/ui/button'
import { ElevesTable } from '@/components/eleves/eleves-table'
import { getEleves } from '@/lib/queries/eleves'

export const metadata = { title: 'Élèves — GESTION-SCOLAIRE' }

export default async function ElevesPage() {
  const eleves = await getEleves()

  const nouveaux = eleves.filter((e) => e.statut === 'nouveau').length
  const enRetard = eleves.filter((e) => e.statutPaiement === 'retard').length
  const niveaux = Array.from(new Set(eleves.map((e) => e.niveau).filter((n): n is string => Boolean(n))))

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

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Élèves inscrits" value={eleves.length} icon={Users} />
        <StatCard
          label="Niveaux représentés"
          value={niveaux.length}
          icon={GraduationCap}
          accent="sky"
        />
        <StatCard label="Nouveaux élèves" value={nouveaux} icon={UserPlus} accent="amber" />
        <StatCard
          label="Paiements en retard"
          value={enRetard}
          icon={AlertTriangle}
          accent="rose"
        />
      </div>

      <ElevesTable eleves={eleves} niveaux={niveaux} />
    </>
  )
}
