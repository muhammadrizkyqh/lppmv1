import DashboardLayout from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  FileText,
  Upload,
  Users,
  Calendar,
  DollarSign,
  AlertCircle,
  Check,
  X,
  Plus
} from "lucide-react";

export default function CreateProposalPage() {
  // Mock data
  const periode = [
    { id: "1", nama: "Periode 1 Tahun 2025", status: "aktif" },
    { id: "2", nama: "Periode 2 Tahun 2025", status: "draft" }
  ];

  const skema = [
    { id: "1", nama: "Penelitian Dasar", dana: 5000000 },
    { id: "2", nama: "Penelitian Terapan", dana: 5000000 },
    { id: "3", nama: "Penelitian Pengembangan", dana: 7000000 },
    { id: "4", nama: "Penelitian Mandiri", dana: 0 }
  ];

  const bidangKeahlian = [
    { id: "1", nama: "Pendidikan Bahasa Arab (PBA)" },
    { id: "2", nama: "Pendidikan Agama Islam (PAI)" },
    { id: "3", nama: "Hukum Ekonomi Syariah (HES)" },
    { id: "4", nama: "Manajemen Pendidikan Islam (MPI)" }
  ];

  const anggotaTim = [
    { id: "1", nama: "Dr. Ahmad Suharto", nidn: "2112345678", role: "ketua", type: "dosen" },
    { id: "2", nama: "M. Rifqi Pratama", nim: "2021001", role: "anggota", type: "mahasiswa" }
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Ajukan Proposal Baru</h1>
            <p className="text-muted-foreground mt-2">
              Lengkapi form untuk mengajukan proposal penelitian atau PKM
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="outline">
              Simpan Draft
            </Button>
            <Button className="bg-gradient-to-r from-primary to-primary/90">
              <Check className="w-4 h-4 mr-2" />
              Submit Proposal
            </Button>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Information */}
            <Card className="border-0 shadow-sm">
              <CardHeader className="pb-4">
                <div className="flex items-center space-x-2">
                  <FileText className="w-5 h-5 text-primary" />
                  <CardTitle>Informasi Dasar</CardTitle>
                </div>
                <CardDescription>
                  Pilih periode dan skema penelitian yang sesuai
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="periode">Periode Penelitian *</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih periode" />
                      </SelectTrigger>
                      <SelectContent>
                        {periode.map((p) => (
                          <SelectItem key={p.id} value={p.id} disabled={p.status !== "aktif"}>
                            <div className="flex items-center justify-between w-full">
                              <span>{p.nama}</span>
                              {p.status === "aktif" && (
                                <Badge variant="outline" className="ml-2 text-green-600 border-green-200">
                                  Aktif
                                </Badge>
                              )}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="skema">Skema Penelitian *</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih skema" />
                      </SelectTrigger>
                      <SelectContent>
                        {skema.map((s) => (
                          <SelectItem key={s.id} value={s.id}>
                            <div>
                              <div className="font-medium">{s.nama}</div>
                              <div className="text-sm text-muted-foreground">
                                {s.dana > 0 ? `Rp ${s.dana.toLocaleString('id-ID')}` : "Mandiri"}
                              </div>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="judul">Judul Penelitian *</Label>
                  <Input
                    id="judul"
                    placeholder="Masukkan judul penelitian yang jelas dan spesifik"
                    className="text-base"
                  />
                  <p className="text-sm text-muted-foreground">
                    Maksimal 500 karakter
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bidang">Bidang Keahlian *</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih bidang keahlian" />
                    </SelectTrigger>
                    <SelectContent>
                      {bidangKeahlian.map((b) => (
                        <SelectItem key={b.id} value={b.id}>
                          {b.nama}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="abstrak">Abstrak *</Label>
                  <Textarea
                    id="abstrak"
                    rows={6}
                    placeholder="Tuliskan abstrak penelitian dengan ringkas dan jelas (maksimal 500 karakter)"
                    className="resize-none"
                  />
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>Jelaskan latar belakang, tujuan, metode, dan manfaat penelitian</span>
                    <span>0/500</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* File Upload */}
            <Card className="border-0 shadow-sm">
              <CardHeader className="pb-4">
                <div className="flex items-center space-x-2">
                  <Upload className="w-5 h-5 text-primary" />
                  <CardTitle>Upload Dokumen</CardTitle>
                </div>
                <CardDescription>
                  Upload file proposal dalam format PDF (maksimal 10MB)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="border-2 border-dashed border-border rounded-lg p-6 text-center hover:border-primary/50 transition-colors">
                  <Upload className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                  <div className="space-y-2">
                    <p className="text-sm font-medium">
                      Drag & drop file atau klik untuk browse
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Hanya file PDF, maksimal 10MB
                    </p>
                  </div>
                  <Button variant="outline" className="mt-4">
                    Pilih File
                  </Button>
                </div>

                <div className="mt-4 p-3 border border-amber-200 bg-amber-50 rounded-lg">
                  <div className="flex items-start space-x-2">
                    <AlertCircle className="w-4 h-4 text-amber-600 mt-0.5" />
                    <div className="text-sm text-amber-800">
                      <p className="font-medium">Tips untuk file proposal:</p>
                      <ul className="mt-1 space-y-1 text-xs">
                        <li>• Gunakan format PDF yang dapat dibaca dengan baik</li>
                        <li>• Pastikan semua halaman terlihat jelas</li>
                        <li>• Ukuran file tidak lebih dari 10MB</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Team Members */}
            <Card className="border-0 shadow-sm">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Users className="w-5 h-5 text-primary" />
                    <div>
                      <CardTitle>Anggota Tim</CardTitle>
                      <CardDescription className="mt-1">
                        Maksimal 4 orang (termasuk ketua)
                      </CardDescription>
                    </div>
                  </div>
                  <Button variant="outline" size="sm">
                    <Plus className="w-4 h-4 mr-2" />
                    Tambah Anggota
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {anggotaTim.map((anggota, index) => (
                    <div key={anggota.id} className="flex items-center justify-between p-3 border border-border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-medium text-primary">
                          {anggota.nama.charAt(0)}
                        </div>
                        <div>
                          <p className="font-medium text-sm">{anggota.nama}</p>
                          <p className="text-xs text-muted-foreground">
                            {anggota.type === "dosen" ? `NIDN: ${anggota.nidn}` : `NIM: ${anggota.nim}`}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant={anggota.role === "ketua" ? "default" : "secondary"}>
                          {anggota.role === "ketua" ? "Ketua" : "Anggota"}
                        </Badge>
                        {anggota.role !== "ketua" && (
                          <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive">
                            <X className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Status Card */}
            <Card className="border-0 shadow-sm bg-gradient-to-br from-primary/5 to-primary/10">
              <CardContent className="p-6">
                <div className="text-center space-y-3">
                  <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center mx-auto">
                    <FileText className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold text-primary">Draft Proposal</p>
                    <p className="text-sm text-muted-foreground">
                      Lengkapi semua field untuk submit
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Guidelines */}
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle className="text-base">Panduan Pengajuan</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-start space-x-2">
                    <div className="w-2 h-2 rounded-full bg-primary mt-2"></div>
                    <div className="text-sm">
                      <p className="font-medium">Pilih Periode Aktif</p>
                      <p className="text-muted-foreground text-xs">
                        Hanya periode yang berstatus aktif yang dapat dipilih
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-2">
                    <div className="w-2 h-2 rounded-full bg-primary mt-2"></div>
                    <div className="text-sm">
                      <p className="font-medium">Judul Spesifik</p>
                      <p className="text-muted-foreground text-xs">
                        Gunakan judul yang jelas dan mencerminkan isi penelitian
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-2">
                    <div className="w-2 h-2 rounded-full bg-primary mt-2"></div>
                    <div className="text-sm">
                      <p className="font-medium">Abstrak Ringkas</p>
                      <p className="text-muted-foreground text-xs">
                        Maksimal 500 karakter, jelaskan inti penelitian
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-2">
                    <div className="w-2 h-2 rounded-full bg-primary mt-2"></div>
                    <div className="text-sm">
                      <p className="font-medium">Tim Maksimal 4 Orang</p>
                      <p className="text-muted-foreground text-xs">
                        Termasuk ketua penelitian
                      </p>
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="space-y-2">
                  <p className="text-sm font-medium">Kontak Bantuan</p>
                  <p className="text-xs text-muted-foreground">
                    Email: lppm@staiali.ac.id<br />
                    WhatsApp: +62 812-3456-7890
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Timeline */}
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <div className="flex items-center space-x-2">
                  <Calendar className="w-4 h-4 text-primary" />
                  <CardTitle className="text-base">Timeline</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Deadline Submit:</span>
                    <span className="font-medium">15 Mar 2025</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Periode Review:</span>
                    <span className="font-medium">16-30 Mar 2025</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Pengumuman:</span>
                    <span className="font-medium">5 Apr 2025</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}