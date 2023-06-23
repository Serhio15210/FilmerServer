const checkAuth = require("../middlewares/checkAuth");
const ListController = require("../controllers/ListController");
const {listValidator, idHeaderValidator, idValidator} = require("../validations/validations");
const checkList = require("../middlewares/checkList");
const checkFilm = require("../middlewares/checkFilm");
const express = require('express')
const router = express.Router()

router.post('/', checkAuth, ListController.getAll)
router.post('/create', checkAuth, listValidator, checkList, ListController.createList)
router.get('/', checkAuth, ListController.getAll)
router.get('/:id', checkAuth, idHeaderValidator, ListController.getById)
router.delete('/:id', checkAuth, idHeaderValidator, ListController.deleteById)
router.patch('/:id', checkAuth, idHeaderValidator, ListController.updateById)
router.post('/subscribe', checkAuth, idValidator, ListController.subscribe)
router.post('/unsubscribe', checkAuth, idValidator, ListController.unsubscribe)
router.post('/addFilm', checkAuth, checkFilm, ListController.addFilm)
router.post('/addFilms', checkAuth, checkList, ListController.addFilms)
router.post('/deleteFilm', checkAuth, idValidator, ListController.deleteFilm)

module.exports = router
