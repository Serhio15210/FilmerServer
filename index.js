const express = require("express");
const Express = require("express");
const mongoose =require("mongoose")
const cors =require("cors")
const firebase = require("firebase-admin");
const checkAuth =require("./middlewares/checkAuth.js")
const UserController =require("./controllers/UserController.js");
const ListController  =require("./controllers/ListController.js");
const NotificationModel  =require("./models/Notification");
const NotificationsController  =require("./controllers/NotificationsController");
const checkFilm  =require("./middlewares/checkFilm.js");
const checkDeleteFilm =require("./middlewares/checkDeleteFilm.js");
const FilmController=require("./controllers/FilmController.js");
const checkList =require("./middlewares/checkList.js");
const checkSubAuth =require("./middlewares/checkSubAuth.js")
const schedule = require('node-schedule');
const authRouter = require('./routes/authRouter');
const listRouter = require('./routes/listRouter');
const filmRouter = require('./routes/filmRouter');
require("dotenv").config();
const {
  filmUpdateValidator,
  filmValidator, idHeaderValidator,
  idValidator,
  listValidator,
  loginValidator,
  registerValidator, updateValidator
} = require("./validations/validations.js")

const {startMovieMonitoring, sendPushNotification}=require("./fcm/services")
const PORT=process.env.PORT||8000
const MONGOOSE_DB=process.env.MONGOOSE_DB

mongoose.connect(MONGOOSE_DB).then(res => {
  console.log("connect to db")
})
const app = express()
app.use(cors());
app.use(express.json())

app.listen(PORT, (err) => {
  if (err) {
    console.log("Error", err)
  } else {
    console.log("connect")
  }
})
startMovieMonitoring()

const rule = new schedule.RecurrenceRule();
rule.hour = 0; // Запускать задачу в полночь
rule.minute = 0;
rule.second = 0;
app.use('/auth', authRouter)
app.use('/lists', listRouter)
app.use('/films', filmRouter)

// sendPushNotification("cKye4NB3R9SY1JHwtIdGKs:APA91bEFmxAL1IRGuyeJq14AZYXoBP2TfbvVnTbSISOjW3oXnK7hbvOnPn2Tn_NqaWi5VEvJYbAXV9cjeS_TIHCth4cGrAy75PaYG6afby4yWHjL6JuBHzK_m5qOZDXrdnMXAdZy8CO6", {
//   title: 'Новый подписчик',
//   body: `Пользователь  подписался на вас!`,
// }).then(res =>{
//   console.log(res)
// })

// app.post('/auth/saveFcmToken', checkAuth, UserController.saveFcmToken)
// app.post('/auth/saveFavGenres', checkAuth, UserController.saveFavoriteGenre)
// app.post('/auth/saveFavActors', checkAuth, UserController.saveFavoriteActors)
// app.get('/auth/getNotifications', checkAuth, NotificationsController.getNotifications)
// app.patch('/auth/markAsRead/:id', checkAuth, NotificationsController.markAsRead)
// app.get('/auth/getUsers/:page/:query?', checkAuth, UserController.getUsers)
// app.post('/auth/login',loginValidator, UserController.login)
// app.post('/auth/register', registerValidator, UserController.register)
// app.get('/auth/getProfile', checkAuth, UserController.getProfile)
// app.get('/auth/getFavorites', checkAuth, UserController.getFavorites)
// app.post('/auth/getActivities', checkAuth, UserController.getActivities)
// app.delete('/auth/delete/:id', checkAuth, UserController.deleteProfile)
// app.delete('/auth/update/:id', checkAuth,updateValidator, UserController.updateProfile)
// app.post('/auth/subscribe', checkSubAuth, UserController.subscribe)
// app.post('/auth/unsubscribe', checkSubAuth, UserController.unsubscribe)
// app.post('/auth/likeFilm', checkAuth,filmValidator,checkFilm, UserController.likeFilm)
// app.post('/auth/likeFilms', checkAuth,filmValidator,checkList, UserController.likeFilms)
// app.post('/auth/deleteFilm', checkAuth,filmValidator,checkFilm,checkDeleteFilm, UserController.deleteFilm)
//
// app.post('/auth/getProfile', checkAuth, UserController.getProfile)

app.get('/subscribers/:id', UserController.getSubscribers)
app.get('/subscriptions/:id', UserController.getSubscriptions)

// app.post('/lists', checkAuth, ListController.getAll)
// app.post('/lists/create', checkAuth,listValidator,checkList, ListController.createList)
// app.get('/lists', checkAuth, ListController.getAll)
// app.get('/lists/:id', checkAuth,idHeaderValidator, ListController.getById)
// app.delete('/lists/:id', checkAuth,idHeaderValidator, ListController.deleteById)
// app.patch('/lists/:id', checkAuth,idHeaderValidator, ListController.updateById)
// app.post('/lists/subscribe', checkAuth,idValidator, ListController.subscribe)
// app.post('/lists/unsubscribe', checkAuth,idValidator, ListController.unsubscribe)
// app.post('/lists/addFilm', checkAuth,idValidator,checkFilm, ListController.addFilm)
// app.post('/lists/addFilms', checkAuth,idValidator,checkList, ListController.addFilms)
// app.post('/lists/deleteFilm', checkAuth,idValidator, ListController.deleteFilm)

// app.post('/films', checkAuth, FilmController.getAll)
// app.get('/films/:sort/:rate/:page', checkAuth, FilmController.getAll)
// app.get('/films/:id/:sort/:rate/:watched/:page', checkAuth, FilmController.getUserAll)
// app.post('/films/stats', checkAuth, FilmController.getRatingStatistics)
// app.patch('/films/update', checkAuth,filmUpdateValidator ,checkFilm, FilmController.updateFilm)
// app.post('/films/deleteAloneFilm', checkAuth, FilmController.deleteAloneFilm)
// app.post('/films/getFilm', checkAuth, FilmController.getFilm)
// app.post('/films/reviews', checkAuth, FilmController.getReviews)
const deleteOldNotificationsJob = schedule.scheduleJob(rule, async () => {
  try {

    const currentDate = new Date();

    const oneDayAgo = new Date(currentDate.getTime() - 5 * 60 * 60 * 1000);

    await NotificationModel.deleteMany({ createdAt: { $lt: oneDayAgo } });

    console.log('Старые уведомления успешно удалены');
  } catch (error) {
    console.error('Ошибка при удалении старых уведомлений:', error);
  }
});
process.on('SIGINT', () => {
  deleteOldNotificationsJob.cancel();
  process.exit();
});

