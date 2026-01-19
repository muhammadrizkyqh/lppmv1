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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
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
import { Package, Plus, Trash2, Eye, Loader2, FileText, X } from "lucide-react"
import { getStatusBadgeVariant } from "@/lib/utils"
import { SearchInput } from "@/components/ui/search-input"

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
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("ALL")
  const [jenisFilter, setJenisFilter] = useState("ALL")
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 15
  const [deleteConfirm, setDeleteConfirm] = useState<{open: boolean, id: string | null, status: string | null}>({open: false, id: null, status: null})

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

    try {
      const response = await fetch(`/api/luaran/${id}`, {
        method: "DELETE",
      })

      const data = await response.json()

      if (data.success) {
        toast.success("Luaran berhasil dihapus")
        fetchLuaran()
        setDeleteConfirm({open: false, id: null, status: null})
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
        return <Badge variant={getStatusBadgeVariant('PENDING')}>Pending</Badge>
      case "DIVERIFIKASI":
        return <Badge variant={getStatusBadgeVariant('DISETUJUI')}>Diverifikasi</Badge>
      case "DITOLAK":
        return <Badge variant={getStatusBadgeVariant('DITOLAK')}>Ditolak</Badge>
      default:
        return <Badge variant={getStatusBadgeVariant(status)}>{status}</Badge>
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

  // Filter luaran berdasarkan search query dan filters
  const filteredLuaran = luaranList.filter((luaran) => {
    const matchesSearch = 
      luaran.judul.toLowerCase().includes(searchQuery.toLowerCase()) ||
      luaran.proposal.judul.toLowerCase().includes(searchQuery.toLowerCase()) ||
      getJenisLabel(luaran.jenis).toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesStatus = statusFilter === "ALL" || luaran.statusVerifikasi === statusFilter
    const matchesJenis = jenisFilter === "ALL" || luaran.jenis === jenisFilter

    return matchesSearch && matchesStatus && matchesJenis
  })

  // Reset page saat filter berubah
  useEffect(() => {
    setCurrentPage(1)
  }, [searchQuery, statusFilter, jenisFilter])

  // Pagination calculations
  const totalItems = filteredLuaran.length
  const totalPages = Math.ceil(totalItems / itemsPerPage)
  const indexOfLastItem = currentPage * itemsPerPage
  const indexOfFirstItem = indexOfLastItem - itemsPerPage
  const currentItems = filteredLuaran.slice(indexOfFirstItem, indexOfLastItem)

  const goToPage = (page: number) => {
    setCurrentPage(page)
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

        {/* Search and Filters */}
        <div className="mb-6 space-y-4">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <SearchInput
              placeholder="Cari judul luaran atau proposal..."
              value={searchQuery}
              onChange={setSearchQuery}
              containerClassName="flex-1"
            />

            {/* Status Filter */}
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-[200px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Semua Status</SelectItem>
                <SelectItem value="PENDING">Pending</SelectItem>
                <SelectItem value="DIVERIFIKASI">Diverifikasi</SelectItem>
                <SelectItem value="DITOLAK">Ditolak</SelectItem>
              </SelectContent>
            </Select>

            {/* Jenis Filter */}
            <Select value={jenisFilter} onValueChange={setJenisFilter}>
              <SelectTrigger className="w-full md:w-[200px]">
                <SelectValue placeholder="Jenis Luaran" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Semua Jenis</SelectItem>
                <SelectItem value="JURNAL">Jurnal</SelectItem>
                <SelectItem value="BUKU">Buku</SelectItem>
                <SelectItem value="HAKI">HAKI/Paten</SelectItem>
                <SelectItem value="PRODUK">Produk</SelectItem>
                <SelectItem value="MEDIA_MASSA">Media Massa</SelectItem>
                <SelectItem value="LAINNYA">Lainnya</SelectItem>
              </SelectContent>
            </Select>

            {/* Clear Filters */}
            {(searchQuery || statusFilter !== "ALL" || jenisFilter !== "ALL") && (
              <Button
                variant="outline"
                onClick={() => {
                  setSearchQuery("")
                  setStatusFilter("ALL")
                  setJenisFilter("ALL")
                }}
              >
                <X className="h-4 w-4 mr-2" />
                Clear
              </Button>
            )}
          </div>
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
                    <p className="text-sm text-muted-foreground mt-2">* Wajib diisi</p>
                  </DialogHeader>
                  <form onSubmit={handleSubmit}>
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <Label htmlFor="proposalId">
                          Proposal Penelitian <span className="text-red-500">*</span>
                        </Label>
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
                        <Label htmlFor="jenis">
                          Jenis Luaran <span className="text-red-500">*</span>
                        </Label>
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
                        <Label htmlFor="judul">
                          Judul Luaran <span className="text-red-500">*</span>
                        </Label>
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
                        <Label htmlFor="file">
                          File Bukti <span className="text-red-500">*</span> (PDF/JPG/PNG, max 10MB)
                        </Label>
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
            ) : filteredLuaran.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12">
                <FileText className="h-16 w-16 text-muted-foreground mb-4 opacity-50" />
                <h3 className="text-lg font-semibold mb-2">Tidak Ada Hasil</h3>
                <p className="text-muted-foreground text-center max-w-md mb-4">
                  Tidak ditemukan luaran yang sesuai dengan pencarian atau filter Anda
                </p>
                <Button
                  variant="link"
                  onClick={() => {
                    setSearchQuery("")
                    setStatusFilter("ALL")
                    setJenisFilter("ALL")
                  }}
                >
                  Clear semua filter
                </Button>
              </div>
            ) : (
              <>
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
                    {currentItems.map((luaran) => (
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
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="min-w-[44px] min-h-[44px] md:min-w-0 md:min-h-0"
                                    onClick={() =>
                                      window.open(`/uploads/luaran/${luaran.fileBukti}`, "_blank")
                                    }
                                    aria-label="Lihat file bukti"
                                  >
                                    <Eye className="h-4 w-4" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>Lihat Bukti</p>
                                </TooltipContent>
                              </Tooltip>
                            )}
                            {(luaran.statusVerifikasi === 'PENDING' || luaran.statusVerifikasi === 'DITOLAK') && (
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="destructive"
                                    size="sm"
                                    className="min-w-[44px] min-h-[44px] md:min-w-0 md:min-h-0"
                                    onClick={() => setDeleteConfirm({open: true, id: luaran.id, status: luaran.statusVerifikasi})}
                                    aria-label="Hapus luaran"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>Hapus Luaran</p>
                                </TooltipContent>
                              </Tooltip>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>

                {/* Pagination Controls */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-between px-2 py-4 border-t">
                    <div className="text-sm text-muted-foreground">
                      Menampilkan {indexOfFirstItem + 1}-{Math.min(indexOfLastItem, totalItems)} dari {totalItems} luaran
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => goToPage(currentPage - 1)}
                        disabled={currentPage === 1}
                      >
                        Previous
                      </Button>
                      
                      <div className="flex items-center gap-1">
                        {currentPage > 2 && (
                          <>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => goToPage(1)}
                            >
                              1
                            </Button>
                            {currentPage > 3 && (
                              <span className="px-2 text-muted-foreground">...</span>
                            )}
                          </>
                        )}
                        
                        {currentPage > 1 && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => goToPage(currentPage - 1)}
                          >
                            {currentPage - 1}
                          </Button>
                        )}
                        
                        <Button
                          variant="default"
                          size="sm"
                        >
                          {currentPage}
                        </Button>
                        
                        {currentPage < totalPages && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => goToPage(currentPage + 1)}
                          >
                            {currentPage + 1}
                          </Button>
                        )}
                        
                        {currentPage < totalPages - 1 && (
                          <>
                            {currentPage < totalPages - 2 && (
                              <span className="px-2 text-muted-foreground">...</span>
                            )}
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => goToPage(totalPages)}
                            >
                              {totalPages}
                            </Button>
                          </>
                        )}
                      </div>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => goToPage(currentPage + 1)}
                        disabled={currentPage === totalPages}
                      >
                        Next
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteConfirm.open} onOpenChange={(open) => setDeleteConfirm({open, id: null, status: null})}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Luaran?</AlertDialogTitle>
            <AlertDialogDescription>
              Luaran yang sudah dihapus tidak dapat dikembalikan. TERMIN_3 akan ikut dihapus.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteConfirm.id && deleteConfirm.status && handleDelete(deleteConfirm.id, deleteConfirm.status)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Hapus
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  )
}
