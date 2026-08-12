import type { createClient } from '@/lib/supabase/server'

type SupabaseServerClient = Awaited<ReturnType<typeof createClient>>

/**
 * Calcule la moyenne pondérée (score * coefficient de l'évaluation) de
 * chaque élève d'une liste, à partir des notes réellement saisies.
 * Un élève sans note reçoit 0 (affiché comme "—" côté UI).
 */
export async function getMoyennesParEleve(
  supabase: SupabaseServerClient,
  schoolId: string,
  studentIds: string[],
): Promise<Map<string, number>> {
  const moyennes = new Map<string, number>()
  if (studentIds.length === 0) return moyennes

  const { data: gradeRows } = await supabase
    .from('grades')
    .select('student_id, score, assessments:assessment_id ( coefficient )')
    .in('student_id', studentIds)
    .eq('school_id', schoolId)
    .not('score', 'is', null)

  const totals = new Map<string, { points: number; coef: number }>()
  for (const g of gradeRows ?? []) {
    const assessment = Array.isArray(g.assessments) ? g.assessments[0] : g.assessments
    const coef = assessment?.coefficient ?? 1
    const score = Number(g.score)
    const t = totals.get(g.student_id) ?? { points: 0, coef: 0 }
    t.points += score * coef
    t.coef += coef
    totals.set(g.student_id, t)
  }
  for (const [studentId, t] of totals) {
    moyennes.set(studentId, t.coef > 0 ? t.points / t.coef : 0)
  }
  return moyennes
}
