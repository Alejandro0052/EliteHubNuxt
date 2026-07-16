/*
  Warnings:

  - You are about to drop the column `email` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `firstName` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `lastName` on the `User` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[correo]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `correo` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "UserType" AS ENUM ('USUARIO', 'PATROCINADOR', 'NUTRICIONISTA');

-- CreateEnum
CREATE TYPE "Nivel" AS ENUM ('PRINCIPIANTE', 'INTERMEDIO', 'AVANZADO', 'PROFESIONAL');

-- DropIndex
DROP INDEX "User_email_key";

-- AlterTable
ALTER TABLE "User" DROP COLUMN "email",
DROP COLUMN "firstName",
DROP COLUMN "lastName",
ADD COLUMN     "age" INTEGER,
ADD COLUMN     "apellidos" TEXT,
ADD COLUMN     "avatar" TEXT,
ADD COLUMN     "bio" TEXT,
ADD COLUMN     "ciudad" TEXT,
ADD COLUMN     "correo" TEXT NOT NULL,
ADD COLUMN     "facebook" TEXT,
ADD COLUMN     "genero" TEXT,
ADD COLUMN     "instagram" TEXT,
ADD COLUMN     "linkedin" TEXT,
ADD COLUMN     "nombres" TEXT,
ADD COLUMN     "pais" TEXT,
ADD COLUMN     "telefono" TEXT,
ADD COLUMN     "userType" "UserType" NOT NULL DEFAULT 'USUARIO',
ADD COLUMN     "x" TEXT;

-- CreateTable
CREATE TABLE "Deporte" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT,

    CONSTRAINT "Deporte_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserDeporte" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "deporteId" INTEGER NOT NULL,
    "experiencia" INTEGER NOT NULL,
    "nivel" "Nivel" NOT NULL DEFAULT 'PRINCIPIANTE',
    "frecuenciaSemanal" INTEGER NOT NULL,

    CONSTRAINT "UserDeporte_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Patrocinador" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "nombreEmpresa" TEXT NOT NULL,
    "sitioWeb" TEXT,
    "descripcion" TEXT,
    "presupuestoMaximo" BIGINT,
    "sectorIndustria" TEXT,
    "anosFuncionamiento" INTEGER,

    CONSTRAINT "Patrocinador_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Nutricionista" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "numeroColegiado" TEXT NOT NULL,
    "especialidad" TEXT,
    "anosExperiencia" INTEGER,
    "consultorios" JSONB,
    "educacion" TEXT,
    "certificaciones" JSONB,

    CONSTRAINT "Nutricionista_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Deporte_nombre_key" ON "Deporte"("nombre");

-- CreateIndex
CREATE UNIQUE INDEX "UserDeporte_userId_deporteId_key" ON "UserDeporte"("userId", "deporteId");

-- CreateIndex
CREATE UNIQUE INDEX "Patrocinador_userId_key" ON "Patrocinador"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Nutricionista_userId_key" ON "Nutricionista"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Nutricionista_numeroColegiado_key" ON "Nutricionista"("numeroColegiado");

-- CreateIndex
CREATE UNIQUE INDEX "User_correo_key" ON "User"("correo");

-- AddForeignKey
ALTER TABLE "UserDeporte" ADD CONSTRAINT "UserDeporte_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserDeporte" ADD CONSTRAINT "UserDeporte_deporteId_fkey" FOREIGN KEY ("deporteId") REFERENCES "Deporte"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Patrocinador" ADD CONSTRAINT "Patrocinador_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Nutricionista" ADD CONSTRAINT "Nutricionista_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
