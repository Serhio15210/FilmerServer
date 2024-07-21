const FilmModel =require("../models/Film.js");
const {validationResult} =require("express-validator");


const checkFilm= async (req, res, next) => {

  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: errors.errors[0].msg
      })

    }
    // console.log(req.body)
    let film = await FilmModel.findOneAndUpdate(
        {
          imdb_id: req.body.film.imdb_id,
          userId: {$elemMatch: { $eq: req.userId }},
        },
        {
          $setOnInsert: { // Устанавливаем начальные значения при создании нового документа
            imdb_id: req.body.film.imdb_id,
            poster: req.body.film.poster,
            title: req.body.film.title,
            isSerial: req.body.film.isSerial || false,
            userId: [req.userId],
            rates: [],
            comments: [],
            isFavorites: []
          }
        },
        {
          upsert: true, // Создаем новый документ, если не найден
          new: true, // Возвращаем обновленный документ
          runValidators: true // Запускаем валидацию модели
        }
    );
    console.log(film)

    req.body.filmId=film._id

    next()
  } catch (err) {
    return res.status(403).json({
      message: 'Error adding'
    })
  }


}
module.exports = checkFilm
