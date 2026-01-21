"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  FileText,
  Upload,
  Users,
  Calendar,
  DollarSign,
  AlertCircle,
  Check,
  X,
  Plus,
  Clock,
  AlertTriangle,
  Save,
} from "lucide-react";
import { toast } from "sonner";
import { usePeriode, useSkema, useBidangKeahlian } from "@/hooks/use-data";
import { proposalApi, uploadApi } from "@/lib/api-client";
import { validateFileSize, validateFileType, formatFileSize, FILE_SIZE_LIMITS, compressPDFIfNeeded, getCompressionRecommendation } from "@/lib/file-utils";
import { 
  isPeriodeOpen, 
  getRemainingDays, 
  getPeriodeStatusBadge,
  formatPeriodeDateRange 
} from "@/lib/proposal-validation";

export default function CreateProposalPage() {
  const router = useRouter();
  
  // Fetch master data from backend
  const { data: periode } = usePeriode();
  const { data: skema } = useSkema();
  const { data: bidangKeahlian } = useBidangKeahlian();

  // Form state
  const [formData, setFormData] = useState({
    periodeId: "",
    skemaId: "",
    bidangKeahlianId: "",
    judul: "",
    abstrak: ""
  });
  
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Get selected periode details
  const selectedPeriode = useMemo(() => {
    return periode?.find(p => p.id === formData.periodeId);
  }, [periode, formData.periodeId]);

  // Check periode status
  const periodeCheck = useMemo(() => {
    if (!selectedPeriode) return null;
    return {
      ...isPeriodeOpen(selectedPeriode),
      remainingDays: getRemainingDays(selectedPeriode),
      badge: getPeriodeStatusBadge(selectedPeriode),
      dateRange: formatPeriodeDateRange(selectedPeriode),
    };
  }, [selectedPeriode]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    // Validate file type
    const typeValidation = validateFileType(selectedFile, 'application/pdf');
    if (!typeValidation.valid) {
      toast.error(typeValidation.error!);
      e.target.value = '';
      return;
    }

    // Validate file size
    const sizeValidation = validateFileSize(selectedFile);
    if (!sizeValidation.valid) {
      toast.error(sizeValidation.error!);
      e.target.value = '';
      return;
    }

    // Check if compression is recommended
    const recommendation = getCompressionRecommendation(selectedFile.size);
    if (recommendation) {
      toast.warning(recommendation, { duration: 5000 });
    }

    // Try to analyze and provide compression guidance
    const compressionResult = await compressPDFIfNeeded(selectedFile);
    if (compressionResult.message) {
      toast.info(compressionResult.message, { duration: 6000 });
    }

    console.log("✅ File selected:", selectedFile.name, formatFileSize(selectedFile.size));
    setFile(compressionResult.file);
    toast.success("File berhasil dipilih");
  };

  const validateForm = () => {
    if (!formData.periodeId) {
      toast.error("Pilih periode terlebih dahulu");
      return false;
    }
    
    // Check periode status
    if (selectedPeriode && periodeCheck && !periodeCheck.isOpen) {
      toast.error(periodeCheck.message || "Periode tidak aktif");
      return false;
    }
    
    if (!formData.skemaId) {
      toast.error("Pilih skema penelitian");
      return false;
    }
    if (!formData.bidangKeahlianId) {
      toast.error("Pilih bidang keahlian");
      return false;
    }
    if (!formData.judul.trim()) {
      toast.error("Judul tidak boleh kosong");
      return false;
    }
    if (formData.judul.length > 500) {
      toast.error("Judul maksimal 500 karakter");
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

  const handleSaveDraft = async () => {
    if (!validateForm()) return;

    setSaving(true);
    try {
      let fileData: any = {};

      // Upload file first if exists
      if (file) {
        const uploadResult = await uploadApi.uploadFile(file, formData.periodeId);
        if (!uploadResult.success) {
          toast.error("Gagal upload file");
          return;
        }
        fileData = {
          filePath: uploadResult.data.filePath,
          fileName: uploadResult.data.fileName,
          fileSize: uploadResult.data.fileSize
        };
      }

      // Create proposal with file info
      const result = await proposalApi.create({
        periodeId: formData.periodeId,
        skemaId: formData.skemaId,
        bidangKeahlianId: formData.bidangKeahlianId,
        judul: formData.judul,
        abstrak: formData.abstrak,
        ...fileData
      });

      if (result.success && result.data) {
        toast.success("Draft proposal berhasil disimpan!");
        // Redirect to detail page to add members and submit
        router.push(`/dosen/proposals/${result.data.id}`);
      } else {
        toast.error(result.error || "Gagal menyimpan draft");
      }
    } catch (error: any) {
      toast.error(error.message || "Gagal menyimpan draft");
    } finally {
      setSaving(false);
    }
  };

  // Submit will be done from detail page after adding members

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Ajukan Proposal Baru</h1>
            <p className="text-muted-foreground mt-2">
              Lengkapi form untuk mengajukan proposal penelitian atau PKM
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Button 
              onClick={handleSaveDraft}
              disabled={saving || !!(periodeCheck && !periodeCheck.isOpen)}
            >
              <Save className="w-4 h-4 mr-2" />
              {saving ? "Menyimpan..." : "Simpan Draft"}
            </Button>
          </div>
        </div>

        {/* Periode Warning */}
        {selectedPeriode && periodeCheck && !periodeCheck.isOpen && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              {periodeCheck.message}
            </AlertDescription>
          </Alert>
        )}

        {selectedPeriode && periodeCheck && periodeCheck.isOpen && periodeCheck.remainingDays <= 7 && (
          <Alert className="border-amber-200 bg-amber-50">
            <Clock className="h-4 w-4 text-amber-600" />
            <AlertDescription className="text-amber-800">
              <strong>Perhatian:</strong> Periode akan ditutup dalam {periodeCheck.remainingDays} hari 
              ({periodeCheck.dateRange}). Segera lengkapi dan submit proposal Anda.
            </AlertDescription>
          </Alert>
        )}

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Information */}
            <Card className="border-0 shadow-sm">
              <CardHeader className="pb-4">
                <div className="flex items-center space-x-2">
                  <FileText className="w-5 h-5 text-primary" />
                  <CardTitle>Informasi Dasar</CardTitle>
                </div>
                <CardDescription>
                  Pilih periode dan skema penelitian yang sesuai
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="periode">Periode Penelitian *</Label>
                    <Select value={formData.periodeId} onValueChange={(value) => handleInputChange('periodeId', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih periode" />
                      </SelectTrigger>
                      <SelectContent>
                        {periode?.map((p) => (
                          <SelectItem key={p.id} value={p.id} disabled={p.status !== "AKTIF"}>
                            <div className="flex items-center justify-between w-full">
                              <span>{p.nama}</span>
                              {p.status === "AKTIF" && (
                                <Badge variant="outline" className="ml-2 text-green-600 border-green-200">
                                  Aktif
                                </Badge>
                              )}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="skema">Skema Penelitian *</Label>
                    <Select value={formData.skemaId} onValueChange={(value) => handleInputChange('skemaId', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih skema" />
                      </SelectTrigger>
                      <SelectContent>
                        {skema?.map((s) => (
                          <SelectItem key={s.id} value={s.id}>
                            {s.nama}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="judul">Judul Penelitian *</Label>
                  <Input
                    id="judul"
                    placeholder="Masukkan judul penelitian yang jelas dan spesifik"
                    className="text-base"
                    value={formData.judul}
                    onChange={(e) => handleInputChange('judul', e.target.value)}
                  />
                  <p className="text-sm text-muted-foreground">
                    {formData.judul.length}/500 karakter
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bidang">Bidang Keahlian *</Label>
                  <Select value={formData.bidangKeahlianId} onValueChange={(value) => handleInputChange('bidangKeahlianId', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih bidang keahlian" />
                    </SelectTrigger>
                    <SelectContent>
                      {bidangKeahlian?.map((b) => (
                        <SelectItem key={b.id} value={b.id}>
                          {b.nama}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="abstrak">Abstrak *</Label>
                  <Textarea
                    id="abstrak"
                    rows={6}
                    placeholder="Tuliskan abstrak penelitian dengan ringkas dan jelas (maksimal 500 karakter)"
                    className="resize-none"
                    value={formData.abstrak}
                    onChange={(e) => handleInputChange('abstrak', e.target.value)}
                  />
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>Jelaskan latar belakang, tujuan, metode, dan manfaat penelitian</span>
                    <span>{formData.abstrak.length}/500</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* File Upload */}
            <Card className="border-0 shadow-sm">
              <CardHeader className="pb-4">
                <div className="flex items-center space-x-2">
                  <Upload className="w-5 h-5 text-primary" />
                  <CardTitle>Upload Dokumen</CardTitle>
                </div>
                <CardDescription>
                  Upload file proposal dalam format PDF (maksimal 10MB)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="border-2 border-dashed border-border rounded-lg p-6 text-center hover:border-primary/50 transition-colors">
                  <Upload className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                  <div className="space-y-2">
                    <p className="text-sm font-medium">
                      {file ? file.name : "Drag & drop file atau klik untuk browse"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                    Hanya file PDF, maksimal 10MB (opsional, dapat diupload nanti)
                    </p>
                    {file && (
                      <p className="text-xs text-green-600">
                        Ukuran: {(file.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    )}
                  </div>
                  <input
                    type="file"
                    accept=".pdf,application/pdf"
                    onChange={handleFileChange}
                    className="hidden"
                    id="file-upload"
                  />
                  <Button 
                    variant="outline" 
                    className="mt-4"
                    onClick={() => document.getElementById('file-upload')?.click()}
                  >
                    {file ? "Ganti File" : "Pilih File"}
                  </Button>
                </div>

                <div className="mt-4 p-3 border border-blue-200 bg-blue-50 rounded-lg">
                  <div className="flex items-start space-x-2">
                    <AlertCircle className="w-4 h-4 text-blue-600 mt-0.5" />
                    <div className="text-sm text-blue-800">
                      <p className="font-medium">Informasi Upload File:</p>
                      <ul className="mt-1 space-y-1 text-xs">
                        <li>• File dapat diupload sekarang atau nanti di halaman detail</li>
                        <li>• File WAJIB ada sebelum submit proposal</li>
                        <li>• Format PDF, maksimal {formatFileSize(FILE_SIZE_LIMITS.MAX_SIZE)} (rekomendasi: {formatFileSize(FILE_SIZE_LIMITS.RECOMMENDED_SIZE)})</li>
                        <li>• Jika file besar, kompres di: <a href="https://www.ilovepdf.com/compress_pdf" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline font-medium">iLovePDF ↗</a> atau <a href="https://smallpdf.com/compress-pdf" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline font-medium">Smallpdf ↗</a></li>
                      </ul>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Team Members - Will be added after proposal creation */}
            <Card className="border-0 shadow-sm bg-muted/50">
              <CardContent className="p-6">
                <div className="flex items-center space-x-3 text-muted-foreground">
                  <Users className="w-5 h-5" />
                  <div>
                    <p className="text-sm font-medium">Anggota Tim & Submit Proposal</p>
                    <p className="text-xs">Setelah menyimpan draft, Anda dapat menambahkan anggota tim dan submit proposal di halaman detail</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Status Card */}
            <Card className="border-0 shadow-sm bg-gradient-to-br from-primary/5 to-primary/10">
              <CardContent className="p-6">
                <div className="text-center space-y-3">
                  <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center mx-auto">
                    <FileText className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold text-primary">Draft Proposal</p>
                    <p className="text-sm text-muted-foreground">
                      Lengkapi semua field untuk submit
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Guidelines */}
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle className="text-base">Panduan Pengajuan</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-start space-x-2">
                    <div className="w-2 h-2 rounded-full bg-primary mt-2"></div>
                    <div className="text-sm">
                      <p className="font-medium">Pilih Periode Aktif</p>
                      <p className="text-muted-foreground text-xs">
                        Hanya periode yang berstatus aktif yang dapat dipilih
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-2">
                    <div className="w-2 h-2 rounded-full bg-primary mt-2"></div>
                    <div className="text-sm">
                      <p className="font-medium">Judul Spesifik</p>
                      <p className="text-muted-foreground text-xs">
                        Gunakan judul yang jelas dan mencerminkan isi penelitian
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-2">
                    <div className="w-2 h-2 rounded-full bg-primary mt-2"></div>
                    <div className="text-sm">
                      <p className="font-medium">Abstrak Ringkas</p>
                      <p className="text-muted-foreground text-xs">
                        Maksimal 500 karakter, jelaskan inti penelitian
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-2">
                    <div className="w-2 h-2 rounded-full bg-primary mt-2"></div>
                    <div className="text-sm">
                      <p className="font-medium">Tim Maksimal 4 Orang</p>
                      <p className="text-muted-foreground text-xs">
                        Termasuk ketua penelitian
                      </p>
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="space-y-2">
                  <p className="text-sm font-medium">Kontak Bantuan</p>
                  <p className="text-xs text-muted-foreground">
                    Email: lppm@staiali.ac.id<br />
                    WhatsApp: +62 812-3456-7890
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Timeline */}
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <div className="flex items-center space-x-2">
                  <Calendar className="w-4 h-4 text-primary" />
                  <CardTitle className="text-base">Timeline</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Deadline Submit:</span>
                    <span className="font-medium">15 Mar 2025</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Periode Review:</span>
                    <span className="font-medium">16-30 Mar 2025</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Pengumuman:</span>
                    <span className="font-medium">5 Apr 2025</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}