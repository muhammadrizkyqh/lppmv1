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
  DollarSign
} from "lucide-react";

export default function ReviewPage() {
  // Mock data
  const proposal = {
    id: "P-2025-001",
    title: "Pengembangan Aplikasi Mobile untuk Pembelajaran Al-Quran Berbasis Gamifikasi",
    ketua: "Dr. Ahmad Suharto, M.Pd",
    anggota: ["M. Rifqi Pratama", "Siti Aminah"],
    skema: "Penelitian Terapan",
    bidangKeahlian: "Pendidikan Agama Islam",
    dana: 5000000,
    abstrak: "Penelitian ini bertujuan untuk mengembangkan aplikasi mobile yang dapat membantu pembelajaran Al-Quran dengan pendekatan gamifikasi. Aplikasi akan dilengkapi dengan fitur-fitur interaktif seperti quiz, progress tracking, dan reward system untuk meningkatkan motivasi belajar pengguna.",
    tanggalPengajuan: "2025-02-15",
    tanggalDeadline: "2025-03-15",
    fileProposal: "proposal-p-2025-001.pdf"
  };

  // Mock scoring data
  const criteriaScoring = [
    {
      id: 1,
      criteria: "Kesesuaian Judul & Latar Belakang",
      description: "Kejelasan dan relevansi judul dengan masalah yang diangkat",
      maxScore: 25,
      score: 0
    },
    {
      id: 2,
      criteria: "Kejelasan Metode Penelitian",
      description: "Metodologi yang digunakan sistematis dan dapat dipertanggungjawabkan",
      maxScore: 25,
      score: 0
    },
    {
      id: 3,
      criteria: "Kelayakan Timeline & Jadwal",
      description: "Rencana waktu pelaksanaan realistis dan dapat dicapai",
      maxScore: 25,
      score: 0
    },
    {
      id: 4,
      criteria: "Manfaat & Dampak Penelitian",
      description: "Kontribusi penelitian terhadap keilmuan dan masyarakat",
      maxScore: 25,
      score: 0
    }
  ];

  const totalScore = criteriaScoring.reduce((sum, item) => sum + item.score, 0);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Review Proposal</h1>
            <p className="text-muted-foreground mt-2">
              Berikan penilaian dan feedback untuk proposal penelitian
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Badge variant="outline" className="text-orange-600 border-orange-200">
              <Clock className="w-3 h-3 mr-1" />
              Deadline: 5 hari lagi
            </Badge>
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
                    <CardTitle className="text-xl">{proposal.title}</CardTitle>
                    <CardDescription className="mt-2">
                      <span className="font-medium text-primary">{proposal.id}</span> • {proposal.skema}
                    </CardDescription>
                  </div>
                  <Button variant="outline">
                    <Download className="w-4 h-4 mr-2" />
                    Download PDF
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-muted-foreground">Ketua Peneliti</Label>
                    <div className="flex items-center space-x-2">
                      <User className="w-4 h-4 text-muted-foreground" />
                      <span className="font-medium">{proposal.ketua}</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-muted-foreground">Bidang Keahlian</Label>
                    <span className="text-sm">{proposal.bidangKeahlian}</span>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-muted-foreground">Dana Hibah</Label>
                    <div className="flex items-center space-x-2">
                      <DollarSign className="w-4 h-4 text-muted-foreground" />
                      <span className="font-medium">Rp {proposal.dana.toLocaleString('id-ID')}</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-muted-foreground">Tanggal Pengajuan</Label>
                    <div className="flex items-center space-x-2">
                      <Calendar className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm">{new Date(proposal.tanggalPengajuan).toLocaleDateString('id-ID')}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium text-muted-foreground">Anggota Tim</Label>
                  <div className="flex flex-wrap gap-2">
                    {proposal.anggota.map((anggota, index) => (
                      <Badge key={index} variant="secondary">
                        {anggota}
                      </Badge>
                    ))}
                  </div>
                </div>

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
                        />
                      </div>
                      <div className="flex-1">
                        <Progress value={criteria.score} className="h-2" />
                      </div>
                      <div className="text-sm font-medium w-16 text-right">
                        {criteria.score}/100
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
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih rekomendasi" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="diterima">
                        <div className="flex items-center space-x-2">
                          <CheckCircle className="w-4 h-4 text-green-600" />
                          <span>Diterima</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="revisi">
                        <div className="flex items-center space-x-2">
                          <AlertTriangle className="w-4 h-4 text-yellow-600" />
                          <span>Perlu Revisi</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="ditolak">
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
                      Proposal sedang dalam tahap penilaian
                    </p>
                  </div>
                  <div className="text-2xl font-bold text-blue-600">0%</div>
                  <Progress value={0} className="h-2" />
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
                  <p className="text-xs text-muted-foreground">21 Maret 2025 (5 hari lagi)</p>
                  
                  <div className="p-2 bg-orange-50 border border-orange-200 rounded text-xs text-orange-800">
                    ⚠️ Mohon selesaikan review sebelum deadline
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Actions */}
            <Card className="border-0 shadow-sm">
              <CardContent className="p-6 space-y-3">
                <Button className="w-full bg-gradient-to-r from-primary to-primary/90">
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Submit Review
                </Button>
                <Button variant="outline" className="w-full">
                  Simpan Draft
                </Button>
                <Button variant="ghost" className="w-full text-muted-foreground">
                  Kembali ke Daftar
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}