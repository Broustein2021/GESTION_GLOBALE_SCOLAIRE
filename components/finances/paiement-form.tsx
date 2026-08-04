'use client'

import { useMemo, useState } from 'react'
import { Receipt } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
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
  categoriesFrais,
  eleves,
  formatFCFA,
  getClasse,
  modesPaiement,
  type Paiement,
} from '@/lib/data'

const CAISSIER = 'Mme Koné (Caisse)'

export type NouveauPaiement = Paiement & { soldeRestant: number }

export function PaiementForm({
  open,
  onOpenChange,
  paiementsSupplementaires,
  eleveIdParDefaut,
  onSubmit,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  /** Montants déjà encaissés pendant la session (maquette), par élève. */
  paiementsSupplementaires: Record<string, number>
  eleveIdParDefaut?: string
  onSubmit: (paiement: NouveauPaiement) => void
}) {
  const [eleveId, setEleveId] = useState(eleveIdParDefaut ?? eleves[0].id)
  const [categorieId, setCategorieId] = useState(categoriesFrais[1].id)
  const [montant, setMontant] = useState('')
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10))
  const [mode, setMode] = useState<Paiement['mode']>('Espèces')
  const [reference, setReference] = useState('')
  const [notes, setNotes] = useState('')
  const [erreur, setErreur] = useState<string | null>(null)

  const eleve = eleves.find((e) => e.id === eleveId)
  const categorie = categoriesFrais.find((c) => c.id === categorieId)

  const elevesActifs = useMemo(
    () => eleves.filter((e) => e.statut !== 'archive'),
    [],
  )

  // Base UI affiche la valeur brute si aucun libellé n'est fourni via `items`.
  const libellesEleves = useMemo(
    () =>
      Object.fromEntries(
        elevesActifs.map((e) => [
          e.id,
          `${e.nom} ${e.prenoms} — ${getClasse(e.classeId)?.nom ?? '—'}`,
        ]),
      ),
    [elevesActifs],
  )

  const libellesCategories = useMemo(
    () =>
      Object.fromEntries(
        categoriesFrais.map((c) => [c.id, `${c.nom} — ${formatFCFA(c.montant)}`]),
      ),
    [],
  )

  const situation = useMemo(() => {
    if (!eleve) return null
    const dejaPaye = eleve.montantPaye + (paiementsSupplementaires[eleve.id] ?? 0)
    const reste = Math.max(0, eleve.montantDu - dejaPaye)
    const nouveau = Number(montant) || 0
    return {
      montantDu: eleve.montantDu,
      dejaPaye,
      reste,
      nouveau,
      resteApres: Math.max(0, reste - nouveau),
    }
  }, [eleve, montant, paiementsSupplementaires])

  function reinitialiser() {
    setMontant('')
    setReference('')
    setNotes('')
    setErreur(null)
  }

  function handleSubmit() {
    const valeur = Number(montant)
    if (!eleve) return
    if (!Number.isFinite(valeur) || valeur <= 0) {
      setErreur('Saisissez un montant supérieur à 0.')
      return
    }
    if (!date) {
      setErreur('La date du paiement est obligatoire.')
      return
    }
    const motif = notes.trim()
      ? `${categorie?.nom ?? 'Frais'} — ${notes.trim()}`
      : (categorie?.nom ?? 'Frais divers')

    onSubmit({
      id: `pay-local-${Date.now()}`,
      recu: '',
      eleveId: eleve.id,
      montant: valeur,
      date,
      mode,
      motif,
      reference: reference.trim() || '—',
      enregistrePar: CAISSIER,
      soldeRestant: situation ? Math.max(0, situation.reste - valeur) : 0,
    })
    reinitialiser()
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) reinitialiser()
        onOpenChange(next)
      }}
    >
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Enregistrer un paiement</DialogTitle>
          <DialogDescription>
            Les paiements partiels sont acceptés : le solde est recalculé
            automatiquement.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="paiement-eleve">Élève</Label>
            <Select
              items={libellesEleves}
              value={eleveId}
              onValueChange={(v) => setEleveId(v as string)}
            >
              <SelectTrigger id="paiement-eleve" className="w-full">
                <SelectValue placeholder="Sélectionner un élève" />
              </SelectTrigger>
              <SelectContent>
                {elevesActifs.map((e) => (
                  <SelectItem key={e.id} value={e.id}>
                    {libellesEleves[e.id]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {situation ? (
            <dl className="grid grid-cols-2 gap-3 rounded-lg border bg-muted/40 p-3 text-sm sm:grid-cols-4">
              <div className="flex flex-col">
                <dt className="text-xs text-muted-foreground">Montant dû</dt>
                <dd className="font-medium tabular-nums">
                  {formatFCFA(situation.montantDu)}
                </dd>
              </div>
              <div className="flex flex-col">
                <dt className="text-xs text-muted-foreground">Déjà payé</dt>
                <dd className="font-medium tabular-nums text-primary">
                  {formatFCFA(situation.dejaPaye)}
                </dd>
              </div>
              <div className="flex flex-col">
                <dt className="text-xs text-muted-foreground">Reste dû</dt>
                <dd className="font-medium tabular-nums">
                  {formatFCFA(situation.reste)}
                </dd>
              </div>
              <div className="flex flex-col">
                <dt className="text-xs text-muted-foreground">Après paiement</dt>
                <dd className="font-medium tabular-nums text-destructive">
                  {formatFCFA(situation.resteApres)}
                </dd>
              </div>
            </dl>
          ) : null}

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-2">
              <Label htmlFor="paiement-categorie">Catégorie de frais</Label>
              <Select
                items={libellesCategories}
                value={categorieId}
                onValueChange={(v) => setCategorieId(v as string)}
              >
                <SelectTrigger id="paiement-categorie" className="w-full">
                  <SelectValue placeholder="Catégorie" />
                </SelectTrigger>
                <SelectContent>
                  {categoriesFrais.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {libellesCategories[c.id]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="paiement-montant">Montant encaissé (FCFA)</Label>
              <Input
                id="paiement-montant"
                type="number"
                min={0}
                inputMode="numeric"
                value={montant}
                onChange={(e) => {
                  setMontant(e.target.value)
                  setErreur(null)
                }}
                placeholder={String(categorie?.montant ?? 0)}
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="paiement-date">Date du paiement</Label>
              <Input
                id="paiement-date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="paiement-mode">Mode de paiement</Label>
              <Select
                value={mode}
                onValueChange={(v) => setMode(v as Paiement['mode'])}
              >
                <SelectTrigger id="paiement-mode" className="w-full">
                  <SelectValue placeholder="Mode" />
                </SelectTrigger>
                <SelectContent>
                  {modesPaiement.map((m) => (
                    <SelectItem key={m} value={m}>
                      {m}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col gap-2 sm:col-span-2">
              <Label htmlFor="paiement-reference">
                Référence (transaction, chèque, virement)
              </Label>
              <Input
                id="paiement-reference"
                value={reference}
                onChange={(e) => setReference(e.target.value)}
                placeholder="MM-88213, CHQ-002145..."
              />
            </div>

            <div className="flex flex-col gap-2 sm:col-span-2">
              <Label htmlFor="paiement-notes">Observation</Label>
              <Input
                id="paiement-notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="2e échéance, règlement partiel..."
              />
            </div>
          </div>

          {erreur ? (
            <p role="alert" className="text-sm text-destructive">
              {erreur}
            </p>
          ) : null}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Annuler
          </Button>
          <Button onClick={handleSubmit}>
            <Receipt className="size-4" data-icon="inline-start" />
            Enregistrer et générer le reçu
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
