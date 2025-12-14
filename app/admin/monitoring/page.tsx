"use client";

import DashboardLayout from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Search,
  CheckCircle,
  AlertCircle,
  Clock,
  Calendar,
  FileText,
  Eye,
  Filter,
} from "lucide-react";
import { toast } from "sonner";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { monitoringApi, MonitoringList, MonitoringStats } from "@/lib/api-client";
import { periodeApi } from "@/lib/api-client";

interface Periode {
  id: string;
  nama: string;
  tahun: string;
  status: string;
}

export default function AdminMonitoringPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [proposals, setProposals] = useState<MonitoringList[]>([]);
  const [stats, setStats] = useState<MonitoringStats>({
    total: 0,
    berjalan: 0,
    selesai: 0,
    belumMonitoring: 0,
  });
  const [periodeList, setPeriodeList] = useState<Periode[]>([]);
  
  // Filters
  const [searchValue, setSearchValue] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [periodeFilter, setPeriodeFilter] = useState<string>("ALL");

  useEffect(() => {
    loadPeriode();
    loadMonitoring();
  }, [statusFilter, periodeFilter]);

  const loadPeriode = async () => {
    try {
      const response = await periodeApi.getAll();
      if (response.success && response.data) {
        setPeriodeList(response.data as any);
      }
    } catch (error) {
      console.error('Error loading periode:', error);
    }
  };

  const loadMonitoring = async () => {
    try {
      setLoading(true);
      const response = await monitoringApi.listMonitoring({
        status: statusFilter !== 'ALL' ? statusFilter : undefined,
        periodeId: periodeFilter !== 'ALL' ? periodeFilter : undefined,
        search: searchValue || undefined,
      });

      if (response.success && Array.isArray(response.data)) {
        setProposals(response.data);
        // Stats are embedded in the response data object
        const stats = {
          total: response.data.length,
          berjalan: response.data.filter((p: any) => p.status === 'BERJALAN').length,
          selesai: response.data.filter((p: any) => p.status === 'SELESAI').length,
          belumMonitoring: response.data.filter((p: any) => !p.lastMonitoring).length,
        };
        setStats(stats);
      } else {
        toast.error(response.error || "Gagal memuat data monitoring");
      }
    } catch (error) {
      console.error('Error loading monitoring:', error);
      toast.error("Terjadi kesalahan saat memuat data");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    loadMonitoring();
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

  const getMonitoringStatus = (proposal: MonitoringList) => {
    if (!proposal.monitoring || proposal.monitoring.length === 0) {
      return {
        icon: <AlertCircle className="w-5 h-5 text-yellow-500" />,
        text: "Belum ada monitoring",
        color: "text-yellow-600"
      };
    }

    const monitoring = proposal.monitoring[0];
    
    if (monitoring.laporanAkhir) {
      return {
        icon: <CheckCircle className="w-5 h-5 text-green-500" />,
        text: "Laporan akhir sudah disubmit",
        color: "text-green-600"
      };
    }

    if (monitoring.laporanKemajuan) {
      return {
        icon: <Clock className="w-5 h-5 text-blue-500" />,
        text: "Laporan kemajuan sudah disubmit",
        color: "text-blue-600"
      };
    }

    return {
      icon: <AlertCircle className="w-5 h-5 text-yellow-500" />,
      text: "Belum ada laporan",
      color: "text-yellow-600"
    };
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Monitoring & Laporan</h1>
          <p className="text-muted-foreground">
            Pantau dan verifikasi laporan monitoring proposal
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Proposal</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
              <p className="text-xs text-muted-foreground">
                Proposal diterima
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Belum Monitoring</CardTitle>
              <AlertCircle className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.belumMonitoring}</div>
              <p className="text-xs text-muted-foreground">
                Belum ada laporan
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Sedang Berjalan</CardTitle>
              <Clock className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.berjalan}</div>
              <p className="text-xs text-muted-foreground">
                Progress ongoing
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Selesai</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.selesai}</div>
              <p className="text-xs text-muted-foreground">
                Proposal completed
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Cari judul atau nama ketua..."
                  value={searchValue}
                  onChange={(e) => setSearchValue(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  className="pl-9"
                />
              </div>

              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full lg:w-[200px]">
                  <SelectValue placeholder="Semua Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">Semua Status</SelectItem>
                  <SelectItem value="DITERIMA">Diterima</SelectItem>
                  <SelectItem value="BERJALAN">Berjalan</SelectItem>
                  <SelectItem value="SELESAI">Selesai</SelectItem>
                </SelectContent>
              </Select>

              <Select value={periodeFilter} onValueChange={setPeriodeFilter}>
                <SelectTrigger className="w-full lg:w-[200px]">
                  <SelectValue placeholder="Semua Periode" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">Semua Periode</SelectItem>
                  {periodeList.map((periode) => (
                    <SelectItem key={periode.id} value={periode.id}>
                      {periode.nama} ({periode.tahun})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Button onClick={handleSearch} variant="default">
                <Filter className="w-4 h-4 mr-2" />
                Filter
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Proposals List */}
        {proposals.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <FileText className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">Tidak ada data</h3>
              <p className="text-sm text-muted-foreground text-center max-w-sm">
                Belum ada proposal yang perlu dimonitor
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {proposals.map((proposal) => {
              const monitoring = proposal.monitoring?.[0];
              const monitoringStatus = getMonitoringStatus(proposal);
              
              return (
                <Card key={proposal.id} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                      {/* Left: Proposal Info */}
                      <div className="flex-1 space-y-3">
                        <div>
                          <h3 className="text-lg font-semibold mb-1">{proposal.judul}</h3>
                          <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                            <span>{proposal.dosen?.nama}</span>
                            <span>•</span>
                            <div className="flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
                              {proposal.periode?.nama} ({proposal.periode?.tahun})
                            </div>
                            <span>•</span>
                            <span>{proposal.skema?.nama}</span>
                          </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-2">
                          {getStatusBadge(proposal.status)}
                          <div className={`flex items-center gap-2 ${monitoringStatus.color}`}>
                            {monitoringStatus.icon}
                            <span className="text-sm font-medium">{monitoringStatus.text}</span>
                          </div>
                        </div>

                        {/* Progress Bar */}
                        {monitoring && (
                          <div className="space-y-2">
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-muted-foreground">Progress:</span>
                              <span className="font-medium">{monitoring.persentaseKemajuan}%</span>
                            </div>
                            <Progress value={monitoring.persentaseKemajuan} className="h-2" />
                          </div>
                        )}
                      </div>

                      {/* Right: Actions */}
                      <div className="flex lg:flex-col gap-2">
                        <Button
                          onClick={() => router.push(`/admin/monitoring/${proposal.id}`)}
                          className="flex-1 lg:flex-none"
                        >
                          <Eye className="w-4 h-4 mr-2" />
                          Detail & Verifikasi
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
