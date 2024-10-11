-- CreateTable
CREATE TABLE "genres" (
    "id" SERIAL NOT NULL,
    "genre_name" VARCHAR(50),

    CONSTRAINT "genres_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "languages" (
    "id" SERIAL NOT NULL,
    "language_name" VARCHAR(50),

    CONSTRAINT "languages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "movies" (
    "id" SERIAL NOT NULL,
    "title" VARCHAR(50),
    "genres_id" INTEGER,
    "languages_id" INTEGER,
    "release_date" DATE,
    "director" VARCHAR(50),
    "duration" INTEGER,

    CONSTRAINT "movies_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "movies" ADD CONSTRAINT "fk_genre" FOREIGN KEY ("genres_id") REFERENCES "genres"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "movies" ADD CONSTRAINT "fk_language" FOREIGN KEY ("languages_id") REFERENCES "languages"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;
