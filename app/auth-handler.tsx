'use client'

import { useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

export function AuthHandler() {
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    const code = searchParams.get('code')

    if (code) {
      // Redirect to the auth callback route to handle the code
      router.push(`/auth/callback?code=${code}`)
    }
  }, [searchParams, router])

  return null
}
