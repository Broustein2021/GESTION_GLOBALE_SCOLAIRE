'use client'

import Link from 'next/link'
import { useMemo, useState } from 'react'
import {
  CircleDollarSign,
  Printer,
  Receipt,
  Search,
  TrendingUp,
  Wallet,
} from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Progress } from '@/components/ui/progress'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { EmptyState } from '@/components/empty-state'
import { PaymentBadge } from '@/components/payment-badge'
import { StatCard } from '@/components/stat-card'
import {
  PaiementForm,
  type NouveauPaiement,
} from '@/components/finances/paiement-form'
import {
  RecuDocument,
  type RecuData,
} from '@/components/finances/recu-document'
import {
  formatFCFA,
  getClasse,
  getEleve,
  kpis,
  modesPaiement,
  paiements as paiementsInitiaux,
  type Paiement,
  type StatutPaiement,
} from '@/lib/data'

function statutDepuisMontants(du: number, paye: number): StatutPaiement {
  if (paye >= du) return 'a_jour'
  if (du > 0 && paye / du >= 0.5) return 'partiel'
  return 'retard'
}

/** Montant sans suffixe — le libellé de la carte porte déjà « FCFA ». */
function montantCourt(valeur: number) {
  return new Intl.NumberFormat('fr-FR').format(valeur)
}

const FILTRES_STATUT: Record<string, StatutPaiement | 'tous'> = {
  'Tout statut': 'tous',
  'À jour': 'a_jour',
  Partiel: 'partiel',
  'En retard': 'retard',
}

const FILTRES_PERIODE: Record<string, number> = {
  'Toute période': Number.POSITIVE_INFINITY,
  '7 derniers jours': 7,
  '30 derniers jours': 30,
}

function joursDepuis(date: string) {
  const diff = Date.now() - new Date(date).getTime()
  return diff / 86_400_000
}

function numeroRecu(total: number) {
  const base = paiementsInitiaux
    .map((p) => Number(p.recu.split('-').pop()))
    .sort((a, b) => b - a)[0]
  return `REC-2526-${String((base ?? 0) + total + 1).padStart(4, '0')}`
}

