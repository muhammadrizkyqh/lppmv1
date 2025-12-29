"use client";

import DashboardLayout from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Search, FileText, Calendar, Eye, CheckCircle, Clock, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { proposalApi } from "@/lib/api-client";

interface ProposalWithMonitoring {
  id: string;
  judul: string;
  status: string;
  periode: {
    id: string;
    nama: string;
    tahun: string;
  };
  skema: {
    id: string;
    nama: string;
  };
  monitoring: Array<{
    id: string;
    persentaseKemajuan: number;
    status: string;
    laporanKemajuan?: string;
    laporanAkhir?: string;
    updatedAt: string;
  }>;
}

export default function DosenMonitoringPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [proposals, setProposals] = useState<ProposalWithMonitoring[]>([]);
  const [searchValue, setSearchValue] = useState("");

  useEffect(() => {
    loadProposals();
  }, []);

  const loadProposals = async () => {
    try {
      setLoading(true);
      // Fetch proposals yang berstatus DITERIMA, BERJALAN, atau SELESAI
      const response = await proposalApi.getAll({
        status: 'DITERIMA,BERJALAN,SELESAI'
      });

      console.log('📊 Monitoring - API Response:', response);
      
      if (response.success && response.data) {
        console.log('✅ Proposals loaded:', response.data.length);
        console.log('📝 First proposal:', response.data[0]);
        setProposals(response.data as any);
      } else {
        console.error('❌ API returned unsuccessful response:', response);
      }
    } catch (error) {
      console.error('❌ Error loading proposals:', error);
      toast.error("Gagal memuat data proposal");
    } finally {
      setLoading(false);
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

  const getMonitoringStatus = (proposal: ProposalWithMonitoring) => {
    if (!proposal.monitoring || proposal.monitoring.length === 0) {
      return {
        icon: <AlertCircle className="w-5 h-5 text-yellow-500" />,
        text: "Belum ada monitoring",
        color: "text-yellow-600",
        progress: 0
      };
    }

    const monitoring = proposal.monitoring[0];
    
    if (monitoring.laporanAkhir) {
      return {
        icon: <CheckCircle className="w-5 h-5 text-green-500" />,
        text: "Laporan akhir sudah disubmit",
        color: "text-green-600",
        progress: monitoring.persentaseKemajuan || 100
      };
    }

    if (monitoring.laporanKemajuan) {
      return {
        icon: <Clock className="w-5 h-5 text-blue-500" />,
        text: "Laporan kemajuan sudah disubmit",
        color: "text-blue-600",
        progress: monitoring.persentaseKemajuan || 50
      };
    }

    return {
      icon: <AlertCircle className="w-5 h-5 text-yellow-500" />,
      text: "Belum ada laporan",
      color: "text-yellow-600",
      progress: monitoring.persentaseKemajuan || 0
    };
  };

  const filteredProposals = proposals.filter(proposal =>
    proposal.judul.toLowerCase().includes(searchValue.toLowerCase()) ||
    proposal.periode?.nama?.toLowerCase().includes(searchValue.toLowerCase()) ||
    proposal.skema?.nama?.toLowerCase().includes(searchValue.toLowerCase())
  );

  const stats = {
    total: proposals.length,
    belumMonitoring: proposals.filter(p => !p.monitoring || p.monitoring.length === 0).length,
    berjalan: proposals.filter(p => p.status === 'BERJALAN').length,
    selesai: proposals.filter(p => p.status === 'SELESAI').length,
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
            Kelola dan pantau progress proposal yang sudah diterima
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
                Proposal yang diterima
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
                Perlu submit laporan
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

        {/* Search */}
        <div className="flex items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Cari judul, periode, atau skema..."
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>

        {/* Proposals List */}
        {filteredProposals.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <FileText className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                {searchValue ? "Tidak ada hasil" : "Belum ada proposal"}
              </h3>
              <p className="text-sm text-muted-foreground text-center max-w-sm">
                {searchValue
                  ? "Coba gunakan kata kunci lain untuk pencarian"
                  : "Proposal yang sudah diterima akan muncul di sini"}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {filteredProposals.map((proposal) => {
              const monitoring = proposal.monitoring?.[0];
              const monitoringStatus = getMonitoringStatus(proposal);
              
              console.log('🔍 Rendering proposal:', {
                id: proposal.id,
                judul: proposal.judul,
                periode: proposal.periode,
                skema: proposal.skema,
                monitoring: monitoring,
                status: proposal.status
              });
              
              return (
                <Card key={proposal.id} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                      {/* Left: Proposal Info */}
                      <div className="flex-1 space-y-3">
                        <div>
                          <h3 className="text-lg font-semibold mb-1">{proposal.judul}</h3>
                          <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
                              {proposal.periode?.nama || 'N/A'} ({proposal.periode?.tahun || 'N/A'})
                            </div>
                            <span>•</span>
                            <span>{proposal.skema?.nama || 'N/A'}</span>
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
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">Progress:</span>
                            <span className="font-medium">{monitoringStatus.progress}%</span>
                          </div>
                          <Progress value={monitoringStatus.progress} className="h-2" />
                        </div>
                      </div>

                      {/* Right: Actions */}
                      <div className="flex lg:flex-col gap-2">
                        <Button
                          onClick={() => router.push(`/dosen/monitoring/${proposal.id}`)}
                          className="flex-1 lg:flex-none"
                        >
                          <Eye className="w-4 h-4 mr-2" />
                          Kelola Monitoring
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
