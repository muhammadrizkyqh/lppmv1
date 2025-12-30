"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Download,
  Edit,
  Trash2,
  Users,
  Calendar,
  FileText,
  BookOpen,
  Award,
  CheckCircle2,
  Clock,
  XCircle,
  AlertCircle,
  UserPlus,
  X,
  Upload,
  History,
  ClipboardCheck,
  Star,
  TrendingUp,
  DollarSign,
  Plus,
  Send,
} from "lucide-react";
import DashboardLayout from "@/components/layout/dashboard-layout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Timeline, TimelineItem } from "@/components/ui/timeline";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { useProposalById, useProposalMembers, useDosen, useMahasiswa, useReviewer } from "@/hooks/use-data";
import { proposalApi, uploadApi, ProposalTimeline } from "@/lib/api-client";
import { toast } from "sonner";
import PencairanSection from "@/components/proposal/pencairan-section";
import LuaranSection from "@/components/proposal/luaran-section";
import SeminarSection from "@/components/proposal/seminar-section";

// Status configuration
const statusConfig = {
  draft: {
    label: "Draft",
    color: "bg-gray-500",
    icon: FileText,
  },
  diajukan: {
    label: "Diajukan",
    color: "bg-blue-500",
    icon: Clock,
  },
  direview: {
    label: "Direview",
    color: "bg-yellow-500",
    icon: AlertCircle,
  },
  revisi: {
    label: "Revisi",
    color: "bg-orange-500",
    icon: Edit,
  },
  diterima: {
    label: "Diterima",
    color: "bg-green-500",
    icon: CheckCircle2,
  },
  ditolak: {
    label: "Ditolak",
    color: "bg-red-500",
    icon: XCircle,
  },
  berjalan: {
    label: "Berjalan",
    color: "bg-purple-500",
    icon: Clock,
  },
  selesai: {
    label: "Selesai",
    color: "bg-teal-500",
    icon: CheckCircle2,
  },
};

interface AddMemberForm {
  type: "dosen" | "mahasiswa";
  id: string;
}

