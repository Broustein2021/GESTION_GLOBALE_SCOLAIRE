import { createClient } from '@/lib/supabase/server'
import { getCurrentSchoolContext } from '@/lib/queries/school-context'

export type MatiereEnseignant = { id: string; nom: string; prenoms: string }

export type Matiere = {
  id: string
  code: string
  nom: string
  coefficient: number
  cycle: 'Primaire' | 'Collège' | 'Lycée'
  enseignants: MatiereEnseignant[]
}

/**
 * Matières de l'école, avec la liste des enseignants réellement
 * affectés à chacune pour l'année scolaire courante
 * (table teacher_assignments, pas un champ figé sur la matière).
 */
export async function getMatieres(): Promise<Matiere[]> {
  const ctx = await getCurrentSchoolContext()
  if (!ctx) return []

  const supabase = await createClient()

  const [{ data: subjectRows, error }, { data: assignmentRows }] = await Promise.all([
    supabase
      .from('subjects')
      .select('id, code, name, coefficient, cycle')
      .eq('school_id', ctx.schoolId)
      .eq('is_active', true)
      .order('name', { ascending: true }),
    supabase
      .from('teacher_assignments')
      .select('subject_id, teachers:teacher_id ( id, first_name, last_name )')
      .eq('school_id', ctx.schoolId)
      .eq('academic_year_id', ctx.academicYearId),
  ])

  if (error || !subjectRows) {
    console.error('[getMatieres] erreur Supabase :', error)
    return []
  }

  const enseignantsParMatiere = new Map<string, Map<string, MatiereEnseignant>>()
  for (const a of assignmentRows ?? []) {
    const t = Array.isArray(a.teachers) ? a.teachers[0] : a.teachers
    if (!t) continue
    if (!enseignantsParMatiere.has(a.subject_id)) enseignantsParMatiere.set(a.subject_id, new Map())
    enseignantsParMatiere.get(a.subject_id)!.set(t.id, {
      id: t.id,
      nom: t.last_name,
      prenoms: t.first_name,
    })
  }

  return subjectRows.map((s) => ({
    id: s.id,
    code: s.code,
    nom: s.name,
    coefficient: Number(s.coefficient),
    cycle: s.cycle,
    enseignants: Array.from(enseignantsParMatiere.get(s.id)?.values() ?? []),
  }))
}
