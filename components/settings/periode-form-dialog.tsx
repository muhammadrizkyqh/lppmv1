"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { periodeApi, type Periode } from "@/lib/api-client"
import { toast } from "sonner"

interface PeriodeFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  periode?: Periode | null
  onSuccess: () => void
}

export function PeriodeFormDialog({
  open,
  onOpenChange,
  periode,
  onSuccess,
}: PeriodeFormDialogProps) {
  const currentYear = new Date().getFullYear()
  
  const [formData, setFormData] = useState({
    tahun: currentYear.toString(),
    nama: "",
    tanggalBuka: "",
    tanggalTutup: "",
    kuota: 0,
    status: "NONAKTIF" as "AKTIF" | "NONAKTIF",
  })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (periode) {
      setFormData({
        tahun: periode.tahun,
        nama: periode.nama,
        tanggalBuka: periode.tanggalBuka.split('T')[0], // Format to YYYY-MM-DD
        tanggalTutup: periode.tanggalTutup.split('T')[0],
        kuota: periode.kuota,
        status: periode.status as "AKTIF" | "NONAKTIF",
      })
    } else {
      setFormData({
        tahun: currentYear.toString(),
        nama: "",
        tanggalBuka: "",
        tanggalTutup: "",
        kuota: 0,
        status: "NONAKTIF",
      })
    }
  }, [periode, open, currentYear])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      if (periode) {
        await periodeApi.update(periode.id, formData)
        toast.success("Periode berhasil diupdate!")
      } else {
        await periodeApi.create(formData)
        toast.success("Periode berhasil ditambahkan!")
      }
      onSuccess()
      onOpenChange(false)
    } catch (error: any) {
      toast.error(error.message || "Terjadi kesalahan")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{periode ? "Edit Periode" : "Tambah Periode"}</DialogTitle>
            <DialogDescription>
              {periode ? "Update data periode penelitian" : "Tambah periode penelitian baru"}
            </DialogDescription>
            <p className="text-sm text-muted-foreground mt-2">* Wajib diisi</p>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="tahun" className="text-right">
                Tahun <span className="text-red-500">*</span>
              </Label>
              <Input
                id="tahun"
                value={formData.tahun}
                onChange={(e) => setFormData({ ...formData, tahun: e.target.value })}
                className="col-span-3"
                placeholder="2025"
                required
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="nama" className="text-right">
                Nama Periode <span className="text-red-500">*</span>
              </Label>
              <Input
                id="nama"
                value={formData.nama}
                onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
                className="col-span-3"
                placeholder="Periode 1 Tahun 2025"
                required
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="tanggalBuka" className="text-right">
                Tanggal Buka <span className="text-red-500">*</span>
              </Label>
              <Input
                id="tanggalBuka"
                type="date"
                value={formData.tanggalBuka}
                onChange={(e) => setFormData({ ...formData, tanggalBuka: e.target.value })}
                className="col-span-3"
                required
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="tanggalTutup" className="text-right">
                Tanggal Tutup <span className="text-red-500">*</span>
              </Label>
              <Input
                id="tanggalTutup"
                type="date"
                value={formData.tanggalTutup}
                onChange={(e) => setFormData({ ...formData, tanggalTutup: e.target.value })}
                className="col-span-3"
                required
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="kuota" className="text-right">
                Kuota
              </Label>
              <Input
                id="kuota"
                type="number"
                value={formData.kuota}
                onChange={(e) => setFormData({ ...formData, kuota: parseInt(e.target.value) || 0 })}
                className="col-span-3"
                placeholder="0"
                min="0"
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="status" className="text-right">
                Status
              </Label>
              <Select
                value={formData.status}
                onValueChange={(value: "AKTIF" | "NONAKTIF") => 
                  setFormData({ ...formData, status: value })
                }
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="AKTIF">Aktif</SelectItem>
                  <SelectItem value="NONAKTIF">Nonaktif</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Batal
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Menyimpan..." : periode ? "Update" : "Tambah"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
