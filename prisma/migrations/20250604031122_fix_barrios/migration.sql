/*
  Warnings:

  - A unique constraint covering the columns `[barrio,ciudadId]` on the table `Barrio` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Barrio_barrio_ciudadId_key" ON "Barrio"("barrio", "ciudadId");
