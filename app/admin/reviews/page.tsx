'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { adminReviewApi } from '@/lib/api-client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { SearchInput } from '@/components/ui/search-input'
import { Progress } from '@/components/ui/progress'
import { TabsContent } from '@/components/ui/tabs'
import { Eye, CheckCircle2, Clock, AlertCircle, FileText } from 'lucide-react'
import DashboardLayout from '@/components/layout/dashboard-layout'
import { ResponsiveTabs } from '@/components/ui/responsive-tabs'
import { Skeleton } from '@/components/ui/skeleton'
import { getStatusBadgeVariant } from '@/lib/utils'

interface ProposalReviewed {
  id: string
  judul: string
  jenis: string
  status: string
  submittedAt: string | null
  danaDisetujui: number | null
  periode: {
    id: string
    tahun: number
    nama: string
  }
  skema: {
    id: string
    nama: string
    tipe: string
    dana: number
  }
  dosen: {
    id: string
    nidn: string
    nama: string
    email: string
  }
  bidangkeahlian: {
    id: string
    nama: string
  } | null
  reviewStatus: {
    total: number
    completed: number
    allComplete: boolean
    label: string
  }
}

export default function AdminReviewsPage() {
  const router = useRouter()
  const [proposals, setProposals] = useState<ProposalReviewed[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [activeTab, setActiveTab] = useState('all')
  const itemsPerPage = 10

  useEffect(() => {
    loadProposals()
  }, [])

  const loadProposals = async () => {
    try {
      setLoading(true)
      const result = await adminReviewApi.getProposalsReviewed()
      if (result.success && result.data) {
        setProposals(result.data)
      }
    } catch (error: any) {
      console.error('Failed to load proposals:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredProposals = proposals.filter(p =>
    p.judul.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.dosen.nama.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.skema.nama.toLowerCase().includes(searchQuery.toLowerCase())
  )

  // Hanya proposal yang masih DIREVIEW dan review lengkap yang bisa diputuskan
  const completeProposals = filteredProposals.filter(p => 
    p.status === 'DIREVIEW' && p.reviewStatus.allComplete
  )
  const incompleteProposals = filteredProposals.filter(p => 
    p.status === 'DIREVIEW' && !p.reviewStatus.allComplete
  )
  const decidedProposals = filteredProposals.filter(p => 
    p.status === 'DITERIMA' || p.status === 'DITOLAK'
  )

  // Reset page saat tab atau search berubah
  useEffect(() => {
    setCurrentPage(1)
  }, [activeTab, searchQuery])

  // Pagination helper function
  const getPaginatedData = (data: ProposalReviewed[]) => {
    const totalItems = data.length
    const totalPages = Math.ceil(totalItems / itemsPerPage)
    const indexOfLastItem = currentPage * itemsPerPage
    const indexOfFirstItem = indexOfLastItem - itemsPerPage
    const currentItems = data.slice(indexOfFirstItem, indexOfLastItem)

    return {
      items: currentItems,
      totalItems,
      totalPages,
      indexOfFirstItem,
      indexOfLastItem
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount)
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '-'
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    })
  }

  const ProposalCard = ({ proposal }: { proposal: ProposalReviewed }) => {
    const isDecided = proposal.status === 'DITERIMA' || proposal.status === 'DITOLAK'
    const statusBadge = isDecided 
      ? proposal.status === 'DITERIMA' 
        ? { variant: getStatusBadgeVariant('DITERIMA'), label: 'Diterima', color: 'text-green-600' }
        : { variant: getStatusBadgeVariant('DITOLAK'), label: 'Ditolak', color: 'text-red-600' }
      : proposal.reviewStatus.allComplete
        ? { variant: getStatusBadgeVariant('LENGKAP'), label: proposal.reviewStatus.label, color: '' }
        : { variant: getStatusBadgeVariant('PENDING'), label: proposal.reviewStatus.label, color: '' }

    return (
    <Card className="border-0 shadow-sm hover:shadow-md transition-shadow">
      <CardContent className="p-4 md:p-6">
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="flex-1 min-w-0">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-2">
              <h3 className="font-semibold text-base md:text-lg text-foreground line-clamp-2 break-words">
                {proposal.judul}
              </h3>
              <div className="shrink-0 flex gap-2">
                {isDecided ? (
                  <Badge variant={statusBadge.variant} className="gap-1">
                    {proposal.status === 'DITERIMA' ? (
                      <CheckCircle2 className="h-3 w-3" />
                    ) : (
                      <AlertCircle className="h-3 w-3" />
                    )}
                    {statusBadge.label}
                  </Badge>
                ) : (
                  <Badge
                    variant={statusBadge.variant}
                    className="gap-1"
                  >
                    {proposal.reviewStatus.allComplete ? (
                      <CheckCircle2 className="h-3 w-3" />
                    ) : (
                      <Clock className="h-3 w-3" />
                    )}
                    {statusBadge.label}
                  </Badge>
                )}
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs md:text-sm text-muted-foreground mb-3">
              <span className="font-medium text-primary shrink-0">{proposal.periode.nama}</span>
              <span className="hidden sm:inline">•</span>
              <span className="truncate">{proposal.skema.nama}</span>
              <span className="hidden sm:inline">•</span>
              <span className="truncate capitalize">{proposal.skema.tipe.replace('_', ' ').toLowerCase()}</span>
            </div>
          </div>
        </div>

        <div className="grid gap-3 sm:gap-4 grid-cols-2 md:grid-cols-4 mb-4">
          <div className="space-y-1 min-w-0">
            <p className="text-xs text-muted-foreground">Pengusul</p>
            <p className="text-sm font-medium truncate">{proposal.dosen.nama}</p>
            <p className="text-xs text-muted-foreground truncate">{proposal.dosen.nidn}</p>
          </div>
          <div className="space-y-1 min-w-0">
            <p className="text-xs text-muted-foreground">Bidang Keahlian</p>
            <p className="text-sm font-medium truncate">
              {proposal.bidangkeahlian?.nama || '-'}
            </p>
          </div>
          <div className="space-y-1 min-w-0">
            <p className="text-xs text-muted-foreground">Dana Diajukan</p>
            <p className="text-sm font-medium truncate">
              {formatCurrency(proposal.danaDisetujui || 0)}
            </p>
          </div>
          <div className="space-y-1 min-w-0">
            <p className="text-xs text-muted-foreground">Progress Review</p>
            <div className="flex items-center space-x-2">
              <Progress 
                value={(proposal.reviewStatus.completed / proposal.reviewStatus.total) * 100} 
                className="flex-1 h-2 min-w-0"
              />
              <span className="text-sm font-medium shrink-0">
                {proposal.reviewStatus.completed}/{proposal.reviewStatus.total}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between gap-2 pt-3 border-t">
          <div className="text-xs text-muted-foreground">
            <span>Diajukan: </span>
            <span className="font-medium">{formatDate(proposal.submittedAt)}</span>
          </div>
          <Button
            size="sm"
            variant={isDecided ? 'outline' : proposal.reviewStatus.allComplete ? 'default' : 'outline'}
            onClick={() => router.push(`/admin/reviews/${proposal.id}`)}
            className="shrink-0"
          >
            <Eye className="h-4 w-4 sm:mr-2" />
            <span className="hidden sm:inline">
              {isDecided ? 'Lihat Detail' : proposal.reviewStatus.allComplete ? 'Buat Keputusan' : 'Lihat Detail'}
            </span>
            <span className="sm:hidden">Detail</span>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

  const ProposalList = ({ proposals, tabKey }: { proposals: ProposalReviewed[], tabKey: string }) => {
    const paginatedData = getPaginatedData(proposals)
    
    if (proposals.length === 0) {
      return (
        <Card className="border-0 shadow-sm">
          <CardContent className="p-12 text-center">
            <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Tidak ada proposal</h3>
            <p className="text-muted-foreground">
              Belum ada proposal dalam kategori ini
            </p>
          </CardContent>
        </Card>
      )
    }

    return (
      <div className="space-y-4">
        <div className="space-y-4">
          {paginatedData.items.map((proposal) => (
            <ProposalCard key={proposal.id} proposal={proposal} />
          ))}
        </div>

        {/* Pagination Controls */}
        {paginatedData.totalPages > 1 && (
          <div className="flex items-center justify-between pt-4 border-t">
            <div className="text-sm text-muted-foreground">
              Menampilkan {paginatedData.indexOfFirstItem + 1}-{Math.min(paginatedData.indexOfLastItem, paginatedData.totalItems)} dari {paginatedData.totalItems} proposal
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(currentPage - 1)}
                disabled={currentPage === 1}
              >
                Previous
              </Button>
              
              {/* Page Numbers */}
              <div className="flex gap-1">
                {Array.from({ length: paginatedData.totalPages }, (_, i) => i + 1).map((page) => {
                  if (
                    page === 1 ||
                    page === paginatedData.totalPages ||
                    (page >= currentPage - 1 && page <= currentPage + 1)
                  ) {
                    return (
                      <Button
                        key={page}
                        variant={currentPage === page ? "default" : "outline"}
                        size="sm"
                        onClick={() => setCurrentPage(page)}
                        className="w-9"
                      >
                        {page}
                      </Button>
                    )
                  } else if (page === currentPage - 2 || page === currentPage + 2) {
                    return <span key={page} className="px-1">...</span>
                  }
                  return null
                })}
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(currentPage + 1)}
                disabled={currentPage === paginatedData.totalPages}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>
    )
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          {/* Header skeleton */}
          <div className="space-y-2">
            <Skeleton className="h-9 w-64" />
            <Skeleton className="h-5 w-96" />
          </div>

          {/* Stats cards skeleton */}
          <div className="grid gap-4 md:grid-cols-4">
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-32 w-full" />
          </div>

          {/* Search and tabs skeleton */}
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-10 w-full" />

          {/* Content skeleton */}
          <div className="space-y-4">
            <Skeleton className="h-48 w-full" />
            <Skeleton className="h-48 w-full" />
            <Skeleton className="h-48 w-full" />
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Review Management</h1>
          <p className="text-muted-foreground">
            Kelola hasil review dan buat keputusan untuk proposal
          </p>
        </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Review Lengkap</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completeProposals.length}</div>
            <p className="text-xs text-muted-foreground">
              Siap untuk keputusan
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Menunggu Review</CardTitle>
            <Clock className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{incompleteProposals.length}</div>
            <p className="text-xs text-muted-foreground">
              Review belum lengkap
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sudah Diputuskan</CardTitle>
            <FileText className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{decidedProposals.length}</div>
            <p className="text-xs text-muted-foreground">
              Diterima atau ditolak
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{proposals.length}</div>
            <p className="text-xs text-muted-foreground">
              Semua proposal
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <SearchInput
              placeholder="Cari judul, pengusul, atau skema..."
              value={searchQuery}
              onChange={setSearchQuery}
              containerClassName="flex-1"
            />
          </div>
        </CardHeader>
      </Card>

      {/* Tabs - Responsive */}
      <ResponsiveTabs
        defaultValue="complete"
        onValueChange={(value) => setActiveTab(value)}
        tabs={[
          {
            value: 'complete',
            label: 'Review Lengkap',
            icon: <CheckCircle2 className="h-4 w-4" />,
            count: completeProposals.length,
          },
          {
            value: 'incomplete',
            label: 'Menunggu',
            icon: <Clock className="h-4 w-4" />,
            count: incompleteProposals.length,
          },
          {
            value: 'decided',
            label: 'Sudah Diputuskan',
            icon: <FileText className="h-4 w-4" />,
            count: decidedProposals.length,
          },
          {
            value: 'all',
            label: 'Semua',
            icon: <AlertCircle className="h-4 w-4" />,
            count: filteredProposals.length,
          },
        ]}
      >
        <TabsContent value="complete" className="space-y-4">
          <ProposalList proposals={completeProposals} tabKey="complete" />
        </TabsContent>

        <TabsContent value="incomplete" className="space-y-4">
          <ProposalList proposals={incompleteProposals} tabKey="incomplete" />
        </TabsContent>

        <TabsContent value="decided" className="space-y-4">
          <ProposalList proposals={decidedProposals} tabKey="decided" />
        </TabsContent>

        <TabsContent value="all" className="space-y-4">
          <ProposalList proposals={filteredProposals} tabKey="all" />
        </TabsContent>
      </ResponsiveTabs>
    </div>
    </DashboardLayout>
  )
}
