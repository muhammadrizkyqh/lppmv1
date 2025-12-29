-- Check for duplicate pencairan records
SELECT 
    p.judul AS proposal_title,
    pd.termin,
    pd.status,
    pd.nominal,
    pd.tanggalPencairan,
    pd.keterangan,
    pd.createdAt,
    COUNT(*) OVER (PARTITION BY pd.proposalId, pd.termin) as duplicate_count
FROM pencairan_dana pd
INNER JOIN proposal p ON pd.proposalId = p.id
WHERE p.judul = 'Test'
ORDER BY pd.termin, pd.createdAt;

-- Find all proposals with duplicate termin
SELECT 
    proposalId,
    termin,
    COUNT(*) as count
FROM pencairan_dana
GROUP BY proposalId, termin
HAVING COUNT(*) > 1;
