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
  MoreVertical,
  Trash2
} from "lucide-react";
import { SearchFilter, PROPOSAL_FILTERS } from "@/components/ui/search-filter";
import { NoProposalsFound, NoSearchResults } from "@/components/ui/empty-states";
import { toast } from "sonner";
import { useState } from "react";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useProposals } from "@/hooks/use-data";
import { proposalApi, ProposalStatus } from "@/lib/api-client";

export default function ProposalsPage() {
  const router = useRouter();
  const [searchValue, setSearchValue] = useState("");
  const [activeFilters, setActiveFilters] = useState<Record<string, any>>({});
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
  const [revisionDialog, setRevisionDialog] = useState<{
    open: boolean;
    proposalId: string | null;
    title: string | null;
  }>({ open: false, proposalId: null, title: null });
  const [revisionForm, setRevisionForm] = useState({
    filePath: "",
    catatanRevisi: "",
  });
  const [uploading, setUploading] = useState(false);

  // Fetch proposals from backend
  const { data: proposalsData, loading, refetch } = useProposals();

  const handleFilterChange = (key: string, value: any) => {
    setActiveFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleClearFilters = () => {
    setActiveFilters({});
    setSearchValue("");
  };

  const handleViewProposal = (id: string) => {
    router.push(`/dosen/proposals/${id}`);
  };

  const handleEditProposal = (id: string) => {
    router.push(`/dosen/proposals/${id}/edit`);
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

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      toast.error("Ukuran file maksimal 10MB");
      return;
    }

    if (file.type !== "application/pdf") {
      toast.error("Hanya file PDF yang diperbolehkan");
      return;
    }

    try {
      setUploading(true);
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) throw new Error("Upload failed");

      const result = await response.json();
      setRevisionForm(prev => ({ ...prev, filePath: result.data.filePath }));
      toast.success("File berhasil diupload");
    } catch (error) {
      toast.error("Gagal upload file");
    } finally {
      setUploading(false);
    }
  };

  const handleUploadRevision = async () => {
    if (!revisionDialog.proposalId) return;

    if (!revisionForm.filePath) {
      toast.error("File revisi harus diupload");
      return;
    }

    try {
      setSubmitting(true);
      const result = await proposalApi.uploadRevision(revisionDialog.proposalId, revisionForm);
      
      if (result.success) {
        toast.success("Revisi berhasil diupload! Proposal akan direview kembali.");
        refetch();
        setRevisionDialog({ open: false, proposalId: null, title: null });
        setRevisionForm({ filePath: "", catatanRevisi: "" });
      } else {
        toast.error(result.error || "Gagal upload revisi");
      }
    } catch (error: any) {
      toast.error(error.message || "Gagal upload revisi");
    } finally {
      setSubmitting(false);
    }
  };

  // Convert backend data to UI format
  const proposals = proposalsData?.map(p => ({
    id: p.id,
    title: p.judul,
    skema: p.skema?.nama || "-",
    status: p.status.toLowerCase(),
    progress: 0, // Could be calculated based on status
    tanggalPengajuan: p.createdAt || new Date().toISOString(),
    tanggalDeadline: "-", // Would come from periode settings
    dana: Number(p.skema?.dana || 0),
    bidangKeahlian: p.bidangkeahlian?.nama || "-",
    anggota: p._count?.proposalmember || 0,
    reviewer: [], // Would come from reviews relation
    _original: p // Keep original data for actions
  })) || [];

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
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="min-w-0">
            <h1 className="text-2xl md:text-3xl font-bold text-foreground truncate">Proposal Penelitian</h1>
            <p className="text-sm md:text-base text-muted-foreground mt-2">
              Kelola dan pantau semua proposal penelitian dan PKM Anda
            </p>
          </div>
          <Button className="bg-gradient-to-r from-primary to-primary/90 shrink-0 self-start sm:self-auto" onClick={() => router.push("/dosen/proposals/create")}>
            <Plus className="w-4 h-4 mr-2" />
            <span className="hidden sm:inline">Ajukan Proposal Baru</span>
            <span className="sm:hidden">Buat Proposal</span>
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
          <ResponsiveTabs
            tabs={[
              { value: "all", label: "Semua", count: proposals.length },
              { value: "review", label: "Review", count: proposals.filter(p => p.status === "review" || p.status === "direview").length },
              { value: "diterima", label: "Diterima", count: proposals.filter(p => p.status === "diterima").length },
              { value: "monitoring", label: "Monitoring", count: proposals.filter(p => p.status === "monitoring" || p.status === "berjalan").length },
              { value: "revisi", label: "Revisi", count: proposals.filter(p => p.status === "revisi").length },
              { value: "selesai", label: "Selesai", count: proposals.filter(p => p.status === "selesai").length },
            ]}
            defaultValue="all"
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
            ) : proposals.length === 0 ? (
              <Card className="border-0 shadow-sm">
                <CardContent className="p-12 text-center">
                  <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Belum ada proposal</h3>
                  <p className="text-muted-foreground mb-4">
                    Mulai ajukan proposal penelitian atau PKM Anda
                  </p>
                  <Button onClick={() => router.push("/dosen/proposals/create")}>
                    <Plus className="mr-2 h-4 w-4" />
                    Ajukan Proposal Pertama
                  </Button>
                </CardContent>
              </Card>
            ) : (
              proposals.map((proposal) => (
              <Card key={proposal.id} className="border-0 shadow-sm hover:shadow-md transition-shadow">
                <CardContent className="p-4 md:p-6">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-2">
                        <h3 className="font-semibold text-base md:text-lg text-foreground line-clamp-2 break-words">
                          {proposal.title}
                        </h3>
                        <div className="shrink-0 self-start">
                          {getStatusBadge(proposal.status)}
                        </div>
                      </div>
                      <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs md:text-sm text-muted-foreground mb-3">
                        <span className="font-medium text-primary truncate">{proposal.id}</span>
                        <span className="hidden sm:inline">•</span>
                        <span className="truncate">{proposal.skema}</span>
                        <span className="hidden sm:inline">•</span>
                        <span className="truncate">{proposal.bidangKeahlian}</span>
                        <span className="hidden sm:inline">•</span>
                        <span className="shrink-0">{proposal.anggota} anggota</span>
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

                  {/* Action Buttons Row */}
                  <div className="flex flex-wrap gap-2 mb-4">
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
                        >
                          <Edit className="w-4 h-4 mr-2" />
                          Edit
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setDeleteDialog({ open: true, id: proposal.id, title: proposal.title })}
                          className="text-red-600 border-red-300 hover:bg-red-50"
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Hapus
                        </Button>
                      </>
                    )}
                  </div>

                  {proposal.status === "review" && (
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 bg-orange-50 border border-orange-200 rounded-lg">
                      <div className="flex items-center space-x-2 min-w-0">
                        <Clock className="w-4 h-4 text-orange-600 shrink-0" />
                        <span className="text-xs sm:text-sm text-orange-800 truncate">
                          Sedang direview oleh: {proposal.reviewer.join(", ")}
                        </span>
                      </div>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="text-orange-700 border-orange-300 shrink-0 w-full sm:w-auto"
                        onClick={() => handleViewProposal(proposal.id)}
                      >
                        Lihat Progress
                      </Button>
                    </div>
                  )}

                  {proposal.status === "revisi" && (
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <div className="flex items-center space-x-2 min-w-0">
                        <AlertCircle className="w-4 h-4 text-yellow-600 shrink-0" />
                        <span className="text-xs sm:text-sm text-yellow-800">
                          Perlu revisi berdasarkan feedback reviewer
                        </span>
                      </div>
                      <Button 
                        size="sm" 
                        className="bg-yellow-600 hover:bg-yellow-700 shrink-0 w-full sm:w-auto"
                        onClick={() => {
                          setRevisionDialog({ 
                            open: true, 
                            proposalId: proposal.id,
                            title: proposal.title 
                          });
                          setRevisionForm({ filePath: "", catatanRevisi: "" });
                        }}
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
            ))
          )}
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
          </ResponsiveTabs>
        </Tabs>
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

      {/* Upload Revision Dialog */}
      <Dialog open={revisionDialog.open} onOpenChange={(open) => {
        setRevisionDialog({ ...revisionDialog, open });
        if (!open) setRevisionForm({ filePath: "", catatanRevisi: "" });
      }}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Upload Revisi Proposal</DialogTitle>
            <DialogDescription>
              Upload file revisi proposal <strong>{revisionDialog.title}</strong> berdasarkan 
              feedback dari reviewer. Setelah diupload, proposal akan direview kembali.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="revisionFile">File Proposal Revisi (PDF) *</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="revisionFile"
                  type="file"
                  accept="application/pdf"
                  onChange={handleFileUpload}
                  disabled={uploading}
                  className="flex-1"
                />
                {revisionForm.filePath && (
                  <Button variant="outline" size="icon" asChild>
                    <a href={revisionForm.filePath} target="_blank" rel="noopener noreferrer">
                      <Eye className="w-4 h-4" />
                    </a>
                  </Button>
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                Format: PDF, Maksimal 10MB. Upload file proposal yang sudah direvisi.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="catatanRevisi">Catatan Revisi (Opsional)</Label>
              <Textarea
                id="catatanRevisi"
                placeholder="Tuliskan penjelasan perubahan yang telah dilakukan..."
                value={revisionForm.catatanRevisi}
                onChange={(e) => setRevisionForm(prev => ({ ...prev, catatanRevisi: e.target.value }))}
                rows={4}
              />
              <p className="text-xs text-muted-foreground">
                Jelaskan perbaikan yang telah dilakukan berdasarkan feedback reviewer.
              </p>
            </div>

            <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5 shrink-0" />
                <div className="text-sm text-yellow-800">
                  <p className="font-medium">Perhatian:</p>
                  <ul className="list-disc list-inside mt-1 space-y-1">
                    <li>Pastikan semua feedback reviewer sudah diperbaiki</li>
                    <li>Setelah upload, proposal akan kembali ke status <strong>DIREVIEW</strong></li>
                    <li>Reviewer akan menilai ulang proposal revisi Anda</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setRevisionDialog({ open: false, proposalId: null, title: null })}>
              Batal
            </Button>
            <Button 
              onClick={handleUploadRevision} 
              disabled={submitting || !revisionForm.filePath || uploading}
              className="bg-yellow-600 hover:bg-yellow-700"
            >
              {submitting ? "Mengupload..." : "Upload Revisi"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}