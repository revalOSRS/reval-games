import { useEffect, useState } from 'react'
import { useNavigate, useSearch } from '@tanstack/react-router'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useDiscordAuth, isAuthenticated } from '@/hooks/useAuth'
import { ApiError } from '@/api/client'
import { getDiscordAuthUrl } from '@/config/discord'

export default function LoginPage() {
  const [error, setError] = useState('')
  const navigate = useNavigate()
  const search = useSearch({ strict: false }) as { code?: string }
  const discordAuthMutation = useDiscordAuth()

  // Check if already authenticated
  useEffect(() => {
    if (isAuthenticated()) {
      navigate({ to: '/menu' })
    }
  }, [navigate])

  // Handle Discord OAuth callback
  useEffect(() => {
    const discordCode = search.code
    if (discordCode && !discordAuthMutation.isPending) {
      discordAuthMutation.mutate(
        { code: discordCode },
        {
          onSuccess: () => {
            navigate({ to: '/menu' })
          },
          onError: (error) => {
            if (error instanceof ApiError) {
              setError(error.message || 'Discord autentimine ebaõnnestus')
            } else {
              setError('Discord autentimine ebaõnnestus')
            }
            // Clear the code from URL
            window.history.replaceState({}, '', '/')
          },
        }
      )
    }
  }, [search.code, discordAuthMutation, navigate])

  const handleDiscordLogin = () => {
    window.location.href = getDiscordAuthUrl()
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-background to-muted">
      <Card className="w-full max-w-md shadow-2xl border-2">
        <CardHeader className="space-y-3 pb-6">
          <div className="flex justify-center mb-2">

          </div>
          <CardTitle className="text-3xl font-bold text-center">
            Reval Clani Mängukoobas
          </CardTitle>
          <CardDescription className="text-center text-base">
            Tere tulemast! Logi sisse oma Discord kontoga, et jätkata
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 px-6 pb-8">
          {error && (
            <div className="p-3 bg-destructive/10 border border-destructive/30 rounded-lg">
              <p className="text-sm text-destructive text-center">{error}</p>
            </div>
          )}
          
          <Button
            onClick={handleDiscordLogin}
            disabled={discordAuthMutation.isPending}
            className="w-full h-12 text-base font-semibold bg-[#5865F2] hover:bg-[#4752C4] text-white transition-all duration-200 shadow-lg hover:shadow-xl"
            size="lg"
          >
            {discordAuthMutation.isPending ? (
              <>
                <svg
                  className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Autentimine...
              </>
            ) : (
              <>
                <svg
                  className="w-6 h-6 mr-2"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515a.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0a12.64 12.64 0 0 0-.617-1.25a.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057a19.9 19.9 0 0 0 5.993 3.03a.078.078 0 0 0 .084-.028a14.09 14.09 0 0 0 1.226-1.994a.076.076 0 0 0-.041-.106a13.107 13.107 0 0 1-1.872-.892a.077.077 0 0 1-.008-.128a10.2 10.2 0 0 0 .372-.292a.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127a12.299 12.299 0 0 1-1.873.892a.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028a19.839 19.839 0 0 0 6.002-3.03a.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.956-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.955-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.946 2.418-2.157 2.418z" />
                </svg>
                Sisene Discord'iga
              </>
            )}
          </Button>

          <div className="pt-4 text-center">
            <p className="text-xs text-muted-foreground">
              Sisselogimisel nõustud kasutustingimustega
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
