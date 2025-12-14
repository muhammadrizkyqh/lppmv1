'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { adminReviewApi } from '@/lib/api-client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Progress } from '@/components/ui/progress'
import { TabsContent } from '@/components/ui/tabs'
import { Search, Eye, CheckCircle2, Clock, AlertCircle, FileText } from 'lucide-react'
import DashboardLayout from '@/components/layout/dashboard-layout'
import { ResponsiveTabs } from '@/components/ui/responsive-tabs'

interface ProposalReviewed {
  id: string
  judul: string
  jenis: string
  status: string
  submittedAt: string | null
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
  bidangKeahlian: {
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

  const completeProposals = filteredProposals.filter(p => p.reviewStatus.allComplete)
  const incompleteProposals = filteredProposals.filter(p => !p.reviewStatus.allComplete)

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

  const ProposalCard = ({ proposal }: { proposal: ProposalReviewed }) => (
    <Card className="border-0 shadow-sm hover:shadow-md transition-shadow">
      <CardContent className="p-4 md:p-6">
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="flex-1 min-w-0">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-2">
              <h3 className="font-semibold text-base md:text-lg text-foreground line-clamp-2 break-words">
                {proposal.judul}
              </h3>
              <div className="shrink-0">
                <Badge
                  variant={proposal.reviewStatus.allComplete ? 'default' : 'secondary'}
                  className="gap-1"
                >
                  {proposal.reviewStatus.allComplete ? (
                    <CheckCircle2 className="h-3 w-3" />
                  ) : (
                    <Clock className="h-3 w-3" />
                  )}
                  {proposal.reviewStatus.label}
                </Badge>
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
            <p className="text-xs text-muted-foreground truncate">{proposal.ketua.nidn}</p>
          </div>
          <div className="space-y-1 min-w-0">
            <p className="text-xs text-muted-foreground">Bidang Keahlian</p>
            <p className="text-sm font-medium truncate">
              {proposal.bidangKeahlian?.nama || '-'}
            </p>
          </div>
          <div className="space-y-1 min-w-0">
            <p className="text-xs text-muted-foreground">Dana Hibah</p>
            <p className="text-sm font-medium truncate">
              {formatCurrency(proposal.skema.dana)}
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
            variant={proposal.reviewStatus.allComplete ? 'default' : 'outline'}
            onClick={() => router.push(`/admin/reviews/${proposal.id}`)}
            className="shrink-0"
          >
            <Eye className="h-4 w-4 sm:mr-2" />
            <span className="hidden sm:inline">
              {proposal.reviewStatus.allComplete ? 'Buat Keputusan' : 'Lihat Detail'}
            </span>
            <span className="sm:hidden">
              {proposal.reviewStatus.allComplete ? 'Keputusan' : 'Detail'}
            </span>
          </Button>
        </div>
      </CardContent>
    </Card>
  )

  const ProposalList = ({ proposals }: { proposals: ProposalReviewed[] }) => {
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
        {proposals.map((proposal) => (
          <ProposalCard key={proposal.id} proposal={proposal} />
        ))}
      </div>
    )
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Memuat data...</p>
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
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Direview</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{proposals.length}</div>
            <p className="text-xs text-muted-foreground">
              Proposal dalam proses review
            </p>
          </CardContent>
        </Card>
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
      </div>

      {/* Search */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Cari judul, pengusul, atau skema..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Tabs - Responsive */}
      <ResponsiveTabs
        defaultValue="complete"
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
            value: 'all',
            label: 'Semua',
            icon: <AlertCircle className="h-4 w-4" />,
            count: filteredProposals.length,
          },
        ]}
      >
        <TabsContent value="complete" className="space-y-4">
          <ProposalList proposals={completeProposals} />
        </TabsContent>

        <TabsContent value="incomplete" className="space-y-4">
          <ProposalList proposals={incompleteProposals} />
        </TabsContent>

        <TabsContent value="all" className="space-y-4">
          <ProposalList proposals={filteredProposals} />
        </TabsContent>
      </ResponsiveTabs>
    </div>
    </DashboardLayout>
  )
}
