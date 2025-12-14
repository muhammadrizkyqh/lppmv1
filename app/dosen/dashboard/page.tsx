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
  Plus,
  TrendingUp,
  ArrowRight,
  Calendar,
  Award,
  RefreshCw,
  BarChart3,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { fetchApi } from "@/lib/api-client";

interface DosenDashboardData {
  dosenName: string;
  stats: {
    totalProposals: number;
    draft: number;
    inReview: number;
    approved: number;
    needsRevision: number;
    running: number;
    completed: number;
  };
  changes: {
    proposals: string;
    running: string;
    completed: string;
  };
  proposalsByStatus: Array<{
    status: string;
    count: number;
    label: string;
  }>;
  myProposals: any[];
  upcomingDeadlines: any[];
  monitoringDeadlines: any[];
  pendingVerifications: any[];
}

// Color scheme for chart
const COLORS = {
  DRAFT: "#64748b",
  DIAJUKAN: "#3b82f6",
  DITERIMA: "#22c55e",
  REVISI: "#f97316",
  BERJALAN: "#8b5cf6",
  SELESAI: "#10b981",
};

export default function DosenDashboardPage() {
  const [data, setData] = useState<DosenDashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const result = await fetchApi("/api/dashboard/dosen");
      
      if (result.success && result.data) {
        setData(result.data as DosenDashboardData);
      } else {
        setError(result.error || "Failed to load dashboard");
        toast.error("Gagal memuat data dashboard");
      }
    } catch (err) {
      setError("Failed to fetch dashboard data");
      toast.error("Gagal memuat data dashboard");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <RefreshCw className="w-8 h-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  if (error || !data) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
          <AlertCircle className="w-12 h-12 text-destructive" />
          <p className="text-muted-foreground">{error || "Gagal memuat data"}</p>
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
      description: "Proposal Anda",
      href: "/dosen/proposals",
    },
    {
      title: "Dalam Review",
      value: data.stats.inReview,
      change: "0",
      changeType: "neutral" as const,
      icon: Clock,
      description: "Menunggu keputusan",
      href: "/dosen/proposals?status=REVIEW",
    },
    {
      title: "Disetujui",
      value: data.stats.approved,
      change: "+1",
      changeType: "positive" as const,
      icon: CheckCircle,
      description: "Sedang berjalan",
      href: "/dosen/proposals?status=DITERIMA",
    },
    {
      title: "Perlu Revisi",
      value: data.stats.needsRevision,
      change: "+1",
      changeType: "warning" as const,
      icon: AlertCircle,
      description: "Segera perbaiki",
      href: "/dosen/proposals?status=REVISI",
    },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Welcome Section */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              Selamat Datang, {data.dosenName}
            </h1>
            <p className="text-muted-foreground mt-2">
              Kelola penelitian dan PKM Anda
            </p>
          </div>
          <Link href="/dosen/proposals/create">
            <Button className="bg-gradient-to-r from-primary to-primary/90">
              <Plus className="w-4 h-4 mr-2" />
              Ajukan Proposal Baru
            </Button>
          </Link>
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
                          : stat.changeType === "warning"
                          ? "text-orange-600"
                          : "text-muted-foreground"
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

        {/* Chart & Monitoring Stats */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Pie Chart - Proposals by Status */}
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle>Status Proposal Saya</CardTitle>
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
                  <p>Belum ada proposal</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Running Proposals Stats */}
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle>Ringkasan Monitoring</CardTitle>
              <CardDescription>Status proposal yang sedang berjalan</CardDescription>
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
                <p className="text-2xl font-bold text-violet-600">{data.stats.running}</p>
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
                <p className="text-2xl font-bold text-emerald-600">{data.stats.completed}</p>
              </div>

              <div className="flex items-center justify-between p-4 rounded-lg bg-amber-50">
                <div className="flex items-center space-x-3">
                  <div className="p-2 rounded-full bg-amber-100">
                    <Clock className="w-5 h-5 text-amber-600" />
                  </div>
                  <div>
                    <p className="font-medium text-amber-900">Pending Verifikasi</p>
                    <p className="text-sm text-amber-600">Menunggu admin</p>
                  </div>
                </div>
                <p className="text-2xl font-bold text-amber-600">{data.pendingVerifications.length}</p>
              </div>

              <Link href="/dosen/monitoring">
                <Button variant="outline" className="w-full">
                  Lihat Detail Monitoring
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions & Deadlines */}
        <div className="grid gap-6 md:grid-cols-2">
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle>Aksi Cepat</CardTitle>
              <CardDescription>Menu yang sering digunakan</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <Link href="/dosen/proposals/create">
                <Button variant="outline" className="w-full justify-start">
                  <Plus className="w-4 h-4 mr-2" />
                  Ajukan Proposal Baru
                  <ArrowRight className="w-4 h-4 ml-auto" />
                </Button>
              </Link>
              <Link href="/dosen/proposals">
                <Button variant="outline" className="w-full justify-start">
                  <FileText className="w-4 h-4 mr-2" />
                  Lihat Semua Proposal
                  <ArrowRight className="w-4 h-4 ml-auto" />
                </Button>
              </Link>
              <Link href="/dosen/monitoring">
                <Button variant="outline" className="w-full justify-start">
                  <Calendar className="w-4 h-4 mr-2" />
                  Upload Laporan Monitoring
                  <ArrowRight className="w-4 h-4 ml-auto" />
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle>Deadline Monitoring</CardTitle>
              <CardDescription>Jangan lewatkan batas waktu</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {data.monitoringDeadlines.length > 0 ? (
                data.monitoringDeadlines.slice(0, 3).map((deadline, idx) => {
                  const isUrgent = deadline.daysLeft <= 7;
                  const isPast = deadline.daysLeft < 0;
                  return (
                    <div key={idx} className="flex items-start space-x-3 text-sm">
                      <div className={`p-2 rounded-lg ${isUrgent || isPast ? 'bg-red-100' : 'bg-orange-100'}`}>
                        <AlertCircle className={`w-4 h-4 ${isUrgent || isPast ? 'text-red-600' : 'text-orange-600'}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">
                          Upload Laporan {deadline.type === "kemajuan" ? "Kemajuan" : "Akhir"}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">
                          {deadline.judul} • {Math.abs(deadline.daysLeft)} hari {isPast ? 'terlambat' : 'lagi'}
                        </p>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="flex items-center justify-center py-8 text-muted-foreground">
                  <p className="text-sm">Tidak ada deadline mendesak</p>
                </div>
              )}
              
              {data.monitoringDeadlines.length > 3 && (
                <Link href="/dosen/monitoring">
                  <Button variant="ghost" size="sm" className="w-full">
                    Lihat Semua Deadline
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
