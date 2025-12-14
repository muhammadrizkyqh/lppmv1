"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Calendar,
  FileText,
  Award,
  CheckCircle2,
  Clock,
  AlertCircle,
  Eye,
  ThumbsUp,
  ThumbsDown,
  Download,
} from "lucide-react";
import DashboardLayout from "@/components/layout/dashboard-layout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { monitoringApi, MonitoringDetail } from "@/lib/api-client";
import { toast } from "sonner";

export default function AdminMonitoringDetailPage() {
  const params = useParams();
  const router = useRouter();
  const proposalId = params.proposalId as string;

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<MonitoringDetail | null>(null);
  const [verifyDialog, setVerifyDialog] = useState<{
    open: boolean;
    type: 'kemajuan' | 'akhir';
    approved: boolean;
  }>({
    open: false,
    type: 'kemajuan',
    approved: true,
  });
  const [catatan, setCatatan] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadMonitoring();
  }, [proposalId]);

  const loadMonitoring = async () => {
    try {
      setLoading(true);
      const response = await monitoringApi.getMonitoring(proposalId);
      
      if (response.success && response.data) {
        setData(response.data);
      } else {
        toast.error(response.error || "Gagal memuat data monitoring");
        router.push("/admin/monitoring");
      }
    } catch (error) {
      console.error("Error loading monitoring:", error);
      toast.error("Terjadi kesalahan saat memuat data");
      router.push("/admin/monitoring");
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async () => {
    try {
      setSubmitting(true);
      const response = await monitoringApi.verifyMonitoring(proposalId, {
        type: verifyDialog.type,
        approved: verifyDialog.approved,
        catatan: catatan.trim() || undefined,
      });
      
      if (response.success) {
        toast.success(`Laporan ${verifyDialog.type} berhasil ${verifyDialog.approved ? 'disetujui' : 'ditolak'}`);
        setVerifyDialog({ open: false, type: 'kemajuan', approved: true });
        setCatatan("");
        loadMonitoring(); // Reload data
      } else {
        toast.error(response.error || "Gagal memverifikasi laporan");
      }
    } catch (error: any) {
      console.error("Verify error:", error);
      toast.error(error.message || "Terjadi kesalahan");
    } finally {
      setSubmitting(false);
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
              Data monitoring tidak ditemukan
            </p>
            <Button asChild>
              <Link href="/admin/monitoring">
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

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="outline" size="icon" asChild>
              <Link href="/admin/monitoring">
                <ArrowLeft className="w-4 h-4" />
              </Link>
            </Button>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Detail Monitoring</h1>
              <p className="text-muted-foreground">
                Verifikasi laporan monitoring proposal
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
                    <span className="font-medium">{proposal.dosen?.nama}</span>
                    <span>•</span>
                    <span>{proposal.dosen?.nidn}</span>
                    <span>•</span>
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
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Laporan Kemajuan</CardTitle>
                <CardDescription>
                  Review dan verifikasi laporan progress penelitian
                </CardDescription>
              </div>
              {hasKemajuan && !monitoring?.verifikasiKemajuanAt && (
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setVerifyDialog({ open: true, type: 'kemajuan', approved: false });
                      setCatatan("");
                    }}
                  >
                    <ThumbsDown className="w-4 h-4 mr-2" />
                    Tolak
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => {
                      setVerifyDialog({ open: true, type: 'kemajuan', approved: true });
                      setCatatan("");
                    }}
                  >
                    <ThumbsUp className="w-4 h-4 mr-2" />
                    Setujui
                  </Button>
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {!hasKemajuan ? (
              <div className="flex items-center gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <AlertCircle className="w-5 h-5 text-yellow-600" />
                <span className="text-sm text-yellow-800">
                  Laporan kemajuan belum disubmit oleh dosen
                </span>
              </div>
            ) : (
              <>
                <div className="space-y-2">
                  <Label>Isi Laporan Kemajuan</Label>
                  <div className="p-4 bg-muted rounded-lg">
                    <p className="text-sm whitespace-pre-wrap">{monitoring?.laporanKemajuan}</p>
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Persentase Kemajuan</Label>
                    <div className="flex items-center gap-2">
                      <Progress value={monitoring?.persentaseKemajuan || 0} className="flex-1" />
                      <span className="font-medium text-sm">{monitoring?.persentaseKemajuan}%</span>
                    </div>
                  </div>

                  {monitoring?.fileKemajuan && (
                    <div className="space-y-2">
                      <Label>File Laporan</Label>
                      <Button variant="outline" asChild className="w-full">
                        <a href={monitoring.fileKemajuan} target="_blank" rel="noopener noreferrer">
                          <Download className="w-4 h-4 mr-2" />
                          Download PDF
                        </a>
                      </Button>
                    </div>
                  )}
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
                            ? 'Sudah disetujui' 
                            : 'Sudah ditolak'}
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
              </>
            )}
          </CardContent>
        </Card>

        {/* Laporan Akhir Section */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Laporan Akhir</CardTitle>
                <CardDescription>
                  Review dan verifikasi laporan akhir penelitian
                </CardDescription>
              </div>
              {hasAkhir && !monitoring?.verifikasiAkhirAt && (
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setVerifyDialog({ open: true, type: 'akhir', approved: false });
                      setCatatan("");
                    }}
                  >
                    <ThumbsDown className="w-4 h-4 mr-2" />
                    Tolak
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => {
                      setVerifyDialog({ open: true, type: 'akhir', approved: true });
                      setCatatan("");
                    }}
                  >
                    <ThumbsUp className="w-4 h-4 mr-2" />
                    Setujui
                  </Button>
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {!hasKemajuan ? (
              <div className="flex items-center gap-2 p-3 bg-gray-50 border border-gray-200 rounded-lg">
                <AlertCircle className="w-5 h-5 text-gray-600" />
                <span className="text-sm text-gray-800">
                  Laporan kemajuan harus disubmit terlebih dahulu
                </span>
              </div>
            ) : !hasAkhir ? (
              <div className="flex items-center gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <AlertCircle className="w-5 h-5 text-yellow-600" />
                <span className="text-sm text-yellow-800">
                  Laporan akhir belum disubmit oleh dosen
                </span>
              </div>
            ) : (
              <>
                <div className="space-y-2">
                  <Label>Isi Laporan Akhir</Label>
                  <div className="p-4 bg-muted rounded-lg">
                    <p className="text-sm whitespace-pre-wrap">{monitoring?.laporanAkhir}</p>
                  </div>
                </div>

                {monitoring?.fileAkhir && (
                  <div className="space-y-2">
                    <Label>File Laporan</Label>
                    <Button variant="outline" asChild className="w-full md:w-auto">
                      <a href={monitoring.fileAkhir} target="_blank" rel="noopener noreferrer">
                        <Download className="w-4 h-4 mr-2" />
                        Download PDF
                      </a>
                    </Button>
                  </div>
                )}
                
                {/* Verification Status */}
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
                            ? 'Sudah disetujui' 
                            : 'Sudah ditolak'}
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
              </>
            )}
          </CardContent>
        </Card>

        {/* Verification Dialog */}
        <Dialog open={verifyDialog.open} onOpenChange={(open) => setVerifyDialog(prev => ({ ...prev, open }))}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {verifyDialog.approved ? 'Setujui' : 'Tolak'} Laporan {verifyDialog.type === 'kemajuan' ? 'Kemajuan' : 'Akhir'}
              </DialogTitle>
              <DialogDescription>
                {verifyDialog.approved 
                  ? 'Konfirmasi persetujuan laporan. Anda dapat menambahkan catatan (opsional).'
                  : 'Berikan catatan atau alasan penolakan laporan.'}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="catatan">
                  Catatan {verifyDialog.approved ? '(Opsional)' : '*'}
                </Label>
                <Textarea
                  id="catatan"
                  placeholder={verifyDialog.approved ? "Tambahkan catatan jika diperlukan..." : "Jelaskan alasan penolakan..."}
                  value={catatan}
                  onChange={(e) => setCatatan(e.target.value)}
                  rows={4}
                />
              </div>
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setVerifyDialog(prev => ({ ...prev, open: false }));
                  setCatatan("");
                }}
                disabled={submitting}
              >
                Batal
              </Button>
              <Button
                onClick={handleVerify}
                disabled={submitting || (!verifyDialog.approved && !catatan.trim())}
                variant={verifyDialog.approved ? "default" : "destructive"}
              >
                {submitting ? "Menyimpan..." : (verifyDialog.approved ? 'Setujui' : 'Tolak')}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
