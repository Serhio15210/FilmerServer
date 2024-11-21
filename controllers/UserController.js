const UserModel = require("../models/User.js");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const {validationResult} = require("express-validator");
const ListModel = require("../models/List.js");
const FilmModel = require("../models/Film.js");
const {sendPushNotification} = require("../fcm/services");
const {saveSubNotification} = require("./NotificationsController");
const fs = require('fs');
require('dotenv').config();
const path = require('path');
const {upload} = require("../static/imageUtils");
const { OAuth2Client } = require('google-auth-library');
const client = new OAuth2Client(process.env.GOOGLE_ID);

exports.loginWithGoogle = async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({ message: 'Google token is required' });
    }


    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_ID, // Замените на ваш Google Client ID
    });

    const payload = ticket.getPayload();
    const { email, name, sub: googleId } = payload;

    let user = await UserModel.findOne({ email });
    if (!user) {

      user = new UserModel({
        email,
        userName:name,
        password: await bcrypt.hash('random_password', 10), // Генерация случайного пароля, если нужен
      });
      await user.save();
    }


    const authToken = jwt.sign(
        { _id: user._id },
        process.env.SECRET_PHRASE, // Секретный ключ
        { expiresIn: '30d' }
    );

    res.json({
      success: true,
      token: authToken
    });
  } catch (err) {
    console.error('Error during Google login:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
};
exports.saveFcmToken = async (req, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: errors.errors[0].msg
      })
    }
    const user = await UserModel.findByIdAndUpdate(req.userId, {
      fcmToken: req.body.fcmToken
    })
    if (!user) {
      return res.status(400).json({
        message: 'Користувача не знайдено'
      })
    }
    res.json({
      success: true
    })
  } catch (err) {
    console.log(err)
  }
}
exports.saveFavoriteGenre = async (req, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: errors.errors[0].msg
      })
    }
    const user = await UserModel.findByIdAndUpdate(req.userId, {
      favGenres: req.body.genres
    })
    if (!user) {
      return res.status(400).json({
        message: 'Користувача не знайдено'
      })
    }
    res.json({
      success: true
    })
  } catch (err) {
    console.log(err)
  }
}
exports.saveFavoriteActors = async (req, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: errors.errors[0].msg
      })
    }
    const user = await UserModel.findByIdAndUpdate(req.userId, {
      favActors: req.body.actors
    })
    if (!user) {
      return res.status(400).json({
        message: 'Користувача не знайдено'
      })
    }
    res.json({
      success: true
    })
  } catch (err) {
    console.log(err)
  }
}
exports.getUsers = async (req, res) => {
  let users
  try {
    if (req.params.query) {
      users = await UserModel.paginate({_id: {$ne: req.userId}, userName: {$regex: req.params.query}}, {
        page: parseInt(req.params.page),
        limit: 30
      })
    } else {
      users = await UserModel.paginate({_id: {$ne: req.userId}}, {
        page: parseInt(req.params.page),
        limit: 30
      })
    }


    res.json({
      success: true,
      users: users.docs,
      totalPages: users.totalPages,
      hasPrevPage: users.hasPrevPage,
      hasNextPage: users.hasNextPage,
    })
  } catch (err) {
    console.log(err)
  }
}

exports.login = async (req, res) => {
  try {

    const errors = validationResult(req)
    if (!errors.isEmpty()) {

      return res.status(400).json({
        message: errors.errors[0].msg
      })
    }

    const user = await UserModel.findOne({email: req.body.email})

    if (!user) {
      return res.status(400).json(
        {
          message: 'Користувача не знайдено'
        })

    }
    const isValidPassword = await bcrypt.compare(req.body.password, user._doc.password)
    if (!isValidPassword) {
      return res.status(400).json(
        {
          message: 'Невірна адреса пошти або пароль'
        })
    }
    const token = jwt.sign({
      _id: user._id
    }, process.env.SECRET_PHRASE, {
      expiresIn: '30d'
    })
    res.json({
      success: true,
      token: token
    })
  } catch (err) {
    console.log(err)
  }
}

