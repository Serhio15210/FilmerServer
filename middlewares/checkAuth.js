const jwt =require("jsonwebtoken");
require('dotenv').config();

 const checkAuth = (req, res, next) => {
  const token = (req.headers.authorization || '').replace('/Bearer\s?/', '')

  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.SECRET_PHRASE)

      if (req.body._id){
        // console.log('body')
        req.userId=req.body._id
      }else req.userId=decoded._id

      next()
    } catch (err) {
        console.log(req)
      return res.status(403).json({
        message: 'No access'
      })
    }

  } else {
    return res.status(403).json({
      message: 'No access'
    })
  }
}
module.exports = checkAuth
