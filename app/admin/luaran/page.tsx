"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import DashboardLayout from "@/components/layout/dashboard-layout"
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import { 
  FileText, 
  CheckCircle, 
  XCircle, 
  Clock,
  ExternalLink,
  Search,
  Filter
} from "lucide-react"

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
  proposal: {
    id: string
    judul: string
    periode: {
      nama: string
      tahun: string
    }
    dosen: {
      nama: string
      nidn: string
    }
  }
  verifier?: {
    username: string
  }
}

interface Stats {
  total: number
  pending: number
  diverifikasi: number
  ditolak: number
}

export default function LuaranPage() {
  const router = useRouter()
  const [luaran, setLuaran] = useState<Luaran[]>([])
  const [stats, setStats] = useState<Stats>({
    total: 0,
    pending: 0,
    diverifikasi: 0,
    ditolak: 0,
  })
  const [loading, setLoading] = useState(true)

  // Filters
  const [statusFilter, setStatusFilter] = useState("ALL")
  const [jenisFilter, setJenisFilter] = useState("ALL")
  const [searchValue, setSearchValue] = useState("")

  // Verify dialog
  const [verifyDialog, setVerifyDialog] = useState(false)
  const [selectedLuaran, setSelectedLuaran] = useState<Luaran | null>(null)
  const [statusVerifikasi, setStatusVerifikasi] = useState<string>("DIVERIFIKASI")
  const [catatanVerifikasi, setCatatanVerifikasi] = useState("")

  useEffect(() => {
    loadLuaran()
  }, [statusFilter, jenisFilter, searchValue])

  const loadLuaran = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      
      if (statusFilter !== "ALL") params.append("status", statusFilter)
      if (jenisFilter !== "ALL") params.append("jenis", jenisFilter)
      if (searchValue) params.append("search", searchValue)

      const response = await fetch(`/api/luaran?${params.toString()}`)
      const data = await response.json()

      if (data.success) {
        setLuaran(data.data || [])
        setStats(data.stats || {
          total: 0,
          pending: 0,
          diverifikasi: 0,
          ditolak: 0,
        })
      } else {
        toast.error(data.error || "Gagal memuat data luaran")
      }
    } catch (error) {
      console.error("Load luaran error:", error)
      toast.error("Terjadi kesalahan saat memuat data")
    } finally {
      setLoading(false)
    }
  }

  const handleVerify = async () => {
    if (!selectedLuaran) return

    try {
      const response = await fetch(`/api/luaran/${selectedLuaran.id}/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          statusVerifikasi,
          catatanVerifikasi,
        }),
      })

      const data = await response.json()

      if (data.success) {
        toast.success(data.message)
        setVerifyDialog(false)
        setSelectedLuaran(null)
        setCatatanVerifikasi("")
        loadLuaran()
      } else {
        toast.error(data.error || "Gagal verifikasi luaran")
      }
    } catch (error) {
      console.error("Verify luaran error:", error)
      toast.error("Terjadi kesalahan")
    }
  }

  const openVerifyDialog = (item: Luaran) => {
    setSelectedLuaran(item)
    setStatusVerifikasi("DIVERIFIKASI")
    setCatatanVerifikasi("")
    setVerifyDialog(true)
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "PENDING":
        return <Badge variant="outline" className="bg-yellow-50"><Clock className="w-3 h-3 mr-1" /> Pending</Badge>
      case "DIVERIFIKASI":
        return <Badge variant="outline" className="bg-green-50 text-green-700"><CheckCircle className="w-3 h-3 mr-1" /> Diverifikasi</Badge>
      case "DITOLAK":
        return <Badge variant="outline" className="bg-red-50 text-red-700"><XCircle className="w-3 h-3 mr-1" /> Ditolak</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const getJenisBadge = (jenis: string) => {
    const colors: any = {
      JURNAL: "bg-blue-50 text-blue-700",
      BUKU: "bg-purple-50 text-purple-700",
      HAKI: "bg-orange-50 text-orange-700",
      PRODUK: "bg-green-50 text-green-700",
      MEDIA_MASSA: "bg-pink-50 text-pink-700",
      LAINNYA: "bg-gray-50 text-gray-700",
    }
    return <Badge variant="outline" className={colors[jenis] || ""}>{jenis.replace(/_/g, " ")}</Badge>
  }

  return (
    <DashboardLayout>
      <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Manajemen Luaran Penelitian</h1>
        <p className="text-muted-foreground">
          Kelola dan verifikasi luaran penelitian
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Luaran</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Diverifikasi</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.diverifikasi}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ditolak</CardTitle>
            <XCircle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.ditolak}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Filter
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">Semua Status</SelectItem>
                  <SelectItem value="PENDING">Pending</SelectItem>
                  <SelectItem value="DIVERIFIKASI">Diverifikasi</SelectItem>
                  <SelectItem value="DITOLAK">Ditolak</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Jenis Luaran</Label>
              <Select value={jenisFilter} onValueChange={setJenisFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih jenis" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">Semua Jenis</SelectItem>
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
              <Label>Cari</Label>
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Cari judul atau penerbit..."
                  value={searchValue}
                  onChange={(e) => setSearchValue(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Luaran List */}
      <Card>
        <CardHeader>
          <CardTitle>Daftar Luaran</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">Memuat data...</p>
            </div>
          ) : luaran.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">Tidak ada data luaran</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Jenis</TableHead>
                    <TableHead>Judul Luaran</TableHead>
                    <TableHead>Proposal</TableHead>
                    <TableHead>Ketua</TableHead>
                    <TableHead>Penerbit/Tahun</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {luaran.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>{getJenisBadge(item.jenis)}</TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{item.judul}</p>
                          {item.url && (
                            <a 
                              href={item.url} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-xs text-blue-600 hover:underline flex items-center gap-1 mt-1"
                            >
                              <ExternalLink className="w-3 h-3" />
                              Link eksternal
                            </a>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="text-sm">{item.proposal.judul}</p>
                          <p className="text-xs text-muted-foreground">
                            {item.proposal.periode.nama} {item.proposal.periode.tahun}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="text-sm">{item.proposal.dosen.nama}</p>
                          <p className="text-xs text-muted-foreground">{item.proposal.dosen.nidn}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <p className="text-sm">{item.penerbit || "-"}</p>
                        {item.tahunTerbit && (
                          <p className="text-xs text-muted-foreground">{item.tahunTerbit}</p>
                        )}
                      </TableCell>
                      <TableCell>{getStatusBadge(item.statusVerifikasi)}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          {item.fileBukti && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => window.open(item.fileBukti, "_blank")}
                            >
                              <FileText className="w-4 h-4 mr-1" />
                              Bukti
                            </Button>
                          )}
                          {item.statusVerifikasi === "PENDING" && (
                            <Button
                              variant="default"
                              size="sm"
                              onClick={() => openVerifyDialog(item)}
                            >
                              Verifikasi
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Verify Dialog */}
      <Dialog open={verifyDialog} onOpenChange={setVerifyDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Verifikasi Luaran</DialogTitle>
            <DialogDescription>
              Verifikasi atau tolak luaran penelitian
            </DialogDescription>
          </DialogHeader>
          {selectedLuaran && (
            <div className="space-y-4">
              <div>
                <Label className="text-sm text-muted-foreground">Judul Luaran</Label>
                <p className="font-medium">{selectedLuaran.judul}</p>
              </div>

              <div>
                <Label className="text-sm text-muted-foreground">Jenis</Label>
                <p>{selectedLuaran.jenis.replace(/_/g, " ")}</p>
              </div>

              <div>
                <Label className="text-sm text-muted-foreground">Proposal</Label>
                <p>{selectedLuaran.proposal.judul}</p>
              </div>

              {selectedLuaran.keterangan && (
                <div>
                  <Label className="text-sm text-muted-foreground">Keterangan dari Dosen</Label>
                  <p className="text-sm">{selectedLuaran.keterangan}</p>
                </div>
              )}

              <div className="space-y-2">
                <Label>Status Verifikasi</Label>
                <Select value={statusVerifikasi} onValueChange={setStatusVerifikasi}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="DIVERIFIKASI">Diverifikasi</SelectItem>
                    <SelectItem value="DITOLAK">Ditolak</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Catatan Verifikasi (Opsional)</Label>
                <Textarea
                  value={catatanVerifikasi}
                  onChange={(e) => setCatatanVerifikasi(e.target.value)}
                  placeholder="Berikan catatan atau alasan..."
                  rows={4}
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setVerifyDialog(false)}>
              Batal
            </Button>
            <Button onClick={handleVerify}>
              Simpan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
    </DashboardLayout>
  )
}
