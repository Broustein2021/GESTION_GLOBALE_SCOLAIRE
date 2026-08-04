import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { statutPaiementLabel, type StatutPaiement } from '@/lib/data'

export function PaymentBadge({ statut }: { statut: StatutPaiement }) {
  const styles: Record<StatutPaiement, string> = {
    a_jour: 'bg-primary/10 text-primary',
    partiel: 'bg-chart-3/15 text-chart-3',
    retard: 'bg-destructive/10 text-destructive',
  }
  return (
    <Badge variant="secondary" className={cn('border-transparent', styles[statut])}>
      {statutPaiementLabel[statut]}
    </Badge>
  )
}
