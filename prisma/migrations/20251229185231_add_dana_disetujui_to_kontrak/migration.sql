/*
  Warnings:

  - Added the required column `danaDisetujui` to the `kontrak` table without a default value. This is not possible if the table is not empty.

*/

-- Step 1: Add column as nullable first
ALTER TABLE `kontrak` ADD COLUMN `danaDisetujui` DECIMAL(15, 2) NULL;

-- Step 2: Update existing rows with value from proposal.danaDisetujui
UPDATE `kontrak` k
INNER JOIN `proposal` p ON k.proposalId = p.id
SET k.danaDisetujui = COALESCE(p.danaDisetujui, 0);

-- Step 3: Make column NOT NULL
ALTER TABLE `kontrak` MODIFY COLUMN `danaDisetujui` DECIMAL(15, 2) NOT NULL;
