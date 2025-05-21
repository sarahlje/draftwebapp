/*
  Warnings:

  - You are about to drop the column `difficulty` on the `Exercise` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Exercise" DROP COLUMN "difficulty",
ADD COLUMN     "excludeFromStrength" BOOLEAN NOT NULL DEFAULT false;

-- DropEnum
DROP TYPE "Experience";
