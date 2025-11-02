-- CreateTable
CREATE TABLE "Alumno" (
    "id_alumno" SERIAL NOT NULL,

    CONSTRAINT "Alumno_pkey" PRIMARY KEY ("id_alumno")
);

-- CreateTable
CREATE TABLE "Proyeccion" (
    "id_proyeccion" SERIAL NOT NULL,
    "id_alumno" INTEGER NOT NULL,

    CONSTRAINT "Proyeccion_pkey" PRIMARY KEY ("id_proyeccion")
);

-- CreateTable
CREATE TABLE "Semestre" (
    "id_semestre" SERIAL NOT NULL,
    "semestre" INTEGER NOT NULL,
    "id_proyeccion" INTEGER NOT NULL,

    CONSTRAINT "Semestre_pkey" PRIMARY KEY ("id_semestre")
);

-- CreateTable
CREATE TABLE "Ramo" (
    "id_ramo" SERIAL NOT NULL,
    "id_semestre" INTEGER NOT NULL,
    "codigo" TEXT NOT NULL,
    "asigantura" TEXT NOT NULL,
    "creditos" INTEGER NOT NULL,
    "nivel" INTEGER NOT NULL,
    "prereq" TEXT NOT NULL,
    "intento" INTEGER NOT NULL,
    "status" TEXT NOT NULL,
    "cursada" BOOLEAN NOT NULL,

    CONSTRAINT "Ramo_pkey" PRIMARY KEY ("id_ramo")
);

-- AddForeignKey
ALTER TABLE "Proyeccion" ADD CONSTRAINT "Proyeccion_id_alumno_fkey" FOREIGN KEY ("id_alumno") REFERENCES "Alumno"("id_alumno") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Semestre" ADD CONSTRAINT "Semestre_id_proyeccion_fkey" FOREIGN KEY ("id_proyeccion") REFERENCES "Proyeccion"("id_proyeccion") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Ramo" ADD CONSTRAINT "Ramo_id_semestre_fkey" FOREIGN KEY ("id_semestre") REFERENCES "Semestre"("id_semestre") ON DELETE RESTRICT ON UPDATE CASCADE;
