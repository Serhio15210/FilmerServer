const {validationResult} = require("express-validator");
const ListModel = require("../models/List.js");
const FilmModel = require("../models/Film.js");
const UserModel = require("../models/User.js");
const {saveRateNotification} = require("./NotificationsController");


const getAll = async (req, res) => {

  const sort = req.params.sort === 'rateHigh' ? {rate: -1} : req.params.sort === 'rateLow' ? {rate: 1} : req.params.sort === 'asc' ? {title: 'asc'} : req.params.sort === 'desc' ? {title: 'desc'} : ''
  let films
  let length
  console.log(req.params, sort)
  try {
    if (parseInt(req.params.rate) > 0) {

      films = await FilmModel.paginate({userId: req.userId, rate: req.params.rate}, {
        page: parseInt(req.params.page),
        limit: 30,
        sort: sort
      })
    } else {

      films = await FilmModel.paginate({userId: req.userId}, {
        page: parseInt(req.params.page),
        limit: 30,
        sort: sort
      })

      // .sort(sort).skip(req.params.page==='1'?0:parseInt(req.params.page)*20).limit(30)
      // console.log(films)
    }

    res.json({
      success: true,
      films: films.docs,
      totalPages: films.totalPages,
      hasPrevPage: films.hasPrevPage,
      hasNextPage: films.hasNextPage,
    })
  } catch (err) {
    console.log(err)
  }
}
const getUserAll = async (req, res) => {
  console.log(req.params, req.userId)
  const sort = req.params.sort === 'rateHigh' ? {rate: -1} : req.params.sort === 'rateLow' ? {rate: 1} : req.params.sort === 'asc' ? {title: 'asc'} : req.params.sort === 'desc' ? {title: 'desc'} : ''
  let films
  let length
  const watchedFilter = {
    $and: [
      {userId: req.params.id},
      {
        imdb_id: {
          $nin:
            await FilmModel.find({userId: req.userId}, {
              $or: [
                {rate: {$gt: 0}},
                {comment: {$regex: /.{1,}/}}
              ]
            }).distinct('imdb_id')

        }
      },

    ]
  }
  const rateFilter = {userId: req.params.id, rate: req.params.rate}
  try {
    if (parseInt(req.params.rate) > 0) {
      if (req.params.watched === '1') {
        films = await FilmModel.paginate({...rateFilter, ...watchedFilter}, {
          page: parseInt(req.params.page),
          limit: 30,
          sort: sort
        })
      } else {
        films = await FilmModel.paginate(rateFilter, {
          page: parseInt(req.params.page),
          limit: 30,
          sort: sort
        })
      }
    } else if (req.params.watched === '1') {
      if (parseInt(req.params.rate) > 0) {
        films = await FilmModel.paginate({...rateFilter, ...watchedFilter}, {
          page: parseInt(req.params.page),
          limit: 30,
          sort: sort
        })
      } else {
        films = await FilmModel.paginate(watchedFilter, {
          page: parseInt(req.params.page),
          limit: 30,
          sort: sort
        })
        console.log(films)
      }

    } else {
      films = await FilmModel.paginate({userId: req.params.id}, {
        page: parseInt(req.params.page),
        limit: 30,
        sort: sort
      })

      // .sort(sort).skip(req.params.page==='1'?0:parseInt(req.params.page)*20).limit(30)
      // console.log(films)
    }

    res.json({
      success: true,
      films: films.docs,
      totalPages: films.totalPages,
      hasPrevPage: films.hasPrevPage,
      hasNextPage: films.hasNextPage,
    })
  } catch (err) {
    console.log(err)
  }
}
const getRatingStatistics = async (req, res) => {
  try {
    let film0 = 0
    let film1 = 0
    let film2 = 0
    let film3 = 0
    let film4 = 0
    let film5 = 0

    const films = await FilmModel.find({userId: req.userId})
    for (let i = 0; i < films.length; i++) {
      if (films[i]?.rate === 0) {
        film0 = film0 + 1
      }
      if (films[i]?.rate === 1) {
        film1 = film1 + 1
      }
      if (films[i]?.rate === 2) {
        film2 = film2 + 1
      }
      if (films[i]?.rate === 3) {
        film3 = film3 + 1
      }
      if (films[i]?.rate === 4) {
        film4 = film4 + 1
      }
      if (films[i]?.rate === 5) {
        film5 = film5 + 1
      }
    }
    res.json({
      success: true,
      stats: {
        film0,
        film1,
        film2,
        film3,
        film4,
        film5,
        all: films.length
      }

    })
  } catch (err) {
    console.log(err)
  }
}
const updateFilm = async (req, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json(errors.array())
    }
    const list = await FilmModel.findOne({userId: req.userId, imdb_id: req.body.imdb_id})
    if (!list) {
      return res.status(400).json({
        message: 'Фільм не знайдено'
      })
    }
    const film = await FilmModel.findOneAndUpdate({
      userId: req.userId,
      imdb_id: req.body.imdb_id
    }, {$set: {"rate": req.body.rate, "comment": req.body.comment}}, {new: true})
    // console.log(film)
    await saveRateNotification(req.userId, film)

    res.json({
      success: true
    })
  } catch (err) {
    console.log(err)
  }
}
const getFilm = async (req, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: errors.errors[0].msg
      })
    }
    let film = await FilmModel.findOne({userId: req.userId, imdb_id: req.body.imdb_id})
    console.log(film)
    if (!film) {
      return res.status(400).json({
        message: 'Фільм не знайдено'
      })
    }

    res.json({
      success: true,
      film: film
    })

  } catch (err) {
    console.log(err)
  }
}
const getReviews = async (req, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: errors.errors[0].msg
      })
    }
    const user = await UserModel.findById(req.userId)
    // console.log(user.subscriptions)
    let film = await FilmModel.find({
      $and: [
        {userId: {$ne: req.userId}},
        {imdb_id: {$eq: req.body.imdb_id}},
        {
          $or: [
            {rate: {$gt: 0}},
            {comment: {$regex: /.{1,}/}}
          ]
        }
      ]
    }).populate('userId', '_id userName avatar')
    console.log(film)
    if (!film) {
      return res.status(400).json({
        message: 'Фільм не знайдено'
      })
    }

    res.json({
      success: true,
      reviewsAll: film,
      reviewsSub: film.filter(item => user.subscriptions.includes(item?.userId?._id))
    })

  } catch (err) {
    console.log(err)
  }
}
const deleteAloneFilm = async (req, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: errors.errors[0].msg
      })
    }
    const user = await UserModel.findOne({_id: req.userId})
    const userList = await ListModel.find({userId: req.userId})
    const film = await FilmModel.find({
      $and: [
        {_id: {$nin: userList?.flatMap(list => list.films)}},
        {_id: {$nin: user.favoriteFilms}},
        {userId: req.userId},

      ]
    }).distinct('_id')

    // const list= await FilmModel.find({
    //   _id: { $nin: userList?.flatMap(list => list.films) }
    // })
    // console.log('FILM',film)

    // console.log('LIST', list)
    if (film?.length > 0) {
      // const filmIds = film?.map(film => film._id);
      await FilmModel.deleteMany({_id: {$in: film}});
    }

    res.json({
      success: true
    })

  } catch (err) {
    console.log(err)
  }
}
module.exports = {deleteAloneFilm, getReviews, getFilm, updateFilm, getRatingStatistics, getUserAll, getAll}
