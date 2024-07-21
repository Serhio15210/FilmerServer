const checkAuth = require("../middlewares/checkAuth");
const FilmController = require("../controllers/FilmController");
const {filmUpdateValidator} = require("../validations/validations");
const checkFilm = require("../middlewares/checkFilm");
const express = require('express')
const router = express.Router()

router.post('/', checkAuth, FilmController.getAll)
router.get('/:sort/:rate/:page', checkAuth, FilmController.getAll)
router.get('/:id/:sort/:rate/:watched/:page', checkAuth, FilmController.getUserAll)
router.post('/stats', checkAuth, FilmController.getRatingStatistics)
router.patch('/update', checkAuth,filmUpdateValidator , FilmController.updateFilm)
router.post('/deleteAloneFilm', checkAuth, FilmController.deleteAloneFilm)
router.post('/getFilm', checkAuth, FilmController.getFilm)
router.post('/getFilmRating', checkAuth, FilmController.getFilmRating)
router.post('/reviews', checkAuth, FilmController.getReviews)

module.exports = router
