"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, MapPin, Presentation, Upload, Download, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import { useState, useEffect } from "react";
import { seminarApi, SeminarList } from "@/lib/api-client";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface SeminarSectionProps {
  proposalId: string;
  isAdmin?: boolean;
}

export default function SeminarSection({ proposalId, isAdmin = false }: SeminarSectionProps) {
  const [seminars, setSeminars] = useState<SeminarList[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState<string | null>(null);

  useEffect(() => {
    fetchSeminars();
  }, [proposalId]);

  const fetchSeminars = async () => {
    try {
      setLoading(true);
      const response = await seminarApi.list({ proposalId });
      if (response.success && response.data) {
        setSeminars(response.data);
      }
    } catch (error) {
      console.error("Failed to fetch seminars:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (seminarId: string, field: "materiPresentasi" | "notulensi" | "daftarHadir" | "dokumentasi", file: File) => {
    try {
      setUploading(seminarId);
      
      const formData = new FormData();
      formData.append("file", file);
      formData.append("field", field);

      const response = await fetch(`/api/seminar/${seminarId}/upload`, {
        method: "POST",
        body: formData,
      });

      const result = await response.json();

      if (result.success) {
        toast.success("File berhasil diupload");
        fetchSeminars();
      } else {
        toast.error(result.error || "Gagal upload file");
      }
    } catch (error) {
      toast.error("Terjadi kesalahan saat upload file");
    } finally {
      setUploading(null);
    }
  };

  const getJenisLabel = (jenis: string) => {
    const labels = {
      PROPOSAL: { text: "Seminar Proposal", color: "bg-blue-600" },
      INTERNAL: { text: "Seminar Internal", color: "bg-purple-600" },
      PUBLIK: { text: "Seminar Publik", color: "bg-green-600" },
    };
    return labels[jenis as keyof typeof labels] || labels.PROPOSAL;
  };

  const getStatusBadge = (status: string) => {
    const config = {
      SCHEDULED: { label: "Terjadwal", className: "text-blue-600 border-blue-200" },
      SELESAI: { label: "Selesai", className: "text-green-600 border-green-200" },
      DIBATALKAN: { label: "Dibatalkan", className: "text-red-600 border-red-200" },
    };
    const cfg = config[status as keyof typeof config] || config.SCHEDULED;
    return (
      <Badge variant="outline" className={cfg.className}>
        {cfg.label}
      </Badge>
    );
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Presentation className="w-5 h-5" />
            Jadwal Seminar
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground text-center py-4">Memuat data...</p>
        </CardContent>
      </Card>
    );
  }

  if (seminars.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Presentation className="w-5 h-5" />
            Jadwal Seminar
          </CardTitle>
          <CardDescription>Informasi jadwal seminar proposal</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground text-center py-4">
            Belum ada seminar yang dijadwalkan
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {seminars.map((seminar) => {
        const jenisInfo = getJenisLabel(seminar.jenis);
        
        return (
          <Card key={seminar.id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="flex items-center gap-2">
                    <Presentation className="w-5 h-5" />
                    {jenisInfo.text}
                  </CardTitle>
                  <CardDescription className="mt-2">
                    Informasi dan dokumen terkait seminar
                  </CardDescription>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <Badge className={`${jenisInfo.color} text-white`}>
                    {jenisInfo.text}
                  </Badge>
                  {getStatusBadge(seminar.status)}
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Informasi Seminar */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-muted/50 rounded-lg">
                <div className="flex items-start gap-3">
                  <Calendar className="w-5 h-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">Tanggal</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(seminar.tanggal).toLocaleDateString("id-ID", {
                        weekday: "long",
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Clock className="w-5 h-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">Waktu</p>
                    <p className="text-sm text-muted-foreground">{seminar.waktu} WIB</p>
                  </div>
                </div>

                {seminar.tempat && (
                  <div className="flex items-start gap-3">
                    <MapPin className="w-5 h-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-sm font-medium">Tempat</p>
                      <p className="text-sm text-muted-foreground">{seminar.tempat}</p>
                    </div>
                  </div>
                )}

                {seminar.linkOnline && (
                  <div className="flex items-start gap-3">
                    <ExternalLink className="w-5 h-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-sm font-medium">Link Online</p>
                      <a
                        href={seminar.linkOnline}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-blue-600 hover:underline"
                      >
                        Buka Link
                      </a>
                    </div>
                  </div>
                )}
              </div>

              {seminar.keterangan && (
                <div className="p-4 bg-blue-50 rounded-lg">
                  <p className="text-sm font-medium mb-1">Keterangan</p>
                  <p className="text-sm text-muted-foreground">{seminar.keterangan}</p>
                </div>
              )}

              {/* Upload & Download Dokumen */}
              <div className="space-y-3">
                <h4 className="font-medium">Dokumen Seminar</h4>
                
                {/* Materi Presentasi */}
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex-1">
                    <p className="text-sm font-medium">Materi Presentasi</p>
                    <p className="text-xs text-muted-foreground">
                      {seminar.fileMateri ? "File tersedia" : "Belum diupload"}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    {seminar.fileMateri ? (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => window.open(seminar.fileMateri!, "_blank")}
                      >
                        <Download className="w-4 h-4 mr-1" />
                        Download
                      </Button>
                    ) : null}
                    {!isAdmin && seminar.status === "SCHEDULED" && (
                      <div>
                        <input
                          type="file"
                          accept=".pdf,.ppt,.pptx"
                          id={`materi-${seminar.id}`}
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleFileUpload(seminar.id, "materiPresentasi", file);
                          }}
                          disabled={uploading === seminar.id}
                        />
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => document.getElementById(`materi-${seminar.id}`)?.click()}
                          disabled={uploading === seminar.id}
                        >
                          <Upload className="w-4 h-4 mr-1" />
                          {uploading === seminar.id ? "Uploading..." : "Upload"}
                        </Button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Notulensi (Admin only after SELESAI) */}
                {isAdmin && seminar.status === "SELESAI" && (
                  <>
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex-1">
                        <p className="text-sm font-medium">Notulensi</p>
                        <p className="text-xs text-muted-foreground">
                          {seminar.fileNotulensi ? "File tersedia" : "Belum diupload"}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        {seminar.fileNotulensi && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => window.open(seminar.fileNotulensi!, "_blank")}
                          >
                            <Download className="w-4 h-4 mr-1" />
                            Download
                          </Button>
                        )}
                        <div>
                          <input
                            type="file"
                            accept=".pdf"
                            id={`notulensi-${seminar.id}`}
                            className="hidden"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) handleFileUpload(seminar.id, "notulensi", file);
                            }}
                            disabled={uploading === seminar.id}
                          />
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => document.getElementById(`notulensi-${seminar.id}`)?.click()}
                            disabled={uploading === seminar.id}
                          >
                            <Upload className="w-4 h-4 mr-1" />
                            {uploading === seminar.id ? "Uploading..." : "Upload"}
                          </Button>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex-1">
                        <p className="text-sm font-medium">Daftar Hadir</p>
                        <p className="text-xs text-muted-foreground">
                          {seminar.fileUndangan ? "File tersedia" : "Belum diupload"}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        {seminar.fileUndangan && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => window.open(seminar.fileUndangan!, "_blank")}
                          >
                            <Download className="w-4 h-4 mr-1" />
                            Download
                          </Button>
                        )}
                        <div>
                          <input
                            type="file"
                            accept=".pdf"
                            id={`daftar-hadir-${seminar.id}`}
                            className="hidden"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) handleFileUpload(seminar.id, "daftarHadir", file);
                            }}
                            disabled={uploading === seminar.id}
                          />
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => document.getElementById(`daftar-hadir-${seminar.id}`)?.click()}
                            disabled={uploading === seminar.id}
                          >
                            <Upload className="w-4 h-4 mr-1" />
                            {uploading === seminar.id ? "Uploading..." : "Upload"}
                          </Button>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex-1">
                        <p className="text-sm font-medium">Dokumentasi</p>
                        <p className="text-xs text-muted-foreground">
                          {seminar.fileDokumentasi ? "File tersedia" : "Belum diupload"}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        {seminar.fileDokumentasi && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => window.open(seminar.fileDokumentasi!, "_blank")}
                          >
                            <Download className="w-4 h-4 mr-1" />
                            Download
                          </Button>
                        )}
                        <div>
                          <input
                            type="file"
                            accept="image/*,.pdf"
                            id={`dokumentasi-${seminar.id}`}
                            className="hidden"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) handleFileUpload(seminar.id, "dokumentasi", file);
                            }}
                            disabled={uploading === seminar.id}
                          />
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => document.getElementById(`dokumentasi-${seminar.id}`)?.click()}
                            disabled={uploading === seminar.id}
                          >
                            <Upload className="w-4 h-4 mr-1" />
                            {uploading === seminar.id ? "Uploading..." : "Upload"}
                          </Button>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
