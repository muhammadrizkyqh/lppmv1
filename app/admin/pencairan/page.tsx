"use client";

import DashboardLayout from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
import {
  Search,
  DollarSign,
  Clock,
  CheckCircle,
  XCircle,
  Upload,
  FileText,
  Calendar,
  Filter,
  Plus,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { toast } from "sonner";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { pencairanApi, PencairanList, PencairanStats } from "@/lib/api-client";
import { periodeApi } from "@/lib/api-client";
import { validateFileSize, validateFileType, formatFileSize, compressPDFIfNeeded, getCompressionRecommendation } from "@/lib/file-utils";

interface Periode {
  id: string;
  nama: string;
  tahun: string;
  status: string;
}

export default function AdminPencairanPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [pencairan, setPencairan] = useState<PencairanList[]>([]);
  const [stats, setStats] = useState<PencairanStats>({
    total: 0,
    pending: 0,
    dicairkan: 0,
    ditolak: 0,
    totalNominal: 0,
  });
  const [periodeList, setPeriodeList] = useState<Periode[]>([]);
  
  // Filters
  const [searchValue, setSearchValue] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [terminFilter, setTerminFilter] = useState<string>("ALL");
  const [periodeFilter, setPeriodeFilter] = useState<string>("ALL");

  // Dialogs
  const [uploadDialog, setUploadDialog] = useState(false);
  const [updateDialog, setUpdateDialog] = useState(false);
  const [selectedPencairan, setSelectedPencairan] = useState<PencairanList | null>(null);
  const [expandedProposals, setExpandedProposals] = useState<Set<string>>(new Set());
  
  // Form states
  const [fileBukti, setFileBukti] = useState<File | null>(null);
  const [newStatus, setNewStatus] = useState<string>("");
  const [keterangan, setKeterangan] = useState("");
  const [tanggalPencairan, setTanggalPencairan] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadPeriode();
    loadPencairan();
  }, [statusFilter, terminFilter, periodeFilter]);

  const loadPeriode = async () => {
    try {
      const response = await periodeApi.getAll();
      if (response.success && response.data) {
        setPeriodeList(response.data as any);
      }
    } catch (error) {
      console.error('Error loading periode:', error);
    }
  };

  const loadPencairan = async () => {
    try {
      setLoading(true);
      const response = await pencairanApi.listPencairan({
        status: statusFilter !== 'ALL' ? statusFilter : undefined,
        termin: terminFilter !== 'ALL' ? terminFilter : undefined,
        periodeId: periodeFilter !== 'ALL' ? periodeFilter : undefined,
        search: searchValue || undefined,
      });

      if (response.success && response.data) {
        setPencairan(response.data || []);
        setStats(response.stats || {
          total: 0,
          pending: 0,
          dicairkan: 0,
          ditolak: 0,
          totalNominal: 0,
        });
      } else {
        toast.error(response.error || "Gagal memuat data pencairan");
      }
    } catch (error) {
      console.error('Error loading pencairan:', error);
      toast.error("Terjadi kesalahan saat memuat data");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    loadPencairan();
  };

  const getStatusBadge = (status: string) => {
    const statusMap = {
      PENDING: { label: "Pending", variant: "secondary" as const, color: "text-yellow-600" },
      DICAIRKAN: { label: "Dicairkan", variant: "default" as const, color: "text-green-600" },
      DITOLAK: { label: "Ditolak", variant: "destructive" as const, color: "text-red-600" },
    };
    const statusInfo = statusMap[status as keyof typeof statusMap] || { label: status, variant: "default" as const };
    return <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>;
  };

  const getTerminLabel = (termin: string) => {
    return termin.replace('TERMIN_', 'Termin ');
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validasi tipe file - accept PDF dan gambar
    const acceptedTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png']
    const typeValidation = validateFileType(file, acceptedTypes)
    if (!typeValidation.valid) {
      toast.error(typeValidation.error!)
      e.target.value = ''
      return
    }

    // Validasi ukuran file dengan max 5MB untuk pencairan
    const sizeValidation = validateFileSize(file, 5 * 1024 * 1024)
    if (!sizeValidation.valid) {
      toast.error(sizeValidation.error!)
      e.target.value = ''
      return
    }

    // Warning jika file besar
    if (sizeValidation.warning) {
      toast.warning(sizeValidation.warning, { duration: 5000 })
    }

    // Analisis dan rekomendasi untuk PDF
    if (file.type === 'application/pdf') {
      const recommendation = getCompressionRecommendation(file.size)
      if (recommendation) {
        toast.info(recommendation, { duration: 5000 })
      }

      const compressionResult = await compressPDFIfNeeded(file)
      if (compressionResult.message) {
        toast.info(compressionResult.message, { duration: 6000 })
      }
      setFileBukti(compressionResult.file)
    } else {
      setFileBukti(file)
    }
  }

  const handleUploadBukti = async () => {
    if (!selectedPencairan || !fileBukti) {
      toast.error("File bukti wajib diupload");
      return;
    }

    try {
      setSubmitting(true);
      const response = await pencairanApi.uploadBuktiTransfer(selectedPencairan.id, fileBukti);
      
      if (response.success) {
        toast.success("Bukti transfer berhasil diupload");
        setUploadDialog(false);
        setFileBukti(null);
        setSelectedPencairan(null);
        loadPencairan();
      } else {
        toast.error(response.error || "Gagal upload bukti");
      }
    } catch (error: any) {
      toast.error(error.message || "Terjadi kesalahan");
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateStatus = async () => {
    if (!selectedPencairan || !newStatus) {
      toast.error("Status wajib dipilih");
      return;
    }

    try {
      setSubmitting(true);
      const response = await pencairanApi.updatePencairan(selectedPencairan.id, {
        status: newStatus as any,
        keterangan: keterangan || undefined,
        tanggalPencairan: tanggalPencairan || undefined,
      });
      
      if (response.success) {
        toast.success("Status pencairan berhasil diupdate");
        setUpdateDialog(false);
        setNewStatus("");
        setKeterangan("");
        setTanggalPencairan("");
        setSelectedPencairan(null);
        loadPencairan();
      } else {
        toast.error(response.error || "Gagal update status");
      }
    } catch (error: any) {
      toast.error(error.message || "Terjadi kesalahan");
    } finally {
      setSubmitting(false);
    }
  };

  const openUploadDialog = (item: PencairanList) => {
    setSelectedPencairan(item);
    setUploadDialog(true);
  };

  const openUpdateDialog = (item: PencairanList) => {
    setSelectedPencairan(item);
    setNewStatus(item.status);
    setKeterangan(item.keterangan || "");
    setTanggalPencairan(item.tanggalPencairan ? new Date(item.tanggalPencairan).toISOString().split('T')[0] : "");
    setUpdateDialog(true);
  };

  const toggleProposal = (proposalId: string) => {
    const newExpanded = new Set(expandedProposals);
    if (newExpanded.has(proposalId)) {
      newExpanded.delete(proposalId);
    } else {
      newExpanded.add(proposalId);
    }
    setExpandedProposals(newExpanded);
  };

  // Group pencairan by proposal
  const groupedPencairan = pencairan.reduce((acc, item) => {
    const proposalId = item.proposal.id;
    if (!acc[proposalId]) {
      acc[proposalId] = {
        proposal: item.proposal,
        termins: []
      };
    }
    acc[proposalId].termins.push(item);
    return acc;
  }, {} as Record<string, { proposal: any, termins: PencairanList[] }>);

  const proposals = Object.values(groupedPencairan);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Pencairan Dana</h1>
          <p className="text-muted-foreground">
            Kelola pencairan dana penelitian per termin
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Pencairan</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
              <p className="text-xs text-muted-foreground">
                Semua termin
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending</CardTitle>
              <Clock className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.pending}</div>
              <p className="text-xs text-muted-foreground">
                Menunggu pencairan
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Dicairkan</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.dicairkan}</div>
              <p className="text-xs text-muted-foreground">
                Sudah dicairkan
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Ditolak</CardTitle>
              <XCircle className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.ditolak}</div>
              <p className="text-xs text-muted-foreground">
                Pencairan ditolak
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Dana</CardTitle>
              <DollarSign className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-xl font-bold">{formatCurrency(stats.totalNominal)}</div>
              <p className="text-xs text-muted-foreground">
                Dana dicairkan
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle>Filter & Pencarian</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-5">
              <Input
                placeholder="Cari judul proposal..."
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              />

              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">Semua Status</SelectItem>
                  <SelectItem value="PENDING">Pending</SelectItem>
                  <SelectItem value="DICAIRKAN">Dicairkan</SelectItem>
                  <SelectItem value="DITOLAK">Ditolak</SelectItem>
                </SelectContent>
              </Select>

              <Select value={terminFilter} onValueChange={setTerminFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Termin" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">Semua Termin</SelectItem>
                  <SelectItem value="TERMIN_1">Termin 1 (50%)</SelectItem>
                  <SelectItem value="TERMIN_2">Termin 2 (25%)</SelectItem>
                  <SelectItem value="TERMIN_3">Termin 3 (25%)</SelectItem>
                </SelectContent>
              </Select>

              <Select value={periodeFilter} onValueChange={setPeriodeFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Periode" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">Semua Periode</SelectItem>
                  {periodeList.map((periode) => (
                    <SelectItem key={periode.id} value={periode.id}>
                      {periode.nama} ({periode.tahun})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Button onClick={handleSearch} variant="default">
                <Filter className="w-4 h-4 mr-2" />
                Filter
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Pencairan List - Grouped by Proposal */}
        {proposals.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <FileText className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">Tidak ada data</h3>
              <p className="text-sm text-muted-foreground text-center max-w-sm">
                Belum ada pencairan dana yang dibuat
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {proposals.map((group) => {
              const isExpanded = expandedProposals.has(group.proposal.id);
              const totalTermins = group.termins.length;
              const totalNominal = group.termins.reduce((sum, t) => sum + Number(t.nominal), 0);
              const dicairkanCount = group.termins.filter(t => t.status === 'DICAIRKAN').length;
              const pendingCount = group.termins.filter(t => t.status === 'PENDING').length;

              return (
                <Card key={group.proposal.id} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-0">
                    {/* Header - Collapsible */}
                    <div 
                      className="p-6 cursor-pointer hover:bg-accent/50 transition-colors"
                      onClick={() => toggleProposal(group.proposal.id)}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 space-y-2">
                          <div className="flex items-start gap-3">
                            <div className="flex-1">
                              <h3 className="text-lg font-semibold mb-1">{group.proposal.judul}</h3>
                              <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                                <span>{group.proposal.dosen.nama}</span>
                                <span>•</span>
                                <span>{group.proposal.periode.nama} ({group.proposal.periode.tahun})</span>
                                <span>•</span>
                                <span>{group.proposal.skema.nama}</span>
                              </div>
                            </div>
                            <div className="shrink-0">
                              {isExpanded ? (
                                <ChevronUp className="w-5 h-5 text-muted-foreground" />
                              ) : (
                                <ChevronDown className="w-5 h-5 text-muted-foreground" />
                              )}
                            </div>
                          </div>

                          <div className="flex flex-wrap items-center gap-3">
                            <div className="flex items-center gap-2">
                              <Badge variant="outline">{totalTermins} Termin</Badge>
                              {dicairkanCount > 0 && (
                                <Badge variant="default" className="gap-1">
                                  <CheckCircle className="w-3 h-3" />
                                  {dicairkanCount} Dicairkan
                                </Badge>
                              )}
                              {pendingCount > 0 && (
                                <Badge variant="secondary" className="gap-1">
                                  <Clock className="w-3 h-3" />
                                  {pendingCount} Pending
                                </Badge>
                              )}
                            </div>
                            <div className="text-sm font-semibold text-primary flex items-center gap-1">
                              <DollarSign className="w-4 h-4" />
                              {formatCurrency(totalNominal)}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Termin List - Expandable */}
                    {isExpanded && (
                      <div className="border-t">
                        {group.termins.map((item, idx) => (
                          <div 
                            key={item.id} 
                            className={`p-6 ${idx !== group.termins.length - 1 ? 'border-b' : ''} bg-accent/20`}
                          >
                            <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                              {/* Termin Info */}
                              <div className="flex-1 space-y-3">
                                <div className="flex flex-wrap items-center gap-3">
                                  <Badge variant="outline" className="font-semibold">
                                    {getTerminLabel(item.termin)} ({item.persentase}%)
                                  </Badge>
                                  {getStatusBadge(item.status)}
                                  <div className="text-sm text-muted-foreground flex items-center gap-1">
                                    <DollarSign className="w-4 h-4" />
                                    <span className="font-semibold">{formatCurrency(Number(item.nominal))}</span>
                                  </div>
                                  {item.tanggalPencairan && (
                                    <div className="text-sm text-muted-foreground flex items-center gap-1">
                                      <Calendar className="w-4 h-4" />
                                      {formatDate(item.tanggalPencairan)}
                                    </div>
                                  )}
                                </div>

                                {item.keterangan && (
                                  <p className="text-sm text-muted-foreground italic">{item.keterangan}</p>
                                )}
                              </div>

                              {/* Termin Actions */}
                              <div className="flex flex-col gap-2 min-w-[200px]">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => openUploadDialog(item)}
                                  className="w-full"
                                  disabled={item.status === 'DICAIRKAN'}
                                  title={item.status === 'DICAIRKAN' ? 'Pencairan sudah dicairkan' : (item.fileBukti ? 'Ganti bukti transfer' : 'Upload bukti transfer')}
                                >
                                  <Upload className="w-4 h-4 mr-2" />
                                  {item.fileBukti ? 'Ganti Bukti' : 'Upload Bukti'}
                                </Button>
                                
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => openUpdateDialog(item)}
                                  className="w-full"
                                  disabled={item.status === 'DICAIRKAN'}
                                  title={item.status === 'DICAIRKAN' ? 'Pencairan yang sudah dicairkan tidak dapat diubah' : 'Update status pencairan'}
                                >
                                  <FileText className="w-4 h-4 mr-2" />
                                  Update Status
                                </Button>

                                {item.fileBukti && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => window.open(item.fileBukti!, '_blank')}
                                    className="w-full"
                                  >
                                    Lihat Bukti
                                  </Button>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* Upload Bukti Dialog */}
        <Dialog open={uploadDialog} onOpenChange={setUploadDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Upload Bukti Transfer</DialogTitle>
              <DialogDescription>
                Upload bukti transfer untuk {selectedPencairan && getTerminLabel(selectedPencairan.termin)}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="fileBukti">File Bukti Transfer</Label>
                <Input
                  id="fileBukti"
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={handleFileChange}
                />
                <p className="text-xs text-muted-foreground">
                  Format: PDF, JPG, PNG (Max 5MB). File PDF besar akan dianalisis dan diberi rekomendasi kompresi.
                </p>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setUploadDialog(false)}>
                Batal
              </Button>
              <Button onClick={handleUploadBukti} disabled={submitting || !fileBukti}>
                {submitting ? "Uploading..." : "Upload"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Update Status Dialog */}
        <Dialog open={updateDialog} onOpenChange={setUpdateDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Update Status Pencairan</DialogTitle>
              <DialogDescription>
                Update status untuk {selectedPencairan && getTerminLabel(selectedPencairan.termin)}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              {!selectedPencairan?.fileBukti && (
                <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded-md text-sm">
                  <strong>Perhatian:</strong> Upload bukti transfer terlebih dahulu sebelum mengubah status ke "Dicairkan"
                </div>
              )}
              
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select value={newStatus} onValueChange={setNewStatus}>
                  <SelectTrigger id="status">
                    <SelectValue placeholder="Pilih status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PENDING">Pending</SelectItem>
                    <SelectItem value="DICAIRKAN" disabled={!selectedPencairan?.fileBukti}>
                      Dicairkan {!selectedPencairan?.fileBukti && '(Upload bukti dulu)'}
                    </SelectItem>
                    <SelectItem value="DITOLAK">Ditolak</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="tanggalPencairan">Tanggal Pencairan</Label>
                <Input
                  id="tanggalPencairan"
                  type="date"
                  value={tanggalPencairan}
                  onChange={(e) => setTanggalPencairan(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="keterangan">Keterangan</Label>
                <Textarea
                  id="keterangan"
                  placeholder="Keterangan tambahan (opsional)"
                  value={keterangan}
                  onChange={(e) => setKeterangan(e.target.value)}
                  rows={3}
                />
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setUpdateDialog(false)}>
                Batal
              </Button>
              <Button onClick={handleUpdateStatus} disabled={submitting}>
                {submitting ? "Menyimpan..." : "Simpan"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
