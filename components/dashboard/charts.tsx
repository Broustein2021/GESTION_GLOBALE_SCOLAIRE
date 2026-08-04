'use client'

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  XAxis,
  YAxis,
} from 'recharts'

import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/ui/chart'
import { encaissementsMensuels, repartitionCycle } from '@/lib/data'

const financeConfig = {
  attendu: { label: 'Attendu', color: 'var(--chart-4)' },
  encaisse: { label: 'Encaissé', color: 'var(--chart-1)' },
} satisfies ChartConfig

export function FinanceChart() {
  return (
    <ChartContainer config={financeConfig} className="h-[260px] w-full">
      <BarChart data={encaissementsMensuels} accessibilityLayer>
        <CartesianGrid vertical={false} strokeDasharray="3 3" />
        <XAxis dataKey="mois" tickLine={false} axisLine={false} tickMargin={8} />
        <YAxis
          tickLine={false}
          axisLine={false}
          width={44}
          tickFormatter={(v) => `${v}k`}
        />
        <ChartTooltip
          content={<ChartTooltipContent formatter={(v) => `${v} 000 FCFA`} />}
        />
        <ChartLegend content={<ChartLegendContent />} />
        <Bar dataKey="attendu" fill="var(--color-attendu)" radius={[4, 4, 0, 0]} />
        <Bar dataKey="encaisse" fill="var(--color-encaisse)" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ChartContainer>
  )
}

const cycleConfig = {
  eleves: { label: 'Élèves' },
  Primaire: { label: 'Primaire', color: 'var(--chart-1)' },
  Collège: { label: 'Collège', color: 'var(--chart-2)' },
  Lycée: { label: 'Lycée', color: 'var(--chart-3)' },
} satisfies ChartConfig

export function CycleChart() {
  const colors = ['var(--chart-1)', 'var(--chart-2)', 'var(--chart-3)']
  return (
    <ChartContainer
      config={cycleConfig}
      className="mx-auto aspect-square h-[260px]"
    >
      <PieChart>
        <ChartTooltip content={<ChartTooltipContent nameKey="cycle" />} />
        <Pie
          data={repartitionCycle}
          dataKey="eleves"
          nameKey="cycle"
          innerRadius={58}
          strokeWidth={2}
        >
          {repartitionCycle.map((entry, i) => (
            <Cell key={entry.cycle} fill={colors[i % colors.length]} />
          ))}
        </Pie>
        <ChartLegend content={<ChartLegendContent nameKey="cycle" />} />
      </PieChart>
    </ChartContainer>
  )
}
