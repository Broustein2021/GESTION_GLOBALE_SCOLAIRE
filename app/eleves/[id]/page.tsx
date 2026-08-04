import { notFound } from 'next/navigation'
import {
  ArrowLeft,
  Phone,
  MapPin,
  Calendar,
  Pencil,
  FileText,
  Users as UsersIcon,
} from 'lucide-react'

import { LinkButton } from '@/components/link-button'
import { Button } from '@/components/ui/button'
import { PaymentBadge } from '@/components/payment-badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  eleves,
  getClasse,
  getParent,
  formatFCFA,
  matieres,
  paiements,
} from '@/lib/data'

export function generateStaticParams() {
  return eleves.map((e) => ({ id: e.id }))
}

function Info({ icon: Icon, label, value }: { icon: typeof Phone; label: string; value: string }) {
  return (
    <div className="flex items-start gap-3">
      <Icon className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
      <div className="flex flex-col">
        <span className="text-xs text-muted-foreground">{label}</span>
        <span className="text-sm font-medium">{value}</span>
      </div>
    </div>
  )
}

export default async function FicheElevePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const eleve = eleves.find((e) => e.id === id)
  if (!eleve) notFound()

  const classe = getClasse(eleve.classeId)
  const parents = eleve.parentIds.map(getParent).filter(Boolean)
  const paiementsEleve = paiements.filter((p) => p.eleveId === eleve.id)
  const tauxPaiement = Math.round((eleve.montantPaye / eleve.montantDu) * 100)

  // Notes simulées par matière pour la fiche
  const notesMatiere = matieres
    .filter((m) => m.cycle === classe?.cycle)
    .map((m, i) => ({
      matiere: m.nom,
      coef: m.coefficient,
      note: eleve.moyenne > 0 ? Math.max(6, Math.min(19, eleve.moyenne + (i % 3) - 1)) : 0,
    }))

  return (
    <>
      <div className="flex items-center gap-2">
        <LinkButton href="/eleves" variant="ghost" size="sm">
          <ArrowLeft className="size-4" data-icon="inline-start" />
          Élèves
        </LinkButton>
      </div>

      {/* En-tête fiche */}
      <Card>
        <CardContent className="flex flex-col gap-4 p-5 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-4">
            <Avatar className="size-16">
              <AvatarFallback className="bg-primary text-lg font-semibold text-primary-foreground">
                {`${eleve.prenoms[0]}${eleve.nom[0]}`.toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col gap-1">
              <h1 className="text-xl font-semibold tracking-tight">
                {eleve.prenoms} {eleve.nom}
              </h1>
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="outline" className="font-mono">
                  {eleve.matricule}
                </Badge>
                <Badge variant="secondary">{classe?.nom}</Badge>
                <PaymentBadge statut={eleve.statutPaiement} />
                {eleve.statut === 'nouveau' ? (
                  <Badge variant="secondary" className="bg-primary/10 text-primary">
                    Nouveau
                  </Badge>
                ) : null}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline">
              <FileText className="size-4" data-icon="inline-start" />
              Bulletin
            </Button>
            <Button>
              <Pencil className="size-4" data-icon="inline-start" />
              Modifier
            </Button>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="infos" className="gap-4">
        <TabsList>
          <TabsTrigger value="infos">Informations</TabsTrigger>
          <TabsTrigger value="notes">Notes</TabsTrigger>
          <TabsTrigger value="parents">Responsables</TabsTrigger>
          <TabsTrigger value="paiements">Paiements</TabsTrigger>
        </TabsList>

        {/* Informations */}
        <TabsContent value="infos" className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Informations personnelles</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Info icon={Calendar} label="Date de naissance" value={new Date(eleve.dateNaissance).toLocaleDateString('fr-FR')} />
              <Info icon={MapPin} label="Lieu de naissance" value={eleve.lieuNaissance} />
              <Info icon={UsersIcon} label="Sexe" value={eleve.sexe === 'F' ? 'Féminin' : 'Masculin'} />
              <Info icon={FileText} label="Nationalité" value={eleve.nationalite} />
              <Info icon={Phone} label="Téléphone" value={eleve.telephone} />
              <Info icon={MapPin} label="Adresse" value={eleve.adresse} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Scolarité & finances</CardTitle>
              <CardDescription>Année en cours</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <div className="grid grid-cols-2 gap-4">
                <Info icon={Calendar} label="Date d'inscription" value={new Date(eleve.dateInscription).toLocaleDateString('fr-FR')} />
                <Info icon={UsersIcon} label="Niveau / Classe" value={`${eleve.niveau} — ${classe?.nom ?? ''}`} />
              </div>
              <div className="flex flex-col gap-2 rounded-lg border p-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Frais réglés</span>
                  <span className="font-medium tabular-nums">
                    {formatFCFA(eleve.montantPaye)} / {formatFCFA(eleve.montantDu)}
                  </span>
                </div>
                <Progress value={tauxPaiement} />
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Reste à payer</span>
                  <span className="font-semibold tabular-nums text-destructive">
                    {formatFCFA(eleve.montantDu - eleve.montantPaye)}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notes */}
        <TabsContent value="notes">
          <Card>
            <CardHeader>
              <CardTitle>Relevé de notes</CardTitle>
              <CardDescription>
                Moyenne générale : {eleve.moyenne > 0 ? `${eleve.moyenne.toFixed(2)}/20` : 'Non disponible'}
              </CardDescription>
            </CardHeader>
            <CardContent className="px-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Matière</TableHead>
                    <TableHead className="text-center">Coef.</TableHead>
                    <TableHead className="text-right">Note</TableHead>
                    <TableHead className="text-right">Points</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {notesMatiere.map((n) => (
                    <TableRow key={n.matiere}>
                      <TableCell className="font-medium">{n.matiere}</TableCell>
                      <TableCell className="text-center tabular-nums">{n.coef}</TableCell>
                      <TableCell className="text-right tabular-nums">
                        {n.note > 0 ? `${n.note.toFixed(2)}/20` : '—'}
                      </TableCell>
                      <TableCell className="text-right tabular-nums">
                        {n.note > 0 ? (n.note * n.coef).toFixed(1) : '—'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Responsables */}
        <TabsContent value="parents" className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {parents.length === 0 ? (
            <Card>
              <CardContent className="p-6 text-sm text-muted-foreground">
                Aucun responsable enregistré pour cet élève.
              </CardContent>
            </Card>
          ) : (
            parents.map((p) => (
              <Card key={p!.id}>
                <CardContent className="flex flex-col gap-3 p-5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar className="size-10">
                        <AvatarFallback className="bg-secondary text-xs text-secondary-foreground">
                          {`${p!.prenoms[0]}${p!.nom[0]}`.toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col">
                        <span className="font-medium">{p!.prenoms} {p!.nom}</span>
                        <span className="text-xs text-muted-foreground">{p!.lien} — {p!.profession}</span>
                      </div>
                    </div>
                    {p!.principal ? (
                      <Badge variant="secondary" className="bg-primary/10 text-primary">Principal</Badge>
                    ) : null}
                  </div>
                  <div className="flex flex-col gap-2 border-t pt-3">
                    <Info icon={Phone} label="Téléphone" value={p!.telephone} />
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        {/* Paiements */}
        <TabsContent value="paiements">
          <Card>
            <CardHeader>
              <CardTitle>Historique des paiements</CardTitle>
            </CardHeader>
            <CardContent className="px-0">
              {paiementsEleve.length === 0 ? (
                <p className="px-6 text-sm text-muted-foreground">Aucun paiement enregistré.</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Reçu</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Motif</TableHead>
                      <TableHead>Mode</TableHead>
                      <TableHead className="text-right">Montant</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paiementsEleve.map((p) => (
                      <TableRow key={p.id}>
                        <TableCell className="font-mono text-xs">{p.recu}</TableCell>
                        <TableCell>{new Date(p.date).toLocaleDateString('fr-FR')}</TableCell>
                        <TableCell className="text-muted-foreground">{p.motif}</TableCell>
                        <TableCell>{p.mode}</TableCell>
                        <TableCell className="text-right font-medium tabular-nums">{formatFCFA(p.montant)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </>
  )
}
