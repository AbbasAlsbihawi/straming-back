/*
  Warnings:

  - Added the required column `videolUrl` to the `Video` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `Video` ADD COLUMN `videolUrl` VARCHAR(191) NOT NULL;
