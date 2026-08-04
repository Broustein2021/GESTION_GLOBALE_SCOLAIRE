import { Suspense } from 'react'
import { FileText } from 'lucide-react'

import { PageHeader } from '@/components/page-header'
import { LinkButton } from '@/components/link-button'
import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent } from '@/components/ui/card'
import { SaisieNotes } from '@/components/notes/saisie-notes'
import { etablissement } from '@/lib/data'

export const metadata = { title: 'Saisie des notes — GESTION-SCOLAIRE' }

function SaisieSkeleton() {
  return (
    <Card>
      <CardContent className="flex flex-col gap-4 p-5">
        <Skeleton className="h-5 w-56" />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-9 w-full" />
          ))}
        </div>
        <Skeleton className="h-64 w-full" />
      </CardContent>
    </Card>
  )
}

export default function NotesPage() {
  return (
    <>
      <PageHeader
        title="Saisie des notes"
        description={`Notation par évaluation — ${etablissement.periodeCourante}, ${etablissement.anneeScolaire}`}
      >
        <LinkButton href="/bulletins" variant="outline">
          <FileText className="size-4" data-icon="inline-start" />
          Voir les bulletins
        </LinkButton>
      </PageHeader>

      <Suspense fallback={<SaisieSkeleton />}>
        <SaisieNotes />
      </Suspense>
    </>
  )
}
