const {body, header, param} =require("express-validator")

const loginValidator=[
  body('email','incorrect email').isEmail(),
  body('password','password must have min 5 symbols').isLength({min:5}).matches(/[0-9]+/),
]
const registerValidator=[
  body('email','incorrect email').isEmail(),
  body('password','password must have min 5 symbols').isLength({min:5}).matches(/[0-9]+/),
  body('userName','userName must have min 5 symbols').isLength({min:5}),
  body('avatar','incorrect avatar url').optional().isURL()
]
const updateValidator=[
  body('password','password must have min 5 symbols').isLength({min:5}).optional(),
  body('userName','userName must have min 5 symbols').isLength({min:5}),

]
const listValidator=[
  body('name','name must have min 5 symbols').isLength({min:5}).isString()
]
const idValidator=[
  body('_id','invalid id').isString().isLength({min:24,max:24})
]
const idHeaderValidator=[
  param('id','invalid id').isString().isLength({min:24,max:24})
]
const filmUpdateValidator=[
  body('imdb_id','imdb_id is required').isString() ,
  // body('comment',' invalid comment ').isString(),
  // body('rate',' invalid rate ').isNumeric()
]
const filmValidator=[
  // body('imdb_id','invalid film id').isString().isLength({min:6}),

]
module.exports = { loginValidator, registerValidator,updateValidator,listValidator,idValidator,idHeaderValidator,filmUpdateValidator,filmValidator };
