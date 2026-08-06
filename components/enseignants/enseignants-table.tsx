'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { GraduationCap, Mail, Phone, Plus, Search } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
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
import {
  enseignants,
  getClasse,
  getMatiere,
  matieres,
  type Enseignant,
} from '@/lib/data'

function EnseignantDialog({
  enseignant,
  trigger,
}: {
  enseignant?: Enseignant
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
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {enseignant
              ? `${enseignant.prenoms} ${enseignant.nom}`
              : 'Nouvel enseignant'}
          </DialogTitle>
          <DialogDescription>
            {saved
              ? 'EnregistrÃ© en mode maquette â€” les donnÃ©es ne sont pas encore persistÃ©es.'
              : 'IdentitÃ©, contact et affectation pÃ©dagogique.'}
          </DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="t-nom">Nom</Label>
            <Input id="t-nom" defaultValue={enseignant?.nom} placeholder="Kouassi" />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="t-prenoms">PrÃ©noms</Label>
            <Input
              id="t-prenoms"
              defaultValue={enseignant?.prenoms}
              placeholder="Jean-Marc"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="t-tel">TÃ©lÃ©phone</Label>
            <Input id="t-tel" defaultValue={enseignant?.telephone} />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="t-mail">Email</Label>
            <Input id="t-mail" type="email" defaultValue={enseignant?.email} />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="t-matiere">MatiÃ¨re principale</Label>
            <Select defaultValue={enseignant?.matieres[0] ?? matieres[0].id}>
              <SelectTrigger id="t-matiere">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {matieres.map((m) => (
                  <SelectItem key={m.id} value={m.id}>
                    {m.nom}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="t-embauche">Date d&apos;embauche</Label>
            <Input
              id="t-embauche"
              type="date"
              defaultValue={enseignant?.dateEmbauche ?? ''}
            />
          </div>
        </div>
        {enseignant ? (
          <div className="flex flex-col gap-2 rounded-lg border p-3">
            <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Classes affectÃ©es
            </span>
            <div className="flex flex-wrap gap-2">
              {enseignant.classes.map((cid) => (
                <Link
                  key={cid}
                  href={`/classes/${cid}`}
                  className="rounded-md border px-2 py-1 text-sm hover:bg-accent"
                >
                  {getClasse(cid)?.nom}
                </Link>
              ))}
            </div>
          </div>
        ) : null}
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Fermer
          </Button>
          <Button onClick={() => setSaved(true)} disabled={saved}>
            {saved ? 'EnregistrÃ©' : 'Enregistrer'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export function EnseignantsTable() {
  const [q, setQ] = useState('')
  const [matiereId, setMatiereId] = useState('toutes')
  const [statut, setStatut] = useState('actif')

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase()
    return enseignants.filter((t) => {
      const matchTerm =
        !term ||
        `${t.prenoms} ${t.nom}`.toLowerCase().includes(term) ||
        t.matricule.toLowerCase().includes(term) ||
        t.email.toLowerCase().includes(term)
      const matchMatiere =
        matiereId === 'toutes' || t.matieres.includes(matiereId)
      const matchStatut = statut === 'tous' || t.statut === statut
      return matchTerm && matchMatiere && matchStatut
    })
  }, [q, matiereId, statut])

  return (
    <Card>
      <CardContent className="flex flex-col gap-4 p-4 md:p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Rechercher un enseignant..."
              className="pl-8"
              aria-label="Rechercher un enseignant"
            />
          </div>
          <Select value={matiereId} onValueChange={(value) => setMatiereId(value ?? '')}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="MatiÃ¨re" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="toutes">Toutes les matiÃ¨res</SelectItem>
              {matieres.map((m) => (
                <SelectItem key={m.id} value={m.id}>
                  {m.nom}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={statut} onValueChange={(value) => setStatut(value ?? '')}>
            <SelectTrigger className="w-full sm:w-36">
              <SelectValue placeholder="Statut" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="tous">Tous</SelectItem>
              <SelectItem value="actif">Actifs</SelectItem>
              <SelectItem value="archive">ArchivÃ©s</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="text-sm text-muted-foreground">
          {filtered.length} enseignant{filtered.length > 1 ? 's' : ''}
        </div>

        {filtered.length === 0 ? (
          <div className="rounded-lg border border-dashed">
            <EmptyState
              icon={GraduationCap}
              title="Aucun enseignant trouvÃ©"
              description="Commencez par ajouter votre premier enseignant."
            >
              <EnseignantDialog
                trigger={
                  <Button>
                    <Plus className="size-4" data-icon="inline-start" />
                    Ajouter un enseignant
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
                  <TableHead>Enseignant</TableHead>
                  <TableHead>Matricule</TableHead>
                  <TableHead>MatiÃ¨res</TableHead>
                  <TableHead>Classes</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead className="w-24" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((t) => (
                  <TableRow key={t.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="size-9">
                          <AvatarFallback className="bg-secondary text-xs font-medium text-secondary-foreground">
                            {`${t.prenoms[0]}${t.nom[0]}`.toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col">
                          <span className="font-medium leading-tight">
                            {t.prenoms} {t.nom}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            Depuis{' '}
                            {new Date(t.dateEmbauche).toLocaleDateString('fr-FR', {
                              month: 'long',
                              year: 'numeric',
                            })}
                          </span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="font-mono text-xs">
                      {t.matricule}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {t.matieres.map((mid) => (
                          <Badge key={mid} variant="secondary">
                            {getMatiere(mid)?.code}
                          </Badge>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {t.classes.map((cid) => (
                          <Link key={cid} href={`/classes/${cid}`}>
                            <Badge
                              variant="outline"
                              className="transition-colors hover:bg-accent"
                            >
                              {getClasse(cid)?.nom}
                            </Badge>
                          </Link>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1.5">
                          <Phone className="size-3.5" />
                          {t.telephone}
                        </span>
                        <span className="flex items-center gap-1.5">
                          <Mail className="size-3.5" />
                          {t.email}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <EnseignantDialog
                        enseignant={t}
                        trigger={
                          <Button variant="ghost" size="sm">
                            Consulter
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

export { EnseignantDialog }

