"use client";

import DashboardLayout from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  FileText,
  Clock,
  CheckCircle,
  AlertCircle,
  Users,
  BarChart3,
  TrendingUp,
  ArrowRight,
  Calendar,
  ClipboardList,
  RefreshCw,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { fetchApi } from "@/lib/api-client";

interface DashboardStats {
  totalProposals: number;
  inReview: number;
  approved: number;
  needsAction: number;
  totalReviewers: number;
  totalDosen: number;
}

interface DashboardData {
  stats: DashboardStats;
  changes: {
    proposals: string;
    reviews: string;
    approved: string;
  };
  proposalsByStatus: Array<{
    status: string;
    count: number;
    label: string;
  }>;
  monitoring: {
    total: number;
    berjalan: number;
    selesai: number;
    pendingKemajuanVerification: number;
    pendingAkhirVerification: number;
  };
  recentProposals: any[];
  recentReviews: any[];
}

export default function AdminDashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await fetch('/api/dashboard/admin');
      const result = await response.json();

      if (result.success) {
        setData(result.data);
      } else {
        setError(result.error || 'Gagal memuat data');
        toast.error(result.error || 'Gagal memuat data dashboard');
      }
    } catch (err) {
      console.error('Dashboard fetch error:', err);
      setError('Terjadi kesalahan koneksi');
      toast.error('Terjadi kesalahan koneksi');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Chart colors for proposals by status
  const COLORS = {
    DRAFT: '#94a3b8',      // slate
    DIAJUKAN: '#60a5fa',   // blue
    DIREVIEW: '#fbbf24',   // amber
    REVISI: '#f97316',     // orange
    DITERIMA: '#22c55e',   // green
    DITOLAK: '#ef4444',    // red
    BERJALAN: '#8b5cf6',   // violet
    SELESAI: '#10b981',    // emerald
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-96">
          <RefreshCw className="w-8 h-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  if (error || !data) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center h-96 space-y-4">
          <AlertCircle className="w-12 h-12 text-destructive" />
          <p className="text-muted-foreground">{error || 'Gagal memuat data'}</p>
          <Button onClick={fetchDashboardData}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Coba Lagi
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  const statCards = [
    {
      title: "Total Proposal",
      value: data.stats.totalProposals,
      change: data.changes.proposals,
      changeType: "positive" as const,
      icon: FileText,
      description: "Dari bulan lalu",
      href: "/admin/proposals",
    },
    {
      title: "Dalam Review",
      value: data.stats.inReview,
      change: data.changes.reviews,
      changeType: "positive" as const,
      icon: Clock,
      description: "Menunggu keputusan",
      href: "/admin/reviews",
    },
    {
      title: "Disetujui",
      value: data.stats.approved,
      change: data.changes.approved,
      changeType: "positive" as const,
      icon: CheckCircle,
      description: "Proposal approved",
      href: "/admin/proposals?status=DITERIMA",
    },
    {
      title: "Perlu Tindakan",
      value: data.stats.needsAction,
      change: "-2",
      changeType: "negative" as const,
      icon: AlertCircle,
      description: "Revisi & monitoring",
      href: "/admin/reviews",
    },
  ];

  if (isLoading) {
    return <DashboardLayout><div /></DashboardLayout>;
  }

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Welcome Section */}
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            Dashboard Admin
          </h1>
          <p className="text-muted-foreground mt-2">
            Overview dan statistik sistem LPPM
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {statCards.map((stat) => (
            <Link key={stat.title} href={stat.href}>
              <Card className="border-0 shadow-sm hover:shadow-md transition-all cursor-pointer">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    {stat.title}
                  </CardTitle>
                  <stat.icon className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-foreground">{stat.value}</div>
                  <div className="flex items-center space-x-1 mt-1">
                    <span
                      className={`text-xs ${
                        stat.changeType === "positive"
                          ? "text-green-600"
                          : "text-red-600"
                      }`}
                    >
                      {stat.change}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {stat.description}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        {/* Quick Access */}
        <div className="grid gap-6 lg:grid-cols-3">
          <Card className="border-0 shadow-sm bg-gradient-to-br from-primary/5 to-primary/10">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="p-3 rounded-full bg-primary/10">
                  <Users className="w-6 h-6 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground">Total Dosen</p>
                  <p className="text-2xl font-bold text-primary">{data.stats.totalDosen}</p>
                  <p className="text-xs text-muted-foreground">Peneliti aktif</p>
                </div>
                <Link href="/admin/data-master">
                  <Button variant="ghost" size="sm">
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm bg-gradient-to-br from-blue-50 to-blue-100">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="p-3 rounded-full bg-blue-100">
                  <ClipboardList className="w-6 h-6 text-blue-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground">Reviewer</p>
                  <p className="text-2xl font-bold text-blue-600">{data.stats.totalReviewers}</p>
                  <p className="text-xs text-muted-foreground">Total reviewer</p>
                </div>
                <Link href="/admin/data-master">
                  <Button variant="ghost" size="sm">
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm bg-gradient-to-br from-amber-50 to-amber-100">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="p-3 rounded-full bg-amber-100">
                  <TrendingUp className="w-6 h-6 text-amber-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground">Tingkat Approval</p>
                  <p className="text-2xl font-bold text-amber-600">87%</p>
                  <p className="text-xs text-muted-foreground">+5% dari tahun lalu</p>
                </div>
                <Link href="/admin/monitoring">
                  <Button variant="ghost" size="sm">
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Chart & Monitoring Stats */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Pie Chart - Proposals by Status */}
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle>Distribusi Status Proposal</CardTitle>
              <CardDescription>Breakdown proposal berdasarkan status</CardDescription>
            </CardHeader>
            <CardContent>
              {data.proposalsByStatus.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={data.proposalsByStatus}
                      dataKey="count"
                      nameKey="label"
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      label={(entry: any) => `${entry.label}: ${entry.count}`}
                    >
                      {data.proposalsByStatus.map((entry) => (
                        <Cell key={entry.status} fill={COLORS[entry.status as keyof typeof COLORS]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                  <p>Belum ada data proposal</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Monitoring Stats */}
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle>Status Monitoring</CardTitle>
              <CardDescription>Progress monitoring proposal yang sedang berjalan</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-lg bg-violet-50">
                <div className="flex items-center space-x-3">
                  <div className="p-2 rounded-full bg-violet-100">
                    <BarChart3 className="w-5 h-5 text-violet-600" />
                  </div>
                  <div>
                    <p className="font-medium text-violet-900">Proposal Berjalan</p>
                    <p className="text-sm text-violet-600">Sedang dalam proses</p>
                  </div>
                </div>
                <p className="text-2xl font-bold text-violet-600">{data.monitoring.berjalan}</p>
              </div>

              <div className="flex items-center justify-between p-4 rounded-lg bg-emerald-50">
                <div className="flex items-center space-x-3">
                  <div className="p-2 rounded-full bg-emerald-100">
                    <CheckCircle className="w-5 h-5 text-emerald-600" />
                  </div>
                  <div>
                    <p className="font-medium text-emerald-900">Proposal Selesai</p>
                    <p className="text-sm text-emerald-600">Telah terverifikasi</p>
                  </div>
                </div>
                <p className="text-2xl font-bold text-emerald-600">{data.monitoring.selesai}</p>
              </div>

              <div className="flex items-center justify-between p-4 rounded-lg bg-amber-50">
                <div className="flex items-center space-x-3">
                  <div className="p-2 rounded-full bg-amber-100">
                    <Clock className="w-5 h-5 text-amber-600" />
                  </div>
                  <div>
                    <p className="font-medium text-amber-900">Pending Verifikasi</p>
                    <p className="text-sm text-amber-600">Perlu ditinjau</p>
                  </div>
                </div>
                <p className="text-2xl font-bold text-amber-600">
                  {data.monitoring.pendingKemajuanVerification + data.monitoring.pendingAkhirVerification}
                </p>
              </div>

              <Link href="/admin/monitoring">
                <Button variant="outline" className="w-full">
                  Lihat Detail Monitoring
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions & Recent Activities */}
        <div className="grid gap-6 md:grid-cols-2">
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle>Akses Cepat</CardTitle>
              <CardDescription>Menu yang sering digunakan</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <Link href="/admin/proposals">
                <Button variant="outline" className="w-full justify-start">
                  <FileText className="w-4 h-4 mr-2" />
                  Kelola Semua Proposal
                  <ArrowRight className="w-4 h-4 ml-auto" />
                </Button>
              </Link>
              <Link href="/admin/reviews">
                <Button variant="outline" className="w-full justify-start">
                  <ClipboardList className="w-4 h-4 mr-2" />
                  Review & Approval
                  <ArrowRight className="w-4 h-4 ml-auto" />
                </Button>
              </Link>
              <Link href="/admin/monitoring">
                <Button variant="outline" className="w-full justify-start">
                  <BarChart3 className="w-4 h-4 mr-2" />
                  Monitoring Progress
                  <ArrowRight className="w-4 h-4 ml-auto" />
                </Button>
              </Link>
              <Link href="/admin/data-master">
                <Button variant="outline" className="w-full justify-start">
                  <Users className="w-4 h-4 mr-2" />
                  Kelola Pengguna
                  <ArrowRight className="w-4 h-4 ml-auto" />
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle>Aktivitas Terbaru</CardTitle>
              <CardDescription>Update sistem terkini</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {data.recentProposals.length > 0 ? (
                data.recentProposals.slice(0, 5).map((proposal) => {
                  const statusConfig: Record<string, { icon: any; color: string; label: string }> = {
                    DRAFT: { icon: FileText, color: "slate", label: "Draft" },
                    DIAJUKAN: { icon: Clock, color: "blue", label: "Diajukan" },
                    DIREVIEW: { icon: ClipboardList, color: "amber", label: "Direview" },
                    REVISI: { icon: AlertCircle, color: "orange", label: "Revisi" },
                    DITERIMA: { icon: CheckCircle, color: "green", label: "Diterima" },
                    DITOLAK: { icon: AlertCircle, color: "red", label: "Ditolak" },
                    BERJALAN: { icon: BarChart3, color: "violet", label: "Berjalan" },
                    SELESAI: { icon: CheckCircle, color: "emerald", label: "Selesai" }
                  };
                  const config = statusConfig[proposal.status] || { icon: FileText, color: "slate", label: proposal.status };

                  const StatusIcon = config.icon;

                  return (
                    <div key={proposal.id} className="flex items-start space-x-3 text-sm">
                      <div className={`p-2 rounded-lg bg-${config.color}-100`}>
                        <StatusIcon className={`w-4 h-4 text-${config.color}-600`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{proposal.judul}</p>
                        <p className="text-xs text-muted-foreground">
                          {proposal.dosen.nama} • {config.label} • {proposal.skema.nama}
                        </p>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="flex items-center justify-center py-8 text-muted-foreground">
                  <p className="text-sm">Belum ada aktivitas</p>
                </div>
              )}

              {data.recentProposals.length > 5 && (
                <Link href="/admin/proposals">
                  <Button variant="ghost" size="sm" className="w-full">
                    Lihat Semua
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
