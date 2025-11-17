-- DropForeignKey
ALTER TABLE `proposal_reviewer` DROP FOREIGN KEY `proposal_reviewer_reviewerId_fkey`;

-- DropForeignKey
ALTER TABLE `review` DROP FOREIGN KEY `review_reviewerId_fkey`;

-- AddForeignKey
ALTER TABLE `proposal_reviewer` ADD CONSTRAINT `proposal_reviewer_reviewerId_fkey` FOREIGN KEY (`reviewerId`) REFERENCES `Reviewer`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `review` ADD CONSTRAINT `review_reviewerId_fkey` FOREIGN KEY (`reviewerId`) REFERENCES `Reviewer`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
