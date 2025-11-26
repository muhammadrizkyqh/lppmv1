-- Reset semua monitoring yang sudah SELESAI kembali ke kondisi awal
-- Jalankan script ini di MySQL atau phpMyAdmin

-- Reset monitoring table
UPDATE Monitoring 
SET 
  laporanAkhir = NULL,
  fileAkhir = NULL,
  verifikasiKemajuanStatus = NULL,
  verifikasiKemajuanAt = NULL,
  catatanKemajuan = NULL,
  verifikasiAkhirStatus = NULL,
  verifikasiAkhirAt = NULL,
  catatanAkhir = NULL,
  status = 'BERJALAN'
WHERE status = 'SELESAI';

-- Reset proposal status yang SELESAI kembali ke BERJALAN
UPDATE Proposal 
SET status = 'BERJALAN' 
WHERE status = 'SELESAI' 
AND id IN (SELECT proposalId FROM Monitoring);

-- Lihat hasil
SELECT 
  p.judul,
  p.status as proposal_status,
  m.persentaseKemajuan,
  m.status as monitoring_status,
  m.laporanKemajuan IS NOT NULL as has_kemajuan,
  m.laporanAkhir IS NOT NULL as has_akhir
FROM Proposal p
LEFT JOIN Monitoring m ON p.id = m.proposalId
WHERE p.status = 'BERJALAN';
