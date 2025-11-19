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
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

interface DashboardStats {
  totalProposals: number;
  inReview: number;
  approved: number;
  needsAction: number;
  totalReviewers: number;
  totalDosen: number;
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<DashboardStats>({
    totalProposals: 0,
    inReview: 0,
    approved: 0,
    needsAction: 0,
    totalReviewers: 0,
    totalDosen: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => {
      setStats({
        totalProposals: 24,
        inReview: 8,
        approved: 15,
        needsAction: 3,
        totalReviewers: 12,
        totalDosen: 45,
      });
      setIsLoading(false);
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  const statCards = [
    {
      title: "Total Proposal",
      value: stats.totalProposals,
      change: "+12%",
      changeType: "positive" as const,
      icon: FileText,
      description: "Dari bulan lalu",
      href: "/admin/proposals",
    },
    {
      title: "Dalam Review",
      value: stats.inReview,
      change: "+3",
      changeType: "positive" as const,
      icon: Clock,
      description: "Menunggu keputusan",
      href: "/admin/reviews",
    },
    {
      title: "Disetujui",
      value: stats.approved,
      change: "+5",
      changeType: "positive" as const,
      icon: CheckCircle,
      description: "Proposal approved",
      href: "/admin/proposals?status=DITERIMA",
    },
    {
      title: "Perlu Tindakan",
      value: stats.needsAction,
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
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              Dashboard Admin
            </h1>
            <p className="text-muted-foreground mt-2">
              Overview dan statistik sistem LPPM
            </p>
          </div>
          <Link href="/admin/proposals/create">
            <Button className="bg-gradient-to-r from-primary to-primary/90">
              <FileText className="w-4 h-4 mr-2" />
              Buat Proposal
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
                  <p className="text-2xl font-bold text-primary">{stats.totalDosen}</p>
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
                  <p className="text-2xl font-bold text-blue-600">{stats.totalReviewers}</p>
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

        {/* Quick Actions */}
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
              <div className="flex items-start space-x-3 text-sm">
                <div className="p-2 rounded-lg bg-green-100">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                </div>
                <div className="flex-1">
                  <p className="font-medium">Proposal disetujui</p>
                  <p className="text-xs text-muted-foreground">P-2025-001 - 2 jam yang lalu</p>
                </div>
              </div>
              <div className="flex items-start space-x-3 text-sm">
                <div className="p-2 rounded-lg bg-blue-100">
                  <Clock className="w-4 h-4 text-blue-600" />
                </div>
                <div className="flex-1">
                  <p className="font-medium">Review selesai</p>
                  <p className="text-xs text-muted-foreground">P-2025-002 - 3 jam yang lalu</p>
                </div>
              </div>
              <div className="flex items-start space-x-3 text-sm">
                <div className="p-2 rounded-lg bg-orange-100">
                  <AlertCircle className="w-4 h-4 text-orange-600" />
                </div>
                <div className="flex-1">
                  <p className="font-medium">Proposal baru masuk</p>
                  <p className="text-xs text-muted-foreground">P-2025-003 - 5 jam yang lalu</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
