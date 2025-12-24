"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import Link from "next/link"
import DashboardLayout from "@/components/layout/dashboard-layout"
import {
  ArrowLeft,
  FileText,
  Upload,
  Download,
  CheckCircle,
  Clock,
  FileSignature,
  Users,
  Calendar,
  DollarSign,
  AlertCircle,
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { toast } from "sonner"

interface TeamMember {
  id: string
  role: string
  dosen?: {
    nama: string
    nidn: string
    email: string
  }
  mahasiswa?: {
    nama: string
    nim: string
    email: string
  }
}

interface KontrakDetail {
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
    abstrak: string
    status: string
    danaDiajukan: number | null
    dosen: {
      nama: string
      nidn: string
      email: string
    }
    skema: {
      nama: string
      dana: number
    }
    periode: {
      nama: string
      tahun: string
      tanggalBuka: string
      tanggalTutup: string
    }
    proposalmember: TeamMember[]
  }
  user_kontrak_createdByTouser: {
    username: string
  }
  user_kontrak_uploadedByTouser: {
    username: string
  } | null
}

export default function AdminKontrakDetailPage() {
  const router = useRouter()
  const params = useParams()
  const kontrakId = params.id as string

  const [kontrak, setKontrak] = useState<KontrakDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)

  const [fileKontrak, setFileKontrak] = useState<File | null>(null)
  const [fileSK, setFileSK] = useState<File | null>(null)

  const fetchKontrakDetail = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/kontrak/${kontrakId}`, {
        credentials: "include",
      })

      if (!response.ok) throw new Error("Failed to fetch")

      const result = await response.json()
      if (result.success) {
        setKontrak(result.data)
      } else {
        toast.error(result.error || "Gagal memuat detail kontrak")
      }
    } catch (error) {
      toast.error("Terjadi kesalahan saat memuat data")
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchKontrakDetail()
  }, [kontrakId])

  const handleUploadTTD = async () => {
    if (!fileKontrak || !fileSK) {
      toast.error("Harap upload kedua file (Kontrak dan SK)")
      return
    }

    if (fileKontrak.type !== "application/pdf" || fileSK.type !== "application/pdf") {
      toast.error("File harus berformat PDF")
      return
    }

    setUploading(true)
    try {
      const formData = new FormData()
      formData.append("fileKontrak", fileKontrak)
      formData.append("fileSK", fileSK)

      const response = await fetch(`/api/kontrak/${kontrakId}/upload-ttd`, {
        method: "PATCH",
        credentials: "include",
        body: formData,
      })

      const result = await response.json()

      if (result.success) {
        toast.success("File kontrak dan SK berhasil diupload! Proposal sekarang berstatus BERJALAN.")
        fetchKontrakDetail()
        setFileKontrak(null)
        setFileSK(null)
      } else {
        toast.error(result.error || "Gagal mengupload file")
      }
    } catch (error) {
      toast.error("Terjadi kesalahan saat mengupload")
      console.error(error)
    } finally {
      setUploading(false)
    }
  }

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { label: string; variant: any; icon: any }> = {
      DRAFT: { label: "Draft", variant: "secondary", icon: Clock },
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
    const statusConfig: Record<string, { label: string; className: string }> = {
      DRAFT: { label: "Draft", className: "bg-gray-100 text-gray-800" },
      SUBMITTED: { label: "Diajukan", className: "bg-blue-100 text-blue-800" },
      DIREVIEW: { label: "Direview", className: "bg-yellow-100 text-yellow-800" },
      DITERIMA: { label: "Diterima", className: "bg-green-100 text-green-800" },
      DITOLAK: { label: "Ditolak", className: "bg-red-100 text-red-800" },
      REVISI: { label: "Revisi", className: "bg-orange-100 text-orange-800" },
      BERJALAN: { label: "Berjalan", className: "bg-emerald-100 text-emerald-800" },
      SELESAI: { label: "Selesai", className: "bg-purple-100 text-purple-800" },
    }

    const config = statusConfig[status] || { label: status, className: "bg-gray-100 text-gray-800" }

    return (
      <Badge className={config.className}>
        {config.label}
      </Badge>
    )
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

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <Clock className="h-12 w-12 animate-spin text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">Memuat detail kontrak...</p>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  if (!kontrak) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">Kontrak tidak ditemukan</p>
          <Button onClick={() => router.push("/admin/kontrak")} className="mt-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Kembali
          </Button>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push("/admin/kontrak")}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Kembali
          </Button>
          <div>
            <h1 className="text-3xl font-bold">{kontrak.nomorKontrak}</h1>
            <p className="text-muted-foreground mt-1">Detail Kontrak Penelitian</p>
          </div>
        </div>
        {getStatusBadge(kontrak.status)}
      </div>

      {/* Alert jika masih draft */}
      {kontrak.status === "DRAFT" && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Kontrak ini masih berstatus DRAFT. Upload file kontrak dan SK yang sudah ditandatangani
            untuk mengaktifkan penelitian.
          </AlertDescription>
        </Alert>
      )}

      {/* Alert jika sudah signed */}
      {kontrak.status === "SIGNED" && kontrak.proposal.status === "BERJALAN" && (
        <Alert className="border-green-500 bg-green-50">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">
            Kontrak sudah ditandatangani. Proposal sekarang berstatus BERJALAN dan dosen dapat
            mengunggah laporan monitoring.
          </AlertDescription>
        </Alert>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        {/* Info Kontrak */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileSignature className="h-5 w-5" />
              Informasi Kontrak
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="text-muted-foreground">Nomor Kontrak</Label>
              <p className="font-medium">{kontrak.nomorKontrak}</p>
            </div>
            <div>
              <Label className="text-muted-foreground">Nomor SK</Label>
              <p className="font-medium">{kontrak.nomorSK}</p>
            </div>
            <div>
              <Label className="text-muted-foreground">Tanggal Kontrak</Label>
              <p className="font-medium">{formatDate(kontrak.tanggalKontrak)}</p>
            </div>
            <div>
              <Label className="text-muted-foreground">Dibuat Oleh</Label>
              <p className="font-medium">{kontrak.user_kontrak_createdByTouser.username}</p>
            </div>
            {kontrak.user_kontrak_uploadedByTouser && (
              <div>
                <Label className="text-muted-foreground">Upload TTD Oleh</Label>
                <p className="font-medium">{kontrak.user_kontrak_uploadedByTouser.username}</p>
                <p className="text-sm text-muted-foreground">
                  {kontrak.uploadedAt && formatDate(kontrak.uploadedAt)}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Info Proposal */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Informasi Proposal
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="text-muted-foreground">Judul</Label>
              <p className="font-medium">{kontrak.proposal.judul}</p>
            </div>
            <div>
              <Label className="text-muted-foreground">Skema</Label>
              <p className="font-medium">{kontrak.proposal.skema.nama}</p>
            </div>
            <div>
              <Label className="text-muted-foreground">Dana</Label>
              <p className="font-medium text-lg">
                {formatRupiah(kontrak.proposal.danaDiajukan || 0)}
              </p>
            </div>
            <div>
              <Label className="text-muted-foreground">Periode</Label>
              <p className="font-medium">
                {kontrak.proposal.periode.nama} ({kontrak.proposal.periode.tahun})
              </p>
            </div>
            <div>
              <Label className="text-muted-foreground">Status Proposal</Label>
              <div className="mt-1">{getProposalStatusBadge(kontrak.proposal.status)}</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tim Peneliti */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Tim Peneliti
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nama</TableHead>
                <TableHead>NIDN/NIM</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell className="font-medium">{kontrak.proposal.dosen.nama}</TableCell>
                <TableCell>{kontrak.proposal.dosen.nidn}</TableCell>
                <TableCell>{kontrak.proposal.dosen.email}</TableCell>
                <TableCell>
                  <Badge>Ketua</Badge>
                </TableCell>
              </TableRow>
              {kontrak.proposal.proposalmember
                .filter(member => member.role !== 'Ketua') // Exclude ketua (already shown above)
                .map((member) => (
                <TableRow key={member.id}>
                  <TableCell className="font-medium">
                    {member.dosen?.nama || member.mahasiswa?.nama}
                  </TableCell>
                  <TableCell>
                    {member.dosen?.nidn || member.mahasiswa?.nim || '-'}
                  </TableCell>
                  <TableCell>
                    {member.dosen?.email || member.mahasiswa?.email || '-'}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{member.role}</Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Upload TTD (hanya jika DRAFT) */}
      {kontrak.status === "DRAFT" && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5" />
              Upload Kontrak & SK Bertanda Tangan
            </CardTitle>
            <CardDescription>
              Upload file kontrak dan SK yang sudah ditandatangani (PDF). Setelah upload, proposal
              akan otomatis berubah menjadi status BERJALAN.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="fileKontrak">File Kontrak (PDF) *</Label>
                <Input
                  id="fileKontrak"
                  type="file"
                  accept=".pdf"
                  onChange={(e) => setFileKontrak(e.target.files?.[0] || null)}
                />
                {fileKontrak && (
                  <p className="text-sm text-muted-foreground">
                    <CheckCircle className="h-3 w-3 inline mr-1 text-green-600" />
                    {fileKontrak.name}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="fileSK">File SK (PDF) *</Label>
                <Input
                  id="fileSK"
                  type="file"
                  accept=".pdf"
                  onChange={(e) => setFileSK(e.target.files?.[0] || null)}
                />
                {fileSK && (
                  <p className="text-sm text-muted-foreground">
                    <CheckCircle className="h-3 w-3 inline mr-1 text-green-600" />
                    {fileSK.name}
                  </p>
                )}
              </div>
            </div>
            <Button
              onClick={handleUploadTTD}
              disabled={!fileKontrak || !fileSK || uploading}
              className="w-full"
            >
              {uploading ? (
                <>
                  <Clock className="h-4 w-4 mr-2 animate-spin" />
                  Mengupload...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4 mr-2" />
                  Upload File Bertanda Tangan
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Download Files (jika sudah upload) */}
      {kontrak.fileKontrak && kontrak.fileSK && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Download className="h-5 w-5" />
              Download Dokumen
            </CardTitle>
            <CardDescription>
              File kontrak dan SK yang sudah ditandatangani
            </CardDescription>
          </CardHeader>
          <CardContent className="flex gap-4">
            <Button variant="outline" asChild>
              <a href={kontrak.fileKontrak} target="_blank" rel="noopener noreferrer">
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
          </CardContent>
        </Card>
      )}
      </div>
    </DashboardLayout>
  )
}
