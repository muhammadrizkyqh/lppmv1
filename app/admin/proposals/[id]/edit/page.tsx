"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save, Upload, FileText, Loader2, X } from "lucide-react";
import DashboardLayout from "@/components/layout/dashboard-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  useProposalById,
  usePeriode,
  useSkema,
  useBidangKeahlian,
} from "@/hooks/use-data";
import { proposalApi, uploadApi } from "@/lib/api-client";
import { toast } from "sonner";

interface FormData {
  periodeId: string;
  skemaId: string;
  bidangKeahlianId: string;
  judul: string;
  abstrak: string;
}

export default function EditProposalPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const { data: proposal, loading: loadingProposal } = useProposalById(id);
  const { data: periodeList = [] } = usePeriode();
  const { data: skemaList = [] } = useSkema();
  const { data: bidangKeahlianList = [] } = useBidangKeahlian();

  const [formData, setFormData] = useState<FormData>({
    periodeId: "",
    skemaId: "",
    bidangKeahlianId: "",
    judul: "",
    abstrak: "",
  });

  const [file, setFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<{
    name: string;
    size: number;
  } | null>(null);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Load proposal data
  useEffect(() => {
    if (proposal) {
      // Check if can edit (only DRAFT)
      if (proposal.status !== "DRAFT") {
        toast.error("Hanya proposal dengan status DRAFT yang dapat diedit");
        router.push(`/admin/proposals/${id}`);
        return;
      }

      setFormData({
        periodeId: proposal.periodeId || "",
        skemaId: proposal.skemaId || "",
        bidangKeahlianId: proposal.bidangKeahlianId || "",
        judul: proposal.judul || "",
        abstrak: proposal.abstrak || "",
      });

      if (proposal.fileName && proposal.fileSize) {
        setFilePreview({
          name: proposal.fileName,
          size: proposal.fileSize,
        });
      }
    }
  }, [proposal, id, router]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    // Validate file type
    if (selectedFile.type !== "application/pdf") {
      toast.error("File harus berformat PDF");
      return;
    }

    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024;
    if (selectedFile.size > maxSize) {
      toast.error("Ukuran file maksimal 10MB");
      return;
    }

    setFile(selectedFile);
    setFilePreview({
      name: selectedFile.name,
      size: selectedFile.size,
    });
  };

  const handleRemoveFile = () => {
    setFile(null);
    setFilePreview(null);
  };

  const validateForm = (): boolean => {
    if (!formData.periodeId) {
      toast.error("Pilih periode terlebih dahulu");
      return false;
    }
    if (!formData.skemaId) {
      toast.error("Pilih skema penelitian terlebih dahulu");
      return false;
    }
    if (!formData.judul.trim()) {
      toast.error("Judul penelitian tidak boleh kosong");
      return false;
    }
    if (formData.judul.length > 500) {
      toast.error("Judul penelitian maksimal 500 karakter");
      return false;
    }
    if (!formData.abstrak.trim()) {
      toast.error("Abstrak tidak boleh kosong");
      return false;
    }
    if (formData.abstrak.length > 500) {
      toast.error("Abstrak maksimal 500 karakter");
      return false;
    }
    return true;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    setSubmitting(true);
    try {
      let uploadedFilePath = proposal?.filePath;
      let uploadedFileName = proposal?.fileName;
      let uploadedFileSize = proposal?.fileSize;

      // Upload new file if selected
      if (file) {
        setUploading(true);
        const uploadResult = await uploadApi.uploadFile(file, "proposal");
        uploadedFilePath = uploadResult.filePath;
        uploadedFileName = uploadResult.fileName;
        uploadedFileSize = uploadResult.fileSize;
        setUploading(false);
      }

      // Update proposal
      await proposalApi.update(id, {
        ...formData,
        filePath: uploadedFilePath || undefined,
        fileName: uploadedFileName || undefined,
        fileSize: uploadedFileSize || undefined,
      });

      toast.success("Proposal berhasil diupdate");
      router.push(`/admin/proposals/${id}`);
    } catch (error: any) {
      toast.error(error.message || "Gagal mengupdate proposal");
      setSubmitting(false);
      setUploading(false);
    }
  };

  if (loadingProposal) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Memuat data proposal...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (!proposal) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <p className="text-muted-foreground mb-4">Proposal tidak ditemukan</p>
            <Button asChild>
              <Link href="/admin/proposals">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Kembali
              </Link>
            </Button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="outline" size="sm" asChild>
              <Link href={`/admin/proposals/${id}`}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Kembali
              </Link>
            </Button>
            <div>
              <h1 className="text-2xl font-bold">Edit Proposal</h1>
              <p className="text-muted-foreground">
                Ubah informasi proposal penelitian
              </p>
            </div>
          </div>
          <Button onClick={handleSave} disabled={submitting || uploading}>
            {submitting || uploading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                {uploading ? "Mengupload..." : "Menyimpan..."}
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Simpan Perubahan
              </>
            )}
          </Button>
        </div>

        {/* Form */}
        <Card>
          <CardHeader>
            <CardTitle>Informasi Proposal</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Periode & Skema */}
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="periode">
                  Periode <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={formData.periodeId}
                  onValueChange={(value) =>
                    setFormData({ ...formData, periodeId: value })
                  }
                >
                  <SelectTrigger id="periode">
                    <SelectValue placeholder="Pilih periode..." />
                  </SelectTrigger>
                  <SelectContent>
                    {periodeList
                      ?.filter((p) => p.status === "AKTIF")
                      .map((periode) => (
                        <SelectItem key={periode.id} value={periode.id}>
                          {periode.nama} ({periode.tahun})
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="skema">
                  Skema Penelitian <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={formData.skemaId}
                  onValueChange={(value) =>
                    setFormData({ ...formData, skemaId: value })
                  }
                >
                  <SelectTrigger id="skema">
                    <SelectValue placeholder="Pilih skema..." />
                  </SelectTrigger>
                  <SelectContent>
                    {skemaList?.map((skema) => (
                      <SelectItem key={skema.id} value={skema.id}>
                        {skema.nama}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Bidang Keahlian */}
            <div className="space-y-2">
              <Label htmlFor="bidang">Bidang Keahlian</Label>
              <Select
                value={formData.bidangKeahlianId}
                onValueChange={(value) =>
                  setFormData({ ...formData, bidangKeahlianId: value })
                }
              >
                <SelectTrigger id="bidang">
                  <SelectValue placeholder="Pilih bidang keahlian..." />
                </SelectTrigger>
                <SelectContent>
                  {bidangKeahlianList?.map((bidang) => (
                    <SelectItem key={bidang.id} value={bidang.id}>
                      {bidang.nama}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Judul */}
            <div className="space-y-2">
              <Label htmlFor="judul">
                Judul Penelitian <span className="text-red-500">*</span>
              </Label>
              <Input
                id="judul"
                placeholder="Masukkan judul penelitian..."
                value={formData.judul}
                onChange={(e) =>
                  setFormData({ ...formData, judul: e.target.value })
                }
                maxLength={500}
              />
              <p className="text-xs text-muted-foreground text-right">
                {formData.judul.length}/500 karakter
              </p>
            </div>

            {/* Abstrak */}
            <div className="space-y-2">
              <Label htmlFor="abstrak">
                Abstrak <span className="text-red-500">*</span>
              </Label>
              <Textarea
                id="abstrak"
                placeholder="Masukkan abstrak penelitian..."
                value={formData.abstrak}
                onChange={(e) =>
                  setFormData({ ...formData, abstrak: e.target.value })
                }
                rows={6}
                maxLength={500}
              />
              <p className="text-xs text-muted-foreground text-right">
                {formData.abstrak.length}/500 karakter
              </p>
            </div>

            {/* File Upload */}
            <div className="space-y-2">
              <Label htmlFor="file">
                File Proposal (PDF, Max 10MB){" "}
                {!filePreview && <span className="text-red-500">*</span>}
              </Label>
              {filePreview ? (
                <div className="flex items-center gap-3 p-4 border rounded-lg bg-muted/50">
                  <FileText className="w-8 h-8 text-red-500" />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{filePreview.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {(filePreview.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleRemoveFile}
                    className="text-red-600 hover:text-red-700"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ) : (
                <div className="flex items-center gap-4">
                  <Input
                    id="file"
                    type="file"
                    accept="application/pdf"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <Button
                    variant="outline"
                    onClick={() => document.getElementById("file")?.click()}
                    className="w-full"
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    Pilih File PDF
                  </Button>
                </div>
              )}
              {!filePreview && (
                <p className="text-xs text-amber-600">
                  ⚠️ File proposal belum diupload. Anda dapat mengupload file baru
                  atau tetap menggunakan file lama.
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
