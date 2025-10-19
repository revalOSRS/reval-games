import { useNavigate } from 'react-router-dom'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useProfile } from '@/hooks/useProfile'
import { ApiError } from '@/api/client'

export default function ProfilePage() {
  const navigate = useNavigate()
  const { data: profile, isLoading, error, refetch } = useProfile()

  const getErrorMessage = (err: Error): string => {
    if (err instanceof ApiError) {
      return err.message
    }
    if (err.message.includes('Kasutaja andmed puuduvad')) {
      return err.message
    }
    return 'Ühenduse viga. Palun proovi hiljem uuesti.'
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-2xl">
          <CardContent className="p-8 text-center">
            <p className="text-lg text-muted-foreground">Laadin profiili...</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-2xl">
          <CardContent className="p-8 space-y-4">
            <p className="text-lg text-destructive text-center">
              {getErrorMessage(error)}
            </p>
            <div className="flex justify-center gap-4">
              <Button variant="outline" onClick={() => navigate('/menu')}>
                Tagasi menüüsse
              </Button>
              <Button onClick={() => refetch()}>
                Proovi uuesti
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-2xl space-y-8">
        <div className="flex justify-between items-center">
          <h1 className="text-4xl font-bold text-foreground">Mängija Profiil</h1>
          <Button variant="outline" onClick={() => navigate('/menu')}>
            Tagasi menüüsse
          </Button>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>Profiili Informatsioon</CardTitle>
            <CardDescription>Sinu RuneScape mängija detailid</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Nimi</label>
              <p className="text-lg font-semibold">{profile?.name || 'N/A'}</p>
            </div>
            
            {profile?.osrsName && (
              <div>
                <label className="text-sm font-medium text-muted-foreground">OSRS Nimi</label>
                <p className="text-lg font-semibold">{profile.osrsName}</p>
              </div>
            )}
            
            {profile?.totalLevel !== undefined && (
              <div>
                <label className="text-sm font-medium text-muted-foreground">Kogu Tase</label>
                <p className="text-lg font-semibold">{profile.totalLevel}</p>
              </div>
            )}
            
            {profile?.combatLevel !== undefined && (
              <div>
                <label className="text-sm font-medium text-muted-foreground">Võitluse Tase</label>
                <p className="text-lg font-semibold">{profile.combatLevel}</p>
              </div>
            )}

            {profile?.joinDate && (
              <div>
                <label className="text-sm font-medium text-muted-foreground">Liitumise Kuupäev</label>
                <p className="text-lg font-semibold">
                  {new Date(profile.joinDate).toLocaleDateString('et-EE')}
                </p>
              </div>
            )}

            <div>
              <label className="text-sm font-medium text-muted-foreground">Liikme ID</label>
              <p className="text-lg font-semibold">{profile?.id || 'N/A'}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Hiljutine Tegevus</CardTitle>
            <CardDescription>Sinu viimased saavutused ja üritused</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">Hiljutist tegevust ei ole</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

