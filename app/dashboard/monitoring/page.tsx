import DashboardLayout from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Upload,
  CheckCircle,
  AlertCircle,
  Clock,
  Calendar,
  FileText,
  TrendingUp,
  Target,
  Flag,
  Download
} from "lucide-react";

export default function MonitoringPage() {
  // Mock data
  const proposal = {
    id: "P-2025-001",
    title: "Pengembangan Aplikasi Mobile untuk Pembelajaran Al-Quran Berbasis Gamifikasi",
    status: "monitoring",
    progress: 65,
    tanggalMulai: "2025-04-01",
    tanggalSelesai: "2025-10-01",
    dana: 5000000
  };

  const monitoringSchedule = [
    {
      id: 1,
      jenis: "Monitoring 1",
      deadline: "2025-07-01",
      status: "submitted",
      tanggalSubmit: "2025-06-28",
      progress: 35,
      file: "monitoring-1-p-2025-001.pdf"
    },
    {
      id: 2,
      jenis: "Monitoring 2",
      deadline: "2025-09-01",
      status: "pending",
      progress: 0,
      file: null
    },
    {
      id: 3,
      jenis: "Laporan Akhir",
      deadline: "2025-10-15",
      status: "upcoming",
      progress: 0,
      file: null
    }
  ];

  const luaranData = [
    {
      id: 1,
      jenis: "Jurnal",
      judul: "Mobile Learning Application for Quran Education with Gamification Approach",
      target: "Jurnal Teknologi Pendidikan",
      status: "draft",
      progress: 25
    },
    {
      id: 2,
      jenis: "Produk",
      judul: "Aplikasi QuranGames Mobile App",
      target: "Google Play Store",
      status: "development",
      progress: 60
    }
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "submitted":
        return <Badge variant="outline" className="text-green-600 border-green-200">Submitted</Badge>;
      case "pending":
        return <Badge variant="outline" className="text-orange-600 border-orange-200">Pending</Badge>;
      case "upcoming":
        return <Badge variant="secondary">Upcoming</Badge>;
      case "overdue":
        return <Badge variant="outline" className="text-red-600 border-red-200">Overdue</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getLuaranStatusBadge = (status: string) => {
    switch (status) {
      case "draft":
        return <Badge variant="secondary">Draft</Badge>;
      case "development":
        return <Badge variant="outline" className="text-blue-600 border-blue-200">Development</Badge>;
      case "submitted":
        return <Badge variant="outline" className="text-green-600 border-green-200">Submitted</Badge>;
      case "published":
        return <Badge variant="default">Published</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Monitoring Penelitian</h1>
            <p className="text-muted-foreground mt-2">
              Pantau progress dan upload laporan monitoring penelitian
            </p>
          </div>
          <Badge variant="outline" className="text-blue-600 border-blue-200">
            <Clock className="w-3 h-3 mr-1" />
            {proposal.status}
          </Badge>
        </div>

        {/* Project Overview */}
        <Card className="border-0 shadow-sm bg-gradient-to-br from-primary/5 to-primary/10">
          <CardContent className="p-6">
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-lg text-foreground">{proposal.title}</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  <span className="font-medium text-primary">{proposal.id}</span> • 
                  Dana: Rp {proposal.dana.toLocaleString('id-ID')}
                </p>
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Tanggal Mulai</p>
                  <p className="font-medium">{new Date(proposal.tanggalMulai).toLocaleDateString('id-ID')}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Tanggal Selesai</p>
                  <p className="font-medium">{new Date(proposal.tanggalSelesai).toLocaleDateString('id-ID')}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Progress Keseluruhan</p>
                  <div className="flex items-center space-x-2">
                    <Progress value={proposal.progress} className="flex-1 h-2" />
                    <span className="font-medium text-sm">{proposal.progress}%</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Main Content */}
        <Tabs defaultValue="monitoring" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="monitoring">
              <FileText className="w-4 h-4 mr-2" />
              Monitoring
            </TabsTrigger>
            <TabsTrigger value="luaran">
              <Target className="w-4 h-4 mr-2" />
              Luaran
            </TabsTrigger>
            <TabsTrigger value="timeline">
              <Calendar className="w-4 h-4 mr-2" />
              Timeline
            </TabsTrigger>
          </TabsList>

          {/* Monitoring Tab */}
          <TabsContent value="monitoring" className="space-y-6">
            <div className="grid gap-6">
              {monitoringSchedule.map((monitoring) => (
                <Card key={monitoring.id} className="border-0 shadow-sm">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-lg">{monitoring.jenis}</CardTitle>
                        <CardDescription>
                          Deadline: {new Date(monitoring.deadline).toLocaleDateString('id-ID')}
                        </CardDescription>
                      </div>
                      {getStatusBadge(monitoring.status)}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {monitoring.status === "submitted" ? (
                      <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <CheckCircle className="w-5 h-5 text-green-600" />
                            <div>
                              <p className="font-medium text-green-900">Laporan Telah Disubmit</p>
                              <p className="text-sm text-green-700">
                                Disubmit pada: {monitoring.tanggalSubmit && new Date(monitoring.tanggalSubmit).toLocaleDateString('id-ID')}
                              </p>
                            </div>
                          </div>
                          <Button size="sm" variant="outline" className="text-green-700 border-green-300">
                            <Download className="w-4 h-4 mr-2" />
                            Download
                          </Button>
                        </div>
                      </div>
                    ) : monitoring.status === "pending" ? (
                      <div className="space-y-4">
                        <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
                          <div className="flex items-center space-x-2">
                            <AlertCircle className="w-5 h-5 text-orange-600" />
                            <div>
                              <p className="font-medium text-orange-900">Laporan Belum Disubmit</p>
                              <p className="text-sm text-orange-700">
                                Harap upload laporan monitoring sebelum deadline
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="space-y-4">
                          <div className="space-y-2">
                            <Label htmlFor="progress">Progress Penelitian (%)</Label>
                            <Input
                              id="progress"
                              type="number"
                              min="0"
                              max="100"
                              placeholder="0-100"
                              className="w-32"
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="kendala">Kendala yang Dihadapi</Label>
                            <Textarea
                              id="kendala"
                              rows={3}
                              placeholder="Jelaskan kendala atau hambatan yang dihadapi dalam penelitian..."
                              className="resize-none"
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="solusi">Solusi yang Ditempuh</Label>
                            <Textarea
                              id="solusi"
                              rows={3}
                              placeholder="Jelaskan solusi atau upaya yang telah/akan ditempuh..."
                              className="resize-none"
                            />
                          </div>

                          <div className="space-y-2">
                            <Label>Upload File Laporan</Label>
                            <div className="border-2 border-dashed border-border rounded-lg p-6 text-center hover:border-primary/50 transition-colors">
                              <Upload className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
                              <p className="text-sm font-medium">Upload laporan monitoring</p>
                              <p className="text-xs text-muted-foreground">PDF, maksimal 10MB</p>
                              <Button variant="outline" className="mt-2" size="sm">
                                Pilih File
                              </Button>
                            </div>
                          </div>

                          <div className="flex justify-end space-x-2">
                            <Button variant="outline">
                              Simpan Draft
                            </Button>
                            <Button className="bg-gradient-to-r from-primary to-primary/90">
                              <CheckCircle className="w-4 h-4 mr-2" />
                              Submit Laporan
                            </Button>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="p-4 border border-border rounded-lg">
                        <div className="flex items-center space-x-2">
                          <Clock className="w-5 h-5 text-muted-foreground" />
                          <p className="text-muted-foreground">Belum waktunya untuk monitoring ini</p>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Luaran Tab */}
          <TabsContent value="luaran" className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold">Target Luaran Penelitian</h3>
                <p className="text-sm text-muted-foreground">
                  Kelola dan pantau progress luaran penelitian Anda
                </p>
              </div>
              <Button variant="outline">
                <Target className="w-4 h-4 mr-2" />
                Tambah Luaran
              </Button>
            </div>

            <div className="grid gap-4">
              {luaranData.map((luaran) => (
                <Card key={luaran.id} className="border-0 shadow-sm">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <Badge variant="outline">{luaran.jenis}</Badge>
                          {getLuaranStatusBadge(luaran.status)}
                        </div>
                        <h4 className="font-medium text-foreground mb-1">{luaran.judul}</h4>
                        <p className="text-sm text-muted-foreground">Target: {luaran.target}</p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Progress</span>
                        <span className="font-medium">{luaran.progress}%</span>
                      </div>
                      <Progress value={luaran.progress} className="h-2" />
                    </div>

                    <div className="flex justify-end mt-4 space-x-2">
                      <Button variant="outline" size="sm">
                        Update Progress
                      </Button>
                      <Button size="sm">
                        <Upload className="w-4 h-4 mr-2" />
                        Upload Bukti
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Timeline Tab */}
          <TabsContent value="timeline" className="space-y-6">
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle>Timeline Penelitian</CardTitle>
                <CardDescription>
                  Jadwal dan milestone penelitian Anda
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="flex items-center space-x-4">
                    <div className="w-4 h-4 rounded-full bg-green-500"></div>
                    <div className="flex-1">
                      <p className="font-medium">Proposal Diterima</p>
                      <p className="text-sm text-muted-foreground">1 April 2025</p>
                    </div>
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  </div>

                  <div className="flex items-center space-x-4">
                    <div className="w-4 h-4 rounded-full bg-green-500"></div>
                    <div className="flex-1">
                      <p className="font-medium">Monitoring 1</p>
                      <p className="text-sm text-muted-foreground">1 Juli 2025</p>
                    </div>
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  </div>

                  <div className="flex items-center space-x-4">
                    <div className="w-4 h-4 rounded-full bg-orange-500"></div>
                    <div className="flex-1">
                      <p className="font-medium">Monitoring 2</p>
                      <p className="text-sm text-muted-foreground">1 September 2025</p>
                    </div>
                    <Clock className="w-5 h-5 text-orange-500" />
                  </div>

                  <div className="flex items-center space-x-4">
                    <div className="w-4 h-4 rounded-full bg-muted-foreground"></div>
                    <div className="flex-1">
                      <p className="font-medium">Laporan Akhir</p>
                      <p className="text-sm text-muted-foreground">15 Oktober 2025</p>
                    </div>
                    <Flag className="w-5 h-5 text-muted-foreground" />
                  </div>

                  <div className="flex items-center space-x-4">
                    <div className="w-4 h-4 rounded-full bg-muted-foreground"></div>
                    <div className="flex-1">
                      <p className="font-medium">Penelitian Selesai</p>
                      <p className="text-sm text-muted-foreground">1 November 2025</p>
                    </div>
                    <Flag className="w-5 h-5 text-muted-foreground" />
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