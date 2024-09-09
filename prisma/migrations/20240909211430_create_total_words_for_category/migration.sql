/*
  Warnings:

  - Added the required column `total_words` to the `word_category` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `word_category` ADD COLUMN `total_words` INTEGER NOT NULL;
