"use client";

import DashboardLayout from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  field: string;
}

const CHECKLIST_ITEMS: ChecklistItem[] = [
  { key: "judul", label: "Judul Penelitian", field: "checkJudul" },
  { key: "abstrak", label: "Abstrak", field: "checkAbstrak" },
  { key: "pendahuluan", label: "Bab I: Pendahuluan", field: "checkPendahuluan" },
  { key: "tinjauan", label: "Bab II: Tinjauan Pustaka", field: "checkTinjauanPustaka" },
  { key: "metode", label: "Bab III: Metode Penelitian", field: "checkMetode" },
  { key: "biaya", label: "Rencana Anggaran Biaya", field: "checkBiaya" },
  { key: "jadwal", label: "Jadwal Kegiatan", field: "checkJadwal" },
  { key: "daftarPustaka", label: "Daftar Pustaka", field: "checkDaftarPustaka" },
  { key: "cv", label: "CV Peneliti", field: "checkCV" },
  { key: "biodata", label: "Biodata Peneliti", field: "checkBiodata" },
  { key: "suratPernyataan", label: "Surat Pernyataan", field: "checkSuratPernyataan" },
  { key: "suratTugas", label: "Surat Tugas (jika ada)", field: "checkSuratTugas" },
  { key: "dokumenPendukung", label: "Dokumen Pendukung Lainnya", field: "checkDokumenPendukung" },
  { key: "lampiran", label: "Lampiran-lampiran", field: "checkLampiran" },
];

export default function PenilaianAdministratifPage() {
  const router = useRouter();
  const [proposals, setProposals] = useState<ProposalList[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchValue, setSearchValue] = useState("");
  const [selectedProposal, setSelectedProposal] = useState<ProposalList | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [checklist, setChecklist] = useState<Record<string, boolean>>({});
  const [statusAdministrasi, setStatusAdministrasi] = useState<"LOLOS" | "TIDAK_LOLOS">("LOLOS");
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
    setSelectedProposal(proposal);
    setDialogOpen(true);
    
    // Load existing penilaian if any
    try {
      const response = await penilaianAdministratifApi.get(proposal.id);
      if (response.success && response.data) {
        const data = response.data;
        const checklistData: Record<string, boolean> = {};
        CHECKLIST_ITEMS.forEach(item => {
          checklistData[item.field] = (data as any)[item.field] || false;
        });
        setChecklist(checklistData);
        setStatusAdministrasi(data.statusAdministrasi as "LOLOS" | "TIDAK_LOLOS");
      } else {
        // Initialize empty checklist
        const checklistData: Record<string, boolean> = {};
        CHECKLIST_ITEMS.forEach(item => {
          checklistData[item.field] = false;
        });
        setChecklist(checklistData);
        setStatusAdministrasi("LOLOS");
      }
    } catch (error) {
      // Initialize empty checklist on error
      const checklistData: Record<string, boolean> = {};
      CHECKLIST_ITEMS.forEach(item => {
        checklistData[item.field] = false;
      });
      setChecklist(checklistData);
      setStatusAdministrasi("LOLOS");
    }
  };

  const handleCheckAll = (checked: boolean) => {
    const newChecklist: Record<string, boolean> = {};
    CHECKLIST_ITEMS.forEach(item => {
      newChecklist[item.field] = checked;
    });
    setChecklist(newChecklist);
  };

  const handleCheckItem = (field: string, checked: boolean) => {
    setChecklist(prev => ({ ...prev, [field]: checked }));
  };

  const handleSubmit = async () => {
    if (!selectedProposal) return;

    try {
      setSubmitting(true);
      
      // Merge statusAdministrasi with checklist
      const submitData = {
        statusAdministrasi,
        ...checklist,  // Spread checklist fields directly
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
  const allChecked = checkedCount === CHECKLIST_ITEMS.length;

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

        {/* Penilaian Dialog */}
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Penilaian Administratif</DialogTitle>
              <DialogDescription>
                Periksa kelengkapan 14 komponen administratif proposal
              </DialogDescription>
            </DialogHeader>

            {selectedProposal && (
              <div className="space-y-4">
                {/* Proposal Info */}
                <Card className="bg-muted/50">
                  <CardContent className="p-4 space-y-2">
                    <div>
                      <p className="text-sm text-muted-foreground">Judul</p>
                      <p className="font-medium">{selectedProposal.judul}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Ketua</p>
                        <p className="font-medium">{(selectedProposal as any).dosen?.nama}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Skema</p>
                        <p className="font-medium">{selectedProposal.skema?.nama}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Checklist Progress */}
                <div className="flex items-center justify-between p-3 bg-primary/5 rounded-lg">
                  <div>
                    <p className="text-sm font-medium">Progress Pengecekan</p>
                    <p className="text-xs text-muted-foreground">
                      {checkedCount} dari {CHECKLIST_ITEMS.length} komponen lengkap
                    </p>
                  </div>
                  <div className="text-2xl font-bold text-primary">
                    {Math.round((checkedCount / CHECKLIST_ITEMS.length) * 100)}%
                  </div>
                </div>

                {/* Check All */}
                <div className="flex items-center space-x-2 p-3 bg-muted/30 rounded-lg">
                  <Checkbox
                    id="checkAll"
                    checked={allChecked}
                    onCheckedChange={handleCheckAll}
                  />
                  <Label htmlFor="checkAll" className="font-medium cursor-pointer">
                    Centang Semua Komponen
                  </Label>
                </div>

                {/* Checklist Items */}
                <div className="space-y-2">
                  {CHECKLIST_ITEMS.map((item, index) => (
                    <div
                      key={item.key}
                      className="flex items-center space-x-3 p-3 rounded-lg border hover:bg-muted/50 transition-colors"
                    >
                      <Checkbox
                        id={item.field}
                        checked={checklist[item.field] || false}
                        onCheckedChange={(checked) => handleCheckItem(item.field, checked as boolean)}
                      />
                      <Label htmlFor={item.field} className="flex-1 cursor-pointer">
                        <span className="font-medium">
                          {index + 1}. {item.label}
                        </span>
                      </Label>
                      {checklist[item.field] && (
                        <CheckCircle className="w-4 h-4 text-green-600" />
                      )}
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
                          Proposal siap untuk seminar proposal
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
                          Proposal perlu revisi (status akan berubah menjadi REVISI)
                        </p>
                      </Label>
                    </div>
                  </RadioGroup>
                </div>
              </div>
            )}

            <DialogFooter>
              <Button variant="outline" onClick={() => setDialogOpen(false)} disabled={submitting}>
                Batal
              </Button>
              <Button onClick={handleSubmit} disabled={submitting}>
                {submitting ? "Menyimpan..." : "Simpan Penilaian"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
