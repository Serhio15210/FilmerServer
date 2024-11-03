
const checkAuth = require("../middlewares/checkAuth");
const UserController = require("../controllers/UserController");
const NotificationsController = require("../controllers/NotificationsController");
const {loginValidator, registerValidator, updateValidator, filmValidator} = require("../validations/validations");
const checkSubAuth = require("../middlewares/checkSubAuth");
const checkFilm = require("../middlewares/checkFilm");
const checkList = require("../middlewares/checkList");
const checkDeleteFilm = require("../middlewares/checkDeleteFilm");
const express = require('express');
const {upload} = require("../static/imageUtils");
const router = express.Router();
router.post('/saveFcmToken', checkAuth, UserController.saveFcmToken)
router.post('/saveFavGenres', checkAuth, UserController.saveFavoriteGenre)
router.post('/saveFavActors', checkAuth, UserController.saveFavoriteActors)
router.get('/getNotifications', checkAuth, NotificationsController.getNotifications)
router.patch('/markAsRead/:id', checkAuth, NotificationsController.markAsRead)
router.get('/getUsers/:page/:query?', checkAuth, UserController.getUsers)
router.post('/login', loginValidator, UserController.login)
router.post('/register', registerValidator, UserController.register)
router.get('/getProfile', checkAuth, UserController.getProfile)
router.get('/getFavorites', checkAuth, UserController.getFavorites)
router.get('/getActivities', checkAuth, UserController.getActivities)
router.delete('/delete/:id', checkAuth, UserController.deleteProfile)
router.patch('/update', checkAuth, upload.single('avatar'), UserController.updateProfile)
router.post('/subscribe', checkSubAuth, UserController.subscribe)
router.post('/unsubscribe', checkSubAuth, UserController.unsubscribe)
// router.post('/likeFilm', checkAuth, filmValidator, checkFilm, UserController.likeFilm)
// router.post('/likeFilms', checkAuth, filmValidator, checkList, UserController.likeFilms)
// router.post('/deleteFilm', checkAuth, filmValidator, checkFilm, checkDeleteFilm, UserController.deleteFilm)

router.post('/getProfile', checkAuth, UserController.getProfile)

module.exports = router
