'use client'

import { FormEvent, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  Building2,
  School,
  MapPin,
  Phone,
  Mail,
  User,
  Loader2,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react'

import { createClient } from '@/lib/supabase/client'

const schoolTypes = [
  { value: 'primaire', label: 'École primaire' },
  { value: 'secondaire', label: 'Établissement secondaire' },
  { value: 'primaire_secondaire', label: 'Primaire et secondaire' },
  { value: 'lycee', label: 'Lycée' },
  { value: 'autre', label: 'Autre' },
]

export default function ConfigurationPage() {
  const router = useRouter()
  const supabase = createClient()

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [form, setForm] = useState({
    fullName: '',
    organizationName: '',
    schoolName: '',
    schoolType: 'primaire_secondaire',
    shortName: '',
    address: '',
    city: '',
    commune: '',
    phone: '',
    schoolEmail: '',
  })

  function updateField(
    field: keyof typeof form,
    value: string
  ) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }))
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    setError('')

    if (!form.fullName.trim()) {
      setError('Veuillez renseigner votre nom complet.')
      return
    }

    if (!form.organizationName.trim()) {
      setError('Veuillez renseigner le nom de l’organisation.')
      return
    }

    if (!form.schoolName.trim()) {
      setError('Veuillez renseigner le nom de l’établissement.')
      return
    }

    setLoading(true)

    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser()

      if (userError || !user) {
        throw new Error(
          'Votre session a expiré. Veuillez vous reconnecter.'
        )
      }

      const { error: rpcError } = await supabase.rpc(
        'create_initial_school',
        {
          p_organization_name: form.organizationName.trim(),
          p_school_name: form.schoolName.trim(),
          p_school_type: form.schoolType,
          p_short_name: form.shortName.trim() || null,
          p_address: form.address.trim() || null,
          p_city: form.city.trim() || null,
          p_commune: form.commune.trim() || null,
          p_phone: form.phone.trim() || null,
          p_school_email: form.schoolEmail.trim() || null,
          p_full_name: form.fullName.trim(),
        }
      )

      if (rpcError) {
        if (rpcError.message.includes('USER_ALREADY_HAS_SCHOOL')) {
          router.replace('/')
          return
        }

        throw new Error(
          rpcError.message || 'Impossible de créer l’établissement.'
        )
      }

      router.replace('/')
      router.refresh()
    } catch (err) {
      console.error(err)

      setError(
        err instanceof Error
          ? err.message
          : 'Une erreur est survenue lors de la configuration.'
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-muted/30 px-4 py-8">
      <div className="mx-auto max-w-4xl">
        {/* En-tête */}
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-sm">
            <School className="size-7" />
          </div>

          <h1 className="text-3xl font-bold tracking-tight">
            Configurez votre établissement
          </h1>

          <p className="mx-auto mt-2 max-w-2xl text-muted-foreground">
            Quelques informations suffisent pour créer votre espace
            de gestion scolaire.
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Colonne principale */}
            <div className="space-y-6 lg:col-span-2">
              {/* Organisation */}
              <section className="rounded-xl border bg-background p-6 shadow-sm">
                <div className="mb-6 flex items-start gap-3">
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Building2 className="size-5" />
                  </div>

                  <div>
                    <h2 className="font-semibold">
                      Organisation
                    </h2>
                    <p className="text-sm text-muted-foreground">
                      Informations générales de votre structure.
                    </p>
                  </div>
                </div>

                <div className="grid gap-5">
                  <div>
                    <label
                      htmlFor="organizationName"
                      className="mb-2 block text-sm font-medium"
                    >
                      Nom de l’organisation *
                    </label>

                    <input
                      id="organizationName"
                      value={form.organizationName}
                      onChange={(e) =>
                        updateField(
                          'organizationName',
                          e.target.value
                        )
                      }
                      placeholder="Ex. Groupe Scolaire Excellence"
                      className="w-full rounded-lg border bg-background px-3 py-2.5 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                      required
                    />
                  </div>
                </div>
              </section>

              {/* Établissement */}
              <section className="rounded-xl border bg-background p-6 shadow-sm">
                <div className="mb-6 flex items-start gap-3">
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <School className="size-5" />
                  </div>

                  <div>
                    <h2 className="font-semibold">
                      Établissement
                    </h2>
                    <p className="text-sm text-muted-foreground">
                      Informations qui apparaîtront dans votre espace
                      scolaire.
                    </p>
                  </div>
                </div>

                <div className="grid gap-5 sm:grid-cols-2">
                  <div className="sm:col-span-2">
                    <label
                      htmlFor="schoolName"
                      className="mb-2 block text-sm font-medium"
                    >
                      Nom de l’établissement *
                    </label>

                    <input
                      id="schoolName"
                      value={form.schoolName}
                      onChange={(e) =>
                        updateField('schoolName', e.target.value)
                      }
                      placeholder="Ex. Groupe Scolaire Excellence"
                      className="w-full rounded-lg border bg-background px-3 py-2.5 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                      required
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="shortName"
                      className="mb-2 block text-sm font-medium"
                    >
                      Nom court
                    </label>

                    <input
                      id="shortName"
                      value={form.shortName}
                      onChange={(e) =>
                        updateField('shortName', e.target.value)
                      }
                      placeholder="Ex. GSE"
                      className="w-full rounded-lg border bg-background px-3 py-2.5 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="schoolType"
                      className="mb-2 block text-sm font-medium"
                    >
                      Type d’établissement *
                    </label>

                    <select
                      id="schoolType"
                      value={form.schoolType}
                      onChange={(e) =>
                        updateField('schoolType', e.target.value)
                      }
                      className="w-full rounded-lg border bg-background px-3 py-2.5 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                    >
                      {schoolTypes.map((type) => (
                        <option
                          key={type.value}
                          value={type.value}
                        >
                          {type.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label
                      htmlFor="city"
                      className="mb-2 block text-sm font-medium"
                    >
                      Ville
                    </label>

                    <input
                      id="city"
                      value={form.city}
                      onChange={(e) =>
                        updateField('city', e.target.value)
                      }
                      placeholder="Ex. Abidjan"
                      className="w-full rounded-lg border bg-background px-3 py-2.5 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="commune"
                      className="mb-2 block text-sm font-medium"
                    >
                      Commune
                    </label>

                    <input
                      id="commune"
                      value={form.commune}
                      onChange={(e) =>
                        updateField('commune', e.target.value)
                      }
                      placeholder="Ex. Cocody"
                      className="w-full rounded-lg border bg-background px-3 py-2.5 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label
                      htmlFor="address"
                      className="mb-2 block text-sm font-medium"
                    >
                      Adresse
                    </label>

                    <div className="relative">
                      <MapPin className="absolute left-3 top-3 size-4 text-muted-foreground" />

                      <input
                        id="address"
                        value={form.address}
                        onChange={(e) =>
                          updateField('address', e.target.value)
                        }
                        placeholder="Adresse complète"
                        className="w-full rounded-lg border bg-background py-2.5 pl-9 pr-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                      />
                    </div>
                  </div>
                </div>
              </section>

              {/* Contact */}
              <section className="rounded-xl border bg-background p-6 shadow-sm">
                <div className="mb-6 flex items-start gap-3">
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Phone className="size-5" />
                  </div>

                  <div>
                    <h2 className="font-semibold">
                      Coordonnées
                    </h2>
                    <p className="text-sm text-muted-foreground">
                      Informations de contact de l’établissement.
                    </p>
                  </div>
                </div>

                <div className="grid gap-5 sm:grid-cols-2">
                  <div>
                    <label
                      htmlFor="phone"
                      className="mb-2 block text-sm font-medium"
                    >
                      Téléphone
                    </label>

                    <div className="relative">
                      <Phone className="absolute left-3 top-3 size-4 text-muted-foreground" />

                      <input
                        id="phone"
                        type="tel"
                        value={form.phone}
                        onChange={(e) =>
                          updateField('phone', e.target.value)
                        }
                        placeholder="+225 07 00 00 00 00"
                        className="w-full rounded-lg border bg-background py-2.5 pl-9 pr-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                      />
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="schoolEmail"
                      className="mb-2 block text-sm font-medium"
                    >
                      Email de l’établissement
                    </label>

                    <div className="relative">
                      <Mail className="absolute left-3 top-3 size-4 text-muted-foreground" />

                      <input
                        id="schoolEmail"
                        type="email"
                        value={form.schoolEmail}
                        onChange={(e) =>
                          updateField(
                            'schoolEmail',
                            e.target.value
                          )
                        }
                        placeholder="contact@ecole.ci"
                        className="w-full rounded-lg border bg-background py-2.5 pl-9 pr-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                      />
                    </div>
                  </div>
                </div>
              </section>
            </div>

            {/* Colonne droite */}
            <aside className="space-y-6">
              <section className="rounded-xl border bg-background p-6 shadow-sm">
                <div className="mb-5 flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <User className="size-5" />
                </div>

                <h2 className="font-semibold">
                  Administrateur
                </h2>

                <p className="mt-1 text-sm text-muted-foreground">
                  Ces informations seront associées à votre compte
                  administrateur.
                </p>

                <div className="mt-5">
                  <label
                    htmlFor="fullName"
                    className="mb-2 block text-sm font-medium"
                  >
                    Nom complet *
                  </label>

                  <input
                    id="fullName"
                    value={form.fullName}
                    onChange={(e) =>
                      updateField('fullName', e.target.value)
                    }
                    placeholder="Jean Marie BROU"
                    className="w-full rounded-lg border bg-background px-3 py-2.5 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                    required
                  />
                </div>
              </section>

              <section className="rounded-xl border bg-primary/5 p-6">
                <div className="flex gap-3">
                  <ShieldCheck className="mt-0.5 size-5 shrink-0 text-primary" />

                  <div>
                    <h3 className="font-semibold">
                      Votre espace est sécurisé
                    </h3>

                    <p className="mt-2 text-sm leading-6 text-muted-foreground">
                      Vous serez automatiquement enregistré comme
                      administrateur principal de l’établissement.
                    </p>
                  </div>
                </div>
              </section>

              {error && (
                <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground shadow-sm transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    Création en cours...
                  </>
                ) : (
                  <>
                    Créer mon établissement
                    <ArrowRight className="size-4" />
                  </>
                )}
              </button>
            </aside>
          </div>
        </form>
      </div>
    </main>
  )
}