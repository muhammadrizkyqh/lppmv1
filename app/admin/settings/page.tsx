"use client";

import { useState } from "react";
import DashboardLayout from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ResponsiveTabs } from "@/components/ui/responsive-tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
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
import { usePeriode, useSkema, useBidangKeahlian } from "@/hooks/use-data";
import { periodeApi, skemaApi, bidangKeahlianApi, type Periode, type Skema, type BidangKeahlian } from "@/lib/api-client";
import { PeriodeFormDialog } from "@/components/settings/periode-form-dialog";
import { SkemaFormDialog } from "@/components/settings/skema-form-dialog";
import { BidangKeahlianFormDialog } from "@/components/settings/bidang-keahlian-form-dialog";
import { toast } from "sonner";

export default function SettingsPage() {
  const [showPassword, setShowPassword] = useState(false);

  // Fetch data from API
  const { data: periodeData, loading: periodeLoading, refetch: refetchPeriode } = usePeriode();
  const { data: skemaData, loading: skemaLoading, refetch: refetchSkema } = useSkema();
  const { data: bidangKeahlianData, loading: bidangLoading, refetch: refetchBidang } = useBidangKeahlian();

  // Dialog states
  const [periodeDialog, setPeriodeDialog] = useState({ open: false, data: null as Periode | null });
  const [skemaDialog, setSkemaDialog] = useState({ open: false, data: null as Skema | null });
  const [bidangDialog, setBidangDialog] = useState({ open: false, data: null as BidangKeahlian | null });

  // Delete confirmation states
  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean;
    type: 'periode' | 'skema' | 'bidang' | null;
    id: string | null;
    name: string | null;
  }>({ open: false, type: null, id: null, name: null });
  const [deleting, setDeleting] = useState(false);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "AKTIF":
      case "aktif":
        return <Badge variant="default">Aktif</Badge>;
      case "NONAKTIF":
      case "draft":
        return <Badge variant="secondary">Nonaktif</Badge>;
      case "SELESAI":
      case "selesai":
        return <Badge variant="outline">Selesai</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const handleDelete = async () => {
    if (!deleteDialog.id || !deleteDialog.type) return;

    setDeleting(true);
    try {
      let result;
      switch (deleteDialog.type) {
        case 'periode':
          result = await periodeApi.delete(deleteDialog.id);
          if (result.success) {
            toast.success("Periode berhasil dihapus!");
            await refetchPeriode();
            setDeleteDialog({ open: false, type: null, id: null, name: null });
          } else {
            toast.error(result.error || "Gagal menghapus periode");
          }
          break;
        case 'skema':
          result = await skemaApi.delete(deleteDialog.id);
          if (result.success) {
            toast.success("Skema berhasil dihapus!");
            await refetchSkema();
            setDeleteDialog({ open: false, type: null, id: null, name: null });
          } else {
            toast.error(result.error || "Gagal menghapus skema");
          }
          break;
        case 'bidang':
          result = await bidangKeahlianApi.delete(deleteDialog.id);
          if (result.success) {
            toast.success("Bidang keahlian berhasil dihapus!");
            await refetchBidang();
            setDeleteDialog({ open: false, type: null, id: null, name: null });
          } else {
            toast.error(result.error || "Gagal menghapus bidang keahlian");
          }
          break;
      }
    } catch (error: any) {
      toast.error(error.message || "Gagal menghapus data");
    } finally {
      setDeleting(false);
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
        <ResponsiveTabs
          defaultValue="profile"
          tabs={[
            { value: 'profile', label: 'Profil', icon: <User className="w-4 h-4" /> },
            { value: 'periode', label: 'Periode', icon: <Calendar className="w-4 h-4" /> },
            { value: 'skema', label: 'Skema', icon: <BookOpen className="w-4 h-4" /> },
            { value: 'bidang', label: 'Bidang Keahlian', icon: <Users className="w-4 h-4" /> },
            { value: 'security', label: 'Keamanan', icon: <Shield className="w-4 h-4" /> },
            { value: 'system', label: 'Sistem', icon: <Database className="w-4 h-4" /> },
          ]}
        >

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
              <Button 
                className="bg-gradient-to-r from-primary to-primary/90"
                onClick={() => setPeriodeDialog({ open: true, data: null })}
              >
                <Plus className="w-4 h-4 mr-2" />
                Tambah Periode
              </Button>
            </div>

            {periodeLoading ? (
              <Card className="border-0 shadow-sm">
                <CardContent className="p-6">
                  <p className="text-center text-muted-foreground">Loading...</p>
                </CardContent>
              </Card>
            ) : periodeData && periodeData.length > 0 ? (
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
                          <p className="text-sm text-muted-foreground mb-1">
                            Tahun: {periode.tahun} • Kuota: {periode.kuota}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(periode.tanggalBuka).toLocaleDateString('id-ID')} - {' '}
                            {new Date(periode.tanggalTutup).toLocaleDateString('id-ID')}
                          </p>
                          {periode._count && (
                            <p className="text-sm text-muted-foreground mt-1">
                              Proposal: {periode._count.proposals}
                            </p>
                          )}
                        </div>
                        <div className="flex items-center space-x-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => setPeriodeDialog({ open: true, data: periode })}
                          >
                            <Edit className="w-4 h-4 mr-2" />
                            Edit
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="text-red-600 border-red-200"
                            onClick={() => setDeleteDialog({
                              open: true,
                              type: 'periode',
                              id: periode.id,
                              name: periode.nama,
                            })}
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Hapus
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="border-0 shadow-sm">
                <CardContent className="p-6">
                  <p className="text-center text-muted-foreground">Belum ada data periode</p>
                </CardContent>
              </Card>
            )}
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
              <Button 
                className="bg-gradient-to-r from-primary to-primary/90"
                onClick={() => setSkemaDialog({ open: true, data: null })}
              >
                <Plus className="w-4 h-4 mr-2" />
                Tambah Skema
              </Button>
            </div>

            {skemaLoading ? (
              <Card className="border-0 shadow-sm">
                <CardContent className="p-6">
                  <p className="text-center text-muted-foreground">Loading...</p>
                </CardContent>
              </Card>
            ) : skemaData && skemaData.length > 0 ? (
              <div className="grid gap-4">
                {skemaData.map((skema) => (
                  <Card key={skema.id} className="border-0 shadow-sm">
                    <CardContent className="p-6">
                      <div className="space-y-4">
                        <div>
                          <div className="flex items-center space-x-3 mb-2">
                            <h4 className="font-medium text-foreground">{skema.nama}</h4>
                            {getStatusBadge(skema.status)}
                            <Badge variant="outline">{skema.tipe}</Badge>
                          </div>
                          {skema.deskripsi && (
                            <p className="text-sm text-muted-foreground mb-1">
                              {skema.deskripsi}
                            </p>
                          )}
                          {skema._count && (
                            <p className="text-sm text-muted-foreground">
                              Proposal: {skema._count.proposal || 0}
                            </p>
                          )}
                        </div>
                        <div className="flex items-center space-x-2 pt-2 border-t">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => setSkemaDialog({ open: true, data: skema })}
                          >
                            <Edit className="w-4 h-4 mr-2" />
                            Edit
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="text-red-600 border-red-200"
                            onClick={() => setDeleteDialog({
                              open: true,
                              type: 'skema',
                              id: skema.id,
                              name: skema.nama,
                            })}
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Hapus
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="border-0 shadow-sm">
                <CardContent className="p-6">
                  <p className="text-center text-muted-foreground">Belum ada data skema</p>
                </CardContent>
              </Card>
            )}
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
              <Button 
                className="bg-gradient-to-r from-primary to-primary/90"
                onClick={() => setBidangDialog({ open: true, data: null })}
              >
                <Plus className="w-4 h-4 mr-2" />
                Tambah Bidang
              </Button>
            </div>

            {bidangLoading ? (
              <Card className="border-0 shadow-sm">
                <CardContent className="p-6">
                  <p className="text-center text-muted-foreground">Loading...</p>
                </CardContent>
              </Card>
            ) : bidangKeahlianData && bidangKeahlianData.length > 0 ? (
              <div className="grid gap-4">
                {bidangKeahlianData.map((bidang) => (
                  <Card key={bidang.id} className="border-0 shadow-sm">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h4 className="font-medium text-foreground">{bidang.nama}</h4>
                            {getStatusBadge(bidang.status)}
                          </div>
                          {bidang.deskripsi && (
                            <p className="text-sm text-muted-foreground mb-1">
                              {bidang.deskripsi}
                            </p>
                          )}
                          {bidang._count && (
                            <p className="text-sm text-muted-foreground">
                              Dosen: {bidang._count.dosens} • Reviewer: {bidang._count.reviewers} • Proposal: {bidang._count.proposals}
                            </p>
                          )}
                        </div>
                        <div className="flex items-center space-x-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => setBidangDialog({ open: true, data: bidang })}
                          >
                            <Edit className="w-4 h-4 mr-2" />
                            Edit
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="text-red-600 border-red-200"
                            onClick={() => setDeleteDialog({
                              open: true,
                              type: 'bidang',
                              id: bidang.id,
                              name: bidang.nama,
                            })}
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Hapus
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="border-0 shadow-sm">
                <CardContent className="p-6">
                  <p className="text-center text-muted-foreground">Belum ada data bidang keahlian</p>
                </CardContent>
              </Card>
            )}
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
        </ResponsiveTabs>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialog.open} onOpenChange={(open) => !deleting && setDeleteDialog({ ...deleteDialog, open })}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Konfirmasi Hapus</AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Anda yakin ingin menghapus {deleteDialog.type === 'periode' ? 'periode' : deleteDialog.type === 'skema' ? 'skema' : 'bidang keahlian'} <strong>{deleteDialog.name}</strong>?
              {deleteDialog.type === 'periode' && ' Periode yang memiliki proposal tidak dapat dihapus.'}
              {deleteDialog.type === 'skema' && ' Skema yang memiliki proposal tidak dapat dihapus.'}
              {deleteDialog.type === 'bidang' && ' Bidang keahlian yang digunakan oleh dosen, reviewer, atau proposal tidak dapat dihapus.'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {deleting ? 'Menghapus...' : 'Hapus'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Form Dialogs */}
      <PeriodeFormDialog
        open={periodeDialog.open}
        onOpenChange={(open) => setPeriodeDialog({ open, data: null })}
        periode={periodeDialog.data}
        onSuccess={() => {
          refetchPeriode();
          setPeriodeDialog({ open: false, data: null });
        }}
      />

      <SkemaFormDialog
        open={skemaDialog.open}
        onOpenChange={(open) => setSkemaDialog({ open, data: null })}
        skema={skemaDialog.data}
        onSuccess={() => {
          refetchSkema();
          setSkemaDialog({ open: false, data: null });
        }}
      />

      <BidangKeahlianFormDialog
        open={bidangDialog.open}
        onOpenChange={(open) => setBidangDialog({ open, data: null })}
        bidangKeahlian={bidangDialog.data}
        onSuccess={() => {
          refetchBidang();
          setBidangDialog({ open: false, data: null });
        }}
      />
    </DashboardLayout>
  );
}