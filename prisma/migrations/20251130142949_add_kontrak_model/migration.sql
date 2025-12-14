-- CreateTable
CREATE TABLE `kontrak` (
    `id` VARCHAR(191) NOT NULL,
    `proposalId` VARCHAR(191) NOT NULL,
    `nomorKontrak` VARCHAR(191) NOT NULL,
    `nomorSK` VARCHAR(191) NOT NULL,
    `tanggalKontrak` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `fileKontrak` VARCHAR(191) NULL,
    `fileSK` VARCHAR(191) NULL,
    `status` VARCHAR(191) NOT NULL DEFAULT 'DRAFT',
    `createdBy` VARCHAR(191) NOT NULL,
    `uploadedBy` VARCHAR(191) NULL,
    `uploadedAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `kontrak_proposalId_key`(`proposalId`),
    UNIQUE INDEX `kontrak_nomorKontrak_key`(`nomorKontrak`),
    UNIQUE INDEX `kontrak_nomorSK_key`(`nomorSK`),
    INDEX `kontrak_proposalId_idx`(`proposalId`),
    INDEX `kontrak_status_idx`(`status`),
    INDEX `kontrak_createdBy_idx`(`createdBy`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `kontrak` ADD CONSTRAINT `kontrak_proposalId_fkey` FOREIGN KEY (`proposalId`) REFERENCES `Proposal`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `kontrak` ADD CONSTRAINT `kontrak_createdBy_fkey` FOREIGN KEY (`createdBy`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `kontrak` ADD CONSTRAINT `kontrak_uploadedBy_fkey` FOREIGN KEY (`uploadedBy`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
