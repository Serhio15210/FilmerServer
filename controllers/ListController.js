const ListModel = require("../models/List.js");
const {validationResult} = require("express-validator");
const FilmModel = require("../models/Film");

const createList = async (req, res) => {
  try {

    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json(errors.array())
    }
    console.log(req.body)
    const list = await ListModel.findOne({name: req.body.name})
    if (list) {
      return res.status(400).json({
        message: 'Такий список вже створено!'
      })
    }
    const doc = new ListModel({
      name: req.body.name,
      description:req.body.description,
      mode:req.body.mode,
      films: req.body.films || [],
      userId: req.userId

    })
    const newList = await doc.save()

    res.json({
      success: true,
      _id: newList._id
    })
  } catch (err) {
    console.log(err)
  }
}
const getAll = async (req, res) => {
  let lists
  try {
    if (req.params.id) {
      lists = await ListModel.find({userId: req.params.id}).lean().populate('films').exec()
    } else {
      lists = await ListModel.find({userId: req.userId}).lean().populate('films').exec()
    }

    // console.log(lists)
    res.json({
      success: true,
      lists: lists
    })
  } catch (err) {
    console.log(err)
  }
}

const getById = async (req, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json(errors.array())
    }
    const idList = await ListModel.findById(req.params.id).exec();

    if (!idList) {
      return res.status(400).json({
        message: 'Список не знайдено'
      })
    }


    const userId=idList.userId
    const list = await ListModel.findById(req.params.id).populate({
      path: 'films',
      select: {
        _id: 1,
        title: 1,
        poster: 1,
        imdb_id:1,
        userId: {$elemMatch: { $eq: userId }},
        isFavorites: {$elemMatch: { userId:{$eq: userId }}},
        rates: { $elemMatch: { userId: { $eq: userId } } }, // Выбираем только оценку текущего пользователя
        comments: { $elemMatch: { userId: { $eq: userId } } } // Выбираем только комментарии текущего пользователя
      }
    }
     ).populate({
      path:'userId',
      select:{
        _id:1,
        userName:1,
      }
    }).exec()


    res.json({
      success: true,
      list: list
    })
  } catch (err) {
    console.log(err)
  }
}
const deleteById = async (req, res) => {

  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json(errors.array())
    }
    const list = await ListModel.findByIdAndDelete(req.params.id)

    if (!list) {
      return res.status(400).json({
        message: 'Список не знайдено'
      })
    }
    res.json({
      success: true
    })
  } catch (err) {
    console.log(err)
  }
}
const updateById = async (req, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json(errors.array())
    }
    console.log(req.body)
    let list
    if (req.body.films?.length>0) {
       list = await ListModel.findByIdAndUpdate(req.params.id, {
        name: req.body.name,
        description: req.body.description,
        mode: req.body.mode,
        films: req.body.films
      })
    }else {
      list = await ListModel.findByIdAndUpdate(req.params.id, {
        name: req.body.name,
        description: req.body.description,
        mode: req.body.mode
      })
    }
    if (!list) {
      return res.status(400).json({
        message: 'Список не знайдено'
      })
    }
    res.json({
      success: true
    })
  } catch (err) {
    console.log(err)
  }
}
const subscribe = async (req, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json(errors.array())
    }
    const list = await ListModel.findOne({_id: req.body._id})
    if (!list) {
      return res.status(400).json({
        message: 'Список не знайдено'
      })
    }
    if (list.subscribers.includes(req.userId)) {
      return res.status(400).json({
        message: 'Користувач вже підписався'
      })
    } else {
      await ListModel.updateOne({_id: req.body._id}, {$push: {subscribers: req.userId}})
    }

    res.json({
      success: true
    })
  } catch (err) {
    console.log(err)
  }
}
const unsubscribe = async (req, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json(errors.array())
    }
    const list = await ListModel.findOneAndUpdate({_id: req.body._id}, {$pull: {subscribers: req.userId}})
    if (!list) {
      return res.status(400).json({
        message: 'Список не знайдено'
      })
    }
    res.json({
      success: true
    })
  } catch (err) {
    console.log(err)
  }
}
const addFilm = async (req, res) => {
  try {
    // const start = Date.now();
    console.log(req.body.listId,req.body.film)
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json(errors.array())
    }
    const list = await ListModel.findOne({_id: req.body.listId})
    if (!list) {
      return res.status(400).json({
        message: 'Список не знайдено'
      })
    }

    if (list.films.includes(req.body.filmId)) {
      return res.status(400).json({
        message: 'Фільм уже доданий'
      })
    } else {
      const newFilm = await ListModel.updateOne({_id: req.body.listId}, {$push: {films: req.body.filmId}})

      console.log(newFilm)
    }
    // const end = Date.now();
    // const responseTime = end - start;
    //
    // console.log(`Час відклику запиту addFilm: ${responseTime} мс`);
    res.json({
      success: true
    })
  } catch (err) {
    console.log(err)
  }
}
const createFilm = async (req, res) => {
  try {

    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json(errors.array())
    }
    let film = await FilmModel.findOneAndUpdate(
        {
          imdb_id: req.body.imdb_id,
          userId: {$elemMatch: { $eq: req.userId }},
        },
        {
          $setOnInsert: { // Устанавливаем начальные значения при создании нового документа
            imdb_id: req.body.imdb_id,
            poster: req.body.poster,
            title: req.body.title,
            isSerial: req.body.isSerial || false,
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
    res.json({
      success: true,
      film:film
    })
  } catch (err) {
    console.log(err)
  }
}
const addFilms = async (req, res) => {
  try {

    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json(errors.array())
    }
    const list = await ListModel.findOne({_id: req.body._id})
    if (!list) {
      return res.status(400).json({
        message: 'Список не знайдено'
      })
    }
    req.body.films.map(async item => {
      let film = await FilmModel.findOneAndUpdate(
          {
            imdb_id: item.imdb_id,
            userId: {$elemMatch: {$eq: req.userId}},
          },
          {
            $setOnInsert: { // Устанавливаем начальные значения при создании нового документа
              imdb_id: item.imdb_id,
              poster: item.poster,
              title: item.title,
              isSerial: item.isSerial || false,
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

    })

    const newFilm = await ListModel.updateOne(
      {_id: req.body._id},
      {$push: {films: {$each: req.body.films}}})

    // console.log(newFilm)


    res.json({
      success: true
    })
  } catch (err) {
    console.log(err)
  }
}
const deleteFilm = async (req, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: errors.errors[0].msg
      })
    }
    const list = await ListModel.findOne({_id: req.body._id})
    if (!list) {
      return res.status(400).json({
        message: 'Список не знайдено'
      })
    }
    if (!list.films.includes(req.body.filmId)) {
      return res.status(400).json({
        message: 'Фільм не знайдено'
      })
    } else {
      await ListModel.findOneAndUpdate({_id: req.body._id}, {$pull: {films: req.body.filmId}})
    }

    res.json({
      success: true
    })
  } catch (err) {
    console.log(err)
  }
}
module.exports = {
  deleteFilm,
  addFilms,
  addFilm,
  unsubscribe,
  subscribe,
  updateById,
  deleteById,
  getById,
  getAll,
  createList,
  createFilm
}
