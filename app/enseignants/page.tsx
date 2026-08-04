import { BookOpen, GraduationCap, Plus, School } from 'lucide-react'

import { PageHeader } from '@/components/page-header'
import { StatCard } from '@/components/stat-card'
import { Button } from '@/components/ui/button'
import {
  EnseignantsTable,
  EnseignantDialog,
} from '@/components/enseignants/enseignants-table'
import { enseignants, matieres } from '@/lib/data'

export const metadata = { title: 'Enseignants — GESTION-SCOLAIRE' }

export default function EnseignantsPage() {
  const actifs = enseignants.filter((t) => t.statut === 'actif')
  const affectations = enseignants.reduce((s, t) => s + t.classes.length, 0)
  const matieresCouvertes = matieres.filter((m) => m.enseignantIds.length > 0).length

  return (
    <>
      <PageHeader
        title="Enseignants"
        description="Corps enseignant, matières et affectations par classe"
      >
        <EnseignantDialog
          trigger={
            <Button>
              <Plus className="size-4" data-icon="inline-start" />
              Ajouter un enseignant
            </Button>
          }
        />
      </PageHeader>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Enseignants actifs"
          value={actifs.length}
          icon={GraduationCap}
        />
        <StatCard
          label="Affectations"
          value={affectations}
          hint="Couples enseignant / classe"
          icon={School}
          accent="sky"
        />
        <StatCard
          label="Matières couvertes"
          value={`${matieresCouvertes} / ${matieres.length}`}
          icon={BookOpen}
          accent="amber"
        />
        <StatCard
          label="Matières sans enseignant"
          value={matieres.length - matieresCouvertes}
          hint="Affectation à prévoir"
          icon={BookOpen}
          accent="rose"
        />
      </div>

      <EnseignantsTable />
    </>
  )
}
