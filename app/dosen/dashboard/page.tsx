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
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

interface DosenDashboardStats {
  totalProposals: number;
  inReview: number;
  approved: number;
  needsRevision: number;
  publications: number;
}

export default function DosenDashboardPage() {
  const [stats] = useState<DosenDashboardStats>({
    totalProposals: 8,
    inReview: 2,
    approved: 5,
    needsRevision: 1,
    publications: 12,
  });

  const statCards = [
    {
      title: "Total Proposal",
      value: stats.totalProposals,
      change: "+2",
      changeType: "positive" as const,
      icon: FileText,
      description: "Proposal Anda",
      href: "/dosen/proposals",
    },
    {
      title: "Dalam Review",
      value: stats.inReview,
      change: "0",
      changeType: "neutral" as const,
      icon: Clock,
      description: "Menunggu keputusan",
      href: "/dosen/proposals?status=REVIEW",
    },
    {
      title: "Disetujui",
      value: stats.approved,
      change: "+1",
      changeType: "positive" as const,
      icon: CheckCircle,
      description: "Sedang berjalan",
      href: "/dosen/proposals?status=DITERIMA",
    },
    {
      title: "Perlu Revisi",
      value: stats.needsRevision,
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
              Dashboard Dosen
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

        {/* Quick Stats */}
        <div className="grid gap-6 md:grid-cols-3">
          <Card className="border-0 shadow-sm bg-gradient-to-br from-primary/5 to-primary/10">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="p-3 rounded-full bg-primary/10">
                  <TrendingUp className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Tingkat Approval</p>
                  <p className="text-2xl font-bold text-primary">85%</p>
                  <p className="text-xs text-muted-foreground">Proposal Anda</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm bg-gradient-to-br from-blue-50 to-blue-100">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="p-3 rounded-full bg-blue-100">
                  <Award className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Luaran</p>
                  <p className="text-2xl font-bold text-blue-600">{stats.publications}</p>
                  <p className="text-xs text-muted-foreground">Publikasi & produk</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm bg-gradient-to-br from-amber-50 to-amber-100">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="p-3 rounded-full bg-amber-100">
                  <Calendar className="w-6 h-6 text-amber-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Deadline Terdekat</p>
                  <p className="text-2xl font-bold text-amber-600">3</p>
                  <p className="text-xs text-muted-foreground">Hari lagi</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
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
              <Link href="/dosen/reports">
                <Button variant="outline" className="w-full justify-start">
                  <Calendar className="w-4 h-4 mr-2" />
                  Upload Laporan
                  <ArrowRight className="w-4 h-4 ml-auto" />
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle>Tugas Mendatang</CardTitle>
              <CardDescription>Jangan lewatkan deadline</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start space-x-3 text-sm">
                <div className="p-2 rounded-lg bg-orange-100">
                  <AlertCircle className="w-4 h-4 text-orange-600" />
                </div>
                <div className="flex-1">
                  <p className="font-medium">Upload laporan monitoring 1</p>
                  <p className="text-xs text-muted-foreground">P-2025-001 - Deadline: 3 hari lagi</p>
                </div>
              </div>
              <div className="flex items-start space-x-3 text-sm">
                <div className="p-2 rounded-lg bg-blue-100">
                  <FileText className="w-4 h-4 text-blue-600" />
                </div>
                <div className="flex-1">
                  <p className="font-medium">Revisi proposal berdasarkan feedback</p>
                  <p className="text-xs text-muted-foreground">P-2025-004 - Deadline: 5 hari lagi</p>
                </div>
              </div>
              <div className="flex items-start space-x-3 text-sm">
                <div className="p-2 rounded-lg bg-green-100">
                  <Award className="w-4 h-4 text-green-600" />
                </div>
                <div className="flex-1">
                  <p className="font-medium">Submit luaran penelitian</p>
                  <p className="text-xs text-muted-foreground">P-2025-002 - Deadline: 7 hari lagi</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
