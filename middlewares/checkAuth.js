const jwt =require("jsonwebtoken");
const {sendPushNotification} = require("../fcm/services");
const firebase = require("firebase-admin");

 const checkAuth = (req, res, next) => {
  const token = (req.headers.authorization || '').replace('/Bearer\s?/', '')


   // console.log('token',token)
  if (token) {

    //   console.log(jwt.verify(token, 'secret123'))
    try {
      const decoded = jwt.verify(token, 'secret123')
      if (req.body._id){
        // console.log('body')
        req.userId=req.body._id
      }else req.userId=decoded._id
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
module.exports = checkAuth
