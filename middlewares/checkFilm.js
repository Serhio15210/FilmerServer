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
    let film = await FilmModel.findOne({userId: req.userId, imdb_id: req.body.imdb_id})
    console.log('body',req.userId,req.body.imdb_id)
    if (!film) {
      film = new FilmModel({
        imdb_id: req.body.imdb_id,
        poster: req.body.poster,
        title: req.body.title,
        rate:req.body.rate||0,
        comment:req.body.comment||'',
        isSerial:req.body.isSerial||false,
        isFavorite:req.body.isFavorite||false,
        userId: req.userId
      })
      await film.save()
    }
    req.body.filmId=film._id

    next()
  } catch (err) {
    return res.status(403).json({
      message: 'Error adding'
    })
  }


}
module.exports = checkFilm
