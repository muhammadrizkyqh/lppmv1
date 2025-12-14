-- Check proposal dengan status DIREVIEW
SELECT 
    p.id,
    p.judul,
    p.status,
    p.revisiCount,
    p.nilaiTotal,
    p.catatanRevisi,
    p.updatedAt
FROM Proposal p
WHERE p.status = 'DIREVIEW'
ORDER BY p.updatedAt DESC;

-- Check ProposalReviewer assignments untuk proposal DIREVIEW
SELECT 
    pr.id,
    pr.proposalId,
    pr.reviewerId,
    pr.status as assignmentStatus,
    p.judul,
    p.status as proposalStatus,
    r.nama as reviewerNama,
    pr.deadline
FROM ProposalReviewer pr
JOIN Proposal p ON pr.proposalId = p.id
JOIN Reviewer r ON pr.reviewerId = r.id
WHERE p.status = 'DIREVIEW'
ORDER BY pr.deadline ASC;

-- Check reviews yang sudah disubmit untuk proposal DIREVIEW
SELECT 
    rv.id,
    rv.proposalReviewerId,
    rv.nilaiTotal,
    rv.rekomendasi,
    rv.submittedAt,
    p.judul,
    p.status as proposalStatus
FROM Review rv
JOIN ProposalReviewer pr ON rv.proposalReviewerId = pr.id
JOIN Proposal p ON pr.proposalId = p.id
WHERE p.status = 'DIREVIEW';
