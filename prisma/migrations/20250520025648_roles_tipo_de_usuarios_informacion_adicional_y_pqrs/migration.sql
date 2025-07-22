/*
  Warnings:

  - You are about to drop the `Deporte` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Nutricionista` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Patrocinador` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `User` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `UserDeporte` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Nutricionista" DROP CONSTRAINT "Nutricionista_userId_fkey";

-- DropForeignKey
ALTER TABLE "Patrocinador" DROP CONSTRAINT "Patrocinador_userId_fkey";

-- DropForeignKey
ALTER TABLE "UserDeporte" DROP CONSTRAINT "UserDeporte_deporteId_fkey";

-- DropForeignKey
ALTER TABLE "UserDeporte" DROP CONSTRAINT "UserDeporte_userId_fkey";

-- DropTable
DROP TABLE "Deporte";

-- DropTable
DROP TABLE "Nutricionista";

-- DropTable
DROP TABLE "Patrocinador";

-- DropTable
DROP TABLE "User";

-- DropTable
DROP TABLE "UserDeporte";

-- DropEnum
DROP TYPE "UserType";

-- CreateTable
CREATE TABLE "usuario" (
    "id" SERIAL NOT NULL,
    "correo" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "apellido" TEXT NOT NULL,
    "avatar" TEXT,
    "password" TEXT NOT NULL,
    "rolId" INTEGER,
    "informacionId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "usuario_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "rol" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "rol_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "permiso" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "permiso_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "permiso_rol" (
    "id" SERIAL NOT NULL,
    "rolId" INTEGER NOT NULL,
    "permisoId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "permiso_rol_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "informacion" (
    "id" SERIAL NOT NULL,
    "bio" TEXT,
    "telefono" TEXT,
    "genero" TEXT,
    "fechaNacimiento" TIMESTAMP(3),
    "profesion" TEXT,
    "especialidad" TEXT,
    "experiencia" TEXT,
    "nombreComercial" TEXT,
    "razonSocial" TEXT,
    "nit" TEXT,
    "tipoUsuarioId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "informacion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tipo_usuario" (
    "id" SERIAL NOT NULL,
    "tipo" TEXT NOT NULL,
    "descripcion" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tipo_usuario_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "direccion" (
    "id" SERIAL NOT NULL,
    "direccion" TEXT NOT NULL,
    "ciudadId" INTEGER NOT NULL,
    "paisId" INTEGER NOT NULL,
    "barrioId" INTEGER NOT NULL,
    "referencia" TEXT,
    "informacionId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "direccion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ciudad" (
    "id" SERIAL NOT NULL,
    "ciudad" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ciudad_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pais" (
    "id" SERIAL NOT NULL,
    "pais" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pais_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "barrio" (
    "id" SERIAL NOT NULL,
    "barrio" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "barrio_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "red_social" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "informacionId" INTEGER NOT NULL,

    CONSTRAINT "red_social_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pqrs" (
    "id" SERIAL NOT NULL,
    "asunto" TEXT NOT NULL,
    "mensaje" TEXT NOT NULL,
    "imagenEvidencia" TEXT[],
    "usuarioId" INTEGER NOT NULL,
    "tipoId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pqrs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tipo_pqrs" (
    "id" SERIAL NOT NULL,
    "tipo" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tipo_pqrs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "deporte" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "deporte_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "usuario_deporte" (
    "id" SERIAL NOT NULL,
    "usuarioId" INTEGER NOT NULL,
    "deporteId" INTEGER NOT NULL,
    "experiencia" INTEGER NOT NULL,
    "nivel" "Nivel" NOT NULL DEFAULT 'PRINCIPIANTE',
    "frecuenciaSemanal" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "usuario_deporte_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tipo_perfil" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tipo_perfil_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "perfil" (
    "id" SERIAL NOT NULL,
    "usuarioId" INTEGER NOT NULL,
    "tipoPerfilId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "perfil_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "patrocinador" (
    "id" SERIAL NOT NULL,
    "perfilId" INTEGER NOT NULL,
    "nombreEmpresa" TEXT NOT NULL,
    "sitioWeb" TEXT,
    "descripcion" TEXT,
    "presupuestoMaximo" INTEGER,
    "sectorIndustria" TEXT,
    "anosFuncionamiento" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "patrocinador_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "patrocinador_deporte" (
    "id" SERIAL NOT NULL,
    "patrocinadorId" INTEGER NOT NULL,
    "deporteId" INTEGER NOT NULL,

    CONSTRAINT "patrocinador_deporte_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "nutricionista" (
    "id" SERIAL NOT NULL,
    "perfilId" INTEGER NOT NULL,
    "especialidad" TEXT,
    "anosExperiencia" INTEGER,
    "consultorios" JSONB,
    "educacion" TEXT,
    "certificaciones" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "nutricionista_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "usuario_correo_key" ON "usuario"("correo");

-- CreateIndex
CREATE UNIQUE INDEX "permiso_rol_rolId_permisoId_key" ON "permiso_rol"("rolId", "permisoId");

-- CreateIndex
CREATE UNIQUE INDEX "deporte_nombre_key" ON "deporte"("nombre");

-- CreateIndex
CREATE UNIQUE INDEX "usuario_deporte_usuarioId_deporteId_key" ON "usuario_deporte"("usuarioId", "deporteId");

-- CreateIndex
CREATE UNIQUE INDEX "tipo_perfil_nombre_key" ON "tipo_perfil"("nombre");

-- CreateIndex
CREATE UNIQUE INDEX "perfil_usuarioId_key" ON "perfil"("usuarioId");

-- CreateIndex
CREATE UNIQUE INDEX "patrocinador_perfilId_key" ON "patrocinador"("perfilId");

-- CreateIndex
CREATE UNIQUE INDEX "patrocinador_deporte_patrocinadorId_deporteId_key" ON "patrocinador_deporte"("patrocinadorId", "deporteId");

-- CreateIndex
CREATE UNIQUE INDEX "nutricionista_perfilId_key" ON "nutricionista"("perfilId");

-- AddForeignKey
ALTER TABLE "usuario" ADD CONSTRAINT "usuario_rolId_fkey" FOREIGN KEY ("rolId") REFERENCES "rol"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "usuario" ADD CONSTRAINT "usuario_informacionId_fkey" FOREIGN KEY ("informacionId") REFERENCES "informacion"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "permiso_rol" ADD CONSTRAINT "permiso_rol_rolId_fkey" FOREIGN KEY ("rolId") REFERENCES "rol"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "permiso_rol" ADD CONSTRAINT "permiso_rol_permisoId_fkey" FOREIGN KEY ("permisoId") REFERENCES "permiso"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "informacion" ADD CONSTRAINT "informacion_tipoUsuarioId_fkey" FOREIGN KEY ("tipoUsuarioId") REFERENCES "tipo_usuario"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "direccion" ADD CONSTRAINT "direccion_ciudadId_fkey" FOREIGN KEY ("ciudadId") REFERENCES "ciudad"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "direccion" ADD CONSTRAINT "direccion_paisId_fkey" FOREIGN KEY ("paisId") REFERENCES "pais"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "direccion" ADD CONSTRAINT "direccion_barrioId_fkey" FOREIGN KEY ("barrioId") REFERENCES "barrio"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "direccion" ADD CONSTRAINT "direccion_informacionId_fkey" FOREIGN KEY ("informacionId") REFERENCES "informacion"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "red_social" ADD CONSTRAINT "red_social_informacionId_fkey" FOREIGN KEY ("informacionId") REFERENCES "informacion"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pqrs" ADD CONSTRAINT "pqrs_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "usuario"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pqrs" ADD CONSTRAINT "pqrs_tipoId_fkey" FOREIGN KEY ("tipoId") REFERENCES "tipo_pqrs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "usuario_deporte" ADD CONSTRAINT "usuario_deporte_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "usuario"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "usuario_deporte" ADD CONSTRAINT "usuario_deporte_deporteId_fkey" FOREIGN KEY ("deporteId") REFERENCES "deporte"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "perfil" ADD CONSTRAINT "perfil_tipoPerfilId_fkey" FOREIGN KEY ("tipoPerfilId") REFERENCES "tipo_perfil"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "perfil" ADD CONSTRAINT "perfil_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "patrocinador" ADD CONSTRAINT "patrocinador_perfilId_fkey" FOREIGN KEY ("perfilId") REFERENCES "perfil"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "patrocinador_deporte" ADD CONSTRAINT "patrocinador_deporte_patrocinadorId_fkey" FOREIGN KEY ("patrocinadorId") REFERENCES "patrocinador"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "patrocinador_deporte" ADD CONSTRAINT "patrocinador_deporte_deporteId_fkey" FOREIGN KEY ("deporteId") REFERENCES "deporte"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "nutricionista" ADD CONSTRAINT "nutricionista_perfilId_fkey" FOREIGN KEY ("perfilId") REFERENCES "perfil"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
