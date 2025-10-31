import { HeroSection } from '@/components/hero-section-1'
import { useEffect } from 'react'
import { useNavigate, useSearch } from '@tanstack/react-router'

export default function LandingPage() {
  const navigate = useNavigate()
  const search = useSearch({ strict: false }) as { code?: string }

  // Handle Discord OAuth callback
  useEffect(() => {
    const code = search.code
    if (code) {
      // Redirect to login page with the code for authentication
      navigate({ to: '/login', search: { code } })
    }
  }, [search.code, navigate])

  useEffect(() => {
    // Hide scrollbar on mount
    document.documentElement.style.scrollbarWidth = 'none'
    // @ts-ignore - msOverflowStyle is not in TS types but exists in IE/Edge
    document.documentElement.style.msOverflowStyle = 'none'
    document.body.style.overflow = 'overlay'
    
    // Add webkit scrollbar hiding
    const style = document.createElement('style')
    style.innerHTML = `
      html::-webkit-scrollbar { display: none !important; width: 0 !important; }
      body::-webkit-scrollbar { display: none !important; width: 0 !important; }
    `
    document.head.appendChild(style)
    
    // Restore scrollbar on unmount
    return () => {
      document.documentElement.style.scrollbarWidth = ''
      // @ts-ignore - msOverflowStyle is not in TS types but exists in IE/Edge
      document.documentElement.style.msOverflowStyle = ''
      document.body.style.overflow = ''
      document.head.removeChild(style)
    }
  }, [])

  return (
    <div data-landing-page className="overflow-x-hidden">
      <HeroSection />
    </div>
  )
}

