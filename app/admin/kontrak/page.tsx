"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import DashboardLayout from "@/components/layout/dashboard-layout"
import {
  FileText,
  Filter,
  Download,
  Upload,
  Eye,
  CheckCircle,
  Clock,
  FileSignature,
  RefreshCw,
  X,
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { SearchInput } from "@/components/ui/search-input"
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { toast } from "sonner"

interface Kontrak {
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
    danaDisetujui: number | null
    dosen: {
      nama: string
      nidn: string
    }
    skema: {
      nama: string
    }
    periode: {
      nama: string
      tahun: number
    }
  }
  creator: {
    username: string
  }
}

export default function AdminKontrakPage() {
  const router = useRouter()
  const [kontrakList, setKontrakList] = useState<Kontrak[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("ALL")
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  // Detect active filters
  const hasActiveFilters = search !== "" || statusFilter !== "ALL"

  const fetchKontrakList = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (statusFilter !== "ALL") params.set("status", statusFilter)
      if (search) params.set("search", search)

      const response = await fetch(`/api/kontrak?${params.toString()}`, {
        credentials: "include",
      })

      if (!response.ok) throw new Error("Failed to fetch")

      const result = await response.json()
      if (result.success) {
        setKontrakList(result.data)
      } else {
        toast.error(result.error || "Gagal memuat data kontrak")
      }
    } catch (error) {
      toast.error("Terjadi kesalahan saat memuat data")
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    setCurrentPage(1)
    fetchKontrakList()
  }, [statusFilter])

  const handleSearch = () => {
    setCurrentPage(1)
    fetchKontrakList()
  }

  const handleClearFilters = () => {
    setSearch("")
    setStatusFilter("ALL")
    setCurrentPage(1)
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

  // Pagination calculations
  const totalItems = kontrakList.length
  const totalPages = Math.ceil(totalItems / itemsPerPage)
  const indexOfLastItem = currentPage * itemsPerPage
  const indexOfFirstItem = indexOfLastItem - itemsPerPage
  const currentItems = kontrakList.slice(indexOfFirstItem, indexOfLastItem)

  const goToPage = (page: number) => {
    setCurrentPage(page)
  }

  const stats = {
    total: kontrakList.length,
    draft: kontrakList.filter((k) => k.status === "DRAFT").length,
    signed: kontrakList.filter((k) => k.status === "SIGNED").length,
    aktif: kontrakList.filter((k) => k.status === "AKTIF").length,
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Kontrak Penelitian</h1>
          <p className="text-muted-foreground mt-1">
            Kelola kontrak dan SK penelitian yang diterima
          </p>
        </div>
        <Button onClick={fetchKontrakList} variant="outline" size="sm">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Kontrak</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Perlu TTD</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.draft}</div>
            <p className="text-xs text-muted-foreground mt-1">Belum upload TTD</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ditandatangani</CardTitle>
            <FileSignature className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.signed}</div>
            <p className="text-xs text-muted-foreground mt-1">Sudah TTD</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Aktif</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.aktif}</div>
            <p className="text-xs text-muted-foreground mt-1">Sedang berjalan</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Filter Kontrak</CardTitle>
              <CardDescription>Cari dan filter kontrak penelitian</CardDescription>
            </div>
            {hasActiveFilters && (
              <Button variant="outline" size="sm" onClick={handleClearFilters}>
                <X className="h-4 w-4 mr-2" />
                Clear Filters
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="flex-1">
              <SearchInput
                placeholder="Cari nomor kontrak, SK, judul proposal, atau nama dosen..."
                value={search}
                onChange={setSearch}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                onClear={() => setCurrentPage(1)}
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Semua Status</SelectItem>
                <SelectItem value="DRAFT">Draft</SelectItem>
                <SelectItem value="SIGNED">Ditandatangani</SelectItem>
                <SelectItem value="AKTIF">Aktif</SelectItem>
                <SelectItem value="SELESAI">Selesai</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={handleSearch}>
              <Filter className="h-4 w-4 mr-2" />
              Cari
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle>Daftar Kontrak</CardTitle>
          <CardDescription>
            {kontrakList.length} kontrak ditemukan
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
              <span className="ml-2 text-muted-foreground">Memuat data...</span>
            </div>
          ) : kontrakList.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">Belum ada kontrak</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nomor Kontrak & SK</TableHead>
                  <TableHead>Proposal</TableHead>
                  <TableHead>Ketua</TableHead>
                  <TableHead>Dana</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Tanggal</TableHead>
                  <TableHead className="text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {currentItems.map((kontrak) => (
                  <TableRow key={kontrak.id}>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="font-medium text-sm">{kontrak.nomorKontrak}</div>
                        <div className="text-xs text-muted-foreground">{kontrak.nomorSK}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="max-w-xs">
                        <div className="font-medium text-sm truncate">{kontrak.proposal.judul}</div>
                        <div className="text-xs text-muted-foreground">
                          {kontrak.proposal.skema.nama} - {kontrak.proposal.periode.nama}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="font-medium text-sm">{kontrak.proposal.dosen.nama}</div>
                        <div className="text-xs text-muted-foreground">{kontrak.proposal.dosen.nidn}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium text-sm">
                        {formatRupiah(kontrak.proposal.danaDisetujui || 0)}
                      </div>
                    </TableCell>
                    <TableCell>{getStatusBadge(kontrak.status)}</TableCell>
                    <TableCell>
                      <div className="text-sm">{formatDate(kontrak.tanggalKontrak)}</div>
                      {kontrak.uploadedAt && (
                        <div className="text-xs text-muted-foreground">
                          TTD: {formatDate(kontrak.uploadedAt)}
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => router.push(`/admin/kontrak/${kontrak.id}`)}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        Detail
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}

          {/* Pagination Controls */}
          {!loading && kontrakList.length > 0 && (
            <div className="flex items-center justify-between mt-4 pt-4 border-t">
              <div className="text-sm text-muted-foreground">
                Menampilkan {indexOfFirstItem + 1}-{Math.min(indexOfLastItem, totalItems)} dari {totalItems} kontrak
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => goToPage(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>
                
                {/* Page Numbers */}
                <div className="flex gap-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                    // Show first page, last page, current page, and pages around current
                    if (
                      page === 1 ||
                      page === totalPages ||
                      (page >= currentPage - 1 && page <= currentPage + 1)
                    ) {
                      return (
                        <Button
                          key={page}
                          variant={currentPage === page ? "default" : "outline"}
                          size="sm"
                          onClick={() => goToPage(page)}
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
                  onClick={() => goToPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
      </div>
    </DashboardLayout>
  )
}
