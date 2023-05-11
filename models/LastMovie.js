const mongoose =require("mongoose");

const LastMovieModel =new mongoose.Schema({
  imdb_id:{
    type:String,
    required:true
  }
},{
  timestamps:true
})
module.exports=mongoose.model('LastMovie',LastMovieModel)
