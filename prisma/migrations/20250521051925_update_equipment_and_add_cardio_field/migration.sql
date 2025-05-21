/*
  Warnings:

  - The values [any,machine] on the enum `Equipment` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `experience` on the `Workout` table. All the data in the column will be lost.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "Equipment_new" AS ENUM ('bodyweight', 'treadmill', 'dumbbells', 'kettlebells', 'barbell', 'bench', 'cable_machines', 'pull_up_bar', 'all');
ALTER TABLE "Workout" ALTER COLUMN "equipment" TYPE "Equipment_new"[] USING ("equipment"::text::"Equipment_new"[]);
ALTER TYPE "Equipment" RENAME TO "Equipment_old";
ALTER TYPE "Equipment_new" RENAME TO "Equipment";
DROP TYPE "Equipment_old";
COMMIT;

-- AlterTable
ALTER TABLE "Exercise" ADD COLUMN     "excludeFromCardio" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "Workout" DROP COLUMN "experience",
ADD COLUMN     "style" TEXT;
