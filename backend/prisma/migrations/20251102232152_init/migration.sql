/*
  Warnings:

  - Added the required column `codigo` to the `Proyeccion` table without a default value. This is not possible if the table is not empty.
  - Added the required column `nombre` to the `Proyeccion` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Proyeccion" ADD COLUMN     "codigo" TEXT NOT NULL,
ADD COLUMN     "nombre" TEXT NOT NULL;
