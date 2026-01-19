"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { skemaApi, type Skema } from "@/lib/api-client"
import { toast } from "sonner"

interface SkemaFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  skema?: Skema | null
  onSuccess: () => void
}

export function SkemaFormDialog({
  open,
  onOpenChange,
  skema,
  onSuccess,
}: SkemaFormDialogProps) {
  const [formData, setFormData] = useState({
    nama: "",
    tipe: "DASAR" as "DASAR" | "TERAPAN" | "PENGEMBANGAN" | "MANDIRI",
    deskripsi: "",
    status: "AKTIF" as "AKTIF" | "NONAKTIF",
  })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (skema) {
      setFormData({
        nama: skema.nama,
        tipe: skema.tipe,
        deskripsi: skema.deskripsi || "",
        status: skema.status as "AKTIF" | "NONAKTIF",
      })
    } else {
      setFormData({
        nama: "",
        tipe: "DASAR",
        deskripsi: "",
        status: "AKTIF",
      })
    }
  }, [skema, open])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const data = {
        nama: formData.nama,
        tipe: formData.tipe,
        deskripsi: formData.deskripsi || undefined,
        status: formData.status,
      }

      if (skema) {
        await skemaApi.update(skema.id, data)
        toast.success("Skema berhasil diupdate!")
      } else {
        await skemaApi.create(data)
        toast.success("Skema berhasil ditambahkan!")
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
            <DialogTitle>{skema ? "Edit Skema" : "Tambah Skema"}</DialogTitle>
            <DialogDescription>
              {skema ? "Update data skema penelitian" : "Tambah skema penelitian baru"}
            </DialogDescription>
            <p className="text-sm text-muted-foreground mt-2">* Wajib diisi</p>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="nama" className="text-right">
                Nama Skema <span className="text-red-500">*</span>
              </Label>
              <Input
                id="nama"
                value={formData.nama}
                onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
                className="col-span-3"
                placeholder="Penelitian Dasar"
                required
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="tipe" className="text-right">
                Tipe <span className="text-red-500">*</span>
              </Label>
              <Select
                value={formData.tipe}
                onValueChange={(value: "DASAR" | "TERAPAN" | "PENGEMBANGAN" | "MANDIRI") => 
                  setFormData({ ...formData, tipe: value })
                }
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="DASAR">Dasar</SelectItem>
                  <SelectItem value="TERAPAN">Terapan</SelectItem>
                  <SelectItem value="PENGEMBANGAN">Pengembangan</SelectItem>
                  <SelectItem value="MANDIRI">Mandiri</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="deskripsi" className="text-right">
                Deskripsi
              </Label>
              <Textarea
                id="deskripsi"
                value={formData.deskripsi}
                onChange={(e) => setFormData({ ...formData, deskripsi: e.target.value })}
                className="col-span-3"
                placeholder="Deskripsi skema penelitian"
                rows={3}
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
              {loading ? "Menyimpan..." : skema ? "Update" : "Tambah"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
