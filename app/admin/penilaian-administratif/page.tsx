"use client";

import DashboardLayout from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Search,
  FileText,
  CheckCircle,
  XCircle,
  Eye,
  Download,
  ClipboardCheck,
  AlertCircle,
  ExternalLink,
} from "lucide-react";
import { toast } from "sonner";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { proposalApi, penilaianAdministratifApi, ProposalList } from "@/lib/api-client";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

interface ChecklistItem {
  key: string;
  label: string;
  checkField: string;
  catatanField: string;
}

const CHECKLIST_ITEMS: ChecklistItem[] = [
  { 
    key: "teknikPenulisan", 
    label: "Kesesuaian teknik penulisan dengan panduan", 
    checkField: "checkKesesuaianTeknikPenulisan",
    catatanField: "catatanKesesuaianTeknikPenulisan"
  },
  { 
    key: "kelengkapanKomponen", 
    label: "Kelengkapan komponen proposal", 
    checkField: "checkKelengkapanKomponen",
    catatanField: "catatanKelengkapanKomponen"
  },
];

export default function PenilaianAdministratifPage() {
  const router = useRouter();
  const [proposals, setProposals] = useState<ProposalList[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchValue, setSearchValue] = useState("");
  const [selectedProposal, setSelectedProposal] = useState<ProposalList | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [checklist, setChecklist] = useState<Record<string, boolean>>({});
  const [catatan, setCatatan] = useState<Record<string, string>>({});
  const [statusAdministrasi, setStatusAdministrasi] = useState<"LOLOS" | "TIDAK_LOLOS">("LOLOS");
  const [catatanAdministrasi, setCatatanAdministrasi] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchProposals();
  }, []);

  const fetchProposals = async () => {
    try {
      setLoading(true);
      const response = await proposalApi.list({ status: "DIAJUKAN" });
      if (response.success && response.data) {
        setProposals(response.data);
      }
    } catch (error) {
      toast.error("Gagal memuat data proposal");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = async (proposal: ProposalList) => {
    console.log("Selected proposal:", proposal);
    console.log("File path:", proposal.filePath);
    console.log("File name:", proposal.fileName);
    
    setSelectedProposal(proposal);
    setDialogOpen(true);
    
    // Load existing penilaian if any
    try {
      const response = await penilaianAdministratifApi.get(proposal.id);
      if (response.success && response.data) {
        const data = response.data;
        const checklistData: Record<string, boolean> = {};
        const catatanData: Record<string, string> = {};
        
        CHECKLIST_ITEMS.forEach(item => {
          checklistData[item.checkField] = (data as any)[item.checkField] || false;
          catatanData[item.catatanField] = (data as any)[item.catatanField] || "";
        });
        
        setChecklist(checklistData);
        setCatatan(catatanData);
        setStatusAdministrasi(data.statusAdministrasi as "LOLOS" | "TIDAK_LOLOS");
        setCatatanAdministrasi(data.catatanAdministrasi || "");
      } else {
        // Initialize empty
        const checklistData: Record<string, boolean> = {};
        const catatanData: Record<string, string> = {};
        CHECKLIST_ITEMS.forEach(item => {
          checklistData[item.checkField] = false;
          catatanData[item.catatanField] = "";
        });
        setChecklist(checklistData);
        setCatatan(catatanData);
        setStatusAdministrasi("LOLOS");
        setCatatanAdministrasi("");
      }
    } catch (error) {
      // Initialize empty on error
      const checklistData: Record<string, boolean> = {};
      const catatanData: Record<string, string> = {};
      CHECKLIST_ITEMS.forEach(item => {
        checklistData[item.checkField] = false;
        catatanData[item.catatanField] = "";
      });
      setChecklist(checklistData);
      setCatatan(catatanData);
      setStatusAdministrasi("LOLOS");
      setCatatanAdministrasi("");
    }
  };

  const handleCheckItem = (field: string, checked: boolean) => {
    setChecklist(prev => ({ ...prev, [field]: checked }));
  };

  const handleCatatanItem = (field: string, value: string) => {
    setCatatan(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    if (!selectedProposal) return;

    // Validasi: jika TIDAK_LOLOS, catatan wajib diisi
    if (statusAdministrasi === "TIDAK_LOLOS" && !catatanAdministrasi.trim()) {
      toast.error("Catatan wajib diisi untuk proposal yang tidak lolos");
      return;
    }

    try {
      setSubmitting(true);
      
      // Merge data
      const submitData = {
        statusAdministrasi,
        catatanAdministrasi: catatanAdministrasi.trim() || undefined,
        ...checklist,  // Spread checklist checkboxes
        ...catatan,    // Spread catatan fields
      };
      
      const response = await penilaianAdministratifApi.submit(selectedProposal.id, submitData);

      if (response.success) {
        toast.success(
          statusAdministrasi === "LOLOS" 
            ? "Proposal lolos penilaian administratif" 
            : "Proposal tidak lolos, perlu revisi"
        );
        setDialogOpen(false);
        fetchProposals();
      } else {
        toast.error(response.error || "Gagal menyimpan penilaian");
      }
    } catch (error) {
      toast.error("Terjadi kesalahan saat menyimpan penilaian");
    } finally {
      setSubmitting(false);
    }
  };

  const filteredProposals = proposals.filter(p => 
    p.judul?.toLowerCase().includes(searchValue.toLowerCase()) ||
    (p as any).dosen?.nama?.toLowerCase().includes(searchValue.toLowerCase()) ||
    p.skema?.nama?.toLowerCase().includes(searchValue.toLowerCase())
  );

  const checkedCount = Object.values(checklist).filter(Boolean).length;

  const stats = [
    { 
      label: "Menunggu Penilaian", 
      value: proposals.length, 
      icon: FileText,
      color: "text-blue-600"
    },
    { 
      label: "Komponen Wajib", 
      value: CHECKLIST_ITEMS.length, 
      icon: ClipboardCheck,
      color: "text-purple-600"
    },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-foreground">Penilaian Administratif</h1>
          <p className="text-muted-foreground mt-2">
            Periksa kelengkapan administratif proposal yang diajukan
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-2">
          {stats.map((stat, index) => (
            <Card key={index} className="border-0 shadow-sm">
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <stat.icon className={`w-5 h-5 ${stat.color}`} />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                    <p className="text-xl font-bold">{stat.value}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Search */}
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Cari proposal..."
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        {/* Proposals Table */}
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle>Proposal Status DIAJUKAN</CardTitle>
            <CardDescription>
              {filteredProposals.length} proposal menunggu penilaian administratif
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8 text-muted-foreground">Memuat data...</div>
            ) : filteredProposals.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                {searchValue ? "Tidak ada proposal yang ditemukan" : "Belum ada proposal yang diajukan"}
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Judul</TableHead>
                    <TableHead>Ketua</TableHead>
                    <TableHead>Skema</TableHead>
                    <TableHead>Tanggal Diajukan</TableHead>
                    <TableHead>Status Admin</TableHead>
                    <TableHead className="text-right">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredProposals.map((proposal) => (
                    <TableRow key={proposal.id}>
                      <TableCell className="font-medium max-w-md">
                        <div className="line-clamp-2">{proposal.judul}</div>
                      </TableCell>
                      <TableCell>{(proposal as any).dosen?.nama || "-"}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{proposal.skema?.nama}</Badge>
                      </TableCell>
                      <TableCell>
                        {new Date(proposal.createdAt).toLocaleDateString("id-ID")}
                      </TableCell>
                      <TableCell>
                        {(proposal as any).statusAdministrasi === "LOLOS" ? (
                          <Badge variant="outline" className="text-green-600 border-green-200">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Lolos
                          </Badge>
                        ) : (proposal as any).statusAdministrasi === "TIDAK_LOLOS" ? (
                          <Badge variant="outline" className="text-red-600 border-red-200">
                            <XCircle className="w-3 h-3 mr-1" />
                            Tidak Lolos
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-yellow-600 border-yellow-200">
                            <AlertCircle className="w-3 h-3 mr-1" />
                            Belum Dicek
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => router.push(`/admin/proposals/${proposal.id}`)}
                          >
                            <Eye className="w-4 h-4 mr-1" />
                            Lihat
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => handleOpenDialog(proposal)}
                          >
                            <ClipboardCheck className="w-4 h-4 mr-1" />
                            Periksa
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Penilaian Dialog with Split Screen PDF Viewer */}
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent 
            className="p-0 gap-0"
            style={{
              maxWidth: '96vw',
              width: '96vw',
              height: '94vh',
              maxHeight: '94vh',
            }}
          >
            <DialogHeader className="px-6 py-4 border-b bg-white shrink-0">
              <DialogTitle className="text-xl">Penilaian Administratif</DialogTitle>
              <DialogDescription>
                Periksa kelengkapan komponen administratif proposal
              </DialogDescription>
            </DialogHeader>

            {selectedProposal && (
              <div className="flex flex-1 overflow-hidden">
                {/* PDF Viewer - Left Side (70%) */}
                <div className="w-[70%] border-r overflow-hidden bg-gray-900 flex flex-col">
                  <div className="p-3 border-b bg-white flex items-center justify-between">
                    <div className="flex-1">
                      <p className="text-sm font-medium">File Proposal</p>
                      <p className="text-xs text-muted-foreground truncate">
                        {selectedProposal.fileName || "proposal.pdf"}
                      </p>
                    </div>
                    {selectedProposal.filePath && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => window.open(selectedProposal.filePath!, '_blank')}
                        className="ml-2"
                      >
                        <ExternalLink className="w-4 h-4 mr-1" />
                        Buka di Tab Baru
                      </Button>
                    )}
                  </div>
                  <div className="flex-1 overflow-auto">
                    {selectedProposal.filePath ? (
                      <div className="relative w-full h-full bg-gray-900">
                        <iframe
                          src={`${selectedProposal.filePath}#view=FitH&toolbar=1&navpanes=1&scrollbar=1`}
                          className="w-full h-full"
                          title="PDF Proposal"
                          onError={() => {
                            console.error("Failed to load PDF:", selectedProposal.filePath);
                          }}
                        />
                      </div>
                    ) : (
                      <div className="flex items-center justify-center h-full">
                        <div className="text-center">
                          <FileText className="w-12 h-12 mx-auto text-muted-foreground mb-2" />
                          <p className="text-sm text-muted-foreground">File proposal tidak tersedia</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Form - Right Side (30%) */}
                <div className="w-[30%] overflow-y-auto bg-gray-50">
                  <div className="p-5 space-y-4">
                    {/* Proposal Info */}
                    <Card className="bg-muted/50 border-0 shadow-none">
                      <CardContent className="p-4 space-y-2">
                        <div>
                          <p className="text-xs text-muted-foreground">Judul</p>
                          <p className="font-medium text-sm">{selectedProposal.judul}</p>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-xs text-muted-foreground">Ketua</p>
                            <p className="font-medium text-sm">{(selectedProposal as any).dosen?.nama}</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">Skema</p>
                            <p className="font-medium text-sm">{selectedProposal.skema?.nama}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Progress */}
                    <div className="flex items-center justify-between p-3 bg-primary/5 rounded-lg">
                      <div>
                        <p className="text-sm font-medium">Progress Pengecekan</p>
                        <p className="text-xs text-muted-foreground">
                          {checkedCount} dari {CHECKLIST_ITEMS.length} komponen sesuai
                        </p>
                      </div>
                      <div className="text-2xl font-bold text-primary">
                        {CHECKLIST_ITEMS.length > 0 ? Math.round((checkedCount / CHECKLIST_ITEMS.length) * 100) : 0}%
                      </div>
                    </div>

                    {/* 2 Komponen Checklist */}
                    <div className="space-y-4">
                      <Label className="font-semibold">Komponen Penilaian</Label>
                      {CHECKLIST_ITEMS.map((item, index) => (
                        <div key={item.key} className="space-y-2 p-4 rounded-lg border bg-card">
                          <div className="flex items-start space-x-3">
                            <Checkbox
                              id={item.checkField}
                              checked={checklist[item.checkField] || false}
                              onCheckedChange={(checked) => handleCheckItem(item.checkField, checked as boolean)}
                              className="mt-1"
                            />
                            <div className="flex-1">
                              <Label htmlFor={item.checkField} className="cursor-pointer font-medium">
                                {index + 1}. {item.label}
                              </Label>
                              {checklist[item.checkField] && (
                                <CheckCircle className="w-4 h-4 text-green-600 inline-block ml-2" />
                              )}
                            </div>
                          </div>
                          <Textarea
                            placeholder="Catatan untuk komponen ini (opsional)..."
                            value={catatan[item.catatanField] || ""}
                            onChange={(e) => handleCatatanItem(item.catatanField, e.target.value)}
                            className="text-sm min-h-[60px]"
                          />
                        </div>
                      ))}
                    </div>

                    {/* Status Administratif */}
                    <div className="space-y-3 pt-4 border-t">
                      <Label className="font-semibold">Hasil Penilaian Administratif</Label>
                      <RadioGroup 
                        value={statusAdministrasi} 
                        onValueChange={(value: string) => setStatusAdministrasi(value as "LOLOS" | "TIDAK_LOLOS")}
                      >
                        <div className="flex items-center space-x-2 p-3 rounded-lg border hover:bg-green-50 transition-colors">
                          <RadioGroupItem value="LOLOS" id="lolos" />
                          <Label htmlFor="lolos" className="flex-1 cursor-pointer">
                            <div className="flex items-center">
                              <CheckCircle className="w-4 h-4 mr-2 text-green-600" />
                              <span className="font-medium">LOLOS</span>
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">
                              Proposal siap untuk tahap selanjutnya
                            </p>
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2 p-3 rounded-lg border hover:bg-red-50 transition-colors">
                          <RadioGroupItem value="TIDAK_LOLOS" id="tidak-lolos" />
                          <Label htmlFor="tidak-lolos" className="flex-1 cursor-pointer">
                            <div className="flex items-center">
                              <XCircle className="w-4 h-4 mr-2 text-red-600" />
                              <span className="font-medium">TIDAK LOLOS</span>
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">
                              Proposal perlu revisi
                            </p>
                          </Label>
                        </div>
                      </RadioGroup>
                    </div>

                    {/* Catatan Global untuk TIDAK_LOLOS */}
                    {statusAdministrasi === "TIDAK_LOLOS" && (
                      <div className="space-y-2 pt-4 border-t">
                        <Label htmlFor="catatan-global" className="font-semibold text-red-600">
                          Catatan/Alasan <span className="text-red-500">*</span>
                        </Label>
                        <Textarea
                          id="catatan-global"
                          value={catatanAdministrasi}
                          onChange={(e) => setCatatanAdministrasi(e.target.value)}
                          placeholder="Jelaskan secara keseluruhan poin-poin yang perlu diperbaiki..."
                          className="min-h-[100px]"
                          required
                        />
                        <p className="text-xs text-muted-foreground">
                          Catatan ini akan dikirimkan kepada dosen untuk perbaikan proposal
                        </p>
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex justify-end gap-2 pt-4 border-t sticky bottom-0 bg-white pb-2">
                      <Button variant="outline" onClick={() => setDialogOpen(false)} disabled={submitting}>
                        Batal
                      </Button>
                      <Button onClick={handleSubmit} disabled={submitting}>
                        {submitting ? "Menyimpan..." : "Simpan Penilaian"}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
