# Correctif contexte école — GESTION-SCOLAIRE

## Fichiers à remplacer/copier

Copier les fichiers du dossier `components/` dans le projet :

- `components/school-provider.tsx` — nouveau
- `components/app-shell.tsx` — remplacer
- `components/topbar.tsx` — remplacer
- `components/app-sidebar.tsx` — remplacer

Aucune modification SQL n'est nécessaire pour ce correctif.

## Comportement obtenu

- `/onboarding` reste une route indépendante : pas de Sidebar, pas de Topbar.
- Après connexion, l'application récupère l'école active de l'utilisateur via `school_members`.
- Le nom de l'école dans la Topbar vient de `schools.name`.
- Le nom de l'organisation dans la Sidebar vient de `organizations.name`.
- L'année scolaire vient de `academic_years`.
- Si un utilisateur authentifié n'a encore aucune école, l'application le redirige vers `/onboarding`.
- Les données de maquette de `lib/data.ts` ne sont pas supprimées : elles restent temporairement utilisées par les modules qui n'ont pas encore été migrés vers Supabase.

## Important

Le correctif suppose que l'utilisateur possède un membre `school_members` avec `status = 'active'`.
Le RPC `create_initial_school` doit continuer à créer ce membre avec le rôle `org_admin`, comme dans la fonction actuelle.
