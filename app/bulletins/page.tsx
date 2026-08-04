import { CheckCircle2, FileText, GraduationCap, Layers } from 'lucide-react'

import { PageHeader } from '@/components/page-header'
import { StatCard } from '@/components/stat-card'
import { BulletinsPanel } from '@/components/bulletins/bulletins-panel'
import { classes, eleves, etablissement, evaluations } from '@/lib/data'

export const metadata = { title: 'Bulletins — GESTION-SCOLAIRE' }

export default function BulletinsPage() {
  const actifs = eleves.filter((e) => e.statut !== 'archive')
  const moyenneEtab =
    actifs.filter((e) => e.moyenne > 0).reduce((s, e) => s + e.moyenne, 0) /
    Math.max(1, actifs.filter((e) => e.moyenne > 0).length)
  const evalValidees = evaluations.filter((ev) => ev.statut === 'validee').length

  return (
    <>
      <PageHeader
        title="Bulletins"
        description={`Édition et validation des bulletins — ${etablissement.periodeCourante}, ${etablissement.anneeScolaire}`}
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Bulletins à éditer"
          value={actifs.length}
          hint="Tous cycles confondus"
          icon={FileText}
        />
        <StatCard
          label="Classes concernées"
          value={classes.length}
          icon={Layers}
          accent="sky"
        />
        <StatCard
          label="Moyenne établissement"
          value={`${moyenneEtab.toFixed(2)} / 20`}
          icon={GraduationCap}
          accent="amber"
        />
        <StatCard
          label="Évaluations validées"
          value={`${evalValidees} / ${evaluations.length}`}
          hint="Base de calcul des moyennes"
          icon={CheckCircle2}
          accent="rose"
        />
      </div>

      <BulletinsPanel />
    </>
  )
}
