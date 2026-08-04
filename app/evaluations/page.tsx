import { CalendarClock, CheckCircle2, ClipboardList, Plus } from 'lucide-react'

import { PageHeader } from '@/components/page-header'
import { StatCard } from '@/components/stat-card'
import { Button } from '@/components/ui/button'
import {
  EvaluationsTable,
  EvaluationDialog,
} from '@/components/evaluations/evaluations-table'
import { etablissement, evaluations } from '@/lib/data'

export const metadata = { title: 'Évaluations — GESTION-SCOLAIRE' }

export default function EvaluationsPage() {
  const planifiees = evaluations.filter((e) => e.statut === 'planifiee').length
  const saisies = evaluations.filter((e) => e.statut === 'saisie').length
  const validees = evaluations.filter((e) => e.statut === 'validee').length

  return (
    <>
      <PageHeader
        title="Évaluations"
        description={`Devoirs, interrogations et compositions — ${etablissement.periodeCourante}`}
      >
        <EvaluationDialog
          trigger={
            <Button>
              <Plus className="size-4" data-icon="inline-start" />
              Créer une évaluation
            </Button>
          }
        />
      </PageHeader>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Évaluations"
          value={evaluations.length}
          hint="Période en cours"
          icon={ClipboardList}
        />
        <StatCard
          label="Planifiées"
          value={planifiees}
          hint="Notes non saisies"
          icon={CalendarClock}
          accent="sky"
        />
        <StatCard
          label="Saisies"
          value={saisies}
          hint="En attente de validation"
          icon={ClipboardList}
          accent="amber"
        />
        <StatCard
          label="Validées"
          value={validees}
          hint="Intégrées aux moyennes"
          icon={CheckCircle2}
        />
      </div>

      <EvaluationsTable />
    </>
  )
}
