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
} from "lucide-react";
import DashboardLayout from "@/components/layout/dashboard-layout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
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
import { useProposalById, useProposalMembers, useDosen, useMahasiswa, useReviewer } from "@/hooks/use-data";
import { proposalApi } from "@/lib/api-client";
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
  const [submitting, setSubmitting] = useState(false);
  const [submitDialog, setSubmitDialog] = useState(false);
  const [assignReviewerDialog, setAssignReviewerDialog] = useState(false);
  const [selectedReviewers, setSelectedReviewers] = useState<string[]>([]);
  const [userRole, setUserRole] = useState<string>("");

  useEffect(() => {
    // Get user role from localStorage
    const role = localStorage.getItem("userRole") || "";
    console.log("🔍 User Role from localStorage:", role);
    setUserRole(role);
  }, []);

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
  console.log("=== DEBUG ASSIGN REVIEWER ===");
  console.log("isAdmin:", isAdmin);
  console.log("status:", status);
  console.log("status === 'diajukan':", status === "diajukan");
  console.log("Condition result:", isAdmin && status === "diajukan");
  console.log("===========================");

  const canEdit = status === "draft";
  const canDelete = status === "draft";
  const canAddMember = status === "draft";
  const canSubmit = status === "draft" && proposal.filePath; // Can submit if draft and has file

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
    if (selectedReviewers.length !== 2) {
      toast.error("Pilih 2 reviewer untuk proposal ini");
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
            {/* Admin: Assign Reviewer (untuk proposal DIAJUKAN) */}
            {isAdmin && status === "diajukan" && (
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
                      {proposal.bidangKeahlian?.nama || "-"}
                    </p>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                      <FileText className="w-4 h-4" />
                      Dana Hibah
                    </label>
                    <p className="mt-1 font-medium">
                      {proposal.skema?.dana
                        ? `Rp ${proposal.skema.dana.toLocaleString("id-ID")}`
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

            {/* Seminar Section */}
            {(status === "diajukan" || status === "direview" || status === "diterima" || status === "berjalan" || status === "selesai") && (
              <SeminarSection proposalId={id as string} isAdmin={isAdmin} />
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Team Members */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Users className="w-5 h-5" />
                    Anggota Tim
                  </CardTitle>
                  {canAddMember && (members || []).length < 4 && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setAddMemberDialog(true)}
                    >
                      <UserPlus className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {(members || []).length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    Belum ada anggota tim
                  </p>
                ) : (
                  <div className="space-y-3">
                    {(members || []).map((member, index) => (
                      <div
                        key={member.id}
                        className="flex items-start justify-between gap-2 p-3 rounded-lg border bg-card"
                      >
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="font-medium text-sm truncate">
                              {member.dosen?.nama || member.mahasiswa?.nama}
                            </p>
                            {member.role === "ketua" && (
                              <Badge variant="secondary" className="text-xs">
                                Ketua
                              </Badge>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {member.dosen
                              ? `NIDN: ${member.dosen.nidn}`
                              : `NIM: ${member.mahasiswa?.nim}`}
                          </p>
                        </div>
                        {canAddMember && member.role !== "ketua" && (
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-6 w-6 p-0 text-muted-foreground hover:text-red-600"
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
                {canAddMember && (members || []).length >= 4 && (
                  <p className="text-xs text-muted-foreground text-center mt-3">
                    Maksimal 4 anggota tim
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Timeline */}
            <Card>
              <CardHeader>
                <CardTitle>Timeline</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex gap-3">
                    <div className="flex flex-col items-center">
                      <div className="w-2 h-2 rounded-full bg-primary"></div>
                      <div className="w-0.5 h-full bg-border"></div>
                    </div>
                    <div className="flex-1 pb-4">
                      <p className="text-sm font-medium">Dibuat</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(proposal.createdAt).toLocaleString("id-ID")}
                      </p>
                    </div>
                  </div>

                  {proposal.updatedAt !== proposal.createdAt && (
                    <div className="flex gap-3">
                      <div className="flex flex-col items-center">
                        <div className="w-2 h-2 rounded-full bg-primary"></div>
                        <div className="w-0.5 h-full bg-border"></div>
                      </div>
                      <div className="flex-1 pb-4">
                        <p className="text-sm font-medium">Terakhir Diubah</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(proposal.updatedAt).toLocaleString("id-ID")}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Pencairan Dana Section - Only show if proposal DITERIMA/BERJALAN/SELESAI */}
            {['DITERIMA', 'BERJALAN', 'SELESAI'].includes(proposal.status) && (
              <PencairanSection proposalId={proposal.id} />
            )}

            {/* Luaran Section - Only show if proposal BERJALAN/SELESAI */}
            <LuaranSection proposalId={proposal.id} proposalStatus={proposal.status} />
          </div>
        </div>
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
              <Select
                value={addMemberForm.id}
                onValueChange={(value) =>
                  setAddMemberForm({ ...addMemberForm, id: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Pilih anggota..." />
                </SelectTrigger>
                <SelectContent>
                  {addMemberForm.type === "dosen"
                    ? availableDosen.map((dosen) => (
                        <SelectItem key={dosen.id} value={dosen.id}>
                          {dosen.nama} ({dosen.nidn})
                        </SelectItem>
                      ))
                    : availableMahasiswa.map((mhs) => (
                        <SelectItem key={mhs.id} value={mhs.id}>
                          {mhs.nama} ({mhs.nim})
                        </SelectItem>
                      ))}
                </SelectContent>
              </Select>
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
              Pilih 2 reviewer untuk menilai proposal ini. Reviewer akan mendapat notifikasi
              untuk melakukan penilaian.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="text-sm text-muted-foreground">
              Dipilih: {selectedReviewers.length}/2 reviewer
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
                      {reviewer.bidangKeahlian && (
                        <p className="text-sm text-muted-foreground">
                          Bidang: {reviewer.bidangKeahlian.nama}
                        </p>
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
              disabled={submitting || selectedReviewers.length !== 2}
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
