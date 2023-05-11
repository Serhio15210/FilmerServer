const checkDeleteFilm= async (req, res, next) => {

  try {
    // const film = await ListModel.find({userId: req.userId,_id:{$ne:req.body._id},films:{$in:[req.body.filmId]}})
    // const userFilm = await UserModel.find({_id: req.userId,favoriteFilms:{$in:[req.body.filmId]}})
    // console.log(req.body.filmId)
    //  if (film.concat(userFilm).length===0){
    //    await FilmModel.findByIdAndRemove({_id:req.body.filmId})
    //  }
    next()
  } catch (err) {
    return res.status(403).json({
      message: 'Error adding'
    })
  }


}
module.exports=checkDeleteFilm
