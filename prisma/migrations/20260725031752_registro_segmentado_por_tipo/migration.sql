-- CreateEnum
CREATE TYPE "ModalidadAtencion" AS ENUM ('VIRTUAL', 'PRESENCIAL');

-- AlterTable
ALTER TABLE "Informacion" ADD COLUMN     "altura" DOUBLE PRECISION,
ADD COLUMN     "anoGraduacion" INTEGER,
ADD COLUMN     "anosExperiencia" INTEGER,
ADD COLUMN     "cargoContacto" TEXT,
ADD COLUMN     "certificadosAdicionales" TEXT,
ADD COLUMN     "ciudadResidencia" TEXT,
ADD COLUMN     "direccionContacto" TEXT,
ADD COLUMN     "lesiones" TEXT,
ADD COLUMN     "marcasPersonales" TEXT,
ADD COLUMN     "modalidadAtencion" "ModalidadAtencion",
ADD COLUMN     "nacionalidad" TEXT,
ADD COLUMN     "nombreContacto" TEXT,
ADD COLUMN     "objetivosActuales" TEXT,
ADD COLUMN     "pais" TEXT,
ADD COLUMN     "peso" DOUBLE PRECISION,
ADD COLUMN     "segundoApellido" TEXT,
ADD COLUMN     "segundoNombre" TEXT,
ADD COLUMN     "universidad" TEXT;

-- AlterTable
ALTER TABLE "UsuarioDeporte" ALTER COLUMN "frecuenciaSemanal" SET DEFAULT 0;
