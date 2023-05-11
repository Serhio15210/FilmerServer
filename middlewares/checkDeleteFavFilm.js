import FilmModel from "../models/Film.js";
import ListModel from "../models/List.js";
import UserModel from "../models/User.js";


export default async (req, res, next) => {

  try {
    const film = await ListModel.find({userId: req.userId,films:{$in:[req.body.filmId]}})
    // const userFilm = await UserModel.find({_id: req.userId,favoriteFilms:{$in:[req.body.filmId]}})

    if (film.length===0){
      await FilmModel.findByIdAndRemove({_id:req.body.filmId})
    }
    next()
  } catch (err) {
    return res.status(403).json({
      message: 'Error adding'
    })
  }


}
