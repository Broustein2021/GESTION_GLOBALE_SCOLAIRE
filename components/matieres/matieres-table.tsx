'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { Archive, BookOpen, Plus, Search } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { EmptyState } from '@/components/empty-state'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
import { cycles, getEnseignant, matieres, type Matiere } from '@/lib/data'

function MatiereDialog({
  matiere,
  trigger,
}: {
  matiere?: Matiere
  trigger: React.ReactNode
}) {
  const [open, setOpen] = useState(false)
  const [saved, setSaved] = useState(false)

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next)
        if (!next) setSaved(false)
      }}
    >
      <DialogTrigger render={trigger as React.ReactElement} />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {matiere ? `MatiÃ¨re â€” ${matiere.nom}` : 'Nouvelle matiÃ¨re'}
          </DialogTitle>
          <DialogDescription>
            {saved
              ? 'EnregistrÃ© en mode maquette â€” les donnÃ©es ne sont pas encore persistÃ©es.'
              : 'Code, libellÃ©, coefficient et cycle concernÃ©.'}
          </DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="m-code">Code</Label>
            <Input id="m-code" defaultValue={matiere?.code} placeholder="MATH" />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="m-coef">Coefficient</Label>
            <Input
              id="m-coef"
              type="number"
              min={1}
              max={10}
              defaultValue={matiere?.coefficient ?? 1}
            />
          </div>
          <div className="flex flex-col gap-1.5 sm:col-span-2">
            <Label htmlFor="m-nom">LibellÃ©</Label>
            <Input
              id="m-nom"
              defaultValue={matiere?.nom}
              placeholder="MathÃ©matiques"
            />
          </div>
          <div className="flex flex-col gap-1.5 sm:col-span-2">
            <Label htmlFor="m-cycle">Cycle</Label>
            <Select defaultValue={matiere?.cycle ?? 'CollÃ¨ge'}>
              <SelectTrigger id="m-cycle">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {cycles.map((c) => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          {matiere ? (
            <Button variant="outline">
              <Archive className="size-4" data-icon="inline-start" />
              Archiver
            </Button>
          ) : null}
          <Button onClick={() => setSaved(true)} disabled={saved}>
            {saved ? 'EnregistrÃ©' : 'Enregistrer'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export function MatieresTable() {
  const [q, setQ] = useState('')
  const [cycle, setCycle] = useState('tous')

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase()
    return matieres.filter((m) => {
      const matchTerm =
        !term ||
        m.nom.toLowerCase().includes(term) ||
        m.code.toLowerCase().includes(term)
      const matchCycle = cycle === 'tous' || m.cycle === cycle
      return matchTerm && matchCycle
    })
  }, [q, cycle])

  return (
    <Card>
      <CardContent className="flex flex-col gap-4 p-4 md:p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Rechercher une matiÃ¨re..."
              className="pl-8"
              aria-label="Rechercher une matiÃ¨re"
            />
          </div>
          <Select value={cycle} onValueChange={(value) => setCycle(value ?? '')}>
            <SelectTrigger className="w-full sm:w-40">
              <SelectValue placeholder="Cycle" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="tous">Tous les cycles</SelectItem>
              {cycles.map((c) => (
                <SelectItem key={c} value={c}>
                  {c}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {filtered.length === 0 ? (
          <div className="rounded-lg border border-dashed">
            <EmptyState
              icon={BookOpen}
              title="Aucune matiÃ¨re trouvÃ©e"
              description="CrÃ©ez votre premiÃ¨re matiÃ¨re pour organiser les Ã©valuations."
            >
              <MatiereDialog
                trigger={
                  <Button>
                    <Plus className="size-4" data-icon="inline-start" />
                    CrÃ©er une matiÃ¨re
                  </Button>
                }
              />
            </EmptyState>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Code</TableHead>
                  <TableHead>MatiÃ¨re</TableHead>
                  <TableHead className="text-center">Coefficient</TableHead>
                  <TableHead>Cycle</TableHead>
                  <TableHead>Enseignants affectÃ©s</TableHead>
                  <TableHead className="w-24" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((m) => (
                  <TableRow key={m.id}>
                    <TableCell>
                      <Badge variant="secondary" className="font-mono">
                        {m.code}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-medium">{m.nom}</TableCell>
                    <TableCell className="text-center tabular-nums">
                      {m.coefficient}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{m.cycle}</Badge>
                    </TableCell>
                    <TableCell>
                      {m.enseignantIds.length === 0 ? (
                        <span className="text-sm text-muted-foreground">
                          Non affectÃ©e
                        </span>
                      ) : (
                        <div className="flex flex-wrap gap-2">
                          {m.enseignantIds.map((tid) => {
                            const t = getEnseignant(tid)
                            if (!t) return null
                            return (
                              <Link
                                key={tid}
                                href="/enseignants"
                                className="text-sm underline-offset-4 hover:underline"
                              >
                                {t.prenoms} {t.nom}
                              </Link>
                            )
                          })}
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <MatiereDialog
                        matiere={m}
                        trigger={
                          <Button variant="ghost" size="sm">
                            Modifier
                          </Button>
                        }
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export { MatiereDialog }

