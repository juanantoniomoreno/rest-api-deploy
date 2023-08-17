const express = require("express");
const crypto = require('node:crypto');
const movies = require('./movies.json');
const cors = require('cors');
const { validateMovie, validatePartialMovie } = require("./schemas/movies");

const app = express();
app.use(express.json());

app.use(cors({
    origin: (origin, callback) => {

        const ACCEPTED_ORIGINS = [
            'http://localhost:8080',
            'http://localhost:1234',
            'https://movies.com',
            'https://midu.dev',
        ];

        if(ACCEPTED_ORIGINS.includes(origin)){
            return callback(null, true)
        }

        if(!origin){
            return callback(null, true);
        }

        return callback(new Error('not-allowed-by-cors'));
    }
}));

app.disable("x-powered-by");

// Los recursos que sean MOVIES se identifican con /movies
app.get("/movies", (req, res) => {

    // const origin = req.header('origin');

    // if(ACCEPTED_ORIGINS.includes(origin) || !origin ){
    //     res.header('Access-Control-Allow-Origin', origin );        
    // }

    const { genre } = req.query;

    if(genre) {
        const filteredMovies = movies.filter(
            movie => movie.genre.some(g => g.toLowerCase() === genre.toLowerCase())
        );

        if(filteredMovies.length > 0){
            res.json({ filteredMovies});
        }

        res.status(404).json({ message:  `movies with genre ${genre.toUpperCase()} not found`});
    }

    res.json({ movies });    
});

app.get("/movies/:id", (req, res) => { // path-to-regexp
    const { id } = req.params;

    const movie = movies.find(movie => movie.id === id);

    if(movie) {
        res.json(movie);
    }

    res.status(404).json({ message: 'movie-not-found '});
})

app.post("/movies", (req, res) => {

    const result = validateMovie(req.body);

    if(!result.success){
        return res.status(400).json({ error: JSON.parse(result.error.message) });
    }

    const newMovie = {
        id: crypto.randomUUID(), // uuid v4
        ...result.data
    }

    // Esto no es REST, porque estamos guardando
    // el estado de la aplicación en memoria
    movies.push(newMovie);

    res.status(201).json(newMovie) //actualizar cache del cliente
});

app.delete("/movies/:id", (req, res) => {

    //  const origin = req.header('origin');

    // if(ACCEPTED_ORIGINS.includes(origin) || !origin ){
    //     res.header('Access-Control-Allow-Origin', origin );
    // }

    const {id} = req.params;
    const movieIndex = movies.findIndex(movie => movie.id === id)

    if(movieIndex === -1){
        return res.status(404).json({ message: 'movie-not-found'})
    }

    movies.splice(movieIndex, 1);

    return res.json({ message: 'movie-deleted'});
})


app.patch("/movies/:id", (req, res) => {

    const result = validatePartialMovie(req.body);
    
    if(!result.success){
        return res.status(400).json({ error: JSON.parse(result.error.message)});
    }
    
    const { id } = req.params;
    const movieIndex = movies.findIndex(movie => movie.id === id)

    if(movieIndex === -1){
        return res.status(404).json({ message: 'movie-not-found'})
    }

    const updateMovie = {
        ...movies[movieIndex],
        ...result.data
    }

    movies[movieIndex] = updateMovie;

    return res.json(updateMovie);
})

// app.options('/movies/:id', (req, res) => {

//     const origin = req.header('origin');

//     if(ACCEPTED_ORIGINS.includes(origin) || !origin ){
//         res.header('Access-Control-Allow-Origin', origin)
//         res.header('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE')
//     }

//     res.send(200);
// })

const PORT = process.env.PORT ?? 1234;

app.listen(PORT, () => {
    console.log("SERVER LISTENING ON PORT localhost:" + PORT);
});
