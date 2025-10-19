import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

interface MemberProfile {
  id: number
  name: string
  osrsName?: string
  totalLevel?: number
  combatLevel?: number
  joinDate?: string
  [key: string]: any
}

export default function ProfilePage() {
  const navigate = useNavigate()
  const [profile, setProfile] = useState<MemberProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const userData = JSON.parse(localStorage.getItem('user') || '{}')
        
        if (!userData.memberId || !userData.code) {
          setError('Kasutaja andmed puuduvad. Palun logi uuesti sisse.')
          setLoading(false)
          return
        }

        const response = await fetch(
          `https://webhook-catcher-zeta.vercel.app/api/member/${userData.memberId}?code=${userData.code}`
        )

        const data = await response.json()

        if (response.ok && data.status === 'success') {
          setProfile(data.data)
          // Update localStorage with fresh profile data
          localStorage.setItem('user', JSON.stringify({
            ...userData,
            profile: data.data
          }))
        } else {
          setError(data.message || 'Profiili laadimine ebaõnnestus')
        }
      } catch (err) {
        console.error('Error fetching profile:', err)
        setError('Ühenduse viga. Palun proovi hiljem uuesti.')
      } finally {
        setLoading(false)
      }
    }

    fetchProfile()
  }, [])

  if (loading) {
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
            <p className="text-lg text-destructive text-center">{error}</p>
            <div className="flex justify-center gap-4">
              <Button variant="outline" onClick={() => navigate('/menu')}>
                Tagasi menüüsse
              </Button>
              <Button onClick={() => window.location.reload()}>
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

