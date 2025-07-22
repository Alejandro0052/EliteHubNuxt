/*
  Warnings:

  - A unique constraint covering the columns `[pais]` on the table `Pais` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Pais_pais_key" ON "Pais"("pais");
