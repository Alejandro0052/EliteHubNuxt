/*
  Warnings:

  - You are about to drop the `barrio` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ciudad` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `deporte` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `direccion` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `informacion` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `nutricionista` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `pais` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `patrocinador` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `patrocinador_deporte` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `perfil` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `permiso` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `permiso_rol` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `pqrs` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `red_social` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `rol` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `tipo_perfil` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `tipo_pqrs` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `tipo_usuario` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `usuario` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `usuario_deporte` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "direccion" DROP CONSTRAINT "direccion_barrioId_fkey";

-- DropForeignKey
ALTER TABLE "direccion" DROP CONSTRAINT "direccion_ciudadId_fkey";

-- DropForeignKey
ALTER TABLE "direccion" DROP CONSTRAINT "direccion_informacionId_fkey";

-- DropForeignKey
ALTER TABLE "direccion" DROP CONSTRAINT "direccion_paisId_fkey";

-- DropForeignKey
ALTER TABLE "informacion" DROP CONSTRAINT "informacion_tipoUsuarioId_fkey";

-- DropForeignKey
ALTER TABLE "nutricionista" DROP CONSTRAINT "nutricionista_perfilId_fkey";

-- DropForeignKey
ALTER TABLE "patrocinador" DROP CONSTRAINT "patrocinador_perfilId_fkey";

-- DropForeignKey
ALTER TABLE "patrocinador_deporte" DROP CONSTRAINT "patrocinador_deporte_deporteId_fkey";

-- DropForeignKey
ALTER TABLE "patrocinador_deporte" DROP CONSTRAINT "patrocinador_deporte_patrocinadorId_fkey";

-- DropForeignKey
ALTER TABLE "perfil" DROP CONSTRAINT "perfil_tipoPerfilId_fkey";

-- DropForeignKey
ALTER TABLE "perfil" DROP CONSTRAINT "perfil_usuarioId_fkey";

-- DropForeignKey
ALTER TABLE "permiso_rol" DROP CONSTRAINT "permiso_rol_permisoId_fkey";

-- DropForeignKey
ALTER TABLE "permiso_rol" DROP CONSTRAINT "permiso_rol_rolId_fkey";

-- DropForeignKey
ALTER TABLE "pqrs" DROP CONSTRAINT "pqrs_tipoId_fkey";

-- DropForeignKey
ALTER TABLE "pqrs" DROP CONSTRAINT "pqrs_usuarioId_fkey";

-- DropForeignKey
ALTER TABLE "red_social" DROP CONSTRAINT "red_social_informacionId_fkey";

-- DropForeignKey
ALTER TABLE "usuario" DROP CONSTRAINT "usuario_informacionId_fkey";

-- DropForeignKey
ALTER TABLE "usuario" DROP CONSTRAINT "usuario_rolId_fkey";

-- DropForeignKey
ALTER TABLE "usuario_deporte" DROP CONSTRAINT "usuario_deporte_deporteId_fkey";

-- DropForeignKey
ALTER TABLE "usuario_deporte" DROP CONSTRAINT "usuario_deporte_usuarioId_fkey";

-- DropTable
DROP TABLE "barrio";

-- DropTable
DROP TABLE "ciudad";

-- DropTable
DROP TABLE "deporte";

-- DropTable
DROP TABLE "direccion";

-- DropTable
DROP TABLE "informacion";

-- DropTable
DROP TABLE "nutricionista";

-- DropTable
DROP TABLE "pais";

-- DropTable
DROP TABLE "patrocinador";

-- DropTable
DROP TABLE "patrocinador_deporte";

-- DropTable
DROP TABLE "perfil";

-- DropTable
DROP TABLE "permiso";

-- DropTable
DROP TABLE "permiso_rol";

-- DropTable
DROP TABLE "pqrs";

-- DropTable
DROP TABLE "red_social";

-- DropTable
DROP TABLE "rol";

-- DropTable
DROP TABLE "tipo_perfil";

-- DropTable
DROP TABLE "tipo_pqrs";

-- DropTable
DROP TABLE "tipo_usuario";

-- DropTable
DROP TABLE "usuario";

-- DropTable
DROP TABLE "usuario_deporte";

-- CreateTable
CREATE TABLE "Usuario" (
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

    CONSTRAINT "Usuario_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Rol" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Rol_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Permiso" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Permiso_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PermisoRol" (
    "id" SERIAL NOT NULL,
    "rolId" INTEGER NOT NULL,
    "permisoId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PermisoRol_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Informacion" (
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

    CONSTRAINT "Informacion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TipoUsuario" (
    "id" SERIAL NOT NULL,
    "tipo" TEXT NOT NULL,
    "descripcion" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TipoUsuario_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Direccion" (
    "id" SERIAL NOT NULL,
    "direccion" TEXT NOT NULL,
    "ciudadId" INTEGER NOT NULL,
    "paisId" INTEGER NOT NULL,
    "barrioId" INTEGER NOT NULL,
    "referencia" TEXT,
    "informacionId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Direccion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Pais" (
    "id" SERIAL NOT NULL,
    "pais" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Pais_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Ciudad" (
    "id" SERIAL NOT NULL,
    "ciudad" TEXT NOT NULL,
    "paisId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Ciudad_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Barrio" (
    "id" SERIAL NOT NULL,
    "barrio" TEXT NOT NULL,
    "ciudadId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Barrio_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RedSocial" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "informacionId" INTEGER NOT NULL,

    CONSTRAINT "RedSocial_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PQRS" (
    "id" SERIAL NOT NULL,
    "asunto" TEXT NOT NULL,
    "mensaje" TEXT NOT NULL,
    "imagenEvidencia" TEXT[],
    "usuarioId" INTEGER NOT NULL,
    "tipoId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PQRS_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TipoPQRS" (
    "id" SERIAL NOT NULL,
    "tipo" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TipoPQRS_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Deporte" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Deporte_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UsuarioDeporte" (
    "id" SERIAL NOT NULL,
    "usuarioId" INTEGER NOT NULL,
    "deporteId" INTEGER NOT NULL,
    "experiencia" INTEGER NOT NULL,
    "nivel" "Nivel" NOT NULL DEFAULT 'PRINCIPIANTE',
    "frecuenciaSemanal" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UsuarioDeporte_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TipoPerfil" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TipoPerfil_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Perfil" (
    "id" SERIAL NOT NULL,
    "usuarioId" INTEGER NOT NULL,
    "tipoPerfilId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Perfil_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Patrocinador" (
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

    CONSTRAINT "Patrocinador_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PatrocinadorDeporte" (
    "id" SERIAL NOT NULL,
    "patrocinadorId" INTEGER NOT NULL,
    "deporteId" INTEGER NOT NULL,

    CONSTRAINT "PatrocinadorDeporte_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Nutricionista" (
    "id" SERIAL NOT NULL,
    "perfilId" INTEGER NOT NULL,
    "especialidad" TEXT,
    "anosExperiencia" INTEGER,
    "consultorios" JSONB,
    "educacion" TEXT,
    "certificaciones" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Nutricionista_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Usuario_correo_key" ON "Usuario"("correo");

-- CreateIndex
CREATE UNIQUE INDEX "PermisoRol_rolId_permisoId_key" ON "PermisoRol"("rolId", "permisoId");

-- CreateIndex
CREATE UNIQUE INDEX "Deporte_nombre_key" ON "Deporte"("nombre");

-- CreateIndex
CREATE UNIQUE INDEX "UsuarioDeporte_usuarioId_deporteId_key" ON "UsuarioDeporte"("usuarioId", "deporteId");

-- CreateIndex
CREATE UNIQUE INDEX "TipoPerfil_nombre_key" ON "TipoPerfil"("nombre");

-- CreateIndex
CREATE UNIQUE INDEX "Perfil_usuarioId_key" ON "Perfil"("usuarioId");

-- CreateIndex
CREATE UNIQUE INDEX "Patrocinador_perfilId_key" ON "Patrocinador"("perfilId");

-- CreateIndex
CREATE UNIQUE INDEX "PatrocinadorDeporte_patrocinadorId_deporteId_key" ON "PatrocinadorDeporte"("patrocinadorId", "deporteId");

-- CreateIndex
CREATE UNIQUE INDEX "Nutricionista_perfilId_key" ON "Nutricionista"("perfilId");

-- AddForeignKey
ALTER TABLE "Usuario" ADD CONSTRAINT "Usuario_rolId_fkey" FOREIGN KEY ("rolId") REFERENCES "Rol"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Usuario" ADD CONSTRAINT "Usuario_informacionId_fkey" FOREIGN KEY ("informacionId") REFERENCES "Informacion"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PermisoRol" ADD CONSTRAINT "PermisoRol_rolId_fkey" FOREIGN KEY ("rolId") REFERENCES "Rol"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PermisoRol" ADD CONSTRAINT "PermisoRol_permisoId_fkey" FOREIGN KEY ("permisoId") REFERENCES "Permiso"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Informacion" ADD CONSTRAINT "Informacion_tipoUsuarioId_fkey" FOREIGN KEY ("tipoUsuarioId") REFERENCES "TipoUsuario"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Direccion" ADD CONSTRAINT "Direccion_ciudadId_fkey" FOREIGN KEY ("ciudadId") REFERENCES "Ciudad"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Direccion" ADD CONSTRAINT "Direccion_paisId_fkey" FOREIGN KEY ("paisId") REFERENCES "Pais"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Direccion" ADD CONSTRAINT "Direccion_barrioId_fkey" FOREIGN KEY ("barrioId") REFERENCES "Barrio"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Direccion" ADD CONSTRAINT "Direccion_informacionId_fkey" FOREIGN KEY ("informacionId") REFERENCES "Informacion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Ciudad" ADD CONSTRAINT "Ciudad_paisId_fkey" FOREIGN KEY ("paisId") REFERENCES "Pais"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Barrio" ADD CONSTRAINT "Barrio_ciudadId_fkey" FOREIGN KEY ("ciudadId") REFERENCES "Ciudad"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RedSocial" ADD CONSTRAINT "RedSocial_informacionId_fkey" FOREIGN KEY ("informacionId") REFERENCES "Informacion"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PQRS" ADD CONSTRAINT "PQRS_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PQRS" ADD CONSTRAINT "PQRS_tipoId_fkey" FOREIGN KEY ("tipoId") REFERENCES "TipoPQRS"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UsuarioDeporte" ADD CONSTRAINT "UsuarioDeporte_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UsuarioDeporte" ADD CONSTRAINT "UsuarioDeporte_deporteId_fkey" FOREIGN KEY ("deporteId") REFERENCES "Deporte"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Perfil" ADD CONSTRAINT "Perfil_tipoPerfilId_fkey" FOREIGN KEY ("tipoPerfilId") REFERENCES "TipoPerfil"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Perfil" ADD CONSTRAINT "Perfil_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Patrocinador" ADD CONSTRAINT "Patrocinador_perfilId_fkey" FOREIGN KEY ("perfilId") REFERENCES "Perfil"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PatrocinadorDeporte" ADD CONSTRAINT "PatrocinadorDeporte_patrocinadorId_fkey" FOREIGN KEY ("patrocinadorId") REFERENCES "Patrocinador"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PatrocinadorDeporte" ADD CONSTRAINT "PatrocinadorDeporte_deporteId_fkey" FOREIGN KEY ("deporteId") REFERENCES "Deporte"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Nutricionista" ADD CONSTRAINT "Nutricionista_perfilId_fkey" FOREIGN KEY ("perfilId") REFERENCES "Perfil"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
