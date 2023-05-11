const ListModel = require("../models/List.js");
const {validationResult} = require("express-validator");

const createList = async (req, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json(errors.array())
    }
    const list = await ListModel.findOne({name: req.body.name})
    if (list) {
      return res.status(400).json({
        message: 'Список створено!'
      })
    }
    const doc = new ListModel({
      name: req.body.name,
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
      lists = await ListModel.find({userId: req.params.id}).populate('films').exec()
    } else {
      lists = await ListModel.find({userId: req.userId}).populate('films').exec()
    }

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
    const list = await ListModel.findById(req.params.id).populate('films').exec()
    if (!list) {
      return res.status(400).json({
        message: 'Список не знайдено'
      })
    }
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
    const list = await ListModel.findByIdAndUpdate(req.params.id, {
      name: req.body.name
    })
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

    if (list.films.includes(req.body.filmId)) {
      return res.status(400).json({
        message: 'Фільм уже доданий'
      })
    } else {
      const newFilm = await ListModel.updateOne({_id: req.body._id}, {$push: {films: req.body.filmId}})

      console.log(newFilm)
    }

    res.json({
      success: true
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
    // const i = await ListModel.find({_id: req.body._id}).populate('films').exec()
    // console.log(i[0])
    // if (list.films.includes(req.body.filmId)) {
    //   return res.status(400).json({
    //     message: 'Film has already added'
    //   })
    // } else {
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
  createList
}
