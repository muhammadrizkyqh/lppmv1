"use client";

import DashboardLayout from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Settings,
  User,
  Calendar,
  Users,
  BookOpen,
  Shield,
  Bell,
  Database,
  Plus,
  Edit,
  Trash2,
  Save,
  Eye,
  EyeOff
} from "lucide-react";
import { useState } from "react";

export default function SettingsPage() {
  const [showPassword, setShowPassword] = useState(false);

  // Mock data for admin settings
  const periodeData = [
    { id: 1, nama: "Periode 2025-1", tanggalMulai: "2025-01-01", tanggalSelesai: "2025-06-30", status: "aktif" },
    { id: 2, nama: "Periode 2024-2", tanggalMulai: "2024-07-01", tanggalSelesai: "2024-12-31", status: "selesai" },
  ];

  const skemaData = [
    { id: 1, nama: "Penelitian Fundamental", dana: 15000000, durasi: 12, status: "aktif" },
    { id: 2, nama: "Penelitian Terapan", dana: 25000000, durasi: 18, status: "aktif" },
    { id: 3, nama: "Penelitian Kolaboratif", dana: 50000000, durasi: 24, status: "draft" },
  ];

  const bidangKeahlianData = [
    { id: 1, nama: "Teknik Informatika", kode: "TI", fakultas: "Teknik" },
    { id: 2, nama: "Sistem Informasi", kode: "SI", fakultas: "Teknik" },
    { id: 3, nama: "Pendidikan Matematika", kode: "PM", fakultas: "Tarbiyah" },
    { id: 4, nama: "Ekonomi Islam", kode: "EI", fakultas: "Syariah" },
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "aktif":
        return <Badge variant="default">Aktif</Badge>;
      case "draft":
        return <Badge variant="secondary">Draft</Badge>;
      case "selesai":
        return <Badge variant="outline">Selesai</Badge>;
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
            <h1 className="text-3xl font-bold text-foreground">Pengaturan</h1>
            <p className="text-muted-foreground mt-2">
              Kelola pengaturan profil, sistem dan administrasi
            </p>
          </div>
          <Badge variant="outline" className="text-primary border-primary">
            <Settings className="w-3 h-3 mr-1" />
            Administrator
          </Badge>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="profile">
              <User className="w-4 h-4 mr-2" />
              Profil
            </TabsTrigger>
            <TabsTrigger value="periode">
              <Calendar className="w-4 h-4 mr-2" />
              Periode
            </TabsTrigger>
            <TabsTrigger value="skema">
              <BookOpen className="w-4 h-4 mr-2" />
              Skema
            </TabsTrigger>
            <TabsTrigger value="bidang">
              <Users className="w-4 h-4 mr-2" />
              Bidang Keahlian
            </TabsTrigger>
            <TabsTrigger value="security">
              <Shield className="w-4 h-4 mr-2" />
              Keamanan
            </TabsTrigger>
            <TabsTrigger value="system">
              <Database className="w-4 h-4 mr-2" />
              Sistem
            </TabsTrigger>
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile" className="space-y-6">
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle>Informasi Profil</CardTitle>
                <CardDescription>
                  Update informasi profil dan data personal Anda
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="nama">Nama Lengkap</Label>
                    <Input id="nama" defaultValue="Dr. Ahmad Syahrul, M.Kom" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="nidn">NIDN</Label>
                    <Input id="nidn" defaultValue="0123456789" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" defaultValue="ahmad.syahrul@univ.ac.id" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="telepon">Telepon</Label>
                    <Input id="telepon" defaultValue="+62 812-3456-7890" />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="fakultas">Fakultas</Label>
                  <Select defaultValue="teknik">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="teknik">Fakultas Teknik</SelectItem>
                      <SelectItem value="tarbiyah">Fakultas Tarbiyah</SelectItem>
                      <SelectItem value="syariah">Fakultas Syariah</SelectItem>
                      <SelectItem value="ushuluddin">Fakultas Ushuluddin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="prodi">Program Studi</Label>
                  <Select defaultValue="informatika">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="informatika">Teknik Informatika</SelectItem>
                      <SelectItem value="sistem">Sistem Informasi</SelectItem>
                      <SelectItem value="industri">Teknik Industri</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bio">Biografi</Label>
                  <Textarea
                    id="bio"
                    rows={4}
                    defaultValue="Dosen Teknik Informatika dengan spesialisasi dalam bidang Software Engineering dan Machine Learning. Menyelesaikan pendidikan S3 di bidang Computer Science dan aktif dalam penelitian teknologi pendidikan."
                    className="resize-none"
                  />
                </div>

                <div className="flex justify-end">
                  <Button className="bg-gradient-to-r from-primary to-primary/90">
                    <Save className="w-4 h-4 mr-2" />
                    Simpan Perubahan
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Periode Tab */}
          <TabsContent value="periode" className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold">Periode Penelitian</h3>
                <p className="text-sm text-muted-foreground">
                  Kelola periode waktu untuk submission dan review proposal
                </p>
              </div>
              <Button className="bg-gradient-to-r from-primary to-primary/90">
                <Plus className="w-4 h-4 mr-2" />
                Tambah Periode
              </Button>
            </div>

            <div className="grid gap-4">
              {periodeData.map((periode) => (
                <Card key={periode.id} className="border-0 shadow-sm">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h4 className="font-medium text-foreground">{periode.nama}</h4>
                          {getStatusBadge(periode.status)}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {new Date(periode.tanggalMulai).toLocaleDateString('id-ID')} - {' '}
                          {new Date(periode.tanggalSelesai).toLocaleDateString('id-ID')}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button variant="outline" size="sm">
                          <Edit className="w-4 h-4 mr-2" />
                          Edit
                        </Button>
                        <Button variant="outline" size="sm" className="text-red-600 border-red-200">
                          <Trash2 className="w-4 h-4 mr-2" />
                          Hapus
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Skema Tab */}
          <TabsContent value="skema" className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold">Skema Penelitian</h3>
                <p className="text-sm text-muted-foreground">
                  Kelola jenis-jenis skema penelitian dan pendanaan
                </p>
              </div>
              <Button className="bg-gradient-to-r from-primary to-primary/90">
                <Plus className="w-4 h-4 mr-2" />
                Tambah Skema
              </Button>
            </div>

            <div className="grid gap-4">
              {skemaData.map((skema) => (
                <Card key={skema.id} className="border-0 shadow-sm">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h4 className="font-medium text-foreground">{skema.nama}</h4>
                          {getStatusBadge(skema.status)}
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground">
                          <p>Dana: Rp {skema.dana.toLocaleString('id-ID')}</p>
                          <p>Durasi: {skema.durasi} bulan</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button variant="outline" size="sm">
                          <Edit className="w-4 h-4 mr-2" />
                          Edit
                        </Button>
                        <Button variant="outline" size="sm" className="text-red-600 border-red-200">
                          <Trash2 className="w-4 h-4 mr-2" />
                          Hapus
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Bidang Keahlian Tab */}
          <TabsContent value="bidang" className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold">Bidang Keahlian</h3>
                <p className="text-sm text-muted-foreground">
                  Kelola bidang keahlian untuk kategorisasi proposal
                </p>
              </div>
              <Button className="bg-gradient-to-r from-primary to-primary/90">
                <Plus className="w-4 h-4 mr-2" />
                Tambah Bidang
              </Button>
            </div>

            <div className="grid gap-4">
              {bidangKeahlianData.map((bidang) => (
                <Card key={bidang.id} className="border-0 shadow-sm">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h4 className="font-medium text-foreground">{bidang.nama}</h4>
                          <Badge variant="outline">{bidang.kode}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Fakultas: {bidang.fakultas}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button variant="outline" size="sm">
                          <Edit className="w-4 h-4 mr-2" />
                          Edit
                        </Button>
                        <Button variant="outline" size="sm" className="text-red-600 border-red-200">
                          <Trash2 className="w-4 h-4 mr-2" />
                          Hapus
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Security Tab */}
          <TabsContent value="security" className="space-y-6">
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle>Ubah Password</CardTitle>
                <CardDescription>
                  Update password untuk keamanan akun Anda
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="current-password">Password Saat Ini</Label>
                  <div className="relative">
                    <Input
                      id="current-password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Masukkan password saat ini"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="new-password">Password Baru</Label>
                  <Input
                    id="new-password"
                    type="password"
                    placeholder="Masukkan password baru"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirm-password">Konfirmasi Password Baru</Label>
                  <Input
                    id="confirm-password"
                    type="password"
                    placeholder="Konfirmasi password baru"
                  />
                </div>

                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <h4 className="font-medium text-yellow-900 mb-2">Persyaratan Password:</h4>
                  <ul className="text-sm text-yellow-800 space-y-1">
                    <li>• Minimal 8 karakter</li>
                    <li>• Mengandung huruf besar dan kecil</li>
                    <li>• Mengandung minimal 1 angka</li>
                    <li>• Mengandung minimal 1 simbol khusus</li>
                  </ul>
                </div>

                <div className="flex justify-end">
                  <Button className="bg-gradient-to-r from-primary to-primary/90">
                    <Shield className="w-4 h-4 mr-2" />
                    Update Password
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle>Aktivitas Login</CardTitle>
                <CardDescription>
                  Riwayat aktivitas login ke sistem
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">Login Saat Ini</p>
                      <p className="text-sm text-muted-foreground">
                        Windows 11 • Chrome 120 • 192.168.1.100
                      </p>
                    </div>
                    <Badge variant="default">Aktif</Badge>
                  </div>

                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">Login Sebelumnya</p>
                      <p className="text-sm text-muted-foreground">
                        Android • Chrome Mobile • 19 Januari 2025, 14:30
                      </p>
                    </div>
                    <Badge variant="secondary">Selesai</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* System Tab */}
          <TabsContent value="system" className="space-y-6">
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle>Pengaturan Sistem</CardTitle>
                <CardDescription>
                  Konfigurasi umum sistem LPPM
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Maintenance Mode</p>
                      <p className="text-sm text-muted-foreground">Aktifkan mode pemeliharaan sistem</p>
                    </div>
                    <Button variant="outline" size="sm">
                      Nonaktif
                    </Button>
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Email Notifikasi</p>
                      <p className="text-sm text-muted-foreground">Server email untuk notifikasi sistem</p>
                    </div>
                    <Button variant="outline" size="sm">
                      Konfigurasi
                    </Button>
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Backup Database</p>
                      <p className="text-sm text-muted-foreground">Backup otomatis database sistem</p>
                    </div>
                    <Button variant="outline" size="sm">
                      Aktif
                    </Button>
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Log Level</p>
                      <p className="text-sm text-muted-foreground">Level logging sistem</p>
                    </div>
                    <Select defaultValue="info">
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="error">Error</SelectItem>
                        <SelectItem value="warn">Warning</SelectItem>
                        <SelectItem value="info">Info</SelectItem>
                        <SelectItem value="debug">Debug</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <h4 className="font-medium">Informasi Sistem</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Versi Aplikasi</p>
                      <p className="font-medium">LPPM v2.1.0</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Database</p>
                      <p className="font-medium">PostgreSQL 15.2</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Server</p>
                      <p className="font-medium">Node.js 18.17.0</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Last Backup</p>
                      <p className="font-medium">20 Jan 2025, 02:00</p>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button className="bg-gradient-to-r from-primary to-primary/90">
                    <Save className="w-4 h-4 mr-2" />
                    Simpan Pengaturan
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}