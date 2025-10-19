import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from '@/components/ui/input-otp'

export default function LoginPage() {
  const [code, setCode] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleLogin = async () => {
    if (code.length !== 9) {
      setError('Palun sisesta täielik 9-kohaline kood')
      return
    }

    setLoading(true)
    setError('')

    try {
      const response = await fetch(
        'https://webhook-catcher-zeta.vercel.app/api/login',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ code }),
        }
      )

      const data = await response.json()

      if (response.ok && data.status === 'success') {
        // Store member data in localStorage
        localStorage.setItem('user', JSON.stringify({
          memberId: data.data.id,
          code,
          profile: data.data
        }))
        navigate('/menu')
      } else {
        // Handle specific error messages
        if (response.status === 403) {
          setError('Konto ei ole aktiivne')
        } else if (response.status === 401) {
          setError('Vigane kood')
        } else {
          setError(data.message || 'Vigane kood. Palun proovi uuesti.')
        }
      }
    } catch (error) {
      console.error('Login error:', error)
      setError('Ühenduse viga. Palun proovi hiljem uuesti.')
    } finally {
      setLoading(false)
    }
  }

  const handleComplete = (value: string) => {
    if (value.length === 9) {
      setCode(value)
      setError('')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-lg">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">Reval Clani Mängukoobas</CardTitle>
          <CardDescription className="text-center">
            Sisesta enda 9-kohaline kood, et jätkata
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 p-6 pt-0">
          <div className="flex justify-center">
            <InputOTP
              maxLength={9}
              value={code}
              onChange={(value) => {
                setCode(value)
                handleComplete(value)
              }}
              disabled={loading}
            >
              <InputOTPGroup>
                <InputOTPSlot index={0} />
                <InputOTPSlot index={1} />
                <InputOTPSlot index={2} />
              </InputOTPGroup>
              <InputOTPSeparator />
              <InputOTPGroup>
                <InputOTPSlot index={3} />
                <InputOTPSlot index={4} />
                <InputOTPSlot index={5} />
              </InputOTPGroup>
              <InputOTPSeparator />
              <InputOTPGroup>
                <InputOTPSlot index={6} />
                <InputOTPSlot index={7} />
                <InputOTPSlot index={8} />
              </InputOTPGroup>
            </InputOTP>
          </div>
          {error && <p className="text-sm text-destructive text-center">{error}</p>}
          <Button
            onClick={handleLogin}
            disabled={loading || code.length !== 9}
            className="w-full"
          >
            {loading ? 'Verifying...' : 'Enter'}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}

