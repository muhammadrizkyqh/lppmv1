"use client";

import DashboardLayout from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Search,
  Filter,
  Plus,
  FileText,
  Calendar,
  DollarSign,
  Eye,
  Edit,
  Download,
  Clock,
  CheckCircle,
  AlertCircle,
  XCircle,
  MoreVertical
} from "lucide-react";
import { SearchFilter, PROPOSAL_FILTERS } from "@/components/ui/search-filter";
import { NoProposalsFound, NoSearchResults } from "@/components/ui/empty-states";
import { toast } from "sonner";
import { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function ProposalsPage() {
  const [searchValue, setSearchValue] = useState("");
  const [activeFilters, setActiveFilters] = useState<Record<string, any>>({});

  const handleFilterChange = (key: string, value: any) => {
    setActiveFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleClearFilters = () => {
    setActiveFilters({});
    setSearchValue("");
  };

  const handleViewProposal = (id: string) => {
    toast.success(`Membuka proposal ${id}`, {
      description: "Redirecting to proposal detail..."
    });
  };

  const handleEditProposal = (id: string) => {
    toast.info(`Edit proposal ${id}`, {
      description: "Redirecting to edit form..."
    });
  };

  const handleDeleteProposal = (id: string) => {
    toast.success(`Proposal ${id} berhasil dihapus`, {
      description: "Data proposal telah dihapus dari sistem"
    });
  };

  // Mock data
  const proposals = [
    {
      id: "P-2025-001",
      title: "Pengembangan Aplikasi Mobile untuk Pembelajaran Al-Quran Berbasis Gamifikasi",
      skema: "Penelitian Terapan",
      status: "review",
      progress: 60,
      tanggalPengajuan: "2025-02-15",
      tanggalDeadline: "2025-03-15",
      dana: 5000000,
      bidangKeahlian: "Pendidikan Agama Islam",
      anggota: 3,
      reviewer: ["Dr. Ahmad", "Dr. Siti"]
    },
    {
      id: "P-2025-002",
      title: "Implementasi Machine Learning dalam Analisis Sentiment Hadits Sahih Bukhari",
      skema: "Penelitian Dasar",
      status: "diterima",
      progress: 85,
      tanggalPengajuan: "2025-01-20",
      tanggalDeadline: "2025-04-20",
      dana: 5000000,
      bidangKeahlian: "Teknologi Informasi",
      anggota: 2,
      reviewer: ["Dr. Budi", "Dr. Citra"]
    },
    {
      id: "P-2025-003",
      title: "Pelatihan Digital Marketing untuk UMKM Berbasis Ekonomi Syariah",
      skema: "PKM",
      status: "monitoring",
      progress: 40,
      tanggalPengajuan: "2025-01-10",
      tanggalDeadline: "2025-05-10",
      dana: 3000000,
      bidangKeahlian: "Hukum Ekonomi Syariah",
      anggota: 4,
      reviewer: ["Dr. Eko", "Dr. Fitri"]
    },
    {
      id: "P-2025-004",
      title: "Analisis Dampak Pembelajaran Daring terhadap Prestasi Mahasiswa STAI Ali",
      skema: "Penelitian Mandiri",
      status: "revisi",
      progress: 25,
      tanggalPengajuan: "2025-02-01",
      tanggalDeadline: "2025-03-20",
      dana: 0,
      bidangKeahlian: "Manajemen Pendidikan Islam",
      anggota: 2,
      reviewer: ["Dr. Hadi", "Dr. Indira"]
    },
    {
      id: "P-2025-005",
      title: "Pengembangan Kurikulum Bahasa Arab Berbasis Pendekatan Komunikatif",
      skema: "Penelitian Pengembangan",
      status: "ditolak",
      progress: 0,
      tanggalPengajuan: "2025-01-25",
      tanggalDeadline: "-",
      dana: 7000000,
      bidangKeahlian: "Pendidikan Bahasa Arab",
      anggota: 3,
      reviewer: ["Dr. Joko", "Dr. Kartika"]
    }
  ];

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      draft: { label: "Draft", variant: "secondary" as const, icon: FileText, className: "" },
      diajukan: { label: "Diajukan", variant: "outline" as const, icon: Clock, className: "" },
      review: { label: "Review", variant: "outline" as const, icon: Clock, className: "text-orange-600 border-orange-200" },
      revisi: { label: "Revisi", variant: "outline" as const, icon: AlertCircle, className: "text-yellow-600 border-yellow-200" },
      diterima: { label: "Diterima", variant: "outline" as const, icon: CheckCircle, className: "text-green-600 border-green-200" },
      ditolak: { label: "Ditolak", variant: "outline" as const, icon: XCircle, className: "text-red-600 border-red-200" },
      monitoring: { label: "Monitoring", variant: "outline" as const, icon: Clock, className: "text-blue-600 border-blue-200" },
      selesai: { label: "Selesai", variant: "default" as const, icon: CheckCircle, className: "" }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.draft;
    const Icon = config.icon;

    return (
      <Badge variant={config.variant} className={config.className}>
        <Icon className="w-3 h-3 mr-1" />
        {config.label}
      </Badge>
    );
  };

  const getProgressColor = (status: string, progress: number) => {
    if (status === "ditolak") return "bg-red-500";
    if (status === "diterima" && progress > 80) return "bg-green-500";
    if (status === "monitoring") return "bg-blue-500";
    return "bg-primary";
  };

  const stats = [
    { label: "Total Proposal", value: proposals.length, icon: FileText },
    { label: "Dalam Review", value: proposals.filter(p => p.status === "review").length, icon: Clock },
    { label: "Diterima", value: proposals.filter(p => p.status === "diterima").length, icon: CheckCircle },
    { label: "Total Dana", value: `Rp ${proposals.reduce((sum, p) => sum + (p.status === "diterima" ? p.dana : 0), 0).toLocaleString('id-ID')}`, icon: DollarSign }
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Proposal Penelitian</h1>
            <p className="text-muted-foreground mt-2">
              Kelola dan pantau semua proposal penelitian dan PKM Anda
            </p>
          </div>
          <Button className="bg-gradient-to-r from-primary to-primary/90">
            <Plus className="w-4 h-4 mr-2" />
            Ajukan Proposal Baru
          </Button>
        </div>

        {/* Search & Filter */}
        <SearchFilter
          searchValue={searchValue}
          onSearchChange={setSearchValue}
          filters={PROPOSAL_FILTERS}
          activeFilters={activeFilters}
          onFilterChange={handleFilterChange}
          onClearFilters={handleClearFilters}
          placeholder="Cari proposal..."
        />

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          {stats.map((stat, index) => (
            <Card key={index} className="border-0 shadow-sm">
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <stat.icon className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                    <p className="text-xl font-bold">{stat.value}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Filters and Search */}
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    placeholder="Cari proposal berdasarkan judul, kode, atau bidang keahlian..."
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Select>
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Semua Status</SelectItem>
                    <SelectItem value="review">Review</SelectItem>
                    <SelectItem value="diterima">Diterima</SelectItem>
                    <SelectItem value="monitoring">Monitoring</SelectItem>
                  </SelectContent>
                </Select>
                <Select>
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="Skema" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Semua Skema</SelectItem>
                    <SelectItem value="dasar">Penelitian Dasar</SelectItem>
                    <SelectItem value="terapan">Penelitian Terapan</SelectItem>
                    <SelectItem value="pkm">PKM</SelectItem>
                  </SelectContent>
                </Select>
                <Button variant="outline" size="sm">
                  <Filter className="w-4 h-4 mr-2" />
                  Filter
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Proposals Tabs */}
        <Tabs defaultValue="all" className="space-y-4">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="all">Semua ({proposals.length})</TabsTrigger>
            <TabsTrigger value="review">Review ({proposals.filter(p => p.status === "review").length})</TabsTrigger>
            <TabsTrigger value="diterima">Diterima ({proposals.filter(p => p.status === "diterima").length})</TabsTrigger>
            <TabsTrigger value="monitoring">Monitoring ({proposals.filter(p => p.status === "monitoring").length})</TabsTrigger>
            <TabsTrigger value="revisi">Revisi ({proposals.filter(p => p.status === "revisi").length})</TabsTrigger>
            <TabsTrigger value="selesai">Selesai ({proposals.filter(p => p.status === "selesai").length})</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-4">
            {proposals.map((proposal) => (
              <Card key={proposal.id} className="border-0 shadow-sm hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="font-semibold text-lg text-foreground line-clamp-1">
                          {proposal.title}
                        </h3>
                        {getStatusBadge(proposal.status)}
                      </div>
                      <div className="flex items-center space-x-4 text-sm text-muted-foreground mb-3">
                        <span className="font-medium text-primary">{proposal.id}</span>
                        <span>•</span>
                        <span>{proposal.skema}</span>
                        <span>•</span>
                        <span>{proposal.bidangKeahlian}</span>
                        <span>•</span>
                        <span>{proposal.anggota} anggota</span>
                      </div>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => handleViewProposal(proposal.id)}>
                          <Eye className="mr-2 h-4 w-4" />
                          Lihat Detail
                        </DropdownMenuItem>
                        {proposal.status === "draft" && (
                          <DropdownMenuItem onClick={() => handleEditProposal(proposal.id)}>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit Proposal
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem onClick={() => toast.success(`Download PDF ${proposal.id}`, {
                          description: "File sedang didownload..."
                        })}>
                          <Download className="mr-2 h-4 w-4" />
                          Download PDF
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  <div className="grid gap-4 md:grid-cols-4 mb-4">
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground">Tanggal Pengajuan</p>
                      <p className="text-sm font-medium">
                        {new Date(proposal.tanggalPengajuan).toLocaleDateString('id-ID')}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground">Deadline</p>
                      <p className="text-sm font-medium">
                        {proposal.tanggalDeadline !== "-" 
                          ? new Date(proposal.tanggalDeadline).toLocaleDateString('id-ID')
                          : "-"
                        }
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground">Dana Hibah</p>
                      <p className="text-sm font-medium">
                        {proposal.dana > 0 ? `Rp ${proposal.dana.toLocaleString('id-ID')}` : "Mandiri"}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground">Progress</p>
                      <div className="flex items-center space-x-2">
                        <Progress 
                          value={proposal.progress} 
                          className="flex-1 h-2"
                        />
                        <span className="text-sm font-medium">{proposal.progress}%</span>
                      </div>
                    </div>
                  </div>

                  {proposal.status === "review" && (
                    <div className="flex items-center justify-between p-3 bg-orange-50 border border-orange-200 rounded-lg">
                      <div className="flex items-center space-x-2">
                        <Clock className="w-4 h-4 text-orange-600" />
                        <span className="text-sm text-orange-800">
                          Sedang direview oleh: {proposal.reviewer.join(", ")}
                        </span>
                      </div>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="text-orange-700 border-orange-300"
                        onClick={() => handleViewProposal(proposal.id)}
                      >
                        Lihat Progress
                      </Button>
                    </div>
                  )}

                  {proposal.status === "revisi" && (
                    <div className="flex items-center justify-between p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <div className="flex items-center space-x-2">
                        <AlertCircle className="w-4 h-4 text-yellow-600" />
                        <span className="text-sm text-yellow-800">
                          Perlu revisi berdasarkan feedback reviewer
                        </span>
                      </div>
                      <Button 
                        size="sm" 
                        className="bg-yellow-600 hover:bg-yellow-700"
                        onClick={() => toast.info(`Upload revisi untuk ${proposal.id}`, {
                          description: "Membuka form upload revisi..."
                        })}
                      >
                        Upload Revisi
                      </Button>
                    </div>
                  )}

                  {proposal.status === "diterima" && (
                    <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                      <div className="flex items-center space-x-2">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                        <span className="text-sm text-green-800">
                          Proposal telah diterima dan dapat dilaksanakan
                        </span>
                      </div>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="text-green-700 border-green-300"
                        onClick={() => toast.success(`Membuka kontrak ${proposal.id}`, {
                          description: "Downloading kontrak penelitian..."
                        })}
                      >
                        Lihat Kontrak
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          {/* Other tab contents would be similar but filtered by status */}
          <TabsContent value="review">
            <div className="text-center py-12">
              <Clock className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">Proposal dalam Review</h3>
              <p className="text-muted-foreground">
                Menampilkan proposal yang sedang dalam proses review
              </p>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}