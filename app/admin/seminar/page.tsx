"use client";

import DashboardLayout from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Calendar,
  Clock,
  MapPin,
  Presentation,
  Users,
  Plus,
  Edit,
  Trash2,
  Eye,
  Download,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { seminarApi, proposalApi, SeminarList, ProposalList } from "@/lib/api-client";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

type JenisSeminar = "PROPOSAL" | "INTERNAL" | "PUBLIK";
type StatusSeminar = "SCHEDULED" | "SELESAI" | "DIBATALKAN";

export default function SeminarPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<JenisSeminar>("PROPOSAL");
  const [seminars, setSeminars] = useState<SeminarList[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedSeminar, setSelectedSeminar] = useState<SeminarList | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    proposalId: "",
    jenis: "PROPOSAL" as JenisSeminar,
    tanggal: "",
    waktu: "",
    tempat: "",
    linkOnline: "",
    keterangan: "",
  });

  // Proposals for dropdown
  const [availableProposals, setAvailableProposals] = useState<ProposalList[]>([]);

  useEffect(() => {
    fetchSeminars();
  }, [activeTab]);

  useEffect(() => {
    if (dialogOpen && !editMode) {
      fetchAvailableProposals();
    }
  }, [dialogOpen, editMode, activeTab]);

  const fetchSeminars = async () => {
    try {
      setLoading(true);
      const response = await seminarApi.list({ jenis: activeTab });
      if (response.success && response.data) {
        setSeminars(response.data);
      }
    } catch (error) {
      toast.error("Gagal memuat data seminar");
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailableProposals = async () => {
    try {
      let status = "";
      
      if (activeTab === "PROPOSAL") {
        // Hanya proposal yang lolos administratif
        const response = await proposalApi.list({ status: "DIAJUKAN" });
        if (response.success && response.data) {
          // Filter only LOLOS administratif
          const filtered = response.data.filter(
            (p: any) => p.statusAdministrasi === "LOLOS"
          );
          setAvailableProposals(filtered);
        }
      } else if (activeTab === "INTERNAL") {
        // Proposal yang sudah DIREVIEW dan monitoring Bab IV approved
        const response = await proposalApi.list({ status: "BERJALAN" });
        if (response.success && response.data) {
          setAvailableProposals(response.data);
        }
      } else if (activeTab === "PUBLIK") {
        // Proposal yang luaran sudah verified
        const response = await proposalApi.list({ status: "BERJALAN" });
        if (response.success && response.data) {
          setAvailableProposals(response.data);
        }
      }
    } catch (error) {
      toast.error("Gagal memuat proposal");
    }
  };

  const handleOpenDialog = (seminar?: SeminarList) => {
    if (seminar) {
      setEditMode(true);
      setSelectedSeminar(seminar);
      setFormData({
        proposalId: seminar.proposalId,
        jenis: seminar.jenis as JenisSeminar,
        tanggal: seminar.tanggal.split("T")[0],
        waktu: seminar.waktu || "",
        tempat: seminar.tempat || "",
        linkOnline: seminar.linkOnline || "",
        keterangan: seminar.keterangan || "",
      });
    } else {
      setEditMode(false);
      setSelectedSeminar(null);
      setFormData({
        proposalId: "",
        jenis: activeTab,
        tanggal: "",
        waktu: "",
        tempat: "",
        linkOnline: "",
        keterangan: "",
      });
    }
    setDialogOpen(true);
  };

  const handleSubmit = async () => {
    if (!formData.proposalId || !formData.tanggal || !formData.waktu) {
      toast.error("Proposal, tanggal, dan waktu harus diisi");
      return;
    }

    try {
      setSubmitting(true);
      
      if (editMode && selectedSeminar) {
        const response = await seminarApi.update(selectedSeminar.id, {
          tanggal: new Date(formData.tanggal).toISOString(),
          waktu: formData.waktu,
          tempat: formData.tempat,
          linkOnline: formData.linkOnline,
          keterangan: formData.keterangan,
        });

        if (response.success) {
          toast.success("Seminar berhasil diupdate");
          setDialogOpen(false);
          fetchSeminars();
        } else {
          toast.error(response.error || "Gagal mengupdate seminar");
        }
      } else {
        const response = await seminarApi.create({
          proposalId: formData.proposalId,
          jenis: formData.jenis,
          tanggal: new Date(formData.tanggal).toISOString(),
          waktu: formData.waktu,
          tempat: formData.tempat,
          linkOnline: formData.linkOnline,
          keterangan: formData.keterangan,
        });

        if (response.success) {
          toast.success("Seminar berhasil dijadwalkan");
          setDialogOpen(false);
          fetchSeminars();
        } else {
          toast.error(response.error || "Gagal menjadwalkan seminar");
        }
      }
    } catch (error) {
      toast.error("Terjadi kesalahan");
    } finally {
      setSubmitting(false);
    }
  };

  const handleMarkSelesai = async (seminarId: string) => {
    try {
      const response = await seminarApi.update(seminarId, { status: "SELESAI" });
      if (response.success) {
        toast.success("Seminar ditandai selesai");
        fetchSeminars();
      } else {
        toast.error(response.error || "Gagal mengupdate status");
      }
    } catch (error) {
      toast.error("Terjadi kesalahan");
    }
  };

  const handleCancel = async (seminarId: string) => {
    try {
      const response = await seminarApi.cancel(seminarId);
      if (response.success) {
        toast.success("Seminar dibatalkan");
        fetchSeminars();
      } else {
        toast.error(response.error || "Gagal membatalkan seminar");
      }
    } catch (error) {
      toast.error("Terjadi kesalahan");
    }
  };

  const getStatusBadge = (status: StatusSeminar) => {
    const config = {
      SCHEDULED: { label: "Terjadwal", variant: "outline" as const, className: "text-blue-600 border-blue-200" },
      SELESAI: { label: "Selesai", variant: "outline" as const, className: "text-green-600 border-green-200" },
      DIBATALKAN: { label: "Dibatalkan", variant: "outline" as const, className: "text-red-600 border-red-200" },
    };

    const cfg = config[status] || config.SCHEDULED;
    return (
      <Badge variant={cfg.variant} className={cfg.className}>
        {cfg.label}
      </Badge>
    );
  };

  const stats = {
    PROPOSAL: {
      label: "Seminar Proposal",
      description: "Presentasi proposal penelitian baru",
      icon: Presentation,
      color: "text-blue-600",
    },
    INTERNAL: {
      label: "Seminar Internal",
      description: "Presentasi hasil penelitian (Bab IV)",
      icon: Users,
      color: "text-purple-600",
    },
    PUBLIK: {
      label: "Seminar Publik",
      description: "Publikasi hasil penelitian",
      icon: Calendar,
      color: "text-green-600",
    },
  };

  const currentStats = stats[activeTab];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Jadwal Seminar</h1>
            <p className="text-muted-foreground mt-2">
              Kelola jadwal seminar proposal, internal, dan publik
            </p>
          </div>
          <Button onClick={() => handleOpenDialog()}>
            <Plus className="w-4 h-4 mr-2" />
            Jadwalkan Seminar
          </Button>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as JenisSeminar)}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="PROPOSAL">
              <Presentation className="w-4 h-4 mr-2" />
              Seminar Proposal
            </TabsTrigger>
            <TabsTrigger value="INTERNAL">
              <Users className="w-4 h-4 mr-2" />
              Seminar Internal
            </TabsTrigger>
            <TabsTrigger value="PUBLIK">
              <Calendar className="w-4 h-4 mr-2" />
              Seminar Publik
            </TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="space-y-4">
            {/* Stats Card */}
            <Card className="border-0 shadow-sm">
              <CardContent className="p-6">
                <div className="flex items-center space-x-4">
                  <div className="p-3 rounded-lg bg-primary/10">
                    <currentStats.icon className={`w-8 h-8 ${currentStats.color}`} />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold">{currentStats.label}</h3>
                    <p className="text-sm text-muted-foreground">{currentStats.description}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-3xl font-bold text-primary">{seminars.length}</p>
                    <p className="text-sm text-muted-foreground">Total Seminar</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Seminars Table */}
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle>Daftar {currentStats.label}</CardTitle>
                <CardDescription>
                  {seminars.filter(s => s.status === "SCHEDULED").length} seminar terjadwal,{" "}
                  {seminars.filter(s => s.status === "SELESAI").length} selesai
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="text-center py-8 text-muted-foreground">Memuat data...</div>
                ) : seminars.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    Belum ada seminar yang dijadwalkan
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Proposal</TableHead>
                        <TableHead>Ketua</TableHead>
                        <TableHead>Tanggal & Waktu</TableHead>
                        <TableHead>Tempat</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Aksi</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {seminars.map((seminar) => (
                        <TableRow key={seminar.id}>
                          <TableCell className="font-medium max-w-md">
                            <div className="line-clamp-2">{seminar.proposal?.judul || "-"}</div>
                          </TableCell>
                          <TableCell>{seminar.proposal?.dosen?.nama || "-"}</TableCell>
                          <TableCell>
                            <div className="space-y-1">
                              <div className="flex items-center text-sm">
                                <Calendar className="w-3 h-3 mr-1" />
                                {new Date(seminar.tanggal).toLocaleDateString("id-ID")}
                              </div>
                              <div className="flex items-center text-sm text-muted-foreground">
                                <Clock className="w-3 h-3 mr-1" />
                                {seminar.waktu}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="space-y-1">
                              {seminar.tempat && (
                                <div className="flex items-center text-sm">
                                  <MapPin className="w-3 h-3 mr-1" />
                                  {seminar.tempat}
                                </div>
                              )}
                              {seminar.linkOnline && (
                                <a
                                  href={seminar.linkOnline}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-xs text-blue-600 hover:underline"
                                >
                                  Link Online
                                </a>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>{getStatusBadge(seminar.status as StatusSeminar)}</TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              {seminar.status === "SCHEDULED" && (
                                <>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleOpenDialog(seminar)}
                                  >
                                    <Edit className="w-4 h-4" />
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="text-green-600"
                                    onClick={() => handleMarkSelesai(seminar.id)}
                                  >
                                    <CheckCircle className="w-4 h-4" />
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="text-red-600"
                                    onClick={() => handleCancel(seminar.id)}
                                  >
                                    <XCircle className="w-4 h-4" />
                                  </Button>
                                </>
                              )}
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => router.push(`/admin/proposals/${seminar.proposalId}`)}
                              >
                                <Eye className="w-4 h-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Dialog Form */}
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editMode ? "Edit Seminar" : `Jadwalkan ${stats[formData.jenis].label}`}
              </DialogTitle>
              <DialogDescription>
                {editMode
                  ? "Update informasi seminar"
                  : `Jadwalkan ${stats[formData.jenis].label.toLowerCase()} untuk proposal penelitian`}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              {/* Proposal Selection (only for create) */}
              {!editMode && (
                <div className="space-y-2">
                  <Label htmlFor="proposalId">Proposal *</Label>
                  <Select value={formData.proposalId} onValueChange={(v) => setFormData({ ...formData, proposalId: v })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih proposal..." />
                    </SelectTrigger>
                    <SelectContent>
                      {availableProposals.map((p) => (
                        <SelectItem key={p.id} value={p.id}>
                          <div className="flex flex-col">
                            <span className="font-medium">{p.judul}</span>
                            <span className="text-xs text-muted-foreground">
                              {p.dosen?.nama} - {p.skema?.nama}
                            </span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Tanggal */}
              <div className="space-y-2">
                <Label htmlFor="tanggal">Tanggal *</Label>
                <Input
                  id="tanggal"
                  type="date"
                  value={formData.tanggal}
                  onChange={(e) => setFormData({ ...formData, tanggal: e.target.value })}
                />
              </div>

              {/* Waktu */}
              <div className="space-y-2">
                <Label htmlFor="waktu">Waktu *</Label>
                <Input
                  id="waktu"
                  type="time"
                  value={formData.waktu}
                  onChange={(e) => setFormData({ ...formData, waktu: e.target.value })}
                />
              </div>

              {/* Tempat */}
              <div className="space-y-2">
                <Label htmlFor="tempat">Tempat</Label>
                <Input
                  id="tempat"
                  placeholder="Ruang seminar, gedung, dll."
                  value={formData.tempat}
                  onChange={(e) => setFormData({ ...formData, tempat: e.target.value })}
                />
              </div>

              {/* Link Online */}
              <div className="space-y-2">
                <Label htmlFor="linkOnline">Link Online (Zoom/Meet)</Label>
                <Input
                  id="linkOnline"
                  type="url"
                  placeholder="https://..."
                  value={formData.linkOnline}
                  onChange={(e) => setFormData({ ...formData, linkOnline: e.target.value })}
                />
              </div>

              {/* Keterangan */}
              <div className="space-y-2">
                <Label htmlFor="keterangan">Keterangan</Label>
                <Textarea
                  id="keterangan"
                  placeholder="Catatan tambahan..."
                  rows={3}
                  value={formData.keterangan}
                  onChange={(e) => setFormData({ ...formData, keterangan: e.target.value })}
                />
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setDialogOpen(false)} disabled={submitting}>
                Batal
              </Button>
              <Button onClick={handleSubmit} disabled={submitting}>
                {submitting ? "Menyimpan..." : editMode ? "Update" : "Jadwalkan"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
