"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import DashboardLayout from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import {
  FileText,
  Clock,
  Download,
  Star,
  CheckCircle,
  XCircle,
  AlertTriangle,
  User,
  Calendar,
  DollarSign,
  ArrowLeft,
  Loader2,
  Upload
} from "lucide-react";
import { toast } from "sonner";
import { reviewApi } from "@/lib/api-client";
import { validateFileSize, validateFileType, formatFileSize, FILE_SIZE_LIMITS, compressPDFIfNeeded, getCompressionRecommendation } from "@/lib/file-utils";

export default function ReviewPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: assignmentId } = use(params);
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [assignment, setAssignment] = useState<any>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitDialog, setSubmitDialog] = useState(false);

  // Form state
  const [file, setFile] = useState<File | null>(null);
  const [nilaiTotal, setNilaiTotal] = useState<number>(0);
  const [rekomendasi, setRekomendasi] = useState<'DITERIMA' | 'REVISI' | 'DITOLAK' | ''>('');
  const [catatan, setCatatan] = useState('');

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    // Validate file type
    const typeValidation = validateFileType(selectedFile, 'application/pdf');
    if (!typeValidation.valid) {
      toast.error(typeValidation.error!);
      e.target.value = '';
      return;
    }

    // Validate file size
    const sizeValidation = validateFileSize(selectedFile);
    if (!sizeValidation.valid) {
      toast.error(sizeValidation.error!);
      e.target.value = '';
      return;
    }

    // Check if compression is recommended
    const recommendation = getCompressionRecommendation(selectedFile.size);
    if (recommendation) {
      toast.warning(recommendation, { duration: 5000 });
    }

    // Try to analyze and provide compression guidance
    const compressionResult = await compressPDFIfNeeded(selectedFile);
    if (compressionResult.message) {
      toast.info(compressionResult.message, { duration: 6000 });
    }

    setFile(compressionResult.file);
    toast.success("File penilaian berhasil dipilih");
  };

  useEffect(() => {
    fetchAssignment();
  }, [assignmentId]);

  const fetchAssignment = async () => {
    try {
      setLoading(true);
      const result = await reviewApi.getAssignment(assignmentId);
      
      if (result.success && result.data) {
        setAssignment(result.data);
        
        // Check if already reviewed
        if (result.data.status === 'SELESAI' && result.data.review) {
          toast.info('Review sudah pernah disubmit');
        }
      } else {
        toast.error(result.error || 'Gagal memuat data assignment');
        router.push('/reviewer/assignments');
      }
    } catch (error) {
      console.error('Fetch assignment error:', error);
      toast.error('Gagal memuat data assignment');
      router.push('/reviewer/assignments');
    } finally {
      setLoading(false);
    }
  };

  const formProgress = (
    (file ? 40 : 0) +
    (nilaiTotal > 0 ? 30 : 0) +
    (rekomendasi ? 30 : 0)
  );

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (selectedFile.type !== 'application/pdf') {
        toast.error('File harus berformat PDF');
        return;
      }
      if (selectedFile.size > 10 * 1024 * 1024) {
        toast.error('Ukuran file maksimal 10MB');
        return;
      }
      setFile(selectedFile);
    }
  };

  const handleNilaiChange = (value: string) => {
    const numValue = parseInt(value) || 0;
    if (numValue >= 0 && numValue <= 100) {
      setNilaiTotal(numValue);
    }
  };

  const validateForm = () => {
    if (!file) {
      toast.error('File penilaian wajib diupload');
      return false;
    }
    if (nilaiTotal === 0) {
      toast.error('Nilai total harus diisi');
      return false;
    }
    if (!rekomendasi) {
      toast.error('Rekomendasi harus dipilih');
      return false;
    }
    return true;
  };

  const handleSubmitReview = async () => {
    if (!validateForm()) return;
    
    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('file', file!);
      formData.append('nilaiTotal', nilaiTotal.toString());
      formData.append('rekomendasi', rekomendasi);
      if (catatan) {
        formData.append('catatan', catatan);
      }

      const response = await fetch(`/api/reviews/${assignmentId}/submit`, {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (result.success) {
        toast.success('Review berhasil disubmit!');
        setSubmitDialog(false);
        router.push('/reviewer/assignments');
      } else {
        toast.error(result.error || 'Gagal submit review');
      }
    } catch (error) {
      console.error('Submit review error:', error);
      toast.error('Gagal submit review');
    } finally {
      setSubmitting(false);
    }
  };

  const getDeadlineStatus = () => {
    if (!assignment) return null;
    
    const now = new Date();
    const deadline = new Date(assignment.deadline);
    const diffTime = deadline.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return { label: `Terlambat ${Math.abs(diffDays)} hari`, color: 'text-red-600 border-red-200', days: diffDays };
    } else if (diffDays === 0) {
      return { label: 'Deadline hari ini', color: 'text-orange-600 border-orange-200', days: 0 };
    } else if (diffDays <= 2) {
      return { label: `${diffDays} hari lagi`, color: 'text-yellow-600 border-yellow-200', days: diffDays };
    } else {
      return { label: `${diffDays} hari lagi`, color: 'text-green-600 border-green-200', days: diffDays };
    }
  };

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

  if (!assignment) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <AlertTriangle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Assignment Tidak Ditemukan</h3>
            <p className="text-muted-foreground mb-4">
              Assignment yang Anda cari tidak ditemukan.
            </p>
            <Button asChild>
              <Link href="/reviewer/assignments">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Kembali ke Daftar Review
              </Link>
            </Button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const proposal = assignment.proposal;
  const deadlineStatus = getDeadlineStatus();

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center space-x-2 mb-2">
              <Button variant="ghost" size="sm" asChild>
                <Link href="/reviewer/assignments">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Kembali
                </Link>
              </Button>
            </div>
            <h1 className="text-3xl font-bold text-foreground">Review Proposal</h1>
            <p className="text-muted-foreground mt-2">
              Berikan penilaian dan feedback untuk proposal penelitian
            </p>
          </div>
          <div className="flex items-center space-x-2">
            {deadlineStatus && (
              <Badge variant="outline" className={deadlineStatus.color}>
                <Clock className="w-3 h-3 mr-1" />
                Deadline: {deadlineStatus.label}
              </Badge>
            )}
          </div>
        </div>

        {/* Split Screen Layout: PDF Viewer (70%) + Content (30%) */}
        <div className="grid gap-6 lg:grid-cols-10">
          {/* PDF Viewer - 70% */}
          {proposal.filePath && (
            <div className="lg:col-span-7">
              <div className="sticky top-6">
                <Card className="border-0 shadow-lg overflow-hidden">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">Dokumen Proposal</CardTitle>
                      <Button variant="outline" size="sm" asChild>
                        <a href={proposal.filePath} target="_blank" rel="noopener noreferrer">
                          <Download className="w-4 h-4 mr-2" />
                          Download
                        </a>
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="p-0">
                    <div className="w-full bg-gray-100" style={{ height: 'calc(100vh - 200px)' }}>
                      <iframe
                        src={proposal.filePath}
                        className="w-full h-full border-0"
                        title="PDF Proposal"
                      />
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {/* Main Content - 30% (or full width if no PDF) */}
          <div className={proposal.filePath ? "lg:col-span-3" : "lg:col-span-10"}>
            <div className="space-y-6">
            {/* Proposal Info */}
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <div>
                  <CardTitle className="text-xl">{proposal.judul}</CardTitle>
                  <CardDescription className="mt-2">
                    {proposal.skema.nama} • Periode {proposal.periode.tahun}
                  </CardDescription>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-muted-foreground">Ketua Peneliti</Label>
                    <div className="flex items-center space-x-2">
                      <User className="w-4 h-4 text-muted-foreground" />
                      <span className="font-medium">{proposal.dosen.nama}</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-muted-foreground">Bidang Keahlian</Label>
                    <span className="text-sm">{proposal.bidangkeahlian?.nama || '-'}</span>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-muted-foreground">Dana Diajukan</Label>
                    <div className="flex items-center space-x-2">
                      <DollarSign className="w-4 h-4 text-muted-foreground" />
                      <span className="font-medium">
                        Rp {proposal.danaDisetujui ? Number(proposal.danaDisetujui).toLocaleString('id-ID') : '0'}
                      </span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-muted-foreground">Tanggal Pengajuan</Label>
                    <div className="flex items-center space-x-2">
                      <Calendar className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm">
                        {proposal.submittedAt ? new Date(proposal.submittedAt).toLocaleDateString('id-ID') : '-'}
                      </span>
                    </div>
                  </div>
                </div>

                {proposal.proposalmember && proposal.proposalmember.length > 0 && (
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-muted-foreground">Anggota Tim</Label>
                    <div className="flex flex-wrap gap-2">
                      {proposal.proposalmember.map((member: any) => (
                        <Badge key={member.id} variant="secondary">
                          {member.dosen?.nama || member.mahasiswa?.nama} 
                          {member.mahasiswa && ` (${member.mahasiswa.nim})`}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <Label className="text-sm font-medium text-muted-foreground">Abstrak</Label>
                  <p className="text-sm text-muted-foreground leading-relaxed p-3 bg-muted/50 rounded-lg">
                    {proposal.abstrak}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Review Status - Show if already submitted */}
            {assignment.status === 'SELESAI' && assignment.review ? (
              <>
                {/* Read-only Review Display */}
                <Card className="border-0 shadow-sm border-l-4 border-l-green-500">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="flex items-center space-x-2">
                          <CheckCircle className="w-5 h-5 text-green-600" />
                          <span>Review Telah Disubmit</span>
                        </CardTitle>
                        <CardDescription className="mt-2">
                          Review Anda telah disubmit pada {new Date(assignment.review.submittedAt).toLocaleDateString('id-ID', { 
                            day: 'numeric', 
                            month: 'long', 
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </CardDescription>
                      </div>
                      <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Selesai
                      </Badge>
                    </div>
                  </CardHeader>
                </Card>

                {/* File & Score Display */}
                <Card className="border-0 shadow-sm">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Star className="w-5 h-5 text-primary" />
                      <span>Hasil Penilaian</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* File Penilaian */}
                    {assignment.review.filePenilaian && (
                      <div className="space-y-2">
                        <Label className="text-sm font-medium">File Penilaian</Label>
                        <div className="flex items-center gap-3 p-4 bg-muted/50 rounded-lg border">
                          <FileText className="w-8 h-8 text-primary" />
                          <div className="flex-1">
                            <p className="font-medium text-sm">Dokumen Penilaian Lengkap</p>
                            <p className="text-xs text-muted-foreground">File PDF hasil penilaian</p>
                          </div>
                          <Button variant="outline" size="sm" asChild>
                            <a href={assignment.review.filePenilaian} target="_blank" rel="noopener noreferrer">
                              <Download className="w-4 h-4 mr-2" />
                              Download
                            </a>
                          </Button>
                        </div>
                      </div>
                    )}

                    {/* Total Score */}
                    <div className="p-6 bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-sm font-medium text-muted-foreground mb-1">Skor Akhir</div>
                          <div className="text-xs text-muted-foreground">
                            Hasil penilaian proposal
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-4xl font-bold text-primary">{assignment.review.nilaiTotal}</div>
                          <div className="text-sm text-muted-foreground">dari 100</div>
                        </div>
                      </div>
                      <Progress value={assignment.review.nilaiTotal} className="mt-3 h-3" />
                    </div>
                  </CardContent>
                </Card>

                {/* Recommendation Display */}
                <Card className="border-0 shadow-sm">
                  <CardHeader>
                    <CardTitle>Rekomendasi & Catatan</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="p-4 rounded-lg border-2 bg-muted/30" style={{
                      borderColor: assignment.review.rekomendasi === 'DITERIMA' ? '#22c55e' : 
                                   assignment.review.rekomendasi === 'REVISI' ? '#eab308' : '#ef4444'
                    }}>
                      <div className="flex items-center space-x-3 mb-2">
                        {assignment.review.rekomendasi === 'DITERIMA' ? (
                          <CheckCircle className="w-6 h-6 text-green-600" />
                        ) : assignment.review.rekomendasi === 'REVISI' ? (
                          <AlertTriangle className="w-6 h-6 text-yellow-600" />
                        ) : (
                          <XCircle className="w-6 h-6 text-red-600" />
                        )}
                        <div>
                          <div className="text-sm font-medium text-muted-foreground">Rekomendasi Anda</div>
                          <div className="text-lg font-bold" style={{
                            color: assignment.review.rekomendasi === 'DITERIMA' ? '#22c55e' : 
                                   assignment.review.rekomendasi === 'REVISI' ? '#eab308' : '#ef4444'
                          }}>
                            {assignment.review.rekomendasi === 'DITERIMA' ? 'Diterima' : 
                             assignment.review.rekomendasi === 'REVISI' ? 'Perlu Revisi' : 'Ditolak'}
                          </div>
                        </div>
                      </div>
                    </div>

                    {assignment.review.catatan && (
                      <div className="space-y-2">
                        <Label className="text-sm font-medium">Catatan & Saran</Label>
                        <div className="p-4 bg-muted/50 rounded-lg border">
                          <p className="text-sm text-foreground whitespace-pre-wrap leading-relaxed">
                            {assignment.review.catatan}
                          </p>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </>
            ) : (
              <>
                {/* Editable Review Form - Only show if not submitted */}
                {/* File Upload & Score Section */}
                <Card className="border-0 shadow-sm">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Upload className="w-5 h-5 text-primary" />
                      <span>Upload File Penilaian</span>
                    </CardTitle>
                    <CardDescription>
                      Upload file penilaian lengkap (PDF) dan masukkan skor akhir
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* File Upload */}
                    <div className="space-y-2">
                      <Label htmlFor="file">File Penilaian (PDF) *</Label>
                      <div className="flex items-center gap-4">
                        <Input
                          id="file"
                          type="file"
                          accept=".pdf"
                          onChange={handleFileChange}
                          className="cursor-pointer"
                        />
                      </div>
                      {file && (
                        <div className="flex items-center gap-2 text-sm text-green-600">
                          <CheckCircle className="w-4 h-4" />
                          <span>{file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)</span>
                        </div>
                      )}
                      <p className="text-xs text-muted-foreground">
                        Format: PDF • Maksimal: 10MB • File berisi penilaian lengkap
                      </p>
                    </div>

                    <Separator />

                    {/* Score Input */}
                    <div className="space-y-3">
                      <Label htmlFor="nilai">Nilai/Skor Akhir *</Label>
                      <div className="flex items-center gap-4">
                        <Input
                          id="nilai"
                          type="number"
                          min="0"
                          max="100"
                          placeholder="0-100"
                          className="w-32"
                          value={nilaiTotal || ''}
                          onChange={(e) => handleNilaiChange(e.target.value)}
                        />
                        <div className="flex-1">
                          <Progress value={nilaiTotal} className="h-3" />
                        </div>
                        <div className="text-lg font-bold text-primary w-20 text-right">
                          {nilaiTotal}/100
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Masukkan skor akhir hasil penilaian Anda (0-100)
                      </p>
                    </div>
                  </CardContent>
                </Card>

            {/* Recommendation & Comments */}
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle>Rekomendasi & Catatan</CardTitle>
                <CardDescription className="mt-2">
                  Berikan rekomendasi final dan catatan untuk perbaikan
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="recommendation">Rekomendasi *</Label>
                  <Select value={rekomendasi} onValueChange={(value: any) => setRekomendasi(value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih rekomendasi" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="DITERIMA">
                        <div className="flex items-center space-x-2">
                          <CheckCircle className="w-4 h-4 text-green-600" />
                          <span>Diterima</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="REVISI">
                        <div className="flex items-center space-x-2">
                          <AlertTriangle className="w-4 h-4 text-yellow-600" />
                          <span>Perlu Revisi</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="DITOLAK">
                        <div className="flex items-center space-x-2">
                          <XCircle className="w-4 h-4 text-red-600" />
                          <span>Ditolak</span>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="comments">Catatan & Saran Perbaikan</Label>
                  <Textarea
                    id="comments"
                    rows={6}
                    placeholder="Tuliskan catatan, saran perbaikan, atau alasan penolakan..."
                    className="resize-none"
                    value={catatan}
                    onChange={(e) => setCatatan(e.target.value)}
                  />
                  <p className="text-sm text-muted-foreground mt-2">
                    Berikan feedback konstruktif untuk membantu peneliti memperbaiki proposal
                  </p>
                </div>
              </CardContent>
            </Card>
            </>
            )}

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Review Progress - Only show if not submitted */}
            {assignment.status !== 'SELESAI' && (
              <>
                <Card className="border-0 shadow-sm bg-gradient-to-br from-blue-50 to-blue-100">
                  <CardContent className="p-6">
                    <div className="text-center space-y-3">
                      <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mx-auto">
                        <FileText className="w-6 h-6 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-semibold text-blue-900">Review Progress</p>
                        <p className="text-sm text-blue-700">
                          {formProgress === 100 ? 'Siap untuk submit' : 'Isi semua kriteria penilaian'}
                        </p>
                      </div>
                      <div className="text-2xl font-bold text-blue-600">{formProgress}%</div>
                      <Progress value={formProgress} className="h-2" />
                    </div>
                  </CardContent>
                </Card>

                {/* Review Guidelines */}
                <Card className="border-0 shadow-sm">
                  <CardHeader>
                    <CardTitle className="text-base">Panduan Review</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-3">
                      <div className="flex items-start space-x-2">
                        <div className="w-2 h-2 rounded-full bg-primary mt-2"></div>
                        <div className="text-sm">
                          <p className="font-medium">Objektivitas</p>
                          <p className="text-muted-foreground text-xs">
                            Berikan penilaian yang objektif berdasarkan kriteria
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start space-x-2">
                        <div className="w-2 h-2 rounded-full bg-primary mt-2"></div>
                        <div className="text-sm">
                          <p className="font-medium">Feedback Konstruktif</p>
                          <p className="text-muted-foreground text-xs">
                            Berikan saran yang membangun untuk perbaikan
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start space-x-2">
                        <div className="w-2 h-2 rounded-full bg-primary mt-2"></div>
                        <div className="text-sm">
                          <p className="font-medium">Kelengkapan Review</p>
                          <p className="text-muted-foreground text-xs">
                            Pastikan semua kriteria telah dinilai
                          </p>
                        </div>
                      </div>
                    </div>

                    <Separator />

                    <div className="space-y-2">
                      <p className="text-sm font-medium">Deadline Review</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(assignment.deadline).toLocaleDateString('id-ID', { 
                          day: 'numeric', 
                          month: 'long', 
                          year: 'numeric' 
                        })}
                        {deadlineStatus && ` (${deadlineStatus.label})`}
                      </p>
                      
                      {deadlineStatus && deadlineStatus.days <= 2 && (
                        <div className="p-2 bg-orange-50 border border-orange-200 rounded text-xs text-orange-800">
                          ⚠️ Mohon selesaikan review sebelum deadline
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </>
            )}

            {/* Status Card - Show if submitted */}
            {assignment.status === 'SELESAI' && assignment.review && (
              <Card className="border-0 shadow-sm bg-gradient-to-br from-green-50 to-green-100">
                <CardContent className="p-6">
                  <div className="text-center space-y-3">
                    <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mx-auto">
                      <CheckCircle className="w-6 h-6 text-green-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-green-900">Review Selesai</p>
                      <p className="text-sm text-green-700">
                        Terima kasih atas review Anda
                      </p>
                    </div>
                    <div className="text-xs text-green-700 bg-green-50 p-2 rounded">
                      {new Date(assignment.review.submittedAt).toLocaleDateString('id-ID', { 
                        day: 'numeric', 
                        month: 'long', 
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Actions */}
            <Card className="border-0 shadow-sm">
              <CardContent className="p-6 space-y-3">
                {assignment.status !== 'SELESAI' ? (
                  <Button 
                    className="w-full bg-gradient-to-r from-primary to-primary/90"
                    onClick={() => setSubmitDialog(true)}
                    disabled={formProgress < 100}
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Submit Review
                  </Button>
                ) : (
                  <div className="text-center py-2 text-sm text-muted-foreground">
                    Review telah disubmit dan tidak dapat diubah
                  </div>
                )}
                <Button 
                  variant="outline" 
                  className="w-full"
                  asChild
                >
                  <Link href="/reviewer/assignments">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Kembali ke Daftar
                  </Link>
                </Button>
              </CardContent>
            </Card>
            </div>
          </div>
          </div>
        </div>

        {/* Submit Confirmation Dialog */}
        <AlertDialog open={submitDialog} onOpenChange={setSubmitDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Konfirmasi Submit Review</AlertDialogTitle>
              <AlertDialogDescription asChild>
                <div className="space-y-2">
                  <p>Apakah Anda yakin ingin submit review ini?</p>
                  <div className="p-3 bg-muted rounded-lg space-y-1 text-sm">
                    {file && <div><strong>File:</strong> {file.name}</div>}
                    <div><strong>Skor Akhir:</strong> {nilaiTotal}/100</div>
                    <div><strong>Rekomendasi:</strong> {rekomendasi}</div>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Review yang sudah disubmit tidak dapat diubah lagi.
                  </p>
                </div>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={submitting}>Batal</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleSubmitReview}
                disabled={submitting}
                className="bg-primary"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Ya, Submit Review
                  </>
                )}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </DashboardLayout>
  );
}