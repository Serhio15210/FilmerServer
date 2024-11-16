const {validationResult} = require("express-validator");
const ListModel = require("../models/List.js");
const FilmModel = require("../models/Film.js");
const UserModel = require("../models/User.js");
const {saveRateNotification} = require("./NotificationsController");
const {Types} = require("mongoose");


const getAll = async (req, res) => {
    const sortOption = req.params.sort;
    const rateFilter = parseInt(req.params.rate);
    const userId = req.userId; // предполагаем, что userId берется из запроса
    console.log(req.params, req.userId)
    // Определяем сортировку на основе параметра sortOption
    let sortCriteria;
    switch (sortOption) {
        case 'rateHigh':
            sortCriteria = {'rates.rate': -1}; // по оценке от большей к меньшей
            break;
        case 'rateLow':
            sortCriteria = {'rates.rate': 1}; // по оценке от меньшей к большей
            break;
        case 'asc':
            sortCriteria = {title: 1}; // по полю title по алфавиту
            break;
        case 'desc':
            sortCriteria = {title: -1}; // по полю title в обратном алфавитном порядке
            break;
        default:
            sortCriteria = {}; // если сортировка не указана, не сортируем
    }

    try {
        let query = {userId: req.userId};

        if (rateFilter > 0) {
            query['rates'] = {
                $elemMatch: {
                    rate: rateFilter
                }
            };
        }

        const films = await FilmModel.paginate(query, {
            page: parseInt(req.params.page),
            limit: 50,
            sort: sortCriteria
        });

        res.json({
            success: true,
            films: films.docs,
            totalPages: films.totalPages,
            hasPrevPage: films.hasPrevPage,
            hasNextPage: films.hasNextPage,
        });
    } catch (err) {
        console.log(err);
        res.status(500).json({success: false, message: 'Ошибка сервера'});
    }
}
const getUserAll = async (req, res) => {

    const sort = req.params.sort === 'rateHigh' ? {rate: -1}
        : req.params.sort === 'rateLow' ? {rate: 1}
            : req.params.sort === 'asc' ? {title: 'asc'}
                : req.params.sort === 'desc' ? {title: 'desc'} : ''
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

        const films = await FilmModel.find({
            userId: {$elemMatch: {$eq: req.userId}},
            // "rates.userId": req.userId
        }).lean()
        const empty = films.filter(item => item?.rates?.length === 0).length
        film0 += empty
        films?.map(film => {
            film?.rates?.map(item => {
                switch (item.rate) {
                    case 1:
                        film1 += 1;
                        break
                    case 2:
                        film2 += 1;
                        break
                    case 3:
                        film3 += 1;
                        break
                    case 4:
                        film4 += 1;
                        break
                    case 5:
                        film5 += 1;
                        break
                    default:
                        film0 += 1

                }
            })
        })

        const sum = film0 + film1 + film2 + film3 + film4 + film5
        res.json({
            success: true,
            film0,
            film1,
            film2,
            film3,
            film4,
            film5,
            total: sum

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
        let film = await FilmModel.findOneAndUpdate(
            {
                userId: {$elemMatch: {$eq: req.userId}},
                imdb_id: req.body.imdb_id,
                "rates.userId": req.userId,
                "comments.userId": req.userId,
                "isFavorites.userId": req.userId
            },
            {
                $addToSet: {userId: req.userId}, // Добавляем userId, если его там еще нет
                $set: { // Обновляем значения и добавляем новые значения
                    "rates.$.rate": req.body.rate,
                    "comments.$.comment": req.body.comment,
                    "isFavorites.$.isFavorite": req.body.isFavorite
                },

            },
            {
                new: true, // Возвращаем обновленный документ
                runValidators: true // Запускаем валидацию модели
            }
        );
        console.log('f1', film)

        if (!film) {

            film = await FilmModel.findOneAndUpdate(
                {
                    imdb_id: req.body.imdb_id,
                },
                {
                    $setOnInsert: { // Устанавливаем начальные значения при создании нового документа
                        poster: req.body.poster,
                        title: req.body.title,
                        isSerial: req.body.isSerial || false,
                    },
                    $addToSet: {
                        userId: req.userId,
                        rates: {userId: req.userId, rate: req.body.rate},
                        comments: {userId: req.userId, comment: req.body.comment},
                        isFavorites: {userId: req.userId, isFavorite: req.body.isFavorite}
                    }

                },
                {
                    upsert: true, // Создаем новый документ, если не найден
                    new: true, // Возвращаем обновленный документ
                    runValidators: true // Запускаем валидацию модели
                }
            );
            // console.log('f2', film)
        }
        await saveRateNotification(req.userId, {
            title: film.title,
            comment: req.body.comment,
            rate: req.body.rate,
            imdb_id: film.imdb_id,
            isSerial: film.isSerial,
        })

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
        let film = await FilmModel.findOne({userId: {$elemMatch: {$eq: req.userId}}, imdb_id: req.body.imdb_id}).lean()
        // console.log('get', film)
        if (!film) {
            return res.status(400).json({
                message: 'Фільм не знайдено'
            })
        }

        const userRating = film?.rates?.find(item => item?.userId?.equals(req.userId))
        const userComments = film?.comments?.find(item => item?.userId?.equals(req.userId))
        const userFavorites = film?.isFavorites?.find(item => item?.userId?.equals(req.userId)).isFavorite

        const filmData = {
            ...film,
            rates: userRating?.rate,
            comments: userComments?.comment,
            isFavorites: !!userFavorites
        };

        // console.log(filmData)
        res.json({
            success: true,
            film: filmData
        })

    } catch (err) {
        console.log(err)
    }
}
const getFilmRating = async (req, res) => {
    try {
        const errors = validationResult(req)
        if (!errors.isEmpty()) {
            return res.status(400).json({
                message: errors.errors[0].msg
            })
        }
        let film = await FilmModel.findOne({imdb_id: req.body.imdb_id}).lean()

        if (!film) {
            return res.status(400).json({
                message: 'Фільм не знайдено'
            })
        }
        const array = film?.rates?.filter(item => item?.rate > 0)
        const userRating = array?.reduce((accumulator, currentValue) => accumulator + currentValue.rate, 0)
        const rating = Math.round(userRating / array.length)

        console.log(rating)

        res.json({
            rating
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
        const film = await FilmModel.find({
            imdb_id:req.body.imdb_id,
            userId: {$elemMatch: {$ne: req.userId}},
            $or: [
                {
                    rates: {
                        $elemMatch: {
                            userId: {$ne: req.userId},
                            rate: {$gt: 0}
                        }
                    }
                },
                {
                    comments: {
                        $elemMatch: {
                            userId: {$ne: req.userId},
                            comment: {$gt: 1}
                        }
                    }
                }
            ]
        }).sort({updatedAt: -1}).populate('userId', '_id userName avatar')
        // console.log(user.subscriptions)


        const reviews = []
        film[0]?.userId?.map(item => {

            const rate = film[0].rates.filter(rate => rate?.userId.equals(item._id))[0].rate
            const comment = film[0].comments.filter(comment => comment?.userId.equals(item._id))[0].comment
            reviews.push({user: item, rate, comment})
        })


        if (!film) {
            return res.status(400).json({
                message: 'Фільм не знайдено'
            })
        }

        res.json({
            success: true,
            reviewsAll: reviews,
            reviewsSub: reviews?.filter(item => user.subscriptions.includes(item?.user?._id))
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
module.exports = {
    deleteAloneFilm,
    getReviews,
    getFilm,
    updateFilm,
    getRatingStatistics,
    getUserAll,
    getAll,
    getFilmRating
}
