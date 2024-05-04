/*
  Warnings:

  - You are about to drop the column `videolUrl` on the `Video` table. All the data in the column will be lost.
  - Added the required column `videoUrl` to the `Video` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `Video` DROP COLUMN `videolUrl`,
    ADD COLUMN `videoUrl` VARCHAR(191) NOT NULL;
