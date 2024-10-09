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

        await prisma.movie.create({
            data: {
                title,
                languages_id,
                genres_id,
                release_date: new Date(release_date)
            }
        })
    } catch (error) {
        return res.status(500).send({ message: 'Falha ao cadastrar um filme' })
    }

    res.status(201).send();
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
        await prisma.movie.update({
            where: {
                id
            },
            data: data
        })
        res.status(200).send();
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
        res.status(404).send({ message: "Filme não encontrado"})
    }

    try {
        await prisma.movie.delete({
            where: {
                id
            }
        })
        res.status(200).send();
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

        res.status(200).send(filteredGenreNames)
    } catch (error) {
        res.status(500).send({ message: "Falha ao filtrar filmes pelo gênero"})
    }   
})

app.listen(port, () => {
    console.log(`Servidor em execução na porta http://localhost:${port}`);
})
