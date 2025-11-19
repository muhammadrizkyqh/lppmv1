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
  Loader2
} from "lucide-react";
import { reviewApi } from "@/lib/api-client";
import { toast } from "sonner";

export default function ReviewPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: assignmentId } = use(params);
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [assignment, setAssignment] = useState<any>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitDialog, setSubmitDialog] = useState(false);

  // Form state
  const [scores, setScores] = useState({
    kriteria1: 0,
    kriteria2: 0,
    kriteria3: 0,
    kriteria4: 0,
  });
  const [rekomendasi, setRekomendasi] = useState<'DITERIMA' | 'REVISI' | 'DITOLAK' | ''>('');
  const [catatan, setCatatan] = useState('');

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

  const criteriaScoring = [
    {
      id: 1,
      key: 'kriteria1',
      criteria: "Kesesuaian Judul & Latar Belakang",
      description: "Kejelasan dan relevansi judul dengan masalah yang diangkat",
      maxScore: 25,
    },
    {
      id: 2,
      key: 'kriteria2',
      criteria: "Kejelasan Metode Penelitian",
      description: "Metodologi yang digunakan sistematis dan dapat dipertanggungjawabkan",
      maxScore: 25,
    },
    {
      id: 3,
      key: 'kriteria3',
      criteria: "Kelayakan Timeline & Jadwal",
      description: "Rencana waktu pelaksanaan realistis dan dapat dicapai",
      maxScore: 25,
    },
    {
      id: 4,
      key: 'kriteria4',
      criteria: "Manfaat & Dampak Penelitian",
      description: "Kontribusi penelitian terhadap keilmuan dan masyarakat",
      maxScore: 25,
    }
  ];

  const totalScore = Object.values(scores).reduce((sum, score) => sum + score, 0) / 4;
  const formProgress = (
    (scores.kriteria1 > 0 ? 25 : 0) +
    (scores.kriteria2 > 0 ? 25 : 0) +
    (scores.kriteria3 > 0 ? 25 : 0) +
    (scores.kriteria4 > 0 ? 25 : 0) +
    (rekomendasi ? 25 : 0)
  );

  const handleScoreChange = (key: string, value: string) => {
    const numValue = parseInt(value) || 0;
    if (numValue >= 0 && numValue <= 100) {
      setScores(prev => ({ ...prev, [key]: numValue }));
    }
  };

  const validateForm = () => {
    if (scores.kriteria1 === 0 || scores.kriteria2 === 0 || scores.kriteria3 === 0 || scores.kriteria4 === 0) {
      toast.error('Semua kriteria penilaian harus diisi');
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
      const result = await reviewApi.submit(assignmentId!, {
        nilaiKriteria1: scores.kriteria1,
        nilaiKriteria2: scores.kriteria2,
        nilaiKriteria3: scores.kriteria3,
        nilaiKriteria4: scores.kriteria4,
        rekomendasi,
        catatan: catatan || undefined,
      });

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

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Proposal Info */}
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-xl">{proposal.judul}</CardTitle>
                    <CardDescription className="mt-2">
                      {proposal.skema.nama} • Periode {proposal.periode.tahun}
                    </CardDescription>
                  </div>
                  {proposal.filePath && (
                    <Button variant="outline" asChild>
                      <a href={proposal.filePath} target="_blank" rel="noopener noreferrer">
                        <Download className="w-4 h-4 mr-2" />
                        Download PDF
                      </a>
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-muted-foreground">Ketua Peneliti</Label>
                    <div className="flex items-center space-x-2">
                      <User className="w-4 h-4 text-muted-foreground" />
                      <span className="font-medium">{proposal.ketua.nama}</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-muted-foreground">Bidang Keahlian</Label>
                    <span className="text-sm">{proposal.bidangKeahlian?.nama || '-'}</span>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-muted-foreground">Dana Hibah</Label>
                    <div className="flex items-center space-x-2">
                      <DollarSign className="w-4 h-4 text-muted-foreground" />
                      <span className="font-medium">
                        Rp {proposal.skema.dana ? Number(proposal.skema.dana).toLocaleString('id-ID') : '0'}
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

                {proposal.members && proposal.members.length > 0 && (
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-muted-foreground">Anggota Tim</Label>
                    <div className="flex flex-wrap gap-2">
                      {proposal.members.map((member: any) => (
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

            {/* Scoring Section */}
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Star className="w-5 h-5 text-primary" />
                  <span>Penilaian Proposal</span>
                </CardTitle>
                <CardDescription>
                  Berikan skor untuk setiap kriteria penilaian (1-100)
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {criteriaScoring.map((criteria, index) => (
                  <div key={criteria.id} className="space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-medium text-foreground">{criteria.criteria}</h4>
                        <p className="text-sm text-muted-foreground mt-1">
                          {criteria.description}
                        </p>
                      </div>
                      <Badge variant="outline" className="ml-4">
                        Max: {criteria.maxScore}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center space-x-4">
                      <div className="flex-1">
                        <Label htmlFor={`score-${criteria.id}`} className="sr-only">
                          Skor untuk {criteria.criteria}
                        </Label>
                        <Input
                          id={`score-${criteria.id}`}
                          type="number"
                          min="0"
                          max="100"
                          placeholder="0-100"
                          className="w-20"
                          value={scores[criteria.key as keyof typeof scores] || ''}
                          onChange={(e) => handleScoreChange(criteria.key, e.target.value)}
                        />
                      </div>
                      <div className="flex-1">
                        <Progress value={scores[criteria.key as keyof typeof scores]} className="h-2" />
                      </div>
                      <div className="text-sm font-medium w-16 text-right">
                        {scores[criteria.key as keyof typeof scores]}/100
                      </div>
                    </div>

                    {index < criteriaScoring.length - 1 && <Separator />}
                  </div>
                ))}

                <div className="p-4 bg-primary/5 border border-primary/10 rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-lg">Total Skor:</span>
                    <div className="flex items-center space-x-2">
                      <span className="text-2xl font-bold text-primary">{totalScore}</span>
                      <span className="text-muted-foreground">/100</span>
                    </div>
                  </div>
                  <Progress value={totalScore} className="mt-2 h-3" />
                </div>
              </CardContent>
            </Card>

            {/* Recommendation & Comments */}
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle>Rekomendasi & Catatan</CardTitle>
                <CardDescription>
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
                  <p className="text-sm text-muted-foreground">
                    Berikan feedback konstruktif untuk membantu peneliti memperbaiki proposal
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Review Progress */}
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

            {/* Actions */}
            <Card className="border-0 shadow-sm">
              <CardContent className="p-6 space-y-3">
                <Button 
                  className="w-full bg-gradient-to-r from-primary to-primary/90"
                  onClick={() => setSubmitDialog(true)}
                  disabled={formProgress < 100 || assignment.status === 'SELESAI'}
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  {assignment.status === 'SELESAI' ? 'Review Sudah Disubmit' : 'Submit Review'}
                </Button>
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

        {/* Submit Confirmation Dialog */}
        <AlertDialog open={submitDialog} onOpenChange={setSubmitDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Konfirmasi Submit Review</AlertDialogTitle>
              <AlertDialogDescription asChild>
                <div className="space-y-2">
                  <p>Apakah Anda yakin ingin submit review ini?</p>
                  <div className="p-3 bg-muted rounded-lg space-y-1 text-sm">
                    <div><strong>Total Skor:</strong> {totalScore.toFixed(2)}/100</div>
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