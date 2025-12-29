"use client"

import { useEffect, useState } from "react"
import DashboardLayout from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import { Package, Plus, Trash2, Eye, Loader2, FileText } from "lucide-react"

interface Luaran {
  id: string
  proposalId: string
  jenis: string
  judul: string
  penerbit: string | null
  tahunTerbit: number | null
  url: string | null
  fileBukti: string | null
  keterangan: string | null
  statusVerifikasi: string
  catatanVerifikasi: string | null
  createdAt: string
  proposal: {
    id: string
    judul: string
    status: string
    periode: {
      nama: string
      tahun: number
    }
    dosen: {
      nama: string
    }
  }
}

interface Proposal {
  id: string
  judul: string
  skema: {
    nama: string
    tipe: string
  }
}

export default function DosenLuaranPage() {
  const [luaranList, setLuaranList] = useState<Luaran[]>([])
  const [proposals, setProposals] = useState<Proposal[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)

  // Form state
  const [formData, setFormData] = useState({
    proposalId: "",
    jenis: "",
    judul: "",
    penerbit: "",
    tahunTerbit: "",
    url: "",
    keterangan: "",
  })

  // Stats
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    diverifikasi: 0,
    ditolak: 0,
  })

  useEffect(() => {
    fetchLuaran()
    fetchProposals()
  }, [])

  const fetchLuaran = async () => {
    try {
      setIsLoading(true)
      const response = await fetch("/api/luaran")
      const data = await response.json()

      if (data.success) {
        setLuaranList(data.data)
        setStats(data.stats)
      }
    } catch (error) {
      console.error("Error fetching luaran:", error)
      toast.error("Gagal memuat data luaran")
    } finally {
      setIsLoading(false)
    }
  }

  const fetchProposals = async () => {
    try {
      const response = await fetch("/api/proposal?status=BERJALAN,SELESAI")
      const data = await response.json()

      if (data.success) {
        setProposals(data.data)
      }
    } catch (error) {
      console.error("Error fetching proposals:", error)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      
      // Validate file type
      const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png']
      if (!allowedTypes.includes(file.type)) {
        toast.error("File harus berupa PDF, JPG, atau PNG")
        return
      }

      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        toast.error("Ukuran file maksimal 10MB")
        return
      }

      setSelectedFile(file)
    }
  }

  const uploadFile = async () => {
    if (!selectedFile) return null

    try {
      setIsUploading(true)
      const formData = new FormData()
      formData.append("file", selectedFile)
      formData.append("type", "luaran")

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      })

      const data = await response.json()

      if (data.success) {
        return data.fileName
      } else {
        throw new Error(data.error)
      }
    } catch (error) {
      console.error("Upload error:", error)
      toast.error("Gagal upload file")
      return null
    } finally {
      setIsUploading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.proposalId || !formData.jenis || !formData.judul) {
      toast.error("Proposal, jenis, dan judul wajib diisi")
      return
    }

    if (!selectedFile) {
      toast.error("File bukti wajib diupload")
      return
    }

    try {
      setIsSubmitting(true)

      // Upload file first
      const fileName = await uploadFile()
      if (!fileName) {
        throw new Error("Upload file gagal")
      }

      // Submit luaran
      const response = await fetch("/api/luaran", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          tahunTerbit: formData.tahunTerbit ? parseInt(formData.tahunTerbit) : null,
          fileBukti: fileName,
        }),
      })

      const data = await response.json()

      if (data.success) {
        toast.success("Luaran berhasil ditambahkan")
        setIsDialogOpen(false)
        resetForm()
        fetchLuaran()
      } else {
        toast.error(data.error || "Gagal menambahkan luaran")
      }
    } catch (error) {
      console.error("Submit error:", error)
      toast.error("Terjadi kesalahan saat submit")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async (id: string, status: string) => {
    if (status !== 'PENDING' && status !== 'DITOLAK') {
      toast.error("Hanya luaran PENDING atau DITOLAK yang bisa dihapus")
      return
    }

    if (!confirm("Yakin ingin menghapus luaran ini? TERMIN_3 akan ikut dihapus.")) {
      return
    }

    try {
      const response = await fetch(`/api/luaran/${id}`, {
        method: "DELETE",
      })

      const data = await response.json()

      if (data.success) {
        toast.success("Luaran berhasil dihapus")
        fetchLuaran()
      } else {
        toast.error(data.error || "Gagal menghapus luaran")
      }
    } catch (error) {
      console.error("Delete error:", error)
      toast.error("Terjadi kesalahan saat menghapus")
    }
  }

  const resetForm = () => {
    setFormData({
      proposalId: "",
      jenis: "",
      judul: "",
      penerbit: "",
      tahunTerbit: "",
      url: "",
      keterangan: "",
    })
    setSelectedFile(null)
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "PENDING":
        return <Badge variant="secondary">Pending</Badge>
      case "DIVERIFIKASI":
        return <Badge variant="default" className="bg-green-500">Diverifikasi</Badge>
      case "DITOLAK":
        return <Badge variant="destructive">Ditolak</Badge>
      default:
        return <Badge>{status}</Badge>
    }
  }

  const getJenisLabel = (jenis: string) => {
    const labels: Record<string, string> = {
      JURNAL: "Jurnal",
      BUKU: "Buku",
      HAKI: "HAKI/Paten",
      PRODUK: "Produk",
      MEDIA_MASSA: "Media Massa",
      LAINNYA: "Lainnya",
    }
    return labels[jenis] || jenis
  }

  return (
    <DashboardLayout>
      <div className="p-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">Luaran Penelitian</h1>
          <p className="text-muted-foreground">
            Kelola luaran hasil penelitian Anda
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-4 mb-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Luaran</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.pending}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Diverifikasi</CardTitle>
              <Package className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.diverifikasi}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Ditolak</CardTitle>
              <Package className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.ditolak}</div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Daftar Luaran</CardTitle>
                <CardDescription>
                  Submit luaran setelah laporan akhir disetujui
                </CardDescription>
              </div>
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Tambah Luaran
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Tambah Luaran Penelitian</DialogTitle>
                    <DialogDescription>
                      Upload bukti luaran hasil penelitian
                    </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleSubmit}>
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <Label htmlFor="proposalId">Proposal Penelitian *</Label>
                        <Select
                          value={formData.proposalId}
                          onValueChange={(value) =>
                            setFormData({ ...formData, proposalId: value })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Pilih proposal" />
                          </SelectTrigger>
                          <SelectContent>
                            {proposals.map((proposal) => (
                              <SelectItem key={proposal.id} value={proposal.id}>
                                {proposal.judul} ({proposal.skema.nama})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="jenis">Jenis Luaran *</Label>
                        <Select
                          value={formData.jenis}
                          onValueChange={(value) =>
                            setFormData({ ...formData, jenis: value })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Pilih jenis luaran" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="JURNAL">Jurnal</SelectItem>
                            <SelectItem value="BUKU">Buku</SelectItem>
                            <SelectItem value="HAKI">HAKI/Paten</SelectItem>
                            <SelectItem value="PRODUK">Produk</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="judul">Judul Luaran *</Label>
                        <Input
                          id="judul"
                          value={formData.judul}
                          onChange={(e) =>
                            setFormData({ ...formData, judul: e.target.value })
                          }
                          placeholder="Judul artikel/buku/produk"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="penerbit">Penerbit/Jurnal</Label>
                        <Input
                          id="penerbit"
                          value={formData.penerbit}
                          onChange={(e) =>
                            setFormData({ ...formData, penerbit: e.target.value })
                          }
                          placeholder="Nama penerbit atau jurnal"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="tahunTerbit">Tahun Terbit</Label>
                        <Input
                          id="tahunTerbit"
                          type="number"
                          value={formData.tahunTerbit}
                          onChange={(e) =>
                            setFormData({ ...formData, tahunTerbit: e.target.value })
                          }
                          placeholder="2024"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="url">URL/DOI</Label>
                        <Input
                          id="url"
                          value={formData.url}
                          onChange={(e) =>
                            setFormData({ ...formData, url: e.target.value })
                          }
                          placeholder="https://"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="file">File Bukti * (PDF/JPG/PNG, max 10MB)</Label>
                        <Input
                          id="file"
                          type="file"
                          accept=".pdf,.jpg,.jpeg,.png"
                          onChange={handleFileChange}
                        />
                        {selectedFile && (
                          <p className="text-sm text-muted-foreground">
                            File: {selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
                          </p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="keterangan">Keterangan</Label>
                        <Textarea
                          id="keterangan"
                          value={formData.keterangan}
                          onChange={(e) =>
                            setFormData({ ...formData, keterangan: e.target.value })
                          }
                          placeholder="Tambahkan keterangan jika diperlukan"
                          rows={3}
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setIsDialogOpen(false)}
                        disabled={isSubmitting || isUploading}
                      >
                        Batal
                      </Button>
                      <Button type="submit" disabled={isSubmitting || isUploading}>
                        {isSubmitting || isUploading ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            {isUploading ? "Uploading..." : "Menyimpan..."}
                          </>
                        ) : (
                          "Simpan"
                        )}
                      </Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin" />
              </div>
            ) : luaranList.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                Belum ada luaran yang disubmit
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Proposal</TableHead>
                    <TableHead>Jenis</TableHead>
                    <TableHead>Judul Luaran</TableHead>
                    <TableHead>Penerbit</TableHead>
                    <TableHead>Tahun</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {luaranList.map((luaran) => (
                    <TableRow key={luaran.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{luaran.proposal.judul}</div>
                          <div className="text-sm text-muted-foreground">
                            {luaran.proposal.periode.nama} {luaran.proposal.periode.tahun}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{getJenisLabel(luaran.jenis)}</TableCell>
                      <TableCell>{luaran.judul}</TableCell>
                      <TableCell>{luaran.penerbit || "-"}</TableCell>
                      <TableCell>{luaran.tahunTerbit || "-"}</TableCell>
                      <TableCell>{getStatusBadge(luaran.statusVerifikasi)}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          {luaran.fileBukti && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                window.open(`/uploads/luaran/${luaran.fileBukti}`, "_blank")
                              }
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          )}
                          {(luaran.statusVerifikasi === 'PENDING' || luaran.statusVerifikasi === 'DITOLAK') && (
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleDelete(luaran.id, luaran.statusVerifikasi)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
