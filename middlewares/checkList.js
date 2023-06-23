const FilmModel =require("../models/Film.js");



const checkList= async (req, res, next) => {
  let arrayIds=[]
const checkFilm=(data,item)=>{
  const check=[]
  data?.map(film=>{
    console.log(film?.imdb_id,item?.imdb_id)
    if (film?.imdb_id===item?.imdb_id+''){
      // console.log('true')
      !check.includes(film?._id)&&check.push(film?._id)
      !arrayIds.includes(film?._id)&&arrayIds.push(film?._id)
      // return film

    }
  })
  // console.log('check',check,check?.length===0)
  return check?.length===0
}
  try {
    // const errors = validationResult(req)
    let films = await FilmModel.find({userId: req.userId})
    console.log(req.body.films)
    if (req.body.films?.length>0) {
      let array=[]
      for (let i = 0; i < req.body.films.length; i++) {
        // console.log(checkFilm(films,req.body.films[i]),req.body.films[i])
        if (checkFilm(films,req.body.films[i])) {

          array.push({
            imdb_id: req.body.films[i].imdb_id,
            poster: req.body.films[i].poster,
            title: req.body.films[i].title,
            rate: req.body.films[i].rate || 0,
            comment: req.body.films[i].comment || '',
            isSerial:req.body.films[i].isSerial||false,
            isFavorite:req.body.films[i].isFavorite||false,
            userId: req.userId
          })
        }
      }
      // array=req.body.films?.map(item=>{
      //   if (checkFilm(item)) {
      //     return {
      //       imdb_id: item.imdb_id,
      //       poster: item.poster,
      //       title: item.title,
      //       rate: item.rate || 0,
      //       comment: item.comment || '',
      //       userId: req.userId
      //     }
      //   }else return
      // })
      // console.log('ids',arrayIds)
      console.log('array',array)
      FilmModel.create(array)
        .then(docs => {
          // console.log(docs,docs.map(doc => doc._id))
          const newArray=docs.map(doc => doc._id)
          // console.log('new',newArray)
          // arrayIds=arrayIds.concat(newArray);
          req.body.films=arrayIds.concat(newArray)
          next()
        })
        .catch(err => console.error(err));

    }else {
      next()
    }


  } catch (err) {
    return res.status(403).json({
      message: 'Error adding'
    })
  }


}
module.exports=checkList
