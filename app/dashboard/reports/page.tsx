import DashboardLayout from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  PieChart,
  Calendar,
  Users,
  FileText,
  DollarSign,
  Target,
  Award,
  Download,
  Filter,
  RefreshCw
} from "lucide-react";

export default function ReportsPage() {
  // Mock data untuk statistik
  const overallStats = {
    totalProposal: 147,
    proposalAktif: 32,
    totalDana: 2450000000,
    tingkatKeberhasilan: 67,
    jumlahDosen: 89,
    jumlahMahasiswa: 234
  };

  const monthlyData = [
    { bulan: "Jan", submitted: 12, approved: 8, rejected: 4 },
    { bulan: "Feb", submitted: 15, approved: 10, rejected: 5 },
    { bulan: "Mar", submitted: 18, approved: 12, rejected: 6 },
    { bulan: "Apr", submitted: 22, approved: 15, rejected: 7 },
    { bulan: "Mei", submitted: 20, approved: 14, rejected: 6 },
    { bulan: "Jun", submitted: 25, approved: 17, rejected: 8 }
  ];

  const skemaStats = [
    { nama: "Penelitian Fundamental", total: 45, approved: 32, dana: 1200000000, progress: 71 },
    { nama: "Penelitian Terapan", total: 38, approved: 25, dana: 950000000, progress: 66 },
    { nama: "Penelitian Kolaboratif", total: 24, approved: 18, dana: 850000000, progress: 75 },
    { nama: "Penelitian Mahasiswa", total: 40, approved: 28, dana: 450000000, progress: 70 }
  ];

  const fakultasStats = [
    { nama: "Fakultas Teknik", dosen: 25, proposal: 42, dana: 1100000000, tingkatApproval: 68 },
    { nama: "Fakultas Tarbiyah", dosen: 32, proposal: 38, dana: 780000000, tingkatApproval: 72 },
    { nama: "Fakultas Syariah", dosen: 18, proposal: 28, dana: 420000000, tingkatApproval: 64 },
    { nama: "Fakultas Ushuluddin", dosen: 14, proposal: 22, dana: 350000000, tingkatApproval: 59 }
  ];

  const topPerformers = [
    { nama: "Dr. Ahmad Syahrul, M.Kom", fakultas: "Teknik", proposal: 8, dana: 150000000, publikasi: 12 },
    { nama: "Prof. Siti Nurhaliza, Ph.D", fakultas: "Tarbiyah", proposal: 6, dana: 125000000, publikasi: 15 },
    { nama: "Dr. Muhammad Rizki, M.Si", fakultas: "Syariah", proposal: 5, dana: 95000000, publikasi: 9 },
    { nama: "Dr. Fatimah Zahra, M.Pd", fakultas: "Tarbiyah", proposal: 7, dana: 110000000, publikasi: 11 }
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Laporan & Analytics</h1>
            <p className="text-muted-foreground mt-2">
              Analisis komprehensif performa penelitian dan statistik LPPM
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Select defaultValue="2025">
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="2025">2025</SelectItem>
                <SelectItem value="2024">2024</SelectItem>
                <SelectItem value="2023">2023</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" size="sm">
              <Filter className="w-4 h-4 mr-2" />
              Filter
            </Button>
            <Button variant="outline" size="sm">
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
            <Button className="bg-gradient-to-r from-primary to-primary/90">
              <Download className="w-4 h-4 mr-2" />
              Export PDF
            </Button>
          </div>
        </div>

        {/* Key Performance Indicators */}
        <div className="grid gap-4 md:grid-cols-6">
          <Card className="border-0 shadow-sm bg-gradient-to-br from-blue-50 to-blue-100">
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <FileText className="w-5 h-5 text-blue-600" />
                <div>
                  <p className="text-2xl font-bold text-blue-900">{overallStats.totalProposal}</p>
                  <p className="text-xs text-blue-700">Total Proposal</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm bg-gradient-to-br from-green-50 to-green-100">
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Target className="w-5 h-5 text-green-600" />
                <div>
                  <p className="text-2xl font-bold text-green-900">{overallStats.proposalAktif}</p>
                  <p className="text-xs text-green-700">Proposal Aktif</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm bg-gradient-to-br from-purple-50 to-purple-100">
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <DollarSign className="w-5 h-5 text-purple-600" />
                <div>
                  <p className="text-lg font-bold text-purple-900">
                    Rp {(overallStats.totalDana / 1000000000).toFixed(1)}M
                  </p>
                  <p className="text-xs text-purple-700">Total Dana</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm bg-gradient-to-br from-orange-50 to-orange-100">
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <TrendingUp className="w-5 h-5 text-orange-600" />
                <div>
                  <p className="text-2xl font-bold text-orange-900">{overallStats.tingkatKeberhasilan}%</p>
                  <p className="text-xs text-orange-700">Success Rate</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm bg-gradient-to-br from-indigo-50 to-indigo-100">
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Users className="w-5 h-5 text-indigo-600" />
                <div>
                  <p className="text-2xl font-bold text-indigo-900">{overallStats.jumlahDosen}</p>
                  <p className="text-xs text-indigo-700">Dosen Peneliti</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm bg-gradient-to-br from-pink-50 to-pink-100">
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Award className="w-5 h-5 text-pink-600" />
                <div>
                  <p className="text-2xl font-bold text-pink-900">{overallStats.jumlahMahasiswa}</p>
                  <p className="text-xs text-pink-700">Mahasiswa Terlibat</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">
              <BarChart3 className="w-4 h-4 mr-2" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="skema">
              <PieChart className="w-4 h-4 mr-2" />
              Per Skema
            </TabsTrigger>
            <TabsTrigger value="fakultas">
              <Users className="w-4 h-4 mr-2" />
              Per Fakultas
            </TabsTrigger>
            <TabsTrigger value="performance">
              <TrendingUp className="w-4 h-4 mr-2" />
              Performance
            </TabsTrigger>
            <TabsTrigger value="timeline">
              <Calendar className="w-4 h-4 mr-2" />
              Timeline
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid gap-6 lg:grid-cols-2">
              {/* Monthly Trends */}
              <Card className="border-0 shadow-sm">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <BarChart3 className="w-5 h-5" />
                    <span>Tren Proposal Bulanan</span>
                  </CardTitle>
                  <CardDescription>
                    Jumlah proposal yang disubmit, disetujui, dan ditolak per bulan
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {monthlyData.map((data, index) => (
                      <div key={index} className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="font-medium">{data.bulan} 2025</span>
                          <span className="text-muted-foreground">
                            {data.submitted} submitted
                          </span>
                        </div>
                        <div className="space-y-1">
                          <div className="flex items-center space-x-2">
                            <div className="w-2 h-2 rounded-full bg-green-500"></div>
                            <Progress value={(data.approved / data.submitted) * 100} className="flex-1 h-2" />
                            <span className="text-xs text-green-600">{data.approved} approved</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <div className="w-2 h-2 rounded-full bg-red-500"></div>
                            <Progress value={(data.rejected / data.submitted) * 100} className="flex-1 h-2" />
                            <span className="text-xs text-red-600">{data.rejected} rejected</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Status Distribution */}
              <Card className="border-0 shadow-sm">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <PieChart className="w-5 h-5" />
                    <span>Distribusi Status Proposal</span>
                  </CardTitle>
                  <CardDescription>
                    Breakdown status proposal saat ini
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-4 h-4 rounded-full bg-green-500"></div>
                        <div>
                          <p className="font-medium text-green-900">Approved</p>
                          <p className="text-sm text-green-700">67 proposal</p>
                        </div>
                      </div>
                      <Badge variant="outline" className="text-green-600 border-green-200">46%</Badge>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-4 h-4 rounded-full bg-blue-500"></div>
                        <div>
                          <p className="font-medium text-blue-900">In Review</p>
                          <p className="text-sm text-blue-700">32 proposal</p>
                        </div>
                      </div>
                      <Badge variant="outline" className="text-blue-600 border-blue-200">22%</Badge>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-4 h-4 rounded-full bg-orange-500"></div>
                        <div>
                          <p className="font-medium text-orange-900">Revision</p>
                          <p className="text-sm text-orange-700">28 proposal</p>
                        </div>
                      </div>
                      <Badge variant="outline" className="text-orange-600 border-orange-200">19%</Badge>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-4 h-4 rounded-full bg-red-500"></div>
                        <div>
                          <p className="font-medium text-red-900">Rejected</p>
                          <p className="text-sm text-red-700">20 proposal</p>
                        </div>
                      </div>
                      <Badge variant="outline" className="text-red-600 border-red-200">13%</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Skema Tab */}
          <TabsContent value="skema" className="space-y-6">
            <div className="grid gap-4">
              {skemaStats.map((skema, index) => (
                <Card key={index} className="border-0 shadow-sm">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h4 className="font-semibold text-lg">{skema.nama}</h4>
                        <p className="text-sm text-muted-foreground">
                          {skema.approved} dari {skema.total} proposal disetujui
                        </p>
                      </div>
                      <Badge variant="outline" className="text-primary border-primary">
                        {skema.progress}% Success Rate
                      </Badge>
                    </div>

                    <div className="grid grid-cols-3 gap-4 mb-4">
                      <div className="text-center">
                        <p className="text-2xl font-bold text-foreground">{skema.total}</p>
                        <p className="text-xs text-muted-foreground">Total Proposal</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-green-600">{skema.approved}</p>
                        <p className="text-xs text-muted-foreground">Disetujui</p>
                      </div>
                      <div className="text-center">
                        <p className="text-lg font-bold text-blue-600">
                          Rp {(skema.dana / 1000000000).toFixed(1)}M
                        </p>
                        <p className="text-xs text-muted-foreground">Total Dana</p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Progress Approval</span>
                        <span className="font-medium">{skema.progress}%</span>
                      </div>
                      <Progress value={skema.progress} className="h-2" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Fakultas Tab */}
          <TabsContent value="fakultas" className="space-y-6">
            <div className="grid gap-4">
              {fakultasStats.map((fakultas, index) => (
                <Card key={index} className="border-0 shadow-sm">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h4 className="font-semibold text-lg">{fakultas.nama}</h4>
                        <p className="text-sm text-muted-foreground">
                          {fakultas.dosen} dosen • {fakultas.proposal} proposal
                        </p>
                      </div>
                      <Badge variant="outline" className="text-primary border-primary">
                        {fakultas.tingkatApproval}% Approval Rate
                      </Badge>
                    </div>

                    <div className="grid grid-cols-4 gap-4 mb-4">
                      <div className="text-center">
                        <p className="text-xl font-bold text-indigo-600">{fakultas.dosen}</p>
                        <p className="text-xs text-muted-foreground">Dosen</p>
                      </div>
                      <div className="text-center">
                        <p className="text-xl font-bold text-blue-600">{fakultas.proposal}</p>
                        <p className="text-xs text-muted-foreground">Proposal</p>
                      </div>
                      <div className="text-center">
                        <p className="text-lg font-bold text-green-600">
                          Rp {(fakultas.dana / 1000000000).toFixed(1)}M
                        </p>
                        <p className="text-xs text-muted-foreground">Total Dana</p>
                      </div>
                      <div className="text-center">
                        <p className="text-xl font-bold text-orange-600">{fakultas.tingkatApproval}%</p>
                        <p className="text-xs text-muted-foreground">Success Rate</p>
                      </div>
                    </div>

                    <Progress value={fakultas.tingkatApproval} className="h-2" />
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Performance Tab */}
          <TabsContent value="performance" className="space-y-6">
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Award className="w-5 h-5" />
                  <span>Top Performing Researchers</span>
                </CardTitle>
                <CardDescription>
                  Dosen dengan performa penelitian terbaik berdasarkan proposal, dana, dan publikasi
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {topPerformers.map((performer, index) => (
                    <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                          <span className="font-bold text-primary">#{index + 1}</span>
                        </div>
                        <div>
                          <p className="font-medium">{performer.nama}</p>
                          <p className="text-sm text-muted-foreground">{performer.fakultas}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-6 text-sm">
                        <div className="text-center">
                          <p className="font-bold text-blue-600">{performer.proposal}</p>
                          <p className="text-muted-foreground">Proposal</p>
                        </div>
                        <div className="text-center">
                          <p className="font-bold text-green-600">
                            Rp {(performer.dana / 1000000).toFixed(0)}M
                          </p>
                          <p className="text-muted-foreground">Dana</p>
                        </div>
                        <div className="text-center">
                          <p className="font-bold text-purple-600">{performer.publikasi}</p>
                          <p className="text-muted-foreground">Publikasi</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Timeline Tab */}
          <TabsContent value="timeline" className="space-y-6">
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Calendar className="w-5 h-5" />
                  <span>Timeline Aktivitas</span>
                </CardTitle>
                <CardDescription>
                  Jadwal dan milestone penting dalam sistem LPPM
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="flex items-center space-x-4">
                    <div className="w-4 h-4 rounded-full bg-green-500"></div>
                    <div className="flex-1">
                      <p className="font-medium">Periode Submission Dibuka</p>
                      <p className="text-sm text-muted-foreground">1 Januari 2025 • 45 proposal submitted</p>
                    </div>
                    <Badge variant="outline" className="text-green-600 border-green-200">Selesai</Badge>
                  </div>

                  <div className="flex items-center space-x-4">
                    <div className="w-4 h-4 rounded-full bg-blue-500"></div>
                    <div className="flex-1">
                      <p className="font-medium">Review Phase 1</p>
                      <p className="text-sm text-muted-foreground">15 Januari - 15 Februari 2025 • 32 proposal dalam review</p>
                    </div>
                    <Badge variant="outline" className="text-blue-600 border-blue-200">Berlangsung</Badge>
                  </div>

                  <div className="flex items-center space-x-4">
                    <div className="w-4 h-4 rounded-full bg-orange-500"></div>
                    <div className="flex-1">
                      <p className="font-medium">Presentasi Proposal</p>
                      <p className="text-sm text-muted-foreground">1-15 Maret 2025 • Presentasi proposal terpilih</p>
                    </div>
                    <Badge variant="secondary">Upcoming</Badge>
                  </div>

                  <div className="flex items-center space-x-4">
                    <div className="w-4 h-4 rounded-full bg-purple-500"></div>
                    <div className="flex-1">
                      <p className="font-medium">Pengumuman Hasil</p>
                      <p className="text-sm text-muted-foreground">30 Maret 2025 • Pengumuman proposal yang diterima</p>
                    </div>
                    <Badge variant="secondary">Upcoming</Badge>
                  </div>

                  <div className="flex items-center space-x-4">
                    <div className="w-4 h-4 rounded-full bg-gray-400"></div>
                    <div className="flex-1">
                      <p className="font-medium">Kontrak Penelitian</p>
                      <p className="text-sm text-muted-foreground">1-15 April 2025 • Penandatanganan kontrak penelitian</p>
                    </div>
                    <Badge variant="secondary">Upcoming</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}