export function FinancesPanel() {
  const [nouveaux, setNouveaux] = useState<Paiement[]>([])
  const [formOpen, setFormOpen] = useState(false)
  const [recu, setRecu] = useState<RecuData | null>(null)

  const [q, setQ] = useState('')
  const [statut, setStatut] = useState('Tout statut')
  const [mode, setMode] = useState('Tout mode')
  const [periode, setPeriode] = useState('Toute période')

  const extras = useMemo(() => {
    const acc: Record<string, number> = {}
    for (const p of nouveaux) {
      acc[p.eleveId] = (acc[p.eleveId] ?? 0) + p.montant
    }
    return acc
  }, [nouveaux])

  const encaisseSession = nouveaux.reduce((s, p) => s + p.montant, 0)
  const montantEncaisse = kpis.montantEncaisse + encaisseSession
  const resteRecouvrer = Math.max(0, kpis.montantAttendu - montantEncaisse)
  const taux = Math.round((montantEncaisse / kpis.montantAttendu) * 100)

  const lignes = useMemo(() => {
    const term = q.trim().toLowerCase()
    return [...nouveaux, ...paiementsInitiaux]
      .map((p) => {
        const eleve = getEleve(p.eleveId)
        const paye = (eleve?.montantPaye ?? 0) + (extras[p.eleveId] ?? 0)
        return {
          ...p,
          eleve,
          statut: eleve
            ? statutDepuisMontants(eleve.montantDu, paye)
            : ('retard' as StatutPaiement),
          soldeRestant: Math.max(0, (eleve?.montantDu ?? 0) - paye),
        }
      })
      .filter((l) => {
        const nom = l.eleve ? `${l.eleve.prenoms} ${l.eleve.nom}` : ''
        const matchTerm =
          !term ||
          nom.toLowerCase().includes(term) ||
          l.recu.toLowerCase().includes(term) ||
          (l.eleve?.matricule ?? '').toLowerCase().includes(term)
        const statutCible = FILTRES_STATUT[statut] ?? 'tous'
        const matchStatut = statutCible === 'tous' || l.statut === statutCible
        const matchMode = mode === 'Tout mode' || l.mode === mode
        const matchPeriode =
          joursDepuis(l.date) <=
          (FILTRES_PERIODE[periode] ?? Number.POSITIVE_INFINITY)
        return matchTerm && matchStatut && matchMode && matchPeriode
      })
      .sort((a, b) => (a.date < b.date ? 1 : -1))
  }, [nouveaux, extras, q, statut, mode, periode])

  function enregistrer(paiement: NouveauPaiement) {
    const numero = numeroRecu(nouveaux.length)
    const { soldeRestant, ...reste } = paiement
    setNouveaux((prev) => [{ ...reste, recu: numero }, ...prev])
    setFormOpen(false)
    setRecu({
      recu: numero,
      eleveId: paiement.eleveId,
      montant: paiement.montant,
      date: paiement.date,
      mode: paiement.mode,
      motif: paiement.motif,
      reference: paiement.reference,
      enregistrePar: paiement.enregistrePar,
      soldeRestant,
    })
  }

  return (
    <>
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Montant attendu (FCFA)"
          value={montantCourt(kpis.montantAttendu)}
          hint="Année scolaire en cours"
          icon={Wallet}
          accent="sky"
        />
        <StatCard
          label="Montant encaissé (FCFA)"
          value={montantCourt(montantEncaisse)}
          hint={
            encaisseSession > 0
              ? `dont ${formatFCFA(encaisseSession)} en séance`
              : `${kpis.elevesAJour} élève(s) soldé(s)`
          }
          icon={CircleDollarSign}
          accent="primary"
        />
        <StatCard
          label="Reste à recouvrer (FCFA)"
          value={montantCourt(resteRecouvrer)}
          hint={`${kpis.elevesEnRetard} élève(s) en retard`}
          icon={Receipt}
          accent="rose"
        />
        <StatCard
          label="Taux de recouvrement"
          value={`${taux}%`}
          hint={`${nouveaux.length + paiementsInitiaux.length} paiement(s) au total`}
          icon={TrendingUp}
          accent="amber"
        />
      </section>

      <Card>
        <CardContent className="flex flex-col gap-2 p-5">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">
              Progression du recouvrement
            </span>
            <span className="font-semibold tabular-nums">
              {formatFCFA(montantEncaisse)} / {formatFCFA(kpis.montantAttendu)}
            </span>
          </div>
          <Progress value={taux} />
        </CardContent>
      </Card>

      <Card>
        <CardContent className="flex flex-col gap-4 p-4 md:p-5">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Rechercher un élève, un matricule ou un n° de reçu..."
                className="pl-8"
                aria-label="Rechercher un paiement"
              />
            </div>
            <Select value={statut} onValueChange={(v) => setStatut(v as string)}>
              <SelectTrigger className="w-full lg:w-36" aria-label="Statut">
                <SelectValue placeholder="Statut" />
              </SelectTrigger>
              <SelectContent>
                {Object.keys(FILTRES_STATUT).map((s) => (
                  <SelectItem key={s} value={s}>
                    {s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={mode} onValueChange={(v) => setMode(v as string)}>
              <SelectTrigger className="w-full lg:w-36" aria-label="Mode">
                <SelectValue placeholder="Mode" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Tout mode">Tout mode</SelectItem>
                {modesPaiement.map((m) => (
                  <SelectItem key={m} value={m}>
                    {m}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={periode} onValueChange={(v) => setPeriode(v as string)}>
              <SelectTrigger className="w-full lg:w-44" aria-label="Période">
                <SelectValue placeholder="Période" />
              </SelectTrigger>
              <SelectContent>
                {Object.keys(FILTRES_PERIODE).map((p) => (
                  <SelectItem key={p} value={p}>
                    {p}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button onClick={() => setFormOpen(true)}>
              <CircleDollarSign className="size-4" data-icon="inline-start" />
              Enregistrer un paiement
            </Button>
          </div>

          <div className="text-sm text-muted-foreground">
            {lignes.length} paiement{lignes.length > 1 ? 's' : ''} —{' '}
            {formatFCFA(lignes.reduce((s, l) => s + l.montant, 0))} encaissé(s)
          </div>

          {lignes.length === 0 ? (
            <div className="rounded-lg border border-dashed">
              <EmptyState
                icon={Receipt}
                title="Aucun paiement pour cette sélection"
                description="Ajustez vos filtres ou enregistrez un nouveau paiement pour le voir apparaître ici."
              >
                <Button variant="outline" onClick={() => setFormOpen(true)}>
                  <CircleDollarSign className="size-4" data-icon="inline-start" />
                  Enregistrer un paiement
                </Button>
              </EmptyState>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-lg border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Reçu</TableHead>
                    <TableHead>Élève</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Motif</TableHead>
                    <TableHead>Mode</TableHead>
                    <TableHead className="text-right">Montant</TableHead>
                    <TableHead className="hidden text-right lg:table-cell">
                      Solde
                    </TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead className="hidden xl:table-cell">
                      Enregistré par
                    </TableHead>
                    <TableHead className="w-10" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {lignes.map((l) => (
                    <TableRow key={l.id}>
                      <TableCell className="font-mono text-xs">{l.recu}</TableCell>
                      <TableCell>
                        {l.eleve ? (
                          <Link
                            href={`/eleves/${l.eleve.id}`}
                            className="flex flex-col underline-offset-4 hover:underline"
                          >
                            <span className="font-medium leading-tight">
                              {l.eleve.prenoms} {l.eleve.nom}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {getClasse(l.eleve.classeId)?.nom ?? '—'} ·{' '}
                              {l.eleve.matricule}
                            </span>
                          </Link>
                        ) : (
                          '—'
                        )}
                      </TableCell>
                      <TableCell className="tabular-nums">{l.date}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {l.motif}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{l.mode}</Badge>
                      </TableCell>
                      <TableCell className="text-right font-medium tabular-nums">
                        {formatFCFA(l.montant)}
                      </TableCell>
                      <TableCell className="hidden text-right tabular-nums text-muted-foreground lg:table-cell">
                        {formatFCFA(l.soldeRestant)}
                      </TableCell>
                      <TableCell>
                        <PaymentBadge statut={l.statut} />
                      </TableCell>
                      <TableCell className="hidden text-muted-foreground xl:table-cell">
                        {l.enregistrePar}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          aria-label={`Voir le reçu ${l.recu}`}
                          onClick={() =>
                            setRecu({
                              recu: l.recu,
                              eleveId: l.eleveId,
                              montant: l.montant,
                              date: l.date,
                              mode: l.mode,
                              motif: l.motif,
                              reference: l.reference,
                              enregistrePar: l.enregistrePar,
                              soldeRestant: l.soldeRestant,
                            })
                          }
                        >
                          <Receipt className="size-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <PaiementForm
        open={formOpen}
        onOpenChange={setFormOpen}
        paiementsSupplementaires={extras}
        onSubmit={enregistrer}
      />

      <Dialog
        open={recu !== null}
        onOpenChange={(next) => {
          if (!next) setRecu(null)
        }}
      >
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader data-print-hidden>
            <DialogTitle>Reçu de paiement</DialogTitle>
            <DialogDescription>
              Document généré en mode maquette — données de démonstration.
            </DialogDescription>
          </DialogHeader>
          {recu ? <RecuDocument data={recu} /> : null}
          <DialogFooter data-print-hidden>
            <Button variant="outline" onClick={() => setRecu(null)}>
              Fermer
            </Button>
            <Button onClick={() => window.print()}>
              <Printer className="size-4" data-icon="inline-start" />
              Imprimer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
