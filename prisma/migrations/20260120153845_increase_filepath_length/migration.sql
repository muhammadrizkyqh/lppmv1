-- AlterTable
ALTER TABLE `proposal` MODIFY `filePath` VARCHAR(500) NULL,
    MODIFY `fileName` VARCHAR(255) NULL;

-- AlterTable
ALTER TABLE `proposalrevision` MODIFY `filePath` VARCHAR(500) NOT NULL,
    MODIFY `fileName` VARCHAR(255) NOT NULL;
