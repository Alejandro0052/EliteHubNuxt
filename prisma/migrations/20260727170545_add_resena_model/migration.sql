-- CreateTable
CREATE TABLE "Resena" (
    "id" SERIAL NOT NULL,
    "rating" INTEGER NOT NULL,
    "comentario" TEXT NOT NULL,
    "autorId" INTEGER NOT NULL,
    "nutricionistaId" INTEGER NOT NULL,
    "retractada" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Resena_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Resena_autorId_nutricionistaId_key" ON "Resena"("autorId", "nutricionistaId");

-- AddForeignKey
ALTER TABLE "Resena" ADD CONSTRAINT "Resena_autorId_fkey" FOREIGN KEY ("autorId") REFERENCES "Usuario"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Resena" ADD CONSTRAINT "Resena_nutricionistaId_fkey" FOREIGN KEY ("nutricionistaId") REFERENCES "Usuario"("id") ON DELETE CASCADE ON UPDATE CASCADE;
