/*
  Warnings:

  - You are about to drop the `Nutricionista` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Patrocinador` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `PatrocinadorDeporte` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Perfil` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `TipoPerfil` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Nutricionista" DROP CONSTRAINT "Nutricionista_perfilId_fkey";

-- DropForeignKey
ALTER TABLE "Patrocinador" DROP CONSTRAINT "Patrocinador_perfilId_fkey";

-- DropForeignKey
ALTER TABLE "PatrocinadorDeporte" DROP CONSTRAINT "PatrocinadorDeporte_deporteId_fkey";

-- DropForeignKey
ALTER TABLE "PatrocinadorDeporte" DROP CONSTRAINT "PatrocinadorDeporte_patrocinadorId_fkey";

-- DropForeignKey
ALTER TABLE "Perfil" DROP CONSTRAINT "Perfil_tipoPerfilId_fkey";

-- DropForeignKey
ALTER TABLE "Perfil" DROP CONSTRAINT "Perfil_usuarioId_fkey";

-- DropForeignKey
ALTER TABLE "Usuario" DROP CONSTRAINT "Usuario_informacionId_fkey";

-- AlterTable
ALTER TABLE "Informacion" ADD COLUMN     "anosFuncionamiento" INTEGER,
ADD COLUMN     "consultorios" TEXT[],
ADD COLUMN     "presupuestoMaximo" INTEGER,
ADD COLUMN     "sitioWeb" TEXT;

-- DropTable
DROP TABLE "Nutricionista";

-- DropTable
DROP TABLE "Patrocinador";

-- DropTable
DROP TABLE "PatrocinadorDeporte";

-- DropTable
DROP TABLE "Perfil";

-- DropTable
DROP TABLE "TipoPerfil";

-- AddForeignKey
ALTER TABLE "Usuario" ADD CONSTRAINT "Usuario_informacionId_fkey" FOREIGN KEY ("informacionId") REFERENCES "Informacion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