export default function ProposalDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const { data: proposal, loading, refetch } = useProposalById(id);
  const { data: members = [], refetch: refetchMembers } = useProposalMembers(id);
  const { data: reviewerList = [] } = useReviewer();
  const { data: dosenList = [] } = useDosen();
  const { data: mahasiswaList = [] } = useMahasiswa();

  const [deleteDialog, setDeleteDialog] = useState(false);
  const [addMemberDialog, setAddMemberDialog] = useState(false);
  const [removeMemberDialog, setRemoveMemberDialog] = useState<{
    open: boolean;
    memberId: string;
    name: string;
  }>({ open: false, memberId: "", name: "" });
  const [addMemberForm, setAddMemberForm] = useState<AddMemberForm>({
    type: "dosen",
    id: "",
  });
  const [memberComboOpen, setMemberComboOpen] = useState(false);
  const [memberSearchQuery, setMemberSearchQuery] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitDialog, setSubmitDialog] = useState(false);
  const [assignReviewerDialog, setAssignReviewerDialog] = useState(false);
  const [selectedReviewers, setSelectedReviewers] = useState<string[]>([]);
  const [userRole, setUserRole] = useState<string>("");
  const [uploadingFile, setUploadingFile] = useState(false);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [timelineData, setTimelineData] = useState<ProposalTimeline | null>(null);
  const [timelineLoading, setTimelineLoading] = useState(false);

  useEffect(() => {
    // Get user role from localStorage
    const role = localStorage.getItem("userRole") || "";
    console.log("🔍 User Role from localStorage:", role);
    setUserRole(role);
  }, []);

  // Fetch timeline data
  useEffect(() => {
    const fetchTimeline = async () => {
      if (!id) return;
      
      setTimelineLoading(true);
      try {
        const response = await proposalApi.getTimeline(id);
        if (response.success && response.data) {
          setTimelineData(response.data);
        }
      } catch (error: any) {
        console.error("Failed to fetch timeline:", error);
      } finally {
        setTimelineLoading(false);
      }
    };

    fetchTimeline();
  }, [id]);

  const isAdmin = userRole === "ADMIN";
  console.log("👤 isAdmin:", isAdmin, "| userRole:", userRole);
  console.log("📋 Proposal Status:", proposal?.status, "| Lowercase:", proposal?.status?.toLowerCase());

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Memuat data proposal...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (!proposal) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Proposal Tidak Ditemukan</h3>
            <p className="text-muted-foreground mb-4">
              Proposal yang Anda cari tidak ditemukan atau telah dihapus.
            </p>
            <Button asChild>
              <Link href="/dosen/proposals">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Kembali ke Daftar Proposal
              </Link>
            </Button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const status = proposal.status?.toLowerCase() || "draft";
  const statusInfo = statusConfig[status as keyof typeof statusConfig] || statusConfig.draft;
  const StatusIcon = statusInfo.icon;

  // Debug logging
  console.log("=== DEBUG PROPOSAL FILE ===");
  console.log("Proposal ID:", proposal.id);
  console.log("Status:", status);
  console.log("Status (original):", proposal.status);
  console.log("isAdmin:", isAdmin);
  console.log("Show Assign Reviewer?:", isAdmin && status === "lulus_administratif");
  console.log("filePath:", proposal.filePath);
  console.log("fileName:", proposal.fileName);
  console.log("fileSize:", proposal.fileSize);
  console.log("Has file?:", !!proposal.filePath);
  console.log("canSubmit?:", status === "draft");
  console.log("===========================");

  const canEdit = status === "draft";
  const canDelete = status === "draft";
  const canAddMember = status === "draft";
  const canSubmit = status === "draft"; // Can submit if draft (validation inside handler)

  const handleDelete = async () => {
    try {
      await proposalApi.delete(id);
      toast.success("Proposal berhasil dihapus");
      router.push("/dosen/proposals");
    } catch (error: any) {
      toast.error(error.message || "Gagal menghapus proposal");
    }
  };

  const handleDownload = () => {
    if (proposal.filePath) {
      window.open(proposal.filePath, "_blank");
    } else {
      toast.error("File proposal tidak tersedia");
    }
  };

  const handleAddMember = async () => {
    if (!addMemberForm.id) {
      toast.error("Pilih anggota terlebih dahulu");
      return;
    }

    setSubmitting(true);
    try {
      const data =
        addMemberForm.type === "dosen"
          ? { dosenId: addMemberForm.id }
          : { mahasiswaId: addMemberForm.id };

      await proposalApi.addMember(id, data);
      toast.success("Anggota berhasil ditambahkan");
      setAddMemberDialog(false);
      setAddMemberForm({ type: "dosen", id: "" });
      refetchMembers();
    } catch (error: any) {
      toast.error(error.message || "Gagal menambahkan anggota");
    } finally {
      setSubmitting(false);
    }
  };

  const handleRemoveMember = async () => {
    setSubmitting(true);
    try {
      await proposalApi.removeMember(id, removeMemberDialog.memberId);
      toast.success("Anggota berhasil dihapus");
      setRemoveMemberDialog({ open: false, memberId: "", name: "" });
      refetchMembers();
    } catch (error: any) {
      toast.error(error.message || "Gagal menghapus anggota");
    } finally {
      setSubmitting(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (selectedFile.type !== 'application/pdf') {
        toast.error("File harus berformat PDF");
        return;
      }
      if (selectedFile.size > 10 * 1024 * 1024) {
        toast.error("Ukuran file maksimal 10MB");
        return;
      }
      setUploadFile(selectedFile);
      toast.success("File berhasil dipilih, klik Upload untuk menyimpan");
    }
  };

  const handleUploadFile = async () => {
    if (!uploadFile) {
      toast.error("Pilih file terlebih dahulu");
      return;
    }

    setUploadingFile(true);
    try {
      // Upload file
      const uploadResult = await uploadApi.uploadFile(uploadFile, proposal.periodeId, proposal.id);
      if (!uploadResult.success) {
        toast.error("Gagal upload file");
        return;
      }

      // Update proposal with file info
      const updateResult = await proposalApi.update(id, {
        filePath: uploadResult.data.filePath,
        fileName: uploadResult.data.fileName,
        fileSize: uploadResult.data.fileSize
      });

      if (updateResult.success) {
        toast.success("File berhasil diupload!");
        setUploadFile(null);
        refetch(); // Refresh proposal data
      } else {
        toast.error(updateResult.error || "Gagal update proposal");
      }
    } catch (error: any) {
      toast.error(error.message || "Gagal upload file");
    } finally {
      setUploadingFile(false);
    }
  };

  const handleSubmit = async () => {
    if (!proposal.filePath) {
      toast.error("Upload file proposal terlebih dahulu");
      return;
    }

    setSubmitting(true);
    try {
      const result = await proposalApi.submit(id);
      if (result.success) {
        toast.success("Proposal berhasil diajukan!");
        setSubmitDialog(false);
        refetch(); // Refresh proposal data to show new status
      } else {
        toast.error(result.error || "Gagal submit proposal");
      }
    } catch (error: any) {
      toast.error(error.message || "Gagal submit proposal");
    } finally {
      setSubmitting(false);
    }
  };

  const handleAssignReviewer = async () => {
    if (selectedReviewers.length < 1) {
      toast.error("Pilih minimal 1 reviewer untuk proposal ini");
      return;
    }

    setSubmitting(true);
    try {
      const result = await proposalApi.assignReviewers(id, selectedReviewers);
      if (result.success) {
        toast.success("Reviewer berhasil ditugaskan! Status proposal berubah ke DIREVIEW");
        setAssignReviewerDialog(false);
        setSelectedReviewers([]);
        refetch(); // Refresh to show new status
      } else {
        toast.error(result.error || "Gagal menugaskan reviewer");
      }
    } catch (error: any) {
      toast.error(error.message || "Gagal menugaskan reviewer");
    } finally {
      setSubmitting(false);
    }
  };

  const toggleReviewer = (reviewerId: string) => {
    setSelectedReviewers(prev => {
      if (prev.includes(reviewerId)) {
        return prev.filter(id => id !== reviewerId);
      }
      if (prev.length >= 2) {
        toast.error("Maksimal 2 reviewer");
        return prev;
      }
      return [...prev, reviewerId];
    });
  };

  // Filter available members (exclude already added)
  const memberIds = new Set(
    (members || []).map((m) => m.dosenId || m.mahasiswaId).filter(Boolean)
  );
  const availableDosen = (dosenList || []).filter((d) => !memberIds.has(d.id));
  const availableMahasiswa = (mahasiswaList || []).filter((m) => !memberIds.has(m.id));

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="outline" size="sm" asChild>
              <Link href="/dosen/proposals">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Kembali
              </Link>
            </Button>
            <div>
              <h1 className="text-2xl font-bold">Detail Proposal</h1>
              <p className="text-muted-foreground">Informasi lengkap proposal penelitian</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {/* Admin: Assign Reviewer (untuk proposal LULUS_ADMINISTRATIF) */}
            {isAdmin && status === "lulus_administratif" && (
              <Button 
                onClick={() => setAssignReviewerDialog(true)}
                className="bg-purple-600 hover:bg-purple-700"
              >
                <Users className="w-4 h-4 mr-2" />
                Assign Reviewer
              </Button>
            )}
            
            {/* Dosen: Submit Proposal (untuk proposal DRAFT dengan file) */}
            {canSubmit && !isAdmin && (
              <Button 
                onClick={() => setSubmitDialog(true)}
                className="bg-green-600 hover:bg-green-700"
              >
                <CheckCircle2 className="w-4 h-4 mr-2" />
                Submit Proposal
              </Button>
            )}
            
            {proposal.filePath && (
              <Button 
                variant="default" 
                onClick={handleDownload}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Download className="w-4 h-4 mr-2" />
                Download PDF
              </Button>
            )}
            {canEdit && (
              <Button variant="outline" asChild>
                <Link href={`/dosen/proposals/${id}/edit`}>
                  <Edit className="w-4 h-4 mr-2" />
                  Edit
                </Link>
              </Button>
            )}
            {canDelete && (
              <Button
                variant="outline"
                className="text-red-600 hover:text-red-700"
                onClick={() => setDeleteDialog(true)}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Hapus
              </Button>
            )}
          </div>
        </div>

        {/* Status Badge */}
        <div className="flex items-center gap-3">
          <Badge className={`${statusInfo.color} text-white px-3 py-1`}>
            <StatusIcon className="w-4 h-4 mr-2" />
            {statusInfo.label}
          </Badge>
          <span className="text-sm text-muted-foreground">
            Diajukan: {new Date(proposal.createdAt).toLocaleDateString("id-ID")}
          </span>
        </div>

        {/* Tabs Navigation */}
        <Tabs defaultValue="informasi" className="space-y-6">
          <TabsList className="grid w-full max-w-2xl grid-cols-4">
            <TabsTrigger value="informasi">
              <FileText className="w-4 h-4 mr-2" />
              Informasi
            </TabsTrigger>
            <TabsTrigger value="timeline">
              <History className="w-4 h-4 mr-2" />
              Timeline
            </TabsTrigger>
            <TabsTrigger value="anggota">
              <Users className="w-4 h-4 mr-2" />
              Anggota Tim
            </TabsTrigger>
            <TabsTrigger value="dokumen">
              <FileText className="w-4 h-4 mr-2" />
              Dokumen
            </TabsTrigger>
          </TabsList>

          {/* Tab: Informasi */}
          <TabsContent value="informasi" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-3">
              {/* Main Content */}
              <div className="md:col-span-2 space-y-6">
                {/* Proposal Info */}
                <Card>
              <CardHeader>
                <CardTitle>Informasi Proposal</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Judul Penelitian
                  </label>
                  <p className="mt-1 text-lg font-semibold">{proposal.judul}</p>
                </div>

                <Separator />

                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      Periode
                    </label>
                    <p className="mt-1 font-medium">{proposal.periode?.nama || "-"}</p>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                      <BookOpen className="w-4 h-4" />
                      Skema Penelitian
                    </label>
                    <p className="mt-1 font-medium">{proposal.skema?.nama || "-"}</p>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                      <Award className="w-4 h-4" />
                      Bidang Keahlian
                    </label>
                    <p className="mt-1 font-medium">
                      {proposal.bidangkeahlian?.nama || "-"}
                    </p>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                      <FileText className="w-4 h-4" />
                      Dana Diajukan
                    </label>
                    <p className="mt-1 font-medium">
                      {proposal.danaDisetujui
                        ? `Rp ${Number(proposal.danaDisetujui).toLocaleString("id-ID")}`
                        : "-"}
                    </p>
                  </div>
                </div>

                <Separator />

                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Abstrak
                  </label>
                  <p className="mt-1 text-sm whitespace-pre-wrap">{proposal.abstrak}</p>
                </div>

                {proposal.filePath && (
                  <>
                    <Separator />
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">
                        File Proposal
                      </label>
                      <div className="mt-2 flex items-center gap-2">
                        <FileText className="w-5 h-5 text-muted-foreground" />
                        <div className="flex-1">
                          <p className="text-sm font-medium">{proposal.fileName}</p>
                          <p className="text-xs text-muted-foreground">
                            {proposal.fileSize
                              ? `${(proposal.fileSize / 1024 / 1024).toFixed(2)} MB`
                              : ""}
                          </p>
                        </div>
                        <Button variant="outline" size="sm" onClick={handleDownload}>
                          <Download className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
              </div>

              {/* Sidebar - Period, Schema, Field Info */}
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Detail Periode & Skema</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {proposal.periode && (
                      <div>
                        <label className="text-xs text-muted-foreground">Periode</label>
                        <p className="text-sm font-medium">{proposal.periode.nama} - {proposal.periode.tahun}</p>
                      </div>
                    )}
                    {proposal.skema && (
                      <div>
                        <label className="text-xs text-muted-foreground">Skema</label>
                        <p className="text-sm font-medium">{proposal.skema.nama}</p>
                      </div>
                    )}
                    {proposal.bidangkeahlian && (
                      <div>
                        <label className="text-xs text-muted-foreground">Bidang Keahlian</label>
                        <p className="text-sm font-medium">{proposal.bidangkeahlian.nama}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Tab: Timeline */}
          <TabsContent value="timeline" className="space-y-6">
            <Card>
              <CardContent className="p-6">
                {timelineLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="text-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
                      <p className="text-sm text-muted-foreground">Loading timeline...</p>
                    </div>
                  </div>
                ) : timelineData ? (
                  <Timeline>
                    {/* 1. Proposal Created */}
                    <TimelineItem
                      icon={<Plus className="w-3 h-3 text-blue-600" />}
                      title="Proposal Dibuat"
                      timestamp={new Date(timelineData.proposal.createdAt).toLocaleString("id-ID")}
                      actor={timelineData.proposal.dosen.nama}
                      status="DRAFT"
                      statusVariant="default"
                      collapsible={false}
                    />

                    {/* 2. Proposal Submitted */}
                    {timelineData.proposal.submittedAt && (
                      <TimelineItem
                        icon={<Send className="w-3 h-3 text-blue-600" />}
                        title="Proposal Diajukan"
                        timestamp={new Date(timelineData.proposal.submittedAt).toLocaleString("id-ID")}
                        actor={timelineData.proposal.dosen.nama}
                        status="DIAJUKAN"
                        statusVariant="default"
                        collapsible={false}
                      />
                    )}

                    {/* 3. Penilaian Administratif */}
                    {timelineData.proposal.checkedAdminAt && (
                      <TimelineItem
                        icon={<AlertCircle className="w-3 h-3 text-orange-600" />}
                        title="Penilaian Administratif"
                        timestamp={new Date(timelineData.proposal.checkedAdminAt).toLocaleString("id-ID")}
                        actor="Admin"
                        status={timelineData.proposal.statusAdministrasi || ""}
                        statusVariant={
                          timelineData.proposal.statusAdministrasi === "LOLOS" 
                            ? "default" 
                            : "destructive"
                        }
                        collapsible={!!timelineData.proposal.catatanAdministrasi}
                        defaultOpen={false}
                        content={
                          timelineData.proposal.catatanAdministrasi && (
                            <div className="space-y-2">
                              <p className="text-sm font-medium">Catatan Admin:</p>
                              <p className="text-sm whitespace-pre-wrap">
                                {timelineData.proposal.catatanAdministrasi}
                              </p>
                              {timelineData.proposal.catatanKesesuaianTeknikPenulisan && (
                                <>
                                  <p className="text-sm font-medium mt-3">Kesesuaian Teknik Penulisan:</p>
                                  <p className="text-sm whitespace-pre-wrap">
                                    {timelineData.proposal.catatanKesesuaianTeknikPenulisan}
                                  </p>
                                </>
                              )}
                              {timelineData.proposal.catatanKelengkapanKomponen && (
                                <>
                                  <p className="text-sm font-medium mt-3">Kelengkapan Komponen:</p>
                                  <p className="text-sm whitespace-pre-wrap">
                                    {timelineData.proposal.catatanKelengkapanKomponen}
                                  </p>
                                </>
                              )}
                            </div>
                          )
                        }
                      />
                    )}

                    {/* 4. Revisi (Multiple) */}
                    {timelineData.revisions.map((revision, idx) => (
                      <TimelineItem
                        key={revision.id}
                        icon={<Edit className="w-3 h-3 text-orange-600" />}
                        title={`Revisi Proposal (Revisi ke-${idx + 1})`}
                        actor="Dosen"
                        status="REVISI"
                        statusVariant="default"
                        collapsible={!!revision.catatan}
                        defaultOpen={false}
                        content={
                          revision.catatan && (
                            <div className="space-y-2">
                              <p className="text-sm font-medium">Catatan Revisi:</p>
                              <p className="text-sm whitespace-pre-wrap">{revision.catatan}</p>
                              {revision.fileName && (
                                <div className="mt-2 flex items-center gap-2 text-sm">
                                  <FileText className="w-4 h-4" />
                                  <span>{revision.fileName}</span>
                                </div>
                              )}
                            </div>
                          )
                        }
                      />
                    ))}

                    {/* 5. Seminar */}
                    {timelineData.seminar && (
                      <TimelineItem
                        icon={<Users className="w-3 h-3 text-purple-600" />}
                        title="Seminar Proposal"
                        timestamp={new Date(timelineData.seminar.tanggal).toLocaleString("id-ID")}
                        actor="Admin"
                        status={timelineData.seminar.hasilKeputusan || ""}
                        statusVariant="default"
                        collapsible={!!(timelineData.seminar.notulensi || timelineData.seminar.keterangan)}
                        defaultOpen={false}
                        content={
                          (timelineData.seminar.notulensi || timelineData.seminar.keterangan) && (
                            <div className="space-y-2">
                              {timelineData.seminar.notulensi && (
                                <>
                                  <p className="text-sm font-medium">Notulensi:</p>
                                  <p className="text-sm whitespace-pre-wrap">{timelineData.seminar.notulensi}</p>
                                </>
                              )}
                              {timelineData.seminar.keterangan && (
                                <>
                                  <p className="text-sm font-medium mt-3">Keterangan:</p>
                                  <p className="text-sm whitespace-pre-wrap">{timelineData.seminar.keterangan}</p>
                                </>
                              )}
                            </div>
                          )
                        }
                      />
                    )}

                    {/* 6. Reviews (Multiple Reviewers) */}
                    {timelineData.reviews.map((reviewAssignment) => (
                      reviewAssignment.review && (
                        <TimelineItem
                          key={reviewAssignment.id}
                          icon={<Award className="w-3 h-3 text-yellow-600" />}
                          title={`Penilaian Reviewer`}
                          timestamp={new Date(reviewAssignment.review.submittedAt).toLocaleString("id-ID")}
                          actor={reviewAssignment.reviewer?.nama || "Reviewer"}
                          status={reviewAssignment.review.rekomendasi || ""}
                          statusVariant={
                            reviewAssignment.review.rekomendasi === "DITERIMA"
                              ? "default"
                              : reviewAssignment.review.rekomendasi === "REVISI"
                              ? "outline"
                              : "destructive"
                          }
                          collapsible={!!reviewAssignment.review.catatan}
                          defaultOpen={false}
                          content={
                            reviewAssignment.review.catatan && (
                              <div className="space-y-2">
                                <p className="text-sm font-medium">Catatan Reviewer:</p>
                                <p className="text-sm whitespace-pre-wrap">{reviewAssignment.review.catatan}</p>
                                {reviewAssignment.review.nilaiTotal && (
                                  <div className="mt-3 p-3 bg-muted rounded-lg">
                                    <p className="text-sm font-medium mb-2">Skor Akhir: {reviewAssignment.review.nilaiTotal}/100</p>
                                    {reviewAssignment.review.filePenilaian && (
                                      <a 
                                        href={reviewAssignment.review.filePenilaian} 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        className="text-xs text-primary hover:underline"
                                      >
                                        Download File Penilaian
                                      </a>
                                    )}
                                  </div>
                                )}
                              </div>
                            )
                          }
                        />
                      )
                    ))}

                    {/* 7. Keputusan Admin */}
                    {timelineData.proposal.catatan && (
                      <TimelineItem
                        icon={<CheckCircle2 className="w-3 h-3 text-green-600" />}
                        title="Keputusan Admin"
                        actor="Admin"
                        status={timelineData.proposal.status}
                        statusVariant={
                          timelineData.proposal.status === "DITERIMA"
                            ? "default"
                            : "destructive"
                        }
                        collapsible={true}
                        defaultOpen={false}
                        content={
                          <div className="space-y-2">
                            <p className="text-sm font-medium">Catatan:</p>
                            <p className="text-sm whitespace-pre-wrap">{timelineData.proposal.catatan}</p>
                          </div>
                        }
                      />
                    )}

                    {/* 8. Monitoring */}
                    {timelineData.monitoring && (timelineData.monitoring.catatanKemajuan || timelineData.monitoring.catatanAkhir || timelineData.monitoring.catatanFinal) && (
                      <TimelineItem
                        icon={<Clock className="w-3 h-3 text-blue-600" />}
                        title="Monitoring"
                        timestamp={new Date(timelineData.monitoring.createdAt).toLocaleString("id-ID")}
                        actor="Admin"
                        status={timelineData.monitoring.status}
                        collapsible={true}
                        defaultOpen={false}
                        content={
                          <div className="space-y-2">
                            {timelineData.monitoring.catatanKemajuan && (
                              <>
                                <p className="text-sm font-medium">Catatan Kemajuan:</p>
                                <p className="text-sm whitespace-pre-wrap">{timelineData.monitoring.catatanKemajuan}</p>
                              </>
                            )}
                            {timelineData.monitoring.catatanAkhir && (
                              <>
                                <p className="text-sm font-medium mt-3">Catatan Akhir:</p>
                                <p className="text-sm whitespace-pre-wrap">{timelineData.monitoring.catatanAkhir}</p>
                              </>
                            )}
                            {timelineData.monitoring.catatanFinal && (
                              <>
                                <p className="text-sm font-medium mt-3">Catatan Final:</p>
                                <p className="text-sm whitespace-pre-wrap">{timelineData.monitoring.catatanFinal}</p>
                              </>
                            )}
                            {timelineData.monitoring.plagiarismeStatus && (
                              <>
                                <p className="text-sm font-medium mt-3">Status Plagiarisme:</p>
                                <div className="flex items-center gap-2">
                                  <Badge variant={timelineData.monitoring.plagiarismeStatus === "LOLOS" ? "default" : "destructive"}>
                                    {timelineData.monitoring.plagiarismeStatus}
                                  </Badge>
                                  {timelineData.monitoring.plagiarismePercentage && (
                                    <span className="text-sm">({Number(timelineData.monitoring.plagiarismePercentage)}%)</span>
                                  )}
                                </div>
                              </>
                            )}
                            <div className="mt-3 text-sm text-muted-foreground">
                              Persentase Kemajuan: {timelineData.monitoring.persentaseKemajuan}%
                            </div>
                          </div>
                        }
                      />
                    )}

                    {/* 9. Luaran (Multiple) */}
                    {timelineData.luaran.map((luaran) => (
                      <TimelineItem
                        key={luaran.id}
                        icon={<Award className="w-3 h-3 text-purple-600" />}
                        title={`Luaran: ${luaran.jenis}`}
                        timestamp={new Date(luaran.createdAt).toLocaleString("id-ID")}
                        actor="Dosen"
                        status={luaran.statusVerifikasi || ""}
                        statusVariant={
                          luaran.statusVerifikasi === "TERVERIFIKASI"
                            ? "default"
                            : "outline"
                        }
                        collapsible={!!(luaran.keterangan || luaran.catatanVerifikasi)}
                        defaultOpen={false}
                        content={
                          (luaran.keterangan || luaran.catatanVerifikasi) && (
                            <div className="space-y-2">
                              <p className="text-sm font-medium">Judul: {luaran.judul}</p>
                              {luaran.keterangan && (
                                <>
                                  <p className="text-sm font-medium mt-2">Keterangan:</p>
                                  <p className="text-sm whitespace-pre-wrap">{luaran.keterangan}</p>
                                </>
                              )}
                              {luaran.catatanVerifikasi && (
                                <>
                                  <p className="text-sm font-medium mt-2">Catatan Verifikasi:</p>
                                  <p className="text-sm whitespace-pre-wrap">{luaran.catatanVerifikasi}</p>
                                </>
                              )}
                            </div>
                          )
                        }
                      />
                    ))}

                    {/* 10. Pencairan Dana (Multiple Termins) */}
                    {timelineData.pencairan.map((pencairan) => (
                      <TimelineItem
                        key={pencairan.id}
                        icon={<Award className="w-3 h-3 text-green-600" />}
                        title={`Pencairan Dana - Termin ${pencairan.termin}`}
                        timestamp={
                          pencairan.tanggalPencairan 
                            ? new Date(pencairan.tanggalPencairan).toLocaleString("id-ID")
                            : ""
                        }
                        actor="Admin"
                        status={pencairan.status}
                        statusVariant={
                          pencairan.status === "DISETUJUI"
                            ? "default"
                            : pencairan.status === "DITOLAK"
                            ? "destructive"
                            : "outline"
                        }
                        collapsible={!!pencairan.keterangan}
                        defaultOpen={false}
                        content={
                          pencairan.keterangan && (
                            <div className="space-y-2">
                              <p className="text-sm font-medium">Nominal: Rp {Number(pencairan.nominal).toLocaleString("id-ID")}</p>
                              <p className="text-sm">Persentase: {Number(pencairan.persentase)}%</p>
                              <p className="text-sm font-medium mt-2">Keterangan:</p>
                              <p className="text-sm whitespace-pre-wrap">{pencairan.keterangan}</p>
                            </div>
                          )
                        }
                      />
                    ))}
                  </Timeline>
                ) : (
                  <p className="text-center text-muted-foreground">Timeline data tidak tersedia</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab: Anggota Tim */}
          <TabsContent value="anggota" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Users className="w-5 h-5" />
                    Anggota Tim Penelitian
                  </CardTitle>
                  {canAddMember && (members || []).length < 4 && (
                    <Button
                      size="sm"
                      onClick={() => setAddMemberDialog(true)}
                    >
                      <UserPlus className="w-4 h-4 mr-2" />
                      Tambah Anggota
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {(members || []).length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>Belum ada anggota tim</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {(members || []).map((member) => (
                      <div
                        key={member.id}
                        className="flex items-start justify-between gap-2 p-4 rounded-lg border bg-card hover:bg-muted/50"
                      >
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="font-medium truncate">
                              {member.dosen?.nama || member.mahasiswa?.nama}
                            </p>
                            {member.role === "ketua" && (
                              <Badge variant="secondary" className="text-xs">
                                Ketua
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {member.dosen
                              ? `NIDN: ${member.dosen.nidn} • ${member.dosen.email}`
                              : `NIM: ${member.mahasiswa?.nim} • ${member.mahasiswa?.email}`}
                          </p>
                          {member.dosen?.bidangKeahlian && (
                            <p className="text-xs text-muted-foreground mt-1">
                              Bidang: {member.dosen.bidangKeahlian.nama}
                            </p>
                          )}
                        </div>
                        {canAddMember && member.role !== "ketua" && (
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-muted-foreground hover:text-red-600"
                            onClick={() =>
                              setRemoveMemberDialog({
                                open: true,
                                memberId: member.id,
                                name: member.dosen?.nama || member.mahasiswa?.nama || "",
                              })
                            }
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab: Dokumen */}
          <TabsContent value="dokumen" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Dokumen Proposal</CardTitle>
                <p className="text-sm text-muted-foreground">
                  File proposal dan dokumen pendukung lainnya
                </p>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* File Upload Section - Only for DRAFT without file */}
                {canEdit && !proposal.filePath && (
                  <div className="p-6 border-2 border-dashed border-primary/20 rounded-lg bg-primary/5">
                    <div className="space-y-4">
                      <div className="flex items-center gap-3 text-primary">
                        <Upload className="w-6 h-6" />
                        <div>
                          <label className="text-base font-semibold">
                            Upload File Proposal (PDF)
                          </label>
                          <p className="text-sm text-muted-foreground">
                            Unggah file proposal dalam format PDF
                          </p>
                        </div>
                      </div>
                      
                      <input
                        id="file-upload-detail"
                        type="file"
                        accept=".pdf"
                        onChange={handleFileChange}
                        className="hidden"
                      />
                      
                      {uploadFile ? (
                        <div className="flex items-center gap-3 p-4 bg-white rounded-lg border">
                          <FileText className="w-8 h-8 text-primary" />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{uploadFile.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {(uploadFile.size / 1024 / 1024).toFixed(2)} MB
                            </p>
                          </div>
                          <Button
                            onClick={handleUploadFile}
                            disabled={uploadingFile}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            {uploadingFile ? "Uploading..." : "Upload"}
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setUploadFile(null)}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      ) : (
                        <Button
                          variant="outline"
                          size="lg"
                          className="w-full"
                          onClick={() => document.getElementById('file-upload-detail')?.click()}
                        >
                          <Upload className="w-5 h-5 mr-2" />
                          Pilih File PDF
                        </Button>
                      )}
                      
                      <p className="text-xs text-muted-foreground text-center">
                        Format: PDF • Ukuran maksimal: 10MB
                      </p>
                    </div>
                  </div>
                )}

                {proposal.filePath && (
                  <div className="space-y-4">
                    <div className="p-6 border rounded-lg bg-card">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-lg bg-red-100 flex items-center justify-center flex-shrink-0">
                          <FileText className="w-6 h-6 text-red-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold mb-1">File Proposal</h4>
                          <p className="text-sm font-medium truncate">{proposal.fileName}</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {proposal.fileSize
                              ? `Ukuran: ${(proposal.fileSize / 1024 / 1024).toFixed(2)} MB`
                              : ""}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Diupload: {new Date(proposal.updatedAt).toLocaleString('id-ID')}
                          </p>
                        </div>
                        <Button 
                          variant="default" 
                          onClick={handleDownload}
                          className="bg-blue-600 hover:bg-blue-700"
                        >
                          <Download className="w-4 h-4 mr-2" />
                          Download
                        </Button>
                      </div>
                    </div>

                    {/* Additional Info */}
                    <div className="grid gap-4 md:grid-cols-2">
                      <Card>
                        <CardContent className="pt-6">
                          <div className="flex items-center gap-3">
                            <Calendar className="w-5 h-5 text-muted-foreground" />
                            <div>
                              <p className="text-xs text-muted-foreground">Dibuat</p>
                              <p className="text-sm font-medium">
                                {new Date(proposal.createdAt).toLocaleDateString('id-ID')}
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardContent className="pt-6">
                          <div className="flex items-center gap-3">
                            <Edit className="w-5 h-5 text-muted-foreground" />
                            <div>
                              <p className="text-xs text-muted-foreground">Terakhir Diupdate</p>
                              <p className="text-sm font-medium">
                                {new Date(proposal.updatedAt).toLocaleDateString('id-ID')}
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                )}

                {!proposal.filePath && !canEdit && (
                  <div className="text-center py-12">
                    <FileText className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">Belum ada file proposal yang diupload</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Seminar Section (Outside Tabs) */}
        <SeminarSection proposalId={proposal.id} isAdmin={false} />
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialog} onOpenChange={setDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Proposal?</AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Anda yakin ingin menghapus proposal ini? Tindakan ini tidak dapat
              dibatalkan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              Hapus
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Add Member Dialog */}
      <Dialog open={addMemberDialog} onOpenChange={setAddMemberDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Tambah Anggota Tim</DialogTitle>
            <DialogDescription>
              Pilih dosen atau mahasiswa untuk ditambahkan ke tim penelitian.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Tipe Anggota</Label>
              <Select
                value={addMemberForm.type}
                onValueChange={(value: "dosen" | "mahasiswa") => {
                  setAddMemberForm({ type: value, id: "" });
                  setMemberSearchQuery("");
                }}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="dosen">Dosen</SelectItem>
                  <SelectItem value="mahasiswa">Mahasiswa</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Pilih {addMemberForm.type === "dosen" ? "Dosen" : "Mahasiswa"}</Label>
              <Popover open={memberComboOpen} onOpenChange={setMemberComboOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={memberComboOpen}
                    className="w-full justify-between"
                  >
                    {addMemberForm.id
                      ? addMemberForm.type === "dosen"
                        ? availableDosen.find((d) => d.id === addMemberForm.id)?.nama
                        : availableMahasiswa.find((m) => m.id === addMemberForm.id)?.nama
                      : "Pilih anggota..."}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[400px] p-0">
                  <Command>
                    <CommandInput 
                      placeholder={`Cari ${addMemberForm.type === "dosen" ? "dosen" : "mahasiswa"}...`}
                      value={memberSearchQuery}
                      onValueChange={setMemberSearchQuery}
                    />
                    <CommandList>
                      <CommandEmpty>Tidak ada data.</CommandEmpty>
                      <CommandGroup>
                        {addMemberForm.type === "dosen"
                          ? availableDosen
                              .filter((dosen) =>
                                dosen.nama.toLowerCase().includes(memberSearchQuery.toLowerCase()) ||
                                dosen.nidn.toLowerCase().includes(memberSearchQuery.toLowerCase())
                              )
                              .map((dosen) => (
                                <CommandItem
                                  key={dosen.id}
                                  value={dosen.id}
                                  onSelect={() => {
                                    setAddMemberForm({ ...addMemberForm, id: dosen.id });
                                    setMemberComboOpen(false);
                                  }}
                                >
                                  <Check
                                    className={cn(
                                      "mr-2 h-4 w-4",
                                      addMemberForm.id === dosen.id ? "opacity-100" : "opacity-0"
                                    )}
                                  />
                                  <div className="flex flex-col">
                                    <span>{dosen.nama}</span>
                                    <span className="text-xs text-muted-foreground">NIDN: {dosen.nidn}</span>
                                  </div>
                                </CommandItem>
                              ))
                          : availableMahasiswa
                              .filter((mhs) =>
                                mhs.nama.toLowerCase().includes(memberSearchQuery.toLowerCase()) ||
                                mhs.nim.toLowerCase().includes(memberSearchQuery.toLowerCase())
                              )
                              .map((mhs) => (
                                <CommandItem
                                  key={mhs.id}
                                  value={mhs.id}
                                  onSelect={() => {
                                    setAddMemberForm({ ...addMemberForm, id: mhs.id });
                                    setMemberComboOpen(false);
                                  }}
                                >
                                  <Check
                                    className={cn(
                                      "mr-2 h-4 w-4",
                                      addMemberForm.id === mhs.id ? "opacity-100" : "opacity-0"
                                    )}
                                  />
                                  <div className="flex flex-col">
                                    <span>{mhs.nama}</span>
                                    <span className="text-xs text-muted-foreground">NIM: {mhs.nim}</span>
                                  </div>
                                </CommandItem>
                              ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setAddMemberDialog(false)}>
              Batal
            </Button>
            <Button onClick={handleAddMember} disabled={submitting || !addMemberForm.id}>
              {submitting ? "Menambahkan..." : "Tambahkan"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Remove Member Confirmation Dialog */}
      <AlertDialog
        open={removeMemberDialog.open}
        onOpenChange={(open) =>
          setRemoveMemberDialog({ ...removeMemberDialog, open })
        }
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Anggota Tim?</AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Anda yakin ingin menghapus <strong>{removeMemberDialog.name}</strong>{" "}
              dari tim penelitian?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleRemoveMember}
              className="bg-red-600 hover:bg-red-700"
              disabled={submitting}
            >
              {submitting ? "Menghapus..." : "Hapus"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Submit Proposal Confirmation Dialog */}
      <AlertDialog open={submitDialog} onOpenChange={setSubmitDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Submit Proposal?</AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Anda yakin ingin mengajukan proposal ini? Setelah diajukan, 
              proposal tidak dapat diedit lagi dan akan masuk proses review.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={submitting}>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleSubmit}
              className="bg-green-600 hover:bg-green-700"
              disabled={submitting}
            >
              {submitting ? "Mengajukan..." : "Ya, Submit Proposal"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Assign Reviewer Dialog (Admin Only) */}
      <Dialog open={assignReviewerDialog} onOpenChange={setAssignReviewerDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Assign Reviewer</DialogTitle>
            <DialogDescription>
              Pilih minimal 1 reviewer untuk menilai proposal ini. Reviewer akan mendapat notifikasi
              untuk melakukan penilaian.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="text-sm text-muted-foreground">
              Dipilih: {selectedReviewers.length} reviewer (max: 2)
            </div>

            <div className="border rounded-lg divide-y max-h-[400px] overflow-y-auto">
              {(reviewerList || []).map((reviewer) => {
                const isSelected = selectedReviewers.includes(reviewer.id);
                
                return (
                  <div
                    key={reviewer.id}
                    className={`p-4 flex items-center justify-between hover:bg-muted/50 cursor-pointer ${
                      isSelected ? "bg-blue-50" : ""
                    }`}
                    onClick={() => toggleReviewer(reviewer.id)}
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-medium">{reviewer.nama}</p>
                        <Badge variant={reviewer.tipe === "INTERNAL" ? "default" : "secondary"} className="text-xs">
                          {reviewer.tipe}
                        </Badge>
                        {reviewer.status === "NONAKTIF" && (
                          <Badge variant="outline" className="text-xs text-red-600">
                            Non-Aktif
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">Email: {reviewer.email}</p>
                      {reviewer.bidangkeahlian && (
                        <span className="text-xs text-muted-foreground">
                          Bidang: {reviewer.bidangkeahlian.nama}
                        </span>
                      )}
                    </div>
                    {isSelected && (
                      <CheckCircle2 className="w-5 h-5 text-blue-600" />
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setAssignReviewerDialog(false);
              setSelectedReviewers([]);
            }}>
              Batal
            </Button>
            <Button 
              onClick={handleAssignReviewer} 
              disabled={submitting || selectedReviewers.length < 1}
              className="bg-purple-600 hover:bg-purple-700"
            >
              {submitting ? "Menugaskan..." : "Assign Reviewer"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
