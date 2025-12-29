"use client";

import DashboardLayout from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ResponsiveTabs } from "@/components/ui/responsive-tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Search,
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
  MoreVertical,
  Trash2
} from "lucide-react";
import { SearchFilter } from "@/components/ui/search-filter";
import { NoProposalsFound, NoSearchResults } from "@/components/ui/empty-states";
import { toast } from "sonner";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useProposals } from "@/hooks/use-data";
import { proposalApi, ProposalStatus } from "@/lib/api-client";

export default function ProposalsPage() {
  const router = useRouter();
  const [searchValue, setSearchValue] = useState("");
  const [activeFilters, setActiveFilters] = useState<Record<string, any>>({});
  const [skemaOptions, setSkemaOptions] = useState<Array<{ value: string; label: string }>>([]);
  const [periodeOptions, setPeriodeOptions] = useState<Array<{ value: string; label: string }>>([]);
  const [bidangKeahlianOptions, setBidangKeahlianOptions] = useState<Array<{ value: string; label: string }>>([]);
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; id: string | null; title: string | null }>({
    open: false,
    id: null,
    title: null,
  });
  const [deleting, setDeleting] = useState(false);
  const [submitDialog, setSubmitDialog] = useState<{
    open: boolean;
    id: string | null;
    title: string | null;
  }>({
    open: false,
    id: null,
    title: null,
  });
  const [submitting, setSubmitting] = useState(false);

  // Fetch proposals from backend
  const { data: proposalsData, loading, refetch } = useProposals();

  // Fetch master data for filters
  useEffect(() => {
    const fetchMasterData = async () => {
      try {
        // Fetch Skema
        const skemaRes = await fetch('/api/skema');
        const skemaData = await skemaRes.json();
        if (skemaData.success) {
          setSkemaOptions([
            { value: 'all', label: 'Semua Skema' },
            ...skemaData.data.map((s: any) => ({ value: s.id, label: s.nama }))
          ]);
        }

        // Fetch Periode
        const periodeRes = await fetch('/api/periode');
        const periodeData = await periodeRes.json();
        if (periodeData.success) {
          setPeriodeOptions([
            { value: 'all', label: 'Semua Periode' },
            ...periodeData.data.map((p: any) => ({ value: p.id, label: `${p.nama} ${p.tahun}` }))
          ]);
        }

        // Fetch Bidang Keahlian
        const bidangRes = await fetch('/api/bidang-keahlian');
        const bidangData = await bidangRes.json();
        if (bidangData.success) {
          setBidangKeahlianOptions([
            { value: 'all', label: 'Semua Bidang' },
            ...bidangData.data.map((b: any) => ({ value: b.id, label: b.nama }))
          ]);
        }
      } catch (error) {
        console.error('Failed to fetch master data:', error);
      }
    };

    fetchMasterData();
  }, []);

  const handleFilterChange = (key: string, value: any) => {
    setActiveFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleClearFilters = () => {
    setActiveFilters({});
    setSearchValue("");
  };

  const handleViewProposal = (id: string) => {
    router.push(`/admin/proposals/${id}`);
  };

  const handleEditProposal = (id: string) => {
    router.push(`/admin/proposals/${id}/edit`);
  };

  const handleDeleteProposal = async () => {
    if (!deleteDialog.id) return;
    
    setDeleting(true);
    try {
      const result = await proposalApi.delete(deleteDialog.id);
      if (result.success) {
        toast.success("Proposal berhasil dihapus!");
        refetch();
        setDeleteDialog({ open: false, id: null, title: null });
      } else {
        toast.error(result.error || "Gagal menghapus proposal");
      }
    } catch (error: any) {
      toast.error(error.message || "Gagal menghapus proposal");
    } finally {
      setDeleting(false);
    }
  };

  const handleDownloadProposal = (filePath: string | null) => {
    if (!filePath) {
      toast.error("File proposal tidak tersedia");
      return;
    }
    window.open(filePath, '_blank');
  };

  const handleSubmitProposal = async () => {
    if (!submitDialog.id) return;
    
    setSubmitting(true);
    try {
      const result = await proposalApi.submit(submitDialog.id);
      if (result.success) {
        toast.success("Proposal berhasil diajukan!");
        refetch();
        setSubmitDialog({ open: false, id: null, title: null });
      } else {
        toast.error(result.error || "Gagal submit proposal");
      }
    } catch (error: any) {
      toast.error(error.message || "Gagal submit proposal");
    } finally {
      setSubmitting(false);
    }
  };

  // Convert backend data to UI format
  const proposals = proposalsData?.map(p => ({
    id: p.id,
    title: p.judul,
    skema: p.skema?.nama || "-",
    skemaId: p.skemaId,
    status: p.status.toLowerCase(),
    progress: 0, // Could be calculated based on status
    tanggalPengajuan: p.createdAt || new Date().toISOString(),
    tanggalDeadline: p.periode?.tanggalTutup || null, // From periode close date
    dana: Number(p.danaDisetujui || 0), // Dana yang sudah disetujui admin
    bidangKeahlian: p.bidangkeahlian?.nama || "-",
    bidangKeahlianId: p.bidangKeahlianId,
    periode: p.periode?.nama ? `${p.periode.nama} ${p.periode.tahun}` : "-",
    periodeId: p.periodeId,
    dosenNama: p.dosen?.nama || "-",
    anggota: p._count?.proposalmember || 0,
    reviewer: [], // Would come from reviews relation
    _original: p // Keep original data for actions
  })) || [];

  // Apply filters
  const filteredProposals = proposals.filter(proposal => {
    // Search filter
    if (searchValue) {
      const searchLower = searchValue.toLowerCase();
      const matchesSearch = 
        proposal.title.toLowerCase().includes(searchLower) ||
        proposal.dosenNama.toLowerCase().includes(searchLower) ||
        proposal.bidangKeahlian.toLowerCase().includes(searchLower);
      
      if (!matchesSearch) return false;
    }

    // Status filter
    if (activeFilters.status && activeFilters.status !== 'all') {
      if (proposal.status !== activeFilters.status) return false;
    }

    // Skema filter
    if (activeFilters.skema && activeFilters.skema !== 'all') {
      if (proposal.skemaId !== activeFilters.skema) return false;
    }

    // Periode filter
    if (activeFilters.periode && activeFilters.periode !== 'all') {
      if (proposal.periodeId !== activeFilters.periode) return false;
    }

    // Bidang Keahlian filter
    if (activeFilters.bidangKeahlian && activeFilters.bidangKeahlian !== 'all') {
      if (proposal.bidangKeahlianId !== activeFilters.bidangKeahlian) return false;
    }

    return true;
  });

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
    { label: "Total Proposal", value: filteredProposals.length, icon: FileText },
    { label: "Dalam Review", value: filteredProposals.filter(p => p.status === "review" || p.status === "direview").length, icon: Clock },
    { label: "Diterima", value: filteredProposals.filter(p => p.status === "diterima").length, icon: CheckCircle },
    { label: "Total Dana", value: `Rp ${filteredProposals.reduce((sum, p) => sum + (p.status === "diterima" ? p.dana : 0), 0).toLocaleString('id-ID')}`, icon: DollarSign }
  ];

  // Dynamic filter configuration
  const proposalFilters = [
    {
      key: "status",
      label: "Status",
      type: "select" as const,
      options: [
        { value: "all", label: "Semua Status" },
        { value: "draft", label: "Draft" },
        { value: "diajukan", label: "Diajukan" },
        { value: "direview", label: "Direview" },
        { value: "revisi", label: "Revisi" },
        { value: "diterima", label: "Diterima" },
        { value: "ditolak", label: "Ditolak" },
        { value: "berjalan", label: "Berjalan" },
        { value: "selesai", label: "Selesai" },
      ]
    },
    {
      key: "skema",
      label: "Skema",
      type: "select" as const,
      options: skemaOptions
    },
    {
      key: "periode",
      label: "Periode",
      type: "select" as const,
      options: periodeOptions
    },
    {
      key: "bidangKeahlian",
      label: "Bidang Keahlian",
      type: "select" as const,
      options: bidangKeahlianOptions
    }
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-foreground">Proposal Penelitian</h1>
          <p className="text-muted-foreground mt-2">
            Kelola dan pantau semua proposal penelitian dan PKM
          </p>
        </div>

        {/* Search & Filter */}
        <SearchFilter
          searchValue={searchValue}
          onSearchChange={setSearchValue}
          filters={proposalFilters}
          activeFilters={activeFilters}
          onFilterChange={handleFilterChange}
          onClearFilters={handleClearFilters}
          placeholder="Cari proposal berdasarkan judul, dosen, atau bidang keahlian..."
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

        {/* Proposals Tabs */}
        <ResponsiveTabs
          defaultValue="all"
          tabs={[
            { value: 'all', label: 'Semua', icon: <FileText className="h-4 w-4" />, count: filteredProposals.length },
            { value: 'review', label: 'Review', icon: <Clock className="h-4 w-4" />, count: filteredProposals.filter(p => p.status === "review" || p.status === "direview").length },
            { value: 'diterima', label: 'Diterima', icon: <CheckCircle className="h-4 w-4" />, count: filteredProposals.filter(p => p.status === "diterima").length },
            { value: 'monitoring', label: 'Monitoring', icon: <AlertCircle className="h-4 w-4" />, count: filteredProposals.filter(p => p.status === "monitoring" || p.status === "berjalan").length },
            { value: 'revisi', label: 'Revisi', icon: <Edit className="h-4 w-4" />, count: filteredProposals.filter(p => p.status === "revisi").length },
            { value: 'selesai', label: 'Selesai', icon: <CheckCircle className="h-4 w-4" />, count: filteredProposals.filter(p => p.status === "selesai").length },
          ]}
        >

          <TabsContent value="all" className="space-y-4">
            {loading ? (
              <Card className="border-0 shadow-sm">
                <CardContent className="p-12 text-center">
                  <div className="flex flex-col items-center gap-2">
                    <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
                    <p className="text-muted-foreground">Memuat data proposal...</p>
                  </div>
                </CardContent>
              </Card>
            ) : filteredProposals.length === 0 ? (
              <Card className="border-0 shadow-sm">
                <CardContent className="p-12 text-center">
                  <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">
                    {searchValue || Object.values(activeFilters).some(v => v && v !== 'all') 
                      ? 'Tidak ada proposal yang sesuai' 
                      : 'Belum ada proposal'}
                  </h3>
                  <p className="text-muted-foreground">
                    {searchValue || Object.values(activeFilters).some(v => v && v !== 'all')
                      ? 'Coba ubah filter atau kata kunci pencarian'
                      : 'Proposal akan muncul setelah dosen mengajukan'}
                  </p>
                </CardContent>
              </Card>
            ) : (
              filteredProposals.map((proposal) => (
              <Card key={proposal.id} className="border-0 shadow-sm hover:shadow-md transition-shadow">
                <CardContent className="p-4 md:p-6">
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-2">
                        <h3 className="font-semibold text-base md:text-lg text-foreground line-clamp-2 break-words">
                          {proposal.title}
                        </h3>
                        <div className="shrink-0">
                          {getStatusBadge(proposal.status)}
                        </div>
                      </div>
                      <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs md:text-sm text-muted-foreground mb-3">
                        <span className="truncate">{proposal.skema}</span>
                        <span className="hidden sm:inline">•</span>
                        <span className="truncate">{proposal.bidangKeahlian}</span>
                        <span className="hidden sm:inline">•</span>
                        <span className="shrink-0">{proposal.anggota} anggota</span>
                      </div>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="shrink-0">
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
                        {proposal._original?.filePath && (
                          <DropdownMenuItem onClick={() => handleDownloadProposal(proposal._original.filePath)}>
                            <Download className="mr-2 h-4 w-4" />
                            Download PDF
                          </DropdownMenuItem>
                        )}
                        {proposal.status === "draft" && (
                          <>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              onClick={() => setDeleteDialog({ open: true, id: proposal.id, title: proposal.title })}
                              className="text-red-600"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Hapus
                            </DropdownMenuItem>
                          </>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  <div className="grid gap-3 sm:gap-4 grid-cols-2 md:grid-cols-4 mb-4">
                    <div className="space-y-1 min-w-0">
                      <p className="text-xs text-muted-foreground">Tanggal Pengajuan</p>
                      <p className="text-sm font-medium truncate">
                        {new Date(proposal.tanggalPengajuan).toLocaleDateString('id-ID')}
                      </p>
                    </div>
                    <div className="space-y-1 min-w-0">
                      <p className="text-xs text-muted-foreground">Deadline Periode</p>
                      <p className="text-sm font-medium truncate">
                        {proposal.tanggalDeadline
                          ? new Date(proposal.tanggalDeadline).toLocaleDateString('id-ID')
                          : "Belum ditentukan"
                        }
                      </p>
                    </div>
                    <div className="space-y-1 min-w-0">
                      <p className="text-xs text-muted-foreground">Dana Disetujui</p>
                      <p className="text-sm font-medium truncate">
                        {['diterima', 'berjalan', 'selesai'].includes(proposal.status) && proposal.dana > 0
                          ? `Rp ${proposal.dana.toLocaleString('id-ID')}`
                          : "-"
                        }
                      </p>
                    </div>
                    <div className="space-y-1 min-w-0">
                      <p className="text-xs text-muted-foreground">Progress</p>
                      <div className="flex items-center space-x-2">
                        <Progress 
                          value={proposal.progress} 
                          className="flex-1 h-2 min-w-0"
                        />
                        <span className="text-sm font-medium shrink-0">{proposal.progress}%</span>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons Row */}
                  <div className="flex flex-wrap gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleViewProposal(proposal.id)}
                      className="flex-1 sm:flex-none"
                    >
                      <Eye className="w-4 h-4 sm:mr-2" />
                      <span className="hidden sm:inline">Lihat Detail</span>
                    </Button>
                    {proposal._original?.filePath ? (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDownloadProposal(proposal._original.filePath)}
                        className="text-blue-600 border-blue-300 hover:bg-blue-50 flex-1 sm:flex-none"
                      >
                        <Download className="w-4 h-4 sm:mr-2" />
                        <span className="hidden sm:inline">Download PDF</span>
                      </Button>
                    ) : (
                      <Button
                        variant="outline"
                        size="sm"
                        disabled
                        className="text-gray-400 flex-1 sm:flex-none"
                      >
                        <FileText className="w-4 h-4 sm:mr-2" />
                        <span className="hidden sm:inline">File Belum Ada</span>
                      </Button>
                    )}
                    {proposal.status === "draft" && (
                      <>
                        {proposal._original?.filePath && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSubmitDialog({ open: true, id: proposal.id, title: proposal.title })}
                            className="text-green-600 border-green-300 hover:bg-green-50 flex-1 sm:flex-none"
                          >
                            <CheckCircle className="w-4 h-4 sm:mr-2" />
                            <span className="hidden sm:inline">Submit Proposal</span>
                          </Button>
                        )}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditProposal(proposal.id)}
                          className="flex-1 sm:flex-none"
                        >
                          <Edit className="w-4 h-4 sm:mr-2" />
                          <span className="hidden sm:inline">Edit</span>
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setDeleteDialog({ open: true, id: proposal.id, title: proposal.title })}
                          className="text-red-600 border-red-300 hover:bg-red-50 flex-1 sm:flex-none"
                        >
                          <Trash2 className="w-4 h-4 sm:mr-2" />
                          <span className="hidden sm:inline">Hapus</span>
                        </Button>
                      </>
                    )}
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
                        onClick={async () => {
                          try {
                            const response = await fetch(`/api/kontrak/proposal/${proposal.id}`, {
                              credentials: "include"
                            });
                            const result = await response.json();
                            
                            if (result.success && result.data) {
                              router.push(`/admin/kontrak/${result.data.id}`);
                            } else {
                              toast.error(result.error || "Kontrak belum dibuat");
                            }
                          } catch (error) {
                            toast.error("Gagal memuat kontrak");
                          }
                        }}
                      >
                        Lihat Kontrak
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
          )}
          </TabsContent>

          {/* Review Tab */}
          <TabsContent value="review" className="space-y-4">
            {filteredProposals.filter(p => p.status === "review" || p.status === "direview").length === 0 ? (
              <Card className="border-0 shadow-sm">
                <CardContent className="p-12 text-center">
                  <Clock className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Tidak ada proposal dalam review</h3>
                  <p className="text-muted-foreground">
                    Proposal yang sedang direview akan muncul di sini
                  </p>
                </CardContent>
              </Card>
            ) : (
              filteredProposals.filter(p => p.status === "review" || p.status === "direview").map((proposal) => (
                <Card key={proposal.id} className="border-0 shadow-sm hover:shadow-md transition-shadow">
                  <CardContent className="p-4 md:p-6">
                    <div className="flex items-start justify-between gap-3 mb-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-2">
                          <h3 className="font-semibold text-base md:text-lg text-foreground line-clamp-2 break-words">
                            {proposal.title}
                          </h3>
                          <div className="shrink-0">
                            {getStatusBadge(proposal.status)}
                          </div>
                        </div>
                        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs md:text-sm text-muted-foreground mb-3">
                          <span className="truncate">{proposal.skema}</span>
                          <span className="hidden sm:inline">•</span>
                          <span className="truncate">{proposal.bidangKeahlian}</span>
                          <span className="hidden sm:inline">•</span>
                          <span className="shrink-0">{proposal.anggota} anggota</span>
                        </div>
                      </div>
                    </div>

                    <div className="grid gap-3 sm:gap-4 grid-cols-2 md:grid-cols-4 mb-4">
                      <div className="space-y-1 min-w-0">
                        <p className="text-xs text-muted-foreground">Tanggal Pengajuan</p>
                        <p className="text-sm font-medium truncate">
                          {new Date(proposal.tanggalPengajuan).toLocaleDateString('id-ID')}
                        </p>
                      </div>
                      <div className="space-y-1 min-w-0">
                        <p className="text-xs text-muted-foreground">Deadline Periode</p>
                        <p className="text-sm font-medium truncate">
                          {proposal.tanggalDeadline
                            ? new Date(proposal.tanggalDeadline).toLocaleDateString('id-ID')
                            : "Belum ditentukan"
                          }
                        </p>
                      </div>
                      <div className="space-y-1 min-w-0">
                        <p className="text-xs text-muted-foreground">Dana Disetujui</p>
                        <p className="text-sm font-medium truncate">
                          {['diterima', 'berjalan', 'selesai'].includes(proposal.status) && proposal.dana > 0
                            ? `Rp ${proposal.dana.toLocaleString('id-ID')}`
                            : "-"
                          }
                        </p>
                      </div>
                      <div className="space-y-1 min-w-0">
                        <p className="text-xs text-muted-foreground">Progress</p>
                        <div className="flex items-center space-x-2">
                          <Progress value={proposal.progress} className="flex-1 h-2 min-w-0" />
                          <span className="text-sm font-medium shrink-0">{proposal.progress}%</span>
                        </div>
                      </div>
                    </div>

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
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>

          {/* Diterima Tab */}
          <TabsContent value="diterima" className="space-y-4">
            {filteredProposals.filter(p => p.status === "diterima").length === 0 ? (
              <Card className="border-0 shadow-sm">
                <CardContent className="p-12 text-center">
                  <CheckCircle className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Belum ada proposal diterima</h3>
                  <p className="text-muted-foreground">
                    Proposal yang diterima akan muncul di sini
                  </p>
                </CardContent>
              </Card>
            ) : (
              filteredProposals.filter(p => p.status === "diterima").map((proposal) => (
                <Card key={proposal.id} className="border-0 shadow-sm hover:shadow-md transition-shadow">
                  <CardContent className="p-4 md:p-6">
                    <div className="flex items-start justify-between gap-3 mb-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-2">
                          <h3 className="font-semibold text-base md:text-lg text-foreground line-clamp-2 break-words">
                            {proposal.title}
                          </h3>
                          <div className="shrink-0">
                            {getStatusBadge(proposal.status)}
                          </div>
                        </div>
                        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs md:text-sm text-muted-foreground mb-3">
                          <span className="truncate">{proposal.skema}</span>
                          <span className="hidden sm:inline">•</span>
                          <span className="truncate">{proposal.bidangKeahlian}</span>
                          <span className="hidden sm:inline">•</span>
                          <span className="shrink-0">{proposal.anggota} anggota</span>
                        </div>
                      </div>
                    </div>

                    <div className="grid gap-3 sm:gap-4 grid-cols-2 md:grid-cols-4 mb-4">
                      <div className="space-y-1 min-w-0">
                        <p className="text-xs text-muted-foreground">Tanggal Pengajuan</p>
                        <p className="text-sm font-medium truncate">
                          {new Date(proposal.tanggalPengajuan).toLocaleDateString('id-ID')}
                        </p>
                      </div>
                      <div className="space-y-1 min-w-0">
                        <p className="text-xs text-muted-foreground">Deadline Periode</p>
                        <p className="text-sm font-medium truncate">
                          {proposal.tanggalDeadline
                            ? new Date(proposal.tanggalDeadline).toLocaleDateString('id-ID')
                            : "Belum ditentukan"
                          }
                        </p>
                      </div>
                      <div className="space-y-1 min-w-0">
                        <p className="text-xs text-muted-foreground">Dana Disetujui</p>
                        <p className="text-sm font-medium truncate">
                          {['diterima', 'berjalan', 'selesai'].includes(proposal.status) && proposal.dana > 0
                            ? `Rp ${proposal.dana.toLocaleString('id-ID')}`
                            : "-"
                          }
                        </p>
                      </div>
                      <div className="space-y-1 min-w-0">
                        <p className="text-xs text-muted-foreground">Progress</p>
                        <div className="flex items-center space-x-2">
                          <Progress value={proposal.progress} className="flex-1 h-2 min-w-0" />
                          <span className="text-sm font-medium shrink-0">{proposal.progress}%</span>
                        </div>
                      </div>
                    </div>

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
                        onClick={async () => {
                          try {
                            const response = await fetch(`/api/kontrak/proposal/${proposal.id}`, {
                              credentials: "include"
                            });
                            const result = await response.json();
                            
                            if (result.success && result.data) {
                              router.push(`/admin/kontrak/${result.data.id}`);
                            } else {
                              toast.error(result.error || "Kontrak belum dibuat");
                            }
                          } catch (error) {
                            toast.error("Gagal memuat kontrak");
                          }
                        }}
                      >
                        Lihat Kontrak
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>

          {/* Monitoring Tab */}
          <TabsContent value="monitoring" className="space-y-4">
            {filteredProposals.filter(p => p.status === "monitoring" || p.status === "berjalan").length === 0 ? (
              <Card className="border-0 shadow-sm">
                <CardContent className="p-12 text-center">
                  <AlertCircle className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Tidak ada proposal dalam monitoring</h3>
                  <p className="text-muted-foreground">
                    Proposal yang sedang berjalan akan muncul di sini
                  </p>
                </CardContent>
              </Card>
            ) : (
              filteredProposals.filter(p => p.status === "monitoring" || p.status === "berjalan").map((proposal) => (
                <Card key={proposal.id} className="border-0 shadow-sm hover:shadow-md transition-shadow">
                  <CardContent className="p-4 md:p-6">
                    <div className="flex items-start justify-between gap-3 mb-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-2">
                          <h3 className="font-semibold text-base md:text-lg text-foreground line-clamp-2 break-words">
                            {proposal.title}
                          </h3>
                          <div className="shrink-0">
                            {getStatusBadge(proposal.status)}
                          </div>
                        </div>
                        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs md:text-sm text-muted-foreground mb-3">
                          <span className="truncate">{proposal.skema}</span>
                          <span className="hidden sm:inline">•</span>
                          <span className="truncate">{proposal.bidangKeahlian}</span>
                          <span className="hidden sm:inline">•</span>
                          <span className="shrink-0">{proposal.anggota} anggota</span>
                        </div>
                      </div>
                    </div>

                    <div className="grid gap-3 sm:gap-4 grid-cols-2 md:grid-cols-4 mb-4">
                      <div className="space-y-1 min-w-0">
                        <p className="text-xs text-muted-foreground">Tanggal Pengajuan</p>
                        <p className="text-sm font-medium truncate">
                          {new Date(proposal.tanggalPengajuan).toLocaleDateString('id-ID')}
                        </p>
                      </div>
                      <div className="space-y-1 min-w-0">
                        <p className="text-xs text-muted-foreground">Deadline Periode</p>
                        <p className="text-sm font-medium truncate">
                          {proposal.tanggalDeadline
                            ? new Date(proposal.tanggalDeadline).toLocaleDateString('id-ID')
                            : "Belum ditentukan"
                          }
                        </p>
                      </div>
                      <div className="space-y-1 min-w-0">
                        <p className="text-xs text-muted-foreground">Dana Disetujui</p>
                        <p className="text-sm font-medium truncate">
                          {['diterima', 'berjalan', 'selesai'].includes(proposal.status) && proposal.dana > 0
                            ? `Rp ${proposal.dana.toLocaleString('id-ID')}`
                            : "-"
                          }
                        </p>
                      </div>
                      <div className="space-y-1 min-w-0">
                        <p className="text-xs text-muted-foreground">Progress</p>
                        <div className="flex items-center space-x-2">
                          <Progress value={proposal.progress} className="flex-1 h-2 min-w-0" />
                          <span className="text-sm font-medium shrink-0">{proposal.progress}%</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewProposal(proposal.id)}
                        className="flex-1 sm:flex-none"
                      >
                        <Eye className="w-4 h-4 sm:mr-2" />
                        <span className="hidden sm:inline">Lihat Detail</span>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>

          {/* Revisi Tab */}
          <TabsContent value="revisi" className="space-y-4">
            {filteredProposals.filter(p => p.status === "revisi").length === 0 ? (
              <Card className="border-0 shadow-sm">
                <CardContent className="p-12 text-center">
                  <AlertCircle className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Tidak ada proposal perlu revisi</h3>
                  <p className="text-muted-foreground">
                    Proposal yang memerlukan revisi akan muncul di sini
                  </p>
                </CardContent>
              </Card>
            ) : (
              filteredProposals.filter(p => p.status === "revisi").map((proposal) => (
                <Card key={proposal.id} className="border-0 shadow-sm hover:shadow-md transition-shadow">
                  <CardContent className="p-4 md:p-6">
                    <div className="flex items-start justify-between gap-3 mb-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-2">
                          <h3 className="font-semibold text-base md:text-lg text-foreground line-clamp-2 break-words">
                            {proposal.title}
                          </h3>
                          <div className="shrink-0">
                            {getStatusBadge(proposal.status)}
                          </div>
                        </div>
                        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs md:text-sm text-muted-foreground mb-3">
                          <span className="truncate">{proposal.skema}</span>
                          <span className="hidden sm:inline">•</span>
                          <span className="truncate">{proposal.bidangKeahlian}</span>
                          <span className="hidden sm:inline">•</span>
                          <span className="shrink-0">{proposal.anggota} anggota</span>
                        </div>
                      </div>
                    </div>

                    <div className="grid gap-3 sm:gap-4 grid-cols-2 md:grid-cols-4 mb-4">
                      <div className="space-y-1 min-w-0">
                        <p className="text-xs text-muted-foreground">Tanggal Pengajuan</p>
                        <p className="text-sm font-medium truncate">
                          {new Date(proposal.tanggalPengajuan).toLocaleDateString('id-ID')}
                        </p>
                      </div>
                      <div className="space-y-1 min-w-0">
                        <p className="text-xs text-muted-foreground">Deadline Periode</p>
                        <p className="text-sm font-medium truncate">
                          {proposal.tanggalDeadline
                            ? new Date(proposal.tanggalDeadline).toLocaleDateString('id-ID')
                            : "Belum ditentukan"
                          }
                        </p>
                      </div>
                      <div className="space-y-1 min-w-0">
                        <p className="text-xs text-muted-foreground">Dana Disetujui</p>
                        <p className="text-sm font-medium truncate">
                          {['diterima', 'berjalan', 'selesai'].includes(proposal.status) && proposal.dana > 0
                            ? `Rp ${proposal.dana.toLocaleString('id-ID')}`
                            : "-"
                          }
                        </p>
                      </div>
                      <div className="space-y-1 min-w-0">
                        <p className="text-xs text-muted-foreground">Progress</p>
                        <div className="flex items-center space-x-2">
                          <Progress value={proposal.progress} className="flex-1 h-2 min-w-0" />
                          <span className="text-sm font-medium shrink-0">{proposal.progress}%</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewProposal(proposal.id)}
                        className="flex-1 sm:flex-none"
                      >
                        <Eye className="w-4 h-4 sm:mr-2" />
                        <span className="hidden sm:inline">Lihat Detail</span>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>

          {/* Selesai Tab */}
          <TabsContent value="selesai" className="space-y-4">
            {filteredProposals.filter(p => p.status === "selesai").length === 0 ? (
              <Card className="border-0 shadow-sm">
                <CardContent className="p-12 text-center">
                  <CheckCircle className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Belum ada proposal selesai</h3>
                  <p className="text-muted-foreground">
                    Proposal yang sudah selesai akan muncul di sini
                  </p>
                </CardContent>
              </Card>
            ) : (
              filteredProposals.filter(p => p.status === "selesai").map((proposal) => (
                <Card key={proposal.id} className="border-0 shadow-sm hover:shadow-md transition-shadow">
                  <CardContent className="p-4 md:p-6">
                    <div className="flex items-start justify-between gap-3 mb-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-2">
                          <h3 className="font-semibold text-base md:text-lg text-foreground line-clamp-2 break-words">
                            {proposal.title}
                          </h3>
                          <div className="shrink-0">
                            {getStatusBadge(proposal.status)}
                          </div>
                        </div>
                        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs md:text-sm text-muted-foreground mb-3">
                          <span className="truncate">{proposal.skema}</span>
                          <span className="hidden sm:inline">•</span>
                          <span className="truncate">{proposal.bidangKeahlian}</span>
                          <span className="hidden sm:inline">•</span>
                          <span className="shrink-0">{proposal.anggota} anggota</span>
                        </div>
                      </div>
                    </div>

                    <div className="grid gap-3 sm:gap-4 grid-cols-2 md:grid-cols-4 mb-4">
                      <div className="space-y-1 min-w-0">
                        <p className="text-xs text-muted-foreground">Tanggal Pengajuan</p>
                        <p className="text-sm font-medium truncate">
                          {new Date(proposal.tanggalPengajuan).toLocaleDateString('id-ID')}
                        </p>
                      </div>
                      <div className="space-y-1 min-w-0">
                        <p className="text-xs text-muted-foreground">Deadline Periode</p>
                        <p className="text-sm font-medium truncate">
                          {proposal.tanggalDeadline
                            ? new Date(proposal.tanggalDeadline).toLocaleDateString('id-ID')
                            : "Belum ditentukan"
                          }
                        </p>
                      </div>
                      <div className="space-y-1 min-w-0">
                        <p className="text-xs text-muted-foreground">Dana Disetujui</p>
                        <p className="text-sm font-medium truncate">
                          {['diterima', 'berjalan', 'selesai'].includes(proposal.status) && proposal.dana > 0
                            ? `Rp ${proposal.dana.toLocaleString('id-ID')}`
                            : "-"
                          }
                        </p>
                      </div>
                      <div className="space-y-1 min-w-0">
                        <p className="text-xs text-muted-foreground">Progress</p>
                        <div className="flex items-center space-x-2">
                          <Progress value={proposal.progress} className="flex-1 h-2 min-w-0" />
                          <span className="text-sm font-medium shrink-0">{proposal.progress}%</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewProposal(proposal.id)}
                        className="flex-1 sm:flex-none"
                      >
                        <Eye className="w-4 h-4 sm:mr-2" />
                        <span className="hidden sm:inline">Lihat Detail</span>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>
        </ResponsiveTabs>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialog.open} onOpenChange={(open) => setDeleteDialog({ ...deleteDialog, open })}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Proposal</AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Anda yakin ingin menghapus proposal <strong>{deleteDialog.title}</strong>?
              Tindakan ini tidak dapat dibatalkan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteProposal}
              disabled={deleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {deleting ? "Menghapus..." : "Hapus"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Submit Confirmation Dialog */}
      <AlertDialog open={submitDialog.open} onOpenChange={(open) => setSubmitDialog({ ...submitDialog, open })}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Submit Proposal</AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Anda yakin ingin mengajukan proposal <strong>{submitDialog.title}</strong>?
              Setelah diajukan, proposal tidak dapat diedit lagi dan akan masuk proses review.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={submitting}>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleSubmitProposal}
              disabled={submitting}
              className="bg-green-600 hover:bg-green-700"
            >
              {submitting ? "Mengajukan..." : "Ya, Submit Proposal"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  );
}