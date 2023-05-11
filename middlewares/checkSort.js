import jwt from "jsonwebtoken";

export default (req, res, next) => {

   if (!req.params.page){
     req.params.page=1
   }
   next()
}
