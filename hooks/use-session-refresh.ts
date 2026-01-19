"use client"

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

/**
 * Hook untuk auto-refresh session setiap 30 menit
 * Mencegah session expired tiba-tiba saat user aktif
 */
export function useSessionRefresh() {
  const router = useRouter()
  
  useEffect(() => {
    // Refresh session setiap 30 menit (1.800.000 ms)
    // Session expire 2 jam, jadi refresh 4x sebelum expire
    const refreshInterval = 30 * 60 * 1000
    
    const refreshSession = async () => {
      try {
        const response = await fetch('/api/auth/session', {
          method: 'GET',
          credentials: 'include'
        })
        
        if (!response.ok) {
          // Session invalid, redirect to login
          router.push('/login')
        }
      } catch (error) {
        console.error('Session refresh failed:', error)
      }
    }
    
    // Initial refresh check
    refreshSession()
    
    // Set interval untuk auto-refresh
    const interval = setInterval(refreshSession, refreshInterval)
    
    // Cleanup interval on unmount
    return () => clearInterval(interval)
  }, [router])
}
