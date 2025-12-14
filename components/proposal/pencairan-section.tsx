"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DollarSign, Calendar, CheckCircle, Clock, XCircle, FileText, Download } from "lucide-react";
import { pencairanApi, PencairanDana } from "@/lib/api-client";
import { toast } from "sonner";

interface PencairanSectionProps {
  proposalId: string;
}

export default function PencairanSection({ proposalId }: PencairanSectionProps) {
  const [loading, setLoading] = useState(true);
  const [pencairan, setPencairan] = useState<PencairanDana[]>([]);
  const [total, setTotal] = useState({ dicairkan: 0, pending: 0 });

  useEffect(() => {
    loadPencairan();
  }, [proposalId]);

  const loadPencairan = async () => {
    try {
      setLoading(true);
      const response = await pencairanApi.getPencairanByProposal(proposalId);
      
      if (response.success && response.data) {
        setPencairan(response.data.data || []);
        setTotal(response.data.total || { dicairkan: 0, pending: 0 });
      } else {
        toast.error(response.error || "Gagal memuat data pencairan");
      }
    } catch (error) {
      console.error('Error loading pencairan:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusMap = {
      PENDING: {
        label: "Pending",
        variant: "secondary" as const,
        icon: Clock,
        color: "text-yellow-600"
      },
      DICAIRKAN: {
        label: "Dicairkan",
        variant: "default" as const,
        icon: CheckCircle,
        color: "text-green-600"
      },
      DITOLAK: {
        label: "Ditolak",
        variant: "destructive" as const,
        icon: XCircle,
        color: "text-red-600"
      },
    };
    const info = statusMap[status as keyof typeof statusMap] || {
      label: status,
      variant: "default" as const,
      icon: Clock,
      color: ""
    };
    const Icon = info.icon;
    
    return (
      <Badge variant={info.variant} className="flex items-center gap-1 w-fit">
        <Icon className="w-3 h-3" />
        {info.label}
      </Badge>
    );
  };

  const getTerminLabel = (termin: string) => {
    return termin.replace('TERMIN_', 'Termin ');
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="w-5 h-5" />
            Pencairan Dana
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (pencairan.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="w-5 h-5" />
            Pencairan Dana
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
            <DollarSign className="w-12 h-12 mb-2 opacity-50" />
            <p className="text-sm">Belum ada pencairan dana</p>
            <p className="text-xs mt-1">Pencairan akan dibuat setelah kontrak ditandatangani</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <DollarSign className="w-5 h-5" />
          Pencairan Dana
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Summary */}
        <div className="grid grid-cols-2 gap-4 p-4 bg-muted/50 rounded-lg">
          <div>
            <p className="text-sm text-muted-foreground">Total Dicairkan</p>
            <p className="text-lg font-bold text-green-600">{formatCurrency(total.dicairkan)}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Pending</p>
            <p className="text-lg font-bold text-yellow-600">{formatCurrency(total.pending)}</p>
          </div>
        </div>

        {/* Pencairan List */}
        <div className="space-y-3">
          {pencairan.map((item) => (
            <div
              key={item.id}
              className="border rounded-lg p-4 space-y-3 hover:shadow-sm transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-semibold">{getTerminLabel(item.termin)}</h4>
                    <Badge variant="outline" className="text-xs">
                      {item.persentase}%
                    </Badge>
                  </div>
                  <p className="text-2xl font-bold text-primary">
                    {formatCurrency(Number(item.nominal))}
                  </p>
                </div>
                <div>
                  {getStatusBadge(item.status)}
                </div>
              </div>

              {item.tanggalPencairan && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="w-4 h-4" />
                  <span>Dicairkan: {formatDate(item.tanggalPencairan)}</span>
                </div>
              )}

              {item.keterangan && (
                <div className="text-sm text-muted-foreground">
                  <p className="font-medium mb-1">Keterangan:</p>
                  <p>{item.keterangan}</p>
                </div>
              )}

              {item.fileBukti && (
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.open(item.fileBukti!, '_blank')}
                    className="text-xs"
                  >
                    <Download className="w-3 h-3 mr-1" />
                    Lihat Bukti Transfer
                  </Button>
                </div>
              )}

              <div className="text-xs text-muted-foreground pt-2 border-t">
                Dibuat: {formatDate(item.createdAt)}
              </div>
            </div>
          ))}
        </div>

        {/* Info */}
        <div className="text-xs text-muted-foreground space-y-1 mt-4 p-3 bg-blue-50 border border-blue-200 rounded">
          <p className="font-medium text-blue-900">Informasi Pencairan:</p>
          <ul className="list-disc list-inside space-y-1 text-blue-800">
            <li>Termin 1 (50%): Dicairkan setelah kontrak ditandatangani</li>
            <li>Termin 2 (25%): Dicairkan setelah 2 monitoring diverifikasi</li>
            <li>Termin 3 (25%): Dicairkan setelah luaran diselesaikan</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
