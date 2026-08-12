import { createClient } from '@/lib/supabase/server'
import { getCurrentSchoolContext } from '@/lib/queries/school-context'

export type MatiereRef = { id: string; code: string; nom: string }
export type ClasseRef = { id: string; nom: string }

export type Enseignant = {
  id: string
  matricule: string
  nom: string
  prenoms: string
  sexe: 'M' | 'F' | null
  telephone: string
  email: string
  matiereIds: string[]
  matieres: MatiereRef[]
  classes: ClasseRef[]
  statut: 'actif' | 'conge' | 'archive'
  dateEmbauche: string | null
}

/**
 * Enseignants de l'école, avec leurs matières et classes réellement
 * affectées pour l'année scolaire courante (table teacher_assignments).
 * Retourne aussi la liste des matières de l'école, pour alimenter les
 * filtres/select sans requête supplémentaire.
 */
export async function getEnseignantsData(): Promise<{
  enseignants: Enseignant[]
  matieres: MatiereRef[]
}> {
  const ctx = await getCurrentSchoolContext()
  if (!ctx) return { enseignants: [], matieres: [] }

  const supabase = await createClient()

  const [{ data: teacherRows, error: teacherError }, { data: subjectRows }, { data: classRows }, { data: assignmentRows }] =
    await Promise.all([
      supabase
        .from('teachers')
        .select('id, matricule, last_name, first_name, gender, phone, email, hired_on, status')
        .eq('school_id', ctx.schoolId)
        .order('last_name', { ascending: true }),
      supabase
        .from('subjects')
        .select('id, code, name')
        .eq('school_id', ctx.schoolId)
        .eq('is_active', true),
      supabase.from('classes').select('id, name').eq('school_id', ctx.schoolId).eq('academic_year_id', ctx.academicYearId),
      supabase
        .from('teacher_assignments')
        .select('teacher_id, subject_id, class_id')
        .eq('school_id', ctx.schoolId)
        .eq('academic_year_id', ctx.academicYearId),
    ])

  if (teacherError || !teacherRows) {
    console.error('[getEnseignantsData] erreur Supabase :', teacherError)
    return { enseignants: [], matieres: [] }
  }

  const matieres: MatiereRef[] = (subjectRows ?? []).map((s) => ({
    id: s.id,
    code: s.code,
    nom: s.name,
  }))
  const matiereById = new Map(matieres.map((m) => [m.id, m]))
  const classeById = new Map((classRows ?? []).map((c) => [c.id, { id: c.id, nom: c.name }]))

  const matiereIdsParProf = new Map<string, Set<string>>()
  const classeIdsParProf = new Map<string, Set<string>>()
  for (const a of assignmentRows ?? []) {
    if (!matiereIdsParProf.has(a.teacher_id)) matiereIdsParProf.set(a.teacher_id, new Set())
    matiereIdsParProf.get(a.teacher_id)!.add(a.subject_id)
    if (!classeIdsParProf.has(a.teacher_id)) classeIdsParProf.set(a.teacher_id, new Set())
    if (a.class_id) classeIdsParProf.get(a.teacher_id)!.add(a.class_id)
  }

  const enseignants: Enseignant[] = teacherRows.map((t) => {
    const matiereIds = Array.from(matiereIdsParProf.get(t.id) ?? [])
    const classeIds = Array.from(classeIdsParProf.get(t.id) ?? [])
    return {
      id: t.id,
      matricule: t.matricule,
      nom: t.last_name,
      prenoms: t.first_name,
      sexe: t.gender,
      telephone: t.phone ?? '—',
      email: t.email ?? '—',
      matiereIds,
      matieres: matiereIds.map((id) => matiereById.get(id)).filter((m): m is MatiereRef => Boolean(m)),
      classes: classeIds.map((id) => classeById.get(id)).filter((c): c is ClasseRef => Boolean(c)),
      statut: t.status,
      dateEmbauche: t.hired_on,
    }
  })

  return { enseignants, matieres }
}
