const z = require("zod");

const movieSchema = z.object({
    title: z.string({
        invalid_type_error: 'movie-title-must-be-string',
        required_error: 'title-required'
    }),
    year: z.number().int().min(1900).max(2024),
    director: z.string(),
    duration: z.number().int().positive(),
    rate: z.number().min(0).max(10).default(5),
    poster: z.string().url({
        message: 'poster-must-be-url'
    }),
    genre: z.array(
        z.enum(['Action', 'Adventure', 'Comedy', 'Drama', 'Fantasy', 'Horror', 'Thriller', 'Sci-Fi', 'Crime']),
        {
            required_error: 'movie-genre-required',
            invalid_type_error: 'genre-must-be-an-array-of-enum-genre'
        }
    )
});

function validateMovie(object){
    return movieSchema.safeParse(object)
}

function validatePartialMovie(input){
    return movieSchema.partial().safeParse(input);
}

module.exports = { 
    validateMovie,
    validatePartialMovie
}