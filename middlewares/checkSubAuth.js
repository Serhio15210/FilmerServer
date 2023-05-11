const jwt = require("jsonwebtoken");

const checkSubAuth=(req, res, next) => {
  const token = (req.headers.authorization || '').replace('/Bearer\s?/', '')
  // console.log(req.body)
  if (token) {
    // console.log('token',token)
    //   console.log(jwt.verify(token, 'secret123'))
    try {
      const decoded = jwt.verify(token, 'secret123')
      req.userId=decoded._id
      next()
    } catch (err) {
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
module.exports=checkSubAuth
