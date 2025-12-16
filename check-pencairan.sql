-- Cek proposal yang bisa buat pencairan (status DITERIMA atau BERJALAN + punya kontrak)
SELECT 
    p.id,
    p.judul,
    p.status,
    k.id as kontrak_id,
    k.nomorKontrak,
    k.tanggalMulai,
    k.tanggalSelesai
FROM proposal p
LEFT JOIN kontrak k ON k.proposalId = p.id
WHERE p.status IN ('DITERIMA', 'BERJALAN')
ORDER BY p.createdAt DESC;

-- Cek pencairan yang sudah ada
SELECT 
    pd.*,
    p.judul
FROM pencairan_dana pd
JOIN proposal p ON p.id = pd.proposalId
ORDER BY pd.createdAt DESC;

-- Cek total per status
SELECT 
    status,
    COUNT(*) as jumlah
FROM proposal
GROUP BY status;
