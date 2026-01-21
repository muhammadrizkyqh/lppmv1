"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import { validateFileSize, validateFileType, formatFileSize, FILE_SIZE_LIMITS, compressPDFIfNeeded, getCompressionRecommendation } from "@/lib/file-utils"
import { 
  FileText, 
  CheckCircle, 
  XCircle, 
  Clock,
  Plus,
  Upload,
  ExternalLink,
  AlertCircle
} from "lucide-react"

interface LuaranSectionProps {
  proposalId: string
  proposalStatus: string
}

interface Luaran {
  id: string
  jenis: string
  judul: string
  penerbit?: string
  tahunTerbit?: number
  url?: string
  fileBukti?: string
  keterangan?: string
  tanggalUpload: string
  statusVerifikasi: string
  catatanVerifikasi?: string
  verifiedAt?: string
  verifier?: {
    username: string
  }
}

export default function LuaranSection({ proposalId, proposalStatus }: LuaranSectionProps) {
  const [luaran, setLuaran] = useState<Luaran[]>([])
  const [totals, setTotals] = useState({
    total: 0,
    pending: 0,
    diverifikasi: 0,
    ditolak: 0,
  })
  const [loading, setLoading] = useState(true)

  // Add dialog
  const [addDialog, setAddDialog] = useState(false)
  const [formData, setFormData] = useState({
    jenis: "JURNAL",
    judul: "",
    penerbit: "",
    tahunTerbit: new Date().getFullYear(),
    url: "",
    keterangan: "",
  })

  // Upload dialog
  const [uploadDialog, setUploadDialog] = useState(false)
  const [selectedLuaran, setSelectedLuaran] = useState<Luaran | null>(null)
  const [fileToUpload, setFileToUpload] = useState<File | null>(null)

  useEffect(() => {
    loadLuaran()
  }, [proposalId])

  const loadLuaran = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/luaran/proposal/${proposalId}`)
      const data = await response.json()

      if (data.success) {
        setLuaran(data.data?.data || [])
        setTotals(data.data?.totals || {
          total: 0,
          pending: 0,
          diverifikasi: 0,
          ditolak: 0,
        })
      }
    } catch (error) {
      console.error("Load luaran error:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async () => {
    if (!formData.judul) {
      toast.error("Judul luaran wajib diisi")
      return
    }

    try {
      const response = await fetch("/api/luaran", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          proposalId,
        }),
      })

      const data = await response.json()

      if (data.success) {
        toast.success(data.message)
        setAddDialog(false)
        setFormData({
          jenis: "JURNAL",
          judul: "",
          penerbit: "",
          tahunTerbit: new Date().getFullYear(),
          url: "",
          keterangan: "",
        })
        loadLuaran()
      } else {
        toast.error(data.error || "Gagal submit luaran")
      }
    } catch (error) {
      console.error("Submit luaran error:", error)
      toast.error("Terjadi kesalahan")
    }
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validasi tipe file
    const typeValidation = validateFileType(file, 'application/pdf')
    if (!typeValidation.valid) {
      toast.error(typeValidation.error!)
      e.target.value = ''
      return
    }

    // Validasi ukuran file
    const sizeValidation = validateFileSize(file)
    if (!sizeValidation.valid) {
      toast.error(sizeValidation.error!)
      e.target.value = ''
      return
    }

    // Warning jika file besar
    if (sizeValidation.warning) {
      toast.warning(sizeValidation.warning, { duration: 5000 })
    }

    // Cek rekomendasi kompresi
    const recommendation = await getCompressionRecommendation(file.size)
    if (recommendation) {
      toast.info(recommendation, { duration: 5000 })
    }

    // Analisis PDF dan rekomendasi kompresi jika perlu
    const compressionResult = await compressPDFIfNeeded(file)
    if (compressionResult.recommendation) {
      toast.info(compressionResult.recommendation, { duration: 6000 })
    }

    setFileToUpload(compressionResult.file)
  }

  const handleUpload = async () => {
    if (!selectedLuaran || !fileToUpload) {
      toast.error("Pilih file terlebih dahulu")
      return
    }

    try {
      const formData = new FormData()
      formData.append("fileBukti", fileToUpload)

      const response = await fetch(`/api/luaran/${selectedLuaran.id}/upload`, {
        method: "POST",
        body: formData,
      })

      const data = await response.json()

      if (data.success) {
        toast.success(data.message)
        setUploadDialog(false)
        setSelectedLuaran(null)
        setFileToUpload(null)
        loadLuaran()
      } else {
        toast.error(data.error || "Gagal upload file")
      }
    } catch (error) {
      console.error("Upload error:", error)
      toast.error("Terjadi kesalahan")
    }
  }

  const openUploadDialog = (item: Luaran) => {
    setSelectedLuaran(item)
    setFileToUpload(null)
    setUploadDialog(true)
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "PENDING":
        return <Badge variant="outline" className="bg-yellow-50"><Clock className="w-3 h-3 mr-1" /> Menunggu Verifikasi</Badge>
      case "DIVERIFIKASI":
        return <Badge variant="outline" className="bg-green-50 text-green-700"><CheckCircle className="w-3 h-3 mr-1" /> Diverifikasi</Badge>
      case "DITOLAK":
        return <Badge variant="outline" className="bg-red-50 text-red-700"><XCircle className="w-3 h-3 mr-1" /> Ditolak</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  // Only show for BERJALAN or SELESAI status
  if (!['BERJALAN', 'SELESAI'].includes(proposalStatus)) {
    return null
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Luaran Penelitian</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Upload dan kelola luaran penelitian Anda
            </p>
          </div>
          <Button onClick={() => setAddDialog(true)} size="sm">
            <Plus className="w-4 h-4 mr-2" />
            Tambah Luaran
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Stats */}
        <div className="grid grid-cols-4 gap-4">
          <div className="text-center p-3 bg-blue-50 rounded-lg">
            <p className="text-2xl font-bold text-blue-700">{totals.total}</p>
            <p className="text-xs text-blue-600">Total</p>
          </div>
          <div className="text-center p-3 bg-yellow-50 rounded-lg">
            <p className="text-2xl font-bold text-yellow-700">{totals.pending}</p>
            <p className="text-xs text-yellow-600">Pending</p>
          </div>
          <div className="text-center p-3 bg-green-50 rounded-lg">
            <p className="text-2xl font-bold text-green-700">{totals.diverifikasi}</p>
            <p className="text-xs text-green-600">Diverifikasi</p>
          </div>
          <div className="text-center p-3 bg-red-50 rounded-lg">
            <p className="text-2xl font-bold text-red-700">{totals.ditolak}</p>
            <p className="text-xs text-red-600">Ditolak</p>
          </div>
        </div>

        {/* Info box */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex gap-3">
            <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="space-y-2 text-sm text-blue-900">
              <p className="font-medium">Informasi Penting:</p>
              <ul className="list-disc list-inside space-y-1 text-blue-800">
                <li>Luaran wajib disubmit maksimal 6 bulan setelah laporan akhir diverifikasi</li>
                <li>Minimal 1 luaran harus diverifikasi untuk pencairan Termin 3 (25%)</li>
                <li>Jenis luaran: Jurnal, Buku, HAKI, Produk, Media Massa, atau Lainnya</li>
                <li>Upload bukti luaran (PDF/gambar, max 10MB)</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Luaran list */}
        {loading ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">Memuat data...</p>
          </div>
        ) : luaran.length === 0 ? (
          <div className="text-center py-8 border-2 border-dashed rounded-lg">
            <FileText className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground mb-2">Belum ada luaran</p>
            <Button onClick={() => setAddDialog(true)} variant="outline" size="sm">
              <Plus className="w-4 h-4 mr-2" />
              Tambah Luaran Pertama
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {luaran.map((item) => (
              <div key={item.id} className="border rounded-lg p-4 space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="outline">{item.jenis.replace(/_/g, " ")}</Badge>
                      {getStatusBadge(item.statusVerifikasi)}
                    </div>
                    <h4 className="font-semibold">{item.judul}</h4>
                    {item.penerbit && (
                      <p className="text-sm text-muted-foreground">
                        {item.penerbit}
                        {item.tahunTerbit && ` (${item.tahunTerbit})`}
                      </p>
                    )}
                    {item.url && (
                      <a
                        href={item.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-blue-600 hover:underline flex items-center gap-1 mt-1"
                      >
                        <ExternalLink className="w-3 h-3" />
                        Link eksternal
                      </a>
                    )}
                  </div>
                </div>

                {item.keterangan && (
                  <div className="text-sm bg-gray-50 p-3 rounded">
                    <p className="text-muted-foreground">Keterangan:</p>
                    <p>{item.keterangan}</p>
                  </div>
                )}

                {item.catatanVerifikasi && (
                  <div className={`text-sm p-3 rounded ${
                    item.statusVerifikasi === 'DIVERIFIKASI' 
                      ? 'bg-green-50 border border-green-200' 
                      : 'bg-red-50 border border-red-200'
                  }`}>
                    <p className={`font-medium ${
                      item.statusVerifikasi === 'DIVERIFIKASI' ? 'text-green-900' : 'text-red-900'
                    }`}>
                      Catatan Admin:
                    </p>
                    <p className={
                      item.statusVerifikasi === 'DIVERIFIKASI' ? 'text-green-800' : 'text-red-800'
                    }>
                      {item.catatanVerifikasi}
                    </p>
                  </div>
                )}

                <div className="flex gap-2">
                  {item.fileBukti && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.open(item.fileBukti, "_blank")}
                    >
                      <FileText className="w-4 h-4 mr-1" />
                      Lihat Bukti
                    </Button>
                  )}
                  {item.statusVerifikasi !== 'DIVERIFIKASI' && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openUploadDialog(item)}
                    >
                      <Upload className="w-4 h-4 mr-1" />
                      {item.fileBukti ? 'Ganti Bukti' : 'Upload Bukti'}
                    </Button>
                  )}
                </div>

                <div className="text-xs text-muted-foreground">
                  Diupload: {new Date(item.tanggalUpload).toLocaleDateString('id-ID')}
                  {item.verifiedAt && (
                    <> • Diverifikasi: {new Date(item.verifiedAt).toLocaleDateString('id-ID')}</>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>

      {/* Add Dialog */}
      <Dialog open={addDialog} onOpenChange={setAddDialog}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Tambah Luaran Baru</DialogTitle>
            <DialogDescription>
              Isi detail luaran penelitian Anda
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Jenis Luaran *</Label>
              <Select 
                value={formData.jenis} 
                onValueChange={(v) => setFormData({ ...formData, jenis: v })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="JURNAL">Jurnal</SelectItem>
                  <SelectItem value="BUKU">Buku</SelectItem>
                  <SelectItem value="HAKI">HAKI</SelectItem>
                  <SelectItem value="PRODUK">Produk</SelectItem>
                  <SelectItem value="MEDIA_MASSA">Media Massa</SelectItem>
                  <SelectItem value="LAINNYA">Lainnya</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Judul Luaran *</Label>
              <Input
                value={formData.judul}
                onChange={(e) => setFormData({ ...formData, judul: e.target.value })}
                placeholder="Masukkan judul luaran"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Penerbit (Opsional)</Label>
                <Input
                  value={formData.penerbit}
                  onChange={(e) => setFormData({ ...formData, penerbit: e.target.value })}
                  placeholder="Nama penerbit/jurnal"
                />
              </div>

              <div className="space-y-2">
                <Label>Tahun Terbit (Opsional)</Label>
                <Input
                  type="number"
                  value={formData.tahunTerbit}
                  onChange={(e) => setFormData({ ...formData, tahunTerbit: parseInt(e.target.value) })}
                  placeholder="2025"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>URL/Link (Opsional)</Label>
              <Input
                value={formData.url}
                onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                placeholder="https://..."
              />
            </div>

            <div className="space-y-2">
              <Label>Keterangan (Opsional)</Label>
              <Textarea
                value={formData.keterangan}
                onChange={(e) => setFormData({ ...formData, keterangan: e.target.value })}
                placeholder="Informasi tambahan tentang luaran..."
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddDialog(false)}>
              Batal
            </Button>
            <Button onClick={handleSubmit}>
              Submit Luaran
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Upload Dialog */}
      <Dialog open={uploadDialog} onOpenChange={setUploadDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Upload Bukti Luaran</DialogTitle>
            <DialogDescription>
              Upload file bukti luaran (PDF/gambar, max 10MB)
            </DialogDescription>
          </DialogHeader>
          {selectedLuaran && (
            <div className="space-y-4">
              <div>
                <Label className="text-sm text-muted-foreground">Judul Luaran</Label>
                <p className="font-medium">{selectedLuaran.judul}</p>
              </div>

              <div className="space-y-2">
                <Label>Pilih File *</Label>
                <Input
                  type="file"
                  accept=".pdf"
                  onChange={handleFileChange}
                />
                <p className="text-xs text-muted-foreground">
                  Format: PDF (Max 10MB). File besar akan dianalisis dan diberi rekomendasi kompresi.
                </p>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setUploadDialog(false)}>
              Batal
            </Button>
            <Button onClick={handleUpload} disabled={!fileToUpload}>
              <Upload className="w-4 h-4 mr-2" />
              Upload
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  )
}
