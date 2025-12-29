'use client'

import { use, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { adminReviewApi } from '@/lib/api-client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Separator } from '@/components/ui/separator'
import DashboardLayout from '@/components/layout/dashboard-layout'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { ArrowLeft, CheckCircle2, XCircle, AlertTriangle, User, FileText, Calendar, DollarSign, Download, Eye, EyeOff } from 'lucide-react'
import { toast } from 'sonner'

export default function ReviewDetailPage({ params }: { params: Promise<{ proposalId: string }> }) {
  const { proposalId } = use(params)
  const router = useRouter()
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)
  const [showApproveDialog, setShowApproveDialog] = useState(false)
  const [showRevisionDialog, setShowRevisionDialog] = useState(false)
  const [showRejectDialog, setShowRejectDialog] = useState(false)
  const [catatan, setCatatan] = useState('')
  const [danaDisetujui, setDanaDisetujui] = useState('')
  const [showPdf, setShowPdf] = useState(true)

  useEffect(() => {
    loadData()
  }, [proposalId])

  const loadData = async () => {
    try {
      setLoading(true)
      const result = await adminReviewApi.getReviewComparison(proposalId)
      if (result.success && result.data) {
        setData(result.data)
      } else {
        throw new Error('Data tidak valid')
      }
    } catch (error: any) {
      console.error('Failed to load review data:', error)
      toast.error('Gagal memuat data review')
      setData(null)
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async () => {
    if (!danaDisetujui || parseFloat(danaDisetujui) <= 0) {
      toast.error('Dana yang disetujui wajib diisi dan harus lebih dari 0')
      return
    }

    try {
      setActionLoading(true)
      await adminReviewApi.approve(proposalId, catatan || undefined, parseFloat(danaDisetujui))
      toast.success('Proposal berhasil diterima')
      router.push('/admin/reviews')
    } catch (error: any) {
      toast.error(error.message || 'Gagal menerima proposal')
    } finally {
      setActionLoading(false)
      setShowApproveDialog(false)
    }
  }

  const handleRequestRevision = async () => {
    if (!catatan.trim()) {
      toast.error('Catatan revisi harus diisi')
      return
    }

    try {
      setActionLoading(true)
      await adminReviewApi.requestRevision(proposalId, catatan)
      toast.success('Permintaan revisi berhasil dikirim')
      router.push('/admin/reviews')
    } catch (error: any) {
      toast.error(error.message || 'Gagal meminta revisi')
    } finally {
      setActionLoading(false)
      setShowRevisionDialog(false)
    }
  }

  const handleReject = async () => {
    if (!catatan.trim()) {
      toast.error('Alasan penolakan harus diisi')
      return
    }

    try {
      setActionLoading(true)
      await adminReviewApi.reject(proposalId, catatan)
      toast.success('Proposal berhasil ditolak')
      router.push('/admin/reviews')
    } catch (error: any) {
      toast.error(error.message || 'Gagal menolak proposal')
    } finally {
      setActionLoading(false)
      setShowRejectDialog(false)
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

  const getRecommendationBadge = (rekomendasi: string) => {
    switch (rekomendasi) {
      case 'DITERIMA':
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-200">Diterima</Badge>
      case 'REVISI':
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-200">Revisi</Badge>
      case 'DITOLAK':
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-200">Ditolak</Badge>
      default:
        return null
    }
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

  if (!data || !data.proposal) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <p className="text-muted-foreground">Data tidak ditemukan</p>
            <Button onClick={() => router.back()} className="mt-4">
              Kembali
            </Button>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  const { proposal, reviewStatus, averageScores } = data
  const reviews = proposal.proposal_reviewer?.filter((r: any) => r.review) || []

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()} className="shrink-0 self-start">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Detail Review</h1>
            <p className="text-sm md:text-base text-muted-foreground">
              Perbandingan hasil review dan keputusan
            </p>
          </div>
          {proposal.filePath && (
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowPdf(!showPdf)}
              >
                {showPdf ? (
                  <>
                    <EyeOff className="h-4 w-4 mr-2" />
                    Sembunyikan PDF
                  </>
                ) : (
                  <>
                    <Eye className="h-4 w-4 mr-2" />
                    Tampilkan PDF
                  </>
                )}
              </Button>
              <Button variant="outline" size="sm" asChild>
                <a href={proposal.filePath} target="_blank" rel="noopener noreferrer">
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </a>
              </Button>
            </div>
          )}
        </div>

        {/* Split Layout: PDF Viewer + Content */}
        <div className={`grid gap-6 ${showPdf && proposal.filePath ? 'lg:grid-cols-2' : ''}`}>
          {/* PDF Viewer - 50% */}
          {showPdf && proposal.filePath && (
            <div className="order-1 lg:order-1">
              <div className="sticky top-6">
                <Card className="border-0 shadow-lg overflow-hidden">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg">Dokumen Proposal</CardTitle>
                  </CardHeader>
                  <CardContent className="p-0">
                    <div className="w-full bg-gray-100" style={{ height: 'calc(100vh - 200px)' }}>
                      <iframe
                        src={proposal.filePath}
                        className="w-full h-full border-0"
                        title="PDF Proposal"
                      />
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {/* Main Content - 50% or full width if PDF hidden */}
          <div className={`order-2 lg:order-2 space-y-6 ${showPdf && proposal.filePath ? '' : ''}`}>

        {/* Review Status Alert */}
        {!reviewStatus.allComplete && (
          <Card className="border-orange-200 bg-orange-50 border-0 shadow-sm">
            <CardContent className="p-4 md:p-6">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-orange-600 shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-orange-900">Review Belum Lengkap</p>
                  <p className="text-sm text-orange-700">
                    {reviewStatus.completed} dari {reviewStatus.total} reviewer telah menyelesaikan review
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Proposal Info */}
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle>Informasi Proposal</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs text-muted-foreground">Judul</label>
                <p className="font-medium text-sm md:text-base break-words">{proposal.judul}</p>
              </div>
              <div className="space-y-1">
                <label className="text-xs text-muted-foreground">Bidang Keahlian</label>
                <p className="font-medium text-sm md:text-base">{proposal.bidangKeahlian?.nama || '-'}</p>
              </div>
              <div className="space-y-1">
                <label className="text-xs text-muted-foreground">Ketua Peneliti</label>
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-sm md:text-base truncate">{proposal.dosen.nama}</p>
                    <p className="text-xs text-muted-foreground">{proposal.dosen.nidn}</p>
                  </div>
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-xs text-muted-foreground">Skema</label>
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-muted-foreground shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-sm md:text-base truncate">{proposal.skema.nama}</p>
                    <p className="text-xs text-muted-foreground capitalize truncate">
                      {proposal.skema.tipe.replace('_', ' ').toLowerCase()}
                    </p>
                  </div>
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-xs text-muted-foreground">Dana Diajukan</label>
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-muted-foreground shrink-0" />
                  <p className="font-medium text-sm md:text-base">{formatCurrency(proposal.danaDisetujui || 0)}</p>
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-xs text-muted-foreground">Periode</label>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground shrink-0" />
                  <p className="font-medium text-sm md:text-base">{proposal.periode.nama} - {proposal.periode.tahun}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Review Comparison */}
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle>Perbandingan Review</CardTitle>
            <CardDescription>
              Hasil penilaian dari {reviewStatus.completed} reviewer
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto -mx-4 md:mx-0">
              <div className="inline-block min-w-full align-middle">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="min-w-[160px]">Reviewer</TableHead>
                      <TableHead className="text-center min-w-[120px]">Skor Akhir</TableHead>
                      <TableHead className="text-center min-w-[120px]">Rekomendasi</TableHead>
                      <TableHead className="text-center min-w-[120px]">File Penilaian</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {reviews.map((reviewerData: any, index: number) => (
                      <TableRow key={reviewerData.id}>
                        <TableCell className="font-medium">
                          <div>
                            <div className="font-medium">Reviewer {index + 1}</div>
                            <div className="text-xs text-muted-foreground">{reviewerData.reviewer.nama}</div>
                            <div className="text-xs text-muted-foreground">{reviewerData.reviewer.institusi}</div>
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge className="font-bold text-lg px-4 py-2">
                            {reviewerData.review.nilaiTotal}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-center">
                          {getRecommendationBadge(reviewerData.review.rekomendasi)}
                        </TableCell>
                        <TableCell className="text-center">
                          {reviewerData.review.filePenilaian ? (
                            <Button variant="outline" size="sm" asChild>
                              <a href={reviewerData.review.filePenilaian} target="_blank" rel="noopener noreferrer">
                                <Download className="w-4 h-4 mr-2" />
                                Download
                              </a>
                            </Button>
                          ) : (
                            <span className="text-xs text-muted-foreground">-</span>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                    {averageScores && (
                      <TableRow className="bg-muted/50 font-bold">
                        <TableCell>Rata-rata Skor</TableCell>
                        <TableCell className="text-center">
                          <Badge className="font-bold text-lg px-4 py-2 bg-primary">
                            {averageScores.total.toFixed(1)}
                          </Badge>
                        </TableCell>
                        <TableCell colSpan={2}></TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>

          {/* Reviewer Notes */}
          <div className="mt-6 space-y-4">
            <h3 className="font-semibold">Catatan Reviewer</h3>
            {reviews.map((reviewerData: any, index: number) => (
              <Card key={reviewerData.id}>
                <CardHeader>
                  <CardTitle className="text-base">
                    Reviewer {index + 1}: {reviewerData.reviewer.nama}
                  </CardTitle>
                  <CardDescription>
                    {reviewerData.reviewer.institusi} - {reviewerData.reviewer.tipe}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm whitespace-pre-wrap">
                    {reviewerData.review.catatan || <span className="text-muted-foreground italic">Tidak ada catatan</span>}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Decision Actions */}
      {reviewStatus.allComplete && (
        <Card className="border-0 shadow-sm">
          <CardHeader className="p-4 md:p-6">
            <CardTitle className="text-lg md:text-xl">Buat Keputusan</CardTitle>
            <CardDescription className="text-sm">
              Pilih keputusan berdasarkan hasil review di atas
            </CardDescription>
          </CardHeader>
          <CardContent className="p-4 md:p-6 pt-0 md:pt-0">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4">
              <Button
                className="h-auto py-4 md:py-6 flex-col gap-1 md:gap-2"
                variant="default"
                onClick={() => setShowApproveDialog(true)}
                disabled={actionLoading}
              >
                <CheckCircle2 className="h-5 w-5 md:h-6 md:w-6 shrink-0" />
                <div className="text-center min-w-0">
                  <div className="font-bold text-sm md:text-base">Terima</div>
                  <div className="text-xs font-normal opacity-90 line-clamp-2">Proposal diterima untuk didanai</div>
                </div>
              </Button>

              <Button
                className="h-auto py-4 md:py-6 flex-col gap-1 md:gap-2 bg-yellow-600 hover:bg-yellow-700"
                onClick={() => setShowRevisionDialog(true)}
                disabled={actionLoading}
              >
                <AlertTriangle className="h-5 w-5 md:h-6 md:w-6 shrink-0" />
                <div className="text-center min-w-0">
                  <div className="font-bold text-sm md:text-base">Minta Revisi</div>
                  <div className="text-xs font-normal opacity-90 line-clamp-2">Proposal perlu perbaikan</div>
                </div>
              </Button>

              <Button
                className="h-auto py-4 md:py-6 flex-col gap-1 md:gap-2 bg-red-600 hover:bg-red-700"
                onClick={() => setShowRejectDialog(true)}
                disabled={actionLoading}
              >
                <XCircle className="h-5 w-5 md:h-6 md:w-6 shrink-0" />
                <div className="text-center min-w-0">
                  <div className="font-bold text-sm md:text-base">Tolak</div>
                  <div className="text-xs font-normal opacity-90 line-clamp-2">Proposal tidak diterima</div>
                </div>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
      </div>
      </div>

      {/* Approve Dialog */}
      <AlertDialog open={showApproveDialog} onOpenChange={setShowApproveDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Terima Proposal?</AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-4">
                <p>Proposal akan diterima dan berstatus DITERIMA. Dosen akan menerima notifikasi.</p>
                <div className="space-y-2">
                  <Label htmlFor="danaDisetujui" className="text-sm font-medium text-foreground">
                    Dana yang Disetujui <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="danaDisetujui"
                    type="number"
                    placeholder="Contoh: 5000000"
                    value={danaDisetujui}
                    onChange={(e) => setDanaDisetujui(e.target.value)}
                    min="0"
                    step="100000"
                    className="text-base"
                  />
                  <p className="text-xs text-muted-foreground">
                    Masukkan nominal dana dalam Rupiah yang akan disetujui untuk penelitian ini
                  </p>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-foreground">Catatan (Opsional)</Label>
                  <Textarea
                    placeholder="Tambahkan catatan untuk dosen..."
                    value={catatan}
                    onChange={(e) => setCatatan(e.target.value)}
                    rows={3}
                  />
                </div>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={actionLoading}>Batal</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleApprove} 
              disabled={actionLoading || !danaDisetujui || parseFloat(danaDisetujui) <= 0}
            >
              {actionLoading ? 'Memproses...' : 'Terima Proposal'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Revision Dialog */}
      <AlertDialog open={showRevisionDialog} onOpenChange={setShowRevisionDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Minta Revisi?</AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-3">
                <p>Proposal akan dikembalikan ke dosen untuk diperbaiki. Maksimal 2x revisi.</p>
                <p className="text-sm text-orange-600">
                  Revisi saat ini: {proposal.revisiCount}/2
                </p>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">
                    Catatan Revisi <span className="text-red-500">*</span>
                  </label>
                  <Textarea
                    placeholder="Jelaskan aspek yang perlu diperbaiki..."
                    value={catatan}
                    onChange={(e) => setCatatan(e.target.value)}
                    rows={4}
                    className="resize-none"
                  />
                </div>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={actionLoading}>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleRequestRevision}
              disabled={actionLoading || !catatan.trim()}
              className="bg-yellow-600 hover:bg-yellow-700"
            >
              {actionLoading ? 'Memproses...' : 'Kirim Permintaan Revisi'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Reject Dialog */}
      <AlertDialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Tolak Proposal?</AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-3">
                <p className="text-red-600 font-medium">Proposal akan ditolak dan tidak dapat didanai.</p>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">
                    Alasan Penolakan <span className="text-red-500">*</span>
                  </label>
                  <Textarea
                    placeholder="Jelaskan alasan penolakan..."
                    value={catatan}
                    onChange={(e) => setCatatan(e.target.value)}
                    rows={4}
                    className="resize-none"
                  />
                </div>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={actionLoading}>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleReject}
              disabled={actionLoading || !catatan.trim()}
              className="bg-red-600 hover:bg-red-700"
            >
              {actionLoading ? 'Memproses...' : 'Tolak Proposal'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      </div>
    </DashboardLayout>
  )
}
