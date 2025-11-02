/*
  Warnings:

  - You are about to drop the column `asigantura` on the `Ramo` table. All the data in the column will be lost.
  - Added the required column `asignatura` to the `Ramo` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Ramo" DROP COLUMN "asigantura",
ADD COLUMN     "asignatura" TEXT NOT NULL;
