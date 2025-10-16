'use client'

import { useState, useEffect } from 'react'
import {
  dosenApi,
  mahasiswaApi,
  reviewerApi,
  bidangKeahlianApi,
  skemaApi,
  periodeApi,
  proposalApi,
  type Dosen,
  type Mahasiswa,
  type Reviewer,
  type BidangKeahlian,
  type Skema,
  type Periode,
  type Proposal,
  type ProposalMember,
  type ApiResponse,
} from '@/lib/api-client'

// ==========================================
// Generic Hook untuk Data Fetching
// ==========================================

interface UseDataResult<T> {
  data: T | null
  loading: boolean
  error: string | null
  refetch: () => void
}

function useData<T>(
  fetchFn: () => Promise<ApiResponse<T>>
): UseDataResult<T> {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchData = async () => {
    setLoading(true)
    setError(null)
    
    try {
      const result = await fetchFn()
      
      if (result.success && result.data) {
        setData(result.data)
      } else {
        setError(result.error || 'Terjadi kesalahan')
      }
    } catch (err) {
      setError('Terjadi kesalahan koneksi')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  return {
    data,
    loading,
    error,
    refetch: fetchData,
  }
}

// ==========================================
// Dosen Hooks
// ==========================================

export function useDosen(params?: {
  search?: string
  status?: string
  bidangKeahlianId?: string
  page?: number
  limit?: number
}) {
  return useData<Dosen[]>(() => dosenApi.getAll(params))
}

export function useDosenById(id: string) {
  return useData<Dosen>(() => dosenApi.getById(id))
}

// ==========================================
// Mahasiswa Hooks
// ==========================================

export function useMahasiswa(params?: {
  search?: string
  prodi?: string
  angkatan?: string
  status?: string
  page?: number
  limit?: number
}) {
  return useData<Mahasiswa[]>(() => mahasiswaApi.getAll(params))
}

// ==========================================
// Reviewer Hooks
// ==========================================

export function useReviewer(params?: {
  search?: string
  tipe?: string
  bidangKeahlianId?: string
  status?: string
  page?: number
  limit?: number
}) {
  return useData<Reviewer[]>(() => reviewerApi.getAll(params))
}

// ==========================================
// Bidang Keahlian Hooks
// ==========================================

export function useBidangKeahlian() {
  return useData<BidangKeahlian[]>(() => bidangKeahlianApi.getAll())
}

// ==========================================
// Skema Hooks
// ==========================================

export function useSkema() {
  return useData<Skema[]>(() => skemaApi.getAll())
}

// ==========================================
// Periode Hooks
// ==========================================

export function usePeriode(params?: {
  status?: string
}) {
  return useData<Periode[]>(() => periodeApi.getAll(params))
}

// ==========================================
// Pagination Hook
// ==========================================

export function usePagination(initialPage = 1, initialLimit = 10) {
  const [page, setPage] = useState(initialPage)
  const [limit, setLimit] = useState(initialLimit)

  const nextPage = () => setPage(prev => prev + 1)
  const prevPage = () => setPage(prev => Math.max(1, prev - 1))
  const goToPage = (newPage: number) => setPage(newPage)
  const changeLimit = (newLimit: number) => {
    setLimit(newLimit)
    setPage(1) // Reset to page 1 when limit changes
  }

  return {
    page,
    limit,
    nextPage,
    prevPage,
    goToPage,
    changeLimit,
  }
}

// ==========================================
// Search/Filter Hook
// ==========================================

export function useSearchFilter(initialSearch = '') {
  const [search, setSearch] = useState(initialSearch)
  const [debouncedSearch, setDebouncedSearch] = useState(initialSearch)

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search)
    }, 500) // Debounce 500ms

    return () => clearTimeout(timer)
  }, [search])

  return {
    search,
    setSearch,
    debouncedSearch,
  }
}

// ==========================================
// Proposal Hooks
// ==========================================

export function useProposals(params?: {
  status?: string
  periodeId?: string
}) {
  return useData<Proposal[]>(() => proposalApi.getAll(params))
}

export function useProposalById(id: string) {
  return useData<Proposal>(() => proposalApi.getById(id))
}

export function useProposalMembers(proposalId: string) {
  return useData<ProposalMember[]>(() => proposalApi.getMembers(proposalId))
}
