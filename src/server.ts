import express from "express";
import { PrismaClient } from "@prisma/client";
import swaggerUi from "swagger-ui-express";
import swaggerDocument from "../swagger.json";

const app = express();
const port = 3000;
const prisma = new PrismaClient();

app.use(express.json());

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.get('/movies', async (req, res) => {
    try {

        const movies = await prisma.movie.findMany({
            orderBy: {
                title: 'asc'
            },
            include: {
                genres: true,
                languages: true
            }
        });
        res.status(200).json(movies);
    } catch (error) {
        res.status(500).send({ message: "Falha ao listar filmes" })
    }
})

app.post('/movies', async (req, res) => {

    const { title, genres_id, languages_id, release_date } = req.body;

    try {
        const movieWithTheSameTitle = await prisma.movie.findFirst({
            where: {
                title: {
                    equals: title,
                    mode: 'insensitive'
                }
            }
        });

        if (movieWithTheSameTitle) {
            return res.status(409).send({ message: 'Já existe um filme cadastrado com esse título' });
        }

        const createdMovie = await prisma.movie.create({
            data: {
                title,
                languages_id,
                genres_id,
                release_date: new Date(release_date)
            }
        })
        res.status(201).json(createdMovie);
    } catch (error) {
        return res.status(500).send({ message: 'Falha ao cadastrar um filme' })
    }


})


app.put('/movies/:id', async (req, res) => {
    const id = Number(req.params.id);
    const data = req.body;

    data.release_date = data.release_date ? new Date(data.release_date) : undefined;

    const movie = await prisma.movie.findUnique({
        where: {
            id
        }
    })

    if (!movie) {
        res.status(404).send({ message: "Registro de filme não encontrado" })
    }

    try {
        const updatedMovie = await prisma.movie.update({
            where: {
                id
            },
            data: data
        })
        res.status(200).json(updatedMovie);
    } catch (error) {
        res.status(500).send({ message: "Falha ao atualizar registro do filme" })
    }
})

app.delete('/movies/:id', async (req, res) => {
    const id = Number(req.params.id);

    const movie = await prisma.movie.findUnique({
        where: {
            id
        }
    })

    if (!movie) {
        res.status(404).send({ message: "Filme não encontrado" })
    }

    try {
        await prisma.movie.delete({
            where: {
                id
            }
        })
        res.status(200).send({ message: "Filme removido com sucesso"});
    } catch (error) {
        res.status(500).send({ message: "Falha ao remover o filme" })
    }
})

app.get('/movies/:genreName', async (req, res) => {

    try {
        const filteredGenreNames = await prisma.movie.findMany({
            where: {
                genres: {
                    genre_name: {
                        mode: 'insensitive',
                        equals: req.params.genreName,
                    }
                }
            },
            include: {
                languages: true,
                genres: true,
            }
        })

        res.status(200).json(filteredGenreNames)
    } catch (error) {
        res.status(500).send({ message: "Falha ao filtrar filmes pelo gênero" })
    }
})

app.put('/genres/:id', async (req, res) => {
    const id = Number(req.params.id);
    const { genre_name } = req.body;

    if (!genre_name) {
        res.status(400).send({ message: "O nome do gênero é obrigatório" })
    }



    try {
        const genre = await prisma.genre.findUnique({
            where: { id }
        })

        if (!genre) {
            return res.status(404).send({ message: "ID não encontrado ou inválido" })
        }

        const existingGenre = await prisma.genre.findFirst({
            where: {
                genre_name: {
                    equals: genre_name,
                    mode: "insensitive"
                }
            }
        })

        if (existingGenre) {
            return res.status(409).send({ message: "Gênero já existente" })
        }

        const updatedGenre = await prisma.genre.update({
            where: {
                id
            },
            data: genre_name
        })
        res.status(200).json(updatedGenre);
    } catch (error) {
        res.status(500).send({ message: "Não foi possível atualizar o gênero" })
    }

})

app.post('/genres', async (req, res) => {
    const { genre_name } = req.body;

    try {

        const existingGenre = await prisma.genre.findFirst({
            where: {
                genre_name: {
                    equals: genre_name,
                    mode: "insensitive"
                }
            }
        })

        if (existingGenre) {
            return res.status(409).send({ message: "Gênero já existente" });
        }

        const createdGenre = await prisma.genre.create({
            data: {
                genre_name
            }
        })
        res.status(201).json(createdGenre);
    } catch (error) {
        res.status(500).send({ message: "Falha ao adicionar novo gênero" });
    }
})

app.get('/genres', async (req, res) => {

    try {
        const genres = await prisma.genre.findMany({
            orderBy: {
                genre_name: "asc"
            }
        })
        res.status(200).json(genres);
    } catch (error) {
        res.status(500).send({ message: "Falha ao listar gêneros" })
    }
})

app.delete('/genres/:id', async (req, res) => {
    const id = Number(req.params.id);

    try {
        const genre = await prisma.genre.findFirst({
            where: {
                id
            }
        })

        if (!genre) {
            return res.status(404).send({ message:"ID incorreto"})
        }

        await prisma.genre.delete({
            where: {
                id
            }
        })
        res.status(200).send({ message: "Gênero removido com sucesso"});
    } catch (error) {
        res.status(500).send({ message: "Não foi possível deletar o gênero"})
    }
})

app.listen(port, () => {
    console.log(`Servidor em execução na porta http://localhost:${port}`);
})
