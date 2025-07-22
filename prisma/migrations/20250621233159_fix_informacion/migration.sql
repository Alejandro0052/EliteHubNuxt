-- DropForeignKey
ALTER TABLE "Informacion" DROP CONSTRAINT "Informacion_tipoUsuarioId_fkey";

-- AlterTable
ALTER TABLE "Informacion" ALTER COLUMN "tipoUsuarioId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Informacion" ADD CONSTRAINT "Informacion_tipoUsuarioId_fkey" FOREIGN KEY ("tipoUsuarioId") REFERENCES "TipoUsuario"("id") ON DELETE SET NULL ON UPDATE CASCADE;
