import express from "express";
const app = express();
import { PrismaClient } from "@prisma/client";
const port = 3000;
const prisma = new PrismaClient();


app.use(express.json());


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
    res.json(movies);
})

app.post('/movies', async (req, res) => {
   
    const { title, genres_id, languages_id, release_date } = req.body;
    
    await prisma.movie.create({
        data: {
            title,
            languages_id,
            genres_id,
            release_date: new Date(release_date)
        }
    })

    res.status(201).send();
})


app.listen(port, () => {
    console.log(`Servidor em execução na porta http://localhost:${port}`);
})
