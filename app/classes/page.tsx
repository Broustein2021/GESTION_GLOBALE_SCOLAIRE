import { Plus, School, Users, Layers, Gauge } from 'lucide-react'

import { PageHeader } from '@/components/page-header'
import { StatCard } from '@/components/stat-card'
import { Button } from '@/components/ui/button'
import { ClassesGrid } from '@/components/classes/classes-grid'
import { classes, etablissement, niveaux } from '@/lib/data'

export const metadata = { title: 'Classes & Niveaux — GESTION-SCOLAIRE' }

export default function ClassesPage() {
  const effectif = classes.reduce((s, c) => s + c.effectif, 0)
  const capacite = classes.reduce((s, c) => s + c.capacite, 0)
  const occupation = Math.round((effectif / capacite) * 100)

  return (
    <>
      <PageHeader
        title="Classes & Niveaux"
        description={`Organisation pédagogique — ${etablissement.anneeScolaire}`}
      >
        <Button>
          <Plus className="size-4" data-icon="inline-start" />
          Nouvelle classe
        </Button>
      </PageHeader>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Classes" value={classes.length} icon={School} />
        <StatCard
          label="Niveaux"
          value={niveaux.length}
          hint="Du CP1 à la Terminale"
          icon={Layers}
          accent="sky"
        />
        <StatCard
          label="Élèves répartis"
          value={effectif}
          hint={`Capacité totale ${capacite}`}
          icon={Users}
          accent="amber"
        />
        <StatCard
          label="Taux d'occupation"
          value={`${occupation}%`}
          hint="Places occupées"
          icon={Gauge}
          accent="rose"
        />
      </div>

      <ClassesGrid />
    </>
  )
}
