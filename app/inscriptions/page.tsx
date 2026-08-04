import { UserPlus, Users, Wallet, CalendarCheck } from 'lucide-react'

import { PageHeader } from '@/components/page-header'
import { StatCard } from '@/components/stat-card'
import { InscriptionWizard } from '@/components/inscriptions/inscription-wizard'
import { InscriptionsTable } from '@/components/inscriptions/inscriptions-table'
import { eleves, etablissement, formatFCFA, kpis } from '@/lib/data'

export const metadata = { title: 'Inscriptions — GESTION-SCOLAIRE' }

export default function InscriptionsPage() {
  const nouveaux = eleves.filter((e) => e.statut === 'nouveau').length
  const reinscriptions = eleves.filter((e) => e.statut === 'inscrit').length
  const attenduInscriptions = eleves.reduce((s, e) => s + e.montantDu, 0)

  return (
    <>
      <PageHeader
        title="Inscriptions"
        description={`Dossiers d'inscription — année scolaire ${etablissement.anneeScolaire}`}
      >
        <InscriptionWizard />
      </PageHeader>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Dossiers ouverts"
          value={kpis.totalEleves}
          hint="Élèves inscrits cette année"
          icon={Users}
        />
        <StatCard
          label="Nouveaux élèves"
          value={nouveaux}
          hint="Première inscription"
          icon={UserPlus}
          accent="sky"
        />
        <StatCard
          label="Réinscriptions"
          value={reinscriptions}
          hint="Anciens élèves"
          icon={CalendarCheck}
          accent="amber"
        />
        <StatCard
          label="Frais engagés"
          value={formatFCFA(attenduInscriptions)}
          hint="Inscriptions + scolarité"
          icon={Wallet}
          accent="rose"
        />
      </div>

      <InscriptionsTable />
    </>
  )
}
