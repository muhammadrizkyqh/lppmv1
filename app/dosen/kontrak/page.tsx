"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import DashboardLayout from "@/components/layout/dashboard-layout"
import {
  FileText,
  Download,
  CheckCircle,
  Clock,
  FileSignature,
  AlertCircle,
  Calendar,
  DollarSign,
  Info,
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface KontrakDosen {
  id: string
  nomorKontrak: string
  nomorSK: string
  tanggalKontrak: string
  status: string
  fileKontrak: string | null
  fileSK: string | null
  uploadedAt: string | null
  proposal: {
    id: string
    judul: string
    status: string
    skema: {
      nama: string
      dana: number
    }
    periode: {
      nama: string
      tahunMulai: number
      tahunSelesai: number
    }
  }
}

export default function DosenKontrakPage() {
  const router = useRouter()
  const [kontrakList, setKontrakList] = useState<KontrakDosen[]>([])
  const [loading, setLoading] = useState(true)

  const fetchMyKontrak = async () => {
    setLoading(true)
    try {
      // Ambil proposal yang sudah punya kontrak (DITERIMA, BERJALAN, SELESAI)
      const response = await fetch("/api/proposal?status=DITERIMA,BERJALAN,SELESAI", {
        credentials: "include",
      })

      if (!response.ok) throw new Error("Failed to fetch")

      const result = await response.json()
      if (result.success) {
        // Filter proposal yang ada kontraknya
        const proposalsWithKontrak = result.data.filter((p: any) => p.kontrak)

        // Map ke format KontrakDosen
        const kontrakData = proposalsWithKontrak.map((p: any) => ({
          id: p.kontrak.id,
          nomorKontrak: p.kontrak.nomorKontrak,
          nomorSK: p.kontrak.nomorSK,
          tanggalKontrak: p.kontrak.tanggalKontrak,
          status: p.kontrak.status,
          fileKontrak: p.kontrak.fileKontrak,
          fileSK: p.kontrak.fileSK,
          uploadedAt: p.kontrak.uploadedAt,
          proposal: {
            id: p.id,
            judul: p.judul,
            status: p.status,
            skema: p.skema,
            periode: p.periode,
          },
        }))

        setKontrakList(kontrakData)
      }
    } catch (error) {
      console.error("Error fetching kontrak:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchMyKontrak()
  }, [])

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { label: string; variant: any; icon: any }> = {
      DRAFT: { label: "Menunggu TTD", variant: "secondary", icon: Clock },
      SIGNED: { label: "Ditandatangani", variant: "default", icon: FileSignature },
      AKTIF: { label: "Aktif", variant: "default", icon: CheckCircle },
      SELESAI: { label: "Selesai", variant: "outline", icon: CheckCircle },
    }

    const config = statusConfig[status] || statusConfig.DRAFT
    const Icon = config.icon

    return (
      <Badge variant={config.variant} className="gap-1">
        <Icon className="h-3 w-3" />
        {config.label}
      </Badge>
    )
  }

  const getProposalStatusBadge = (status: string) => {
    const statusConfig: Record<string, { label: string; variant: any }> = {
      DITERIMA: { label: "Diterima", variant: "default" },
      BERJALAN: { label: "Berjalan", variant: "default" },
      SELESAI: { label: "Selesai", variant: "outline" },
    }

    const config = statusConfig[status] || { label: status, variant: "secondary" }

    return <Badge variant={config.variant}>{config.label}</Badge>
  }

  const formatRupiah = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    })
  }

  const hasDownloadableFiles = kontrakList.some((k) => k.fileKontrak && k.fileSK)

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
        <h1 className="text-3xl font-bold">Kontrak Penelitian Saya</h1>
        <p className="text-muted-foreground mt-1">
          Lihat dan download kontrak penelitian yang sudah disetujui
        </p>
      </div>

      {/* Info Alert */}
      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          Kontrak akan muncul setelah proposal Anda disetujui oleh admin. Anda dapat mendownload
          file kontrak dan SK setelah admin mengunggah file yang sudah ditandatangani.
        </AlertDescription>
      </Alert>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Kontrak</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{kontrakList.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Penelitian Aktif</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {kontrakList.filter((k) => k.proposal.status === "BERJALAN").length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sudah TTD</CardTitle>
            <FileSignature className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {kontrakList.filter((k) => k.fileKontrak && k.fileSK).length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Kontrak List */}
      <Card>
        <CardHeader>
          <CardTitle>Daftar Kontrak</CardTitle>
          <CardDescription>
            {kontrakList.length > 0
              ? `Anda memiliki ${kontrakList.length} kontrak penelitian`
              : "Belum ada kontrak"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Clock className="h-6 w-6 animate-spin text-muted-foreground" />
              <span className="ml-2 text-muted-foreground">Memuat data...</span>
            </div>
          ) : kontrakList.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground mb-2">Belum ada kontrak penelitian</p>
              <p className="text-sm text-muted-foreground">
                Kontrak akan muncul setelah proposal Anda disetujui oleh admin
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {kontrakList.map((kontrak) => (
                <Card key={kontrak.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <CardTitle className="text-lg">{kontrak.proposal.judul}</CardTitle>
                        <CardDescription>
                          {kontrak.proposal.skema.nama} - {kontrak.proposal.periode.nama}
                        </CardDescription>
                      </div>
                      <div className="flex flex-col gap-2 items-end">
                        {getStatusBadge(kontrak.status)}
                        {getProposalStatusBadge(kontrak.proposal.status)}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-3">
                        <div>
                          <Label className="text-muted-foreground text-xs">Nomor Kontrak</Label>
                          <p className="font-medium">{kontrak.nomorKontrak}</p>
                        </div>
                        <div>
                          <Label className="text-muted-foreground text-xs">Nomor SK</Label>
                          <p className="font-medium">{kontrak.nomorSK}</p>
                        </div>
                        <div>
                          <Label className="text-muted-foreground text-xs">Tanggal Kontrak</Label>
                          <p className="font-medium">{formatDate(kontrak.tanggalKontrak)}</p>
                        </div>
                      </div>
                      <div className="space-y-3">
                        <div>
                          <Label className="text-muted-foreground text-xs">Dana Penelitian</Label>
                          <p className="font-medium text-lg">
                            {formatRupiah(kontrak.proposal.skema.dana)}
                          </p>
                        </div>
                        <div>
                          <Label className="text-muted-foreground text-xs">Periode</Label>
                          <p className="font-medium">
                            {kontrak.proposal.periode.tahunMulai} -{" "}
                            {kontrak.proposal.periode.tahunSelesai}
                          </p>
                        </div>
                        {kontrak.uploadedAt && (
                          <div>
                            <Label className="text-muted-foreground text-xs">
                              Tanggal Ditandatangani
                            </Label>
                            <p className="font-medium">{formatDate(kontrak.uploadedAt)}</p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Status Info */}
                    <div className="mt-4">
                      {kontrak.status === "DRAFT" ? (
                        <Alert>
                          <Clock className="h-4 w-4" />
                          <AlertDescription>
                            Kontrak sedang menunggu tanda tangan dari admin. Anda akan dapat
                            mendownload file setelah proses selesai.
                          </AlertDescription>
                        </Alert>
                      ) : kontrak.fileKontrak && kontrak.fileSK ? (
                        <div>
                          <Alert className="border-green-500 bg-green-50 mb-4">
                            <CheckCircle className="h-4 w-4 text-green-600" />
                            <AlertDescription className="text-green-800">
                              {kontrak.proposal.status === "BERJALAN"
                                ? "Kontrak sudah ditandatangani. Penelitian Anda sudah berjalan! Anda dapat mengunggah laporan monitoring."
                                : "Kontrak sudah ditandatangani dan tersedia untuk didownload."}
                            </AlertDescription>
                          </Alert>
                          <div className="flex gap-3">
                            <Button variant="outline" asChild>
                              <a
                                href={kontrak.fileKontrak}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                <Download className="h-4 w-4 mr-2" />
                                Download Kontrak
                              </a>
                            </Button>
                            <Button variant="outline" asChild>
                              <a href={kontrak.fileSK} target="_blank" rel="noopener noreferrer">
                                <Download className="h-4 w-4 mr-2" />
                                Download SK
                              </a>
                            </Button>
                            {kontrak.proposal.status === "BERJALAN" && (
                              <Button
                                onClick={() =>
                                  router.push(`/dosen/monitoring/${kontrak.proposal.id}`)
                                }
                              >
                                <FileText className="h-4 w-4 mr-2" />
                                Kelola Monitoring
                              </Button>
                            )}
                          </div>
                        </div>
                      ) : null}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
      </div>
    </DashboardLayout>
  )
}
