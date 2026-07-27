-- CreateEnum
CREATE TYPE "TipoItemCatalogo" AS ENUM ('SERVICIO', 'FISICO');

-- CreateTable
CREATE TABLE "CategoriaCatalogo" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CategoriaCatalogo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ItemCatalogo" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "tipoItem" "TipoItemCatalogo" NOT NULL,
    "imagenes" TEXT[],
    "categoriaId" INTEGER NOT NULL,
    "usuarioId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ItemCatalogo_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CategoriaCatalogo_nombre_key" ON "CategoriaCatalogo"("nombre");

-- AddForeignKey
ALTER TABLE "ItemCatalogo" ADD CONSTRAINT "ItemCatalogo_categoriaId_fkey" FOREIGN KEY ("categoriaId") REFERENCES "CategoriaCatalogo"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ItemCatalogo" ADD CONSTRAINT "ItemCatalogo_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE CASCADE ON UPDATE CASCADE;
