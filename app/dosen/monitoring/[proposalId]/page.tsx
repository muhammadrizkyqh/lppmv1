"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Download,
  Calendar,
  FileText,
  Award,
  CheckCircle2,
  Clock,
  AlertCircle,
  Upload,
  Save,
  Eye,
} from "lucide-react";
import DashboardLayout from "@/components/layout/dashboard-layout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { monitoringApi, MonitoringDetail } from "@/lib/api-client";
import { toast } from "sonner";

export default function DosenMonitoringDetailPage() {
  const params = useParams();
  const router = useRouter();
  const proposalId = params.proposalId as string;

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<MonitoringDetail | null>(null);
  const [uploading, setUploading] = useState(false);
  
  // Form state for laporan kemajuan
  const [kemajuanForm, setKemajuanForm] = useState({
    laporanKemajuan: "",
    fileKemajuan: "",
    persentaseKemajuan: 0,
  });

  // Form state for laporan akhir
  const [akhirForm, setAkhirForm] = useState({
    laporanAkhir: "",
    fileAkhir: "",
  });

  useEffect(() => {
    loadMonitoring();
  }, [proposalId]);

  const loadMonitoring = async () => {
    try {
      setLoading(true);
      const response = await monitoringApi.getMonitoring(proposalId);
      
      if (response.success && response.data) {
        setData(response.data);
        
        // Pre-fill forms if data exists
        if (response.data.monitoring) {
          const m = response.data.monitoring;
          setKemajuanForm({
            laporanKemajuan: m.laporanKemajuan || "",
            fileKemajuan: m.fileKemajuan || "",
            persentaseKemajuan: m.persentaseKemajuan || 0,
          });
          setAkhirForm({
            laporanAkhir: m.laporanAkhir || "",
            fileAkhir: m.fileAkhir || "",
          });
        }
      } else {
        toast.error(response.error || "Gagal memuat data monitoring");
        router.push("/dosen/monitoring");
      }
    } catch (error) {
      console.error("Error loading monitoring:", error);
      toast.error("Terjadi kesalahan saat memuat data");
      router.push("/dosen/monitoring");
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    type: "kemajuan" | "akhir"
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast.error("Ukuran file maksimal 10MB");
      return;
    }

    // Validate file type (PDF only)
    if (file.type !== "application/pdf") {
      toast.error("Hanya file PDF yang diperbolehkan");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Upload failed");
      }

      const result = await response.json();
      
      if (type === "kemajuan") {
        setKemajuanForm(prev => ({ ...prev, fileKemajuan: result.data.filePath }));
        toast.success("File laporan kemajuan berhasil diupload");
      } else {
        setAkhirForm(prev => ({ ...prev, fileAkhir: result.data.filePath }));
        toast.success("File laporan akhir berhasil diupload");
      }
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Gagal mengupload file");
    }
  };

  const handleSubmitKemajuan = async () => {
    if (!kemajuanForm.laporanKemajuan.trim()) {
      toast.error("Laporan kemajuan harus diisi");
      return;
    }

    if (!kemajuanForm.fileKemajuan || kemajuanForm.fileKemajuan.trim() === '') {
      toast.error("File laporan kemajuan harus diupload terlebih dahulu");
      return;
    }

    if (kemajuanForm.persentaseKemajuan < 1 || kemajuanForm.persentaseKemajuan > 100) {
      toast.error("Persentase kemajuan harus antara 1-100");
      return;
    }

    try {
      setUploading(true);
      const response = await monitoringApi.uploadKemajuan(proposalId, kemajuanForm);
      
      if (response.success) {
        toast.success("Laporan kemajuan berhasil disubmit");
        loadMonitoring(); // Reload data
      } else {
        toast.error(response.error || "Gagal submit laporan kemajuan");
      }
    } catch (error: any) {
      console.error("Submit error:", error);
      toast.error(error.message || "Terjadi kesalahan");
    } finally {
      setUploading(false);
    }
  };

  const handleSubmitAkhir = async () => {
    if (!akhirForm.laporanAkhir.trim()) {
      toast.error("Laporan akhir harus diisi");
      return;
    }

    if (!akhirForm.fileAkhir || akhirForm.fileAkhir.trim() === '') {
      toast.error("File laporan akhir harus diupload terlebih dahulu");
      return;
    }

    if (!data?.monitoring?.laporanKemajuan) {
      toast.error("Laporan kemajuan harus disubmit terlebih dahulu");
      return;
    }

    try {
      setUploading(true);
      const response = await monitoringApi.uploadAkhir(proposalId, akhirForm);
      
      if (response.success) {
        toast.success("Laporan akhir berhasil disubmit");
        loadMonitoring(); // Reload data
      } else {
        toast.error(response.error || "Gagal submit laporan akhir");
      }
    } catch (error: any) {
      console.error("Submit error:", error);
      toast.error(error.message || "Terjadi kesalahan");
    } finally {
      setUploading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusMap = {
      DITERIMA: { label: "Diterima", variant: "default" as const },
      BERJALAN: { label: "Berjalan", variant: "default" as const },
      SELESAI: { label: "Selesai", variant: "secondary" as const },
    };
    const statusInfo = statusMap[status as keyof typeof statusMap] || { label: status, variant: "default" as const };
    return <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>;
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Memuat data monitoring...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (!data) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Data Tidak Ditemukan</h3>
            <p className="text-muted-foreground mb-4">
              Data monitoring tidak ditemukan atau Anda tidak memiliki akses.
            </p>
            <Button asChild>
              <Link href="/dosen/monitoring">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Kembali
              </Link>
            </Button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const { proposal, monitoring } = data;
  const hasKemajuan = !!monitoring?.laporanKemajuan;
  const hasAkhir = !!monitoring?.laporanAkhir;
  const progress = monitoring?.persentaseKemajuan || 0;
  
  // Check if rejected - allow re-upload
  const kemajuanRejected = monitoring?.verifikasiKemajuanStatus === 'REJECTED';
  const akhirRejected = monitoring?.verifikasiAkhirStatus === 'REJECTED';
  const kemajuanApproved = monitoring?.verifikasiKemajuanStatus === 'APPROVED';
  
  // Form should be disabled only if approved, not if rejected
  const kemajuanDisabled = hasKemajuan && !kemajuanRejected;
  const akhirDisabled = hasAkhir && !akhirRejected;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="outline" size="icon" asChild>
              <Link href="/dosen/monitoring">
                <ArrowLeft className="w-4 h-4" />
              </Link>
            </Button>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Monitoring Proposal</h1>
              <p className="text-muted-foreground">
                Kelola laporan kemajuan dan laporan akhir
              </p>
            </div>
          </div>
        </div>

        {/* Proposal Info Card */}
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="space-y-1 flex-1">
                <CardTitle className="text-xl">{proposal.judul}</CardTitle>
                <CardDescription>
                  <div className="flex flex-wrap items-center gap-2 mt-2">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {proposal.periode?.nama} ({proposal.periode?.tahun})
                    </div>
                    <span>•</span>
                    <div className="flex items-center gap-1">
                      <Award className="w-4 h-4" />
                      {proposal.skema?.nama}
                    </div>
                    {proposal.bidangkeahlian && (
                      <>
                        <span>•</span>
                        <div className="flex items-center gap-1">
                          <FileText className="w-4 h-4" />
                          {proposal.bidangkeahlian.nama}
                        </div>
                      </>
                    )}
                  </div>
                </CardDescription>
              </div>
              <div className="flex flex-col items-end gap-2">
                {getStatusBadge(proposal.status)}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Progress Keseluruhan:</span>
                <span className="font-medium">{progress}%</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>
          </CardContent>
        </Card>

        {/* Timeline / Status */}
        <Card>
          <CardHeader>
            <CardTitle>Timeline Monitoring</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <div className={`flex items-center gap-2 ${hasKemajuan ? 'text-green-600' : 'text-gray-400'}`}>
                {hasKemajuan ? (
                  <CheckCircle2 className="w-5 h-5" />
                ) : (
                  <Clock className="w-5 h-5" />
                )}
                <span className="font-medium">Laporan Kemajuan</span>
              </div>
              <div className="flex-1 h-px bg-border" />
              <div className={`flex items-center gap-2 ${hasAkhir ? 'text-green-600' : 'text-gray-400'}`}>
                {hasAkhir ? (
                  <CheckCircle2 className="w-5 h-5" />
                ) : (
                  <Clock className="w-5 h-5" />
                )}
                <span className="font-medium">Laporan Akhir</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Laporan Kemajuan Section */}
        <Card>
          <CardHeader>
            <CardTitle>Laporan Kemajuan</CardTitle>
            <CardDescription>
              Upload laporan progress penelitian Anda. Upload file PDF terlebih dahulu sebelum submit.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="laporanKemajuan">Isi Laporan Kemajuan *</Label>
              <Textarea
                id="laporanKemajuan"
                placeholder="Tuliskan laporan kemajuan penelitian..."
                value={kemajuanForm.laporanKemajuan}
                onChange={(e) => setKemajuanForm(prev => ({ ...prev, laporanKemajuan: e.target.value }))}
                rows={6}
                disabled={kemajuanDisabled}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="persentaseKemajuan">Persentase Kemajuan (%) *</Label>
              <Input
                id="persentaseKemajuan"
                type="number"
                min="1"
                max="100"
                placeholder="0-100"
                value={kemajuanForm.persentaseKemajuan}
                onChange={(e) => setKemajuanForm(prev => ({ 
                  ...prev, 
                  persentaseKemajuan: parseInt(e.target.value) || 0 
                }))}
                disabled={kemajuanDisabled}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="fileKemajuan">File Laporan (PDF) *</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="fileKemajuan"
                  type="file"
                  accept="application/pdf"
                  onChange={(e) => handleFileUpload(e, "kemajuan")}
                  disabled={kemajuanDisabled}
                />
                {kemajuanForm.fileKemajuan && (
                  <Button variant="outline" size="icon" asChild>
                    <a href={kemajuanForm.fileKemajuan} target="_blank" rel="noopener noreferrer">
                      <Eye className="w-4 h-4" />
                    </a>
                  </Button>
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                Format: PDF, Maksimal 10MB (Wajib diupload)
              </p>
            </div>

            {(!hasKemajuan || kemajuanRejected) && (
              <Button onClick={handleSubmitKemajuan} disabled={uploading} className="w-full">
                <Save className="w-4 h-4 mr-2" />
                {uploading ? "Menyimpan..." : kemajuanRejected ? "Submit Ulang Laporan Kemajuan" : "Submit Laporan Kemajuan"}
              </Button>
            )}

            {hasKemajuan && (
              <div className="space-y-3">
                <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                  <CheckCircle2 className="w-5 h-5 text-green-600" />
                  <span className="text-sm text-green-800 font-medium">
                    Laporan kemajuan sudah disubmit
                  </span>
                </div>
                
                {/* Verification Status */}
                {monitoring?.verifikasiKemajuanAt && (
                  <div className={`p-3 rounded-lg border ${
                    monitoring.verifikasiKemajuanStatus === 'APPROVED' 
                      ? 'bg-green-50 border-green-200' 
                      : 'bg-red-50 border-red-200'
                  }`}>
                    <div className="flex items-start gap-2">
                      {monitoring.verifikasiKemajuanStatus === 'APPROVED' ? (
                        <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5" />
                      ) : (
                        <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
                      )}
                      <div className="flex-1">
                        <p className={`text-sm font-medium ${
                          monitoring.verifikasiKemajuanStatus === 'APPROVED' 
                            ? 'text-green-800' 
                            : 'text-red-800'
                        }`}>
                          {monitoring.verifikasiKemajuanStatus === 'APPROVED' 
                            ? '✓ Laporan kemajuan disetujui admin' 
                            : '✗ Laporan kemajuan ditolak admin'}
                        </p>
                        {monitoring.catatanKemajuan && (
                          <p className="text-xs mt-1 text-muted-foreground">
                            Catatan: {monitoring.catatanKemajuan}
                          </p>
                        )}
                        <p className="text-xs mt-1 text-muted-foreground">
                          {new Date(monitoring.verifikasiKemajuanAt).toLocaleDateString('id-ID', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
                
                {!monitoring?.verifikasiKemajuanAt && (
                  <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Clock className="w-5 h-5 text-yellow-600" />
                      <span className="text-sm text-yellow-800">
                        Menunggu verifikasi dari admin
                      </span>
                    </div>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Laporan Akhir Section */}
        <Card>
          <CardHeader>
            <CardTitle>Laporan Akhir</CardTitle>
            <CardDescription>
              Upload laporan akhir penelitian setelah selesai. Upload file PDF terlebih dahulu sebelum submit.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {!hasKemajuan && (
              <div className="flex items-center gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <AlertCircle className="w-5 h-5 text-yellow-600" />
                <span className="text-sm text-yellow-800">
                  Laporan kemajuan harus disubmit terlebih dahulu
                </span>
              </div>
            )}
            
            {hasKemajuan && !monitoring?.verifikasiKemajuanAt && (
              <div className="flex items-center gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <Clock className="w-5 h-5 text-yellow-600" />
                <span className="text-sm text-yellow-800">
                  Menunggu laporan kemajuan disetujui admin terlebih dahulu
                </span>
              </div>
            )}
            
            {hasKemajuan && monitoring?.verifikasiKemajuanAt && monitoring?.verifikasiKemajuanStatus !== 'APPROVED' && (
              <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                <AlertCircle className="w-5 h-5 text-red-600" />
                <span className="text-sm text-red-800">
                  Laporan kemajuan ditolak. Silakan revisi dan submit ulang laporan kemajuan terlebih dahulu.
                </span>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="laporanAkhir">Isi Laporan Akhir *</Label>
              <Textarea
                id="laporanAkhir"
                placeholder="Tuliskan laporan akhir penelitian..."
                value={akhirForm.laporanAkhir}
                onChange={(e) => setAkhirForm(prev => ({ ...prev, laporanAkhir: e.target.value }))}
                rows={6}
                disabled={!hasKemajuan || akhirDisabled || !monitoring?.verifikasiKemajuanAt || monitoring?.verifikasiKemajuanStatus !== 'APPROVED'}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="fileAkhir">File Laporan (PDF) *</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="fileAkhir"
                  type="file"
                  accept="application/pdf"
                  onChange={(e) => handleFileUpload(e, "akhir")}
                  disabled={!hasKemajuan || akhirDisabled || !monitoring?.verifikasiKemajuanAt || monitoring?.verifikasiKemajuanStatus !== 'APPROVED'}
                />
                {akhirForm.fileAkhir && (
                  <Button variant="outline" size="icon" asChild>
                    <a href={akhirForm.fileAkhir} target="_blank" rel="noopener noreferrer">
                      <Eye className="w-4 h-4" />
                    </a>
                  </Button>
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                Format: PDF, Maksimal 10MB (Wajib diupload)
              </p>
            </div>

            {hasKemajuan && (!hasAkhir || akhirRejected) && monitoring?.verifikasiKemajuanAt && monitoring?.verifikasiKemajuanStatus === 'APPROVED' && (
              <Button onClick={handleSubmitAkhir} disabled={uploading} className="w-full">
                <Save className="w-4 h-4 mr-2" />
                {uploading ? "Menyimpan..." : akhirRejected ? "Submit Ulang Laporan Akhir" : "Submit Laporan Akhir"}
              </Button>
            )}

            {hasAkhir && (
              <div className="space-y-3">
                {/* Show success only if approved */}
                {monitoring?.verifikasiAkhirStatus === 'APPROVED' && (
                  <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                    <CheckCircle2 className="w-5 h-5 text-green-600" />
                    <span className="text-sm text-green-800 font-medium">
                      ✓ Laporan akhir disetujui - Penelitian selesai!
                    </span>
                  </div>
                )}
                
                {/* Verification Status for Laporan Akhir */}
                {monitoring?.verifikasiAkhirAt && (
                  <div className={`p-3 rounded-lg border ${
                    monitoring.verifikasiAkhirStatus === 'APPROVED' 
                      ? 'bg-green-50 border-green-200' 
                      : 'bg-red-50 border-red-200'
                  }`}>
                    <div className="flex items-start gap-2">
                      {monitoring.verifikasiAkhirStatus === 'APPROVED' ? (
                        <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5" />
                      ) : (
                        <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
                      )}
                      <div className="flex-1">
                        <p className={`text-sm font-medium ${
                          monitoring.verifikasiAkhirStatus === 'APPROVED' 
                            ? 'text-green-800' 
                            : 'text-red-800'
                        }`}>
                          {monitoring.verifikasiAkhirStatus === 'APPROVED' 
                            ? '✓ Laporan akhir disetujui admin' 
                            : '✗ Laporan akhir ditolak admin'}
                        </p>
                        {monitoring.catatanAkhir && (
                          <p className="text-xs mt-1 text-muted-foreground">
                            Catatan: {monitoring.catatanAkhir}
                          </p>
                        )}
                        <p className="text-xs mt-1 text-muted-foreground">
                          {new Date(monitoring.verifikasiAkhirAt).toLocaleDateString('id-ID', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
                
                {!monitoring?.verifikasiAkhirAt && (
                  <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Clock className="w-5 h-5 text-yellow-600" />
                      <span className="text-sm text-yellow-800">
                        Menunggu verifikasi dari admin
                      </span>
                    </div>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