exports.register = async (req, res) => {
  try {
    const start = Date.now();
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: errors.errors[0].msg
      })
    }

    const password = req.body.password
    const salt = await bcrypt.genSalt(10)
    const passwordHash = await bcrypt.hash(password, salt)
    const doc = new UserModel({
      userName: req.body.userName,
      email: req.body.email,
      password: passwordHash

    })
    const user = await doc.save()
    const token = jwt.sign({
      _id: user._id
    }, process.env.SECRET_PHRASE, {
      expiresIn: '30d'
    })
    const end = Date.now();
    const responseTime = end - start;

    console.log(`Час відклику запиту: ${responseTime} мс`);
    res.json({
      success: true,
      token: token
    })
  } catch (error) {
    console.log(error)
    if (error.code === 11000 && error.keyPattern && error.keyPattern.email === 1) {
      res.status(500).json({
        message: 'Користувач із такою поштою вже зареєстрований'
      })

    } else if (error.code === 11000 && error.keyPattern && error.keyPattern.userName === 1) {
      res.status(500).json({
        message: 'Користувач із таким нікнеймом вже зареєстрований'
      })

    } else
      res.status(500).json({
        message: 'Помилка реєстрації'
      })
  }
}
exports.getProfile = async (req, res) => {
  let user

  try {
    if (req.params.id) {
      user = await UserModel.findOne({_id: req.params.id}, {password: 0})
    } else {
      user = await UserModel.findOne({_id: req.userId}, {password: 0})
    }

    if (!user) {
      return res.status(403).json({
        message: 'Користувача не знайдено'
      })
    } else {
      return res.json({
        success: true,
        userInfo: user
      })
    }
  } catch (err) {
    console.log(err)
  }
}
exports.getFavorites = async (req, res) => {
  try {

    const films = await FilmModel.find({userId: req.userId})
    // console.log('user',user)
    if (!films) {
      return res.status(403).json({
        message: 'Фільмів не знайдено'
      })
    } else {
      return res.json({
        success: true,
        favoriteFilms: films
      })
    }
  } catch (err) {
    console.log(err)
  }
}
exports.getActivities = async (req, res) => {
  try {
    const user = await FilmModel.find({
      userId: { $elemMatch: { $eq: req.userId } },
      $or: [
        {
          rates: {
            $elemMatch: {
              userId: { $eq: req.userId },
              rate: { $gt: 0 }
            }
          }
        },
        {
          comments: {
            $elemMatch: {
              userId: { $eq: req.userId },
              comment: { $gt: 1 }
            }
          }
        }
      ]
    }).sort({updatedAt: -1}).limit(10).select({
      title: 1, // включаем другие нужные поля
      poster: 1,
      imdb_id:1,
      userId:{ $elemMatch: { $eq: req.userId } },
      isFavorites:{ $elemMatch: { userId: req.userId } },
      rates: { $elemMatch: { userId: req.userId } },
      comments: { $elemMatch: { userId: req.userId } }
    })

    if (!user) {
      return res.status(403).json({
        message: 'Користувача не знайдено'
      })
    } else {
      return res.json({
        success: true,
        activities: user
      })
    }
  } catch (err) {
    console.log(err)
  }
}
exports.deleteProfile = async (req, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: errors.errors[0].msg
      })
    }
    const list = await UserModel.findByIdAndDelete(req.params.id)
    await ListModel.deleteMany({userId: req.params.id})
    await FilmModel.deleteMany({userId: req.params.id})
    if (!list) {
      return res.status(400).json({
        message: 'Користувача не знайдено'
      })
    }
    res.json({
      success: true
    })
  } catch (err) {
    console.log(err)
  }
}
exports.updateProfile = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: errors.errors[0].msg
      });
    }
    const user = await UserModel.findById(req.userId);

    if (!user) {
      return res.status(400).json({
        message: 'Користувача не знайдено'
      });
    }

    if (req.file && user.avatar) {
      const oldAvatarPath = path.join(__dirname, '../static/avatars', user.avatar);
      console.log(oldAvatarPath)
      fs.unlink(oldAvatarPath, (err) => {
        if (err) console.log('Не вдалося видалити старий аватар:', err);
      });
    }
    const updatedData = {
      userName: req.body.userName,
      password: req.body.password
    };

    if (req.file) {
      updatedData.avatar = req.file.filename; // Сохраняем путь к файлу в базе данных
    }

    const updUser = await UserModel.findByIdAndUpdate(req.userId, updatedData);

    upload.single('avatar')
    res.json({
      success: true,
      avatarUrl: req.file ? req.file.path : updUser.avatar // Вернуть путь к аватару
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
}
exports.subscribe = async (req, res) => {
  try {
    const start = Date.now();
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: errors.errors[0].msg
      })
    }
    const list = await UserModel.findOne({_id: req.body._id})

    if (!list) {
      return res.status(400).json({
        message: 'Користувача не знайдено'
      })
    }
    if (list.subscribers.includes(req.userId)) {
      return res.status(400).json({
        message: 'Користувач уже підписаний'
      })
    } else {

      const subUser = await UserModel.updateOne({_id: req.body._id}, {$push: {subscribers: req.userId}}, {new: true})
      const user = await UserModel.updateOne({_id: req.userId}, {$push: {subscriptions: req.body._id}}, {new: true})
      // const subUser= await UserModel.findOne({_id: req.body._id})
      // const user =await UserModel.findOne({_id: req.userId})
      // console.log(req.body._id,req.userId)
      // console.log(subUser)
      // console.log(user)
    }
    const end = Date.now();
    const responseTime = end - start;

    console.log(`Час відклику запиту subscribe: ${responseTime} мс`);
    res.json({
      success: true
    })
    // saveSubNotification(req.userId,req.body._id)
  } catch (err) {
    console.log(err)
  }
}
exports.getSubscribers = async (req, res) => {
  try {
    const user = await UserModel.findOne({_id: req.params.id}).populate('subscribers').exec()
    // console.log(user)
    // if (!users) {
    //   return res.status(400).json({
    //     message: 'Subscribers was not found'
    //   })
    // }

    res.json({
      success: true,
      subscribers: user.subscribers
    })
  } catch (err) {
    console.log(err)
  }
}
exports.getSubscriptions = async (req, res) => {
  try {
    const user = await UserModel.findOne({_id: req.params.id}).populate('subscriptions').exec()
    // console.log(user)
    // if (!users) {
    //   return res.status(400).json({
    //     message: 'Subscribers was not found'
    //   })
    // }

    res.json({
      success: true,
      subscriptions: user.subscriptions
    })
  } catch (err) {
    console.log(err)
  }
}
exports.unsubscribe = async (req, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: errors.errors[0].msg
      })
    }
    const list = await UserModel.findOneAndUpdate({_id: req.body._id}, {$pull: {subscribers: req.userId}})
    const list2 = await UserModel.findOneAndUpdate({_id: req.userId}, {$pull: {subscriptions: req.body._id}})
    if (!list || !list2) {
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

exports.likeFilm = async (req, res) => {
  try {
    const start = Date.now();
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: errors.errors[0].msg
      })
    }
    const list = await UserModel.findOne({_id: req.userId})
    if (!list) {
      return res.status(400).json({
        message: 'Користувача не знайдено'
      })
    }
    // const i = await ListModel.find({_id: req.body._id}).populate('films').exec()
    // console.log(i[0])
    // if (list?.favoriteFilms?.includes(req.body.filmId)) {
    //   return res.status(400).json({
    //     message: 'Фільм уже доданий'
    //   })
    // } else {
      // const newFilm = await UserModel.updateOne({_id: req.userId}, {$push: {favoriteFilms: req.body.filmId}})
      const newListFilmItem = await FilmModel.updateOne({_id: req.body.filmId}, {$set: {isFavorite: true}}, {new: true})
      console.log(newListFilmItem)
    // }
    const end = Date.now();
    const responseTime = end - start;

    console.log(`Час відклику запиту: ${responseTime} мс`);
    res.json({
      success: true
    })

  } catch (err) {
    console.log(err)
  }
}
exports.likeFilms = async (req, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: errors.errors[0].msg
      })
    }
    if (req.body.films?.length > 0) {
      req.body.films.map(async item => {
        await FilmModel.updateOne({_id: item.filmId}, {$set: {isFavorite: true}}, {new: true})
      })
    }
    // const list = await ListModel.findOne({_id: req.userId})
    // if (!list) {
    //   return res.status(400).json({
    //     message: 'Користувача не знайдено'
    //   })
    // }
    // const i = await ListModel.find({_id: req.body._id}).populate('films').exec()
    // console.log(i[0])
    // if (req.body.films?.length > 0) {
    //   await UserModel.updateOne(
    //     {_id: req.userId},
    //     {$push: {favoriteFilms: {$each: req.body.films}}})
    // }


    res.json({
      success: true
    })
  } catch (err) {
    console.log(err)
  }
}
exports.deleteFilm = async (req, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: errors.errors[0].msg
      })
    }
    const list = await UserModel.findOne({_id: req.userId})
    if (!list) {
      return res.status(400).json({
        message: 'Користувача не знайдено'
      })
    }
    if (!list.favoriteFilms?.includes(req.body.filmId)) {
      return res.status(400).json({
        message: 'Користувача не знайдено'
      })
    } else {
      // await UserModel.findOneAndUpdate({_id: req.userId}, {$pull: {favoriteFilms: req.body.filmId}})
      const newListFilmItem = await FilmModel.updateOne({_id: req.body.filmId}, {$set: {isFavorite: false}})
    }
    res.json({
      success: true
    })
    // const film = await ListModel.find({userId: req.userId,_id:{$ne:req.body._id},films:{$in:[req.body.filmId]}})
    // console.log(req.body.filmId)
    // if (film.length===0){
    //   await FilmModel.findByIdAndRemove({_id:req.body.filmId})
    // }
  } catch (err) {
    console.log(err)
  }
}
// module.exports = {
//   login,
//   register,
//   getProfile,
//   getUsers,
//   getFavorites,
//   getActivities,
//   deleteProfile,
//   updateProfile,
//   subscribe,
//   getSubscribers,
//   getSubscriptions,
//   unsubscribe,
//   likeFilm,
//   likeFilms,
//   deleteFilm
// }
