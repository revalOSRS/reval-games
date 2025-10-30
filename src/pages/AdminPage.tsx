import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import AdminBoardBuilder from '@/components/AdminBoardBuilder'

type AdminTab = 'battleship-bingo' | 'other-games' | 'settings'

export default function AdminPage() {
  return (
    <div className="h-screen overflow-hidden bg-background">
      <AdminBoardBuilder />

    </div>
  )
}

