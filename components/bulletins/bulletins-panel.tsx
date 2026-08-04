'use client'

import { useMemo, useState } from 'react'
import { CheckCircle2, FileText, Printer, Search, Users } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { EmptyState } from '@/components/empty-state'
import { BulletinDocument } from '@/components/bulletins/bulletin-document'
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
import {
  appreciation,
  bulletinEleve,
  classes,
  etablissement,
  getElevesByClasse,
  trimestres,
} from '@/lib/data'

export function BulletinsPanel() {
  const [classeId, setClasseId] = useState(classes[3]?.id ?? classes[0].id)
  const [periode, setPeriode] = useState(etablissement.periodeCourante)
  const [q, setQ] = useState('')
  const [apercuId, setApercuId] = useState<string | null>(null)
  const [valides, setValides] = useState<string[]>([])

  const classe = classes.find((c) => c.id === classeId)

  const rows = useMemo(() => {
    const term = q.trim().toLowerCase()
    return getElevesByClasse(classeId)
      .map((e) => {
        const b = bulletinEleve(e.id)
        return {
          id: e.id,
          nom: `${e.nom} ${e.prenoms}`,
          matricule: e.matricule,
          moyenne: b?.moyenneGenerale ?? 0,
          rang: b?.rang ?? 0,
        }
      })
      .filter(
        (r) =>
          !term ||
          r.nom.toLowerCase().includes(term) ||
          r.matricule.toLowerCase().includes(term),
      )
      .sort((a, b) => a.rang - b.rang)
  }, [classeId, q])

  const bulletin = apercuId ? bulletinEleve(apercuId) : null
  const moyenneClasse =
    rows.length > 0 ? rows.reduce((s, r) => s + r.moyenne, 0) / rows.length : 0

  return (
    <>
      <Card>
        <CardContent className="flex flex-col gap-4 p-4 md:p-5">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
            <Select value={classeId} onValueChange={(v) => setClasseId(v as string)}>
              <SelectTrigger className="w-full lg:w-52" aria-label="Classe">
                <SelectValue placeholder="Classe" />
              </SelectTrigger>
              <SelectContent>
                {classes.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.nom} — {c.cycle}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={periode} onValueChange={(v) => setPeriode(v as string)}>
              <SelectTrigger className="w-full lg:w-48" aria-label="Période">
                <SelectValue placeholder="Période" />
              </SelectTrigger>
              <SelectContent>
                {trimestres.map((t) => (
                  <SelectItem key={t} value={t}>
                    {t}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Rechercher un élève..."
                className="pl-8"
                aria-label="Rechercher un élève"
              />
            </div>
            <Button
              variant="outline"
              onClick={() => setValides(rows.map((r) => r.id))}
              disabled={rows.length === 0}
            >
              <CheckCircle2 className="size-4" data-icon="inline-start" />
              Valider la classe
            </Button>
          </div>

          {rows.length === 0 ? (
            <div className="rounded-lg border border-dashed">
              <EmptyState
                icon={Users}
                title="Aucun élève dans cette sélection"
                description="Choisissez une autre classe ou ajustez votre recherche."
              />
            </div>
          ) : (
            <>
              <div className="flex flex-wrap items-center gap-3 rounded-lg border bg-muted/40 p-3 text-sm">
                <span className="font-medium">{classe?.nom}</span>
                <span className="text-muted-foreground">{periode}</span>
                <span className="text-muted-foreground">
                  Moyenne de classe{' '}
                  <span className="font-medium tabular-nums text-foreground">
                    {moyenneClasse.toFixed(2)} / 20
                  </span>
                </span>
                <span className="text-muted-foreground">
                  {valides.length} bulletin(s) validé(s)
                </span>
              </div>

              <div className="overflow-x-auto rounded-lg border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-16 text-center">Rang</TableHead>
                      <TableHead>Élève</TableHead>
                      <TableHead>Matricule</TableHead>
                      <TableHead className="text-center">Moyenne</TableHead>
                      <TableHead>Appréciation</TableHead>
                      <TableHead>Statut</TableHead>
                      <TableHead className="w-28" />
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {rows.map((r) => (
                      <TableRow key={r.id}>
                        <TableCell className="text-center font-medium tabular-nums">
                          {r.rang}
                        </TableCell>
                        <TableCell className="font-medium">{r.nom}</TableCell>
                        <TableCell className="font-mono text-sm text-muted-foreground">
                          {r.matricule}
                        </TableCell>
                        <TableCell className="text-center tabular-nums">
                          {r.moyenne.toFixed(2)}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {appreciation(r.moyenne)}
                        </TableCell>
                        <TableCell>
                          {valides.includes(r.id) ? (
                            <Badge
                              variant="secondary"
                              className="border-transparent bg-primary/10 text-primary"
                            >
                              Validé
                            </Badge>
                          ) : (
                            <Badge variant="outline">Brouillon</Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setApercuId(r.id)}
                          >
                            <FileText className="size-4" data-icon="inline-start" />
                            Bulletin
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <Dialog
        open={apercuId !== null}
        onOpenChange={(next) => {
          if (!next) setApercuId(null)
        }}
      >
        <DialogContent className="max-h-[90vh] max-w-3xl overflow-y-auto">
          <DialogHeader data-print-hidden>
            <DialogTitle>Aperçu du bulletin</DialogTitle>
            <DialogDescription>
              Notes simulées en mode maquette — {periode}, {etablissement.anneeScolaire}.
            </DialogDescription>
          </DialogHeader>
          {bulletin ? <BulletinDocument bulletin={bulletin} /> : null}
          <DialogFooter data-print-hidden>
            <Button
              variant="outline"
              onClick={() => {
                if (apercuId && !valides.includes(apercuId)) {
                  setValides((v) => [...v, apercuId])
                }
              }}
            >
              <CheckCircle2 className="size-4" data-icon="inline-start" />
              Valider
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
