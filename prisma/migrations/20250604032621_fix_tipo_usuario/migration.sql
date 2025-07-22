/*
  Warnings:

  - A unique constraint covering the columns `[tipo]` on the table `TipoUsuario` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "TipoUsuario_tipo_key" ON "TipoUsuario"("tipo");
