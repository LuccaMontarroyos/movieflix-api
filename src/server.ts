import express from "express";
const app = express();
import { PrismaClient } from "@prisma/client";
import { equal } from "assert";
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

    try {
        /*está sendo passado o título da requisição feita e através do método pego da tabela 'movie'
        .findFirst, que lá ele tentará encontrar um movie onde o nome é igual ao titulo passado na requisição,
        e usando o modo sensitive, que será armazenado na variável movieWithTheSameTitle, e assim fazemos a 
        verificação*/
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

/*Nesse caso como estamos fazendo a atualzação de um registro precisamos passar qual queremos
alterar, portanto fazemos*/
app.put('/movies/:id', async (req, res) => {
    const id = Number(req.params.id);
    const { genres_id, release_date } = req.body;
    
    try {
        await prisma.movie.update({
            where: {
                id
            },
            data: {
                genres_id,
                release_date: new Date(release_date)
            }
        })
        res.status(200).send();
    } catch (error) {
        res.status(500).send({ message: "Falha ao atualizar dados do filme"})
    }
})


app.listen(port, () => {
    console.log(`Servidor em execução na porta http://localhost:${port}`);
})
