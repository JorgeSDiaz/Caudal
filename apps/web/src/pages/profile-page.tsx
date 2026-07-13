import { ProfileForm } from '@/features/profile/components/profile-form'
import { useProfile } from '@/features/profile/hooks/use-profile'

export function ProfilePage() {
  const { profile, error, isLoading, save } = useProfile()
  if (isLoading) return <p className="text-muted-foreground">Cargando perfil…</p>
  if (error || !profile) return <p className="text-destructive">No se pudo cargar el perfil.</p>
  return <div className="mx-auto max-w-6xl"><ProfileForm key={profile.updated_at} profile={profile} save={save} /></div>
}
